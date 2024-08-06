import React, { useState, useEffect, useContext } from 'react';
import { db } from '../../../firebase/firebase.js';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { Container, Typography, Box, Grid, Paper } from '@mui/material';
import { PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, Legend, ResponsiveContainer } from 'recharts';
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
  portuguese: { name: 'Língua Portuguesa', icon: portugueseIcon, color: '#FF6347' },
  mathematics: { name: 'Matemática', icon: mathematicsIcon, color: '#eed171' },
  science: { name: 'Ciências', icon: scienceIcon, color: '#5bcb77' },
  geography: { name: 'Geografia', icon: geographyIcon, color: '#00BFFF' },
  history: { name: 'História', icon: historyIcon, color: '#DEB887' },
  art: { name: 'Arte', icon: artIcon, color: 'linear-gradient(to right, red, orange, yellow, green, blue, indigo, violet)' },
  english: { name: 'Língua Inglesa', icon: englishIcon, color: 'linear-gradient(to right, blue, #b7b9b9, red)' },
  physicalEducation: { name: 'Educação Física', icon: physicalEducationIcon, color: '#ed8900' },
  religion: { name: 'Ensino Religioso', icon: religionIcon, color: '#aea881' }
};

const Dashboard = () => {
  const { globalUid } = useContext(UserContext);
  const [schoolYear, setSchoolYear] = useState('');
  const [schoolId, setSchoolId] = useState('');
  const [totalQuestions, setTotalQuestions] = useState({});
  const [answeredQuestions, setAnsweredQuestions] = useState({});
  const [stats, setStats] = useState({});
  const subjects = Object.keys(subjectDetails);

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
      for (let subject of subjects) {
        const subjectResponses = await getDocs(query(collection(db, `user${subject.charAt(0).toUpperCase() + subject.slice(1)}Responses`), where('userId', '==', globalUid)));
        responsesData[subject] = {
          total: subjectResponses.docs.length,
          uniqueQuestions: new Set(subjectResponses.docs.map(doc => doc.data().question)).size
        };
      }
      setAnsweredQuestions(responsesData);
    };

    fetchQuestionsData();
    fetchResponsesData();
  }, [globalUid, schoolId, schoolYear]);

  useEffect(() => {
    const calculateStats = () => {
      let calculatedStats = {};
      for (let subject of subjects) {
        const total = totalQuestions[subject] || 0;
        const answered = answeredQuestions[subject]?.uniqueQuestions || 0; // Use unique questions for answered
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

  const renderPieChart = (subject) => {
    const data = [
      { name: 'Respondidas', value: stats[subject]?.answered || 0 },
      { name: 'Restantes', value: stats[subject]?.remaining || 0 }
    ];
    const colors = ['#00C49F', '#FFBB28'];

    return (
      <PieChart width={300} height={200}>
        <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    );
  };

  const renderBarChart = () => {
    const data = subjects.map(subject => ({
      name: subjectDetails[subject].name,
      Total: stats[subject]?.total || 0,
      Respondidas: stats[subject]?.answered || 0
    }));

    return (
      <BarChart width={600} height={300} data={data}>
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="Total" fill="#8884d8" />
        <Bar dataKey="Respondidas" fill="#82ca9d" />
      </BarChart>
    );
  };

  return (
    <Container>
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Dashboard
        </Typography>
        <Grid container spacing={3}>
          {subjects.map((subject, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Paper elevation={3} sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                  <Typography variant="h6" gutterBottom style={{ background: subjectDetails[subject].color, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginRight: '8px' }}>
                    {subjectDetails[subject].name}
                  </Typography>
                  <img src={subjectDetails[subject].icon} alt={`${subjectDetails[subject].name} icon`} style={{ marginBottom: '2.45%', width: '25px' }} />
                </Box>
                <Typography variant="body1">Questões diferentes: {stats[subject]?.total || 0}</Typography>
                <Typography variant="body1">Respondidas: {stats[subject]?.answered || 0}</Typography>
                <Typography variant="body1">Restantes: {stats[subject]?.remaining || 0}</Typography>
                {renderPieChart(subject)}
              </Paper>
            </Grid>
          ))}
          <Grid item xs={12}>
            <Paper elevation={3} sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Comparação de Questões Totais vs. Respondidas
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                {renderBarChart()}
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Dashboard;
