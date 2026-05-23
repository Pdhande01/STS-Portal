import { User } from '@supabase/supabase-js';

// Seed data definition
const initialProfiles = [
  {
    id: 'mock-admin-id',
    full_name: 'System Admin',
    phone: '+91 99999 99999',
    role: 'admin',
    specialization: null,
    created_at: '2026-01-01T00:00:00Z',
    email: 'admin@smarttech.com',
    status: 'active'
  },
  {
    id: 'mock-tech-id',
    full_name: 'Jane Smith',
    phone: '+91 88888 88888',
    role: 'technician',
    specialization: 'Laptop Repair',
    created_at: '2026-01-02T00:00:00Z',
    email: 'tech@smarttech.com',
    status: 'active'
  },
  {
    id: 'mock-user-id',
    full_name: 'John Doe',
    phone: '+91 77777 77777',
    role: 'user',
    specialization: null,
    created_at: '2026-01-03T00:00:00Z',
    email: 'user@smarttech.com',
    status: 'active'
  },
  {
    id: 'mock-parth-id',
    full_name: 'Parth Dhande',
    phone: '+91 98765 43210',
    role: 'admin',
    specialization: null,
    created_at: '2026-05-23T00:00:00Z',
    email: 'parthdhande7894@gmail.com',
    status: 'active'
  }
];

const initialProducts = [
  {
    id: 'prod-1',
    name: 'Crucial 16GB DDR4 RAM',
    category: 'memory',
    price: 4500,
    stock: 15,
    image_url: 'https://images.unsplash.com/photo-1591405351990-4726e33df58d?w=300&q=80',
    rating: 4.8,
    reviews: 34,
    trending: true,
    created_at: '2026-01-01T00:00:00Z'
  },
  {
    id: 'prod-2',
    name: 'Samsung 980 Pro 1TB NVMe SSD',
    category: 'storage',
    price: 8900,
    stock: 8,
    image_url: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=300&q=80',
    rating: 4.9,
    reviews: 52,
    trending: true,
    created_at: '2026-01-02T00:00:00Z'
  },
  {
    id: 'prod-3',
    name: 'Logitech MX Master 3S Mouse',
    category: 'accessories',
    price: 9500,
    stock: 5,
    image_url: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=300&q=80',
    rating: 4.7,
    reviews: 28,
    trending: false,
    created_at: '2026-01-03T00:00:00Z'
  },
  {
    id: 'prod-4',
    name: 'Corsair Vengeance 32GB DDR5 RAM',
    category: 'memory',
    price: 11200,
    stock: 12,
    image_url: 'https://images.unsplash.com/photo-1591405351990-4726e33df58d?w=300&q=80',
    rating: 4.9,
    reviews: 15,
    trending: true,
    created_at: '2026-01-04T00:00:00Z'
  },
  {
    id: 'prod-5',
    name: 'Crucial P3 Plus 2TB NVMe SSD',
    category: 'storage',
    price: 12500,
    stock: 4,
    image_url: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=300&q=80',
    rating: 4.6,
    reviews: 40,
    trending: false,
    created_at: '2026-01-05T00:00:00Z'
  }
];

const initialServiceRequests = [
  {
    id: 'req-1',
    user_id: 'mock-user-id',
    technician_id: 'mock-tech-id',
    device_type: 'Laptop',
    brand: 'Dell',
    model: 'XPS 15',
    issue_type: 'Screen Replacement',
    description: 'The screen is flickering and showing green lines.',
    service_location: 'shop',
    address: null,
    phone: '+91 77777 77777',
    preferred_date: '2026-05-25',
    preferred_time: '10:00 AM',
    status: 'In Progress',
    progress: 50,
    created_at: '2026-05-22T10:00:00Z',
    updated_at: '2026-05-22T14:00:00Z'
  },
  {
    id: 'req-2',
    user_id: 'mock-user-id',
    technician_id: null,
    device_type: 'Desktop',
    brand: 'Custom',
    model: 'Gaming PC',
    issue_type: 'Blue Screen of Death',
    description: 'Getting BSOD randomly while loading games. Memory dump indicates RAM issue.',
    service_location: 'home',
    address: '123 Main St, Tech City',
    phone: '+91 77777 77777',
    preferred_date: '2026-05-26',
    preferred_time: '02:00 PM',
    status: 'Pending',
    progress: 0,
    created_at: '2026-05-23T05:00:00Z',
    updated_at: '2026-05-23T05:00:00Z'
  }
];

