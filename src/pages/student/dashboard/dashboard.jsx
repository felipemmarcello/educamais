import React, { useState, useEffect, useContext } from 'react';
import { db } from '../../../firebase/firebase.js';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { Container, Typography, Box, Grid, Paper, Select, MenuItem, FormControl, InputLabel, Divider, List, ListItem } from '@mui/material';
import { PieChart, Pie, Sector, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis } from 'recharts';
import UserContext from '../../../contexts/UserContext.jsx';
import portugueseIcon from '../../../images/portugueseIcon.png';
import mathematicsIcon from '../../../images/mathematicsIcon.png';
import scienceIcon from '../../../images/scienceIcon.png';
import geographyIcon from '../../../images/geographyIcon.png';
import historyIcon from '../../../images/historyIcon.png';
import artIcon from '../../../images/artIcon.png';
import englishIcon from '../../../images/englishIcon.png';
import physicalEducationIcon from '../../../images/physicalEducationIcon.png';
import religionIcon from '../../../images/religionIcon.png';

const subjectDetails = {
  portuguese: { name: 'Língua Portuguesa', color: '#FF6347', icon: portugueseIcon },
  mathematics: { name: 'Matemática', color: '#eed171', icon: mathematicsIcon },
  science: { name: 'Ciências', color: '#5bcb77', icon: scienceIcon },
  geography: { name: 'Geografia', color: '#00BFFF', icon: geographyIcon },
  history: { name: 'História', color: '#DEB887', icon: historyIcon },
  art: { name: 'Arte', color: '#FF6347', icon: artIcon },
  english: { name: 'Língua Inglesa', color: '#2e58af', icon: englishIcon },
  physicalEducation: { name: 'Educação Física', color: '#ed8900', icon: physicalEducationIcon },
  religion: { name: 'Ensino Religioso', color: '#aea881', icon: religionIcon }
};

const renderActiveShape = (props) => {
  const RADIAN = Math.PI / 180;
  const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
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
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill} fontFamily="Arial" fontSize={16}>{payload.name}</text>
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
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333" fontFamily="Arial" fontSize={14}>{`Questões`}</text>
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999" fontFamily="Arial" fontSize={12}>
        {`${(percent * 100).toFixed(2)}%`}
      </text>
    </g>
  );
};

