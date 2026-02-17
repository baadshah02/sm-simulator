import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

export function formatCurrency(value, compact = false) {
    if (value === undefined || value === null) return '-';
    const rounded = Math.round(value);
    if (compact && Math.abs(rounded) >= 1000000) {
        return `$${(rounded / 1000000).toFixed(1)}M`;
    }
    if (compact && Math.abs(rounded) >= 100000) {
        return `$${(rounded / 1000).toFixed(0)}K`;
    }
    return `$${rounded.toLocaleString()}`;
}

export function formatPercent(value, decimals = 1) {
    if (value === undefined || value === null) return '-';
    return `${value.toFixed(decimals)}%`;
}
