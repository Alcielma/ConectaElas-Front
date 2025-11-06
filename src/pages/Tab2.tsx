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
import { useIonRouter } from "@ionic/react";

import "./Tab2.css";

const Tab2: React.FC = () => {
  const { isAssistant } = useAuth();
  const history = useHistory();
  const router = useIonRouter();

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar className="header-gradient">
          <IonTitle>{isAssistant ? "Área do Assistente" : "Conexões"}</IonTitle>
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
            </div>
          ) : (
            <div className="card-container">
              <div
                className="card"
                onClick={() => router.push("/tabs/chat", "forward")}
              >
                <IonIcon icon={chatbubbleEllipsesSharp} className="card-icon" />
                <p>Chat (Secretaria das Mulheres)</p>
              </div>
              <div className="card-down">
                <div
                  className="card"
                  onClick={() => router.push("/tabs/ReportChannels", "forward")}
                >
                  <IonIcon icon={megaphoneSharp} className="card-icon" />
                  <p id="canais">Canais de Denúncia</p>
                </div>
                <div
                  className="card"
                  onClick={() => router.push("/tabs/AngelContact", "forward")}
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