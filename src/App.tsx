import React, { useState } from 'react';
import { AdminAuthProvider, useAdminAuth } from './context/AdminAuthContext';
import { Sidebar, type NavTab } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { DashboardPage } from './pages/DashboardPage';
import { ShopsPage } from './pages/ShopsPage';
import { OrdersPage } from './pages/OrdersPage';
import { RevenuePage } from './pages/RevenuePage';
import { NotificationPage } from './pages/NotificationPage';
import { LoginPage } from './pages/LoginPage';
import { ShopModal } from './components/ShopModal';
import { TechnicianModal } from './components/TechnicianModal';

const AdminPortalContent: React.FC = () => {
  const { isAuthenticated, refreshShops } = useAdminAuth();
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Global modals
  const [isShopModalOpen, setIsShopModalOpen] = useState(false);
  const [isTechModalOpen, setIsTechModalOpen] = useState(false);

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const handleGlobalRefresh = async () => {
    setIsRefreshing(true);
    await refreshShops();
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return {
          title: 'Overview / Dashboard',
          subtitle: 'Platform-wide metrics, registered centers, technicians count, and live customer issues',
        };
      case 'shops':
        return {
          title: 'Shops / Centers',
          subtitle: 'Registered repair centers registry with view details, center edit, delete, and technician assignment',
        };
      case 'orders':
        return {
          title: 'Customer Orders',
          subtitle: 'Comprehensive orders directory with reported customer issues, device model numbers, costs, and actions',
        };
      case 'revenue':
        return {
          title: 'Revenue & Finances',
          subtitle: 'Platform-wide cash collections, pending dues, and per-shop financial analytics',
        };
      case 'notifications':
        return {
          title: 'Notification Center',
          subtitle: 'Broadcast announcements to all shop owners or dispatch private notifications to a specific center',
        };
      default:
        return { title: 'Admin Dashboard', subtitle: 'DataDaddy Control Center' };
    }
  };

  const pageInfo = getPageTitle();

  return (
    <div className="app-container">
      {/* Light-Dark Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <div className="main-content">
        {/* Crisp White Topbar */}
        <Topbar
          title={pageInfo.title}
          subtitle={pageInfo.subtitle}
          onRefresh={handleGlobalRefresh}
          isRefreshing={isRefreshing}
        />

        {/* 5 Core Tab Pages */}
        <main style={{ flex: 1, paddingBottom: '3rem' }}>
          {activeTab === 'dashboard' && (
            <DashboardPage
              onNavigateTab={setActiveTab}
              onOpenShopModal={() => setIsShopModalOpen(true)}
              onOpenTechModal={() => setIsTechModalOpen(true)}
            />
          )}

          {activeTab === 'shops' && <ShopsPage />}

          {activeTab === 'orders' && <OrdersPage />}

          {activeTab === 'revenue' && <RevenuePage />}

          {activeTab === 'notifications' && <NotificationPage />}
        </main>
      </div>

      {/* Quick Action Modals */}
      <ShopModal
        shop={null}
        isOpen={isShopModalOpen}
        onClose={() => setIsShopModalOpen(false)}
        onSaved={() => refreshShops()}
      />

      <TechnicianModal
        technician={null}
        isOpen={isTechModalOpen}
        onClose={() => setIsTechModalOpen(false)}
        onSaved={() => refreshShops()}
      />
    </div>
  );
};

export function App() {
  return (
    <AdminAuthProvider>
      <AdminPortalContent />
    </AdminAuthProvider>
  );
}

export default App;
