import React, { useState } from 'react';
import { POSProvider, usePOS } from './context/POSContext';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/Navbar';
import { NavigationTabs } from './components/NavigationTabs';
import { POSTerminal } from './components/pos/POSTerminal';
import { CannabisManager } from './components/cannabis/CannabisManager';
import { KratomManager } from './components/kratom/KratomManager';
import { InventoryManager } from './components/inventory/InventoryManager';
import { RawMaterialSourceManager } from './components/sources/RawMaterialSourceManager';
import { SupplierManager } from './components/suppliers/SupplierManager';
import { CustomerManager } from './components/customers/CustomerManager';
import { PromotionManager } from './components/promotions/PromotionManager';
import { UserManager } from './components/users/UserManager';
import { AuditLogViewer } from './components/audit/AuditLogViewer';
import { ReportsDashboard } from './components/reports/ReportsDashboard';
import { SettingsManager } from './components/settings/SettingsManager';
import { LoginScreen } from './components/auth/LoginScreen';

function MainApp() {
  const { isAuthenticated } = usePOS();
  const [activeTab, setActiveTab] = useState('pos');

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col min-h-screen">
        <div className="flex-1">
          <LoginScreen />
        </div>
        <footer className="py-2.5 bg-slate-900 text-slate-300 text-center text-xs sm:text-sm font-bold flex items-center justify-center space-x-2 border-t border-slate-800 z-20">
          <span className="text-base">⛵</span>
          <span>พัฒนาโปรแกรมโดย ที พกท 81</span>
          <span className="text-base">⛵</span>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100/90 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.06),rgba(255,255,255,0))] text-slate-900 flex flex-col font-sans selection:bg-emerald-600 selection:text-white">
      {/* Top Header Navbar with Integrated Main Menu Dropdown under User */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Dynamic View Body */}
      <main className="flex-1 p-3 sm:p-5 md:p-6 max-w-7xl w-full mx-auto overflow-y-auto">
        {activeTab === 'pos' && <POSTerminal />}
        {activeTab === 'cannabis' && <CannabisManager />}
        {activeTab === 'kratom' && <KratomManager />}
        {activeTab === 'inventory' && <InventoryManager />}
        {activeTab === 'sources' && <RawMaterialSourceManager />}
        {activeTab === 'suppliers' && <SupplierManager />}
        {activeTab === 'customers' && <CustomerManager />}
        {activeTab === 'promotions' && <PromotionManager />}
        {activeTab === 'users' && <UserManager />}
        {activeTab === 'audit' && <AuditLogViewer />}
        {activeTab === 'reports' && <ReportsDashboard />}
        {activeTab === 'settings' && <SettingsManager />}
      </main>

      {/* Footer at the very bottom */}
      <footer className="py-3 bg-slate-900 text-slate-300 text-center text-xs sm:text-sm font-bold flex items-center justify-center space-x-2 border-t border-slate-800 shadow-inner">
        <span className="text-base">⛵</span>
        <span>พัฒนาโปรแกรมโดย ที พกท 81</span>
        <span className="text-base">⛵</span>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <POSProvider>
        <MainApp />
      </POSProvider>
    </ThemeProvider>
  );
}
