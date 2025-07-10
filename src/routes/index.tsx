import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Header from "../components/header/Header";
import { fetchInitialData } from "../api";
import { useDispatch } from "react-redux";
import LoadingScreen from "../components/LoadingScreen";
import { NotFound } from "../components/NotFound";
import SendEmail from "../components/sendEmail/SendEmail";
import UsersList from "../components/usersList/UsersList";
import EmailTemplatesList from "../components/emailTemplates/EmailTemplatesList";

const AppRoutes: React.FC = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInitialData(dispatch, setLoading);
  }, []); // Empty dependency array - runs only once

  return (
    <Router>
      <div className="app">
        {loading ? (
          <LoadingScreen />
        ) : (
          <>
            <Header />
            <div className="body">
              <Routes>
                <Route path="/" element={<Navigate to="/send-mail" replace />} />
                <Route path="/send-mail" element={<SendEmail />} />
                <Route path="/users" element={<UsersList />} />
                <Route path="/templates" element={<EmailTemplatesList />} />
                <Route path="/mail-history" element={<div>THIS IS MAIL HISTORY PAGE</div>} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </>
        )}
      </div>
    </Router>
  );
};

export default AppRoutes;
