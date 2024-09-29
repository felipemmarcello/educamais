import React, { useState, useEffect, useContext } from 'react';
import { db } from '../../../firebase/firebase.js';
import { collection, getDocs, query, where, getDoc, doc } from 'firebase/firestore';
import { Container, Typography, Box, Grid, Paper, Divider } from '@mui/material';
import UserContext from '../../../contexts/UserContext.jsx';
import medalouro from '../../../images/medalouro.png';
import medalprata from '../../../images/medalprata.png';
import medalbronze from '../../../images/medalbronze.png';

const Leaderboard = () => {
  const { globalUid } = useContext(UserContext);
  const [schoolYear, setSchoolYear] = useState('');
  const [schoolId, setSchoolId] = useState('');
  const [leaderboardData, setLeaderboardData] = useState([]);

  useEffect(() => {
    const fetchUserData = async () => {
      const userDoc = await getDoc(doc(db, 'users', globalUid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setSchoolYear(userData.schoolYear);
        setSchoolId(userData.schoolId);
      }
    };

    fetchUserData();
  }, [globalUid]);

  useEffect(() => {
    const fetchLeaderboardData = async () => {
      if (!schoolId || !schoolYear) return;

      const usersQuery = query(
        collection(db, 'users'),
        where('schoolId', '==', schoolId),
        where('schoolYear', '==', schoolYear)
      );

      const usersSnapshot = await getDocs(usersQuery);
      const usersList = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        points: doc.data().points ? Number(doc.data().points) : 0,
      }));

      const sortedUsers = usersList.sort((a, b) => b.points - a.points);

      setLeaderboardData(sortedUsers);
    };

    fetchLeaderboardData();
  }, [schoolId, schoolYear]);

  const formatName = (fullName) => {
    const nameParts = fullName.split(' ');
    const firstName = nameParts[0];
    const lastNameInitial = nameParts.length > 1 ? `${nameParts[1][0]}.` : '';
    return `${firstName} ${lastNameInitial}`;
  };

  const medalImages = [medalouro, medalprata, medalbronze];
  const borderColors = ['#FFD700', '#C0C0C0', '#CD7F32']; // Cores das bordas para ouro, prata e bronze

  return (
    <Container maxWidth="lg" sx={{ paddingTop: '2%', paddingBottom: '3%' }}>
        <Box>
        <div style={{ display: 'flex', paddingTop: '2.4%', paddingLeft: '12%' }}>
            <Typography variant="h3" sx={{ mb: 2 }}>
            Classificação
            </Typography>
        </div>
      <Divider sx={{ width: '80%', margin: 'auto', height: '50%', marginBottom: '4%' }} />

          <Grid container spacing={3} justifyContent="center">
            {leaderboardData.slice(0, 3).map((user, index) => (
              <Grid item key={user.id} xs={12} sm={4} md={3}>
                <Paper
                  elevation={5}
                  sx={{
                    padding: 3,
                    textAlign: 'center',
                    borderRadius: '16px',
                    border: `4px solid ${borderColors[index]}`, // Define as bordas com as cores das medalhas
                    backgroundColor: 'white',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.05)',
                      boxShadow: '0px 8px 30px rgba(0, 0, 0, 0.15)',
                    },
                  }}
                >
                  <img
                    src={medalImages[index]}
                    alt={`Medalha ${index + 1}`}
                    style={{
                      width: 90,
                      height: 140,
                      margin: 'auto',
                      display: 'block',
                    }}
                  />
                  <Typography variant="h6" mt={2} sx={{ fontWeight: '600', color: '#333' }}>
                    {formatName(user.name || `Player ${index + 1}`)}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ marginTop: '0.5rem', color: '#555' }}>
                    Pontos: {user.points}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ marginTop: '0.5rem', color: '#555' }}>
                    {index + 1}º Lugar
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>

          <Grid container spacing={2} sx={{ mt: 4 }}>
            {leaderboardData.slice(3).map((user, index) => (
              <Grid item key={user.id} xs={12} sm={6} md={3}>
                <Paper
                  elevation={2}
                  sx={{
                    p: 2,
                    textAlign: 'center',
                    borderRadius: '6px',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    '&:hover': {
                      transform: 'scale(1.02)',
                      boxShadow: '0px 6px 20px rgba(0, 0, 0, 0.1)',
                    },
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: '500', color: '#333' }}>
                    {index + 4}. {formatName(user.name || `Player ${index + 4}`)}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ marginTop: '0.5rem', color: '#777' }}>
                    Pontos: {user.points}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
    </Container>
  );
};

export default Leaderboard;
