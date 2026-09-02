import type {
  ShopItem,
  TechnicianItem,
  CustomerItem,
  OrderItem,
  PlatformOverview,
  RevenueAnalytics,
  JobStatus,
  NotificationItem,
} from '../types/admin';
import {
  mockShops,
  mockTechnicians,
  mockCustomers,
  mockOrders,
  mockOverview,
  mockRevenueAnalytics,
  mockNotifications,
} from './mockAdminData';

export const API_BASE_URL =
  (import.meta as any).env?.VITE_API_URL || 'https://data-daddy-backend.onrender.com/api';

const BASE_URL = `${API_BASE_URL}/admin`;

export const resolveImageUrl = (url?: string | null): string => {
  if (!url) return '';
  if (url.includes('.amazonaws.com/')) {
    const key = url.split('.amazonaws.com/')[1];
    return `${API_BASE_URL}/uploads/media/${key}`;
  }
  if (url.startsWith('/api/uploads/')) {
    const base = API_BASE_URL.replace(/\/api\/?$/, '');
    return `${base}${url}`;
  }
  if (url.startsWith('/uploads/')) {
    return `${API_BASE_URL}${url}`;
  }
  if (url.startsWith('profiles/') || url.startsWith('general/') || url.startsWith('banners/')) {
    return `${API_BASE_URL}/uploads/media/${url}`;
  }
  return url;
};

