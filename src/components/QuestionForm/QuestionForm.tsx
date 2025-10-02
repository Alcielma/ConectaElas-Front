import React from "react";
import {
  IonItem,
  IonLabel,
  IonTextarea,
  IonButton,
  IonIcon,
  IonGrid,
  IonRow,
  IonCol,
  IonInput,
  IonCheckbox,
} from "@ionic/react";
import { addCircle, removeCircle } from "ionicons/icons";
import "./QuestionForm.css";

interface NovaResposta {
  texto: string;
  correta: boolean;
}

interface NovaPergunta {
  questao: string;
  respostas: NovaResposta[];
}

interface QuestionFormProps {
  pergunta: NovaPergunta;
  perguntaIndex: number;
  totalPerguntas: number;
  onQuestaoChange: (index: number, value: string) => void;
  onRespostaChange: (perguntaIndex: number, respostaIndex: number, value: string) => void;
  onCorrecaoChange: (perguntaIndex: number, respostaIndex: number, value: boolean) => void;
  onAddResposta: (perguntaIndex: number) => void;
  onRemoveResposta: (perguntaIndex: number, respostaIndex: number) => void;
  onRemovePergunta: (index: number) => void;
}

const QuestionForm: React.FC<QuestionFormProps> = ({
  pergunta,
  perguntaIndex,
  totalPerguntas,
  onQuestaoChange,
  onRespostaChange,
  onCorrecaoChange,
  onAddResposta,
  onRemoveResposta,
  onRemovePergunta,
}) => {
  return (
    <div className="pergunta-container">
      <div className="question-header">
        <div className="question-number">Pergunta {perguntaIndex + 1}</div>
        <IonButton
          className="remove-button-inside"
          color="danger"
          fill="clear"
          size="small"
          onClick={() => onRemovePergunta(perguntaIndex)}
          disabled={totalPerguntas <= 1}
        >
          <IonIcon icon={removeCircle} />
        </IonButton>
      </div>

      <div className="input-container">
        <label className="input-label">Questão</label>
        <IonTextarea
          className="custom-input"
          value={pergunta.questao}
          onIonChange={(e) => onQuestaoChange(perguntaIndex, e.detail.value || "")}
          placeholder="Digite a pergunta"
          rows={3}
        />
      </div>

      {pergunta.respostas.map((resposta, respostaIndex) => (
        <div key={respostaIndex} className="resposta-container">
          <div className="input-container">
            <label className="input-label">Resposta {respostaIndex + 1}</label>
            <div className="input-container-with-toggle">
              <div
                className={`toggle-switch ${resposta.correta ? 'toggle-checked' : ''}`}
                onClick={() =>
                  onCorrecaoChange(perguntaIndex, respostaIndex, !resposta.correta)
                }
              >
                <div className="toggle-slider"></div>
              </div>
              <IonInput
                className="custom-input with-toggle"
                value={resposta.texto}
                onIonChange={(e) =>
                  onRespostaChange(perguntaIndex, respostaIndex, e.detail.value || "")
                }
                placeholder="Digite a resposta"
              />
              <IonButton
                className="remove-button-inside remove-button-response"
                color="danger"
                fill="clear"
                size="small"
                onClick={() => onRemoveResposta(perguntaIndex, respostaIndex)}
                disabled={pergunta.respostas.length <= 2}
              >
                <IonIcon icon={removeCircle} />
              </IonButton>
            </div>
          </div>
        </div>
      ))}

      <div className="navigation-buttons">
        <IonButton
          className="action-button"
          expand="block"
          onClick={() => onAddResposta(perguntaIndex)}
        >
          <IonIcon slot="start" icon={addCircle} />
          Adicionar Resposta
        </IonButton>
      </div>
    </div>
  );
};

export default QuestionForm;