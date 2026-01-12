import React from 'react';
import { Routes, Route } from 'react-router-dom';
import StaffList from './StaffList';
import StaffForm from './StaffForm';
import StaffDetail from './StaffDetail';

const Staff = () => {
  return (
    <Routes>
      <Route path="/" element={<StaffList />} />
      <Route path="/new" element={<StaffForm />} />
      <Route path="/:id" element={<StaffDetail />} />
      <Route path="/:id/edit" element={<StaffForm />} />
    </Routes>
  );
};

export default Staff;