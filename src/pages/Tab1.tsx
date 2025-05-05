import React, { useState, useEffect } from "react";
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { IonIcon } from "@ionic/react";
import {
  listSharp,
  newspaperSharp,
  informationCircleSharp,
  chatbubbleEllipsesSharp,
} from "ionicons/icons";
import "./Tab1.css";
import Feed from "../components/Feed";
import Carrossel from "../components/Carrossel";
import { useHistory } from "react-router-dom";
import { useAuth } from "../Contexts/AuthContext";
import { helpCircleSharp } from "ionicons/icons";
import { IonButtons } from "@ionic/react";
import { useIonRouter } from "@ionic/react";

const Tab1: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { user } = useAuth();
  const history = useHistory();
  const router = useIonRouter();

  const handleCategoryClick = (category: string | null) => {
    setSelectedCategory(category);
  };
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <IonButtons slot="start">
            <div style={{ width: "44px" }} />{" "}
          </IonButtons>

          <IonTitle style={{ textAlign: "center", flex: 1 }}>
            Conecta Elas
          </IonTitle>

          <IonButtons slot="end">
            <IonIcon
              icon={helpCircleSharp}
              size="large"
              style={{ marginRight: "12px", cursor: "pointer" }}
              onClick={() => router.push("/tabs/sobre", "forward")}
            />
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="custom-background">
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Conecta Elas</IonTitle>
          </IonToolbar>
        </IonHeader>

        <div className="body-feed">
          <Carrossel />

          <div className="category-buttons">
            <button
              onClick={() => handleCategoryClick(null)}
              className="category-button"
            >
              <IonIcon icon={listSharp} />
              <span className="button-label">Todos</span>
            </button>
            <button
              onClick={() => handleCategoryClick("Notícia")}
              className="category-button"
            >
              <IonIcon icon={newspaperSharp} />
              <span className="button-label">Notícia</span>
            </button>
            <button
              onClick={() => handleCategoryClick("Informativo")}
              className="category-button"
            >
              <IonIcon icon={informationCircleSharp} />
              <span className="button-label">Informativo</span>
            </button>
            <button
              onClick={() => handleCategoryClick("Relato")}
              className="category-button"
            >
              <IonIcon icon={chatbubbleEllipsesSharp} />
              <span className="button-label">Relato</span>
            </button>
          </div>

          <Feed selectedCategory={selectedCategory} />
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Tab1;
