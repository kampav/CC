export type OfferStatus = 'DRAFT' | 'PENDING_REVIEW' | 'APPROVED' | 'LIVE' | 'PAUSED' | 'EXPIRED' | 'RETIRED';
export type Brand = 'BRAND_A' | 'BRAND_B' | 'BRAND_C' | 'BRAND_D';

export interface Offer {
  id: string;
  merchantId: string;
  title: string;
  description: string | null;
  offerType: string;
  category: string | null;
  cashbackRate: number | null;
  cashbackCap: number | null;
  minSpend: number | null;
  currency: string;
  terms: string | null;
  status: OfferStatus;
  brand: Brand;
  imageUrl: string | null;
  redemptionType: string;
  maxActivations: number | null;
  currentActivations: number;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
}

export interface Activation {
  id: string;
  customerId: string;
  offerId: string;
  offerTitle: string | null;
  merchantId: string | null;
  cashbackRate: number | null;
  cashbackCap: number | null;
  minSpend: number | null;
  status: string;
  activatedAt: string;
  expiresAt: string | null;
}

export interface CashbackCredit {
  id: string;
  offerId: string;
  merchantId: string | null;
  transactionAmount: number;
  cashbackRate: number;
  cashbackAmount: number;
  status: string;
  creditedAt: string;
}

export interface CashbackSummary {
  customerId: string;
  totalCashback: number;
  totalTransactions: number;
  credits: CashbackCredit[];
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
