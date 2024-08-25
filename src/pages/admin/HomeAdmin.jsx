import React, { useEffect, useState, useContext } from 'react';
import { Box, Typography, Container, Paper, Divider, Grid } from '@mui/material';
import { PieChart, Pie, ResponsiveContainer, Tooltip, Sector, Cell } from 'recharts';
import UserContext from '../../contexts/UserContext.jsx';
import { db } from '../../firebase/firebase.js';
import { doc, onSnapshot, collection, query, where, getDocs } from 'firebase/firestore';

function HomeAdmin() {
  const [user, setUser] = useState(null);
  const [roleData, setRoleData] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0); // Definir o estado activeIndex
  const { globalUid } = useContext(UserContext);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28']; // Definindo cores diferentes para cada segmento

  useEffect(() => {
    if (globalUid) {
      const userRef = doc(db, 'users', globalUid);
      const unsub = onSnapshot(userRef, async (doc) => {
        if (doc.exists()) {
          const userData = { id: doc.id, ...doc.data() };
          setUser(userData);

          if (userData.schoolId) {
            const roles = ['student', 'professor', 'admin']; // Roles que queremos contar
            const roleCounts = [];

            for (const role of roles) {
              const roleQuery = query(
                collection(db, 'users'),
                where('schoolId', '==', userData.schoolId),
                where('role', '==', role)
              );
              const roleSnapshot = await getDocs(roleQuery);

              // Mapeando os nomes para os rótulos desejados
              const roleName = role === 'admin' ? 'Administrador'
                              : role === 'student' ? 'Estudante'
                              : 'Professor';

              roleCounts.push({
                name: roleName,
                value: roleSnapshot.size,
              });
            }

            setRoleData(roleCounts);
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
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333" fontFamily="Arial">{`Usuários: ${value}`}</text>
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
          Como administrador, você pode:
        </Typography>

        <ul>
          <li><Typography variant="body1">Criar novos usuários e definir seus papéis.</Typography></li>
          <li><Typography variant="body1">Editar informações dos usuários existentes.</Typography></li>
          <li><Typography variant="body1">Excluir usuários que não fazem mais parte da instituição.</Typography></li>
        </ul>
        
        <Box>
          <Grid container spacing={15} justifyContent="center">
            <Grid item xs={12} md={8}>
              {roleData.length > 0 ? (
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      activeIndex={activeIndex}
                      activeShape={renderActiveShape}
                      data={roleData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      fill="#82ca9d"
                      dataKey="value"
                      onMouseEnter={onPieEnter} // Adiciona o evento para alterar o activeIndex
                    >
                      {roleData.map((entry, index) => (
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

export default HomeAdmin;
