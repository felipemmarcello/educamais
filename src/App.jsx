import { useState, Suspense } from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import UserContext from './contexts/UserContext.jsx';
import ProtectedAdminRoute from './pages/admin/ProtectedAdminRoute.jsx';
import ProtectedStudentRoute from './pages/student/ProtectedStudentRoute.jsx';
import ProtectedProfessorRoute from './pages/professor/ProtectedProfessorRoute.jsx';
import ProtectedAdminEMRoute from './pages/AdminEducaMais/ProtectedAdminEMRoute.jsx';

import LoginPage from './pages/LoginPage';
import HomeAdmin from './pages/admin/HomeAdmin.jsx';
import CreateUser from './pages/admin/CreateUsers.jsx';
import AdminLayout from './pages/admin/AdminLayout.jsx';
import ListUsers from './pages/admin/ListUsers.jsx';
import HomeStudent from './pages/student/HomeStudent.jsx';
import StudentLayout from './pages/student/StudentLayout.jsx';
import Subjects from './pages/student/SubjectsPage.jsx';
import HomeProfessor from './pages/professor/HomeProfessor.jsx';
import ProfessorLayout from './pages/professor/ProfessorLayout.jsx';
import SubjectList from './pages/student/subjects/SubjectsList.jsx';
import SubjectsPageProfessor from './pages/professor/SubjectsPageProfessor.jsx';
import SubjectsListProfessor from './pages/professor/SubjectsListProfessor.jsx';
import QuizRouter from './pages/student/QuizRouter.jsx';
import AdminEMLayout from './pages/AdminEducaMais/AdminEMLayout.jsx';
import HomeAdminEM from './pages/AdminEducaMais/HomeAdminEM.jsx';
import CreateSchool from './pages/AdminEducaMais/CreateSchool.jsx';
import ListSchool from './pages/AdminEducaMais/ListSchool.jsx';
import CreateQuestion from './pages/professor/CreateQuestion.jsx';
import Dashboard from './pages/student/dashboard/dashboard.jsx';
import DashboardProfessor from './pages/professor/DashboardProfessor.jsx';
import DashboardAdmin from './pages/admin/DashboardAdmin.jsx';
import DashboardAdminEM from './pages/AdminEducaMais/DashboardEM.jsx';
import Leaderboard from './pages/student/dashboard/leaderboard.jsx';
import LeaderboardProfessor from './pages/professor/leaderboardProfessor.jsx';


function App() {
  const [globalUid, setGlobalUid] = useState(null);

  return (
    <>
      <UserContext.Provider value={{ globalUid, setGlobalUid }}>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          margin: 0,
          backgroundColor: '#7e8184'
        }}>
          <div style={{
            width: '68%',
            height: '80%',
            display: 'flex',
            flexDirection: 'row',
            border: '3px solid #000000',
            borderRadius: '5px',
            backgroundColor: '#ffffff'
          }}>
            <Router>
              <Suspense fallback={<div>Loading...</div>}>
                <Routes>
                  <Route path="/" element={<LoginPage />} />

                  <Route path="/AdminEM" element={<ProtectedAdminEMRoute><AdminEMLayout /></ProtectedAdminEMRoute>}>
                    <Route index element={<HomeAdminEM />} />
                    <Route path="create-school" element={<CreateSchool />} />
                    <Route path="list-school" element={<ListSchool />} />
                    <Route path="dashboard" element={<DashboardAdminEM />} />
                  </Route>

                  <Route path="/admin" element={<ProtectedAdminRoute><AdminLayout /></ProtectedAdminRoute>}>
                    <Route index element={<HomeAdmin />} />
                    <Route path="create-user" element={<CreateUser />} />
                    <Route path="list-users" element={<ListUsers />} />
                    <Route path="dashboard" element={<DashboardAdmin />} />
                  </Route>

                  <Route path="/student" element={<ProtectedStudentRoute><StudentLayout /></ProtectedStudentRoute>}>
                    <Route index element={<HomeStudent />} />
                    <Route path="subjects" element={<Subjects />} />
                    <Route path="subjects/:subjectId" element={<SubjectList />} />
                    <Route path="subjects/:subjectId/:selectedSubject" element={<QuizRouter />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="leaderboard" element={<Leaderboard />} />
                  </Route>

                  <Route path="/professor" element={<ProtectedProfessorRoute><ProfessorLayout /></ProtectedProfessorRoute>}>
                    <Route index element={<HomeProfessor />} />
                    <Route path="create-question" element={<CreateQuestion />} />
                    <Route path="subjects" element={<SubjectsPageProfessor />} />
                    <Route path="subjects/:subjectId" element={<SubjectsListProfessor />} />
                    <Route path="leaderboard" element={<LeaderboardProfessor />} />
                    <Route path="dashboard" element={<DashboardProfessor />} />
                  </Route>
                </Routes>
              </Suspense>
            </Router>
          </div>
        </div>
      </UserContext.Provider>
    </>
  );
}

export default App;
