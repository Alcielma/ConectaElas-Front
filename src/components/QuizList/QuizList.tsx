import React from "react";
import {
  IonList,
  IonButton,
  IonIcon,
  IonSpinner,
  IonCardContent,
} from "@ionic/react";
import { add } from "ionicons/icons";
import QuizItem from "../QuizItem/QuizItem";
import "./QuizList.css";

interface Quiz {
  id: number;
  Titulo: string;
  perguntas: {
    id: number;
    Questao: string;
    respostas: {
      id: number;
      Resposta: string;
      Correcao: boolean;
    }[];
  }[];
}

interface QuizListProps {
  quizzes: Quiz[];
  loading: boolean;
  onCreateClick: () => void;
  onEditQuiz: (quiz: Quiz) => void;
  onDeleteQuiz: (quiz: Quiz) => void;
}

const QuizList: React.FC<QuizListProps> = ({
  quizzes,
  loading,
  onCreateClick,
  onEditQuiz,
  onDeleteQuiz,
}) => {
  return (
    <div>
      <IonCardContent>
        <IonButton expand="block" onClick={onCreateClick}>
          <IonIcon slot="start" icon={add} />
          Criar Novo Quiz
        </IonButton>

        {loading ? (
          <div className="spinner-container">
            <IonSpinner name="crescent" />
          </div>
        ) : (
          <IonList>
            {quizzes.length > 0 ? (
              quizzes.map((quiz) => (
                <QuizItem
                  key={quiz.id}
                  quiz={quiz}
                  onEdit={onEditQuiz}
                  onDelete={onDeleteQuiz}
                />
              ))
            ) : (
              <div className="no-quizzes">
                <p>Nenhum quiz encontrado</p>
                <p>Isso pode ocorrer pelos seguintes motivos:</p>
                <ul>
                  <li>O servidor de quizzes pode estar indisponível</li>
                  <li>Não há quizzes cadastrados no sistema</li>
                  <li>Você pode não ter permissão para acessar os quizzes</li>
                </ul>
                <p>Tente criar um novo quiz ou entre em contato com o administrador.</p>
              </div>
            )}
          </IonList>
        )}
      </IonCardContent>
    </div>
  );
};

export default QuizList;