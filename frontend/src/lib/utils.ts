import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function parseDate(dateStr: string | Date | undefined | null): Date {
  if (!dateStr) return new Date();
  if (dateStr instanceof Date) return dateStr;
  
  // If the date string doesn't specify timezone (doesn't end in Z and doesn't contain a + offset),
  // assume it is in UTC (Z) because our database stores UTC timestamps natively.
  const adjustedStr = (dateStr.endsWith('Z') || dateStr.includes('+')) 
    ? dateStr 
    : dateStr.includes('T') 
      ? dateStr + 'Z' 
      : dateStr.replace(' ', 'T') + 'Z';
  return new Date(adjustedStr);
}
