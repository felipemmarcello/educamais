import React, { useState, useEffect, useContext } from 'react';
import { Container, Typography, Box, Grid, Paper, Divider, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { db } from '../../firebase/firebase.js';
import { collection, getDocs, query, where } from 'firebase/firestore';
import UserContext from '../../contexts/UserContext.jsx';
import UsersIcon from '../../images/UsersIcon.png';
import SubjectIcon from '../../images/SubjectIcon.png';
import AnswerIcon from '../../images/AnswerIcon.png';
import QuestionIcon from '../../images/QuestionIcon.png';
import SchoolIcon from '../../images/SchoolIcon.png'; // Adicione um ícone para escolas

const DashboardEM = () => {
  const { globalUid } = useContext(UserContext);
  const [schoolId, setSchoolId] = useState('');
  const [schools, setSchools] = useState([]);
  const [schoolCount, setSchoolCount] = useState(0); // Estado para contagem de escolas
  const [userCount, setUserCount] = useState(0);
  const [totalContentCount, setTotalContentCount] = useState(0);
  const [totalResponseCount, setTotalResponseCount] = useState(0);
  const [totalQuestionsCount, setTotalQuestionsCount] = useState(0);

  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const schoolsSnapshot = await getDocs(collection(db, 'schools'));
        const schoolsList = schoolsSnapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().schoolName,
        }));
        setSchools(schoolsList);
        setSchoolCount(schoolsList.length); // Define a contagem de escolas
      } catch (error) {
        console.error("Erro ao buscar escolas:", error);
      }
    };

    fetchSchools();
  }, []);

  useEffect(() => {
    const fetchCounts = async () => {
      let queryConstraints = [
        where('role', '!=', 'AdminEM')  // Excluir usuários com role 'AdminEM'
      ];
      if (schoolId) {
        queryConstraints.push(where('schoolId', '==', schoolId));
      }

      try {
        const usersSnapshot = await getDocs(query(collection(db, 'users'), ...queryConstraints));
        setUserCount(usersSnapshot.size); // Contagem total de usuários, excluindo 'AdminEM'
      } catch (error) {
        console.error("Erro ao buscar contagem de usuários:", error);
      }
    };

    fetchCounts();
  }, [schoolId]);

  useEffect(() => {
    const fetchTotalContentCount = async () => {
      let queryConstraints = [];
      if (schoolId) {
        queryConstraints.push(where('schoolId', '==', schoolId));
      }

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
          const snapshot = await getDocs(query(collection(db, col), ...queryConstraints));
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

      setTotalContentCount(uniqueSubjects.size);
    };

    fetchTotalContentCount();
  }, [schoolId]);

  useEffect(() => {
    const fetchTotalResponseCount = async () => {
      let queryConstraints = [];
      if (schoolId) {
        queryConstraints.push(where('schoolId', '==', schoolId));
      }

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
          const snapshot = await getDocs(query(collection(db, col), ...queryConstraints));
          totalResponses += snapshot.size;
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
      let queryConstraints = [];
      if (schoolId) {
        queryConstraints.push(where('schoolId', '==', schoolId));
      }

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
          const snapshot = await getDocs(query(collection(db, col), ...queryConstraints));
          totalQuestions += snapshot.size;
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
        <div style={{ display: 'flex', paddingTop: '5%', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h3" sx={{ paddingLeft: '13%', mb: 2 }}>
            Dashboard
          </Typography>

          <FormControl sx={{ minWidth: 300, paddingRight: '13%', mb: 2 }}>
            <InputLabel id="school-select-label">Escolha uma escola</InputLabel>
            <Select
              labelId="school-select-label"
              id="school-select"
              value={schoolId}
              label="Escolha uma escola"
              onChange={(e) => setSchoolId(e.target.value)}
            >
              <MenuItem value="">
                <em>Todas as Escolas</em>
              </MenuItem>
              {schools.map((school) => (
                <MenuItem key={school.id} value={school.id}>
                  {school.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>

        <Divider sx={{ width: '80%', margin: 'auto', height: '50%' }} />

        <Box sx={{ display: 'flex', mb: 1, paddingTop: '3.5%', justifyContent: 'center', alignItems: 'center'}}>
          <Typography gutterBottom sx={{fontSize: 18}}>
            Quantidade de Escolas
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
                <img src={SchoolIcon} alt="School Icon" style={{ width: 40, height: 40 }} />
                <Typography sx={{ marginLeft: '13px', fontFamily: 'Arial', fontSize: 17}}>
                  Escolas
                </Typography>
              </Box>
              <Typography variant="h3" sx={{ fontFamily: 'Arial', fontWeight: 'bold'}}>
                {schoolCount}
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        <Box sx={{ display: 'flex', mb: 1, paddingTop: '3.5%', justifyContent: 'center', alignItems: 'center'}}>
          <Typography gutterBottom sx={{fontSize: 18}}>
            Usuários, Conteúdos e Questões {schoolId ? `(Escola selecionada)` : `(Todas as escolas)`}
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

export default DashboardEM;