const initialServiceUpdates = [
  {
    id: 'upd-1',
    service_request_id: 'req-1',
    note: 'Service request received. Awaiting technician assignment.',
    created_at: '2026-05-22T10:00:00Z'
  },
  {
    id: 'upd-2',
    service_request_id: 'req-1',
    note: 'Technician assigned. Work will begin soon.',
    created_at: '2026-05-22T14:00:00Z'
  },
  {
    id: 'upd-3',
    service_request_id: 'req-2',
    note: 'Service request received. Awaiting technician assignment.',
    created_at: '2026-05-23T05:00:00Z'
  }
];

const initialOrders = [
  {
    id: 'ord-1',
    user_id: 'mock-user-id',
    total_amount: 13400,
    status: 'Processing',
    created_at: '2026-05-22T15:30:00Z'
  }
];

const initialOrderItems = [
  {
    id: 'item-1',
    order_id: 'ord-1',
    product_id: 'prod-1',
    quantity: 1,
    price_at_purchase: 4500
  },
  {
    id: 'item-2',
    order_id: 'ord-1',
    product_id: 'prod-2',
    quantity: 1,
    price_at_purchase: 8900
  }
];

// Initialize localStorage helper
function initLocalStorage() {
  let changed = false;
  if (!localStorage.getItem('sts_profiles')) {
    localStorage.setItem('sts_profiles', JSON.stringify(initialProfiles));
    changed = true;
  }
  if (!localStorage.getItem('sts_products')) {
    localStorage.setItem('sts_products', JSON.stringify(initialProducts));
    changed = true;
  }
  if (!localStorage.getItem('sts_service_requests')) {
    localStorage.setItem('sts_service_requests', JSON.stringify(initialServiceRequests));
    changed = true;
  }
  if (!localStorage.getItem('sts_service_updates')) {
    localStorage.setItem('sts_service_updates', JSON.stringify(initialServiceUpdates));
    changed = true;
  }
  if (!localStorage.getItem('sts_orders')) {
    localStorage.setItem('sts_orders', JSON.stringify(initialOrders));
    changed = true;
  }
  if (!localStorage.getItem('sts_order_items')) {
    localStorage.setItem('sts_order_items', JSON.stringify(initialOrderItems));
    changed = true;
  }
  if (changed || !localStorage.getItem('sts_initialized')) {
    localStorage.setItem('sts_initialized', 'true');
    console.log('%c[MOCK DB] Initialized/seeded local database.', 'color: #10b981; font-weight: bold;');
  }
}

// Add global debug / reset function to help the user easily reset database state
if (typeof window !== 'undefined') {
  (window as any).resetMockDB = () => {
    const keys = [
      'sts_profiles',
      'sts_products',
      'sts_service_requests',
      'sts_service_updates',
      'sts_orders',
      'sts_order_items',
      'sts_initialized',
      'sts_session'
    ];
    keys.forEach(k => localStorage.removeItem(k));
    console.log('%c[MOCK DB] Local Storage cleared. Re-initializing...', 'color: #ef4444; font-weight: bold;');
    initLocalStorage();
    window.location.reload();
  };
  console.log('%c💡 Tip: You can reset the mock database anytime by typing `resetMockDB()` in the browser console.', 'color: #8b5cf6; font-weight: bold;');
}

class MockQueryBuilder {
  private tableName: string;
  private filters: ((item: any) => boolean)[] = [];
  private orderCol: string | null = null;
  private orderAsc = true;
  private isSingle = false;
  private isInsert = false;
  private isUpdate = false;
  private isDelete = false;
  private payload: any = null;

  constructor(tableName: string) {
    this.tableName = tableName;
    initLocalStorage();
  }

  select(fields?: string) {
    return this;
  }

  insert(values: any) {
    this.isInsert = true;
    this.payload = values;
    return this;
  }

