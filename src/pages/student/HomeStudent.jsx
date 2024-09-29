import React, { useEffect, useState, useContext } from 'react';
import { Grid, Box, Typography, Container, Paper, Divider, Card } from '@mui/material';
import UserContext from '../../contexts/UserContext.jsx';
import { db } from '../../firebase/firebase.js';
import { doc, onSnapshot, getDocs, query, collection, where } from 'firebase/firestore';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Sector } from 'recharts';
import level1 from '../../images/medals/level1.png';
import level2 from '../../images/medals/level2.png';
import level3 from '../../images/medals/level3.png';
import level4 from '../../images/medals/level4.png';
import level5 from '../../images/medals/level5.png';

function HomeStudent() {
  const [user, setUser] = useState(null);
  const [totalQuestions, setTotalQuestions] = useState({});
  const [answeredQuestions, setAnsweredQuestions] = useState({});
  const [activeIndex, setActiveIndex] = useState(0); 
  const { globalUid } = useContext(UserContext);

  const COLORS = ['#00C49F', '#f83515']; 

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

  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };

  const renderActiveShape = (props) => {
    const RADIAN = Math.PI / 180;
    const {
      cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle,
      fill, payload, percent, value,
    } = props;
    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);
    const sx = cx + (outerRadius + 10) * cos;
    const sy = cy + (outerRadius + 10) * sin;
    const mx = cx + (outerRadius + 30) * cos;
    const my = cy + (outerRadius + 30) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 22;
    const ey = my;
    const textAnchor = cos >= 0 ? 'start' : 'end';

    return (
      <g>
        <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill} fontFamily="Arial">{payload.name}</text>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 6}
          outerRadius={outerRadius + 10}
          fill={fill}
        />
        <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
        <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333" fontFamily="Arial">{`Questões: ${value}`}</text>
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999" fontFamily="Arial">
          {`(${(percent * 100).toFixed(2)}%)`}
        </text>
      </g>
    );
  };

  const getMedalImage = () => {
    if (!user?.correctAnswers) return null;
    const { correctAnswers } = user;
    
    if (correctAnswers >= 250) return { image: level5, level: 5 };
    if (correctAnswers >= 150) return { image: level4, level: 4 };
    if (correctAnswers >= 70) return { image: level3, level: 3 };
    if (correctAnswers >= 30) return { image: level2, level: 2 };
    if (correctAnswers >= 15) return { image: level1, level: 1 };
    
    return null;
  };

  const renderPieChart = () => {
    const totalAnsweredCount = Object.values(answeredQuestions).reduce((acc, val) => acc + (val.uniqueQuestions || 0), 0);
    const totalUnansweredCount = Object.values(totalQuestions).reduce((acc, val) => acc + val, 0) - totalAnsweredCount;
    
    const data = [
      { name: 'Respondidas', value: totalAnsweredCount },
      { name: 'Sem Resposta', value: totalUnansweredCount }
    ];

    return (
      <ResponsiveContainer width="100%" height={350}>
        <PieChart>
          <Pie
            activeIndex={activeIndex}
            activeShape={renderActiveShape}
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            onMouseEnter={onPieEnter}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ paddingTop: '2%' }}>
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

        <Grid container spacing={5} justifyContent="center">
          <Grid item xs={6} md={7}>
            {renderPieChart()}
          </Grid>

          {getMedalImage() && (
            <Grid>
              <Card
                sx={{
                  padding: '1rem',
                  textAlign: 'center',
                  marginTop: '20%',
                }}
              >
                <img
                  alt={`Medalha Nível ${getMedalImage().level}`}
                  src={getMedalImage().image}
                  style={{ 
                    width: '150px', 
                    height: '150px', 
                    marginBottom: '16px', 
                    objectFit: 'contain'
                  }}
                />
                <Typography variant="h6" sx={{ color: '#000000' }}>
                  Medalha de Nível {getMedalImage().level}
                </Typography>
                <Typography variant="body2" sx={{ color: '#000000' }}>
                  Parabéns por alcançar {user.correctAnswers} respostas corretas!
                </Typography>

                <Typography variant="body2" sx={{ color: '#000000' }}>
                  Acerte mais perguntas para melhorar sua medalha!
                </Typography>
              </Card>
            </Grid>
          )}
        </Grid>
      </Paper>
    </Container>
  );
}

export default HomeStudent;
