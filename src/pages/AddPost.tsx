import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
  IonContent,
  IonItem,
  IonLabel,
  IonInput,
  IonTextarea,
  IonButton,
  IonToast,
  IonText,
  IonIcon,
} from "@ionic/react";
import { imageOutline } from "ionicons/icons";
import { createPost } from "../Services/postService";
import { uploadFile } from "../Services/MemoryThemeService";
import "./QuizManagement.css";

const AddPost: React.FC = () => {
  const history = useHistory();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoria, setCategoria] = useState<"Notícia" | "Informativo">("Informativo");
  const [imageLink, setImageLink] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [imageMode, setImageMode] = useState<"upload" | "link">("link");
  const [publishing, setPublishing] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      setFile(f);
      setImagePreview(URL.createObjectURL(f));
    }
  };
  const triggerFileInput = () => fileInputRef.current?.click();

  const handlePublish = async () => {
    if (!title.trim()) {
      setToastMessage("Informe o título do post");
      setShowToast(true);
      return;
    }
    if (!description.trim()) {
      setToastMessage("Informe a descrição do post");
      setShowToast(true);
      return;
    }
    if (imageMode === "link" && !imageLink.trim() && !file) {
      setToastMessage("Informe um link de imagem ou envie um arquivo");
      setShowToast(true);
      return;
    }

    try {
      setPublishing(true);
      let uploadId: number | undefined = undefined;

      if (imageMode === "upload" && file) {
        const uploaded = await uploadFile(file);
        uploadId = uploaded?.id;
      }

      await createPost({
        Title: title,
        Description: description,
        Categoria: categoria,
        Link: imageMode === "link" ? imageLink : undefined,
        Uploadpost: uploadId,
      });

      setToastMessage("Post publicado com sucesso");
      setShowToast(true);
      setTimeout(() => history.push("/tabs/tab1"), 800);
    } catch (err) {
      setToastMessage("Falha ao publicar post");
      setShowToast(true);
    } finally {
      setPublishing(false);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar className="header-gradient">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/tabs/tab1" />
          </IonButtons>
          <IonTitle className="title-centered">Adicionar Post</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <div className="quiz-result-container">
        <IonItem lines="none">
          <IonLabel position="stacked">Título</IonLabel>
          <IonInput className="custom-input" value={title} onIonChange={(e) => setTitle(e.detail.value || "")} />
        </IonItem>
        <IonItem lines="none">
          <IonLabel position="stacked">Descrição</IonLabel>
          <IonTextarea className="custom-input" value={description} onIonChange={(e) => setDescription(e.detail.value || "")} />
        </IonItem>
        <IonItem lines="none">
          <IonLabel position="stacked">Categoria</IonLabel>
          <div className="toggle-container">
            <button
              className={`toggle-button ${categoria === "Informativo" ? "active" : ""}`}
              onClick={() => setCategoria("Informativo")}
            >
              Informativo
            </button>
            <button
              className={`toggle-button ${categoria === "Notícia" ? "active" : ""}`}
              onClick={() => setCategoria("Notícia")}
            >
              Notícia
            </button>
          </div>
        </IonItem>

        <IonItem lines="none">
          <IonLabel position="stacked">Imagem</IonLabel>
          <div className="toggle-container">
            <button
              className={`toggle-button ${imageMode === "link" ? "active" : ""}`}
              onClick={() => setImageMode("link")}
            >
              Link
            </button>
            <button
              className={`toggle-button ${imageMode === "upload" ? "active" : ""}`}
              onClick={() => setImageMode("upload")}
            >
              Upload
            </button>
          </div>
        </IonItem>

        {imageMode === "link" ? (
          <>
            <IonItem lines="none">
              <IonLabel position="stacked">URL da imagem</IonLabel>
              <IonInput className="custom-input" value={imageLink} onIonChange={(e) => setImageLink(e.detail.value || "")} />
            </IonItem>
          </>
        ) : (
          <div style={{ padding: "16px 0", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div 
              style={{ 
                width: '100px', 
                height: '100px', 
                background: '#f5f5f5', 
                borderRadius: '12px', 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                overflow: 'hidden',
                cursor: 'pointer',
                border: '2px dashed #ccc'
              }}
              onClick={triggerFileInput}
            >
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <IonIcon icon={imageOutline} style={{ fontSize: '40px', color: '#999' }} />
              )}
            </div>
            <IonText 
              color="primary" 
              style={{ 
                marginTop: '8px', 
                fontWeight: '600', 
                cursor: 'pointer',
                color: '#dd2273'
              }} 
              onClick={triggerFileInput}
            >
              {imagePreview ? 'Alterar' : 'Escolher'}
            </IonText>
            <input 
              ref={fileInputRef}
              type="file" 
              accept="image/*" 
              style={{ display: 'none' }} 
              onChange={handleFileChange} 
            />
          </div>
        )}

        <IonButton expand="block" className="action-button" onClick={handlePublish} disabled={publishing}>
          Publicar
        </IonButton>
        </div>
        <IonToast
          isOpen={showToast}
          message={toastMessage}
          duration={1500}
          onDidDismiss={() => setShowToast(false)}
        />
      </IonContent>
    </IonPage>
  );
};

export default AddPost;
