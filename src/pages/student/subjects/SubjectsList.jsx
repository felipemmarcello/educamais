import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { db } from '../../../firebase/firebase.js';
import { collection, getDocs } from 'firebase/firestore';
import { Container, Grid, Card, CardContent, Typography } from '@mui/material';

const SubjectList = () => {
  const { subjectId } = useParams();
  const [subjects, setSubjects] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSubjects = async () => {
      const querySnapshot = await getDocs(collection(db, `${subjectId}Questions`));
      let fetchedSubjects = new Set();
      let subjectsWithFantasyNames = {};
      querySnapshot.docs.forEach((doc) => {
        const data = doc.data();
        fetchedSubjects.add(data.subject);
        subjectsWithFantasyNames[data.subject] = data.fantasyName || data.subject;
      });
      setSubjects(Array.from(fetchedSubjects).map(subject => ({ subject, fantasyName: subjectsWithFantasyNames[subject] })));
    };

    fetchSubjects();
  }, [subjectId]);

  const handleNavigation = (subject) => {
    navigate(`/student/subjects/${subjectId}/${subject}`);
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom sx={{ textAlign: 'center', marginTop: '2%' }}>
        {subjectId === 'portuguese' ? 'Língua Portuguesa' : subjectId.charAt(0).toUpperCase() + subjectId.slice(1)}
      </Typography>
      <Grid container spacing={3} justifyContent="center">
        {subjects.map((item, index) => (
          <Grid item xs={4} key={index} onClick={() => handleNavigation(item.subject)}>
            <Card sx={{ cursor: 'pointer' }}>
              <CardContent>
                <Typography variant="h6" component="div" sx={{ textAlign: 'center' }}>
                  {item.fantasyName}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default SubjectList;
