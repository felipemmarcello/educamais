import React, { useState, useEffect, useContext } from 'react';
import { db } from '../../firebase/firebase.js';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { Container, Typography, Box, Grid, Paper, Select, Divider, MenuItem, FormControl, InputLabel, Pagination } from '@mui/material';
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
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

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
  const [schoolSubject, setSchoolSubject] = useState(''); 
  const [contents, setContents] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedContent, setSelectedContent] = useState('');
  const [responses, setResponses] = useState([]);
  const [unanswered, setUnanswered] = useState([]);
  const [studentResponseCounts, setStudentResponseCounts] = useState([]);
  const [page, setPage] = useState(1);
  const [studentPage, setStudentPage] = useState(1);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [studentPerformance, setStudentPerformance] = useState({ correct: 0, incorrect: 0 });
  const [responsePage, setResponsePage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchUserData = async () => {
      const userDoc = await getDoc(doc(db, 'users', globalUid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setSchoolId(userData.schoolId);
        setSchoolSubject(userData.schoolSubject); // Alterado para usar schoolSubject
      }
    };

    fetchUserData();
  }, [globalUid]);

  useEffect(() => {
    const fetchContents = async () => {
      if (!schoolId || !schoolSubject) return;

      const contentSnapshot = await getDocs(query(collection(db, `${schoolSubject}Questions`), where('schoolId', '==', schoolId)));
      const contentList = contentSnapshot.docs.map(doc => doc.data().subject); // Ainda usa subject para conteúdos
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
  }, [schoolId, schoolSubject]);

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
      if (!selectedContent || !schoolId || !schoolSubject) return;

      const responsesSnapshot = await getDocs(query(collection(db, `user${schoolSubject.charAt(0).toUpperCase() + schoolSubject.slice(1)}Responses`), where('subject', '==', selectedContent)));
      const responseList = responsesSnapshot.docs.map(doc => doc.data());

      const answeredStudentIds = responseList.map(response => response.userId);
      const unansweredStudents = students.filter(student => !answeredStudentIds.includes(student.id));

      setResponses(responseList);
      setUnanswered(unansweredStudents);
    };

    fetchResponses();
  }, [selectedContent, schoolId, schoolSubject, students]);

  useEffect(() => {
    const fetchAllResponsesForSubject = async () => {
      if (!schoolId || !schoolSubject) return;

      const responseCounts = {};
      for (let student of students) {
        responseCounts[student.id] = { ...student, count: 0 };
      }

      const responsesSnapshot = await getDocs(query(collection(db, `user${schoolSubject.charAt(0).toUpperCase() + schoolSubject.slice(1)}Responses`), where('schoolId', '==', schoolId)));
      responsesSnapshot.docs.forEach(doc => {
        const data = doc.data();
        if (responseCounts[data.userId]) {
          responseCounts[data.userId].count += 1;
        }
      });

      setStudentResponseCounts(Object.values(responseCounts));
    };

    fetchAllResponsesForSubject();
  }, [schoolId, students, schoolSubject]);

  const fetchStudentPerformance = async (studentId, contentName) => {
    if (!studentId || !contentName || !schoolSubject) return { correct: 0, incorrect: 0 };

    const responsesSnapshot = await getDocs(query(collection(db, `user${schoolSubject.charAt(0).toUpperCase() + schoolSubject.slice(1)}Responses`), where('userId', '==', studentId), where('subject', '==', contentName)));
    let correct = 0;
    let incorrect = 0;

    responsesSnapshot.docs.forEach(doc => {
      const data = doc.data();
      if (data.isCorrect) {
        correct += 1;
      } else {
        incorrect += 1;
      }
    });

    return { correct, incorrect };
  };

  const paginatedResponses = responses
  .filter(
    (response) =>
      response.userId === selectedStudent &&
      response.subject === selectedContent
  )
  .slice((responsePage - 1) * itemsPerPage, responsePage * itemsPerPage);

