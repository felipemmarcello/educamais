import React from 'react';
import { Outlet } from 'react-router-dom';
import SideBarAdmin from './SideBarAdmin.jsx';

function AdminLayout() {
  return (
    <div style={{
      display: 'flex',
      width: '100%',
      height: '100%'
    }}>
      <SideBarAdmin />
      <div style={{
        flexGrow: 1,
        overflowY: 'auto',
        maxWidth: '1040px'  // Ajustar com base na largura do SideBarAdmin
      }}>
        <Outlet />
      </div>
    </div>
  );
}

export default AdminLayout;
