import React from 'react';
import { Outlet } from 'react-router-dom';
import SideBarStudent from './SideBarStudent.jsx';

function StudentLayout() {
  return (
    <div style={{
      display: 'flex',
      width: '100%',
      height: '100%',
      backgroundColor: ''
    }}>
      <SideBarStudent />
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

export default StudentLayout;
