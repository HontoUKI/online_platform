// src/routes/Routes.jsx
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

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/user" element={<PrivateRoute><PersonalAccountPage /></PrivateRoute>} />
      <Route path="/module" element={<PrivateRoute><ModulesPage /></PrivateRoute>} />
      <Route path="/module/:id" element={<PrivateRoute><ModuleDetailsPage /></PrivateRoute>} />
      <Route path="/teacher/module" element={<PrivateRoute><ModulesTeacherPage /></PrivateRoute>} />
      <Route path="/teacher/module/:id" element={<PrivateRoute><ModuleDetailsTeacherPage /></PrivateRoute>} />
      <Route path="/lesson/:lessonId" element={<PrivateRoute><LessonPage /></PrivateRoute>} />
      <Route path='/teacher/lesson/:lessonId' element={<PrivateRoute><LessonTeacher /></PrivateRoute>} />
      <Route path='/test/create' element={<PrivateRoute><TestCreatePage/></PrivateRoute>} />
      <Route path="/test/edit/:testId" element={<TestCreatePage />} /> 
      <Route path="/test/:testId" element={<PrivateRoute><TestPage /></PrivateRoute>} />
      <Route path='/grades' element={<PrivateRoute><StudentGrades /></PrivateRoute>} />
      <Route path='/admin' element={<AdminPanel />} />
    </Routes>
  );
};

export default AppRoutes;
