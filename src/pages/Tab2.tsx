import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonIcon,
} from "@ionic/react";
import {
  chatbubbleEllipsesSharp,
  megaphoneSharp,
  peopleSharp,
} from "ionicons/icons";
import { useAuth } from "../Contexts/AuthContext";
import "./Tab2.css";

const Tab2: React.FC = () => {
  const { isAssistant } = useAuth();

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{isAssistant ? "Área do Assistente" : "Chat"}</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <div className="tab2-content">
          {isAssistant ? (
            //  assistentes
            <div className="card-container">
              <div className="card">
                <IonIcon icon={peopleSharp} className="card-icon" />
                <p>Chats ativos</p>
              </div>
              <div className="card">
                <IonIcon icon={chatbubbleEllipsesSharp} className="card-icon" />
                <p>Históricos de chats</p>
              </div>
            </div>
          ) : (
            // usuários comuns
            <div className="card-container">
              <div className="card">
                <IonIcon icon={chatbubbleEllipsesSharp} className="card-icon" />
                <p>Chat com Assistente</p>
              </div>
              <div className="card">
                <IonIcon icon={megaphoneSharp} className="card-icon" />
                <p>Canais de Denúncia</p>
              </div>
            </div>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Tab2;
