import React from 'react';
import { Routes, Route } from 'react-router-dom';
import JobList from './JobList';
import JobForm from './JobForm';
import JobCalendar from './JobCalendar';

const Jobs = () => {
  return (
    <Routes>
      <Route path="/" element={<JobList />} />
      <Route path="/new" element={<JobForm />} />
      <Route path="/:id/edit" element={<JobForm />} />
      <Route path="/calendar" element={<JobCalendar />} />
    </Routes>
  );
};

export default Jobs;