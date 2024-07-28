import { Link, useNavigate } from 'react-router-dom';
import { Avatar, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography, Box } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import LogoutIcon from '@mui/icons-material/Logout';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
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
        },
      }}
    >
      <List sx={{ flex: 1, padding: 0, backgroundColor: '#5589c4' }}>
      <ListItem sx={{ backgroundColor: '#5589c4', borderBottom: '1px solid #dedede', padding: 3, borderColor: 'black' }}>
          <Avatar sx={{ width: 60, height: 60, bgcolor: 'secondary.main', marginRight: 2 }}>{user.name[0]}</Avatar>
          <ListItemText 
            primary={
              <Typography variant="h6" style={{ whiteSpace: 'normal', wordBreak: 'break-word', color: '#FFFAFA' }}>
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

        <ListItem disablePadding sx={{p: 0.5, paddingTop: '5%'}}>
          <ListItemButton component={Link} to="/AdminEM">
            <ListItemIcon sx={{ color: '#FFFAFA'}}>
              <HomeIcon />
            </ListItemIcon>
            <ListItemText primary="Home" sx={{ color: '#FFFAFA'}} />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding sx={{p: 0.5}}>
          <ListItemButton component={Link} to="/AdminEM/create-school">
            <ListItemIcon sx={{ color: '#FFFAFA'}}>
              <PersonAddAlt1Icon />
            </ListItemIcon>
            <ListItemText primary="Criar Escola" sx={{ color: '#FFFAFA'}} />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding sx={{p: 0.5}}>
          <ListItemButton component={Link} to="/AdminEM/list-school">
            <ListItemIcon sx={{ color: '#FFFAFA'}}>
              <PeopleAltIcon />
            </ListItemIcon>
            <ListItemText primary="Escolas" sx={{ color: '#FFFAFA'}}/>
          </ListItemButton>
        </ListItem>

      </List>

      <Box sx={{ p: 1, borderTop: '1px solid #dedede', backgroundColor: '#336ca5', borderColor: 'black' }}>
        <ListItemButton onClick={handleLogout}>
          <ListItemIcon sx={{ color: '#FFFAFA'}}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Sair" sx={{ color: '#FFFAFA'}} />
        </ListItemButton>
      </Box>
    </Drawer>
  );
}

export default SideBarAdminEM;
