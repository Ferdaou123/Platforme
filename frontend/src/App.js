import React, { useContext } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import NotFound from './pages/NotFound';
import AuthContext from './context/AuthContext';
import Spinner from './components/layout/Spinner';
import Profile from './pages/Profile';
import Dashboard from './pages/admin/Dashboard';
import Signalements from './pages/Signalements';
import SignalementDetails from './pages/SignalementDetails';
import EditSignalement from './pages/EditSignalement';
import NouveauSignalement from './pages/NouveauSignalement';
import MesSignalements from './pages/MesSignalements';
import Notifications from './pages/Notifications';
import About from './pages/About';

const PrivateRoute = ({ children }) => {
  const { user, isLoading } = useContext(AuthContext);
  
  if (isLoading) {
    return <Spinner />;
  }
  
  return user ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
  const { user, isLoading, isAdmin } = useContext(AuthContext);
  
  if (isLoading) {
    return <Spinner />;
  }
  
  return user && isAdmin() ? children : <Navigate to="/" />;
};

function App() {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/dashboard');

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:resettoken" element={<ResetPassword />} />
          <Route path="/signalements" element={<Signalements />} />
          <Route path="/signalements/:id" element={<SignalementDetails />} />
          <Route path="/a-propos" element={<About />} />
          
          <Route path="/profile" element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          } />
          
          <Route path="/nouveau-signalement" element={
            <PrivateRoute>
              <NouveauSignalement />
            </PrivateRoute>
          } />
          
          <Route path="/mes-signalements" element={
            <PrivateRoute>
              <MesSignalements />
            </PrivateRoute>
          } />
          
          <Route path="/notifications" element={
            <PrivateRoute>
              <Notifications />
            </PrivateRoute>
          } />
          
          <Route path="/signalements/:id/edit" element={
            <PrivateRoute>
              <EditSignalement />
            </PrivateRoute>
          } />

          <Route path="/dashboard/*" element={
            <AdminRoute>
              <Dashboard />
            </AdminRoute>
          } />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {!isDashboard && <Footer />}
    </div>
  );
}

export default App;