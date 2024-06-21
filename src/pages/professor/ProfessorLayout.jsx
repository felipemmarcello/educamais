import React from 'react';
import { Outlet } from 'react-router-dom';
import SideBarProfessor from './SideBarProfessor.jsx';

function ProfessorLayout() {
  return (
    <div style={{
      display: 'flex',
      width: '100%',
      height: '100%',
      backgroundColor: ''
    }}>
      <SideBarProfessor />
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

export default ProfessorLayout;
