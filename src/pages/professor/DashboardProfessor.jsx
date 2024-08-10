import React, { useState, useEffect, useContext } from 'react';
import { db } from '../../firebase/firebase.js';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { Container, Typography, Box, Grid, Paper, Select, Divider, MenuItem, FormControl, InputLabel, List, ListItem, ListItemText, Pagination, Button } from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import UserContext from '../../contexts/UserContext.jsx';
import portugueseIcon from '../../images/portugueseIcon.png';
import mathematicsIcon from '../../images/mathematicsIcon.png';
import scienceIcon from '../../images/scienceIcon.png';
import geographyIcon from '../../images/geographyIcon.png';
import historyIcon from '../../images/historyIcon.png';
import artIcon from '../../images/artIcon.png';
import englishIcon from '../../images/englishIcon.png';
import physicalEducationIcon from '../../images/physicalEducationIcon.png';
import religionIcon from '../../images/religionIcon.png';

const subjectDetails = {
  portuguese: { name: 'Língua Portuguesa', icon: portugueseIcon },
  mathematics: { name: 'Matemática', icon: mathematicsIcon },
  science: { name: 'Ciências', icon: scienceIcon },
  geography: { name: 'Geografia', icon: geographyIcon },
  history: { name: 'História', icon: historyIcon },
  art: { name: 'Arte', icon: artIcon },
  english: { name: 'Língua Inglesa', icon: englishIcon },
  physicalEducation: { name: 'Educação Física', icon: physicalEducationIcon },
  religion: { name: 'Ensino Religioso', icon: religionIcon }
};

