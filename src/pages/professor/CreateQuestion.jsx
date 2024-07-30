import React, { useState, useEffect, useContext } from 'react';
import { doc, setDoc, collection, getDoc } from 'firebase/firestore';
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
};

function CreateQuestion({ onClose }) {
  const [subject, setSubject] = useState('');
  const [subjectField, setSubjectField] = useState('');
  const [question, setQuestion] = useState('');
  const [answers, setAnswers] = useState(['', '', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [status, setStatus] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [errorFields, setErrorFields] = useState({});
  const [schoolId, setSchoolId] = useState('');

  const { globalUid } = useContext(UserContext);

  useEffect(() => {
    const fetchAdminMasterDetails = async () => {
      const userDoc = await getDoc(doc(db, 'users', globalUid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setSchoolId(userData.schoolId);
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
    if (!question) {
      validationErrors.question = true;
    }
    if (answers.some(answer => !answer)) {
      validationErrors.answers = true;
    }
    if (!correctAnswer) {
      validationErrors.correctAnswer = true;
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrorFields(validationErrors);
      return;
    }

    try {
      const questionData = {
        subject: subjectField,  // Alterado para salvar subjectField como subject
        question,
        answers,
        correctAnswer: answers[correctAnswer],
        schoolId,
      };

      const collectionName = subjectCollections[subject];
      const newQuestionRef = doc(collection(db, collectionName));
      await setDoc(newQuestionRef, questionData);

      setOpenDialog(true);
    } catch (error) {
      console.error('Error creating question:', error);
      setStatus('Erro ao criar a questão. Por favor, tente novamente.');
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
          Criar Questão
        </Typography>
      </div>
      <Divider sx={{ width: '80%', margin: 'auto', height: '50%' }} />
      <Box sx={{ maxWidth: '70%', margin: 'auto', bgcolor: '#fff', paddingTop: '2.5%' }}>
        <div style={{ display: 'flex' }}>
          <Typography variant="h6" sx={{ mb: 0 }}>
            Selecione:
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
              <MenuItem value="portuguese">Língua Portuguesa</MenuItem>
              <MenuItem value="mathematics">Matemática</MenuItem>
              <MenuItem value="science">Ciências</MenuItem>
              <MenuItem value="geography">Geografia</MenuItem>
              <MenuItem value="history">História</MenuItem>
              <MenuItem value="art">Arte</MenuItem>
              <MenuItem value="english">Língua Inglesa</MenuItem>
              <MenuItem value="physicalEducation">Educação Física</MenuItem>
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
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
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
                Criar
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
        <DialogTitle>Questão criada com sucesso!</DialogTitle>
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
