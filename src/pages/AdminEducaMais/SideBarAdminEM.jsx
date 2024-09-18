import { Link, useNavigate } from 'react-router-dom';
import { Avatar, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography, Box, Tooltip } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import AddHomeWorkIcon from '@mui/icons-material/AddHomeWork';
import LogoutIcon from '@mui/icons-material/Logout';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import DashboardIcon from '@mui/icons-material/Dashboard';
import { db, auth } from '../../firebase/firebase.js';
import { doc, onSnapshot } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import React, { useEffect, useState, useContext } from 'react';
import UserContext from '../../contexts/UserContext.jsx';

function SideBarAdminEM() {
  const [user, setUser] = useState(null);
  const { globalUid } = useContext(UserContext);
  const navigate = useNavigate();

  const roleNames = {
    admin: 'Administrador',
  };

  useEffect(() => {
    if (globalUid) {
      const userRef = doc(db, 'users', globalUid);
      const unsub = onSnapshot(userRef, (doc) => {
        if (doc.exists()) {
          setUser({ id: doc.id, ...doc.data() });
        } else {
          console.error('Não há esse usuário!');
        }
      }, (error) => {
        console.error('Erro ao buscar o usuário:', error);
      });

      return () => unsub();
    }
  }, [globalUid]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Erro durante o Logout:', error);
    }
  };

  const formatUserName = (name) => {
    const nameParts = name.split(' ');
    const firstName = nameParts[0];
    return `${firstName}`;
  };

  if (!user) {
    return (
      <Drawer
        variant="permanent"
        sx={{
          width: 240,
          '& .MuiDrawer-paper': {
            width: 240,
            boxSizing: 'border-box',
            position: 'relative',
            height: '100%',
            backgroundImage: 'linear-gradient(135deg, #203A43, #2C5364)',
            color: '#fff',
          },
        }}
      >
        <List>
          <ListItem disablePadding>
            <ListItemButton>
              <ListItemText primary="Carregando usuário..." />
            </ListItemButton>
          </ListItem>
        </List>
      </Drawer>
    );
  }

  const userRoleDisplayName = roleNames[user.role] || user.role;

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 240,
        '& .MuiDrawer-paper': {
          width: 240,
          boxSizing: 'border-box',
          position: 'relative',
          height: '100%',
          backgroundImage: 'linear-gradient(135deg, #203A43, #2C5364)',
          color: '#ffffff',
        },
      }}
    >
      <List sx={{ flex: 1, padding: 0 }}>
        <ListItem
          sx={{
            padding: 3,
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Avatar sx={{ width: 60, height: 60, bgcolor: 'secondary.main' }}>
            {user.name[0]}
          </Avatar>
          <Typography variant="h6" sx={{ mt: 1 }}>
            {formatUserName(user.name)}
          </Typography>
          <Typography variant="caption" sx={{ mt: 1 }}>
            {userRoleDisplayName}
          </Typography>
        </ListItem>

        <Tooltip title="Página Inicial" placement="right" sx={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <ListItem disablePadding>
            <ListItemButton component={Link} to="/AdminEM">
              <ListItemIcon sx={{ color: '#FFFAFA' }}>
                <HomeIcon />
              </ListItemIcon>
              <ListItemText primary="Home" sx={{ color: '#FFFAFA' }} />
            </ListItemButton>
          </ListItem>
        </Tooltip>

        <Tooltip title="Criar Escola" placement="right">
          <ListItem disablePadding>
            <ListItemButton component={Link} to="/AdminEM/create-school">
              <ListItemIcon sx={{ color: '#FFFAFA' }}>
                <AddHomeWorkIcon />
              </ListItemIcon>
              <ListItemText primary="Criar Escola" sx={{ color: '#FFFAFA' }} />
            </ListItemButton>
          </ListItem>
        </Tooltip>

        <Tooltip title="Escolas" placement="right">
          <ListItem disablePadding>
            <ListItemButton component={Link} to="/AdminEM/list-school">
              <ListItemIcon sx={{ color: '#FFFAFA' }}>
                <HomeWorkIcon />
              </ListItemIcon>
              <ListItemText primary="Escolas" sx={{ color: '#FFFAFA' }} />
            </ListItemButton>
          </ListItem>
        </Tooltip>

        <Tooltip title="Dashboard" placement="right">
          <ListItem disablePadding>
            <ListItemButton component={Link} to="/AdminEM/dashboard">
              <ListItemIcon sx={{ color: '#FFFAFA' }}>
                <DashboardIcon />
              </ListItemIcon>
              <ListItemText primary="Dashboard" sx={{ color: '#FFFAFA' }} />
            </ListItemButton>
          </ListItem>
        </Tooltip>
      </List>

      <Box sx={{ p: 1, borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
        <ListItemButton onClick={handleLogout}>
          <ListItemIcon sx={{ color: '#FFFAFA' }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Sair" sx={{ color: '#FFFAFA' }} />
        </ListItemButton>
      </Box>
    </Drawer>
  );
}

export default SideBarAdminEM;
