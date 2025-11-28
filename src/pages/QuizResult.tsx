import React, { useEffect, useState, useTransition } from 'react';
import { useHistory } from 'react-router';
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
  IonButton,
  IonIcon,
  IonSpinner,
} from '@ionic/react';
import { useParams } from 'react-router';
import { checkmarkCircleOutline, closeCircleOutline, arrowForwardOutline, chevronDownOutline, chevronUpOutline } from 'ionicons/icons';
import './QuizResult.css';

interface RouteParams {
  id: string;
}

interface Resposta {
  perguntaId: string;
  pergunta: string;
  resposta: string;
  correta: boolean;
  corretaResposta: string;
  explicacao: string;
}

interface ResultadoQuiz {
  quizId: string;
  quizTitle: string;
  totalPerguntas: number;
  respostas: Resposta[];
}

const QuizResult: React.FC = () => {
  const { id } = useParams<RouteParams>();
  const [isPending, startTransition] = useTransition();
  const [resultado, setResultado] = useState<ResultadoQuiz | null>(null);
  const [pontuacao, setPontuacao] = useState<number>(0);
  const [percentual, setPercentual] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [expandedAnswers, setExpandedAnswers] = useState<{ [key: string]: boolean }>({});
  const history = useHistory();

  useEffect(() => {
    setLoading(true);

    startTransition(() => {
      try {
        const resultadoSalvo = localStorage.getItem('quizResult');

        if (resultadoSalvo) {
          try {
            const resultadoParsed = JSON.parse(resultadoSalvo) as ResultadoQuiz;
            const quizIdString = String(resultadoParsed.quizId);

            if (quizIdString === id) {
              setResultado(resultadoParsed);

              const acertos = resultadoParsed.respostas.filter(r => r.correta).length;
              setPontuacao(acertos);
              setPercentual(Math.round((acertos / resultadoParsed.totalPerguntas) * 100));

              const quizHistoryKey = `quizHistory_${resultadoParsed.quizId}`;
              const quizData = {
                quizId: resultadoParsed.quizId,
                quizTitle: resultadoParsed.quizTitle,
                totalPerguntas: resultadoParsed.totalPerguntas,
                acertos: acertos,
                percentual: Math.round((acertos / resultadoParsed.totalPerguntas) * 100),
                dataRealizacao: new Date().toLocaleDateString()
              };

              localStorage.setItem(quizHistoryKey, JSON.stringify(quizData));
            }
          } catch {
            setResultado(null);
          }
        }
      } finally {
        setLoading(false);
      }
    });
  }, [id]);

  useEffect(() => {
    const handler = (ev: any) => {
      ev.detail.register(10, () => {
        history.replace("/tabs/quiz");
      });
    };
    document.addEventListener("ionBackButton", handler as any);
    return () => document.removeEventListener("ionBackButton", handler as any);
  }, [history]);

  const toggleAnswer = (perguntaId: string) => {
    setExpandedAnswers(prev => ({
      ...prev,
      [perguntaId]: !prev[perguntaId],
    }));
  };

  if (loading) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar className="header-gradient">
            <IonButtons slot="start">
              <IonBackButton defaultHref="/tabs/quiz" />
            </IonButtons>
            <IonTitle className="title-centered">Carregando Resultado</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding quiz-result-container">
          <div className="loading-container">
            <IonSpinner name="crescent" />
            <p>Carregando resultado do quiz...</p>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  if (!resultado) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar className="header-gradient">
            <IonButtons slot="start">
              <IonBackButton defaultHref="/tabs/quiz" />
            </IonButtons>
            <IonTitle className="title-centered">Resultado não encontrado</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding quiz-result-container">
          <div className="error-container">
            <p>Não foi possível encontrar o resultado do quiz.</p>
            <p>Por favor, tente realizar o quiz novamente.</p>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar className="header-gradient">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/tabs/quiz" />
          </IonButtons>
          <IonTitle className="title-centered">Resultado do Quiz</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding quiz-result-container">
        <IonCard className="result-summary-card">
          <IonCardHeader>
            <IonCardTitle className="result-title">{resultado.quizTitle}</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <div className="score-container">
              <div className="score-circle">
                <span className="score-number">{pontuacao}</span>
                <span className="score-total">/{resultado.totalPerguntas}</span>
              </div>
              <div className="score-percentage">
                <span>{percentual}%</span>
                <span className="score-label">
                  {percentual >= 70 ? 'Muito bom!' : percentual >= 50 ? 'Bom trabalho!' : 'Continue tentando!'}
                </span>
              </div>
            </div>
          </IonCardContent>
        </IonCard>

        <h2 className="section-title">Detalhes das Respostas</h2>

        <IonCard className="answers-card">
          <IonCardContent>
            {resultado.respostas.map((resposta, index) => (
              <div key={resposta.perguntaId} className="answer-item">
                <div className="question-header">
                  <span className="question-number">Pergunta {index + 1}</span>
                </div>
                <h3 className="question-title">{resposta.pergunta}</h3>
                <div className="answer-row">
                  <div className={`answer-detail ${resposta.correta ? 'correct' : 'wrong'}`}>
                    <IonIcon
                      icon={resposta.correta ? checkmarkCircleOutline : closeCircleOutline}
                      color={resposta.correta ? 'success' : 'danger'}
                      className="answer-icon"
                    />
                    <span className="answer-text">Sua resposta: <strong>{resposta.resposta}</strong></span>
                    <IonIcon
                      icon={expandedAnswers[resposta.perguntaId] ? chevronUpOutline : chevronDownOutline}
                      className="toggle-icon"
                      onClick={() => toggleAnswer(resposta.perguntaId)}
                    />
                  </div>
                  {expandedAnswers[resposta.perguntaId] && (
                    <>
                      <div className="correct-answer">
                        <span className="correct-answer-text">Resposta correta: <strong>{resposta.corretaResposta}</strong></span>
                      </div>
                      <div className={`explanation ${resposta.correta ? 'correct' : 'wrong'}`}>
                        <span className="explanation-text">Explicação da sua resposta: {resposta.explicacao}</span>
                      </div>
                    </>
                  )}
                </div>
                {index < resultado.respostas.length - 1 && <hr className="answer-divider" />}
              </div>
            ))}
          </IonCardContent>
        </IonCard>

        <div className="navigation-buttons">
          <IonButton
            expand="block"
            className="nav-button"
            onClick={() => {
              localStorage.removeItem("quizResult");
              localStorage.removeItem(`quizProgress_${resultado?.quizId}`);
              localStorage.removeItem("currentQuiz");
              history.replace("/tabs/quiz");
            }}
          >
            Voltar para Quizzes
            <IonIcon slot="end" icon={arrowForwardOutline} />
          </IonButton>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default QuizResult;