export type OfferStatus = 'DRAFT' | 'PENDING_REVIEW' | 'APPROVED' | 'LIVE' | 'PAUSED' | 'EXPIRED' | 'RETIRED';
export type OfferType = 'CASHBACK' | 'DISCOUNT_CODE' | 'VOUCHER' | 'EXPERIENCE' | 'PRIZE_DRAW';
export type Brand = 'BRAND_A' | 'BRAND_B' | 'BRAND_C' | 'BRAND_D';
export type RedemptionType = 'CARD_LINKED' | 'VOUCHER_CODE' | 'BARCODE' | 'WALLET_PASS';
export type PartnerStatus = 'PENDING' | 'APPROVED' | 'SUSPENDED' | 'DEACTIVATED';

export interface Offer {
  id: string;
  merchantId: string;
  title: string;
  description: string | null;
  offerType: OfferType;
  category: string | null;
  cashbackRate: number | null;
  cashbackCap: number | null;
  minSpend: number | null;
  currency: string;
  terms: string | null;
  status: OfferStatus;
  brand: Brand;
  imageUrl: string | null;
  redemptionType: RedemptionType;
  maxActivations: number | null;
  currentActivations: number;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  validTransitions: OfferStatus[];
}

export interface Partner {
  id: string;
  businessName: string;
  tradingName: string | null;
  registrationNumber: string | null;
  contactEmail: string;
  contactName: string | null;
  phone: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  postcode: string | null;
  status: PartnerStatus;
  category: string | null;
  logoUrl: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  validTransitions: PartnerStatus[];
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface CreateOfferRequest {
  merchantId: string;
  title: string;
  description?: string;
  offerType?: OfferType;
  category?: string;
  cashbackRate?: number;
  cashbackCap?: number;
  minSpend?: number;
  terms?: string;
  brand?: Brand;
  redemptionType?: RedemptionType;
  maxActivations?: number;
  startDate?: string;
  endDate?: string;
  createdBy?: string;
}

export interface StatusChangeRequest {
  status: string;
  reason?: string;
  changedBy?: string;
}
