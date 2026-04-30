import { Routes, Route } from 'react-router-dom';
import { AppShell } from './components/AppShell.js';
import { Dashboard } from './routes/Dashboard.js';
import { BuildingDetail } from './routes/BuildingDetail.js';
import { ResidentPortal } from './routes/ResidentPortal.js';
import { AdminConsole } from './routes/AdminConsole.js';

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/buildings/:id" element={<BuildingDetail />} />
        <Route path="/portal/:user_id" element={<ResidentPortal />} />
        <Route path="/admin" element={<AdminConsole />} />
      </Routes>
    </AppShell>
  );
}
