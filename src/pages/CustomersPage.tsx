import React, { useState, useEffect } from 'react';
import { Search, Phone, Mail, MapPin, Store, Eye, ShoppingBag } from 'lucide-react';
import type { CustomerItem, OrderItem } from '../types/admin';
import { CustomerDetailsModal } from '../components/CustomerDetailsModal';
import { OrderInspectorModal } from '../components/OrderInspectorModal';
import { adminApi } from '../services/adminApi';
import { useAdminAuth } from '../context/AdminAuthContext';

export const CustomersPage: React.FC = () => {
  const { selectedShopId } = useAdminAuth();
  const [customers, setCustomers] = useState<CustomerItem[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerItem | null>(null);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getCustomers({
        shopId: selectedShopId,
        search,
      });
      setCustomers(res.customers);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [selectedShopId, search]);

  return (
    <div className="page-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header */}
      <div>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Central Customer Directory (CRM)</h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Unified cross-shop client profiles, contact numbers, and repair frequency records.
        </p>
      </div>

      {/* Search Bar */}
      <div className="glass-panel" style={{ padding: '1rem 1.25rem' }}>
        <div className="search-wrapper" style={{ maxWidth: '440px' }}>
          <Search size={16} />
          <input
            type="text"
            className="input-field search-input"
            placeholder="Search customers by name, phone, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="glass-panel" style={{ padding: '1.25rem' }}>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Customer Name</th>
                <th>Phone Number</th>
                <th>Registered Shop</th>
                <th>Email Address</th>
                <th>Address / Location</th>
                <th>Repeat Orders</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}>
                    Loading customers...
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No customer records found.
                  </td>
                </tr>
              ) : (
                customers.map((cust) => {
                  const shopName = typeof cust.shopId === 'object' ? cust.shopId?.name : 'Shop';

                  return (
                    <tr key={cust._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: 'var(--radius-full)',
                            background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff',
                            fontWeight: 700,
                          }}>
                            {cust.name.charAt(0)}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{cust.name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              Added {new Date(cust.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td>
                        <a
                          href={`tel:${cust.phone}`}
                          style={{
                            color: 'var(--accent-cyan)',
                            fontWeight: 600,
                            textDecoration: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                          }}
                        >
                          <Phone size={13} />
                          {cust.phone}
                        </a>
                      </td>

                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Store size={13} color="var(--text-muted)" />
                          <span style={{ fontWeight: 600 }}>{shopName}</span>
                        </div>
                      </td>

                      <td>
                        {cust.email ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8125rem' }}>
                            <Mail size={13} color="var(--text-muted)" />
                            <span>{cust.email}</span>
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>—</span>
                        )}
                      </td>

                      <td>
                        {cust.address ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8125rem' }}>
                            <MapPin size={13} color="var(--text-muted)" />
                            <span>{cust.address}</span>
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>—</span>
                        )}
                      </td>

                      <td>
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          padding: '0.2rem 0.6rem',
                          borderRadius: 'var(--radius-full)',
                          background: 'rgba(99, 102, 241, 0.15)',
                          color: '#a5b4fc',
                          fontWeight: 700,
                          fontSize: '0.75rem',
                        }}>
                          <ShoppingBag size={12} />
                          <span>{cust.totalOrdersCount} job(s)</span>
                        </div>
                      </td>

                      <td>
                        <button
                          onClick={() => {
                            setSelectedCustomer(cust);
                            setIsCustomerModalOpen(true);
                          }}
                          className="btn btn-secondary btn-sm"
                        >
                          <Eye size={13} />
                          <span>View Repairs</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Details Modal */}
      <CustomerDetailsModal
        customer={selectedCustomer}
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        onSelectOrder={(ord) => setSelectedOrder(ord)}
      />

      {/* Order Inspector Modal if navigated from customer */}
      {selectedOrder && (
        <OrderInspectorModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onOrderUpdated={(upd) => setSelectedOrder(upd)}
        />
      )}

    </div>
  );
};
