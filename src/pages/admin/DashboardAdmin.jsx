import React, { useState, useEffect, useContext } from 'react';
import { Container, Typography, Box, Grid, Paper, Divider } from '@mui/material';
import { db } from '../../firebase/firebase.js';
import { collection, getDocs, doc, getDoc, query, where } from 'firebase/firestore';
import UserContext from '../../contexts/UserContext.jsx';
import AdminIcon from '../../images/AdminIcon.png';
import StudentIcon from '../../images/StudentIcon.png';
import ProfessorIcon from '../../images/ProfessorIcon.png';
import UsersIcon from '../../images/UsersIcon.png';
import SubjectIcon from '../../images/SubjectIcon.png';
import AnswerIcon from '../../images/AnswerIcon.png';
import QuestionIcon from '../../images/QuestionIcon.png';

const DashboardAdmin = () => {
  const { globalUid } = useContext(UserContext);
  const [schoolId, setSchoolId] = useState('');
  const [userCount, setUserCount] = useState(0);
  const [professorCount, setProfessorCount] = useState(0);
  const [studentCount, setStudentCount] = useState(0);
  const [adminCount, setAdminCount] = useState(0);
  const [totalContentCount, setTotalContentCount] = useState(0);
  const [totalResponseCount, setTotalResponseCount] = useState(0);
  const [totalQuestionsCount, setTotalQuestionsCount] = useState(0);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', globalUid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setSchoolId(userData.schoolId);
        } else {
          console.error("Documento de usuário não encontrado!");
        }
      } catch (error) {
        console.error("Erro ao buscar dados do usuário:", error);
      }
    };

    fetchUserData();
  }, [globalUid]);

  useEffect(() => {
    const fetchCounts = async () => {
      if (schoolId) {
        try {
          const usersSnapshot = await getDocs(
            query(
              collection(db, 'users'),
              where('schoolId', '==', schoolId),
              where('role', '!=', 'adminMaster') // Exclui adminMaster da contagem
            )
          );

          if (!usersSnapshot.empty) {
            const users = usersSnapshot.docs.map(doc => doc.data());

            setUserCount(users.length); // Contagem total excluindo adminMaster
            setProfessorCount(users.filter(user => user.role === 'professor').length);
            setStudentCount(users.filter(user => user.role === 'student').length);
            setAdminCount(users.filter(user => user.role === 'admin').length);
          } else {
            console.error("Nenhum documento encontrado para a schoolId:", schoolId);
          }
        } catch (error) {
          console.error("Erro ao buscar contagem de usuários:", error);
        }
      }
    };

    fetchCounts();
  }, [schoolId]);

  useEffect(() => {
    const fetchTotalContentCount = async () => {
      if (!schoolId) return;

      const collections = [
        'scienceQuestions',
        'mathematicsQuestions',
        'englishQuestions',
        'geographyQuestions',
        'historyQuestions',
        'physicalEducationQuestions',
        'portugueseQuestions',
        'artQuestions',
        'religionQuestions'
      ];

      const uniqueSubjects = new Set(); // Conjunto para armazenar subjects únicos

      for (const col of collections) {
        try {
          const snapshot = await getDocs(
            query(
              collection(db, col),
              where('schoolId', '==', schoolId)
            )
          );
          
          // Adicionar cada subject ao Set
          snapshot.docs.forEach(doc => {
            const subject = doc.data().subject;
            if (subject) {
              uniqueSubjects.add(subject);
            }
          });
        } catch (error) {
          console.error(`Erro ao buscar contagem de conteúdos para a coleção ${col}:`, error);
        }
      }

      // O tamanho do Set será o número de subjects únicos
      setTotalContentCount(uniqueSubjects.size);
    };

    fetchTotalContentCount();
  }, [schoolId]);

  useEffect(() => {
    const fetchTotalResponseCount = async () => {
      if (!schoolId) return;

      const responseCollections = [
        'userPortugueseResponses',
        'userReligionResponses',
        'userMathematicsResponses',
        'userScienceResponses',
        'userEnglishResponses',
        'userGeographyResponses',
        'userHistoryResponses',
        'userPhysicalEducationResponses',
        'userArtResponses',
      ];

      let totalResponses = 0;

      for (const col of responseCollections) {
        try {
          const snapshot = await getDocs(
            query(
              collection(db, col),
              where('schoolId', '==', schoolId)
            )
          );

          totalResponses += snapshot.size; // Somar o número de documentos na coleção de respostas
        } catch (error) {
          console.error(`Erro ao buscar contagem de respostas para a coleção ${col}:`, error);
        }
      }

      setTotalResponseCount(totalResponses);
    };

    fetchTotalResponseCount();
  }, [schoolId]);

  useEffect(() => {
    const fetchTotalQuestionsCount = async () => {
      if (!schoolId) return;

      const collections = [
        'scienceQuestions',
        'mathematicsQuestions',
        'englishQuestions',
        'geographyQuestions',
        'historyQuestions',
        'physicalEducationQuestions',
        'portugueseQuestions',
        'artQuestions',
        'religionQuestions'
      ];

      let totalQuestions = 0;

      for (const col of collections) {
        try {
          const snapshot = await getDocs(
            query(
              collection(db, col),
              where('schoolId', '==', schoolId)
            )
          );

          totalQuestions += snapshot.size; // Somar o número de documentos (questões) em cada coleção
        } catch (error) {
          console.error(`Erro ao buscar contagem de questões para a coleção ${col}:`, error);
        }
      }

      setTotalQuestionsCount(totalQuestions);
    };

    fetchTotalQuestionsCount();
  }, [schoolId]);

  return (
    <Container>
      <Box sx={{ mb: 4 }}>
        <div style={{ display: 'flex', paddingTop: '5%', paddingLeft: '12%' }}>
          <Typography variant="h3" sx={{ mb: 2 }}>
            Dashboard
          </Typography>
        </div>

        <Divider sx={{ width: '80%', margin: 'auto', height: '50%' }} />

        <Box sx={{ display: 'flex', mb: 1, paddingTop: '3.5%', justifyContent: 'center', alignItems: 'center'}}>
          <Typography gutterBottom sx={{fontSize: 18}}>
            Quantidade de Usuários e suas Funções
          </Typography>
        </Box>

        <Grid container spacing={4} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Grid item>
            <Paper 
              elevation={2} 
              sx={{
                p: 3, 
                minHeight: '130px', 
                minWidth: '130px',
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'center',
                position: 'relative',
                textAlign: 'center',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <img src={UsersIcon} alt="Users Icon" style={{ width: 40, height: 40 }} />
                <Typography sx={{ marginLeft: '13px', fontFamily: 'Arial', fontSize: 17}}>
                  Usuários
                </Typography>
              </Box>
              <Typography variant="h3" sx={{ fontFamily: 'Arial', fontWeight: 'bold'}}>
                {userCount}
              </Typography>
            </Paper>
          </Grid>

          <Grid item>
            <Paper 
              elevation={2} 
              sx={{
                p: 3, 
                minHeight: '130px', 
                minWidth: '130px',
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'center',
                position: 'relative',
                textAlign: 'center',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <img src={AdminIcon} alt="Admin Icon" style={{ width: 36, height: 36 }} />
                <Typography sx={{ marginLeft: '13px', fontFamily: 'Arial', fontSize: 17}}>
                  Admin
                </Typography>
              </Box>
              <Typography variant="h3" sx={{ fontFamily: 'Arial', fontWeight: 'bold'}}>
                {adminCount}
              </Typography>
            </Paper>
          </Grid>

          <Grid item>
            <Paper 
              elevation={2} 
              sx={{
                p: 3, 
                minHeight: '130px', 
                minWidth: '130px',
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'center',
                position: 'relative',
                textAlign: 'center',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <img src={ProfessorIcon} alt="Professor Icon" style={{ width: 36, height: 36 }} />
                <Typography sx={{ marginLeft: '13px', fontFamily: 'Arial', fontSize: 17}}>
                  Professor
                </Typography>
              </Box>
              <Typography variant="h3" sx={{ fontFamily: 'Arial', fontWeight: 'bold'}}>
                {professorCount}
              </Typography>
            </Paper>
          </Grid>

          <Grid item>
            <Paper 
              elevation={2} 
              sx={{
                p: 3, 
                minHeight: '130px', 
                minWidth: '130px',
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'center',
                position: 'relative',
                textAlign: 'center',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <img src={StudentIcon} alt="Student Icon" style={{ width: 36, height: 36 }} />
                <Typography sx={{ marginLeft: '13px', fontFamily: 'Arial', fontSize: 17}}>
                  Estudante
                </Typography>
              </Box>
              <Typography variant="h3" sx={{ fontFamily: 'Arial', fontWeight: 'bold'}}>
                {studentCount}
              </Typography>
            </Paper>
          </Grid>

        </Grid>

        <Box sx={{ display: 'flex', mb: 1, paddingTop: '3.5%', justifyContent: 'center', alignItems: 'center'}}>
          <Typography gutterBottom sx={{fontSize: 18}}>
            Conteúdos e Questões
          </Typography>
        </Box>

        <Grid container spacing={4} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Grid item>
            <Paper 
              elevation={2} 
              sx={{
                p: 3, 
                minHeight: '130px', 
                minWidth: '130px',
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'center',
                position: 'relative',
                textAlign: 'center',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <img src={SubjectIcon} alt="Subject Icon" style={{ width: 36, height: 36 }} />
                <Typography sx={{ marginLeft: '13px', fontFamily: 'Arial', fontSize: 17}}>
                  Conteúdos
                </Typography>
              </Box>
              <Typography variant="h3" sx={{ fontFamily: 'Arial', fontWeight: 'bold'}}>
                {totalContentCount}
              </Typography>
            </Paper>
          </Grid>

          <Grid item>
            <Paper 
              elevation={2} 
              sx={{
                p: 3, 
                minHeight: '130px', 
                minWidth: '130px',
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'center',
                position: 'relative',
                textAlign: 'center',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <img src={QuestionIcon} alt="Question Icon" style={{ width: 36, height: 36 }} />
                <Typography sx={{ marginLeft: '13px', fontFamily: 'Arial', fontSize: 17}}>
                  Questões
                </Typography>
              </Box>
              <Typography variant="h3" sx={{ fontFamily: 'Arial', fontWeight: 'bold'}}>
                {totalQuestionsCount}
              </Typography>
            </Paper>
          </Grid>

          <Grid item>
            <Paper 
              elevation={2} 
              sx={{
                p: 3, 
                minHeight: '130px', 
                minWidth: '130px',
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'center',
                position: 'relative',
                textAlign: 'center',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <img src={AnswerIcon} alt="Answer Icon" style={{ width: 36, height: 36 }} />
                <Typography sx={{ marginLeft: '13px', fontFamily: 'Arial', fontSize: 17}}>
                  Respostas
                </Typography>
              </Box>
              <Typography variant="h3" sx={{ fontFamily: 'Arial', fontWeight: 'bold'}}>
                {totalResponseCount}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default DashboardAdmin;
