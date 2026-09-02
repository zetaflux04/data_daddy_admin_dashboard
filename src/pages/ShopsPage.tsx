import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Edit2,
  MapPin,
  Sparkles,
  Users2,
  Users,
  ClipboardList,
  Eye,
  Trash2,
  UserPlus,
} from 'lucide-react';
import type { ShopItem } from '../types/admin';
import { StatusBadge } from '../components/StatusBadge';
import { ShopModal } from '../components/ShopModal';
import { ShopDetailsModal } from '../components/ShopDetailsModal';
import { TechnicianModal } from '../components/TechnicianModal';
import { adminApi, resolveImageUrl } from '../services/adminApi';
import { useAdminAuth } from '../context/AdminAuthContext';

export const ShopsPage: React.FC = () => {
  const { addToast } = useAdminAuth();
  const [shops, setShops] = useState<ShopItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState('all');

  // Modals state
  const [selectedShop, setSelectedShop] = useState<ShopItem | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [detailsShop, setDetailsShop] = useState<ShopItem | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [targetShopIdForTech, setTargetShopIdForTech] = useState<string>('');
  const [isTechModalOpen, setIsTechModalOpen] = useState(false);

  const fetchShops = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getShops({
        search: search.trim() || undefined,
        plan: planFilter !== 'all' ? planFilter : undefined,
      });
      setShops(res.shops || []);
    } catch (e: any) {
      addToast('error', 'Failed to fetch shops');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShops();
  }, [planFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchShops();
  };

  const handleTogglePlan = async (shop: ShopItem) => {
    const nextPlan = shop.subscription.plan === 'pro' ? 'free' : 'pro';
    try {
      await adminApi.updateShopSubscription(shop._id, { plan: nextPlan, status: 'active' });
      addToast('success', `Plan changed to ${nextPlan.toUpperCase()} for ${shop.name}`);
      fetchShops();
    } catch (e: any) {
      addToast('error', 'Failed to update subscription');
    }
  };

  const handleDeleteShop = async (shop: ShopItem) => {
    const confirmed = window.confirm(
      `⚠️ Are you sure you want to delete "${shop.name}"?\n\nThis will permanently remove the repair center, its staff, and associated records.`
    );
    if (!confirmed) return;

    try {
      await adminApi.deleteShop(shop._id);
      addToast('success', `Shop "${shop.name}" removed successfully.`);
      fetchShops();
    } catch (e: any) {
      addToast('error', e.message || 'Failed to delete shop');
    }
  };

  const handleOpenAddTech = (shopId: string) => {
    setTargetShopIdForTech(shopId);
    setIsTechModalOpen(true);
  };

  return (
    <div className="page-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Top Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Shops & Repair Centers</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Manage all registered repair centers across cities, inspect performance, assign technicians, and control subscriptions.
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedShop(null);
            setIsEditModalOpen(true);
          }}
          className="btn btn-primary"
        >
          <Plus size={16} />
          <span>Register New Center</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel" style={{ padding: '1rem 1.25rem' }}>
        <form
          onSubmit={handleSearchSubmit}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            flexWrap: 'wrap',
          }}
        >
          <div className="search-wrapper" style={{ flex: 1, minWidth: '280px' }}>
            <Search size={16} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by center name, owner, city, phone..."
              className="input-field search-input"
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              className="select-field"
              style={{ width: '150px' }}
            >
              <option value="all">All Plans</option>
              <option value="pro">⭐ Pro Plan</option>
              <option value="free">🌱 Free Tier</option>
            </select>

            <button type="submit" className="btn btn-secondary">
              Search
            </button>
          </div>
        </form>
      </div>

      {/* Centers Table */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Center / Shop</th>
                <th>Owner & Contact</th>
                <th>Staff</th>
                <th>Clients</th>
                <th>Orders</th>
                <th>Revenue</th>
                <th>Tier</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    Loading repair centers...
                  </td>
                </tr>
              ) : shops.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No shops match your criteria.
                  </td>
                </tr>
              ) : (
                shops.map((shop) => (
                  <tr key={shop._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div
                          style={{
                            width: '38px',
                            height: '38px',
                            borderRadius: 'var(--radius-md)',
                            background: shop.logoUrl ? '#F1F5F9' : 'linear-gradient(135deg, #4f46e5, #0284c7)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff',
                            fontWeight: 700,
                            fontSize: '0.9rem',
                            overflow: 'hidden',
                            flexShrink: 0,
                            border: shop.logoUrl ? '1px solid var(--border-subtle)' : 'none',
                          }}
                        >
                          {shop.logoUrl ? (
                            <img
                              src={resolveImageUrl(shop.logoUrl)}
                              alt={shop.name}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          ) : (
                            shop.name.charAt(0)
                          )}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{shop.name}</div>
                          <div
                            style={{
                              fontSize: '0.75rem',
                              color: 'var(--text-muted)',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                            }}
                          >
                            <MapPin size={11} />
                            <span>
                              {shop.address?.city || 'India'}{' '}
                              {shop.address?.state ? `• ${shop.address.state}` : ''}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div style={{ fontWeight: 600 }}>{shop.ownerName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>
                        📞 {shop.phone}
                      </div>
                    </td>

                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600 }}>
                        <Users2 size={14} color="var(--text-muted)" />
                        <span>{shop.stats?.totalStaff || 1} staff</span>
                      </div>
                    </td>

                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600 }}>
                        <Users size={14} color="var(--text-muted)" />
                        <span>{shop.stats?.totalCustomers || 0} clients</span>
                      </div>
                    </td>

                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 700 }}>
                        <ClipboardList size={14} color="var(--accent-primary)" />
                        <span>{shop.stats?.totalOrders || 0} jobs</span>
                      </div>
                    </td>

                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--accent-emerald)' }}>
                        ₹{(shop.stats?.totalRevenue || 0).toLocaleString('en-IN')}
                      </div>
                      {(shop.stats?.totalDues || 0) > 0 && (
                        <div style={{ fontSize: '0.7rem', color: '#e11d48', fontWeight: 600 }}>
                          Due: ₹{(shop.stats?.totalDues || 0).toLocaleString('en-IN')}
                        </div>
                      )}
                    </td>

                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', alignItems: 'flex-start' }}>
                        <StatusBadge status={shop.subscription.plan} type="plan" />
                        <span
                          style={{
                            fontSize: '0.6875rem',
                            color: 'var(--text-muted)',
                            textTransform: 'capitalize',
                          }}
                        >
                          {shop.subscription.status}
                        </span>
                      </div>
                    </td>

                    {/* Action Buttons: View Details, Edit Center, Delete Shop, Add Technician */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', flexWrap: 'nowrap' }}>
                        {/* 1. View Details */}
                        <button
                          onClick={() => {
                            setDetailsShop(shop);
                            setIsDetailsModalOpen(true);
                          }}
                          className="btn btn-secondary btn-sm"
                          title="View Center Details & Technicians"
                        >
                          <Eye size={13} />
                          <span>Details</span>
                        </button>

                        {/* 2. Edit Center */}
                        <button
                          onClick={() => {
                            setSelectedShop(shop);
                            setIsEditModalOpen(true);
                          }}
                          className="btn btn-secondary btn-sm"
                          title="Edit Center Profile"
                        >
                          <Edit2 size={13} />
                          <span>Edit</span>
                        </button>

                        {/* 3. Add Technician */}
                        <button
                          onClick={() => handleOpenAddTech(shop._id)}
                          className="btn btn-secondary btn-sm"
                          title="Add Technician directly to this Shop"
                          style={{ borderColor: 'var(--accent-primary)', color: 'var(--accent-primary)' }}
                        >
                          <UserPlus size={13} />
                          <span>+ Tech</span>
                        </button>

                        {/* 4. Delete Shop */}
                        <button
                          onClick={() => handleDeleteShop(shop)}
                          className="btn btn-danger btn-sm"
                          title="Delete Shop"
                        >
                          <Trash2 size={13} />
                        </button>

                        {/* Plan Toggle shortcut */}
                        <button
                          onClick={() => handleTogglePlan(shop)}
                          className="btn btn-ghost btn-sm"
                          title="Toggle Pro / Free Tier"
                          style={{ padding: '0.35rem', color: shop.subscription.plan === 'pro' ? '#d97706' : 'var(--accent-primary)' }}
                        >
                          <Sparkles size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 1. Edit / Create Shop Modal */}
      <ShopModal
        shop={selectedShop}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSaved={() => fetchShops()}
      />

      {/* 2. View Shop Details Modal */}
      <ShopDetailsModal
        shop={detailsShop}
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        onEdit={(s) => {
          setSelectedShop(s);
          setIsEditModalOpen(true);
        }}
        onAddTechnician={(sId) => handleOpenAddTech(sId)}
      />

      {/* 3. Add Technician Modal */}
      <TechnicianModal
        technician={null}
        defaultShopId={targetShopIdForTech}
        isOpen={isTechModalOpen}
        onClose={() => setIsTechModalOpen(false)}
        onSaved={() => {
          addToast('success', 'Technician assigned successfully');
          fetchShops();
        }}
      />
    </div>
  );
};
