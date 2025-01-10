import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ThemeComponent from './theme';
import Home from "./pages/Home";
import Profile from "./components/Profile";
import EditProfile from "./components/EditProfile";
import Login from "./components/Login";
import UploadProduct from "./components/UploadProduct";
import SearchResult from './components/SearchedResult';
import { AuthProvider } from "./context/authContext";
import ProtectedRoute from './components/ProtectedRoute';
import NotFound from "./components/404";
import Navbar from './components/Navbar'; // Navbar included here

function App() {
  return (
    <ThemeComponent>
      <Router>
        <AuthProvider>
          <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar /> {/* Always present */}
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/searchedresult" element={<SearchResult />} />
              <Route path="/profile/:userId" element={<Profile />} />
              <Route
                path="/profile/:userId/edit"
                element={
                  <ProtectedRoute>
                    <EditProfile />
                  </ProtectedRoute>
                }
              />
              <Route path="/login" element={<Login />} />
              <Route
                path="/upload"
                element={
                  <ProtectedRoute>
                    <UploadProduct />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </AuthProvider>
      </Router>
    </ThemeComponent>
  );
}

export default App;
