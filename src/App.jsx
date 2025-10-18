import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AuthInitializer from './components/AuthInitializer';

// Layout and components
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Orders from './pages/Orders';
import Customers from './pages/Customers';
import Broadcast from './pages/Broadcast';
import Analytics from './pages/Analytics';
import NotFound from './pages/NotFound';

function App() {
  return (
    <Router>
      <AuthInitializer>
        <div className="min-h-screen bg-gray-50">
          <Toaster position="top-center" reverseOrder={false} />
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            
            {/* Protected routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route index element={<Dashboard />} />
              <Route path="inventory" element={<Inventory />} />
              <Route path="orders" element={<Orders />} />
              <Route path="customers" element={<Customers />} />
              <Route path="broadcast" element={<Broadcast />} />
              <Route path="analytics" element={<Analytics />} />
            </Route>
            
            {/* 404 page */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </AuthInitializer>
    </Router>
  );
}


export default App;
