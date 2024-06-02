import React, { useEffect, useState, useContext } from 'react';
import { Box, Typography } from '@mui/material';
import UserContext from '../../contexts/UserContext.jsx';
import { db, auth } from '../../firebase/firebase.js';
import { doc, onSnapshot } from 'firebase/firestore';

function HomeAdmin() { // Asumindo que 'user' está sendo compartilhado através do contexto
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
    <div>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '5%' }}>
        <Typography variant="h4" gutterBottom>
          Bem-vindo(a), {user ? user.name : "Carregando..."}
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', paddingLeft: '3%' ,paddingTop: '5%' }}>
        <Typography variant="body1">
          Este é o conteúdo principal da página do administrador. Aqui, você tem acesso completo para gerenciar o sistema da Escola Educa+.
        </Typography>
        <Typography variant="body1" sx={{ mt: 2 }}>
          Como administrador, você pode criar novos usuários, editar suas informações e excluí-los conforme necessário.
        </Typography>
      </Box>
    </div>
  );
}

export default HomeAdmin;
