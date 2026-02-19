// ============================================================================
// Constraints Tracker
// Tracks TFSA room, RRSP room, HELOC available, prepayment limits
// All engines use this to ensure no constraint is ever violated.
// Enforces: CRA TFSA limits, CRA RRSP limits, bank prepayment limits,
//           HELOC readvanceable cap, non-deductible HELOC paydown cap.
// ============================================================================

// CRA RRSP annual deduction limit (2024). Configurable for future years.
const CRA_RRSP_ANNUAL_MAX = 31560;

/**
 * Create a constraints tracker from form data.
 * Call .consume() each year to deduct used room.
 * Call .available() to check what's left.
 */
export function createConstraints(formData) {
  const {
    tfsaRoomYear1 = 42000,
    annualTfsaIncrease = 7000,
    rrspRoomTotal = 150000,
    baseSalary = 164000,
    employerRrspMatch = 3, // percent of base salary
    initialMortgage = 0,
    prepaymentLimit = 100, // percent of original mortgage (lump sum cap)
    initialHelocAvailable = 0,
  } = formData;

  let tfsaRoomRemaining = tfsaRoomYear1;
  let rrspRoomRemaining = rrspRoomTotal;
  let cumulativeTfsaContrib = 0;
  let cumulativeRrspContrib = 0;
  let currentYear = 0;

  const tracker = {
    /**
     * Get available room for each destination this year
     */
    available(state) {
      const helocRoom = Math.max(0, state.helocAvailable || 0);
      // Prepayment limit = lump sum cap (SM boost only; standard payment always allowed)
      const prepaymentMax = (prepaymentLimit / 100) * initialMortgage;
      const mortgagePrepaymentRoom = Math.min(prepaymentMax, state.currentMortgage || 0);

      // RRSP: min of remaining room and CRA annual max
      const rrspAnnualMax = Math.min(Math.max(0, rrspRoomRemaining), CRA_RRSP_ANNUAL_MAX);

      return {
        tfsa: Math.max(0, tfsaRoomRemaining),
        rrsp: Math.max(0, rrspAnnualMax),
        rrspTotalRemaining: Math.max(0, rrspRoomRemaining),
        heloc: helocRoom,
        nonReg: Infinity, // always available
        mortgagePrepayment: Math.max(0, mortgagePrepaymentRoom),
        // For helocPaydown: can't pay more than the non-deductible portion
        helocPaydownMax: Math.max(0, state.cumulativeNonDeductibleHeloc || 0),
      };
    },

    /**
     * Consume room after allocation decisions are made.
     * Call once per year after determining allocations.
     */
    consume({ tfsaContrib = 0, rrspContrib = 0 }) {
      tfsaRoomRemaining -= tfsaContrib;
      if (tfsaRoomRemaining < 0) tfsaRoomRemaining = 0; // prevent rounding errors
      rrspRoomRemaining -= rrspContrib;
      if (rrspRoomRemaining < 0) rrspRoomRemaining = 0;
      cumulativeTfsaContrib += tfsaContrib;
      cumulativeRrspContrib += rrspContrib;
    },

    /**
     * Advance to next year — adds new room from CRA rules.
     * Call at the START of each year before allocation.
     */
    advanceYear(year) {
      currentYear = year;
      if (year > 1) {
        // TFSA: new room each year (CRA sets this annually, typically $7K)
        tfsaRoomRemaining += annualTfsaIncrease;

        // RRSP: 18% of prior year earned income minus employer contributions
        const employerContrib = (employerRrspMatch / 100) * baseSalary;
        const newRrspRoom = Math.max(0, 0.18 * baseSalary - employerContrib);
        rrspRoomRemaining += newRrspRoom;
      }
    },

    /**
     * Get current room state (for debugging / display)
     */
    getState() {
      return {
        year: currentYear,
        tfsaRoomRemaining,
        rrspRoomRemaining,
        cumulativeTfsaContrib,
        cumulativeRrspContrib,
      };
    },

    /**
     * Validate an allocation against constraints.
     * Returns clamped allocation that respects ALL limits.
     */
    clamp(allocation, state) {
      const avail = this.available(state);

      // Clamp TFSA
      const clampedTfsaFromHeloc = Math.min(allocation.tfsaFromHeloc || 0, avail.tfsa, avail.heloc);
      const remainingTfsaRoom = Math.max(0, avail.tfsa - clampedTfsaFromHeloc);
      const clampedTfsaFromSavings = Math.min(allocation.tfsaFromSavings || 0, remainingTfsaRoom);

      // Clamp RRSP (subject to CRA annual max AND total room)
      const clampedRrspContrib = Math.min(allocation.rrspContrib || 0, avail.rrsp);
      const clampedRrspFromHeloc = Math.min(allocation.rrspFromHeloc || 0, clampedRrspContrib, avail.heloc);
      const clampedRrspFromSavings = Math.min(allocation.rrspFromSavings || 0, clampedRrspContrib);

      // Clamp helocPaydown to actual non-deductible HELOC balance
      const clampedHelocPaydown = Math.min(allocation.helocPaydown || 0, avail.helocPaydownMax);

      return {
        ...allocation,
        tfsaFromHeloc: clampedTfsaFromHeloc,
        tfsaFromSavings: clampedTfsaFromSavings,
        rrspContrib: clampedRrspContrib,
        rrspFromHeloc: clampedRrspFromHeloc,
        rrspFromSavings: clampedRrspFromSavings,
        helocPaydown: clampedHelocPaydown,
      };
    },

    /**
     * Deep clone the constraints tracker for beam search branching.
     * Returns an independent copy that can evolve separately.
     */
    clone() {
      const cloned = createConstraints(formData);
      // Override internal state to match current
      cloned._setState({
        tfsaRoomRemaining,
        rrspRoomRemaining,
        cumulativeTfsaContrib,
        cumulativeRrspContrib,
        currentYear,
      });
      return cloned;
    },

    /**
     * Internal: set state from a clone operation
     */
    _setState(s) {
      tfsaRoomRemaining = s.tfsaRoomRemaining;
      rrspRoomRemaining = s.rrspRoomRemaining;
      cumulativeTfsaContrib = s.cumulativeTfsaContrib;
      cumulativeRrspContrib = s.cumulativeRrspContrib;
      currentYear = s.currentYear;
    },
  };

  return tracker;
}