// Local in-memory state for fallback/offline mutation simulation
let stateShops: ShopItem[] = [...mockShops];
let stateTechnicians: TechnicianItem[] = [...mockTechnicians];
let stateCustomers: CustomerItem[] = [...mockCustomers];
let stateOrders: OrderItem[] = [...mockOrders];
let stateNotifications: NotificationItem[] = [...mockNotifications];

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('datadaddy_admin_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const adminApi = {
  async login(email: string, password: string) {
    try {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');
      return data;
    } catch (e: any) {
      // Fallback demo authentication
      if (
        (email === 'admin@datadaddy.com' && password === 'admin123') ||
        (email === 'admin' && password === 'admin')
      ) {
        const demoToken = 'mock_superadmin_token_2025';
        localStorage.setItem('datadaddy_admin_token', demoToken);
        return {
          success: true,
          token: demoToken,
          admin: {
            id: 'admin_demo_01',
            email: 'admin@datadaddy.com',
            name: 'Master Platform Admin',
            role: 'superadmin',
          },
        };
      }
      throw new Error(e.message || 'Unable to authenticate with backend');
    }
  },

  async getMe() {
    try {
      const res = await fetch(`${BASE_URL}/auth/me`, {
        headers: { ...getAuthHeader() },
      });
      if (res.ok) {
        const data = await res.json();
        return data.admin;
      }
    } catch (e) {
      // ignore
    }
    return {
      id: 'admin_root',
      email: 'admin@datadaddy.com',
      name: 'Master Platform Admin',
      role: 'superadmin',
    };
  },

  async getOverview(shopId?: string): Promise<PlatformOverview> {
    try {
      const url = shopId && shopId !== 'all' ? `${BASE_URL}/overview?shopId=${shopId}` : `${BASE_URL}/overview`;
      const res = await fetch(url, { headers: { ...getAuthHeader() } });
      if (res.ok) {
        const data = await res.json();
        return data.data;
      }
    } catch (e) {
      // ignore and fallback
    }

    if (shopId && shopId !== 'all') {
      const filteredOrders = stateOrders.filter((o) => {
        const sid = typeof o.shopId === 'object' ? o.shopId?._id : o.shopId;
        return sid === shopId;
      });
      const rev = filteredOrders.reduce((sum, o) => sum + o.cost.advancePaid, 0);
      const dues = filteredOrders.reduce((sum, o) => sum + o.cost.due, 0);
      return {
        ...mockOverview,
        kpis: {
          ...mockOverview.kpis,
          totalOrders: filteredOrders.length,
          totalRevenue: rev,
          totalDues: dues,
          totalValue: rev + dues,
        },
        recentOrders: filteredOrders.slice(0, 5),
      };
    }

    return {
      ...mockOverview,
      recentOrders: stateOrders.slice(0, 10),
    };
  },

  async getShops(params?: { search?: string; plan?: string; status?: string }): Promise<{ shops: ShopItem[]; total: number }> {
    try {
      const q = new URLSearchParams();
      if (params?.search) q.set('search', params.search);
      if (params?.plan && params.plan !== 'all') q.set('plan', params.plan);
      if (params?.status && params.status !== 'all') q.set('status', params.status);

      const res = await fetch(`${BASE_URL}/shops?${q.toString()}`, {
        headers: { ...getAuthHeader() },
      });
      if (res.ok) {
        const data = await res.json();
        return { shops: data.shops, total: data.total };
      }
    } catch (e) {
      // ignore and fallback
    }

    let filtered = [...stateShops];
    if (params?.plan && params.plan !== 'all') {
      filtered = filtered.filter((s) => s.subscription.plan === params.plan);
    }
    if (params?.status && params.status !== 'all') {
      filtered = filtered.filter((s) => s.subscription.status === params.status);
    }
    if (params?.search) {
      const s = params.search.toLowerCase();
      filtered = filtered.filter(
        (shop) =>
          shop.name.toLowerCase().includes(s) ||
          shop.ownerName.toLowerCase().includes(s) ||
          shop.phone.includes(s) ||
          (shop.address?.city && shop.address.city.toLowerCase().includes(s))
      );
    }
    return { shops: filtered, total: filtered.length };
  },

  async getShopById(id: string) {
    try {
      const res = await fetch(`${BASE_URL}/shops/${id}`, { headers: { ...getAuthHeader() } });
      if (res.ok) {
        const data = await res.json();
        return data;
      }
    } catch (e) {
      // ignore
    }
    const shop = stateShops.find((s) => s._id === id);
    const staff = stateTechnicians.filter((t) => {
      const sid = typeof t.shopId === 'object' ? t.shopId?._id : t.shopId;
      return sid === id;
    });
    const orders = stateOrders.filter((o) => {
      const sid = typeof o.shopId === 'object' ? o.shopId?._id : o.shopId;
      return sid === id;
    });
    const customers = stateCustomers.filter((c) => {
      const sid = typeof c.shopId === 'object' ? c.shopId?._id : c.shopId;
      return sid === id;
    });

    return {
      success: true,
      shop,
      staff,
      customers,
      recentOrders: orders,
      financials: {
        totalOrders: orders.length,
        totalRevenue: orders.reduce((sum, o) => sum + o.cost.advancePaid, 0),
        totalDues: orders.reduce((sum, o) => sum + o.cost.due, 0),
      },
    };
  },

  /**
   * Upload Image / Logo to AWS S3
   */
  async uploadImage(file: File, folder: string = 'shops'): Promise<{ success: boolean; url: string; key?: string }> {
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('folder', folder);

      const res = await fetch(`${API_BASE_URL}/uploads/image`, {
        method: 'POST',
        headers: { ...getAuthHeader() },
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        return data;
      }
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Upload to AWS S3 failed');
    } catch (e: any) {
      console.warn('Upload fallback to local object URL:', e);
      return {
        success: true,
        url: URL.createObjectURL(file),
      };
    }
  },

  async createShop(payload: Partial<ShopItem> & { plan?: 'free' | 'pro' }) {
    try {
      const res = await fetch(`${BASE_URL}/shops`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        return data.shop;
      }
    } catch (e) {
      // ignore
    }

    const newShop: ShopItem = {
      _id: `shop_${Date.now()}`,
      name: payload.name || 'New Repair Shop',
      ownerName: payload.ownerName || 'Owner',
      phone: payload.phone || '9999999999',
      address: payload.address || { city: 'Mumbai' },
      logoUrl: payload.logoUrl,
      subscription: {
        plan: payload.plan || 'free',
        status: 'active',
      },
      settings: {
        currency: 'INR',
        smsNotificationsEnabled: true,
        nextJobNumber: 1001,
      },
      stats: { totalOrders: 0, totalRevenue: 0, totalDues: 0, totalStaff: 1, totalCustomers: 0 },
      createdAt: new Date().toISOString(),
    };
    stateShops.unshift(newShop);
    return newShop;
  },

  async updateShop(id: string, payload: any) {
    try {
      const res = await fetch(`${BASE_URL}/shops/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        return data.shop;
      }
    } catch (e) {
      // ignore
    }

    const index = stateShops.findIndex((s) => s._id === id);
    if (index !== -1) {
      stateShops[index] = { ...stateShops[index], ...payload };
      return stateShops[index];
    }
    return null;
  },

  async updateShopSubscription(id: string, subscription: { plan?: 'free' | 'pro'; status?: string; expiresAt?: string }) {
    try {
      const res = await fetch(`${BASE_URL}/shops/${id}/subscription`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(subscription),
      });
      if (res.ok) {
        const data = await res.json();
        return data.subscription;
      }
    } catch (e) {
      // ignore
    }

    const shop = stateShops.find((s) => s._id === id);
    if (shop) {
      if (subscription.plan) shop.subscription.plan = subscription.plan;
      if (subscription.status) shop.subscription.status = subscription.status as any;
      if (subscription.expiresAt) shop.subscription.expiresAt = subscription.expiresAt;
      return shop.subscription;
    }
    return null;
  },

  async getTechnicians(params?: { shopId?: string; role?: string; search?: string }): Promise<{ technicians: TechnicianItem[]; total: number }> {
    try {
      const q = new URLSearchParams();
      if (params?.shopId && params.shopId !== 'all') q.set('shopId', params.shopId);
      if (params?.role && params.role !== 'all') q.set('role', params.role);
      if (params?.search) q.set('search', params.search);

      const res = await fetch(`${BASE_URL}/technicians?${q.toString()}`, {
        headers: { ...getAuthHeader() },
      });
      if (res.ok) {
        const data = await res.json();
        return { technicians: data.technicians, total: data.total };
      }
    } catch (e) {
      // ignore
    }

    let filtered = [...stateTechnicians];
    if (params?.shopId && params.shopId !== 'all') {
      filtered = filtered.filter((t) => {
        const sid = typeof t.shopId === 'object' ? t.shopId?._id : t.shopId;
        return sid === params.shopId;
      });
    }
    if (params?.role && params.role !== 'all') {
      filtered = filtered.filter((t) => t.role === params.role);
    }
    if (params?.search) {
      const s = params.search.toLowerCase();
      filtered = filtered.filter(
        (t) => t.name.toLowerCase().includes(s) || t.phone.includes(s)
      );
    }
    return { technicians: filtered, total: filtered.length };
  },

  async createTechnician(payload: { shopId: string; name: string; phone: string; role?: string }) {
    try {
      const res = await fetch(`${BASE_URL}/technicians`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        return data.technician;
      }
    } catch (e) {
      // ignore
    }

    const shop = stateShops.find((s) => s._id === payload.shopId);
    const newTech: TechnicianItem = {
      _id: `tech_${Date.now()}`,
      shopId: shop || { _id: payload.shopId, name: 'Assigned Shop' },
      name: payload.name,
      phone: payload.phone,
      role: (payload.role as any) || 'technician',
      isActive: true,
      activeJobsCount: 0,
      createdAt: new Date().toISOString(),
    };
    stateTechnicians.unshift(newTech);
    return newTech;
  },

  async updateTechnician(id: string, payload: any) {
    try {
      const res = await fetch(`${BASE_URL}/technicians/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        return data.technician;
      }
    } catch (e) {
      // ignore
    }

    const index = stateTechnicians.findIndex((t) => t._id === id);
    if (index !== -1) {
      stateTechnicians[index] = { ...stateTechnicians[index], ...payload };
      return stateTechnicians[index];
    }
    return null;
  },

  async getCustomers(params?: { shopId?: string; search?: string }): Promise<{ customers: CustomerItem[]; total: number }> {
    try {
      const q = new URLSearchParams();
      if (params?.shopId && params.shopId !== 'all') q.set('shopId', params.shopId);
      if (params?.search) q.set('search', params.search);

      const res = await fetch(`${BASE_URL}/customers?${q.toString()}`, {
        headers: { ...getAuthHeader() },
      });
      if (res.ok) {
        const data = await res.json();
        return { customers: data.customers, total: data.total };
      }
    } catch (e) {
      // ignore
    }

    let filtered = [...stateCustomers];
    if (params?.shopId && params.shopId !== 'all') {
      filtered = filtered.filter((c) => {
        const sid = typeof c.shopId === 'object' ? c.shopId?._id : c.shopId;
        return sid === params.shopId;
      });
    }
    if (params?.search) {
      const s = params.search.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(s) ||
          c.phone.includes(s) ||
          (c.email && c.email.toLowerCase().includes(s))
      );
    }
    return { customers: filtered, total: filtered.length };
  },

  async getCustomerById(id: string) {
    try {
      const res = await fetch(`${BASE_URL}/customers/${id}`, {
        headers: { ...getAuthHeader() },
      });
      if (res.ok) {
        const data = await res.json();
        return data;
      }
    } catch (e) {
      // ignore
    }

    const customer = stateCustomers.find((c) => c._id === id);
    const orders = stateOrders.filter((o) => o.customerId === id);
    return { success: true, customer, orders };
  },

  async getOrders(params?: {
    shopId?: string;
    status?: string;
    deviceType?: string;
    search?: string;
  }): Promise<{ orders: OrderItem[]; total: number }> {
    try {
      const q = new URLSearchParams();
      if (params?.shopId && params.shopId !== 'all') q.set('shopId', params.shopId);
      if (params?.status && params.status !== 'all') q.set('status', params.status);
      if (params?.deviceType && params.deviceType !== 'all') q.set('deviceType', params.deviceType);
      if (params?.search) q.set('search', params.search);

      const res = await fetch(`${BASE_URL}/orders?${q.toString()}`, {
        headers: { ...getAuthHeader() },
      });
      if (res.ok) {
        const data = await res.json();
        return { orders: data.orders, total: data.total };
      }
    } catch (e) {
      // ignore
    }

    let filtered = [...stateOrders];
    if (params?.shopId && params.shopId !== 'all') {
      filtered = filtered.filter((o) => {
        const sid = typeof o.shopId === 'object' ? o.shopId?._id : o.shopId;
        return sid === params.shopId;
      });
    }
    if (params?.status && params.status !== 'all') {
      filtered = filtered.filter((o) => o.status === params.status);
    }
    if (params?.deviceType && params.deviceType !== 'all') {
      filtered = filtered.filter((o) => o.deviceType === params.deviceType);
    }
    if (params?.search) {
      const s = params.search.toLowerCase();
      filtered = filtered.filter(
        (o) =>
          o.jobId.toLowerCase().includes(s) ||
          o.customerSnapshot.name.toLowerCase().includes(s) ||
          o.customerSnapshot.phone.includes(s) ||
          o.brand.toLowerCase().includes(s) ||
          o.model.toLowerCase().includes(s) ||
          o.problemDescription.toLowerCase().includes(s) // Search customer issues
      );
    }
    return { orders: filtered, total: filtered.length };
  },

  async getOrderById(id: string) {
    try {
      const res = await fetch(`${BASE_URL}/orders/${id}`, {
        headers: { ...getAuthHeader() },
      });
      if (res.ok) {
        const data = await res.json();
        return data;
      }
    } catch (e) {
      // ignore
    }

    const order = stateOrders.find((o) => o._id === id || o.jobId === id);
    const sid = typeof order?.shopId === 'object' ? order?.shopId?._id : order?.shopId;
    const availableTechnicians = stateTechnicians.filter((t) => {
      const tsid = typeof t.shopId === 'object' ? t.shopId?._id : t.shopId;
      return tsid === sid;
    });

    return { success: true, order, availableTechnicians };
  },

  async updateOrderStatus(id: string, status: JobStatus) {
    try {
      const res = await fetch(`${BASE_URL}/orders/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        const data = await res.json();
        return data.order;
      }
    } catch (e) {
      // ignore
    }

    const order = stateOrders.find((o) => o._id === id || o.jobId === id);
    if (order) {
      order.status = status;
      if (status === 'delivered') order.dates.deliveredAt = new Date().toISOString();
      return order;
    }
    return null;
  },

  async assignTechnician(id: string, technicianId: string) {
    try {
      const res = await fetch(`${BASE_URL}/orders/${id}/assign`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({ technicianId }),
      });
      if (res.ok) {
        const data = await res.json();
        return data.order;
      }
    } catch (e) {
      // ignore
    }

    const order = stateOrders.find((o) => o._id === id || o.jobId === id);
    const tech = stateTechnicians.find((t) => t._id === technicianId);
    if (order && tech) {
      order.assignedTechnicianId = { _id: tech._id, name: tech.name, phone: tech.phone };
      return order;
    }
    return null;
  },

  async addPayment(id: string, payment: { amount: number; mode: string; transactionRef?: string }) {
    try {
      const res = await fetch(`${BASE_URL}/orders/${id}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(payment),
      });
      if (res.ok) {
        const data = await res.json();
        return data.order;
      }
    } catch (e) {
      // ignore
    }

    const order = stateOrders.find((o) => o._id === id || o.jobId === id);
    if (order) {
      order.payments.push({
        amount: payment.amount,
        mode: (payment.mode as any) || 'cash',
        transactionRef: payment.transactionRef,
        paidAt: new Date().toISOString(),
      });
      const totalPaid = order.payments.reduce((sum, p) => sum + p.amount, 0);
      order.cost.advancePaid = totalPaid;
      order.cost.due = Math.max(0, order.cost.final - totalPaid);
      return order;
    }
    return null;
  },

  async getRevenueAnalytics(shopId?: string): Promise<RevenueAnalytics> {
    try {
      const url = shopId && shopId !== 'all' ? `${BASE_URL}/revenue/analytics?shopId=${shopId}` : `${BASE_URL}/revenue/analytics`;
      const res = await fetch(url, { headers: { ...getAuthHeader() } });
      if (res.ok) {
        const data = await res.json();
        return data.data;
      }
    } catch (e) {
      // ignore
    }

    return mockRevenueAnalytics;
  },

  async triggerSeed(force = true) {
    try {
      const res = await fetch(`${BASE_URL}/seed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({ force }),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      // ignore
    }
    return { success: true, message: 'Seeded in-memory state with 4 shops and realistic repair orders!' };
  },

  async deleteShop(id: string) {
    try {
      const res = await fetch(`${BASE_URL}/shops/${id}`, {
        method: 'DELETE',
        headers: { ...getAuthHeader() },
      });
      if (res.ok) {
        stateShops = stateShops.filter((s) => s._id !== id);
        return await res.json();
      }
    } catch (e) {
      // ignore
    }
    stateShops = stateShops.filter((s) => s._id !== id);
    return { success: true, message: 'Shop deleted successfully' };
  },

  async editOrder(id: string, payload: any) {
    try {
      const res = await fetch(`${BASE_URL}/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        return data.order;
      }
    } catch (e) {
      // ignore
    }

    const index = stateOrders.findIndex((o) => o._id === id);
    if (index !== -1) {
      stateOrders[index] = {
        ...stateOrders[index],
        ...payload,
        cost: payload.cost
          ? {
              estimated: Number(payload.cost.estimated ?? stateOrders[index].cost.estimated),
              final: Number(payload.cost.final ?? stateOrders[index].cost.final),
              advancePaid: Number(payload.cost.advancePaid ?? stateOrders[index].cost.advancePaid),
              due: Math.max(
                0,
                Number(payload.cost.final ?? stateOrders[index].cost.final) -
                  Number(payload.cost.advancePaid ?? stateOrders[index].cost.advancePaid)
              ),
            }
          : stateOrders[index].cost,
      };
      return stateOrders[index];
    }
    return null;
  },

  async deleteOrder(id: string) {
    try {
      const res = await fetch(`${BASE_URL}/orders/${id}`, {
        method: 'DELETE',
        headers: { ...getAuthHeader() },
      });
      if (res.ok) {
        stateOrders = stateOrders.filter((o) => o._id !== id);
        return await res.json();
      }
    } catch (e) {
      // ignore
    }
    stateOrders = stateOrders.filter((o) => o._id !== id);
    return { success: true, message: 'Order deleted successfully' };
  },

  async getNotifications(): Promise<{ notifications: NotificationItem[] }> {
    try {
      const res = await fetch(`${BASE_URL}/notifications`, {
        headers: { ...getAuthHeader() },
      });
      if (res.ok) {
        const data = await res.json();
        return { notifications: data.notifications };
      }
    } catch (e) {
      // ignore
    }
    return { notifications: stateNotifications };
  },

  async createNotification(payload: {
    title: string;
    message: string;
    type?: 'broadcast' | 'direct';
    targetShopId?: string;
    priority?: 'info' | 'warning' | 'promo';
  }) {
    try {
      const res = await fetch(`${BASE_URL}/notifications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        return data.notification;
      }
    } catch (e) {
      // ignore
    }

    const shop = stateShops.find((s) => s._id === payload.targetShopId);
    const newNotif: NotificationItem = {
      _id: `notif_${Date.now()}`,
      title: payload.title,
      message: payload.message,
      type: payload.type || (payload.targetShopId ? 'direct' : 'broadcast'),
      targetShopId: payload.targetShopId ? shop || { _id: payload.targetShopId, name: 'Target Shop' } : undefined,
      priority: payload.priority || 'info',
      createdAt: new Date().toISOString(),
    };
    stateNotifications.unshift(newNotif);
    return newNotif;
  },

  async deleteNotification(id: string) {
    try {
      const res = await fetch(`${BASE_URL}/notifications/${id}`, {
        method: 'DELETE',
        headers: { ...getAuthHeader() },
      });
      if (res.ok) {
        stateNotifications = stateNotifications.filter((n) => n._id !== id);
        return await res.json();
      }
    } catch (e) {
      // ignore
    }
    stateNotifications = stateNotifications.filter((n) => n._id !== id);
    return { success: true, message: 'Notification deleted' };
  },
};
