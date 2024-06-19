import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Grid, Typography, Box, Card, CardContent } from '@mui/material';
import bookSchool from '../../images/bookSchool.png';

const Subjects = () => {
  const navigate = useNavigate();

  const handleNavigation = (subject) => {
    navigate(`/student/subjects/${subject}`);
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
          marginLeft: '10%',
        }}>
          <img src={bookSchool} alt="bookSchool" style={{ width: '150px' }} />
        </Box>
      </Box>

      <Grid 
        container 
        spacing={3} 
        sx={{
            marginTop: '8%',
            marginLeft: 'auto',
            marginRight: 'auto',
            width: '80%',  
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
        }}
      >
        {[
          { subject: 'portuguese', name: 'Língua Portuguesa' },
          { subject: 'mathematics', name: 'Matemática' },
          { subject: 'science', name: 'Ciências' },
          { subject: 'geography', name: 'Geografia' },
          { subject: 'history', name: 'História' },
          { subject: 'art', name: 'Arte' },
          { subject: 'english', name: 'Língua Inglesa' },
        ].map((item, index) => (

          <Grid item xs={4} key={index} onClick={() => handleNavigation(item.subject)}>
            <Card sx={{ cursor: 'pointer' }}>
              <CardContent>
                <Typography variant="h6" component="div" sx={{ textAlign: 'center' }}>
                  {item.name}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Subjects;
