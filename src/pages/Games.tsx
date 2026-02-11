import React from "react";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonIcon,
  useIonViewDidEnter
} from "@ionic/react";
import { flash, shapes, grid, create  } from "ionicons/icons";
import { useHistory, useLocation } from "react-router-dom";
import { useAuth } from "../Contexts/AuthContext";
import "./Games.css";

const Games: React.FC = () => {
  const history = useHistory();
  const location = useLocation();
  const { isAssistant } = useAuth();

  const games = [
    { key: "quiz", label: "Quiz Relâmpago", icon: flash },
    { key: "memory", label: "Jogo da Memória", icon: shapes },
    { key: "wordsearch", label: "Caça-Palavras", icon: grid },
    { key: "crossword", label: "Palavras-Cruzadas", icon: create }
  ];

  const [leavingKey, setLeavingKey] = React.useState<string | null>(null);

  const handleSelect = (key: string) => {
    setLeavingKey(key);

    setTimeout(() => {
      switch (key) {
        case "quiz": {
          if (isAssistant) {
            history.push("/tabs/quiz-management");
          } else {
            // Abrir diretamente o QuizDetail (requere um ID)
            try {
              const current = JSON.parse(localStorage.getItem("currentQuiz") || "{}");
              const id = Number(current?.id);
              if (id && !isNaN(id)) {
                history.push(`/tabs/quiz-detail/${id}`);
              } else {
                // fallback para lista de quizzes caso não haja um quiz atual
                history.push("/tabs/quiz");
              }
            } catch {
              history.push("/tabs/quiz");
            }
          }
          break;
        }

        case "memory":
          if (isAssistant) {
            history.push("/tabs/card-management");
          } else {
            history.push("/tabs/games/memory");
          }
          break;

        case "wordsearch":
          if (isAssistant) {
            history.push("/tabs/caca-palavras-management");
          } else {
            history.push("/tabs/games/caca-palavras");
          }
          break;
          
          case "crossword":
          history.push("/tabs/games/palavras-cruzadas");
          break;

        default:
          history.push("/tabs/tab1");
      }
    }, 250);
  };

  useIonViewDidEnter(() => {
    setLeavingKey(null);
  });

  React.useEffect(() => {
    if (location.pathname === "/tabs/games") {
      setLeavingKey(null);
    }
  }, [location.pathname]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar className="header-gradient">
          <IonTitle>Mini Jogos</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <div className="games-grid">
          {games.map((g) => (
            <button
              key={g.key}
              className={`game-card ${
                leavingKey === g.key ? "leaving" : ""
              }`}
              onClick={() => handleSelect(g.key)}
            >
              <IonIcon className="icon" icon={g.icon} />
              <div className="label">{g.label}</div>
            </button>
          ))}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Games;
