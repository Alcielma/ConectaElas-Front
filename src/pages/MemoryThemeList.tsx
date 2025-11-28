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
import { refreshOutline, albumsOutline } from "ionicons/icons";
import { getAllMemoryThemes, TemaMemoria } from "../Services/MemoryThemeService";
import "./QuizList.css";

const MemoryThemeList: React.FC = () => {
  const [themes, setThemes] = useState<TemaMemoria[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [lastFetch, setLastFetch] = useState<number>(0);
  const location = useLocation();
  const history = useHistory();

  const fetchThemes = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const response = await getAllMemoryThemes();
      const data = Array.isArray((response as any).data) ? (response as any).data : [];
      setThemes(
        data.map((t: any) => ({
          id: t.id,
          documentId: t.documentId ?? "",
          Nome_tema: t.Nome_tema ?? "",
          createdAt: t.createdAt ?? "",
          updatedAt: t.updatedAt ?? "",
          publishedAt: t.publishedAt ?? "",
          locale: t.locale ?? null,
          cartas: t.cartas ?? [],
          jogo_memoria: t.jogo_memoria ?? null,
          localizations: t.localizations ?? [],
        }))
      );
      setLastFetch(Date.now());
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchThemes(true);
  }, [fetchThemes, location.pathname]);

  useEffect(() => {
    const handleFocus = () => {
      const timeSinceLastFetch = Date.now() - lastFetch;
      if (timeSinceLastFetch > 5000) fetchThemes(false);
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        const timeSinceLastFetch = Date.now() - lastFetch;
        if (timeSinceLastFetch > 5000) fetchThemes(false);
      }
    };
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [fetchThemes, lastFetch]);

  const handleRefresh = async (event: CustomEvent) => {
    await fetchThemes(false);
    event.detail.complete();
  };

  const handleManualRefresh = () => {
    fetchThemes(true);
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
          <IonTitle className="title-centered">Temas do Jogo da Memória</IonTitle>
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
            <h2 className="quiz-list-title">Temas Disponíveis</h2>
          </div>

          {loading ? (
            <div className="loading-container">
              <IonSpinner name="crescent" />
              <p>Carregando temas...</p>
            </div>
          ) : themes.length > 0 ? (
            <IonList>
              {themes.map((tema) => (
                <IonCard key={`${tema.id}-${lastFetch}`} className="quiz-card">
                  <IonCardHeader>
                    <IonCardTitle>{tema.Nome_tema}</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <p className="quiz-info">
                      {Array.isArray(tema.cartas) && tema.cartas.length ? `${tema.cartas.length} carta(s)` : "Sem cartas"}
                    </p>
                    <IonButton expand="block" className="quiz-button" disabled={!tema.cartas || tema.cartas.length === 0} onClick={() => history.push(`/tabs/games/memory/${tema.id}`)}>
                      <IonIcon slot="start" icon={albumsOutline} />
                      Abrir Tema
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

export default MemoryThemeList;