  update(values: any) {
    this.isUpdate = true;
    this.payload = values;
    return this;
  }

  delete() {
    this.isDelete = true;
    return this;
  }

  eq(column: string, value: any) {
    this.filters.push((item) => {
      return item[column] === value;
    });
    return this;
  }

  neq(column: string, value: any) {
    this.filters.push((item) => {
      return item[column] !== value;
    });
    return this;
  }

  order(column: string, options?: { ascending?: boolean }) {
    this.orderCol = column;
    this.orderAsc = options?.ascending ?? true;
    return this;
  }

  single() {
    this.isSingle = true;
    return this;
  }

  async then(onfulfilled: (value: any) => any, onrejected?: (reason: any) => any) {
    try {
      const result = await this.execute();
      return onfulfilled(result);
    } catch (err) {
      if (onrejected) return onrejected(err);
      throw err;
    }
  }

  private async execute() {
    console.log(`%c[MOCK DB] Query on: ${this.tableName}`, 'color: #3b82f6; font-weight: bold;', {
      filters: this.filters.length,
      isInsert: this.isInsert,
      isUpdate: this.isUpdate,
      isDelete: this.isDelete,
      isSingle: this.isSingle
    });

    let data = JSON.parse(localStorage.getItem(`sts_${this.tableName}`) || '[]');

    // Self-healing check for profile elevation
    if (this.tableName === 'profiles') {
      let profilesChanged = false;
      data = data.map((p: any) => {
        if ((p.email === 'parthdhande7894@gmail.com' || p.email === 'admin@smarttech.com') && p.role !== 'admin') {
          console.log(`%c[MOCK DB] Elevating email ${p.email} to 'admin' role (Self-Healing).`, 'color: #8b5cf6; font-weight: bold;');
          p.role = 'admin';
          profilesChanged = true;
        }
        return p;
      });
      if (profilesChanged) {
        localStorage.setItem('sts_profiles', JSON.stringify(data));
      }
    }

    if (this.isInsert) {
      const toInsert = Array.isArray(this.payload) ? this.payload : [this.payload];
      const inserted = toInsert.map((item: any) => {
        const newItem = {
          id: item.id || 'id-' + Math.random().toString(36).substring(2, 11),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          ...item
        };
        data.push(newItem);
        return newItem;
      });
      localStorage.setItem(`sts_${this.tableName}`, JSON.stringify(data));
      console.log(`%c[MOCK DB] Inserted into ${this.tableName}:`, 'color: #10b981;', inserted);
      return { data: Array.isArray(this.payload) ? inserted : inserted[0], error: null };
    }

    if (this.isUpdate) {
      const updated: any[] = [];
      data = data.map((item: any) => {
        const matches = this.filters.every(f => f(item));
        if (matches) {
          const newItem = { ...item, ...this.payload, updated_at: new Date().toISOString() };
          updated.push(newItem);
          return newItem;
        }
        return item;
      });
      localStorage.setItem(`sts_${this.tableName}`, JSON.stringify(data));
      console.log(`%c[MOCK DB] Updated in ${this.tableName}:`, 'color: #f59e0b;', updated);
      return { data: this.isSingle ? updated[0] : updated, error: null };
    }

    if (this.isDelete) {
      const beforeLength = data.length;
      data = data.filter((item: any) => !this.filters.every(f => f(item)));
      const afterLength = data.length;
      localStorage.setItem(`sts_${this.tableName}`, JSON.stringify(data));
      console.log(`%c[MOCK DB] Deleted from ${this.tableName}. Removed ${beforeLength - afterLength} rows.`, 'color: #ef4444;');
      return { data: null, error: null };
    }

    // select
    let result = [...data];
    for (const filter of this.filters) {
      result = result.filter(filter);
    }

    if (this.orderCol) {
      result.sort((a, b) => {
        const valA = a[this.orderCol!];
        const valB = b[this.orderCol!];
        if (valA < valB) return this.orderAsc ? -1 : 1;
        if (valA > valB) return this.orderAsc ? 1 : -1;
        return 0;
      });
    }

    // Resolve relation mappings for front-end joins
    const profiles = JSON.parse(localStorage.getItem('sts_profiles') || '[]');
    const serviceUpdates = JSON.parse(localStorage.getItem('sts_service_updates') || '[]');
    const orderItems = JSON.parse(localStorage.getItem('sts_order_items') || '[]');
    const products = JSON.parse(localStorage.getItem('sts_products') || '[]');

    result = result.map((item: any) => {
      const cloned = { ...item };
      
      if (this.tableName === 'service_requests') {
        cloned.profiles = profiles.find((p: any) => p.id === cloned.user_id) || null;
        cloned.technician = profiles.find((p: any) => p.id === cloned.technician_id) || null;
        cloned.service_updates = serviceUpdates.filter((u: any) => u.service_request_id === cloned.id);
      }

      if (this.tableName === 'orders') {
        cloned.profiles = profiles.find((p: any) => p.id === cloned.user_id) || null;
        const items = orderItems.filter((oi: any) => oi.order_id === cloned.id);
        cloned.order_items = items.map((oi: any) => ({
          ...oi,
          products: products.find((p: any) => p.id === oi.product_id) || null
        }));
      }

      return cloned;
    });

    if (this.isSingle) {
      if (result.length === 0) {
        return { data: null, error: { message: 'Row not found' } };
      }
      return { data: result[0], error: null };
    }

    return { data: result, error: null, count: result.length };
  }
}

