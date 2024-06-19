import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase/firebase.js';
import { Navigate } from 'react-router-dom';

function ProtectedProfessorRoute({ children }) {
  const [isProfessor, setIsProfessor] = useState(null);

  useEffect(() => {
    if (auth.currentUser) {
      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      getDoc(userDocRef)
        .then((docSnap) => {
          if (docSnap.exists()) {
            setIsProfessor(docSnap.data().role === 'professor');
          } else {
            console.log("Nenhum documento encontrado!");
            setIsProfessor(false);
          }
        })
        .catch((error) => {
          console.error("Erro ao buscar o usuário: ", error);
          setIsProfessor(false);
        });
    } else {
      console.log("Usuário não autenticado!");
      setIsProfessor(false);
    }
  }, []);
  


  if (isProfessor === null) {
    return <div>Carregando...</div>;
  }

  return isProfessor ? children : <Navigate to="/" />;
}

export default ProtectedProfessorRoute;