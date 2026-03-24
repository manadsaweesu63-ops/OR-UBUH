/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import Home from './components/Home';
import StatusBoard from './components/StatusBoard';
import Login from './components/Login';
import AboutOR from './components/AboutOR';
import SurgerySchedule from './components/SurgerySchedule';
import SurgeryHistory from './components/SurgeryHistory';
import SurgeryEntry from './components/SurgeryEntry';
import DoctorSchedule from './components/DoctorSchedule';
import DoctorScheduleEntry from './components/DoctorScheduleEntry';
import DoctorManagement from './components/DoctorManagement';
import PressRelease from './components/PressRelease';
import MedicalArticles from './components/MedicalArticles';
import FAQ from './components/FAQ';

export default function App() {
  useEffect(() => {
    // Ensure Firebase auth is initialized
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        localStorage.setItem('isStaff', 'true');
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-slate-50">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/status" element={<StatusBoard />} />
          <Route path="/admin/status" element={<StatusBoard />} />
          <Route path="/schedule" element={<SurgerySchedule />} />
          <Route path="/history" element={<SurgeryHistory />} />
          <Route path="/surgery-entry" element={<SurgeryEntry />} />
          <Route path="/doctors" element={<DoctorSchedule />} />
          <Route path="/doctor-entry" element={<DoctorScheduleEntry />} />
          <Route path="/doctor-management" element={<DoctorManagement />} />
          <Route path="/pr" element={<PressRelease />} />
          <Route path="/articles" element={<MedicalArticles />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/login" element={<Login />} />
          <Route path="/about" element={<AboutOR />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}
