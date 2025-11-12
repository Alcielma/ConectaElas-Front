import React from "react";
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonContent,
  IonItem,
  IonLabel,
  IonInput,
  IonCardContent,
} from "@ionic/react";
import { close, checkmark, addCircle } from "ionicons/icons";
import QuestionForm from "../QuestionForm/QuestionForm";
import "./QuizForm.css";

interface NovaResposta {
  texto: string;
  correta: boolean;
  explicacao: string;
}

interface NovaPergunta {
  questao: string;
  respostas: NovaResposta[];
}

interface NovoQuiz {
  titulo: string;
  perguntas: NovaPergunta[];
}

interface QuizFormProps {
  isOpen: boolean;
  onClose: () => void;
  quiz: NovoQuiz;
  isEditing: boolean;
  isUpdating?: boolean;
  onTituloChange: (value: string) => void;
  onQuestaoChange: (index: number, value: string) => void;
  onRespostaChange: (perguntaIndex: number, respostaIndex: number, value: string) => void;
  onCorrecaoChange: (perguntaIndex: number, respostaIndex: number, value: boolean) => void;
  onExplicacaoChange: (perguntaIndex: number, respostaIndex: number, value: string) => void;
  onAddPergunta: () => void;
  onRemovePergunta: (index: number) => void;
  onAddResposta: (perguntaIndex: number) => void;
  onRemoveResposta: (perguntaIndex: number, respostaIndex: number) => void;
  onSave: () => void;
}

const QuizForm: React.FC<QuizFormProps> = ({
  isOpen,
  onClose,
  quiz,
  isEditing,
  isUpdating = false,
  onTituloChange,
  onQuestaoChange,
  onRespostaChange,
  onCorrecaoChange,
  onExplicacaoChange,
  onAddPergunta,
  onRemovePergunta,
  onAddResposta,
  onRemoveResposta,
  onSave,
}) => {
  const title = isEditing ? "Editar Quiz" : "Criar Novo Quiz";
  const actionButtonText = isEditing ? "Atualizar Quiz" : "Criar Quiz";

  return (
    <IonContent>
      <div className="quiz-result-container ion-padding">
        <IonCardContent>
          <IonItem>
            <IonLabel position="stacked">Título do Quiz</IonLabel>
            <IonInput
              value={quiz.titulo}
              onIonChange={(e) => onTituloChange(e.detail.value || "")}
              placeholder="Digite o título do quiz"
              className="custom-input"
            />
          </IonItem>

          {quiz.perguntas.map((pergunta, perguntaIndex) => (
            <QuestionForm
              key={perguntaIndex}
              pergunta={pergunta}
              perguntaIndex={perguntaIndex}
              totalPerguntas={quiz.perguntas.length}
              onQuestaoChange={onQuestaoChange}
              onRespostaChange={onRespostaChange}
              onCorrecaoChange={onCorrecaoChange}
              onExplicacaoChange={onExplicacaoChange}
              onAddResposta={onAddResposta}
              onRemoveResposta={onRemoveResposta}
              onRemovePergunta={onRemovePergunta}
            />
          ))}

          <div className="navigation-buttons">
            <IonButton
              className="action-button"
              expand="block"
              onClick={onAddPergunta}
            >
              <IonIcon slot="start" icon={addCircle} />
              Adicionar Pergunta
            </IonButton>

            <IonButton
              className="action-button"
              expand="block"
              onClick={onSave}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <IonIcon slot="start" icon="" />
              ) : (
                <IonIcon slot="start" icon={checkmark} />
              )}
              {isUpdating ? "Atualizando..." : actionButtonText}
            </IonButton>
          </div>
        </IonCardContent>
      </div>
    </IonContent>
  );
};

export default QuizForm;