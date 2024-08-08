import React, { useEffect, useState, useContext } from 'react';
import { Grid, Box, Typography, Container, Paper, Divider } from '@mui/material';
import UserContext from '../../contexts/UserContext.jsx';
import { db } from '../../firebase/firebase.js';
import { doc, onSnapshot, getDocs, query, collection, where } from 'firebase/firestore';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

function HomeStudent() {
  const [user, setUser] = useState(null);
  const { globalUid } = useContext(UserContext);

  const [totalQuestions, setTotalQuestions] = useState({});
  const [answeredQuestions, setAnsweredQuestions] = useState({});

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

  useEffect(() => {
    const fetchQuestionsData = async () => {
      if (!user?.schoolId || !user?.schoolYear) return;

      let questionsData = {};
      const subjects = ["portuguese", "mathematics", "science", "geography", "history", "art", "english", "physicalEducation", "religion"];
      for (let subject of subjects) {
        const subjectQuestions = await getDocs(query(collection(db, `${subject}Questions`), where('schoolId', '==', user.schoolId), where('schoolYear', '==', user.schoolYear)));
        questionsData[subject] = subjectQuestions.docs.length;
      }
      setTotalQuestions(questionsData);
    };

    const fetchResponsesData = async () => {
      if (!globalUid) return;

      let responsesData = {};
      const subjects = ["portuguese", "mathematics", "science", "geography", "history", "art", "english", "physicalEducation", "religion"];
      for (let subject of subjects) {
        const subjectResponses = await getDocs(query(collection(db, `user${subject.charAt(0).toUpperCase() + subject.slice(1)}Responses`), where('userId', '==', globalUid)));
        responsesData[subject] = {
          total: subjectResponses.docs.length,
          uniqueQuestions: new Set(subjectResponses.docs.map(doc => doc.data().question)).size
        };
      }
      setAnsweredQuestions(responsesData);
    };

    if (user) {
      fetchQuestionsData();
      fetchResponsesData();
    }
  }, [user, globalUid]);

  const renderPieChartWithPaddingAngle = () => {
    const totalQuestionsCount = Object.values(totalQuestions).reduce((acc, val) => acc + val, 0);
    const totalAnsweredCount = Object.values(answeredQuestions).reduce((acc, val) => acc + (val.uniqueQuestions || 0), 0);
    const data = [
      { name: 'Qtd. Questões', value: totalQuestionsCount },
      { name: 'Não respondidas', value: totalQuestionsCount - totalAnsweredCount }
    ];
    const colors = ['#8884d8', '#82ca9d'];

    return (
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            startAngle={360}
            endAngle={0}
            innerRadius={60}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            paddingAngle={5}
            label={({ name, percent, x, y }) => (
              <text x={x} y={y} fill="black" textAnchor="middle" dominantBaseline="central" fontFamily="Arial" fontSize={14}>
                {(percent * 100).toFixed(0)}%
              </text>
            )}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Legend wrapperStyle={{ fontFamily: 'Arial', fontSize: 14 }} />
          <Tooltip contentStyle={{ fontFamily: 'Arial', fontSize: 12 }} />
        </PieChart>
      </ResponsiveContainer>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ paddingTop: '3%' }}>
      <Paper elevation={0} sx={{ padding: '2rem' }}>
        <Typography variant="h4" gutterBottom textAlign="center">
          Bem-vindo(a), {user ? user.name : "Carregando..."}
        </Typography>

        <Divider sx={{ marginY: 5 }} />

        <Typography variant="body1" paragraph>
          Como estudante, você pode:
        </Typography>

        <ul>
          <li><Typography variant="body1">Acessar conteúdos e materiais didáticos de diversas matérias.</Typography></li>
          <li><Typography variant="body1">Participar das perguntas e respostas para testar seus conhecimentos.</Typography></li>
          <li><Typography variant="body1">Visualizar seu desempenho e progresso.</Typography></li>
        </ul>

        <Box sx={{ marginY: '5%' }}>
          <Grid container spacing={15} justifyContent="center">
            <Grid item xs={12} sm={8} md={6}>
              <Typography variant="h6" gutterBottom>
                Questões Totais
              </Typography>
              {renderPieChartWithPaddingAngle()}
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
}

export default HomeStudent;
