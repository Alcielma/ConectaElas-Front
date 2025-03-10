import React from "react";
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonIcon,
} from "@ionic/react";
import { callSharp } from "ionicons/icons";
import "./ReportChannels.css";

const emergencyNumbers = [
  { name: "Polícia", number: "190" },
  { name: "Bombeiros", number: "193" },
  { name: "Samu", number: "192" },
  { name: "Delegacia da Mulher", number: "180" },
  { name: "Disque Direitos Humanos", number: "100" },
];

const ReportChannels: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Canais de Denúncia</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="report-channels-content">
        <div className="report-channels-container">
          {emergencyNumbers.map((channel, index) => (
            <a
              key={index}
              href={`tel:${channel.number}`}
              className="report-card"
            >
              <IonIcon icon={callSharp} className="report-icon" />
              <div>
                <h3>{channel.name}</h3>
                <p>{channel.number}</p>
              </div>
            </a>
          ))}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default ReportChannels;
