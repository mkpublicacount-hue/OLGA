
export interface DailyRecord {
  id: string;
  year: number;
  month: number;
  day: number;
  operatorId: string;
  operatorName: string;
  serviceAmount: number;
  posAmount: number;
  cardToCardAmount: number;
  cardToCardDest?: string;
  cardToCardDesc?: string;
  
  // Total Cash (Direct + Converted) - Kept for backward compatibility/easy summing
  cashTotal: number;
  
  // Specific Cash Details
  cashDirect: number; // Pure Toman cash
  
  // Foreign Currency Details
  currencyType?: string;
  currencyCount?: number;
  currencyRate?: number;
  currencyConverted?: number; // count * rate

  // Discrepancy Management
  discrepancy?: number; // The difference amount (+ or -)
  trackingCode?: string; // Unique human-readable code (e.g., TRK-8921) for this discrepancy
  
  // Using Previous Discrepancy (Surplus)
  usedDiscrepancyAmount?: number; // How much was used from a previous record
  usedDiscrepancyFromCode?: string; // The tracking code of the record used

  description?: string;
  createdAt: number;
}

export interface Operator {
  id: string;
  name: string;
}

export interface DiscrepancyItem extends DailyRecord {
  remainingAmount: number;
  originalAmount: number;
  type: 'surplus' | 'debt';
}

export type PaymentType = 'pos' | 'cardToCard' | 'cash';
