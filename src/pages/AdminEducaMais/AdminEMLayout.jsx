import React from 'react';
import { Outlet } from 'react-router-dom';
import SideBarAdminEM from './SideBarAdminEM.jsx';

function AdminLayoutEM() {
  return (
    <div style={{
      display: 'flex',
      width: '100%',
      height: '100%'
    }}>
      <SideBarAdminEM />
      <div style={{
        flexGrow: 1,
        overflowY: 'auto',
        maxWidth: '100%'  // Ajustar com base na largura do SideBarAdmin
      }}>
        <Outlet />
      </div>
    </div>
  );
}

export default AdminLayoutEM;
