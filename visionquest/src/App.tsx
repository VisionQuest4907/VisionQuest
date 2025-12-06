import { Routes, Route } from 'react-router-dom';
import LoginPage from './LoginPage.tsx';
import Dashboard from './dashboard.tsx';
import PageMap from './comp/PageMap.tsx';
import Setting from './Setting.tsx';
import CertView from './CertView.tsx';

export default function App() {
  return (
    <Routes>
      <Route element={<PageMap />}>
        <Route path="/" element={<LoginPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/setting" element={<Setting />} />
        <Route path="/certview" element={<CertView />} />
        <Route path="*" element={<div style={{ padding: '2rem' }}><h2>Page not found</h2></div>} />
      </Route>
    </Routes>
  );
}
