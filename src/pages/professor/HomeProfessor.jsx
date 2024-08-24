import React, { useEffect, useState, useContext } from 'react';
import { Grid, Box, Typography, Container, Paper, Divider } from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Sector, Text } from 'recharts';
import UserContext from '../../contexts/UserContext.jsx';
import { db } from '../../firebase/firebase.js';
import { doc, onSnapshot, collection, query, where, getDocs } from 'firebase/firestore';

function HomeProfessor() {
  const [user, setUser] = useState(null);
  const [subjectData, setSubjectData] = useState([]);
  const { globalUid } = useContext(UserContext);

  useEffect(() => {
    if (globalUid) {
      const userRef = doc(db, 'users', globalUid);
      const unsub = onSnapshot(userRef, async (doc) => {
        if (doc.exists()) {
          const userData = { id: doc.id, ...doc.data() };
          setUser(userData);

          if (userData.schoolId && userData.subject) {
            const contentQuery = query(
              collection(db, `${userData.subject}Questions`),
              where('schoolId', '==', userData.schoolId)
            );
            const contentSnapshot = await getDocs(contentQuery);
            const contents = contentSnapshot.docs.map(doc => doc.data().subject);

            const uniqueContentCounts = [...new Set(contents)].map(content => ({
              name: content,
              value: contents.filter(c => c === content).length,
            }));

            setSubjectData(uniqueContentCounts);
          }
        } else {
          console.error("Não há esse usuário!");
        }
      }, (error) => {
        console.error("Erro ao buscar o usuário:", error);
      });

      return () => unsub();
    }
  }, [globalUid]);

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

  return (
    <Container maxWidth="lg" sx={{ paddingTop: '2%' }}>
      <Paper elevation={0} sx={{ padding: '2rem' }}>
        <Typography variant="h4" gutterBottom textAlign="center">
          Bem-vindo(a), {user ? user.name : "Carregando..."}
        </Typography>

        <Divider sx={{ marginY: 5 }} />

        <Typography variant="body1" paragraph>
          Como professor, você pode:
        </Typography>

        <ul>
          <li><Typography variant="body1">Acessar e gerenciar os conteúdos das matérias que leciona.</Typography></li>
          <li><Typography variant="body1">Criar e editar perguntas e quizzes para os alunos.</Typography></li>
          <li><Typography variant="body1">Avaliar o desempenho dos alunos</Typography></li>
        </ul>

        <Box>
          <Grid container spacing={15} justifyContent="center">
            <Grid item xs={12} sm={6} md={8}>
              {subjectData.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      activeIndex={0}
                      activeShape={renderActiveShape}
                      data={subjectData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Typography variant="body1">Carregando gráfico...</Typography>
              )}
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
}

export default HomeProfessor;