class MockAuth {
  private listeners: ((event: string, session: any) => void)[] = [];

  constructor() {
    initLocalStorage();
  }

  private trigger(event: string, session: any) {
    this.listeners.forEach(cb => {
      try { cb(event, session); } catch (e) { console.error(e); }
    });
  }

  async getSession() {
    const sessionStr = localStorage.getItem('sts_session');
    if (sessionStr) {
      try {
        const session = JSON.parse(sessionStr);
        // Self-heal the session user's role if it is one of the admin emails
        if (session?.user?.email === 'parthdhande7894@gmail.com' || session?.user?.email === 'admin@smarttech.com') {
          if (session.user.user_metadata?.role !== 'admin') {
            console.log(`%c[MOCK AUTH] Self-elevating session user metadata role to 'admin' for ${session.user.email}`, 'color: #8b5cf6; font-weight: bold;');
            session.user.user_metadata = { ...session.user.user_metadata, role: 'admin' };
            localStorage.setItem('sts_session', JSON.stringify(session));
          }
        }
        return { data: { session }, error: null };
      } catch (e) {
        console.error('[MOCK AUTH] Error parsing session', e);
      }
    }
    return { data: { session: null }, error: null };
  }

  async getUser() {
    const { data: { session } } = await this.getSession();
    return { data: { user: session?.user || null }, error: null };
  }

  onAuthStateChange(callback: (event: string, session: any) => void) {
    this.listeners.push(callback);
    this.getSession().then(({ data: { session } }) => {
      // Defer callback invocation to allow context setup
      setTimeout(() => {
        callback(session ? 'SIGNED_IN' : 'SIGNED_OUT', session);
      }, 0);
    });

    return {
      data: {
        subscription: {
          unsubscribe: () => {
            this.listeners = this.listeners.filter(cb => cb !== callback);
          }
        }
      }
    };
  }

  async signInWithOtp(params: { email: string }) {
    const email = params.email;
    const otpCode = '123456';
    localStorage.setItem(`sts_otp_${email}`, otpCode);
    console.log(`%c[MOCK AUTH] Generated OTP for ${email}: ${otpCode}`, 'color: #8b5cf6; font-weight: bold; font-size: 14px;');
    return { data: {}, error: null };
  }

