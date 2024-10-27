import React, { useState, useEffect, useContext } from 'react';
import { db } from '../../firebase/firebase.js';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { Container, Typography, Paper, Grid, Divider, Avatar, Box, Tooltip } from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import { amber, grey, deepPurple } from '@mui/material/colors';
import UserContext from '../../contexts/UserContext.jsx';

const LeaderboardProfessor = () => {
  const { globalUid } = useContext(UserContext);
  const [schoolSubject, setSchoolSubject] = useState('');
  const [schoolId, setSchoolId] = useState('');
  const [leaderboardData, setLeaderboardData] = useState([]);

  const formatUserName = (name) => {
    const nameParts = name.split(' ');
    if (nameParts.length > 1) {
      return `${nameParts[0]} ${nameParts[1]}`;
    }
    return nameParts[0];
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

      const studentQuery = query(
        collection(db, 'users'), 
        where('schoolId', '==', schoolId), 
        where('role', '==', 'student')
      );
      const studentSnapshot = await getDocs(studentQuery);
      const studentList = studentSnapshot.docs.map(doc => ({ 
        id: doc.id, 
        name: doc.data().name, 
        points: 0 
      }));

      for (let student of studentList) {
        const responsesRef = collection(
          db, 
          `user${schoolSubject.charAt(0).toUpperCase() + schoolSubject.slice(1)}Responses`
        );
        const responsesQuery = query(
          responsesRef, 
          where('userId', '==', student.id), 
          where('schoolSubject', '==', schoolSubject)
        );
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

      studentList.sort((a, b) => b.points - a.points || a.name.localeCompare(b.name));
      setLeaderboardData(studentList);
    };

    fetchLeaderboardData();
  }, [schoolId, schoolSubject]);

  const renderList = () => (
    <Grid container spacing={2 } sx={{ margin: 'auto', width: '60%' }}>
      {leaderboardData.map((user, index) => (
        <Grid item xs={12} key={user.id} sx={{ width: '100%', margin: 'auto' }}>
          <Paper
            elevation={3}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 24px',
              borderRadius: '12px',
              background: index === 0 ? amber[100] : grey[100],
              transition: '0.3s',
              '&:hover': {
                transform: 'scale(1.02)',
                boxShadow: '0px 12px 24px rgba(0, 0, 0, 0.15)',
              },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar 
                sx={{ 
                  bgcolor: index === 0 ? amber[700] : deepPurple[500], 
                  marginRight: 2 
                }}
              >
                {user.name.charAt(0).toUpperCase()}
              </Avatar>
              <Typography variant="h6" sx={{ fontWeight: 40, fontSize: 20 }}>
                {`${index + 1}. ${formatUserName(user.name)}`}
              </Typography>
              {index === 0 && (
                <Tooltip title="Primeiro lugar!" arrow>
                  <EmojiEventsIcon sx={{ color: amber[700], ml: 1 }} />
                </Tooltip>
              )}
            </Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 'bold',
                color: grey[800],
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
