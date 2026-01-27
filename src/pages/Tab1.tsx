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
  IonButtons,
  IonButton,
  IonIcon,
  IonPopover,
  IonList,
  IonItem,
  IonLabel,
} from "@ionic/react";
import { addCircleOutline } from "ionicons/icons";
import "./Tab1.css";
import Carrossel from "../components/Carrossel";
import Feed from "../components/Feed";
import { useAuth } from "../Contexts/AuthContext";

const categorias = ["Notícia", "Informativo", "Favoritos"];

const Tab1: React.FC = () => {
  const history = useHistory();
  const [favoritesVersion, setFavoritesVersion] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const { isAssistant } = useAuth();
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [popoverEvent, setPopoverEvent] = useState<Event | undefined>(undefined);

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

  const openPopover = (e: React.MouseEvent<HTMLIonButtonElement>) => {
    e.persist();
    setPopoverEvent(e.nativeEvent);
    setPopoverOpen(true);
  };

  const closePopover = () => {
    setPopoverOpen(false);
    setPopoverEvent(undefined);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar className="header-gradient">
          <IonTitle className="title-centered">Conecta Elas</IonTitle>
          {isAssistant && (
            <IonButtons slot="start">
              <IonButton onClick={openPopover} fill="clear">
                <IonIcon src="adicionar.svg" className="feed-action-icon" style={{ color: 'white' }} />
              </IonButton>
              <IonPopover
                isOpen={popoverOpen}
                event={popoverEvent}
                onDidDismiss={closePopover}
                className="feed-popover"
              >
                <IonList className="feed-popover-list">
                  <IonItem button onClick={() => { closePopover(); history.push("/tabs/add-post"); }} className="feed-popover-item" lines="none">
                    <IonLabel className="feed-popover-label">Adicionar post</IonLabel>
                  </IonItem>
                  <div className="feed-popover-divider" />
                  <IonItem button onClick={() => { closePopover(); history.push("/tabs/add-banner"); }} className="feed-popover-item" lines="none">
                    <IonLabel className="feed-popover-label">Adicionar banner</IonLabel>
                  </IonItem>
                </IonList>
              </IonPopover>
            </IonButtons>
          )}
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
