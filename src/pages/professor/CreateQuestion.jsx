import React, { useState, useEffect, useContext } from 'react';
import { doc, setDoc, collection, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebase.js';
import { TextField, Button, Select, MenuItem, FormControl, InputLabel, Box, Typography, Grid, Divider, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, InputAdornment } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import UserContext from '../../contexts/UserContext.jsx';

const subjectCollections = {
  portuguese: 'portugueseQuestions',
  mathematics: 'mathematicsQuestions',
  science: 'scienceQuestions',
  geography: 'geographyQuestions',
  history: 'historyQuestions',
  art: 'artQuestions',
  english: 'englishQuestions',
  physicalEducation: 'physicalEducationQuestions',
  religion: 'religionQuestions'
};

const subjectDetails = {
  portuguese: { name: 'Língua Portuguesa' },
  mathematics: { name: 'Matemática' },
  science: { name: 'Ciências' },
  geography: { name: 'Geografia' },
  history: { name: 'História' },
  art: { name: 'Arte' },
  english: { name: 'Língua Inglesa' },
  physicalEducation: { name: 'Educação Física' },
  religion: {name: 'Ensino Religioso'},
};

function CreateQuestion({ question, onClose }) {
  const [subject, setSubject] = useState(question ? question.subject : '');
  const [subjectField, setSubjectField] = useState(question ? question.subject : '');
  const [questionText, setQuestionText] = useState(question ? question.question : '');
  const [answers, setAnswers] = useState(question ? question.answers : ['', '', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState(question ? question.answers.indexOf(question.correctAnswer) : '');
  const [status, setStatus] = useState('');
  const [schoolYear, setSchoolYear] = useState(question ? question.schoolYear : '');
  const [openDialog, setOpenDialog] = useState(false);
  const [errorFields, setErrorFields] = useState({});
  const [schoolId, setSchoolId] = useState('');
  const [userSubject, setUserSubject] = useState('');

  const { globalUid } = useContext(UserContext);

  useEffect(() => {
    const fetchAdminMasterDetails = async () => {
      const userDoc = await getDoc(doc(db, 'users', globalUid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setSchoolId(userData.schoolId);
        setUserSubject(userData.subject);
      }
    };

    fetchAdminMasterDetails();
  }, [globalUid]);

  const handleDialogClose = () => {
    setOpenDialog(false);
    setStatus('');
    if (onClose) onClose();
  };

  const handleSaveQuestion = async () => {
    setErrorFields({});
    let validationErrors = {};

    if (!subject) {
      validationErrors.subject = true;
    }
    if (!subjectField) {
      validationErrors.subjectField = true;
    }
    if (!questionText) {
      validationErrors.question = true;
    }
    if (answers.some(answer => !answer)) {
      validationErrors.answers = true;
    }
    if (!correctAnswer && correctAnswer !== 0) {
      validationErrors.correctAnswer = true;
    }
    if (!schoolYear) {
      validationErrors.schoolYear = true;
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrorFields(validationErrors);
      return;
    }

    try {
      const questionData = {
        subject: subjectField, 
        question: questionText,
        answers,
        correctAnswer: answers[correctAnswer],
        schoolId,
        schoolYear,
      };

      const collectionName = subjectCollections[subject];
      if (question) {
        // Update existing question
        const questionRef = doc(db, collectionName, question.id);
        await updateDoc(questionRef, questionData);
      } else {
        // Create new question
        const newQuestionRef = doc(collection(db, collectionName));
        await setDoc(newQuestionRef, questionData);
      }

      setOpenDialog(true);
    } catch (error) {
      console.error('Error creating/updating question:', error);
      setStatus('Erro ao salvar a questão. Por favor, tente novamente.');
    }
  };

  const handleAnswerChange = (index, value) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  return (
    <div>
      <div style={{ display: 'flex', paddingTop: '5%', paddingLeft: '12%' }}>
        <Typography variant="h3" sx={{ mb: 2 }}>
          {question ? 'Editar Questão' : 'Criar Questão'}
        </Typography>
      </div>
      <Divider sx={{ width: '80%', margin: 'auto', height: '50%' }} />
      <Box sx={{ maxWidth: '70%', margin: 'auto', bgcolor: '#fff', paddingTop: '2.5%' }}>
        <div style={{ display: 'flex' }}>
          <Typography variant="h6" sx={{ mb: 0 }}>
            Selecione a matéria:
          </Typography>
        </div>
        <Box sx={{ display: 'flex', mb: 1 }}>
          <FormControl sx={{ width: 220, mb: 1,
                  '& .MuiOutlinedInput-root': {
                  '&.Mui-focused fieldset': {
                    borderColor: '#c5c5c5',
                  },
                }, }} margin="normal">
            <InputLabel id="subject-select-label">Matéria</InputLabel>
            <Select
              labelId="subject-select-label"
              id="subject-select"
              value={subject}
              label="Matéria"
              onChange={(e) => setSubject(e.target.value)}
            >
              <MenuItem value={userSubject}>{subjectDetails[userSubject]?.name}</MenuItem>
            </Select>
            {errorFields.subject && <Typography color="error">Campo obrigatório</Typography>}
          </FormControl>
        </Box>

        {subject && (
          <>
            <div style={{ display: 'flex' }}>
                <Typography variant="h6" sx={{ mb: 0 }}>
                    Questão 
                </Typography>
            </div>

            <Grid container spacing={0} sx= {{paddingTop: '-30px'}}>
              <Grid item xs={2.5}>
                <FormControl fullWidth margin="normal">
                  <InputLabel id="school-year-select-label">Ano Escolar</InputLabel>
                  <Select
                    labelId="school-year-select-label"
                    id="school-year-select"
                    value={schoolYear}
                    label="Ano Escolar"
                    onChange={(e) => setSchoolYear(e.target.value)}
                    sx={{ mb: 0 }}
                  >
                    <MenuItem value="6">6º ano</MenuItem>
                    <MenuItem value="7">7º ano</MenuItem>
                    <MenuItem value="8">8º ano</MenuItem>
                    <MenuItem value="9">9º ano</MenuItem>
                  </Select>
                  {errorFields.schoolYear && <Typography color="error">Campo obrigatório</Typography>}
                </FormControl>
              </Grid>

              <Grid item xs={0.5}>
              </Grid>

              <Grid item xs={7.8}>
                <TextField
                  fullWidth
                  variant="outlined"
                  label="Conteúdo (Teorema de Pitagoras, Revolução Industrial, ...)"
                  value={subjectField}
                  onChange={(e) => setSubjectField(e.target.value)}
                  margin="normal"
                  required
                  error={!!errorFields.subjectField}
                  helperText={errorFields.subjectField && "Campo obrigatório"}
                  sx={{ mb: 0 }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  variant="outlined"
                  label="Enunciado"
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  margin="normal"
                  required
                  error={!!errorFields.question}
                  helperText={errorFields.question && "Campo obrigatório"}
                  sx={{ mb: 0 }}
                />
              </Grid>

              {answers.map((answer, index) => (
                <Grid item xs={12} key={index}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    value={answer}
                    onChange={(e) => handleAnswerChange(index, e.target.value)}
                    margin="normal"
                    required
                    error={!!errorFields.answers}
                    helperText={errorFields.answers && "Todas as respostas são obrigatórias"}
                    sx={{ mb: 0 }}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">{String.fromCharCode(97 + index)})</InputAdornment>,
                    }}
                  />
                </Grid>
              ))}
                <Grid item xs={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel id="correct-answer-select-label">Resposta Correta</InputLabel>
                  <Select
                    labelId="correct-answer-select-label"
                    id="correct-answer-select"
                    value={correctAnswer}
                    label="Resposta Correta"
                    onChange={(e) => setCorrectAnswer(e.target.value)}
                    sx={{ mb: 0 }}
                  >
                    {answers.map((answer, index) => (
                      <MenuItem key={index} value={index}>
                        {String.fromCharCode(97 + index)}) {answer}
                      </MenuItem>
                    ))}
                  </Select>
                  {errorFields.correctAnswer && <Typography color="error">Campo obrigatório</Typography>}
                </FormControl>
              </Grid>
            </Grid>
            <div style={{ display: 'flex', justifyContent: 'end' }}>
              <Button
                variant="contained"
                style={{ backgroundColor: '#5589c4', color: '#ffffff' }}
                onClick={handleSaveQuestion}
                sx={{ mt: 2, width: '100px', marginTop: '4%', marginBottom: '3%', marginLeft: '2%' }}
              >
                {question ? 'Salvar' : 'Criar'}
              </Button>
            </div>
            {status && (
              <Typography color="error" sx={{ mt: 2 }}>
                {status}
              </Typography>
            )}
          </>
        )}
      </Box>

      <Dialog open={openDialog} onClose={handleDialogClose}>
        <DialogTitle>{question ? 'Questão atualizada com sucesso!' : 'Questão criada com sucesso!'}</DialogTitle>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <DialogContent style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <DialogContentText>
              {status}
            </DialogContentText>
            <CheckCircleIcon color="success" style={{ fontSize: 75 }} />
          </DialogContent>
        </div>
        <DialogActions>
          <Button onClick={handleDialogClose} style={{ color: '#5589c4' }}>
            Fechar
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default CreateQuestion;
