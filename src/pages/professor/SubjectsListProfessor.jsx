import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { db } from '../../firebase/firebase.js';
import { collection, getDocs, query, where, doc, getDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { Container, Typography, List, ListItem, ListItemText, ListItemButton, Box, Divider, Paper, TextField, Pagination, Card, CardContent, Grid, IconButton, Dialog, DialogContent, DialogActions, DialogTitle, Button } from '@mui/material';
import { CheckCircle, Cancel, Edit, Delete } from '@mui/icons-material';
import TextWithColor from '../../components/TextWithColors.jsx';
import UserContext from '../../contexts/UserContext.jsx';
import CreateQuestion from './CreateQuestion';
import portugueseIcon from '../../images/portugueseIcon.png';
import mathematicsIcon from '../../images/mathematicsIcon.png';
import scienceIcon from '../../images/scienceIcon.png';
import geographyIcon from '../../images/geographyIcon.png';
import historyIcon from '../../images/historyIcon.png';
import artIcon from '../../images/artIcon.png';
import englishIcon from '../../images/englishIcon.png';
import physicalEducationIcon from '../../images/physicalEducationIcon.png';
import religionIcon from '../../images/religionIcon.png';

const SubjectsListProfessor = () => {
  const { subjectId } = useParams();
  const { globalUid } = useContext(UserContext);
  const [subjects, setSubjects] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [schoolId, setSchoolId] = useState('');
  const [userSchoolSubject, setUserSchoolSubject] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [questionToEdit, setQuestionToEdit] = useState(null);
  const [questionToDelete, setQuestionToDelete] = useState(null);
  const subjectsPerPage = 7;
  const navigate = useNavigate();

  const subjectDetails = {
    portuguese: { name: 'Língua Portuguesa', color: '#FF6347', icon: portugueseIcon },
    mathematics: { name: 'Matemática', color: '#eed171', icon: mathematicsIcon },
    science: { name: 'Ciências', color: '#5bcb77', icon: scienceIcon },
    geography: { name: 'Geografia', color: '#00BFFF', icon: geographyIcon },
    history: { name: 'História', color: '#DEB887', icon: historyIcon },
    art: { name: 'Arte', color: 'linear-gradient(to right, red, orange, yellow, green, blue, indigo, violet)', icon: artIcon },
    english: { name: 'Língua Inglesa', color: 'linear-gradient(to right, blue, #b7b9b9, red)', icon: englishIcon },
    physicalEducation: { name: 'Educação Física', color: '#ed8900', icon: physicalEducationIcon },
    religion: { name: 'Ensino Religioso', color: '#aea881', icon: religionIcon }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      const userDoc = await getDoc(doc(db, 'users', globalUid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setSchoolId(userData.schoolId);
        setUserSchoolSubject(userData.schoolSubject);
      }
    };

    fetchUserData();
  }, [globalUid]);

  useEffect(() => {
    if (schoolId && userSchoolSubject) {
      const fetchSubjectsAndQuestions = async () => {
        const q = query(collection(db, `${userSchoolSubject}Questions`), where("schoolId", "==", schoolId));
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
  }, [schoolId, userSchoolSubject, subjectId]);

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
        await deleteDoc(doc(db, `${userSchoolSubject}Questions`, questionToDelete));
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
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 4, mb: 2, marginBottom: '5%', marginTop: '6%' }}>
        <Typography variant="h3" gutterBottom className="text-shadow">
          <TextWithColor subject={subjectId} text={getSubjectDisplayName(subjectId)} color={subjectDetails[subjectId]?.color} />
          {subjectDetails[subjectId]?.icon && (
          <img src={subjectDetails[subjectId].icon} alt={`${subjectId} icon`} style={{width: '38px', marginLeft: '15px' }} />
        )}
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
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <ListItemText primary={<TextWithColor subject={item.subject} text={item.subject} color={item.color} />} />
                    </Box>
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
                        Questão do {question.schoolYear}º ano {question.classRoom}
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
