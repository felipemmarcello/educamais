import React from 'react';
import { useParams } from 'react-router-dom';
import PortugueseQuiz from './subjects/PortugueseQuiz.jsx';
import MathematicsQuiz from './subjects/MathematicsQuiz.jsx';
import ScienceQuiz from './subjects/ScienceQuiz..jsx';
import ArtQuiz from './subjects/ArtQuiz.jsx';
import EnglishQuiz from './subjects/EnglishQuiz.jsx';
import GeographyQuiz from './subjects/GeographyQuiz.jsx';
import HistoryQuiz from './subjects/HistoryQuiz.jsx';
import PhysicalEducationQuiz from './subjects/PhysicalEducationQuiz.jsx'
// Importar outros quizzes conforme necessário

const QuizRouter = () => {
  const { subjectId, selectedSubject } = useParams();

  switch (subjectId) {
    case 'portuguese':
      return <PortugueseQuiz subjectId={subjectId} selectedSubject={selectedSubject} />;
    case 'mathematics':
      return <MathematicsQuiz subjectId={subjectId} selectedSubject={selectedSubject} />;
    case 'science':
      return <ScienceQuiz subjectId={subjectId} selectedSubject={selectedSubject} />;
    case 'art':
      return <ArtQuiz subjectId={subjectId} selectedSubject={selectedSubject} />;
    case 'english':
      return <EnglishQuiz subjectId={subjectId} selectedSubject={selectedSubject} />;
    case 'geography':
      return <GeographyQuiz subjectId={subjectId} selectedSubject={selectedSubject} />;
    case 'history':
      return <HistoryQuiz subjectId={subjectId} selectedSubject={selectedSubject} />;
    case 'physicalEducation':
      return <PhysicalEducationQuiz subjectId={subjectId} selectedSubject={selectedSubject} />;
      
    // Adicionar outros casos para outras matérias
    default:
      return <div>Quiz não encontrado</div>;
  }
};

export default QuizRouter;
