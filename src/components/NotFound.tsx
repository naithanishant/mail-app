import React from "react";

export const NotFound: React.FC = () => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        textAlign: "center",
        padding: "2rem",
      }}
    >
      <h1
        style={{
          fontSize: "4rem",
          fontWeight: "bold",
          color: "#6366f1",
          margin: "0 0 1rem 0",
        }}
      >
        404
      </h1>
      <h2
        style={{
          fontSize: "1.5rem",
          fontWeight: "600",
          color: "#374151",
          margin: "0 0 0.5rem 0",
        }}
      >
        Page Not Found
      </h2>
      <p
        style={{
          fontSize: "1rem",
          color: "#6b7280",
          maxWidth: "400px",
        }}
      >
        The page you're looking for doesn't exist or has been moved.
      </p>
    </div>
  );
};
