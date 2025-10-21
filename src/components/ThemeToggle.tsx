import React from "react";
import { IonIcon } from "@ionic/react";
import { moon, sunny } from "ionicons/icons";
import { useTheme } from "../Contexts/ThemeContext";
import { useLocation } from "react-router-dom";
import "./ThemeToggle.css";

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const isLogin = location.pathname === "/login";

  if (isLogin) return null;

  return (
    <button
      className="theme-toggle-btn"
      aria-label={theme === "dark" ? "Ativar tema claro" : "Ativar tema escuro"}
      title={theme === "dark" ? "Tema claro" : "Tema escuro"}
      onClick={toggleTheme}
    >
      <IonIcon icon={theme === "dark" ? sunny : moon} />
    </button>
  );
};

export default ThemeToggle;