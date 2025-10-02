import React from "react";
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonButton,
  IonIcon,
} from "@ionic/react";
import { create, trash } from "ionicons/icons";
import "./QuizItem.css";

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

interface QuizItemProps {
  quiz: Quiz;
  onEdit: (quiz: Quiz) => void;
  onDelete: (quiz: Quiz) => void;
}

const QuizItem: React.FC<QuizItemProps> = ({ quiz, onEdit, onDelete }) => {
  return (
    <IonCard className="quiz-card">
      <IonCardHeader>
        <IonCardTitle>{quiz.Titulo}</IonCardTitle>
      </IonCardHeader>
      <IonCardContent>
        <p className="quiz-info">{quiz.perguntas?.length || 0} perguntas</p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
          <IonButton fill="solid" color="primary" onClick={() => onEdit(quiz)}>
            <IonIcon slot="start" icon={create} />
            Editar
          </IonButton>
          <IonButton fill="solid" color="danger" onClick={() => onDelete(quiz)}>
            <IonIcon slot="start" icon={trash} />
            Excluir
          </IonButton>
        </div>
      </IonCardContent>
    </IonCard>
  );
};

export default QuizItem;