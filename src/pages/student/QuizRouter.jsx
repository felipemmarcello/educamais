import React from 'react';
import { useParams } from 'react-router-dom';
import PortugueseQuiz from './subjects/PortugueseQuiz.jsx';
import MathematicsQuiz from './subjects/MathematicsQuiz.jsx';
// Importar outros quizzes conforme necessário

const QuizRouter = () => {
  const { subjectId, selectedSubject } = useParams();

  switch (subjectId) {
    case 'portuguese':
      return <PortugueseQuiz subjectId={subjectId} selectedSubject={selectedSubject} />;
    case 'mathematics':
      return <MathematicsQuiz subjectId={subjectId} selectedSubject={selectedSubject} />;
    // Adicionar outros casos para outras matérias
    default:
      return <div>Quiz não encontrado</div>;
  }
};

export default QuizRouter;
