import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import AdminProfile from './pages/AdminProfile';
import Filiere from './pages/Filiere';
import Departement from './pages/Departement';
import AnneeUniversitaire from './pages/AnneeUniversitaire';
import Inscription from './pages/Inscription';
import Module from './pages/Module';
import Enseignant from './pages/Enseignant';
import TeacherProfile from './pages/TeacherProfile';
import TeacherModulesPage from './pages/TeacherModulesPage';
import TeacherModuleNotesPage from './pages/TeacherModuleNotesPage';
import TeacherIndividualNotesPage from './pages/TeacherIndividualNotesPage';
import AdminLayout from './components/AdminLayout';
import PrivateRoute from './components/PrivateRoute';
import TeacherLayout from './components/TeacherLayout';
import ChefFiliereLayout from './components/ChefFiliereLayout';
import ChefFiliereDashboard from './pages/ChefFiliereDashboard';
import ChefFiliereStudentsPage from './pages/ChefFiliereStudentsPage';
import ChefFiliereFilierePage from './pages/ChefFiliereFilierePage';
import StudentLayout from './layouts/StudentLayout';
import StudentProfilePage from './pages/StudentProfilePage';
import AdminStudentsPage from './pages/AdminStudentsPage';
import AdminDashboard from './pages/AdminDashboard';
import Notes from './pages/Notes';
import StudentNotesPage from './pages/StudentNotesPage';
import ChefFiliereModulesPage from './pages/ChefFiliereModulesPage';
import StudentDocumentsPage from './pages/StudentDocumentsPage';
import 'bootstrap/dist/css/bootstrap.min.css';
import { AuthProvider } from "./context/AuthContext";

// Temporary component for testing the root route
const HomeTest = () => <div>Home Page</div>;

function App() {
  return (
    <AuthProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          {/* Public route for Login */}
          <Route path="/login" element={<Login />} />
          
          {/* Teacher Routes with Layout */}
          <Route element={<PrivateRoute roles={['ROLE_TEACHER', 'ROLE_CHEF_FILIERE']}><TeacherLayout /></PrivateRoute>}>
             <Route path="/teacher/profile" element={<TeacherProfile />} />
             <Route path="/teacher/modules" element={<TeacherModulesPage />} />
             <Route path="/teacher/modules/:moduleId/notes" element={<TeacherModuleNotesPage />} />
             <Route path="/teacher/individual-notes" element={<TeacherIndividualNotesPage />} />
          </Route>
          
          {/* Chef Filiere Routes with Layout */}
          <Route element={<PrivateRoute roles={['ROLE_CHEF_FILIERE']}><ChefFiliereLayout /></PrivateRoute>}>
             <Route path="/chef-filiere/profile" element={<TeacherProfile />} />
             <Route path="/chef-filiere/filiere" element={<ChefFiliereFilierePage />} />
             <Route path="/chef-filiere/modules" element={<ChefFiliereModulesPage />} />
             <Route path="/chef-filiere/notes" element={<TeacherIndividualNotesPage />} />
             <Route path="/chef-filiere/modules/:moduleId/notes" element={<TeacherModuleNotesPage />} />
             <Route path="/chef-filiere/students" element={<ChefFiliereStudentsPage />} />
          </Route>
          
          {/* Protected routes for Admin */}
          <Route path="/admin/*" element={<AdminLayout />}>
            <Route path="profile" element={<PrivateRoute roles={['ROLE_ADMIN']}><AdminProfile /></PrivateRoute>} />
            <Route path="filiere" element={<PrivateRoute roles={['ROLE_ADMIN']}><Filiere /></PrivateRoute>} />
            <Route path="departement" element={<PrivateRoute roles={['ROLE_ADMIN']}><Departement /></PrivateRoute>} />
            <Route path="annee-universitaire" element={<PrivateRoute roles={['ROLE_ADMIN']}><AnneeUniversitaire /></PrivateRoute>} />
            <Route path="inscription" element={<PrivateRoute roles={['ROLE_ADMIN']}><Inscription /></PrivateRoute>} />
            <Route path="module" element={<PrivateRoute roles={['ROLE_ADMIN']}><Module /></PrivateRoute>} />
            <Route path="enseignant" element={<PrivateRoute roles={['ROLE_ADMIN']}><Enseignant /></PrivateRoute>} />
            <Route path="dashboard" element={<PrivateRoute roles={['ROLE_ADMIN']}><AdminDashboard /></PrivateRoute>} />
            <Route path="etudiants" element={<PrivateRoute roles={['ROLE_ADMIN']}><AdminStudentsPage /></PrivateRoute>} />
            <Route path="notes" element={<PrivateRoute roles={['ROLE_ADMIN']}><Notes /></PrivateRoute>} />
          </Route>
          
          {/* Student Routes with Layout */}
          <Route element={<PrivateRoute roles={['ROLE_STUDENT']}><StudentLayout /></PrivateRoute>}>
             <Route path="/student/profile" element={<StudentProfilePage />} />
             <Route path="/student/notes" element={<StudentNotesPage />} />
             <Route path="/student/documents" element={<StudentDocumentsPage />} />
          </Route>
          
          {/* Redirect logic - This will now always redirect to /login initially */}
          {/* The actual redirection to /admin/profile or /teacher/profile or /chef-filiere/dashboard after login will happen in the Login component */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          {/* Catch-all route for 404 or redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App; 