// Função para trocar de página
const handleResponsePageChange = (event, newPage) => {
  setResponsePage(newPage);
};

  useEffect(() => {
    const updatePerformance = async () => {
      if (selectedStudent && selectedContent) {
        const performance = await fetchStudentPerformance(selectedStudent, selectedContent);
        setStudentPerformance(performance);
      }
    };

    updatePerformance();
  }, [selectedStudent, selectedContent]);

  const CustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const RADIAN = Math.PI / 180;
    const radius = 25 + innerRadius + (outerRadius - innerRadius);
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text x={x} y={y} fill="black" textAnchor="middle" dominantBaseline="central" fontFamily="Arial">
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

  const renderStudentPerformanceChart = () => {
    const data = [
      { name: 'Acertos', value: studentPerformance.correct },
      { name: 'Erros', value: studentPerformance.incorrect }
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
      <Box sx={{ mb: 4 }}>
        <div style={{ display: 'flex', paddingTop: '5%', paddingLeft: '12%' }}>
          <Typography variant="h3" sx={{ mb: 2 }}>
            Dashboard
          </Typography>
        </div>

        <Divider sx={{ width: '80%', margin: 'auto', height: '50%' }} />

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1, paddingTop: '3.5%', paddingBottom: '1.5%' }}>
          <Typography variant="h4" gutterBottom style={{ marginRight: '14px' }}>
            {`${subjectDetails[schoolSubject]?.name || schoolSubject}`} {/* Alterado para schoolSubject */}
          </Typography>
          {subjectDetails[schoolSubject] && (
            <img src={subjectDetails[schoolSubject].icon} alt={`${subjectDetails[schoolSubject].name} icon`} style={{ marginBottom: '0.80%', width: '40px' }} />
          )}
        </Box>
        
        <Grid container spacing={4} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Grid item sx={{ width: '330px' }}>
            <Paper elevation={2} sx={{ p: 2, minHeight: '305px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <Box>
                {paginatedContents.map((content, index) => (
                  <Box key={index} sx={{ marginTop: '3%' }}>
                    <Typography variant="body1" sx={{ fontFamily: 'Arial', fontSize: 14 }}>
                      {`Conteúdo: ${content.name}`}
                    </Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'Arial', fontSize: 14, color: 'gray', marginBottom: '3%' }}>
                      {`Quantidade de Questões: ${content.questionsCount}`}
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

          <Grid item sx={{ width: '330px' }}>
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

          <Grid item xs={5.4} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <FormControl sx={{ marginBottom: '4%' }}>
              <InputLabel id="select-content-label">Selecione o Conteúdo</InputLabel>
              <Select
                labelId="select-content-label"
                id="select-content"
                value={selectedContent}
                label="Selecione o Conteúdo"
                sx={{ width: '300px'}}
                onChange={(e) => setSelectedContent(e.target.value)}
              >
                {contents.map((content, index) => (
                  <MenuItem key={index} value={content.name}>
                    {content.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Paper elevation={2} sx={{ p: 2, width: '100%' }}>
              <Typography variant="body1" sx={{ fontFamily: 'Arial', fontSize: 18, marginBottom: '5%' }}>
                Quem respondeu?
              </Typography>
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
                        {`${student.name}`}
                      </Typography>
                      <Typography variant="body2" sx={{ fontFamily: 'Arial', fontSize: 14, color: 'gray', marginBottom: '2%' }}>
                        {`${student.schoolYear}º ano ${student.classRoom}`}
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
                        {`${student.name}`}
                      </Typography>
                      <Typography variant="body2" sx={{ fontFamily: 'Arial', fontSize: 14, color: 'gray', marginBottom: '2%' }}>
                        {`${student.schoolYear}º ano ${student.classRoom}`}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Paper>
          </Grid>

          {selectedContent && (
            <Grid item xs={5.4} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginLeft: '2.5%' }}>
              <FormControl sx={{ marginBottom: '4%' }}>
                <InputLabel id="select-student-label">Selecione o Estudante</InputLabel>
                <Select
                  labelId="select-student-label"
                  id="select-student"
                  value={selectedStudent}
                  label="Selecione o Estudante"
                  sx={{ width: '300px'}}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                >
                  {students.map((student, index) => (
                    <MenuItem key={index} value={student.id}>
                      {student.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Paper elevation={2} sx={{ p: 2, width: '100%' }}>
                <Typography variant="body1" sx={{ fontFamily: 'Arial', fontSize: 18, marginBottom: '5%' }}>
                  Quantidade de Acertos & Erros
                </Typography>

                <Box sx={{ mt: 4 }}>
                  {renderStudentPerformanceChart()}
                </Box>

                <Typography variant="body2" sx={{ fontFamily: 'Arial', fontSize: 14, color: 'gray', marginTop: '2%' }}>
                  {`Acertos: ${studentPerformance.correct}`}
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: 'Arial', fontSize: 14, color: 'gray', marginTop: '2%' }}>
                  {`Erros: ${studentPerformance.incorrect}`}
                </Typography>
              </Paper>
            </Grid>
          )}

          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
            {selectedStudent && selectedContent && (
              <Box sx={{ mt: 2, width: '80%' }}>
                <Typography 
                  variant="h6" 
                  sx={{ mb: 2, textAlign: 'center', fontSize: '1rem', fontFamily: 'Arial' }}
                >
                {`Respostas do ${students.find(student => student.id === selectedStudent)?.name || ''}`}
                </Typography>

                <Box>
                  {paginatedResponses.map((response, index) => (
                    <Box
                      key={index}
                      sx={{
                        mb: 2,
                        padding: '12px',
                        borderRadius: '8px',
                        border: '1px solid #e0e0e0',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography
                          variant="body1"
                          sx={{
                            fontWeight: 'bold',
                            marginBottom: '4px',
                            fontSize: '0.9rem',
                          }}
                        >
                          {`Pergunta: ${response.question}`}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            color: response.isCorrect ? '#388e3c' : '#d32f2f',
                            marginBottom: '2px',
                            display: 'flex',
                            alignItems: 'center',
                            fontSize: '0.85rem',
                          }}
                        >
                          {response.isCorrect ? (
                            <>
                              <CheckCircleIcon sx={{ mr: 1, fontSize: '1rem' }} />
                              {`Resposta Selecionada: ${response.selectedAnswer}`}
                            </>
                          ) : (
                            <>
                              <CancelIcon sx={{ mr: 1, fontSize: '1rem' }} />
                              {`Resposta Selecionada: ${response.selectedAnswer}`}
                            </>
                          )}
                        </Typography>
                        {!response.isCorrect && (
                          <Typography
                            variant="body2"
                            sx={{
                              color: '#388e3c',
                              marginTop: '10px',
                              marginBottom: '2px',
                              fontSize: '0.85rem',
                            }}
                          >
                            {`Resposta Correta: ${response.correctAnswer}`}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  ))}
                </Box>

                <Pagination
                  count={Math.ceil(
                    responses.filter(
                      (response) =>
                        response.userId === selectedStudent &&
                        response.subject === selectedContent
                    ).length / itemsPerPage
                  )}
                  page={responsePage}
                  onChange={handleResponsePageChange}
                  sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 2 }}
                />
              </Box>
            )}
          </Box>;

        </Grid>
      </Box>
    </Container>
  );
};

export default DashboardProfessor;
