import React, { useState, useEffect, useContext } from 'react';
import { Container, Typography, Box, Grid, Paper, Divider, IconButton } from '@mui/material';
import { People as PeopleIcon } from '@mui/icons-material';
import { db } from '../../firebase/firebase.js';
import { collection, getDocs, getDoc, doc, query, where } from 'firebase/firestore';
import UserContext from '../../contexts/UserContext.jsx';

const DashboardAdmin = () => {
  const { globalUid } = useContext(UserContext);
  const [schoolId, setSchoolId] = useState('');
  const [userCount, setUserCount] = useState(0);

  useEffect(() => {
    const fetchUserData = async () => {
      const userDoc = await getDoc(doc(db, 'users', globalUid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setSchoolId(userData.schoolId);
      }
    };

    fetchUserData();
  }, [globalUid]);

  useEffect(() => {
    const fetchUserCount = async () => {
      if (schoolId) {
        const usersSnapshot = await getDocs(
          query(
            collection(db, 'users'),
            where('schoolId', '==', schoolId)
          )
        );

        const filteredUsers = usersSnapshot.docs.filter((doc) => doc.data().role !== 'adminMaster');
        setUserCount(filteredUsers.length);
      }
    };

    fetchUserCount();
  }, [schoolId]);

  return (
    <Container>
      <Box sx={{ mb: 4 }}>
        <div style={{ display: 'flex', paddingTop: '5%', paddingLeft: '12%' }}>
          <Typography variant="h3" sx={{ mb: 2 }}>
            Dashboard
          </Typography>
        </div>

        <Divider sx={{ width: '80%', margin: 'auto', height: '50%' }} />

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1, paddingTop: '3.5%', paddingBottom: '1.5%' }}>
          <Typography variant="h4" gutterBottom style={{ marginRight: '14px' }}>
            Título do Dashboard
          </Typography>
        </Box>

        <Grid container spacing={4} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Grid item>
            <Paper 
              elevation={2} 
              sx={{
                p: 3, 
                minHeight: '100px', 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'center',
                position: 'relative',
                textAlign: 'center',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <IconButton
                  sx={{
                    backgroundColor: '#e0f7fa',
                    borderRadius: '50%',
                    width: 56,
                    height: 56,
                  }}
                >
                  <PeopleIcon sx={{ color: '#00796b', fontSize: '28px' }} />
                </IconButton>
                <Typography sx={{ marginLeft: '13px', fontFamily: 'Arial', fontSize: 20}}>
                  Usuários
                </Typography>
              </Box>
              <Typography variant="h3" sx={{ fontFamily: 'Arial', fontWeight: 'bold'}}>
                {userCount}
              </Typography>
            </Paper>
          </Grid>

          <Grid item>
            <Paper elevation={2} sx={{ p: 2, minHeight: '100px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              {/* Outro conteúdo */}
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default DashboardAdmin;
