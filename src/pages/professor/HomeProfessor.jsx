import React, { useEffect, useState, useContext } from 'react';
import { Grid, Box, Typography, Container, Paper, Divider } from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Sector } from 'recharts';
import UserContext from '../../contexts/UserContext.jsx';
import { db } from '../../firebase/firebase.js';
import { doc, onSnapshot, collection, query, where, getDocs } from 'firebase/firestore';

function HomeProfessor() {
  const [user, setUser] = useState(null);
  const [subjectData, setSubjectData] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0); // Definir o estado activeIndex
  const { globalUid } = useContext(UserContext);

  // Expansão do array de cores com mais opções
  const COLORS = [
    '#FF8042', '#00C49F', '#FFBB28', '#0088FE', '#FF6347', '#B0E57C', 
    '#8A2BE2', '#A52A2A', '#DEB887', '#5F9EA0', '#7FFF00', '#D2691E',
    '#FF7F50', '#6495ED', '#DC143C', '#00FFFF', '#00008B', '#008B8B',
    '#B8860B', '#A9A9A9', '#006400', '#BDB76B', '#8B008B', '#556B2F',
    '#FF8C00', '#9932CC', '#8B0000', '#E9967A', '#8FBC8F', '#483D8B',
    '#2F4F4F', '#00CED1', '#9400D3', '#FF1493', '#00BFFF', '#696969',
    '#1E90FF', '#B22222', '#FFFAF0', '#228B22', '#FF00FF', '#DCDCDC',
    '#F8F8FF', '#FFD700', '#DAA520', '#808080', '#008000', '#ADFF2F',
    '#F0FFF0', '#FF69B4', '#CD5C5C', '#4B0082', '#FFFFF0', '#F0E68C',
    '#E6E6FA', '#FFF0F5', '#7CFC00', '#FFFACD', '#ADD8E6', '#F08080'
  ];

  useEffect(() => {
    if (globalUid) {
      const userRef = doc(db, 'users', globalUid);
      const unsub = onSnapshot(userRef, async (doc) => {
        if (doc.exists()) {
          const userData = { id: doc.id, ...doc.data() };
          setUser(userData);

          if (userData.schoolId && userData.schoolSubject) {
            const contentQuery = query(
              collection(db, `${userData.schoolSubject}Questions`),
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

  // Função para alterar o activeIndex
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
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      activeIndex={activeIndex}
                      activeShape={renderActiveShape}
                      data={subjectData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      onMouseEnter={onPieEnter} // Adiciona o evento para alterar o activeIndex
                    >
                      {subjectData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
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
