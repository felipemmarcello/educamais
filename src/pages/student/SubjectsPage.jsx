import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Grid, Typography, Box, Card, CardContent, CardActionArea } from '@mui/material';
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

const SubjectsPage = () => {
  const navigate = useNavigate();

  const handleNavigation = (subject) => {
    navigate(`/student/subjects/${subject}`);
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
          marginTop: '3.5%', 
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
            marginTop: '2%',
            marginLeft: 'auto',
            marginRight: 'auto',
            width: '80%',  
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
        }}
      >
        {Object.keys(subjectDetails).map((subject, index) => (
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

export default SubjectsPage;
