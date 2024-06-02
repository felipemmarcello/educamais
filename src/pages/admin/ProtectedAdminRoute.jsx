import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase/firebase.js';
import { Navigate } from 'react-router-dom';

function ProtectedAdminRoute({ children }) {
  const [isAdmin, setIsAdmin] = useState(null);

  useEffect(() => {
    if (auth.currentUser) {
      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      getDoc(userDocRef)
        .then((docSnap) => {
          if (docSnap.exists()) {
            setIsAdmin(docSnap.data().role === 'admin');
          } else {
            console.log("Nenhum documento encontrado!");
            setIsAdmin(false);
          }
        })
        .catch((error) => {
          console.error("Erro ao buscar o usuário: ", error);
          setIsAdmin(false);
        });
    } else {
      console.log("Usuário não autenticado!");
      setIsAdmin(false);
    }
  }, []);
  


  if (isAdmin === null) {
    return <div>Carregando...</div>;
  }

  return isAdmin ? children : <Navigate to="/" />;
}

export default ProtectedAdminRoute;