import React, { useEffect, useState } from 'react';
import { useAuth } from '../Contexts/AuthContext';
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
  IonAvatar,
  IonSearchbar,
  IonButton,
} from '@ionic/react';
import { checkmarkCircleOutline, timeOutline, ribbonOutline, trash, personOutline, chevronForwardOutline } from 'ionicons/icons';
import './QuizProgress.css';

interface QuizProgressItem {
  quizId: number;
  quizTitle: string;
  totalPerguntas: number;
  acertos: number;
  percentual: number;
  dataRealizacao: string;
  userId?: number;
  userName?: string;
}

interface UserSummary {
  userId: number;
  userName: string;
  totalQuizzes: number;
  averageScore: number;
  lastQuizDate: string;
  lastScorePercent: number;
  lastScoreColor: 'success' | 'warning' | 'danger';
}

const QuizProgress: React.FC = () => {
  const { user, isAssistant } = useAuth();
  const [progressData, setProgressData] = useState<QuizProgressItem[]>([]);
  const [usersList, setUsersList] = useState<UserSummary[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserSummary[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserSummary | null>(null);
  const [viewMode, setViewMode] = useState<'userList' | 'userDetails'>('userDetails');
  const [loading, setLoading] = useState<boolean>(true);
  const [showDeleteAlert, setShowDeleteAlert] = useState<boolean>(false);
  const [itemToDelete, setItemToDelete] = useState<QuizProgressItem | null>(null);
  const [showToast, setShowToast] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>("");
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    if (isAssistant) {
      setViewMode('userList');
      loadAllUsersProgress();
    } else {
      setViewMode('userDetails');
      loadQuizProgress();
    }
  }, [user, isAssistant]);

  useEffect(() => {
    if (searchText === '') {
      setFilteredUsers(usersList);
    } else {
      setFilteredUsers(usersList.filter(u => 
        u.userName.toLowerCase().includes(searchText.toLowerCase())
      ));
    }
  }, [searchText, usersList]);

  const loadAllUsersProgress = () => {
    setLoading(true);
    try {
      const userMap = new Map<number, QuizProgressItem[]>();
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('quizHistory_')) {
          try {
            const quizData = JSON.parse(localStorage.getItem(key) || '') as QuizProgressItem;
            if (quizData.userId) {
              const currentList = userMap.get(quizData.userId) || [];
              currentList.push(quizData);
              userMap.set(quizData.userId, currentList);
            }
          } catch (e) {
            console.error('Error parsing quiz data', e);
          }
        }
      }

      const summaries: UserSummary[] = [];
      userMap.forEach((items, userId) => {
        const userName = items[0].userName || `Usuário ${userId}`;
        const totalQuizzes = items.length;
        const avgScore = items.reduce((acc, item) => acc + item.percentual, 0) / totalQuizzes;
        
        // Find latest date
        const sortedItems = [...items].sort((a, b) => {
           const dateA = new Date(a.dataRealizacao.split('/').reverse().join('-'));
           const dateB = new Date(b.dataRealizacao.split('/').reverse().join('-'));
           return dateB.getTime() - dateA.getTime();
        });

        const lastScorePercent = sortedItems[0].percentual;
        const lastScoreColor: 'success' | 'warning' | 'danger' =
          lastScorePercent >= 70 ? 'success' : lastScorePercent >= 50 ? 'warning' : 'danger';

        summaries.push({
          userId,
          userName,
          totalQuizzes,
          averageScore: Math.round(avgScore),
          lastQuizDate: sortedItems[0].dataRealizacao,
          lastScorePercent,
          lastScoreColor,
        });
      });

      setUsersList(summaries);
      setFilteredUsers(summaries);
    } catch (error) {
      console.error('Error loading all users progress', error);
    } finally {
      setLoading(false);
    }
  };

  const loadQuizProgress = (targetUserId?: number) => {
    setLoading(true);
    const userIdToLoad = targetUserId || user?.id;
    
    if (!userIdToLoad) {
      setLoading(false);
      return;
    }

    try {
      const quizResults: QuizProgressItem[] = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('quizHistory_')) {
          try {
            const quizData = JSON.parse(localStorage.getItem(key) || '');
            if (quizData.userId === userIdToLoad) {
              quizResults.push({
                quizId: Number(quizData.quizId),
                quizTitle: quizData.quizTitle,
                totalPerguntas: quizData.totalPerguntas,
                acertos: quizData.acertos,
                percentual: quizData.percentual,
                dataRealizacao: quizData.dataRealizacao,
                userId: quizData.userId,
                userName: quizData.userName
              });
            }
          } catch (error) {
            console.error('Erro ao processar resultado do quiz:', error);
          }
        }
      }
      
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

  const handleUserSelect = (summary: UserSummary) => {
    setSelectedUser(summary);
    setViewMode('userDetails');
    loadQuizProgress(summary.userId);
  };

  const handleBack = () => {
    if (isAssistant && viewMode === 'userDetails' && selectedUser) {
      setViewMode('userList');
      setSelectedUser(null);
    }
  };

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
              quizData.dataRealizacao === itemToDelete.dataRealizacao &&
              quizData.userId === user?.id) {
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
            {isAssistant && viewMode === 'userDetails' ? (
              <IonButton onClick={handleBack} fill="clear">
                <IonIcon slot="icon-only" icon={chevronForwardOutline} style={{ transform: 'rotate(180deg)', fontSize: '24px' }} />
              </IonButton>
            ) : (
              <IonBackButton defaultHref="/tabs/quiz" />
            )}
          </IonButtons>
          <IonTitle className="title-centered">
            {viewMode === 'userList' ? 'Usuários' : 
             selectedUser ? `Progresso de ${selectedUser.userName.split(' ')[0]}` : 'Meu Progresso'}
          </IonTitle>
        </IonToolbar>
      </IonHeader>
      
      <IonContent className="ion-padding quiz-progress-container">
        {loading ? (
          <div className="loading-container">
            <IonSpinner name="crescent" />
            <p>Carregando...</p>
          </div>
        ) : viewMode === 'userList' ? (
          <>
            <IonSearchbar 
              value={searchText} 
              onIonChange={e => setSearchText(e.detail.value!)} 
              placeholder="Buscar usuário..."
              className="user-searchbar"
            />
            
            {filteredUsers.length > 0 ? (
              <IonList className="user-list">
                {filteredUsers.map((userSummary) => (
                  <IonItem 
                    key={userSummary.userId} 
                    button 
                    onClick={() => handleUserSelect(userSummary)}
                    className="user-item"
                  >
                    <IonAvatar slot="start">
                      <div className="user-avatar-placeholder">
                        {userSummary.userName.charAt(0).toUpperCase()}
                      </div>
                    </IonAvatar>
                    <IonLabel>
                      <h2 className="user-name">{userSummary.userName}</h2>
                      <p className="user-last-quiz">Último quiz: {userSummary.lastQuizDate}</p>
                    </IonLabel>
                    <div className="user-stats" slot="end">
                      <div className="stat-badge">
                        <span className="stat-number">{userSummary.totalQuizzes}</span>
                        <span className="stat-text">Quizzes</span>
                      </div>
                      <div className={`stat-badge score ${getProgressColor(userSummary.averageScore)}`}>
                        <span className="stat-number">{userSummary.averageScore}%</span>
                        <span className="stat-text">Média</span>
                      </div>
                    </div>
                    <IonIcon icon={chevronForwardOutline} slot="end" color="medium" />
                  </IonItem>
                ))}
              </IonList>
            ) : (
              <div className="no-progress">
                <h2>Nenhum usuário encontrado</h2>
                <p>{searchText ? "Tente outro termo de busca." : "Nenhum histórico de quiz encontrado neste dispositivo."}</p>
              </div>
            )}
          </>
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
            {!isAssistant && <p className="swipe-instruction">Deslize para a direita para deletar um resultado</p>}
            
            <IonList>
              {progressData.map((item, index) => (
                <IonItemSliding key={`${item.quizId}-${index}`} disabled={isAssistant}>
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
            <p>Este usuário ainda não completou nenhum quiz.</p>
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
