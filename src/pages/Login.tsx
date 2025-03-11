import type React from "react";
import { useNavigate } from "react-router-dom";
import LoginForm from "../components/LoginForm";

const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  const handleLoginSuccess = (userRole: "admin" | "ambassador", userId: string) => {
    console.log('User role in handleLoginSuccess:', userRole);
    console.log('User ID in handleLoginSuccess:', userId);

    const path = userRole === "admin" ? "/admin" : "/ambassador";
    console.log('Navigating to:', path);

    // Pass the userId to the dashboard as a URL parameter
    navigate(`${path}?userId=${userId}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <LoginForm onSuccess={handleLoginSuccess} />
      </div>
    </div>
  );
};

export default LoginPage;