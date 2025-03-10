import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonIcon,
  IonRouterLink,
} from "@ionic/react";
import { useHistory } from "react-router-dom";
import {
  chatbubbleEllipsesSharp,
  megaphoneSharp,
  peopleSharp,
  sparkles,
} from "ionicons/icons";
import { useAuth } from "../Contexts/AuthContext";

import "./Tab2.css";

const Tab2: React.FC = () => {
  const { isAssistant } = useAuth();
  const history = useHistory();

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
            <div className="card-container">
              <IonRouterLink className="card" href="/assistantChats">
                <IonIcon icon={peopleSharp} className="card-icon" />
                <p>Chats ativos</p>
              </IonRouterLink>

              <div className="card">
                <IonIcon icon={chatbubbleEllipsesSharp} className="card-icon" />
                <p>Históricos de chats</p>
              </div>
            </div>
          ) : (
            <div className="card-container">
              <div className="card" onClick={() => history.push("/tabs/chat")}>
                <IonIcon icon={chatbubbleEllipsesSharp} className="card-icon" />
                <p>Chat com Assistente</p>
              </div>
              <div className="card-down">
                <div
                  className="card"
                  onClick={() => history.push("/tabs/ReportChannels")}
                >
                  <IonIcon icon={megaphoneSharp} className="card-icon" />
                  <p id="canais">Canais de Denúncia</p>
                </div>
                <div
                  className="card"
                  onClick={() => history.push("/tabs/AngelContact")}
                >
                  <IonIcon icon={sparkles} className="card-icon" />
                  <p>Contato do Anjo</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Tab2;
