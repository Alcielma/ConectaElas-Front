import React, { useEffect, useState } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonButtons,
  IonBackButton,
} from '@ionic/react';

const TestLocalStorage: React.FC = () => {
  const [quizResult, setQuizResult] = useState<string | null>(null);
  const [parsedResult, setParsedResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const result = localStorage.getItem('quizResult');
      setQuizResult(result);
      
      if (result) {
        const parsed = JSON.parse(result);
        setParsedResult(parsed);
      }
    } catch (err) {
      setError(`Erro ao processar dados: ${err instanceof Error ? err.message : String(err)}`);
    }
  }, []);

  const clearLocalStorage = () => {
    localStorage.removeItem('quizResult');
    setQuizResult(null);
    setParsedResult(null);
    setError(null);
    alert('LocalStorage limpo!');
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar className="header-gradient">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/tabs/quiz" />
          </IonButtons>
          <IonTitle className="title-centered">Teste LocalStorage</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Conteúdo do LocalStorage</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            {error && (
              <div style={{ color: 'red', marginBottom: '20px' }}>
                <h3>Erro:</h3>
                <p>{error}</p>
              </div>
            )}
            
            <h3>Dados brutos:</h3>
            <pre style={{ whiteSpace: 'pre-wrap', overflow: 'auto', maxHeight: '200px', border: '1px solid #ccc', padding: '10px' }}>
              {quizResult || 'Nenhum dado encontrado'}
            </pre>
            
            {parsedResult && (
              <>
                <h3>Dados processados:</h3>
                <div style={{ marginBottom: '10px' }}>
                  <strong>Quiz ID:</strong> {parsedResult.quizId}
                </div>
                <div style={{ marginBottom: '10px' }}>
                  <strong>Título:</strong> {parsedResult.quizTitle}
                </div>
                <div style={{ marginBottom: '10px' }}>
                  <strong>Total de Perguntas:</strong> {parsedResult.totalPerguntas}
                </div>
                <div>
                  <strong>Respostas:</strong>
                  <ul>
                    {parsedResult.respostas?.map((resposta: any, index: number) => (
                      <li key={index}>
                        <div><strong>Pergunta:</strong> {resposta.pergunta}</div>
                        <div><strong>Resposta:</strong> {resposta.resposta}</div>
                        <div><strong>Correta:</strong> {resposta.correta ? 'Sim' : 'Não'}</div>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </IonCardContent>
        </IonCard>
        
        <IonButton expand="block" onClick={clearLocalStorage} color="danger">
          Limpar LocalStorage
        </IonButton>
      </IonContent>
    </IonPage>
  );
};

export default TestLocalStorage;