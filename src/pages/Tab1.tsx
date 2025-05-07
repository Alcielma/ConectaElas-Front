import React, { useState } from "react";
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
} from "ionicons/icons";
import "./Tab1.css";
import Feed from "../components/Feed";
import Carrossel from "../components/Carrossel";

const Tab1: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleCategoryClick = (category: string | null) => {
    setSelectedCategory(category);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle style={{ textAlign: "center", flex: 1 }}>
            Conecta Elas
          </IonTitle>
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
              className={`category-button ${
                selectedCategory === null && "selected"
              }`}
            >
              <IonIcon icon={listSharp} />
              <span className="button-label">Todos</span>
            </button>
            <button
              onClick={() => handleCategoryClick("Notícia")}
              className={`category-button ${
                selectedCategory === "Notícia" && "selected"
              }`}
            >
              <IonIcon icon={newspaperSharp} />
              <span className="button-label">Notícia</span>
            </button>
            <button
              onClick={() => handleCategoryClick("Informativo")}
              className={`category-button ${
                selectedCategory === "Informativo" && "selected"
              }`}
            >
              <IonIcon icon={informationCircleSharp} />
              <span className="button-label">Informativo</span>
            </button>
          </div>

          <Feed selectedCategory={selectedCategory} />
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Tab1;
