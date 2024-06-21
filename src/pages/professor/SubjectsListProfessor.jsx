import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { db } from '../../firebase/firebase.js';
import { collection, getDocs } from 'firebase/firestore';
import { Container, Typography, List, ListItem, ListItemText, ListItemButton, Box, Divider, Paper, TextField, Pagination, Card, CardContent } from '@mui/material';
import TextWithColor from '../../components/TextWithColors.jsx';

const SubjectsListProfessor = () => {
  const { subjectId } = useParams();
  const [subjects, setSubjects] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const subjectsPerPage = 7;
  const navigate = useNavigate();

  // Mapeamento de subjectId para nome e cor
  const subjectDetails = {
    portuguese: { name: 'Língua Portuguesa', color: '#FF6347' },
    mathematics: { name: 'Matemática', color: '#FFD700' },
    science: { name: 'Ciências', color: '#00FA9A' },
    geography: { name: 'Geografia', color: '#00BFFF' },
    history: { name: 'História', color: '#DEB887' },
    art: { name: 'Arte', color: 'linear-gradient(to right, red, orange, yellow, green, blue, indigo, violet)' },
    english: { name: 'Língua Inglesa', color: 'linear-gradient(to right, blue, red, white)' }
  };

  useEffect(() => {
    const fetchSubjects = async () => {
      const querySnapshot = await getDocs(collection(db, `${subjectId}Questions`));
      let fetchedSubjects = new Set();
      let fetchedQuestions = [];
      querySnapshot.docs.forEach((doc) => {
        const data = doc.data();
        fetchedSubjects.add(data.subject);
        fetchedQuestions.push(data);
      });
      const subjectsArray = Array.from(fetchedSubjects).map(subject => ({
        subject,
        ...subjectDetails[subject]
      }));
      // Ordenar os subjects em ordem alfabética
      subjectsArray.sort((a, b) => a.subject.localeCompare(b.subject));
      setSubjects(subjectsArray);
      setQuestions(fetchedQuestions);
    };

    fetchSubjects();
  }, [subjectId]);

  const handleNavigation = (subject) => {
    setSelectedSubject(subject);
  };

  const handleChangePage = (event, value) => {
    setPage(value);
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setPage(1); // Reset page to 1 when search term changes
  };

  const filteredSubjects = subjects.filter(subject =>
    subject.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedSubjects = filteredSubjects.slice((page - 1) * subjectsPerPage, page * subjectsPerPage);

  const getSubjectDisplayName = (subjectId) => {
    const details = subjectDetails[subjectId];
    return details ? details.name : subjectId.charAt(0).toUpperCase() + subjectId.slice(1);
  };

  const questionsForSelectedSubject = questions.filter(question => question.subject === selectedSubject);

  return (
    <Container>
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 2, marginBottom: '5%', marginTop: '6%' }}>
        <Typography variant="h3" gutterBottom className="text-shadow">
          <TextWithColor subject={subjectId} text={getSubjectDisplayName(subjectId)} color={subjectDetails[subjectId]?.color} />
        </Typography>
      </Box>
      <Box sx={{ marginTop: '5%', marginLeft: 'auto', marginRight: 'auto', width: '100%' }}>
        <Paper elevation={2} sx={{ padding: '20px' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: '20px' }}>
            <Typography variant="h5" gutterBottom>
              Conteúdos
            </Typography>
            <TextField
              label="Pesquisar"
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={handleSearch}
            />
          </Box>
          <List>
            {paginatedSubjects.map((item, index) => (
              <React.Fragment key={index}>
                <ListItem disablePadding>
                  <ListItemButton onClick={() => handleNavigation(item.subject)}>
                    <ListItemText primary={<TextWithColor subject={item.subject} text={item.subject} color={item.color} />} />
                  </ListItemButton>
                </ListItem>
                {index < paginatedSubjects.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Pagination
              count={Math.ceil(filteredSubjects.length / subjectsPerPage)}
              page={page}
              onChange={handleChangePage}
              color="primary"
            />
          </Box>
        </Paper>
      </Box>
      {selectedSubject && (
        <Box sx={{ marginTop: '5%', marginLeft: 'auto', marginRight: 'auto', width: '100%' }}>
          <Paper elevation={2} sx={{ padding: '20px' }}>
            <Typography variant="h5" gutterBottom>
              Questões para {selectedSubject}
            </Typography>
            <List>
              {questionsForSelectedSubject.map((question, index) => (
                <React.Fragment key={index}>
                  <ListItem disablePadding>
                    <Card sx={{ width: '100%', mb: 2 }}>
                      <CardContent>
                        <Typography variant="h6">{question.question}</Typography>
                        <Typography variant="body2" color="textSecondary">Alternativas:</Typography>
                        <List>
                          {question.answers.map((answer, i) => (
                            <ListItem key={i}>
                              <ListItemText primary={answer} />
                            </ListItem>
                          ))}
                        </List>
                        <Typography variant="body2" color="textSecondary">Resposta Correta: {question.correctAnswer}</Typography>
                      </CardContent>
                    </Card>
                  </ListItem>
                  {index < questionsForSelectedSubject.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Box>
      )}
    </Container>
  );
};

export default SubjectsListProfessor;
