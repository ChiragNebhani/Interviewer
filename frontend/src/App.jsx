import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './HomePage';
import MeetingPage from './MeetingPage';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/meeting" element={<MeetingPage />} />
    </Routes>
  );
};

export default App;