const DashboardProfessor = () => {
  const { globalUid } = useContext(UserContext);
  const [schoolId, setSchoolId] = useState('');
  const [subject, setSubject] = useState('');
  const [contents, setContents] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedContent, setSelectedContent] = useState('');
  const [responses, setResponses] = useState([]);
  const [unanswered, setUnanswered] = useState([]);
  const [studentResponseCounts, setStudentResponseCounts] = useState([]);
  const [page, setPage] = useState(1);
  const [studentPage, setStudentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchUserData = async () => {
      const userDoc = await getDoc(doc(db, 'users', globalUid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setSchoolId(userData.schoolId);
        setSubject(userData.subject);
      }
    };

    fetchUserData();
  }, [globalUid]);

  useEffect(() => {
    const fetchContents = async () => {
      if (!schoolId || !subject) return;

      const contentSnapshot = await getDocs(query(collection(db, `${subject}Questions`), where('schoolId', '==', schoolId)));
      const contentList = contentSnapshot.docs.map(doc => doc.data().subject);
      const uniqueContentList = [...new Set(contentList)];
      const contentQuestionCounts = uniqueContentList.map(content => {
        return {
          name: content,
          questionsCount: contentSnapshot.docs.filter(doc => doc.data().subject === content).length
        };
      });
      setContents(contentQuestionCounts);
    };

    fetchContents();
  }, [schoolId, subject]);

  useEffect(() => {
    const fetchStudents = async () => {
      if (!schoolId) return;

      const studentsSnapshot = await getDocs(query(collection(db, 'users'), where('schoolId', '==', schoolId), where('role', '==', 'student')));
      const studentList = studentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setStudents(studentList);
    };

    fetchStudents();
  }, [schoolId]);

  useEffect(() => {
    const fetchResponses = async () => {
      if (!selectedContent || !schoolId || !subject) return;

      const responsesSnapshot = await getDocs(query(collection(db, `user${subject.charAt(0).toUpperCase() + subject.slice(1)}Responses`), where('subject', '==', selectedContent)));
      const responseList = responsesSnapshot.docs.map(doc => doc.data());

      const answeredStudentIds = responseList.map(response => response.userId);
      const unansweredStudents = students.filter(student => !answeredStudentIds.includes(student.id));

      setResponses(responseList);
      setUnanswered(unansweredStudents);
    };

    fetchResponses();
  }, [selectedContent, schoolId, subject, students]);

  useEffect(() => {
    const fetchAllResponsesForSubject = async () => {
      if (!schoolId || !subject) return;

      const responseCounts = {};
      for (let student of students) {
        responseCounts[student.id] = { ...student, count: 0 };
      }

      const responsesSnapshot = await getDocs(query(collection(db, `user${subject.charAt(0).toUpperCase() + subject.slice(1)}Responses`), where('schoolId', '==', schoolId)));
      responsesSnapshot.docs.forEach(doc => {
        const data = doc.data();
        if (responseCounts[data.userId]) {
          responseCounts[data.userId].count += 1;
        }
      });

      setStudentResponseCounts(Object.values(responseCounts));
    };

    fetchAllResponsesForSubject();
  }, [schoolId, students, subject]);

  const CustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
    const RADIAN = Math.PI / 180;
    const radius = 25 + innerRadius + (outerRadius - innerRadius);
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text x={x} y={y} fill="black" textAnchor="middle" dominantBaseline="central">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const renderResponsesChart = () => {
    const answeredStudents = [...new Set(responses.map(response => {
      const student = students.find(student => student.id === response.userId);
      return student ? student.name : null;
    }).filter(name => name))];

    const data = [
      { name: 'Respondidas', value: answeredStudents.length },
      { name: 'Não respondidas', value: unanswered.length }
    ];

    const colors = ['#1cb66c', '#db3539'];

    return (
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            labelLine={false}
            label={CustomizedLabel}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={{ fontFamily: 'Arial', fontSize: 12 }} />
          <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontFamily: 'Arial', fontSize: 14 }} />
        </PieChart>
      </ResponsiveContainer>
    );
  };

  const groupedResponses = responses.reduce((acc, response) => {
    const student = students.find(student => student.id === response.userId);
    if (student) {
      if (!acc[student.name]) {
        acc[student.name] = { ...student, count: 0 };
      }
      acc[student.name].count += 1;
    }
    return acc;
  }, {});

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleStudentPageChange = (event, newPage) => {
    setStudentPage(newPage);
  };

  const paginatedContents = contents.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  const paginatedStudentResponses = studentResponseCounts.slice((studentPage - 1) * itemsPerPage, studentPage * itemsPerPage);

  return (
    <Container>
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom textAlign="center" sx={{ paddingTop: '2%' }}>
          Dashboard Professor
        </Typography>

        <Divider sx={{ marginY: 5 }} />
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
          <Typography variant="h4" gutterBottom style={{ marginRight: '14px' }}>
            {`${subjectDetails[subject]?.name || subject}`}
          </Typography>
          {subjectDetails[subject] && (
            <img src={subjectDetails[subject].icon} alt={`${subjectDetails[subject].name} icon`} style={{ marginBottom: '0.80%', width: '40px' }} />
          )}
        </Box>
        
        <Grid container spacing={4} sx={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <Grid item sx= {{ width: '330px'}}>
            <Paper elevation={2} sx={{ p: 2, minHeight: '305px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <Box>
                {paginatedContents.map((content, index) => (
                  <Box key={index} sx={{ marginTop: '3%' }}>
                    <Typography variant="body1" sx={{ fontFamily: 'Arial', fontSize: 14 }}>
                      {`Conteúdo: ${content.name}`}
                    </Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'Arial', fontSize: 14, color: 'gray', marginBottom: '3%' }}>
                      {`Quantidade de Perguntas: ${content.questionsCount}`}
                    </Typography>
                  </Box>
                ))}
              </Box>
              <Pagination 
                count={Math.ceil(contents.length / itemsPerPage)}
                page={page}
                onChange={handleChangePage}
                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 2 }}
              />
            </Paper>
          </Grid>

          <Grid item sx= {{ width: '330px'}}>
            <Paper elevation={2} sx={{ p: 2, minHeight: '305px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <Box>
                {paginatedStudentResponses.map((student, index) => (
                    <Box key={index} sx={{ marginTop: '3%' }}>
                    <Typography variant="body1" sx={{ fontFamily: 'Arial', fontSize: 14 }}>
                        {`${student.name}`}
                    </Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'Arial', fontSize: 14, color: 'gray', marginBottom: '3%' }}>
                        {`Respostas Totais: ${student.count}`}
                    </Typography>
                    </Box>
                ))}
                </Box>
                <Pagination 
                count={Math.ceil(studentResponseCounts.length / itemsPerPage)}
                page={studentPage}
                onChange={handleStudentPageChange}
                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 2 }}
                />
            </Paper>
        </Grid>

          <Grid item sx= {{width: '330px'}}>
            <Paper elevation={2} sx={{ p: 2, minHeight: '305px' }}>
              
            </Paper>
          </Grid>

          <Grid item xs={6}>
            <Paper elevation={2} sx={{ p: 2 }}>
              <FormControl fullWidth>
                <InputLabel id="select-content-label">Selecione o Conteúdo</InputLabel>
                <Select
                  labelId="select-content-label"
                  id="select-content"
                  value={selectedContent}
                  label="Selecione o Conteúdo"
                  onChange={(e) => setSelectedContent(e.target.value)}
                >
                  {contents.map((content, index) => (
                    <MenuItem key={index} value={content.name}>
                      {content.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Box sx={{ mt: 4 }}>
                    {renderResponsesChart()}
                    <Typography variant="body1" sx={{ fontFamily: 'Arial', fontSize: 18, mt: 4 }}>
                        Estudantes que responderam
                    </Typography>
                    <Box>
                        {[...new Set(responses.map(response => {
                        const student = students.find(student => student.id === response.userId);
                        return student ? student : null;
                        }).filter(student => student))].map((student, index) => (
                        <Box key={index} sx={{ marginTop: '2%' }}>
                            <Typography variant="body1" sx={{ fontFamily: 'Arial', fontSize: 14 }}>
                            {`Estudante: ${student.name}`}
                            </Typography>
                            <Typography variant="body2" sx={{ fontFamily: 'Arial', fontSize: 14, color: 'gray', marginBottom: '2%' }}>
                            {`Série: ${student.schoolYear}`}
                            </Typography>
                        </Box>
                        ))}
                    </Box>
                    <Typography variant="body1" sx={{ fontFamily: 'Arial', fontSize: 18, mt: 2 }}>
                        Estudantes que não responderam
                    </Typography>
                    <Box>
                        {unanswered.map((student, index) => (
                        <Box key={index} sx={{ marginTop: '2%' }}>
                            <Typography variant="body1" sx={{ fontFamily: 'Arial', fontSize: 14 }}>
                            {`Estudante: ${student.name}`}
                            </Typography>
                            <Typography variant="body2" sx={{ fontFamily: 'Arial', fontSize: 14, color: 'gray', marginBottom: '2%' }}>
                            {`Série: ${student.schoolYear}`}
                            </Typography>
                        </Box>
                        ))}
                    </Box>
                    </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default DashboardProfessor;
