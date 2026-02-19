// ============================================================================
// Marginal Analysis — Per-dollar value calculator
// Used by Smart Adaptive Engine to rank allocation destinations.
// ============================================================================

/**
 * Calculate the marginal after-tax future value of $1 sent to each destination.
 *
 * @param {object} params
 * @param {number} params.yearsLeft - years remaining in simulation
 * @param {number} params.annualReturn - expected return (decimal, e.g. 0.07)
 * @param {number} params.growthRate - non-reg growth rate (decimal)
 * @param {number} params.dividendYield - non-reg dividend yield (decimal)
 * @param {number} params.helocRate - HELOC interest rate (decimal)
 * @param {number} params.mortgageRate - effective annual mortgage rate (decimal)
 * @param {number} params.taxRate - marginal tax rate (decimal)
 * @param {number} params.retirementTaxRate - expected tax rate at withdrawal (decimal)
 * @param {number} params.capGainsInclusionRate - capital gains inclusion rate (decimal, 0.5 for Canada)
 * @param {object} params.room - available room { tfsa, rrsp, nonReg, mortgagePrepayment }
 * @returns {Array<{destination, value, reasoning}>} sorted highest value first
 */
export function rankDestinations({
  yearsLeft,
  annualReturn,
  growthRate,
  dividendYield,
  helocRate,
  mortgageRate,
  taxRate,
  retirementTaxRate,
  capGainsInclusionRate = 0.5,
  room,
}) {
  const destinations = [];

  // ── TFSA ──────────────────────────────────────────────────────
  // $1 → grows tax-free, withdrawn tax-free
  if (room.tfsa > 0) {
    const futureValue = Math.pow(1 + annualReturn, yearsLeft);
    destinations.push({
      destination: 'tfsa',
      value: futureValue,
      reasoning: `$1 → TFSA grows to $${futureValue.toFixed(2)} tax-free over ${yearsLeft} years`,
    });
  }

  // ── RRSP ──────────────────────────────────────────────────────
  // $1 → immediate tax refund of $taxRate, grows tax-deferred, taxed at retirement
  if (room.rrsp > 0) {
    const refundReinvested = taxRate; // refund goes to mortgage → frees HELOC → non-reg
    const rrspGrowth = Math.pow(1 + annualReturn, yearsLeft);
    const afterTaxValue = rrspGrowth * (1 - retirementTaxRate);
    // Total value = RRSP after-tax + refund reinvested benefit
    // The refund gets applied to mortgage, freeing deductible HELOC investment
    const refundFutureValue = refundReinvested * Math.pow(1 + growthRate, yearsLeft) * (1 - capGainsInclusionRate * taxRate);
    const totalValue = afterTaxValue + refundFutureValue;
    destinations.push({
      destination: 'rrsp',
      value: totalValue,
      reasoning: `$1 → RRSP: $${afterTaxValue.toFixed(2)} after-tax + $${refundFutureValue.toFixed(2)} refund reinvested = $${totalValue.toFixed(2)}`,
    });
  }

  // ── Non-Registered (deductible HELOC) ─────────────────────────
  // $1 borrowed from HELOC → interest is deductible, grows, capital gains taxed
  {
    const futureGrowth = Math.pow(1 + growthRate, yearsLeft);
    const capitalGain = futureGrowth - 1;
    const capGainsTax = capitalGain * capGainsInclusionRate * taxRate;
    const afterTaxGrowth = futureGrowth - capGainsTax;

    // Deductible interest benefit: interest paid each year is deductible
    // Annual interest cost = helocRate, tax savings = helocRate × taxRate
    // Net annual cost = helocRate × (1 - taxRate)
    const netAnnualCost = helocRate * (1 - taxRate);
    const totalInterestCost = netAnnualCost * yearsLeft;

    // Dividends received along the way (rough estimate)
    const totalDividends = dividendYield * yearsLeft;
    const dividendTax = totalDividends * taxRate * 0.7; // eligible dividends taxed at ~70% of marginal
    const netDividends = totalDividends - dividendTax;

    const totalValue = afterTaxGrowth - totalInterestCost + netDividends;
    destinations.push({
      destination: 'nonReg',
      value: totalValue,
      reasoning: `$1 → Non-Reg: $${afterTaxGrowth.toFixed(2)} growth - $${totalInterestCost.toFixed(2)} net interest + $${netDividends.toFixed(2)} dividends = $${totalValue.toFixed(2)}`,
    });
  }

  // ── Mortgage Prepayment ───────────────────────────────────────
  // $1 → saves mortgage interest (not deductible), guaranteed return
  if (room.mortgagePrepayment > 0) {
    const interestSaved = mortgageRate * yearsLeft;
    // This is a guaranteed, risk-free "return"
    // But it also frees HELOC room for deductible borrowing
    const helocBenefit = helocRate * taxRate * yearsLeft; // deductible interest on re-borrowed $1
    const totalValue = 1 + interestSaved + helocBenefit;
    destinations.push({
      destination: 'mortgage',
      value: totalValue,
      reasoning: `$1 → Mortgage: saves $${interestSaved.toFixed(2)} interest + $${helocBenefit.toFixed(2)} HELOC deduction benefit = $${totalValue.toFixed(2)}`,
    });
  }

  // ── HELOC Paydown (non-deductible portion) ────────────────────
  // $1 → reduces non-deductible HELOC interest
  // Only valuable if there's non-deductible HELOC balance
  // This is handled implicitly through mortgage prepayment in SM

  // Sort by value descending
  destinations.sort((a, b) => b.value - a.value);

  return destinations;
}

/**
 * Allocate a pool of cash to destinations based on marginal ranking.
 * Greedy fill: highest marginal value first, fill until room exhausted.
 *
 * @param {number} cashAvailable - total cash to allocate
 * @param {Array} rankedDestinations - from rankDestinations()
 * @param {object} room - available room per destination
 * @returns {object} allocation breakdown { tfsa, rrsp, nonReg, mortgage, remaining }
 */
export function greedyAllocate(cashAvailable, rankedDestinations, room) {
  const allocation = {
    tfsa: 0,
    rrsp: 0,
    nonReg: 0,
    mortgage: 0,
  };

  let remaining = cashAvailable;

  for (const { destination } of rankedDestinations) {
    if (remaining <= 0) break;

    const maxRoom = destination === 'tfsa' ? room.tfsa
      : destination === 'rrsp' ? room.rrsp
      : destination === 'mortgage' ? room.mortgagePrepayment
      : Infinity; // nonReg always available

    const amount = Math.min(remaining, maxRoom);
    allocation[destination] = amount;
    remaining -= amount;
  }

  // Any leftover goes to non-reg
  if (remaining > 0) {
    allocation.nonReg += remaining;
    remaining = 0;
  }

  allocation.remaining = remaining;
  return allocation;
}