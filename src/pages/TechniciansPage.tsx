import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Edit2,
  Phone,
  Store,
  CheckCircle,
  XCircle,
  Wrench,
} from 'lucide-react';
import type { TechnicianItem } from '../types/admin';
import { StatusBadge } from '../components/StatusBadge';
import { TechnicianModal } from '../components/TechnicianModal';
import { adminApi } from '../services/adminApi';
import { useAdminAuth } from '../context/AdminAuthContext';

export const TechniciansPage: React.FC = () => {
  const { selectedShopId, addToast } = useAdminAuth();
  const [technicians, setTechnicians] = useState<TechnicianItem[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedTech, setSelectedTech] = useState<TechnicianItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchTechnicians = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getTechnicians({
        shopId: selectedShopId,
        role: roleFilter,
        search,
      });
      setTechnicians(res.technicians);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTechnicians();
  }, [selectedShopId, roleFilter, search]);

  const handleToggleActive = async (tech: TechnicianItem) => {
    try {
      await adminApi.updateTechnician(tech._id, { isActive: !tech.isActive });
      addToast('success', `${tech.name} marked as ${!tech.isActive ? 'Active' : 'Inactive'}`);
      fetchTechnicians();
    } catch (e: any) {
      addToast('error', e.message || 'Failed to toggle status');
    }
  };

  return (
    <div className="page-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Technicians & Staff Directory</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Associated hardware engineers, mobile repairers, and front desk operators per shop.
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedTech(null);
            setIsModalOpen(true);
          }}
          className="btn btn-primary"
        >
          <Plus size={16} />
          <span>+ Add Technician</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="glass-panel" style={{ padding: '1rem 1.25rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
        <div className="search-wrapper" style={{ flex: 1, minWidth: '240px', maxWidth: '400px' }}>
          <Search size={16} />
          <input
            type="text"
            className="input-field search-input"
            placeholder="Search technicians by name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="select-field"
            style={{ width: 'auto' }}
          >
            <option value="all">All Roles</option>
            <option value="technician">Technicians</option>
            <option value="staff">Staff</option>
            <option value="owner">Owners</option>
          </select>
        </div>
      </div>

      {/* Technicians Table */}
      <div className="glass-panel" style={{ padding: '1.25rem' }}>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Technician Name</th>
                <th>Phone Number</th>
                <th>Associated Shop</th>
                <th>Role</th>
                <th>Active Jobs Load</th>
                <th>Account Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}>
                    Loading technicians...
                  </td>
                </tr>
              ) : technicians.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No technicians found matching criteria.
                  </td>
                </tr>
              ) : (
                technicians.map((tech) => {
                  const shopName = typeof tech.shopId === 'object' ? tech.shopId?.name : 'Shop';
                  const shopCity = typeof tech.shopId === 'object' ? tech.shopId?.address?.city : '';

                  return (
                    <tr key={tech._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: 'var(--radius-full)',
                            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff',
                            fontWeight: 700,
                          }}>
                            {tech.name.charAt(0)}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{tech.name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              Joined {new Date(tech.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td>
                        <a
                          href={`tel:${tech.phone}`}
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
                          {tech.phone}
                        </a>
                      </td>

                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Store size={13} color="var(--text-muted)" />
                          <span style={{ fontWeight: 600 }}>{shopName}</span>
                        </div>
                        {shopCity && (
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', paddingLeft: '1.15rem' }}>
                            {shopCity}
                          </div>
                        )}
                      </td>

                      <td>
                        <StatusBadge status={tech.role} type="role" />
                      </td>

                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Wrench size={13} color="var(--accent-amber)" />
                          <span style={{ fontWeight: 700, color: tech.activeJobsCount && tech.activeJobsCount > 0 ? '#f59e0b' : 'var(--text-muted)' }}>
                            {tech.activeJobsCount || 0} active job(s)
                          </span>
                        </div>
                      </td>

                      <td>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            color: tech.isActive ? '#34d399' : '#f87171',
                          }}
                        >
                          {tech.isActive ? <CheckCircle size={13} /> : <XCircle size={13} />}
                          {tech.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>

                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            onClick={() => {
                              setSelectedTech(tech);
                              setIsModalOpen(true);
                            }}
                            className="btn btn-secondary btn-sm"
                          >
                            <Edit2 size={13} />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => handleToggleActive(tech)}
                            className={`btn btn-sm ${tech.isActive ? 'btn-ghost' : 'btn-success'}`}
                            style={{ fontSize: '0.75rem' }}
                          >
                            {tech.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Technician Modal */}
      <TechnicianModal
        technician={selectedTech}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaved={() => fetchTechnicians()}
      />

    </div>
  );
};
