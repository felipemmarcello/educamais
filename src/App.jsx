import { useState, Suspense, lazy } from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import UserContext from './contexts/UserContext.jsx';
import ProtectedAdminRoute from './pages/admin/ProtectedAdminRoute.jsx';
import ProtectedStudentRoute from './pages/student/ProtectedStudentRoute.jsx';
import ProtectedProfessorRoute from './pages/professor/ProtectedProfessorRoute.jsx';
import ProtectedAdminEMRoute from './pages/AdminEducaMais/ProtectedAdminEMRoute.jsx';

// Lazy load pages
const LoginPage = lazy(() => import('./pages/LoginPage'));
const HomeAdmin = lazy(() => import('./pages/admin/HomeAdmin.jsx'));
const CreateUser = lazy(() => import('./pages/admin/CreateUsers.jsx'));
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout.jsx'));
const ListUsers = lazy(() => import('./pages/admin/ListUsers.jsx'));
const HomeStudent = lazy(() => import('./pages/student/HomeStudent.jsx'));
const StudentLayout = lazy(() => import('./pages/student/StudentLayout.jsx'));
const Subjects = lazy(() => import('./pages/student/SubjectsPage.jsx'));
const HomeProfessor = lazy(() => import('./pages/professor/HomeProfessor.jsx'));
const ProfessorLayout = lazy(() => import('./pages/professor/ProfessorLayout.jsx'));
const SubjectList = lazy(() => import('./pages/student/subjects/SubjectsList.jsx'));
const SubjectsPageProfessor = lazy(() => import('./pages/professor/SubjectsPageProfessor.jsx'));
const SubjectsListProfessor = lazy(() => import('./pages/professor/SubjectsListProfessor.jsx'));
const QuizRouter = lazy(() => import('./pages/student/QuizRouter.jsx'));
const AdminEMLayout = lazy(() => import('./pages/AdminEducaMais/AdminEMLayout.jsx'));
const HomeAdminEM = lazy(() => import('./pages/AdminEducaMais/HomeAdminEM.jsx'));
const CreateSchool = lazy(() => import('./pages/AdminEducaMais/CreateSchool.jsx'));
const ListSchool = lazy(() => import('./pages/AdminEducaMais/ListSchool.jsx'));
const CreateQuestion = lazy(() => import('./pages/professor/CreateQuestion.jsx'));
const Dashboard = lazy(() => import('./pages/student/dashboard/dashboard.jsx'));

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
                  </Route>

                  <Route path="/admin" element={<ProtectedAdminRoute><AdminLayout /></ProtectedAdminRoute>}>
                    <Route index element={<HomeAdmin />} />
                    <Route path="create-user" element={<CreateUser />} />
                    <Route path="list-users" element={<ListUsers />} />
                  </Route>

                  <Route path="/student" element={<ProtectedStudentRoute><StudentLayout /></ProtectedStudentRoute>}>
                    <Route index element={<HomeStudent />} />
                    <Route path="subjects" element={<Subjects />} />
                    <Route path="subjects/:subjectId" element={<SubjectList />} />
                    <Route path="subjects/:subjectId/:selectedSubject" element={<QuizRouter />} />
                    <Route path="dashboard" element={<Dashboard />} />
                  </Route>

                  <Route path="/professor" element={<ProtectedProfessorRoute><ProfessorLayout /></ProtectedProfessorRoute>}>
                    <Route index element={<HomeProfessor />} />
                    <Route path="create-question" element={<CreateQuestion />} />
                    <Route path="subjects" element={<SubjectsPageProfessor />} />
                    <Route path="subjects/:subjectId" element={<SubjectsListProfessor />} />
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
