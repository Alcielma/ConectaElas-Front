import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonAlert,
  IonToast,
  IonModal,
  IonButton,
  IonIcon,
  IonInput,
  IonTextarea,
  IonLabel,
  IonSpinner,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonFooter,
  IonBadge,
  IonNote
} from "@ionic/react";
import { close, add, trash, create, gameController } from "ionicons/icons";
import api from "../Services/api"; 
import "./PalavrasCruzadasManagement.css";

interface PalavrasCruzadasItem {
  id: number;
  documentId?: string;
  Titulo: string;
  titulo?: string;
  palavras: string[];
  dicas: string[];
}

interface NovaCruzada {
  titulo: string;
  itens: NovoItemCruzada[];
}

interface NovoItemCruzada {
  palavra: string;
  dica: string;
}

const PalavrasCruzadasManagement: React.FC = () => {
  const history = useHistory();
  const [listaCruzadas, setListaCruzadas] = useState<PalavrasCruzadasItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState<boolean>(false);
  
  const [showToast, setShowToast] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>("");
  const [toastColor, setToastColor] = useState<"success" | "danger" | "warning">("success");

  const [novaCruzada, setNovaCruzada] = useState<NovaCruzada>({
    titulo: "",
    itens: [{ palavra: "", dica: "" }, { palavra: "", dica: "" }]
  });

  const [cruzadaParaEditar, setCruzadaParaEditar] = useState<NovaCruzada>({
    titulo: "",
    itens: []
  });
  const [cruzadaIdParaEditar, setCruzadaIdParaEditar] = useState<number | null>(null);
  const [cruzadaAtual, setCruzadaAtual] = useState<PalavrasCruzadasItem | null>(null);

  useEffect(() => {
    loadCruzadas();
  }, []);

  const loadCruzadas = async () => {
    try {
      setLoading(true);
      const response = await api.get("/palavras-cruzadas");
      
      let data = [];
      if (response.data && Array.isArray(response.data.data)) {
        data = response.data.data;
      } else if (Array.isArray(response.data)) {
        data = response.data;
      }
      setListaCruzadas(data);
    } catch (error) {
      console.error("Erro ao carregar cruzadinhas:", error);
      showToastMessage("Erro ao carregar lista", "danger");
    } finally {
      setLoading(false);
    }
  };

  const showToastMessage = (message: string, color: "success" | "danger" | "warning") => {
    setToastMessage(message);
    setToastColor(color);
    setShowToast(true);
  };

  const handleCreateCruzada = async () => {
    try {
      if (!novaCruzada.titulo.trim()) {
        showToastMessage("O título é obrigatório", "warning");
        return;
      }

      const itensValidos = novaCruzada.itens.filter(i => i.palavra.trim() && i.dica.trim());
      if (itensValidos.length < 2) {
        showToastMessage("Adicione pelo menos 2 palavras com dicas", "warning");
        return;
      }

      setIsUpdating(true);

      const palavrasArray = itensValidos.map(i => i.palavra.toUpperCase().trim());
      const dicasArray = itensValidos.map(i => i.dica.trim());

      const payload = {
        data: {
          titulo: novaCruzada.titulo, 
          Titulo: novaCruzada.titulo,
          palavras: palavrasArray,
          dicas: dicasArray,
          grade: { grade: [], linhas: 0, colunas: 0 } 
        }
      };

      await api.post("/palavras-cruzadas", payload);
      await loadCruzadas();
      
      setNovaCruzada({
        titulo: "",
        itens: [{ palavra: "", dica: "" }, { palavra: "", dica: "" }]
      });
      setShowCreateModal(false);
      showToastMessage("Cruzadinha criada com sucesso!", "success");

    } catch (error: any) {
      console.error("ERRO COMPLETO:", error);
      if (error.response && error.response.data && error.response.data.error) {
        const strapiError = error.response.data.error;
        alert(`Erro Strapi: ${strapiError.message}`); 
      } else {
        showToastMessage("Erro ao criar. Verifique o console.", "danger");
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const onEditCruzada = async (id: number) => {
    try {
      setLoading(true);
      const response = await api.get(`/palavras-cruzadas?filters[id][$eq]=${id}`);
      
      let data = [];
      if (response.data && Array.isArray(response.data.data)) {
        data = response.data.data;
      } else if (Array.isArray(response.data)) {
        data = response.data;
      }

      if (!data || data.length === 0) throw new Error("Não encontrado");

      const item = data[0];
      
      const itensReconstruidos: NovoItemCruzada[] = [];
      if (item.palavras && item.dicas) {
        item.palavras.forEach((palavra: string, index: number) => {
          itensReconstruidos.push({
            palavra: palavra,
            dica: item.dicas[index] || ""
          });
        });
      }

      if (itensReconstruidos.length === 0) {
        itensReconstruidos.push({ palavra: "", dica: "" });
        itensReconstruidos.push({ palavra: "", dica: "" });
      }

      setCruzadaParaEditar({
        titulo: item.Titulo || item.titulo || "",
        itens: itensReconstruidos
      });
      setCruzadaIdParaEditar(id);
      setShowEditModal(true);

    } catch (error) {
      console.error("Erro ao abrir edição:", error);
      showToastMessage("Erro ao carregar dados", "danger");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCruzada = async () => {
    try {
      if (isUpdating) return;
      setIsUpdating(true);

      if (!cruzadaParaEditar.titulo.trim()) {
        showToastMessage("O título é obrigatório", "warning");
        setIsUpdating(false);
        return;
      }

      const searchRes = await api.get(`/palavras-cruzadas?filters[id][$eq]=${cruzadaIdParaEditar}`);
      const currentData = searchRes.data.data?.[0] || searchRes.data?.[0];
      const docId = currentData.documentId || cruzadaIdParaEditar;

      const itensValidos = cruzadaParaEditar.itens.filter(i => i.palavra.trim() && i.dica.trim());
      const palavrasArray = itensValidos.map(i => i.palavra.toUpperCase().trim());
      const dicasArray = itensValidos.map(i => i.dica.trim());

      await api.put(`/palavras-cruzadas/${docId}`, {
        data: {
          Titulo: cruzadaParaEditar.titulo,
          titulo: cruzadaParaEditar.titulo,
          palavras: palavrasArray,
          dicas: dicasArray,
          grade: { grade: [], linhas: 0, colunas: 0 } 
        }
      });

      await loadCruzadas();
      setShowEditModal(false);
      setCruzadaIdParaEditar(null);
      showToastMessage("Atualizado com sucesso!", "success");

    } catch (error: any) {
      console.error("Erro ao atualizar:", error);
      if (error.response?.data?.error) {
         alert(`Erro: ${error.response.data.error.message}`);
      }
      showToastMessage("Erro ao atualizar", "danger");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteCruzada = async () => {
    try {
      if (!cruzadaAtual) return;
      const id = cruzadaAtual.id;

      const searchRes = await api.get(`/palavras-cruzadas?filters[id][$eq]=${id}`);
      const currentData = searchRes.data.data?.[0] || searchRes.data?.[0];
      
      if (!currentData) throw new Error("Não encontrado");
      
      const docId = currentData.documentId || id;
      
      await api.delete(`/palavras-cruzadas/${docId}`);
      
      setListaCruzadas(prev => prev.filter(c => c.id !== id));
      setCruzadaAtual(null);
      setShowDeleteAlert(false);
      showToastMessage("Excluído com sucesso!", "success");
    } catch (error) {
      console.error("Erro ao excluir:", error);
      showToastMessage("Erro ao excluir", "danger");
    }
  };

  const renderForm = (
    data: NovaCruzada, 
    setData: React.Dispatch<React.SetStateAction<NovaCruzada>>, 
    isEdit: boolean,
    onSave: () => void
  ) => {
    
    const handleItemChange = (index: number, field: 'palavra' | 'dica', value: string) => {
      const novosItens = [...data.itens];
      novosItens[index] = { ...novosItens[index], [field]: value };
      setData({ ...data, itens: novosItens });
    };

    const addItem = () => {
      setData({ ...data, itens: [...data.itens, { palavra: "", dica: "" }] });
    };

    const removeItem = (index: number) => {
      if (data.itens.length <= 1) return;
      const novosItens = [...data.itens];
      novosItens.splice(index, 1);
      setData({ ...data, itens: novosItens });
    };

    return (
      <IonContent className="quiz-form-content">
        <div className="quiz-form-container">
          <div className="pergunta-container">
            <IonLabel position="stacked" className="field-label">Título da Cruzadinha</IonLabel>
            <div className="custom-input">
              <IonInput
                value={data.titulo}
                placeholder="Ex: Animais da Floresta"
                onIonChange={e => setData({ ...data, titulo: e.detail.value! })}
              />
            </div>
          </div>

          <div className="section-title">
            <h3>Palavras e Dicas</h3>
            <IonButton fill="solid" size="small" className="add-button" onClick={addItem}>
              <IonIcon icon={add} slot="start" />
              Adicionar
            </IonButton>
          </div>

          <div className="perguntas-grid-form">
            {data.itens.map((item, index) => (
              <div key={index} className="pergunta-container form-card-pink">
                <div className="question-header">
                  <span className="question-number">Palavra #{index + 1}</span>
                  {data.itens.length > 1 && (
                    <IonButton 
                      fill="clear" 
                      color="danger"
                      onClick={() => removeItem(index)}
                    >
                      <IonIcon icon={trash} slot="icon-only"/>
                    </IonButton>
                  )}
                </div>

                <IonLabel className="field-label">Palavra (Resposta)</IonLabel>
                <div className="custom-input">
                  <IonInput
                    value={item.palavra}
                    placeholder="Ex: LEAO"
                    onIonChange={e => handleItemChange(index, 'palavra', e.detail.value!)}
                    className="uppercase-input"
                  />
                </div>

                <IonLabel className="field-label" style={{ marginTop: '10px' }}>Dica</IonLabel>
                <div className="custom-input">
                  <IonTextarea
                    value={item.dica}
                    placeholder="Ex: Rei da selva"
                    rows={2}
                    onIonChange={e => handleItemChange(index, 'dica', e.detail.value!)}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="navigation-buttons">
            <IonButton expand="block" className="quiz-save-button" onClick={onSave} disabled={isUpdating}>
              {isUpdating ? <IonSpinner name="crescent" /> : (isEdit ? "Salvar Alterações" : "Criar Cruzadinha")}
            </IonButton>
          </div>
        </div>
      </IonContent>
    );
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar className="header-gradient">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/tabs/management" />
          </IonButtons>
          <IonTitle className="title-centered">Gerenciar Cruzadinhas</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="palavras-cruzadas-content">
        <div className="main-wrapper">
          <div className="quiz-header">
            <h2 className="quiz-list-title">Temas Disponíveis</h2>
            <IonButton 
              className="add-button" 
              onClick={() => {
                setNovaCruzada({ titulo: "", itens: [{ palavra: "", dica: "" }, { palavra: "", dica: "" }] });
                setShowCreateModal(true);
              }}
            >
              <IonIcon icon={add} slot="start" />
              Nova Cruzada
            </IonButton>
          </div>

          {loading ? (
            <div className="spinner-container">
              <IonSpinner name="crescent" color="primary" />
            </div>
          ) : (
            <div className="perguntas-grid-list">
              {listaCruzadas.length === 0 ? (
                <div className="no-quizzes">
                  Nenhuma cruzadinha encontrada.
                </div>
              ) : (
                listaCruzadas.map((cw) => (
                  <div key={cw.id} className="management-card">
                    <div className="card-body">
                      <div className="card-header-row">
                        <h3 className="card-title">{cw.titulo || cw.Titulo}</h3>
                        <span className="card-badge">{cw.palavras?.length || 0} palavras</span>
                      </div>
                      <div className="card-info">ID: {cw.id}</div>
                    </div>

                    <div className="card-footer">
                      <button 
                        className="play-btn"
                        onClick={() => history.push(`/tabs/games/palavras-cruzadas/${cw.id}`)}
                      >
                        <IonIcon icon={gameController} /> JOGAR / VISUALIZAR
                      </button>

                      <div className="action-row">
                        <button className="edit-btn" onClick={() => onEditCruzada(cw.id)}>
                          <IonIcon icon={create} /> EDITAR
                        </button>
                        <button className="delete-btn" onClick={() => {
                          setCruzadaAtual(cw);
                          setShowDeleteAlert(true);
                        }}>
                          <IonIcon icon={trash} /> EXCLUIR
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <IonModal isOpen={showCreateModal} onDidDismiss={() => setShowCreateModal(false)}>
          <IonHeader>
            <IonToolbar className="header-gradient">
              <IonTitle className="title-centered">Nova Cruzadinha</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setShowCreateModal(false)} fill="clear" style={{color: 'white'}}>
                  <IonIcon icon={close} />
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          {renderForm(novaCruzada, setNovaCruzada, false, handleCreateCruzada)}
        </IonModal>

        <IonModal isOpen={showEditModal} onDidDismiss={() => setShowEditModal(false)}>
          <IonHeader>
            <IonToolbar className="header-gradient">
              <IonTitle className="title-centered">Editar Cruzadinha</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setShowEditModal(false)} fill="clear" style={{color: 'white'}}>
                  <IonIcon icon={close} />
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          {renderForm(cruzadaParaEditar, setCruzadaParaEditar, true, handleUpdateCruzada)}
        </IonModal>

        <IonAlert
          isOpen={showDeleteAlert}
          onDidDismiss={() => setShowDeleteAlert(false)}
          header={"Confirmar Exclusão"}
          message={`Tem certeza que deseja excluir "${cruzadaAtual?.Titulo || cruzadaAtual?.titulo}"?`}
          buttons={[
            { text: "Cancelar", role: "cancel", handler: () => setCruzadaAtual(null) },
            { 
              text: "Excluir", 
              cssClass: 'ion-color-danger',
              handler: handleDeleteCruzada
            }
          ]}
        />

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={2000}
          color={toastColor}
        />
      </IonContent>
    </IonPage>
  );
};

export default PalavrasCruzadasManagement;