import React, { useState, useEffect } from "react";
import { db, auth } from "../../../firebase/firebase.js";
import { collection, getDocs, addDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { Container, Paper, Typography, Radio, RadioGroup, FormControl, FormControlLabel, Button, CircularProgress, Box, CardContent } from "@mui/material";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import TextWithColor from '../../../components/TextWithColors.jsx';
import { useNavigate } from "react-router-dom";
import './QuizStyles.css';

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
  <div style={{ width: '760px' }}>
    <Typography variant="h6" style={{ marginTop: '3%', marginLeft: '5%', paddingTop: '2%' }} gutterBottom>{question.question}</Typography>
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
              label={
                <span style={{ backgroundColor: backgroundColor, color: color, padding: '5px 10px', borderRadius: '3px' }}>
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
  <CardContent style={{ marginTop: '29%' }}>
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '150px' }}>
      <Box sx={{ alignSelf: 'flex-start' }}>
        <Typography variant="h5" gutterBottom>Resultados</Typography>
      </Box>
      <Box display="flex" alignItems="center" mb={1} sx={{ alignSelf: 'flex-start', marginBottom: '5%'}}>
        <Typography variant="body1">Total de Perguntas: {correctCount + incorrectCount}</Typography>
      </Box>
      <Box display="flex" alignItems="center" mb={1}>
        <Typography variant="body1" sx={{ mr: 1 }}> Respostas: </Typography>
        <CheckCircleIcon color="success" sx={{ mr: 1 }} />
        <Typography variant="body1">{correctCount}</Typography>
      </Box>
      <Box display="flex" alignItems="center">
        <Typography variant="body1" sx={{ mr: 1 }}> Respostas: </Typography>
        <CancelIcon color="error" sx={{ mr: 1 }} />
        <Typography variant="body1">{incorrectCount}</Typography>
      </Box>
    </Box>
  </CardContent>
);

const PortugueseQuiz = () => {
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

  const navigate = useNavigate(); // Adicionado o hook useNavigate

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
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
      const querySnapshot = await getDocs(collection(db, "portugueseQuestions"));
      let fetchedQuestions = querySnapshot.docs.map((doc) => doc.data());

      if (fetchedQuestions.length > 0) {
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
  }, []);

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

    await addDoc(collection(db, "userPortugueseResponses"), {
      userId: user.uid,
      question: currentQuestion.question,
      selectedAnswer,
      isCorrect: isCorrect,
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
    setQuizFinished(true);
  };

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '5%' }}>
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 2, marginBottom: '5%' }}>
          <Typography variant="h3" gutterBottom className="text-shadow">
            <TextWithColor subject="portugues" text="Língua Portuguesa" />
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Container>
            <Paper elevation={2} sx={{borderRadius: '5px'}}>
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
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2}}>
            <Button variant="outlined" onClick={() => navigate("/student/subjects")}>
              Voltar
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default PortugueseQuiz;
