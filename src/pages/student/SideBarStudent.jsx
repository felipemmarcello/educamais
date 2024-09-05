import { Link, useNavigate } from 'react-router-dom';
import { Avatar, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography, Box, LinearProgress } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import LogoutIcon from '@mui/icons-material/Logout';
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
        display: 'flex',
        flexDirection: 'column',
        '& .MuiDrawer-paper': {
          width: 240,
          boxSizing: 'border-box',
          position: 'relative',
          height: '100%',
          borderColor: 'black',
        },
      }}
    >
      <List sx={{ flex: 1, padding: 0, backgroundColor: '#5589c4' }}>
        <ListItem sx={{ backgroundColor: '#5589c4', padding: 3, borderBottom: '1px solid #dedede', borderColor: 'black'}}>
          <Avatar sx={{ width: 60, height: 60, bgcolor: 'secondary.main', marginRight: 2 }}>{user.name[0]}</Avatar>
          <ListItemText 
            primary={
              <Typography  variant="h6" style={{ whiteSpace: 'normal', wordBreak: 'break-word', color: '#FFFAFA' }}>
                {formatUserName(user.name)}
              </Typography>
            } 
            secondary={
              <Typography variant="caption" style={{ whiteSpace: 'normal', wordBreak: 'break-word', color: '#FFFAFA' }}>
                {userRoleDisplayName}
              </Typography>
            } 
          />
          
        </ListItem>

        <ListItem sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', borderBottom: '1px solid #dedede', borderColor: 'black', backgroundColor: '#5589c4'}}>
          
          <Typography variant="body2" sx={{ color: '#FFFAFA', marginBottom: 1.8, marginTop: 1 }}>
            Pontos: {user.points || 0}
          </Typography>

          <Typography variant="body2" sx={{ color: '#FFFAFA'}}>
            Nível {user.level || 1}
          </Typography>

          <Box sx={{ width: '100%', marginTop: 1, marginBottom: 1 }}>
            <LinearProgress
              variant="determinate"
              value={calculateProgress(user.exp)}
              sx={{
                backgroundColor: '#cccccc',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: '#FFFAFA',
                },
              }}
            />
            <Typography variant="caption" sx={{ color: '#FFFAFA', textAlign: 'center', display: 'block' }}>
              {user.exp} / {levelRequirements[user.level + 1] || levelRequirements[10]} EXP
            </Typography>
          </Box>
        </ListItem>

        <ListItem disablePadding sx={{p: 0.5, paddingTop: '5%'}}>
          <ListItemButton component={Link} to="/student">
            <ListItemIcon sx={{ color: '#FFFAFA'}}>
              <HomeIcon />
            </ListItemIcon>
            <ListItemText primary="Home" sx={{ color: '#FFFAFA'}} />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding sx={{p: 0.5}}>
          <ListItemButton component={Link} to="/student/subjects">
            <ListItemIcon sx={{ color: '#FFFAFA'}}>
              <MenuBookIcon />
            </ListItemIcon>
            <ListItemText primary="Matérias" sx={{ color: '#FFFAFA'}} />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding sx={{p: 0.5}}>
          <ListItemButton component={Link} to="/student/dashboard">
            <ListItemIcon sx={{ color: '#FFFAFA'}}>
              <MenuBookIcon />
            </ListItemIcon>
            <ListItemText primary="Dashboard" sx={{ color: '#FFFAFA'}} />
          </ListItemButton>
        </ListItem>

      </List>

      <Box sx={{ p: 1, borderTop: '1px solid #dedede', backgroundColor: '#336ca5', borderColor: 'black' }}>
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