  async verifyOtp(params: { email: string, token: string }) {
    const { email, token } = params;
    const storedOtp = localStorage.getItem(`sts_otp_${email}`) || '123456';
    
    if (token !== storedOtp && token !== '123456') {
      throw new Error('Invalid verification code.');
    }

    // Clean up OTP
    localStorage.removeItem(`sts_otp_${email}`);

    const profiles = JSON.parse(localStorage.getItem('sts_profiles') || '[]');
    let profile = profiles.find((p: any) => p.email === email);

    if (!profile) {
      let role = 'user';
      let fullName = email.split('@')[0];
      fullName = fullName.charAt(0).toUpperCase() + fullName.slice(1);

      if (email.includes('admin') || email === 'parthdhande7894@gmail.com') {
        role = 'admin';
      } else if (email.includes('tech') || email.includes('technician')) {
        role = 'technician';
      }

      profile = {
        id: 'mock-user-' + Math.random().toString(36).substring(2, 11),
        full_name: fullName,
        phone: '+91 98765 43210',
        role: role,
        specialization: role === 'technician' ? 'Laptop Repair' : null,
        created_at: new Date().toISOString(),
        email: email,
        status: 'active'
      };
      profiles.push(profile);
      localStorage.setItem('sts_profiles', JSON.stringify(profiles));
    } else if (email === 'parthdhande7894@gmail.com' || email === 'admin@smarttech.com') {
      profile.role = 'admin';
      localStorage.setItem('sts_profiles', JSON.stringify(profiles));
    }

    const user: User = {
      id: profile.id,
      email: email,
      created_at: profile.created_at,
      app_metadata: {},
      user_metadata: { full_name: profile.full_name, phone: profile.phone, role: profile.role },
      aud: 'authenticated',
      role: 'authenticated'
    };

    const session = {
      access_token: 'mock-jwt-token-' + Math.random().toString(36).substring(2, 11),
      token_type: 'bearer',
      expires_in: 3600,
      refresh_token: 'mock-refresh-token',
      user: user
    };

    localStorage.setItem('sts_session', JSON.stringify(session));
    console.log(`%c[MOCK AUTH] User signed in. Email: ${email}, Role: ${profile.role}`, 'color: #10b981; font-weight: bold;');
    this.trigger('SIGNED_IN', session);

    return { data: { user, session }, error: null };
  }

  async signUp(params: { email: string, password?: string, options?: any }) {
    const { email, options } = params;
    const metadata = options?.data || {};
    const profiles = JSON.parse(localStorage.getItem('sts_profiles') || '[]');
    
    if (profiles.some((p: any) => p.email === email)) {
      throw new Error('User already exists.');
    }

    const userId = 'mock-user-' + Math.random().toString(36).substring(2, 11);
    let role = metadata.role || 'user';
    if (email === 'parthdhande7894@gmail.com' || email === 'admin@smarttech.com') {
      role = 'admin';
    }

    const newProfile = {
      id: userId,
      full_name: metadata.full_name || email.split('@')[0],
      phone: metadata.phone || null,
      role: role,
      specialization: metadata.specialization || null,
      created_at: new Date().toISOString(),
      email: email,
      status: 'active'
    };

    profiles.push(newProfile);
    localStorage.setItem('sts_profiles', JSON.stringify(profiles));

    const user: User = {
      id: userId,
      email: email,
      created_at: newProfile.created_at,
      app_metadata: {},
      user_metadata: { ...metadata, role },
      aud: 'authenticated',
      role: 'authenticated'
    };

    console.log(`%c[MOCK AUTH] User registered. Email: ${email}, Role: ${role}`, 'color: #10b981; font-weight: bold;');
    return { data: { user }, error: null };
  }

  async signOut() {
    localStorage.removeItem('sts_session');
    console.log('%c[MOCK AUTH] User signed out.', 'color: #ef4444; font-weight: bold;');
    this.trigger('SIGNED_OUT', null);
    return { error: null };
  }
}

export const mockSupabase = {
  auth: new MockAuth(),
  from(tableName: string) {
    return new MockQueryBuilder(tableName);
  },
  async rpc(funcName: string, args?: any) {
    if (funcName === 'decrement_stock') {
      const productId = args.product_id;
      const amount = args.amount || 1;
      const products = JSON.parse(localStorage.getItem('sts_products') || '[]');
      const updated = products.map((p: any) => {
        if (p.id === productId) {
          return { ...p, stock: Math.max(0, p.stock - amount) };
        }
        return p;
      });
      localStorage.setItem('sts_products', JSON.stringify(updated));
      console.log(`%c[MOCK DB] Executed RPC decrement_stock for product: ${productId}`, 'color: #8b5cf6;');
      return { data: null, error: null };
    }
    return { data: null, error: null };
  }
};
