/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { MedicineComparisonView } from './components/MedicineComparisonView';
import { PrescriptionUploadView } from './components/PrescriptionUploadView';
import { OrderTrackingView } from './components/OrderTrackingView';
import { PharmacyPortalView } from './components/PharmacyPortalView';
import { AdminDashboardView } from './components/AdminDashboardView';
import { DoctorPrescribeView } from './components/DoctorPrescribeView';
import { ArchitectureView } from './components/ArchitectureView';
import { AuthView } from './components/AuthView';
import { CartCheckoutDrawer } from './components/CartCheckoutDrawer';
import { ToastContainer } from './components/ToastContainer';
import { useTheme } from './hooks/useTheme';

function AppContent() {
  const { activeTab } = useApp();
  const { theme, toggleTheme } = useTheme();
  const [isCartOpen, setIsCartOpen] = useState(false);

  const renderActiveView = () => {
    switch (activeTab) {
      case 'compare':
        return <MedicineComparisonView />;
      case 'prescriptions':
        return <PrescriptionUploadView />;
      case 'orders':
        return <OrderTrackingView />;
      case 'pharmacy_orders':
      case 'pharmacy_rx':
      case 'pharmacy_inventory':
        return <PharmacyPortalView />;
      case 'admin_dashboard':
      case 'admin_audit':
      case 'admin_catalog':
        return <AdminDashboardView />;
      case 'doctor_prescribe':
        return <DoctorPrescribeView />;
      case 'architecture':
        return <ArchitectureView />;
      case 'login':
        return <AuthView initialMode="login" />;
      case 'register':
        return <AuthView initialMode="register" />;
      default:
        return <MedicineComparisonView />;
    }
  };

  return (
    <div
      id="app-root"
      className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans antialiased selection:bg-emerald-500/20 selection:text-emerald-900 dark:selection:text-emerald-200 transition-colors duration-200"
    >
      {/* 1. Multi-tenant Header with Role Switcher & Cart */}
      <Header
        theme={theme}
        onToggleTheme={toggleTheme}
        onOpenCart={() => setIsCartOpen(true)}
      />

      {/* 2. Fluid Adaptive Main Workspace */}
      <main
        id="main-workspace"
        className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 transition-colors duration-200"
      >
        {renderActiveView()}
      </main>

      {/* 3. Global Cart & Checkout Modal Drawer */}
      <CartCheckoutDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
      />

      {/* 4. Global Toast Notification System */}
      <ToastContainer />

      {/* 5. Regulatory & Architectural Footer */}
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
