import React, { useCallback, useEffect, useState } from "react";
import { useLocation, useHistory } from "react-router-dom";
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonList,
  IonButton,
  IonIcon,
  IonSpinner,
  IonRefresher,
  IonRefresherContent,
  IonButtons,
  IonBackButton,
} from "@ionic/react";
import { refreshOutline, clipboardOutline } from "ionicons/icons";
import "./QuizList.css";

interface CacaPalavrasItem {
  id: number;
  documentId?: string;
  titulo: string;
  palavras: string[];
  grade: {
    linhas: number;
    colunas: number;
    grade: string[][];
  };
}

const CacaPalavrasList: React.FC = () => {
  const [items, setItems] = useState<CacaPalavrasItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [lastFetch, setLastFetch] = useState<number>(0);
  const location = useLocation();
  const history = useHistory();

  const fetchItems = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/caca-palavras`);
      const json = await res.json();
      const arr = Array.isArray(json?.data) ? json.data : [];
      setItems(arr as CacaPalavrasItem[]);
      setLastFetch(Date.now());
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems(true);
  }, [fetchItems, location.pathname]);

  useEffect(() => {
    const handleFocus = () => {
      const timeSinceLastFetch = Date.now() - lastFetch;
      if (timeSinceLastFetch > 5000) fetchItems(false);
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        const timeSinceLastFetch = Date.now() - lastFetch;
        if (timeSinceLastFetch > 5000) fetchItems(false);
      }
    };
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [fetchItems, lastFetch]);

  const handleRefresh = async (event: CustomEvent) => {
    await fetchItems(false);
    event.detail.complete();
  };

  const handleManualRefresh = () => {
    fetchItems(true);
  };

  useEffect(() => {
    const handler = (ev: any) => {
      ev.detail.register(10, () => {
        history.replace("/tabs/games");
      });
    };
    document.addEventListener("ionBackButton", handler as any);
    return () => document.removeEventListener("ionBackButton", handler as any);
  }, [history]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar className="header-gradient">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/tabs/games" />
          </IonButtons>
          <IonTitle className="title-centered">Temas de Caça-Palavras</IonTitle>
          <IonButton slot="end" fill="clear" onClick={handleManualRefresh} disabled={loading}>
          </IonButton>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="custom-background">
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent
            pullingIcon={refreshOutline}
            pullingText="Puxe para atualizar"
            refreshingSpinner="circles"
            refreshingText="Atualizando..."
          />
        </IonRefresher>

        <div className="quiz-list-container">
          <div className="quiz-header">
          </div>

          {loading ? (
            <div className="loading-container">
              <IonSpinner name="crescent" />
              <p>Carregando temas...</p>
            </div>
          ) : items.length > 0 ? (
            <IonList>
              {items.map((item) => (
                <IonCard key={`${item.id}-${lastFetch}`} className="quiz-card">
                  <IonCardHeader>
                    <IonCardTitle>{item.titulo}</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <p className="quiz-info">
                      {Array.isArray(item.palavras) && item.palavras.length ? `${item.palavras.length} palavra(s)` : "Sem palavras"}
                    </p>
                    <IonButton
                      expand="block"
                      className="quiz-button"
                      disabled={!item.grade || !item.grade.colunas}
                      onClick={() => history.push(`/tabs/games/caca-palavras/${item.id}`)}
                    >
                      <IonIcon slot="start" icon={clipboardOutline} />
                      Iniciar Caça-Palavras
                    </IonButton>
                  </IonCardContent>
                </IonCard>
              ))}
            </IonList>
          ) : (
            <div className="no-quizzes">
              <p>Nenhum tema disponível no momento.</p>
            </div>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default CacaPalavrasList;
