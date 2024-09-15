import React, { useState, useEffect, useContext } from 'react';
import { db } from '../../firebase/firebase.js';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { Container, Typography, Paper, Grid, Divider } from '@mui/material';
import UserContext from '../../contexts/UserContext.jsx';

const LeaderboardProfessor = () => {
  const { globalUid } = useContext(UserContext);
  const [schoolSubject, setSchoolSubject] = useState('');
  const [schoolId, setSchoolId] = useState('');
  const [leaderboardData, setLeaderboardData] = useState([]);

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
        const responsesRef = collection(db, 'userReligionResponses');
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

      // Sort the students by points in descending order and by name if points are equal
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

  return (
    <div>
        <div style={{ display: 'flex', paddingTop: '5%', paddingLeft: '12%' }}>
            <Typography variant="h3" sx={{ mb: 2 }}>
            Classificação
            </Typography>
        </div>
      <Divider sx={{ width: '80%', margin: 'auto', height: '50%', marginBottom: '4%' }} />
      <Grid container spacing={2} sx= {{margin: 'auto', width: '80%'}}>
        {leaderboardData.map((user, index) => (
          <Grid item xs={12} sm={6} key={user.id}>
            <Paper elevation={3} sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="body1">{`${index + 1}. ${user.name}`}</Typography>
              <Typography variant="body1">{`Pontos: ${user.points}`}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </div>
  );
};

export default LeaderboardProfessor;
