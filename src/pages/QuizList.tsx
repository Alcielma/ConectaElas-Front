import React, { useEffect, useState, useCallback } from "react";
import { useHistory, useLocation } from "react-router-dom";
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
import { clipboardOutline, ribbonOutline, refreshOutline } from "ionicons/icons";
import { getAllQuizzes } from "../Services/QuizService";
import "./QuizList.css";
import { useAuth } from "../Contexts/AuthContext";

interface Quiz {
  id: number;
  documentId: string;
  Titulo: string;
  perguntas: any[];
}

const QuizList: React.FC = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [lastFetch, setLastFetch] = useState<number>(0);
  const history = useHistory();
  const location = useLocation();
  const { user, isAssistant } = useAuth();
  const isAdmin = user?.tipo === "Administrador";

  // Função para buscar quizzes (memoizada para evitar recriação)
  const fetchQuizzes = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      
      const response = await getAllQuizzes();
      
      // Ajuste para lidar com diferentes formatos de resposta
      if ('data' in response && Array.isArray(response.data)) {
        setQuizzes(
          response.data.map((quiz: any) => ({
            id: quiz.id,
            documentId: quiz.documentId ?? "",
            Titulo: quiz.Titulo ?? "",
            perguntas: quiz.perguntas ?? [],
          }))
        );
      } else if (Array.isArray(response)) {
        setQuizzes(
          response.map((quiz: any) => ({
            id: quiz.id,
            documentId: quiz.documentId ?? "",
            Titulo: quiz.Titulo ?? "",
            perguntas: quiz.perguntas ?? [],
          }))
        );
      } else {
        setQuizzes([]);
      }
      
      setLastFetch(Date.now());
    } catch (error) {
      console.error("Erro ao carregar quizzes:", error);
      setQuizzes([]);
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }, []);

  // Carregamento inicial e sempre que a rota mudar
  useEffect(() => {
    fetchQuizzes(true);
  }, [fetchQuizzes, location.pathname]);

  useEffect(() => {
    const handler = (ev: any) => {
      ev.detail.register(10, () => {
        history.replace("/tabs/games");
      });
    };
    document.addEventListener("ionBackButton", handler as any);
    return () => document.removeEventListener("ionBackButton", handler as any);
  }, [history]);

  // Recarregar quando a página voltar a ser focada
  useEffect(() => {
    const handleFocus = () => {
      // Só recarrega se passou mais de 5 segundos desde a última busca
      const timeSinceLastFetch = Date.now() - lastFetch;
      if (timeSinceLastFetch > 5000) {
        fetchQuizzes(false);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const timeSinceLastFetch = Date.now() - lastFetch;
        if (timeSinceLastFetch > 5000) {
          fetchQuizzes(false);
        }
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchQuizzes, lastFetch]);

  // Função para o pull-to-refresh
  const handleRefresh = async (event: CustomEvent) => {
    await fetchQuizzes(false);
    event.detail.complete();
  };

  const handleQuizSelect = (quizId: number) => {
    // Limpar qualquer resultado anterior no localStorage
    localStorage.removeItem('quizResult');
    history.push(`/tabs/quiz-detail/${quizId}`);
  };

  const handleManualRefresh = () => {
    fetchQuizzes(true);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar className="header-gradient">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/tabs/games" />
          </IonButtons>
          <IonTitle className="title-centered">Quizzes</IonTitle>
          <IonButton 
            slot="end" 
            fill="clear" 
            onClick={handleManualRefresh}
            disabled={loading}
          >
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
            {!(isAssistant || isAdmin) && (
              <IonButton 
                routerLink="/tabs/quiz-progress" 
                fill="solid"
                expand="block"
                className="quiz-button"
              >
                <IonIcon slot="start" icon={ribbonOutline} />
                Progresso
              </IonButton>
            )}
          </div>
          
          {loading ? (
            <div className="loading-container">
              <IonSpinner name="crescent" />
              <p>Carregando quizzes...</p>
            </div>
          ) : quizzes.length > 0 ? (
            <IonList>
              {quizzes.map((quiz) => (
                <IonCard key={`${quiz.id}-${lastFetch}`} className="quiz-card">
                  <IonCardHeader>
                    <IonCardTitle>{quiz.Titulo}</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <p className="quiz-info">
                      {quiz.perguntas && quiz.perguntas.length ? `${quiz.perguntas.length} pergunta(s)` : "Sem perguntas"}
                    </p>
                    <IonButton 
                      expand="block" 
                      onClick={() => handleQuizSelect(quiz.id)}
                      className="quiz-button"
                      disabled={!quiz.perguntas || quiz.perguntas.length === 0}
                    >
                      <IonIcon slot="start" icon={clipboardOutline} />
                      Iniciar Quiz
                    </IonButton>
                  </IonCardContent>
                </IonCard>
              ))}
            </IonList>
          ) : (
            <div className="no-quizzes">
              <p>Nenhum quiz disponível no momento.</p>
              <p>Isso pode ocorrer pelos seguintes motivos:</p>
              <ul>
                <li>O servidor de quizzes pode estar indisponível</li>
                <li>Não há quizzes cadastrados no sistema</li>
                <li>Você pode não ter permissão para acessar os quizzes</li>
              </ul>
              <p>Tente novamente mais tarde ou entre em contato com o administrador.</p>
              <IonButton 
                expand="block" 
                onClick={handleManualRefresh}
                className="retry-button"
                disabled={loading}
              >
                <IonIcon slot="start" icon={refreshOutline} />
                Tentar Novamente
              </IonButton>
            </div>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default QuizList;
