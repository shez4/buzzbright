import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import QuoteList from './QuoteList';
import QuoteForm from './QuoteForm';
import QuoteDetail from './QuoteDetail';

const Quotes = () => {
  return (
    <Routes>
      <Route index element={<QuoteList />} />
      <Route path="new" element={<QuoteForm />} />
      <Route path=":id" element={<QuoteDetail />} />
      <Route path=":id/edit" element={<QuoteForm />} />
      <Route path="*" element={<Navigate to="/quotes" replace />} />
    </Routes>
  );
};

export default Quotes;