const Dashboard = () => {
  const { globalUid } = useContext(UserContext);
  const [schoolYear, setSchoolYear] = useState('');
  const [schoolId, setSchoolId] = useState('');
  const [totalQuestions, setTotalQuestions] = useState({});
  const [answeredQuestions, setAnsweredQuestions] = useState({});
  const [stats, setStats] = useState({});
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
  const [totalAnswersCount, setTotalAnswersCount] = useState(0);
  const [unansweredSubjects, setUnansweredSubjects] = useState([]);
  const subjects = Object.keys(subjectDetails);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [questionStats, setQuestionStats] = useState([]);
  const [subjectQuestions, setSubjectQuestions] = useState([]);

  useEffect(() => {
    const fetchUserData = async () => {
      const userDoc = await getDoc(doc(db, 'users', globalUid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setSchoolYear(userData.schoolYear);
        setSchoolId(userData.schoolId);
      }
    };

    fetchUserData();
  }, [globalUid]);

  useEffect(() => {
    const fetchQuestionsData = async () => {
      if (!schoolId || !schoolYear) return;

      let questionsData = {};
      for (let subject of subjects) {
        const subjectQuestions = await getDocs(query(collection(db, `${subject}Questions`), where('schoolId', '==', schoolId), where('schoolYear', '==', schoolYear)));
        questionsData[subject] = subjectQuestions.docs.length;
      }
      setTotalQuestions(questionsData);
    };

    const fetchResponsesData = async () => {
      if (!schoolId || !schoolYear) return;

      let responsesData = {};
      let correctCount = 0;
      let totalCount = 0;
      for (let subject of subjects) {
        const subjectResponses = await getDocs(query(collection(db, `user${subject.charAt(0).toUpperCase() + subject.slice(1)}Responses`), where('userId', '==', globalUid)));
        responsesData[subject] = {
          total: subjectResponses.docs.length,
          uniqueQuestions: new Set(subjectResponses.docs.map(doc => doc.data().question)).size,
          responses: subjectResponses.docs.map(doc => doc.data().question),
          correctAnswers: subjectResponses.docs.filter(doc => doc.data().isCorrect === true).length
        };
        correctCount += responsesData[subject].correctAnswers;
        totalCount += responsesData[subject].total;
      }
      setAnsweredQuestions(responsesData);
      setCorrectAnswersCount(correctCount);
      setTotalAnswersCount(totalCount);
    };

    fetchQuestionsData();
    fetchResponsesData();
  }, [globalUid, schoolId, schoolYear]);

  useEffect(() => {
    const calculateStats = () => {
      let calculatedStats = {};
      for (let subject of subjects) {
        const total = totalQuestions[subject] || 0;
        const answered = answeredQuestions[subject]?.uniqueQuestions || 0;
        calculatedStats[subject] = {
          total,
          answered,
          remaining: total - answered
        };
      }
      setStats(calculatedStats);
    };

    if (Object.keys(totalQuestions).length > 0 && Object.keys(answeredQuestions).length > 0) {
      calculateStats();
    }
  }, [totalQuestions, answeredQuestions]);

  useEffect(() => {
    const fetchSubjectQuestions = async () => {
      if (!selectedSubject || !schoolId || !schoolYear) return;
      const subjectQuestionsSnapshot = await getDocs(query(collection(db, `${selectedSubject}Questions`), where('schoolId', '==', schoolId), where('schoolYear', '==', schoolYear)));
      const questions = subjectQuestionsSnapshot.docs.map(doc => ({ question: doc.data().question, subject: doc.data().subject }));
      setSubjectQuestions(questions);

      const unanswered = questions.filter(question => {
        return !answeredQuestions[selectedSubject]?.responses.includes(question.question);
      });
      setUnansweredSubjects(unanswered.map(q => q.subject));
    };

    fetchSubjectQuestions();
  }, [selectedSubject, schoolId, schoolYear, answeredQuestions]);

  useEffect(() => {
    if (selectedSubject && answeredQuestions[selectedSubject]) {
      const subjectData = answeredQuestions[selectedSubject];
      setCorrectAnswersCount(subjectData.correctAnswers);
      setTotalAnswersCount(subjectData.total);
    } else {
      let totalCorrect = 0;
      let totalAnswers = 0;

      Object.values(answeredQuestions).forEach((subjectData) => {
        totalCorrect += subjectData.correctAnswers;
        totalAnswers += subjectData.total;
      });

      setCorrectAnswersCount(totalCorrect);
      setTotalAnswersCount(totalAnswers);
    }
  }, [selectedSubject, answeredQuestions]);

  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };

  const renderCustomActiveShapePieChart = (subject) => {
    const data = [
      { name: 'Respondidas', value: stats[subject]?.answered || 0 },
      { name: 'Restantes', value: stats[subject]?.remaining || 0 }
    ];
    const colors = ['#00C49F', '#FFBB28'];

    return (
      <ResponsiveContainer width="100%" height={300}>
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
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    );
  };

  const renderBiaxialBarChart = () => {
    const subjectData = subjectQuestions.reduce((acc, { question, subject }) => {
      const count = questionStats.find((q) => q.question === question)?.count || 0;
      if (!acc[subject]) {
        acc[subject] = { subject, count: 0, total: 0 };
      }
      acc[subject].count += count;
      acc[subject].total += 1;
      return acc;
    }, {});

    const data = Object.values(subjectData);

    return data.length > 0 ? (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <XAxis dataKey="subject" tick={{ fontFamily: 'Arial', fontSize: 14 }} />
          <YAxis tick={{ fontFamily: 'Arial', fontSize: 14 }} />
          <Tooltip contentStyle={{ fontFamily: 'Arial', fontSize: 12 }} />
          <Legend wrapperStyle={{ fontFamily: 'Arial', fontSize: 14 }} />
          <Bar dataKey="total" name="Questões" fill="#8884d8" />
          <Bar dataKey="count" name="Respostas Totais" fill="#82ca9d" />
        </BarChart>
      </ResponsiveContainer>
    ) : (
      <Typography variant="body1" color="textSecondary">
        Nenhuma questão encontrada
      </Typography>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ paddingTop: '2%', paddingBottom: '3%' }}>
      <Box>
        <div style={{ display: 'flex', paddingTop: '2.4%', paddingLeft: '12%' }}>
          <Typography variant="h3" sx={{ mb: 2 }}>
            Dashboard
          </Typography>
        </div>
        <Divider sx={{ width: '80%', margin: 'auto', height: '50%', marginBottom: '4%' }} />
        <Grid container spacing={2} sx={{ borderColor: selectedSubject ? subjectDetails[selectedSubject].color : 'inherit' }}>
          <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '2%' }}>
            <Grid item xs={2.5}>
              <Box>
                <FormControl fullWidth>
                  <InputLabel id="select-subject-label">Selecione a Matéria</InputLabel>
                  <Select
                    labelId="select-subject-label"
                    id="select-subject"
                    value={selectedSubject}
                    label="Selecione a Matéria"
                    onChange={(e) => setSelectedSubject(e.target.value)}
                  >
                    <MenuItem value="">
                      <em>Selecione</em>
                    </MenuItem>
                    {subjects.map((subject) => (
                      <MenuItem key={subject} value={subject}>
                        {subjectDetails[subject].name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Grid>

            <Grid item xs={4} sx={{ marginLeft: '2%' }}>
              <Paper elevation={3} sx={{ p: 3, textAlign: 'center', marginBottom: '5%', borderColor: selectedSubject ? subjectDetails[selectedSubject].color : 'inherit', borderWidth: '2px', borderStyle: 'solid' }}>
                <Typography variant="h6" gutterBottom style={{ fontFamily: 'Arial', fontSize: 18 }}>
                  Corretas vs Respondidas
                </Typography>
                <Typography variant="h3" sx={{ fontFamily: 'Arial', fontWeight: 'bold' }}>
                  {correctAnswersCount} / {totalAnswersCount}
                </Typography>
              </Paper>

              {selectedSubject && (
              <Grid item>
                <Paper elevation={3} sx={{ p: 3, textAlign: 'center', borderColor: selectedSubject ? subjectDetails[selectedSubject].color : 'inherit', borderWidth: '2px', borderStyle: 'solid' }}>
                  <Typography variant="h6" gutterBottom style={{ fontFamily: 'Arial', fontSize: 18 }}>
                    Não respondidas
                  </Typography>
                  <List>
                    {unansweredSubjects.length > 0 ? (
                      unansweredSubjects.map((subject, index) => (
                        <ListItem key={index} style={{ fontFamily: 'Arial', fontSize: 14 }}>- {subject}</ListItem>
                      ))
                    ) : (
                      <Typography variant="body2" color="textSecondary" style={{ fontFamily: 'Arial', fontSize: 14 }}>
                        Todas as questões foram respondidas.
                      </Typography>
                    )}
                  </List>
                </Paper>
              </Grid>
            )}
            </Grid>

            <Grid item xs={5.8} sx={{ marginLeft: '2%' }}>
              <Paper elevation={3} sx={{ p: 2, borderColor: selectedSubject ? subjectDetails[selectedSubject].color : 'inherit', borderWidth: '2px', borderStyle: 'solid' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                  <Typography variant="h6" gutterBottom style={{ marginRight: '8px' }}>
                    {selectedSubject ? subjectDetails[selectedSubject].name : 'Selecione uma matéria'}
                  </Typography>
                  {selectedSubject && (
                    <img
                      src={subjectDetails[selectedSubject].icon}
                      alt={`${subjectDetails[selectedSubject].name} icon`}
                      style={{ marginBottom: '0.80%', width: '25px' }}
                    />
                  )}
                </Box>
                {selectedSubject ? (
                  <>
                    <Typography variant="body1" style={{ fontFamily: 'Arial', fontSize: 14 }}>
                      Questões diferentes: {stats[selectedSubject]?.total || 0}
                    </Typography>
                    <Typography variant="body1" style={{ fontFamily: 'Arial', fontSize: 14 }}>
                      Respondidas: {stats[selectedSubject]?.answered || 0}
                    </Typography>
                    <Typography variant="body1" style={{ fontFamily: 'Arial', fontSize: 14 }}>
                      Restantes: {stats[selectedSubject]?.remaining || 0}
                    </Typography>
                    {renderCustomActiveShapePieChart(selectedSubject)}
                  </>
                ) : (
                  <Typography variant="body1" style={{ fontFamily: 'Arial', fontSize: 14 }}>
                    Selecione uma matéria para ver os detalhes.
                  </Typography>
                )}
              </Paper>
            </Grid>
          </Container>
        </Grid>
      </Box>
    </Container>
  );
};

export default Dashboard;
