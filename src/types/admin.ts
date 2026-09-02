export type DeviceType = 'mobile' | 'laptop' | 'tablet' | 'smartwatch' | 'other';

export type JobStatus =
  | 'pending'
  | 'in_progress'
  | 'parts_delayed'
  | 'repaired'
  | 'delivered'
  | 'canceled';

export type UserRole = 'owner' | 'technician' | 'staff';

export interface ShopAddress {
  street?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

export interface ShopItem {
  _id: string;
  name: string;
  ownerName: string;
  phone: string;
  address?: ShopAddress;
  logoUrl?: string;
  subscription: {
    plan: 'free' | 'pro';
    status: 'active' | 'expired' | 'canceled';
    expiresAt?: string;
  };
  settings: {
    currency: string;
    smsNotificationsEnabled: boolean;
    nextJobNumber: number;
  };
  stats?: {
    totalOrders: number;
    totalRevenue: number;
    totalDues: number;
    totalStaff: number;
    totalCustomers: number;
  };
  createdAt: string;
  updatedAt?: string;
}

export interface TechnicianItem {
  _id: string;
  shopId: {
    _id: string;
    name: string;
    phone?: string;
    address?: { city?: string };
  } | any;
  name: string;
  phone: string;
  role: UserRole;
  isActive: boolean;
  activeJobsCount?: number;
  createdAt: string;
}

export interface CustomerItem {
  _id: string;
  shopId: {
    _id: string;
    name: string;
  } | any;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  totalOrdersCount: number;
  createdAt: string;
}

export interface PaymentRecord {
  amount: number;
  mode: 'cash' | 'upi' | 'card' | 'online';
  transactionRef?: string;
  paidAt: string;
}

export interface SmsLogRecord {
  type: string;
  status: string;
  providerRef?: string;
  sentAt: string;
}

export interface OrderItem {
  _id: string;
  jobId: string;
  shopId: {
    _id: string;
    name: string;
    phone?: string;
    address?: ShopAddress;
  } | any;
  customerId: string;
  customerSnapshot: {
    name: string;
    phone: string;
  };
  orderType?: 'repair' | 'accessory';
  deviceType: DeviceType;
  brand: string;
  model: string;
  serialOrImei?: string;
  passcodePattern?: string;
  problemDescription: string; // Customer issue
  photos?: string[];
  // Accessory-specific fields
  productName?: string;
  productPrice?: number;
  status: JobStatus;
  assignedTechnicianId?: {
    _id: string;
    name: string;
    phone?: string;
  } | any;
  cost: {
    estimated: number;
    final: number;
    advancePaid: number;
    due: number;
  };
  payments: PaymentRecord[];
  smsLogs: SmsLogRecord[];
  dates: {
    receivedAt: string;
    promisedDeliveryAt?: string;
    deliveredAt?: string;
  };
  invoice?: {
    invoiceNumber?: string;
    pdfUrl?: string;
    issuedAt?: string;
  };
  createdBy?: string;
  createdAt: string;
}

export interface PlatformOverview {
  kpis: {
    totalShops: number;
    activeShops: number;
    proShops: number;
    totalTechnicians: number;
    totalCustomers: number;
    totalOrders: number;
    totalRevenue: number;
    totalDues: number;
    totalValue: number;
  };
  statusCounts: Record<string, number>;
  recentOrders: OrderItem[];
  topShops: Array<{
    shopId: string;
    name: string;
    ownerName: string;
    city?: string;
    plan: string;
    revenue: number;
    ordersCount: number;
  }>;
}

export interface RevenueAnalytics {
  summary: {
    totalRevenue: number;
    totalDues: number;
    totalGrossValue: number;
    ordersCount: number;
  };
  revenueByShop: Array<{
    shopId: string;
    shopName: string;
    ownerName: string;
    plan: string;
    revenue: number;
    dues: number;
    ordersCount: number;
  }>;
  paymentsByMode: Array<{
    _id: string;
    totalAmount: number;
    count: number;
  }>;
  statusFinancials: Array<{
    _id: string;
    revenue: number;
    dues: number;
    count: number;
  }>;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'superadmin';
}

export interface NotificationItem {
  _id: string;
  title: string;
  message: string;
  type: 'broadcast' | 'direct';
  targetShopId?: {
    _id: string;
    name: string;
    phone?: string;
    address?: { city?: string };
  } | any;
  priority: 'info' | 'warning' | 'promo';
  createdAt: string;
}

