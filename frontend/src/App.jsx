import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ThemeComponent from './theme';
import Navbar from "./components/Navbar";
import Feed from "./components/Feed";
import Profile from "./components/Profile";
import EditProfile from "./components/EditProfile";
import Login from "./components/Login";
import UploadProduct from "./components/UploadProduct";
import SearchResult from './components/SearchedResult';
import { AuthProvider } from "./context/authContext";
import ProtectedRoute from './components/ProtectedRoute';
import NotFound from "./components/404";

function App() {
  return (
    <ThemeComponent>
      <Router>
        <AuthProvider>
          <Navbar />
          <Routes>
            <Route path="/" element={<Feed />} />
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
        </AuthProvider>
      </Router>
    </ThemeComponent>
  );
}

export default App;