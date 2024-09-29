import React, { useState, useEffect, useContext } from 'react';
import { db } from '../../firebase/firebase.js';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { Container, Typography, Paper, Grid, Divider, Avatar, Box } from '@mui/material';
import UserContext from '../../contexts/UserContext.jsx';

const LeaderboardProfessor = () => {
  const { globalUid } = useContext(UserContext);
  const [schoolSubject, setSchoolSubject] = useState('');
  const [schoolId, setSchoolId] = useState('');
  const [leaderboardData, setLeaderboardData] = useState([]);

  // Função que extrai o primeiro nome e o sobrenome seguinte
  const formatUserName = (name) => {
    const nameParts = name.split(' ');
    if (nameParts.length > 1) {
      return `${nameParts[0]} ${nameParts[1]}`; // Exibe apenas o primeiro nome e o segundo nome
    }
    return nameParts[0]; // Se não houver sobrenome, exibe apenas o primeiro nome
  };

  useEffect(() => {
    const fetchUserData = async () => {
      const userDoc = await getDoc(doc(db, 'users', globalUid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setSchoolId(userData.schoolId);
        setSchoolSubject(userData.schoolSubject);
      }
    };
    fetchUserData();
  }, [globalUid]);

  useEffect(() => {
    const fetchLeaderboardData = async () => {
      if (!schoolId || !schoolSubject) return;

      const studentQuery = query(collection(db, 'users'), where('schoolId', '==', schoolId), where('role', '==', 'student'));
      const studentSnapshot = await getDocs(studentQuery);
      const studentList = studentSnapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name, points: 0 }));

      for (let student of studentList) {
        const responsesRef = collection(db, `user${schoolSubject.charAt(0).toUpperCase() + schoolSubject.slice(1)}Responses`);
        const responsesQuery = query(responsesRef, where('userId', '==', student.id), where('schoolSubject', '==', schoolSubject));
        const responsesSnapshot = await getDocs(responsesQuery);

        let totalPoints = 0;
        responsesSnapshot.docs.forEach(doc => {
          const data = doc.data();
          if (data.points) {
            totalPoints += data.points;
          }
        });

        student.points = totalPoints;
      }

      studentList.sort((a, b) => {
        if (b.points === a.points) {
          return a.name.localeCompare(b.name); 
        }
        return b.points - a.points;
      });

      setLeaderboardData(studentList);
    };

    fetchLeaderboardData();
  }, [schoolId, schoolSubject]);

  const renderList = () => (
    <Grid container spacing={2} sx={{ margin: 'auto', width: '80%' }}>
      {leaderboardData.map((user, index) => (
        <Grid item xs={7} key={user.id} sx={{ width: '100%', margin: 'auto' }}>
          <Paper
            elevation={3}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 20px',
              borderRadius: '8px',
              transition: '0.3s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.2)',
              },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: '#1976d2', marginRight: 2 }}>{user.name.charAt(0).toUpperCase()}</Avatar>
              <Typography variant="body1" sx={{ fontSize: 18, fontWeight: 500 }}>
                {`${index + 1}. ${formatUserName(user.name)}`} {/* Função aplicada aqui */}
              </Typography>
            </Box>
            <Typography
              variant="body2"
              sx={{
                fontSize: 16,
                fontWeight: 'bold',
                color: '#000000',
                padding: '6px 12px',
                borderRadius: '16px',
              }}
            >
              {`Pontos: ${user.points}`}
            </Typography>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );

  return (
    <div>
      <div style={{ display: 'flex', paddingTop: '5%', paddingLeft: '12%' }}>
        <Typography variant="h3" sx={{ mb: 2 }}>
          Classificação
        </Typography>
      </div>
      <Divider sx={{ width: '80%', margin: 'auto', height: '50%', marginBottom: '4%' }} />

      {renderList()}
    </div>
  );
};

export default LeaderboardProfessor;
