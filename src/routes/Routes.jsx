import React from 'react';
import { Routes, Route } from 'react-router-dom';
import PrivateRoute from '../utils/PrivateRoute';
import LoginPage from '../pages/LoginPage';
import PersonalAccountPage from '../pages/PersonalAccount';
import ModulesPage from '../pages/ModulesPage';
import ModuleDetailsPage from '../pages/ModuleDetailsPage';
import ModulesTeacherPage from '../teacher/TeacherModulesPage';
import ModuleDetailsTeacherPage from '../teacher/TeacherModuleDetailtPage';
import LessonPage from '../pages/LessonPage';
import TestPage from '../pages/TestPage';
import AdminPanel from '../admin/pages/AdminPanel';
import TestCreatePage from '../teacher/TestCreatePage';
import LessonTeacher from '../teacher/LessonTeacher';
import StudentGrades from '../pages/StudentGrades';
import NotFound from '../pages/NotFound';

const AppRoutes = ({ setToast }) => {
  const withAuth = (Component) => (
    <PrivateRoute setToast={setToast}>
      <Component setToast={setToast} />
    </PrivateRoute>
  );

  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/user" element={withAuth(PersonalAccountPage)} />
      <Route path="/module" element={withAuth(ModulesPage)} />
      <Route path="/module/:id" element={withAuth(ModuleDetailsPage)} />
      <Route path="/teacher/module" element={withAuth(ModulesTeacherPage)} />
      <Route path="/teacher/module/:id" element={withAuth(ModuleDetailsTeacherPage)} />
      <Route path="/lesson/:lessonId" element={withAuth(LessonPage)} />
      <Route path="/teacher/lesson/:lessonId" element={withAuth(LessonTeacher)} />
      <Route path="/test/create" element={withAuth(TestCreatePage)} />
      <Route path="/test/edit/:testId" element={withAuth(TestCreatePage)} />
      <Route path="/test/:testId" element={withAuth(TestPage)} />
      <Route path="/grades" element={withAuth(StudentGrades)} />
      <Route path="/admin" element={withAuth(AdminPanel)} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
