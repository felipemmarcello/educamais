import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { db } from '../../firebase/firebase.js';
import { collection, getDocs, query, where, doc, getDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { Container, Typography, List, ListItem, ListItemText, ListItemButton, Box, Divider, Paper, TextField, Pagination, Card, CardContent, Grid, IconButton, Dialog, DialogContent, DialogActions, DialogTitle, Button } from '@mui/material';
import { CheckCircle, Cancel, Edit, Delete } from '@mui/icons-material';
import TextWithColor from '../../components/TextWithColors.jsx';
import UserContext from '../../contexts/UserContext.jsx';
import CreateQuestion from './CreateQuestion';

const SubjectsListProfessor = () => {
  const { subjectId } = useParams();
  const { globalUid } = useContext(UserContext);
  const [subjects, setSubjects] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [schoolId, setSchoolId] = useState('');
  const [userSubject, setUserSubject] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [questionToEdit, setQuestionToEdit] = useState(null);
  const [questionToDelete, setQuestionToDelete] = useState(null);
  const subjectsPerPage = 7;
  const navigate = useNavigate();

  const subjectDetails = {
    portuguese: { name: 'Língua Portuguesa', color: '#FF6347' },
    mathematics: { name: 'Matemática', color: '#eed171' },
    science: { name: 'Ciências', color: '#5bcb77' },
    geography: { name: 'Geografia', color: '#00BFFF' },
    history: { name: 'História', color: '#DEB887' },
    art: { name: 'Arte', color: 'linear-gradient(to right, red, orange, yellow, green, blue, indigo, violet)' },
    english: { name: 'Língua Inglesa', color: 'linear-gradient(to right, blue, #b7b9b9, red)' },
    physicalEducation: { name: 'Educação Física', color: '#ed8900' },
    religion: { name: 'Ensino Religioso', color: '#aea881' }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      const userDoc = await getDoc(doc(db, 'users', globalUid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setSchoolId(userData.schoolId);
        setUserSubject(userData.subject);
      }
    };

    fetchUserData();
  }, [globalUid]);

  useEffect(() => {
    if (schoolId && userSubject) {
      const fetchSubjectsAndQuestions = async () => {
        const q = query(collection(db, `${userSubject}Questions`), where("schoolId", "==", schoolId));
        const querySnapshot = await getDocs(q);
        let fetchedSubjects = new Set();
        let fetchedQuestions = [];
        querySnapshot.docs.forEach((doc) => {
          const data = doc.data();
          fetchedSubjects.add(data.subject);
          fetchedQuestions.push({ id: doc.id, ...data });
        });
        const subjectsArray = Array.from(fetchedSubjects).map(subject => ({
          subject,
          ...subjectDetails[subject]
        }));
        subjectsArray.sort((a, b) => a.subject.localeCompare(b.subject));
        setSubjects(subjectsArray);
        setQuestions(fetchedQuestions);
      };

      fetchSubjectsAndQuestions();
    }
  }, [schoolId, userSubject, subjectId]);

  const handleNavigation = (subject) => {
    setSelectedSubject(subject);
  };

  const handleChangePage = (event, value) => {
    setPage(value);
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setPage(1);
  };

  const handleEditClick = (question) => {
    setQuestionToEdit(question);
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (questionId) => {
    setQuestionToDelete(questionId);
    setDeleteDialogOpen(true);
  };

  const handleEditDialogClose = () => {
    setEditDialogOpen(false);
    setQuestionToEdit(null);
  };

  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
    setQuestionToDelete(null);
  };

  const handleDeleteQuestion = async () => {
    if (questionToDelete) {
      try {
        await deleteDoc(doc(db, `${userSubject}Questions`, questionToDelete));
        setQuestions((prevQuestions) => prevQuestions.filter(q => q.id !== questionToDelete));
        handleDeleteDialogClose();
      } catch (error) {
        console.error('Erro ao deletar questão:', error);
      }
    }
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
      <Box sx={{ marginTop: '5%', marginLeft: 'auto', marginRight: 'auto', width: '70%' }}>
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
          <Paper elevation={0} sx={{ padding: '20px' }}>
            <Typography variant="h5" gutterBottom>
              Questões do conteúdo: {selectedSubject}
            </Typography>
            <Grid container spacing={3}>
              {questionsForSelectedSubject.map((question, index) => (
                <Grid item xs={12} sm={6} key={index}>
                  <Card sx={{ width: '100%', mb: 0 }}>
                    <CardContent>
                      <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.875rem', mt: 0, marginBottom: '5px' }}>
                        Questão do {question.schoolYear}º ano
                      </Typography>
                      <Typography variant="h6" sx={{ fontSize: '1rem' }}>{question.question}</Typography>
                      <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.875rem', mt: 1 }}>Alternativas:</Typography>
                      <List>
                        {question.answers.map((answer, i) => (
                          <ListItem key={i} sx={{ paddingBottom: '0px', pl: 2 }}>
                            <ListItemText primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', paddingBottom: '0px' }}>
                                <Box sx={{ flexGrow: 2 }}>{answer}</Box>
                                {answer === question.correctAnswer && <CheckCircle color="success" />}
                                {answer !== question.correctAnswer && <Cancel color="error" />}
                              </Box>
                            } sx={{ fontSize: '0.875rem' }} />
                          </ListItem>
                        ))}
                      </List>
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <IconButton style={{ color: '#8c88c' }} onClick={() => handleEditClick(question)}>
                          <Edit />
                        </IconButton>
                        <IconButton style={{ color: '#e8533e' }} onClick={() => handleDeleteClick(question.id)}>
                          <Delete />
                        </IconButton>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Box>
      )}
      <Dialog open={editDialogOpen} onClose={handleEditDialogClose} fullWidth maxWidth="md">
        <DialogContent>
          {questionToEdit && <CreateQuestion question={questionToEdit} onClose={handleEditDialogClose} />}
        </DialogContent>
      </Dialog>
      <Dialog open={deleteDialogOpen} onClose={handleDeleteDialogClose}>
        <DialogTitle>Confirmação de Exclusão</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Tem certeza que deseja excluir esta questão?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleDeleteQuestion} color="secondary">
            Excluir
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SubjectsListProfessor;