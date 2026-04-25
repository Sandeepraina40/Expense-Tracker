import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div className="flex h-screen items-center justify-center bg-slate-900 text-white">Loading...</div>;

  return user ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;
