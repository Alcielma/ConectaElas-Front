import React, { useEffect, useState } from 'react';
import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonProgressBar,
  IonIcon,
  IonSpinner,
  IonItem,
  IonLabel,
  IonList,
  IonBadge,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
  IonAlert,
  IonToast,
} from '@ionic/react';
import { checkmarkCircleOutline, timeOutline, ribbonOutline, trash } from 'ionicons/icons';
import './QuizProgress.css';

interface QuizProgressItem {
  quizId: number;
  quizTitle: string;
  totalPerguntas: number;
  acertos: number;
  percentual: number;
  dataRealizacao: string;
}

const QuizProgress: React.FC = () => {
  const [progressData, setProgressData] = useState<QuizProgressItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showDeleteAlert, setShowDeleteAlert] = useState<boolean>(false);
  const [itemToDelete, setItemToDelete] = useState<QuizProgressItem | null>(null);
  const [showToast, setShowToast] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>("");

  useEffect(() => {
    setLoading(true);
    
    // Função para carregar os resultados dos quizzes do localStorage
    const loadQuizProgress = () => {
      try {
        // Buscar todos os itens do localStorage
        const quizResults: QuizProgressItem[] = [];
        
        // Percorrer todas as chaves do localStorage
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          
          // Verificar se a chave corresponde a um histórico de quiz
          if (key && key.startsWith('quizHistory_')) {
            try {
              const quizData = JSON.parse(localStorage.getItem(key) || '');
              
              // Adicionar ao array de resultados
              quizResults.push({
                quizId: Number(quizData.quizId),
                quizTitle: quizData.quizTitle,
                totalPerguntas: quizData.totalPerguntas,
                acertos: quizData.acertos,
                percentual: quizData.percentual,
                dataRealizacao: quizData.dataRealizacao
              });
            } catch (error) {
              console.error('Erro ao processar resultado do quiz:', error);
            }
          }
        }
        
        // Ordenar por data mais recente (assumindo que dataRealizacao é uma string de data)
        quizResults.sort((a, b) => {
          const dateA = new Date(a.dataRealizacao.split('/').reverse().join('-'));
          const dateB = new Date(b.dataRealizacao.split('/').reverse().join('-'));
          return dateB.getTime() - dateA.getTime();
        });
        
        setProgressData(quizResults);
      } catch (error) {
        console.error('Erro ao carregar progresso dos quizzes:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadQuizProgress();
  }, []);

  const getProgressColor = (percentual: number) => {
    if (percentual >= 70) return 'success';
    if (percentual >= 50) return 'warning';
    return 'danger';
  };

  // Função para confirmar a exclusão
  const confirmDelete = (item: QuizProgressItem) => {
    setItemToDelete(item);
    setShowDeleteAlert(true);
  };

  // Função para deletar o item
  const deleteProgressItem = () => {
    if (!itemToDelete) return;

    try {
      // Encontrar a chave no localStorage
      const keyToDelete = `quizHistory_${itemToDelete.quizId}_${itemToDelete.dataRealizacao.replace(/\//g, '')}`;
      
      // Tentar encontrar a chave exata no localStorage
      let actualKey = '';
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('quizHistory_')) {
          const quizData = JSON.parse(localStorage.getItem(key) || '{}');
          if (quizData.quizId === itemToDelete.quizId && 
              quizData.dataRealizacao === itemToDelete.dataRealizacao) {
            actualKey = key;
            break;
          }
        }
      }

      if (actualKey) {
        // Remover do localStorage
        localStorage.removeItem(actualKey);
        
        // Atualizar o estado removendo o item
        setProgressData(prev => prev.filter(item => 
          !(item.quizId === itemToDelete.quizId && 
            item.dataRealizacao === itemToDelete.dataRealizacao)
        ));
        
        setToastMessage("Resultado removido com sucesso!");
        setShowToast(true);
      } else {
        setToastMessage("Erro ao encontrar o resultado no histórico");
        setShowToast(true);
      }
    } catch (error) {
      console.error('Erro ao deletar resultado:', error);
      setToastMessage("Erro ao remover resultado");
      setShowToast(true);
    } finally {
      setItemToDelete(null);
      setShowDeleteAlert(false);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar className="header-gradient">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/tabs/quiz" />
          </IonButtons>
          <IonTitle className="title-centered">Progresso dos Quizzes</IonTitle>
        </IonToolbar>
      </IonHeader>
      
      <IonContent className="ion-padding quiz-progress-container">
        {loading ? (
          <div className="loading-container">
            <IonSpinner name="crescent" />
            <p>Carregando progresso...</p>
          </div>
        ) : progressData.length > 0 ? (
          <>
            <div className="progress-summary">
              <IonCard className="summary-card">
                <IonCardHeader>
                  <IonCardTitle>Resumo de Desempenho</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <div className="summary-stats">
                    <div className="stat-item">
                      <IonIcon icon={checkmarkCircleOutline} color="success" />
                      <div className="stat-value">{progressData.length}</div>
                      <div className="stat-label">Quizzes Realizados</div>
                    </div>
                    <div className="stat-item">
                      <IonIcon icon={ribbonOutline} color="primary" />
                      <div className="stat-value">
                        {Math.round(
                          progressData.reduce((acc, item) => acc + item.percentual, 0) / progressData.length
                        )}%
                      </div>
                      <div className="stat-label">Média de Acertos</div>
                    </div>
                  </div>
                </IonCardContent>
              </IonCard>
            </div>

            <h2 className="section-title">Histórico de Quizzes</h2>
            <p className="swipe-instruction">Deslize para a direita para deletar um resultado</p>
            
            <IonList>
              {progressData.map((item, index) => (
                <IonItemSliding key={`${item.quizId}-${index}`}>
                  <IonItem>
                    <IonCard className="progress-card full-width">
                      <IonCardHeader>
                        <IonCardTitle>{item.quizTitle}</IonCardTitle>
                      </IonCardHeader>
                      <IonCardContent>
                        <div className="quiz-progress-details">
                          <div className="progress-score">
                            <span className="score-value">{item.acertos}</span>
                            <span className="score-total">/{item.totalPerguntas}</span>
                          </div>
                          
                          <div className="progress-bar-container">
                            <div className="progress-percentage">{item.percentual}%</div>
                            <IonProgressBar 
                              value={item.percentual / 100} 
                              color={getProgressColor(item.percentual)}
                            />
                          </div>
                        </div>
                        
                        <div className="quiz-meta">
                          <IonIcon icon={timeOutline} />
                          <span className="quiz-date">{item.dataRealizacao}</span>
                          
                          <IonBadge color={getProgressColor(item.percentual)} className="performance-badge">
                            {item.percentual >= 70 ? 'Ótimo' : item.percentual >= 50 ? 'Bom' : 'Precisa Melhorar'}
                          </IonBadge>
                        </div>
                      </IonCardContent>
                    </IonCard>
                  </IonItem>

                  <IonItemOptions side="end">
                    <IonItemOption 
                      color="danger" 
                      onClick={() => confirmDelete(item)}
                      expandable
                    >
                      <IonIcon slot="icon-only" icon={trash} />
                      Deletar
                    </IonItemOption>
                  </IonItemOptions>
                </IonItemSliding>
              ))}
            </IonList>
          </>
        ) : (
          <div className="no-progress">
            <h2>Nenhum quiz realizado ainda</h2>
            <p>Complete alguns quizzes para ver seu progresso aqui.</p>
          </div>
        )}

        {/* Alert de Confirmação de Exclusão */}
        <IonAlert
          isOpen={showDeleteAlert}
          onDidDismiss={() => setShowDeleteAlert(false)}
          header="Confirmar Exclusão"
          message={`Tem certeza que deseja remover o resultado do quiz "${itemToDelete?.quizTitle}"?`}
          buttons={[
            {
              text: "Cancelar",
              role: "cancel",
              handler: () => {
                setItemToDelete(null);
                setShowDeleteAlert(false);
              }
            },
            {
              text: "Deletar",
              handler: deleteProgressItem
            }
          ]}
        />

        {/* Toast de Feedback */}
        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={2000}
          color={toastMessage.includes("sucesso") ? "success" : "danger"}
        />
      </IonContent>
    </IonPage>
  );
};

export default QuizProgress;