import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import TimesheetList from './TimesheetList';
import TimesheetForm from './TimesheetForm';
import TimesheetDetail from './TimesheetDetail';

const Timesheets = () => {
  return (
    <Routes>
      <Route index element={<TimesheetList />} />
      <Route path="new" element={<TimesheetForm />} />
      <Route path=":id" element={<TimesheetDetail />} />
      <Route path=":id/edit" element={<TimesheetForm />} />
      <Route path="*" element={<Navigate to="/timesheets" replace />} />
    </Routes>
  );
};

export default Timesheets;