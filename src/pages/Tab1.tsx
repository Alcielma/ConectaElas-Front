import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonRefresher,
  IonRefresherContent,
  useIonViewDidEnter,
} from "@ionic/react";
import "./Tab1.css";
import Carrossel from "../components/Carrossel";
import Feed from "../components/Feed";

const categorias = ["Notícia", "Informativo", "Favoritos"];

const Tab1: React.FC = () => {
  const history = useHistory();
  const [favoritesVersion, setFavoritesVersion] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  const bumpFavoritesVersion = () => setFavoritesVersion((v) => v + 1);
  const bumpRefreshKey = () => setRefreshKey((k) => k + 1);

  useIonViewDidEnter(() => {
    // Recarrega quando a aba Home é re-entrata
    bumpRefreshKey();
  });

  const handleRefresh = async (event: CustomEvent) => {
    // Puxa para atualizar
    bumpRefreshKey();
    // Pequeno delay para UX e garantir render
    setTimeout(() => event.detail.complete(), 300);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar className="header-gradient">
          <IonTitle className="title-centered">Conecta Elas</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="custom-background">
        {/* Pull-to-refresh */}
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent pullingIcon="arrowDownCircle" refreshingSpinner="circles" />
        </IonRefresher>

        <div className="body-feed">
          {/* Carrossel */}
          <div className="carrossel-wrapper">
            <Carrossel />
          </div>

          {/* Seções por categoria */}
          {categorias.map((categoria) => (
            <div key={categoria} className="categoria-section">
              <div className="categoria-header">
                <h3 className="categoria-title">{categoria}</h3>
                <span
                  className="ver-todos"
                  onClick={() => history.push(`/categoria/${categoria}`)}
                >
                  Ver todos
                </span>
              </div>

              <div className="categoria-cards">
                <Feed 
                  selectedCategory={categoria} 
                  horizontalLimit={5} 
                  favoritesVersion={favoritesVersion}
                  onAnyFavoriteChange={bumpFavoritesVersion}
                  refreshKey={refreshKey}
                />
              </div>
            </div>
          ))}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Tab1;