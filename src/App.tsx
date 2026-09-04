import React, { useState } from 'react';
import { Box } from '@mui/material';
import { AdminAuthProvider, useAdminAuth } from './context/AdminAuthContext';
import { Sidebar, type NavTab } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { DashboardPage } from './pages/DashboardPage';
import { ShopsPage } from './pages/ShopsPage';
import { OrdersPage } from './pages/OrdersPage';
import { AccessoriesPage } from './pages/AccessoriesPage';
import { RevenuePage } from './pages/RevenuePage';
import { NotificationPage } from './pages/NotificationPage';
import { LoginPage } from './pages/LoginPage';
import { ShopModal } from './components/ShopModal';
import { TechnicianModal } from './components/TechnicianModal';

const AdminPortalContent: React.FC = () => {
  const { isAuthenticated, refreshShops } = useAdminAuth();
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [drawerOpen, setDrawerOpen] = useState(true);

  // Global modals
  const [isShopModalOpen, setIsShopModalOpen] = useState(false);
  const [isTechModalOpen, setIsTechModalOpen] = useState(false);

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Mini Variant Drawer Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        open={drawerOpen}
        onToggle={() => setDrawerOpen((prev) => !prev)}
      />

      {/* Main Column */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Crisp Clean Topbar */}
        <Topbar
          onToggleSidebar={() => setDrawerOpen((prev) => !prev)}
          isSidebarOpen={drawerOpen}
        />

        {/* Generous Content Gap & Padding */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: { xs: 2.5, sm: 3.5, md: 4.5 },
            maxWidth: 1600,
            width: '100%',
            mx: 'auto',
            pb: 8,
          }}
        >
          {activeTab === 'dashboard' && (
            <DashboardPage
              onNavigateTab={setActiveTab}
              onOpenShopModal={() => setIsShopModalOpen(true)}
              onOpenTechModal={() => setIsTechModalOpen(true)}
            />
          )}

          {activeTab === 'shops' && <ShopsPage />}

          {activeTab === 'orders' && <OrdersPage />}

          {activeTab === 'accessories' && <AccessoriesPage />}

          {activeTab === 'revenue' && <RevenuePage />}

          {activeTab === 'notifications' && <NotificationPage />}
        </Box>
      </Box>

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
    </Box>
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
