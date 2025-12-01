import React from "react";
import { IonIcon } from "@ionic/react";
import { gameController } from "ionicons/icons";
import { useHistory, useLocation } from "react-router-dom";
import "./GamesIcon.css";

const GamesIcon: React.FC = () => {
  const history = useHistory();
  const location = useLocation();

  const isLogin = location.pathname === "/login";
  if (isLogin) return null;

  const goToGames = () => {
    history.push("/tabs/games");
  };

  return (
    <button
      className="games-icon-btnionic serve"
      aria-label="Abrir mini jogos"
      title="Mini jogos"
      onClick={goToGames}
    >
      <IonIcon icon={gameController} />
    </button>
  );
};

export default GamesIcon;