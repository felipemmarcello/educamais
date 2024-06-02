import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase/firebase.js';
import { Navigate } from 'react-router-dom';

function ProtectedStudentRoute({ children }) {
  const [isStudent, setIsStudent] = useState(null);

  useEffect(() => {
    if (auth.currentUser) {
      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      getDoc(userDocRef)
        .then((docSnap) => {
          if (docSnap.exists()) {
            setIsStudent(docSnap.data().role === 'student');
          } else {
            console.log("Nenhum documento encontrado!");
            setIsStudent(false);
          }
        })
        .catch((error) => {
          console.error("Erro ao buscar o usuário: ", error);
          setIsStudent(false);
        });
    } else {
      console.log("Usuário não autenticado!");
      setIsStudent(false);
    }
  }, []);
  


  if (isStudent === null) {
    return <div>Carregando...</div>;
  }

  return isStudent ? children : <Navigate to="/" />;
}

export default ProtectedStudentRoute;