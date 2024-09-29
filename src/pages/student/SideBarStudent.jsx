import { Link, useNavigate } from 'react-router-dom';
import { Avatar, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography, Box, LinearProgress, Tooltip } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import LogoutIcon from '@mui/icons-material/Logout';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import { db, auth } from '../../firebase/firebase.js';
import { doc, onSnapshot } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import React, { useEffect, useState, useContext } from 'react';
import UserContext from '../../contexts/UserContext.jsx';

const levelRequirements = {
  1: 0,
  2: 300,
  3: 600,
  4: 900,
  5: 1200,
  6: 1800,
  7: 2600,
  8: 3200,
  9: 3800,
  10: 5000,
  11: 6200,
  12: 7400,
  13: 9000,
  14: 10600,
  15: 12000
};

function SideBarStudent() {
  const [user, setUser] = useState(null);
  const { globalUid } = useContext(UserContext);
  const navigate = useNavigate();

  const roleNames = {
    student: 'Estudante',
  };

  useEffect(() => {
    if (globalUid) {
      const userRef = doc(db, 'users', globalUid);
      const unsub = onSnapshot(userRef, (doc) => {
        if (doc.exists()) {
          setUser({ id: doc.id, ...doc.data() });
        } else {
          console.error("Não há esse usuário!");
        }
      }, (error) => {
        console.error("Erro ao buscar o usuário:", error);
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

  const calculateProgress = (exp) => {
    const level = user.level || 1;
    const currentExp = exp || 0;
    const maxExp = levelRequirements[level + 1] || levelRequirements[10];
    const minExp = levelRequirements[level] || 0;
    return ((currentExp - minExp) / (maxExp - minExp)) * 100;
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
          <Avatar sx={{ width: 60, height: 60, bgcolor: 'secondary.main' }}>{user.name[0]}</Avatar>
          <Typography variant="h6" sx={{ mt: 1 }}>
            {formatUserName(user.name)}
          </Typography>
          <Typography variant="caption">
            {`${user.schoolYear || 'Ano'}º ${user.classRoom || 'Turma'}`}
          </Typography>
          <Typography variant="caption" sx={{ mt: 1 }}>
            {userRoleDisplayName}
          </Typography>
        </ListItem>

        <ListItem sx={{ textAlign: 'center', py: 2, flexDirection: 'column' }}>
          <Typography variant="body2" sx={{ color: '#FFFAFA', mb: 1 }}>
            Pontos: {user.points || 0}
          </Typography>
          <Typography variant="body2" sx={{ color: '#FFFAFA'}}>
            Nível {user.level || 1}
          </Typography>
          <Box sx={{ width: '100%', px: 2, mt: 2 }}>
            <Tooltip placement="top">
              <LinearProgress
                variant="determinate"
                value={calculateProgress(user.exp)}
                sx={{
                  backgroundColor: '#666',
                  borderRadius: '10px',
                  height: '10px',
                  '& .MuiLinearProgress-bar': {
                    background: 'linear-gradient(90deg, #FF6347, #FFD700)',
                    borderRadius: '10px',
                    transition: 'width 0.4s ease',
                  },
                }}
              />
            </Tooltip>
            <Typography variant="caption" sx={{ mt: 1, display: 'block', color: '#FFFAFA' }}>
              {user.exp} / {levelRequirements[user.level + 1] || levelRequirements[10]} EXP
            </Typography>
          </Box>
        </ListItem>

        <Tooltip title="Página Inicial" placement="right" sx={{borderTop: '1px solid rgba(255, 255, 255, 0.1)'}}>
          <ListItem disablePadding>
            <ListItemButton component={Link} to="/student">
              <ListItemIcon sx={{ color: '#FFFAFA' }}>
                <HomeIcon />
              </ListItemIcon>
              <ListItemText primary="Home" sx={{ color: '#FFFAFA' }} />
            </ListItemButton>
          </ListItem>
        </Tooltip>

        <Tooltip title="Matérias" placement="right">
          <ListItem disablePadding>
            <ListItemButton component={Link} to="/student/subjects">
              <ListItemIcon sx={{ color: '#FFFAFA' }}>
                <MenuBookIcon />
              </ListItemIcon>
              <ListItemText primary="Matérias" sx={{ color: '#FFFAFA' }} />
            </ListItemButton>
          </ListItem>
        </Tooltip>

        <Tooltip title="Classificação" placement="right">
          <ListItem disablePadding>
            <ListItemButton component={Link} to="/student/leaderboard">
              <ListItemIcon sx={{ color: '#FFFAFA' }}>
                <LeaderboardIcon />
              </ListItemIcon>
              <ListItemText primary="Classificação" sx={{ color: '#FFFAFA' }} />
            </ListItemButton>
          </ListItem>
        </Tooltip>

        <Tooltip title="Dashboard" placement="right">
          <ListItem disablePadding>
            <ListItemButton component={Link} to="/student/dashboard">
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

export default SideBarStudent;
