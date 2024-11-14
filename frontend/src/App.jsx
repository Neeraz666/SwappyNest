import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ThemeComponent from './theme';
import Navbar from "./components/Navbar";
import Feed from "./components/Feed";
import Profile from "./components/Profile";
import Login from "./components/Login";
import UploadProduct from "./components/UploadProduct";
import { AuthProvider } from "./context/authContext";
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <ThemeComponent>
      <Router>
        <AuthProvider>
          <Navbar />
          <Routes>
            <Route path="/" element={<Feed />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/login" element={<Login />} />
            <Route 
              path="/upload" 
              element={
                <ProtectedRoute>
                  <UploadProduct />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </AuthProvider>
      </Router>
    </ThemeComponent>
  );
}

export default App;