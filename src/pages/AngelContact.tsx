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
import "./AngelContact.css";

const AngelContact: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Contato do anjo</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <div>Texto teste</div>
      </IonContent>
    </IonPage>
  );
};

export default AngelContact;
