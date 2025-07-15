import "./styles/App.css";
import "./styles/typography.css";
import React from "react";
import AppRoutes from "./routes";
import { ToastProvider } from "./contexts/ToastContext";

function App() {
  return (
    <ToastProvider>
      <AppRoutes />
    </ToastProvider>
  );
}

export default App;
