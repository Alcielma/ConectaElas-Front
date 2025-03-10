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
  chatbubbleEllipsesSharp,
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
          <IonTitle>Conecta Elas</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="custom-background">
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Conecta Elas</IonTitle>
          </IonToolbar>
        </IonHeader>

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
      </IonContent>
    </IonPage>
  );
};

export default Tab1;
