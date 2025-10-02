import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
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
  IonItem,
  IonLabel,
  IonButton,
  IonIcon,
  IonSpinner,
} from "@ionic/react";
import { clipboardOutline, ribbonOutline } from "ionicons/icons";
import { getAllQuizzes } from "../Services/QuizService";
import "./QuizList.css";

interface Quiz {
  id: number;
  documentId: string;
  Titulo: string;
  perguntas: any[];
}

const QuizList: React.FC = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const history = useHistory();

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        setLoading(true);
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
      } catch (error) {
        console.error("Erro ao carregar quizzes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

  const handleQuizSelect = (quizId: number) => {
    // Limpar qualquer resultado anterior no localStorage
    localStorage.removeItem('quizResult');
    history.push(`/tabs/quiz-detail/${quizId}`);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar className="header-gradient">
          <IonTitle className="title-centered">Quizzes</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="custom-background">
        <div className="quiz-list-container">
          <div className="quiz-header">
            <h2 className="quiz-list-title">Quizzes Disponíveis</h2>
            <IonButton 
              routerLink="/tabs/quiz-progress" 
              fill="solid"  
              className="progress-button"
              size="small"
            >
              <IonIcon slot="start" icon={ribbonOutline} />
              Progresso
            </IonButton>
          </div>
          
          {loading ? (
            <div className="loading-container">
              <IonSpinner name="crescent" />
              <p>Carregando quizzes...</p>
            </div>
          ) : quizzes.length > 0 ? (
            <IonList>
              {quizzes.map((quiz) => (
                <IonCard key={quiz.id} className="quiz-card">
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
            </div>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default QuizList;