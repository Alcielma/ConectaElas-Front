import React from "react";
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonIcon, useIonViewDidEnter } from "@ionic/react";
import { flash, shapes, grid } from "ionicons/icons";
import { useHistory, useLocation } from "react-router-dom";
import "./Games.css";

const Games: React.FC = () => {
  const history = useHistory();
  const location = useLocation();

  const games = [
    { key: "quiz", label: "Quiz Relâmpago", icon: flash },
    { key: "memory", label: "Jogo da Memória", icon: shapes },
  ];

  const [leavingKey, setLeavingKey] = React.useState<string | null>(null);

  // Navegação direcionada apenas para o QuizDetail e demais jogos

  const handleSelect = (key: string) => {
    setLeavingKey(key);
    setTimeout(() => {
      switch (key) {
        case "quiz": {
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
          break;
        }
        case "memory":
          history.push("/tabs/games/memory");
          break;
        case "puzzle":
          history.push("/tabs/games/puzzle");
          break;
        default:
          history.push("/tabs/tab2");
      }
    }, 250);
  };

  // Ao reentrar na tela de jogos, limpa o estado de "leaving" para exibir todos os cards
  useIonViewDidEnter(() => {
    setLeavingKey(null);
  });

  // Garantia adicional: se a rota atual for /tabs/games, reseta leavingKey
  React.useEffect(() => {
    if (location.pathname === "/tabs/games") {
      setLeavingKey(null);
    }
  }, [location.pathname]);

  React.useEffect(() => {
    const handler = (ev: any) => {
      ev.detail.register(10, () => {
        history.replace("/tabs/tab1");
      });
    };
    document.addEventListener("ionBackButton", handler as any);
    return () => document.removeEventListener("ionBackButton", handler as any);
  }, [history]);

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
              className={`game-card ${leavingKey === g.key ? "leaving" : ""}`}
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