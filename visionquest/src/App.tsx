import { useState } from 'react'
import { Routes, Route } from 'react-router-dom';
import LoginPage from './LoginPage.tsx';
import PageMap from './comp/PageMap.tsx';

export default function App() {
  return (
    <Routes>
      <Route element={<PageMap />}>
        <Route path="/" element={<LoginPage />} />
        <Route path="*" element={<div style={{ padding: '2rem' }}><h2>Page not found</h2></div>} />
      </Route>
    </Routes>
  );
}