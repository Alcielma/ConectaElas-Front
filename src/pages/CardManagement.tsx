import React, { useState, useEffect, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import { 
  IonPage, 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent, 
  IonButtons, 
  IonBackButton,
  IonList,
  IonItem,
  IonLabel,
  IonButton,
  IonIcon,
  IonModal,
  IonInput,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonText,
  IonToast,
  IonAlert,
  IonSpinner
} from '@ionic/react';
import { 
  add, 
  trash,
  create, 
  imageOutline, 
  closeOutline,
  saveOutline,
  cloudUploadOutline,
  checkmark,
  addCircle,
  play
} from 'ionicons/icons';
import { 
  getAllMemoryThemes, 
  createMemoryTheme, 
  createCard, 
  uploadFile, 
  deleteMemoryTheme,
  updateMemoryTheme,
  deleteCard,
  TemaMemoria 
} from '../Services/MemoryThemeService';
import './CardManagement.css'; // Updated CSS

interface NewCard {
  id?: string; // temporary id for UI
  file: File | null;
  preview: string;
  frase: string;
  identificacao: string; // New field
  imageId?: number; // Store existing image ID
  existingImageUrl?: string; // Store existing image URL for display
}

const CardManagement: React.FC = () => {
  const history = useHistory();
  const [themes, setThemes] = useState<TemaMemoria[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [themeIdToEdit, setThemeIdToEdit] = useState<number | null>(null);
  
  // Form State
  const [themeName, setThemeName] = useState<string>('');
  const [cards, setCards] = useState<NewCard[]>([]);
  
  // Toast & Alert
  const [toast, setToast] = useState<{show: boolean, msg: string, color: string}>({show: false, msg: '', color: 'success'});
  const [deleteAlert, setDeleteAlert] = useState<{show: boolean, id: number | null}>({show: false, id: null});

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeCardIndex, setActiveCardIndex] = useState<number | null>(null);

  useEffect(() => {
    loadThemes();
  }, []);

  useEffect(() => {
    const handler = (ev: any) => {
      ev.detail.register(10, () => {
        history.replace("/tabs/games");
      });
    };
    document.addEventListener("ionBackButton", handler as any);
    return () => document.removeEventListener("ionBackButton", handler as any);
  }, [history]);

  const loadThemes = async () => {
    setLoading(true);
    try {
      const data = await getAllMemoryThemes();
      if (Array.isArray(data)) {
        setThemes(data);
      } else if (data && data.data) {
        setThemes(data.data);
      } else {
        setThemes([]);
      }
    } catch (error) {
      console.error(error);
      setToast({show: true, msg: 'Erro ao carregar temas.', color: 'danger'});
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setThemeName('');
    setCards([]);
    setIsUpdating(false);
    setThemeIdToEdit(null);
    setShowModal(true);
  };

  const handleOpenEditModal = (theme: TemaMemoria) => {
    setThemeName(theme.Nome_tema);
    setThemeIdToEdit(theme.id);
    setIsUpdating(true);
    
    // Populate cards
    const existingCards: NewCard[] = (theme.cartas || []).map(c => ({
      id: c.id.toString(), // use actual ID for key
      file: null,
      preview: c.Imagem?.url ? `${import.meta.env.VITE_API_URL}${c.Imagem.url}` : (c.Link_imagem || ''),
      frase: c.Frase || '',
      identificacao: c.identificacao || '', // Load existing identification
      imageId: c.Imagem?.id,
      existingImageUrl: c.Imagem?.url ? `${import.meta.env.VITE_API_URL}${c.Imagem.url}` : (c.Link_imagem || '')
    }));
    
    setCards(existingCards);
    setShowModal(true);
  };

  const handleAddCard = () => {
    setCards([...cards, { id: Date.now().toString(), file: null, preview: '', frase: '', identificacao: '' }]);
  };

  const handleRemoveCard = (index: number) => {
    const newCards = [...cards];
    newCards.splice(index, 1);
    setCards(newCards);
  };

  const handleCardPhraseChange = (index: number, val: string) => {
    const newCards = [...cards];
    newCards[index].frase = val;
    setCards(newCards);
  };

  const handleCardIdentificacaoChange = (index: number, val: string) => {
    const newCards = [...cards];
    newCards[index].identificacao = val;
    setCards(newCards);
  };

  const triggerFileInput = (index: number) => {
    setActiveCardIndex(index);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0] && activeCardIndex !== null) {
      const file = event.target.files[0];
      const preview = URL.createObjectURL(file);
      
      const newCards = [...cards];
      newCards[activeCardIndex].file = file;
      newCards[activeCardIndex].preview = preview;
      setCards(newCards);
      
      // Reset input
      event.target.value = '';
    }
  };

  const handleSaveTheme = async () => {
    if (!themeName.trim()) {
      setToast({show: true, msg: 'O nome do tema é obrigatório.', color: 'warning'});
      return;
    }

    if (cards.length === 0) {
      setToast({show: true, msg: 'Adicione pelo menos uma carta.', color: 'warning'});
      return;
    }

    // Validate cards
    for (const card of cards) {
      if (!card.frase.trim()) {
        setToast({show: true, msg: 'Todas as cartas devem ter uma frase.', color: 'warning'});
        return;
      }
      if (!card.file && !card.existingImageUrl) {
         setToast({show: true, msg: 'Todas as cartas devem ter uma imagem.', color: 'warning'});
         return;
      }
    }

    setIsSubmitting(true);
    try {
      let themeIdForCards: number | string | undefined;

      if (isUpdating && themeIdToEdit) {
         // Strategy: Delete the old theme and create a new one
         await deleteMemoryTheme(themeIdToEdit);
      }

      // Create Theme (Always new)
      const newTheme = await createMemoryTheme(themeName);
      themeIdForCards = newTheme.documentId || newTheme.id;

      if (!themeIdForCards) throw new Error("Theme ID not found");

      // Create Cards
      for (let i = 0; i < cards.length; i++) {
        const card = cards[i];
        let imageId: number | undefined = card.imageId;
        
        if (card.file) {
          const uploadedFile = await uploadFile(card.file);
          imageId = uploadedFile.id;
        }

        // Passando index + 1 como identificacao
        // await createCard(themeIdForCards, card.frase, (i + 1).toString(), imageId);
        // Agora passando a identificação do usuário
        await createCard(themeIdForCards, card.frase, card.identificacao || (i + 1).toString(), imageId);
      }

      setToast({show: true, msg: isUpdating ? 'Tema atualizado com sucesso!' : 'Tema criado com sucesso!', color: 'success'});
      setShowModal(false);
      loadThemes();
    } catch (error: any) {
      console.error(error);
      const isForbidden = error.response?.status === 403;
      const msg = isForbidden 
        ? 'Permissão negada. Verifique as permissões de "create" para Tema-jogo-memoria no Strapi.'
        : (isUpdating ? 'Erro ao atualizar tema.' : 'Erro ao criar tema.');
      
      setToast({show: true, msg: msg, color: 'danger'});
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTheme = async () => {
    if (deleteAlert.id) {
      try {
        await deleteMemoryTheme(deleteAlert.id);
        setToast({show: true, msg: 'Tema excluído com sucesso.', color: 'success'});
        loadThemes();
      } catch (error) {
        console.error(error);
        setToast({show: true, msg: 'Erro ao excluir tema.', color: 'danger'});
      } finally {
        setDeleteAlert({show: false, id: null});
      }
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar className="header-gradient">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/tabs/games" />
          </IonButtons>
          <IonTitle className="title-centered">Gerenciamento de Cartas</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="management-content">
        <div className="management-container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
             {/* Use same styling as QuizList if possible, or just a button */}
          </div>

          <IonButton expand="block" onClick={handleOpenCreateModal} className="ion-margin-bottom">
            <IonIcon slot="start" icon={add} />
            Criar Novo Tema
          </IonButton>

          {loading ? (
             <div style={{ textAlign: 'center', padding: '20px' }}>
               <IonSpinner name="crescent" />
             </div>
          ) : themes.length === 0 ? (
             <div className="no-quizzes">
               <p>Nenhum tema encontrado.</p>
             </div>
          ) : (
            <IonList style={{ background: 'transparent', padding: 0 }}>
              {themes.map(theme => (
                <IonCard key={theme.id} className="management-card">
                  <IonCardHeader>
                    <IonCardTitle>{theme.Nome_tema}</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <p className="management-info">{theme.cartas?.length || 0} cartas</p>
                    <div className="card-management-buttons">
                      <IonButton 
                        fill="solid" 
                        color="success" 
                        onClick={(e) => {
                          e.stopPropagation();
                          history.push(`/tabs/games/memory/${theme.id}?from=management`);
                        }}
                      >
                        <IonIcon slot="start" icon={play} />
                        Jogar
                      </IonButton>
                      <IonButton 
                        fill="solid" 
                        color="primary" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEditModal(theme);
                        }}
                      >
                        <IonIcon slot="start" icon={create} />
                        Editar
                      </IonButton>
                      <IonButton 
                        fill="solid" 
                        color="danger" 
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteAlert({show: true, id: theme.id});
                        }}
                      >
                        <IonIcon slot="start" icon={trash} />
                        Excluir
                      </IonButton>
                    </div>
                  </IonCardContent>
                </IonCard>
              ))}
            </IonList>
          )}
        </div>

        {/* Create/Edit Modal */}
        <IonModal isOpen={showModal} onDidDismiss={() => !isSubmitting && setShowModal(false)}>
          <IonHeader>
            <IonToolbar className="header-gradient">
              <IonTitle className="title-centered">{isUpdating ? 'Editar Tema' : 'Novo Tema'}</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setShowModal(false)} disabled={isSubmitting}>
                  <IonIcon icon={closeOutline} />
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
             <div className="quiz-result-container">
               <IonItem className="ion-margin-bottom">
                 <IonLabel position="stacked">Nome do Tema</IonLabel>
                 <IonInput 
                   value={themeName} 
                   onIonChange={e => setThemeName(e.detail.value!)} 
                   placeholder="Ex: Animais, Cores..."
                   className="custom-input"
                   disabled={isSubmitting}
                 />
               </IonItem>

              {/* <div className="section-title">
                 <h3>Cartas</h3>
               </div>*/}

               <IonGrid>
                 {cards.map((card, index) => (
                   <IonRow key={card.id || index} className="card-row">
                     <IonCol size="4" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <div 
                          style={{ 
                            width: '80px', 
                            height: '80px', 
                            background: '#f0f0f0', 
                            borderRadius: '8px', 
                            display: 'flex', 
                            justifyContent: 'center', 
                            alignItems: 'center',
                            overflow: 'hidden',
                            cursor: 'pointer',
                            border: '2px dashed #ccc'
                          }}
                          onClick={() => !isSubmitting && triggerFileInput(index)}
                        >
                          {card.preview ? (
                            <img src={card.preview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <IonIcon icon={imageOutline} style={{ fontSize: '32px', color: '#999' }} />
                          )}
                        </div>
                        <IonText color="primary" className="image-upload-text" onClick={() => !isSubmitting && triggerFileInput(index)}>
                          {card.preview ? 'Alterar' : 'Escolher'}
                        </IonText>
                     </IonCol>
                     <IonCol size="8">
                       <IonItem lines="none">
                       <IonLabel position="stacked">Frase</IonLabel>
                       <IonInput 
                         value={card.frase} 
                         onIonChange={e => handleCardPhraseChange(index, e.detail.value!)}
                         placeholder="Frase da carta"
                         className="custom-input"
                         disabled={isSubmitting}
                       />
                     </IonItem>
                     <IonItem lines="none">
                       <IonLabel position="stacked">Identificação</IonLabel>
                       <IonInput 
                         value={card.identificacao} 
                         onIonChange={e => handleCardIdentificacaoChange(index, e.detail.value!)}
                         placeholder="Ex: maria é uma menina linda"
                         className="custom-input"
                         disabled={isSubmitting}
                       />
                     </IonItem>
                       <div style={{ textAlign: 'right', marginTop: '4px' }}>
                         <IonButton 
                           color="danger" 
                           fill="clear" 
                           size="small" 
                           onClick={() => handleRemoveCard(index)}
                           disabled={isSubmitting}
                        >
                          <IonIcon icon={trash} slot="start" />
                          Remover
                        </IonButton>
                       </div>
                     </IonCol>
                   </IonRow>
                 ))}
               </IonGrid>
               
               <div className="navigation-buttons">
                 <IonButton 
                   className="action-button" 
                   expand="block" 
                   onClick={handleAddCard} 
                   disabled={isSubmitting}
                 >
                   <IonIcon icon={addCircle} slot="start" />
                   Adicionar Carta
                 </IonButton>

                 {cards.length === 0 && (
                   <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                     <p>Adicione cartas para compor o tema.</p>
                   </div>
                 )}

                 <IonButton 
                   className="action-button"
                   expand="block" 
                   onClick={handleSaveTheme} 
                   disabled={isSubmitting}
                 >
                   {isSubmitting ? <IonSpinner name="crescent" /> : (
                     <>
                       <IonIcon icon={checkmark} slot="start" />
                       {isUpdating ? 'Atualizar Tema' : 'Salvar Tema'}
                     </>
                   )}
                 </IonButton>
               </div>
             </div>
          </IonContent>
        </IonModal>

        {/* Hidden File Input */}
        <input 
          type="file" 
          accept="image/*" 
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          onChange={handleFileChange}
        />

        <IonToast 
          isOpen={toast.show} 
          message={toast.msg} 
          color={toast.color} 
          duration={2000} 
          onDidDismiss={() => setToast({...toast, show: false})}
        />

        <IonAlert
          isOpen={deleteAlert.show}
          header="Confirmar Exclusão"
          message="Tem certeza que deseja excluir este tema? Todas as cartas serão perdidas."
          buttons={[
            { text: 'Cancelar', role: 'cancel', handler: () => setDeleteAlert({show: false, id: null}) },
            { text: 'Excluir', handler: handleDeleteTheme }
          ]}
        />

      </IonContent>
    </IonPage>
  );
};

export default CardManagement;
