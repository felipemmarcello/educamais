import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase/firebase.js';
import { Navigate } from 'react-router-dom';

function ProtectedAdminEMRoute({ children }) {
  const [isAdminEM, setIsAdminEM] = useState(null);

  useEffect(() => {
    if (auth.currentUser) {
      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      getDoc(userDocRef)
        .then((docSnap) => {
          if (docSnap.exists()) {
            setIsAdminEM(docSnap.data().role === 'AdminEM');
          } else {
            console.log("Nenhum documento encontrado!");
            setIsAdminEM(false);
          }
        })
        .catch((error) => {
          console.error("Erro ao buscar o usuário: ", error);
          setIsAdminEM(false);
        });
    } else {
      console.log("Usuário não autenticado!");
      setIsAdminEM(false);
    }
  }, []);
  


  if (isAdminEM === null) {
    return <div>Carregando...</div>;
  }

  return isAdminEM ? children : <Navigate to="/" />;
}

export default ProtectedAdminEMRoute;