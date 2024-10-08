import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Grid, Typography, Box, Card, CardContent, CardActionArea } from '@mui/material';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebase.js';
import UserContext from '../../contexts/UserContext.jsx';
import books from '../../images/books.png';
import portugueseIcon from '../../images/portugueseIcon.png';
import mathematicsIcon from '../../images/mathematicsIcon.png';
import scienceIcon from '../../images/scienceIcon.png';
import geographyIcon from '../../images/geographyIcon.png';
import historyIcon from '../../images/historyIcon.png';
import artIcon from '../../images/artIcon.png';
import englishIcon from '../../images/englishIcon.png';
import physicalEducationIcon from '../../images/physicalEducationIcon.png';
import religionIcon from '../../images/religionIcon.png';

const SubjectsPageProfessor = () => {
  const navigate = useNavigate();
  const { globalUid } = useContext(UserContext);
  const [userSchoolSubject, setUserSchoolSubject] = useState(''); // Alterado para schoolSubject
  const [schoolId, setSchoolId] = useState('');

  useEffect(() => {
    const fetchAdminMasterDetails = async () => {
      const userDoc = await getDoc(doc(db, 'users', globalUid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setSchoolId(userData.schoolId);
        setUserSchoolSubject(userData.schoolSubject); // Usando schoolSubject
      }
    };

    fetchAdminMasterDetails();
  }, [globalUid]);

  const handleNavigation = (subject) => {
    navigate(`/professor/subjects/${subject}`);
  };

  const subjectDetails = {
    portuguese: { name: 'Língua Portuguesa', icon: portugueseIcon },
    mathematics: { name: 'Matemática', icon: mathematicsIcon },
    science: { name: 'Ciências', icon: scienceIcon },
    geography: { name: 'Geografia', icon: geographyIcon },
    history: { name: 'História', icon: historyIcon },
    art: { name: 'Arte', icon: artIcon },
    english: { name: 'Língua Inglesa', icon: englishIcon },
    physicalEducation: { name: 'Educação Física', icon: physicalEducationIcon },
    religion: { name: 'Ensino Religioso', icon: religionIcon },
  };

  return (
    <Container>
      <Box 
        sx={{
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          marginTop: '5%', 
          marginBottom: '3%',
        }}
      >
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100px',
          backgroundColor: '#fff',
          position: 'relative',
          overflow: 'visible',
          width: '500px',  
        }}>
          <Typography variant='h1'>Matérias</Typography>
        </Box>

        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'visible',
          marginLeft: '5%',
        }}>
          <img src={books} alt="books" style={{ width: '150px' }} />
        </Box>
      </Box>

      <Grid 
        container 
        spacing={3} 
        sx={{
            marginTop: '10%',
            marginLeft: 'auto',
            marginRight: 'auto',
            width: '80%',  
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
        }}
      >
        {Object.keys(subjectDetails)
          .filter(subject => subject === userSchoolSubject) // Filtra apenas o schoolSubject do professor
          .map((subject, index) => (
            <Grid item xs={12} sm={6} md={4} lg={4} key={index} onClick={() => handleNavigation(subject)}>
              <Card 
                sx={{ 
                  cursor: 'pointer', 
                  transition: 'transform 0.2s', 
                  '&:hover': { 
                    transform: 'scale(1.05)', 
                    boxShadow: '0 8px 16px rgba(0,0,0,0.3)' 
                  },
                  borderRadius: '15px',
                }}
              >
                <CardActionArea>
                  <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                    <img src={subjectDetails[subject].icon} alt={`${subject} icon`} style={{ width: '50px', marginBottom: '10px' }} />
                    <Typography variant="h6" component="div" sx={{ textAlign: 'center' }}>
                      {subjectDetails[subject].name}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
      </Grid>
    </Container>
  );
};

export default SubjectsPageProfessor;
