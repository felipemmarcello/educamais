import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { db, auth } from "../../../firebase/firebase.js";
import { collection, getDocs, addDoc, doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { Container, Paper, Typography, Radio, RadioGroup, FormControl, FormControlLabel, Button, CircularProgress, Box, CardContent } from "@mui/material";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import TextWithColor from '../../../components/TextWithColors.jsx';
import JSConfetti from 'js-confetti';
import '../subjectsCSS/QuizStyles.css';

const QuizQuestion = ({
  question,
  selectedAnswer,
  handleAnswerSelect,
  handleSubmit,
  handleNextQuestion,
  handleFinish,
  feedback,
  feedbackColor,
  answered,
  currentQuestionIndex,
  totalQuestions
}) => (
  <div style={{ width: '720px', margin: '0, auto' }}>
    <Typography variant="h6" style={{ marginTop: '5%', marginLeft: '5%', paddingTop: '2%', fontSize: '1.10rem', marginRight: '5%' }} gutterBottom>
      {`${currentQuestionIndex + 1}) ${question.question}`}
    </Typography>
    <FormControl component="fieldset" style={{ display: 'flex', marginLeft: '5%', marginRight: '5%' }}>
      <RadioGroup value={selectedAnswer} onChange={handleAnswerSelect}>
        {question.answers.map((answer, index) => {
          let backgroundColor = "inherit";
          let color = "inherit";
          if (answered) {
            if (answer === question.correctAnswer) {
              backgroundColor = "#00a86b";
              color = "white";
            } else if (answer === selectedAnswer) {
              backgroundColor = "#e76b57";
              color = "white";
            }
          }
          return (
            <FormControlLabel
              key={index}
              value={answer}
              control={<Radio />}
              sx={{ paddingBottom: '6px' }}
              label={
                <span style={{ backgroundColor: backgroundColor, color: color, padding: '5px 0px', borderRadius: '3px' }}>
                  {answer}
                </span>
              }
              disabled={answered}
            />
          );
        })}
      </RadioGroup>
      <div style={{ display: 'flex', marginTop: 20, marginBottom: '3%' }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={answered || !selectedAnswer}
        >
          Responder
        </Button>
        {answered && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
            {currentQuestionIndex < totalQuestions - 1 ? (
              <Button variant="contained" color="secondary" onClick={handleNextQuestion} sx={{ minWidth: '100px', whiteSpace: 'nowrap' }}>
                Próxima Pergunta
              </Button>
            ) : (
              <Button variant="contained" color="secondary" onClick={handleFinish} sx={{ minWidth: '100px', whiteSpace: 'nowrap' }}>
                Finalizar
              </Button>
            )}
          </div>
        )}
      </div>
    </FormControl>
  </div>
);

const QuizResults = ({ correctCount, incorrectCount }) => (
  <CardContent sx={{ marginTop: '22%', width: '400px', height: '180px', textAlign: 'center', padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
    <Typography variant="h5" gutterBottom>Resultados</Typography>
    <Box display="flex" alignItems="center" mb={2}>
      <Typography variant="body1">Total de Perguntas: {correctCount + incorrectCount}</Typography>
    </Box>
    <Box display="flex" justifyContent="center" alignItems="center" mb={1}>
      <CheckCircleIcon color="success" sx={{ mr: 1 }} />
      <Typography variant="body1">Respostas Corretas: {correctCount}</Typography>
    </Box>
    <Box display="flex" justifyContent="center" alignItems="center">
      <CancelIcon color="error" sx={{ mr: 1 }} />
      <Typography variant="body1">Respostas Incorretas: {incorrectCount}</Typography>
    </Box>
  </CardContent>
);

const HistoryQuiz = () => {
  const { subjectId, selectedSubject } = useParams();
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [feedbackColor, setFeedbackColor] = useState("error");
  const [user, setUser] = useState(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [answered, setAnswered] = useState(false);
  const [subject, setSubject] = useState('');
  const [schoolYear, setSchoolYear] = useState('');
  const [schoolId, setSchoolId] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setSchoolYear(userData.schoolYear);
          setSchoolId(userData.schoolId);
        }
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const shuffleArray = (array) => {
    return array.sort(() => Math.random() - 0.5);
  };

  useEffect(() => {
    const fetchQuestions = async () => {
      const querySnapshot = await getDocs(collection(db, `${subjectId}Questions`));
      let fetchedQuestions = querySnapshot.docs
        .map((doc) => doc.data())
        .filter((question) => question.subject === selectedSubject);

      if (fetchedQuestions.length > 0) {
        const questionWithSubject = fetchedQuestions[0];
        setSubject(questionWithSubject.subject);
        
        fetchedQuestions = fetchedQuestions.map((question) => ({
          ...question,
          answers: shuffleArray(question.answers)
        }));
        setQuestions(fetchedQuestions);
      } else {
        console.log("Perguntas não encontradas!");
      }
    };

    fetchQuestions();
  }, [subjectId, selectedSubject]);

  const handleAnswerSelect = (event) => {
    setSelectedAnswer(event.target.value);
  };

  const handleSubmit = async () => {
    if (!user) {
      console.error("Usuário não autenticado!");
      return;
    }

    const currentQuestion = questions[currentQuestionIndex];

    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    if (isCorrect) {
      setFeedback("Correto!");
      setFeedbackColor("success");
      setCorrectCount(correctCount + 1);
    } else {
      setFeedback("Incorreta!");
      setFeedbackColor("error");
      setIncorrectCount(incorrectCount + 1);
    }

    await addDoc(collection(db, "userHistoryResponses"), {
      userId: user.uid,
      question: currentQuestion.question, 
      selectedAnswer,
      isCorrect: isCorrect,
      subject: currentQuestion.subject,
      schoolYear: schoolYear,
      schoolId: schoolId
    });

    setAnswered(true);
  };

  const handleNextQuestion = () => {
    setFeedback("");
    setSelectedAnswer("");
    setAnswered(false);
    setCurrentQuestionIndex(currentQuestionIndex + 1);
  };

  const handleFinish = () => {
    const jsConfetti = new JSConfetti();
    jsConfetti.addConfetti();
    setQuizFinished(true);
  };

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '3%' }}>
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 2, marginBottom: '3%' }}>
          <Typography variant="h3" gutterBottom>
            <TextWithColor subject="history" text={subject} />
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Container>
            <Paper elevation={2} sx={{ borderRadius: '5px'}}>
              {quizFinished ? (
                <QuizResults correctCount={correctCount} incorrectCount={incorrectCount} />
              ) : currentQuestion ? (
                <QuizQuestion
                  question={currentQuestion}
                  selectedAnswer={selectedAnswer}
                  handleAnswerSelect={handleAnswerSelect}
                  handleSubmit={handleSubmit}
                  handleNextQuestion={handleNextQuestion}
                  handleFinish={handleFinish}
                  feedback={feedback}
                  feedbackColor={feedbackColor}
                  answered={answered}
                  currentQuestionIndex={currentQuestionIndex}
                  totalQuestions={questions.length}
                />
              ) : (
                <CircularProgress />
              )}
            </Paper>
          </Container>
        </Box>
        {quizFinished && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button variant="outlined" onClick={() => navigate(`/student/subjects/${subjectId}`)}>
              Voltar
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default HistoryQuiz;
