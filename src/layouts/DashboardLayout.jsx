import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

export default function DashboardLayout({ children, activeTab, onSelectTab }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-app)', width: '100%', maxWidth: '100vw', overflowX: 'hidden' }}>
      {/* Top Navbar */}
      <Navbar onToggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />

      {/* Main Shell */}
      <div style={{ display: 'flex', flex: 1, position: 'relative', width: '100%', maxWidth: '100vw', overflowX: 'hidden' }}>
        {/* Role-tailored Sidebar */}
        <Sidebar isOpen={isSidebarOpen} activeTab={activeTab} onSelectTab={onSelectTab} />

        {/* Dynamic Page Content */}
        <main
          style={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            minWidth: 0,
            width: '100%',
            maxWidth: '100%',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div className="page-content">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
