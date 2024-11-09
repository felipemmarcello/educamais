import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { db, auth } from "../../../firebase/firebase.js";
import { collection, getDocs, addDoc, doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { Container, Paper, Typography, Radio, RadioGroup, FormControl, FormControlLabel, Button, CircularProgress, Box, CardContent, LinearProgress, Tooltip, Divider } from "@mui/material";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import InfoIcon from '@mui/icons-material/Info';
import StarIcon from '@mui/icons-material/Star';
import TextWithColor from '../../../components/TextWithColors.jsx';
import JSConfetti from 'js-confetti';
import '../subjectsCSS/QuizStyles.css';

const levelRequirements = {
  1: 0,
  2: 300,
  3: 600,
  4: 900,
  5: 1200,
  6: 1800,
  7: 2600,
  8: 3200,
  9: 3800,
  10: 5000,
  11: 6200,
  12: 7400,
  13: 9000,
  14: 10600,
  15: 12000
};

const calculateLevel = (exp) => {
  let level = 1;
  for (const [lvl, req] of Object.entries(levelRequirements)) {
    if (exp >= req) {
      level = parseInt(lvl);
    }
  }
  return level;
};

const QuizQuestion = ({
  question,
  selectedAnswer,
  handleAnswerSelect,
  handleSubmit,
  handleNextQuestion,
  handleFinish,
  answered,
  currentQuestionIndex,
  totalQuestions,
  timeLeft,
  hasAnsweredBefore
}) => (
  <div style={{ width: '950px', margin: '0, auto' }}>
    <Typography 
      variant="h6" 
      style={{ 
        marginTop: '2%', 
        marginLeft: '3%', 
        paddingTop: '2%', 
        fontSize: '1.10rem', 
        marginRight: '5%', 
        wordWrap: 'break-word',  
        whiteSpace: 'normal'    
      }} 
      gutterBottom
    >
      <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: '1%' }}>
        <AccessTimeIcon sx={{ marginRight: '8px', color: '#3f51b5' }} />
        <Typography variant="body1" sx={{ fontWeight: 'bold', marginRight: '8px' }}>
          {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Termine a tempo para ganhar mais pontos!
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', ml: 'auto' }}>
          <Typography variant="body2" sx={{ color: hasAnsweredBefore ? 'green' : 'red', mr: 1 }}>
            {hasAnsweredBefore ? "Respondida" : "Não Respondida"}
          </Typography>
          <Tooltip 
            title={
              hasAnsweredBefore 
                ? "Não ganhará mais EXP e Pontos por essa questão e não será contabilizado os resultados no final"
                : "Pode ganhar EXP e Pontos por essa questão"
            }
          >
            <InfoIcon fontSize="small" color="action" />
          </Tooltip>
        </Box>
      </Box>
      <LinearProgress variant="determinate" value={(timeLeft / 120) * 100} sx={{ height: '10px', borderRadius: '5px', marginBottom: '16px' }} />
      {`${currentQuestionIndex + 1}) ${question.question}`}
    </Typography>
    <FormControl component="fieldset" style={{ display: 'flex', marginLeft: '3%', marginRight: '3%' }}>
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
                <span style={{
                  backgroundColor: backgroundColor, 
                  color: color, 
                  padding: '5px 0px', 
                  borderRadius: '3px',
                  maxWidth: '100%', 
                  overflowWrap: 'break-word',  
                  whiteSpace: 'normal'
                }}>
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

const QuizResults = ({ correctCount, incorrectCount, quizPoints }) => {
  const totalQuestions = correctCount + incorrectCount;
  const correctPercentage = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;

  return (
    <CardContent sx={{ textAlign: 'center', padding: '24px', maxWidth: '500px', margin: 'auto', borderRadius: '10px', marginTop: '5%' }}>
      <Typography variant="h4" gutterBottom sx={{ color: '#3f51b5' }}>Resultados</Typography>

      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', my: 3 }}>
        <Box sx={{ position: 'relative', display: 'inline-flex' }}>
          <CircularProgress variant="determinate" value={correctPercentage} size={100} thickness={4} sx={{ color: '#3f51b5' }} />
          <Box sx={{
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            position: 'absolute',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Typography variant="h5" component="div" color="textPrimary">
              {`${Math.round(correctPercentage)}%`}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Typography variant="h6" gutterBottom>Total de Perguntas: {totalQuestions}</Typography>
      
      <Box display="flex" justifyContent="center" alignItems="center" mb={2}>
        <CheckCircleIcon color="success" sx={{ mr: 1 }} />
        <Typography variant="body1">Respostas Corretas: {correctCount}</Typography>
      </Box>
      
      <Box display="flex" justifyContent="center" alignItems="center" mb={2}>
        <CancelIcon color="error" sx={{ mr: 1 }} />
        <Typography variant="body1">Respostas Incorretas: {incorrectCount}</Typography>
      </Box>

      <Divider sx={{ my: 2 }} />

      <Box display="flex" justifyContent="center" alignItems="center" mt={2}>
        <StarIcon color="warning" sx={{ mr: 1 }} />
        <Typography variant="h5" sx={{color: '#ff9800' }}>Pontos Obtidos: {quizPoints}</Typography>
      </Box>
    </CardContent>
  );
};

const ReligionQuiz = () => {
  const { subjectId, selectedSubject } = useParams();
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [user, setUser] = useState(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [answered, setAnswered] = useState(false);
  const [subject, setSubject] = useState('');
  const [schoolYear, setSchoolYear] = useState('');
  const [schoolId, setSchoolId] = useState('');
  const [quizPoints, setQuizPoints] = useState(0);
  const [timeLeft, setTimeLeft] = useState(120); 
  const [hasAnsweredBefore, setHasAnsweredBefore] = useState(false); 

  const navigate = useNavigate();

  useEffect(() => {
    let timer;
    if (!answered && timeLeft > 0) {
      timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [timeLeft, answered]);

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

  useEffect(() => {
    const checkAnsweredBefore = async () => {
      if (user) {
        const currentQuestion = questions[currentQuestionIndex];
        const responseSnapshot = await getDocs(collection(db, "userReligionResponses"));
        const alreadyAnswered = responseSnapshot.docs.some((doc) => 
          doc.data().userId === user.uid && doc.data().question === currentQuestion.question
        );
        setHasAnsweredBefore(alreadyAnswered);
      }
    };

    checkAnsweredBefore();
  }, [currentQuestionIndex, user, questions]);

  const handleSubmit = async () => {
    if (!user) {
      console.error("Usuário não autenticado!");
      return;
    }
  
    const currentQuestion = questions[currentQuestionIndex];
    let points = 0;
    let exp = 0;
    let isCorrect = selectedAnswer === currentQuestion.correctAnswer;
  
    const userResponseQuery = collection(db, "userReligionResponses");
    const responseSnapshot = await getDocs(userResponseQuery);
    const hasAnsweredBefore = responseSnapshot.docs.some((doc) => 
      doc.data().userId === user.uid && doc.data().question === currentQuestion.question
    );
  
    if (hasAnsweredBefore) {
      console.log("O usuário já respondeu a esta pergunta antes. Nenhum ponto ou XP será concedido.");
    } else {
      if (isCorrect) {
        points = timeLeft > 0 ? 10 : 5; 
        exp = 50;  
        setCorrectCount((prev) => prev + 1);
      } else {
        setIncorrectCount((prev) => prev + 1);
      }
      setQuizPoints((prev) => prev + points);
    }
  
    await addDoc(collection(db, "userReligionResponses"), {
      userId: user.uid,
      question: currentQuestion.question,
      selectedAnswer,
      isCorrect,
      subject: currentQuestion.subject,
      schoolYear,
      schoolId,
      schoolSubject: 'religion',
      points: hasAnsweredBefore ? 0 : points, 
      classRoom: currentQuestion.classRoom,
      correctAnswer: currentQuestion.correctAnswer,
      hasAnsweredBefore, 
      timestamp: serverTimestamp()
    });
  
    setAnswered(true);
  };

  const handleNextQuestion = () => {
    setSelectedAnswer("");
    setAnswered(false);
    setCurrentQuestionIndex(currentQuestionIndex + 1);
    setTimeLeft(120); 
  };

  const handleFinish = async () => {
    const jsConfetti = new JSConfetti();
    jsConfetti.addConfetti();
    
    if (user) {
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
  
      if (userDoc.exists()) {
        const userData = userDoc.data();
  
        const newExp = (userData.exp || 0) + (correctCount * 50); 
        const newLevel = calculateLevel(newExp);  
        const totalPoints = (userData.points || 0) + quizPoints; 
        const correctAnswers = (userData.correctAnswers || 0) + correctCount;
  
        await updateDoc(userRef, {
          points: totalPoints, 
          exp: newExp,
          level: newLevel,
          correctAnswers
        });
      }
    }
  
    setQuizFinished(true); 
  };

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '3%' }}>
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 2, marginBottom: '3%' }}>
          <Typography variant="h3" gutterBottom>
            <TextWithColor subject="religion" text={subject} />
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Container>
            <Paper elevation={2} sx={{ borderRadius: '5px'}}>
              {quizFinished ? (
                <QuizResults correctCount={correctCount} incorrectCount={incorrectCount} quizPoints={quizPoints} />
              ) : currentQuestion ? (
                <QuizQuestion
                  question={currentQuestion}
                  selectedAnswer={selectedAnswer}
                  handleAnswerSelect={handleAnswerSelect}
                  handleSubmit={handleSubmit}
                  handleNextQuestion={handleNextQuestion}
                  handleFinish={handleFinish}
                  answered={answered}
                  currentQuestionIndex={currentQuestionIndex}
                  totalQuestions={questions.length}
                  timeLeft={timeLeft}
                  hasAnsweredBefore={hasAnsweredBefore}
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

export default ReligionQuiz;
