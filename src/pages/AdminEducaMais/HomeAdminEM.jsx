import React, { useEffect, useState, useContext } from 'react';
import { Box, Typography, Container, Paper, Divider, Grid } from '@mui/material';
import UserContext from '../../contexts/UserContext.jsx';
import { db } from '../../firebase/firebase.js';
import { doc, onSnapshot } from 'firebase/firestore';
import exemploGrafico from '../../images/exemplografico.png';
import exemploGrafico2 from '../../images/exemplografico2.png';

function HomeAdminEM() {
  const [user, setUser] = useState(null);
  const { globalUid } = useContext(UserContext);

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

  return (
    <Container maxWidth="lg" sx={{ paddingTop: '4%' }}>
      <Paper elevation={0} sx={{ padding: '2rem' }}>
        <Typography variant="h4" gutterBottom textAlign="center">
          Bem-vindo(a), {user ? user.name : "Carregando..."}
        </Typography>
        
        <Divider sx={{ marginY: 5 }} />

        <Typography variant="body1" paragraph>
          Como administrador, você pode:
        </Typography>

        <ul>
          <li><Typography variant="body1">Criar novos usuários e definir seus papéis.</Typography></li>
          <li><Typography variant="body1">Editar informações dos usuários existentes.</Typography></li>
          <li><Typography variant="body1">Excluir usuários que não fazem mais parte da instituição.</Typography></li>
        </ul>
        <Box sx= {{marginY: '8%'}}>
          <Grid container spacing={15} justifyContent="center">
            <Grid item xs={12} sm={6} md={5.3}>
              <img src={exemploGrafico} alt="grafico" style={{ width: '100%' }} />
            </Grid>
            <Grid item xs={12} sm={6} md={4.7}>
              <img src={exemploGrafico2} alt="grafico2" style={{ width: '100%' }} />
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
}

export default HomeAdminEM;
