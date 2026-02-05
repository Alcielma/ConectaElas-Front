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
  IonButton,
  IonToast,
  IonSelect,
  IonSelectOption,
  IonText,
  IonIcon,
} from "@ionic/react";
import { imageOutline } from "ionicons/icons";
import BannerService from "../Services/BannerService";
import { uploadFile } from "../Services/MemoryThemeService";
import "./QuizManagement.css";

const AddBanner: React.FC = () => {
  const history = useHistory();
  const [titulo, setTitulo] = useState("");
  const [link, setLink] = useState("");
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
    if (!titulo.trim()) {
      setToastMessage("Informe o título do banner");
      setShowToast(true);
      return;
    }
    if (!link.trim()) {
      setToastMessage("Informe o link de destino do banner");
      setShowToast(true);
      return;
    }
    if (imageMode === "link" && !imageLink.trim()) {
      setToastMessage("Informe o link da imagem");
      setShowToast(true);
      return;
    }
    if (imageMode === "upload" && !file) {
      setToastMessage("Selecione um arquivo de imagem para upload");
      setShowToast(true);
      return;
    }

    try {
      setPublishing(true);
      let uploadId: number | undefined = undefined;
      let linkImagem: string | undefined = undefined;

      if (imageMode === "upload" && file) {
        const uploaded = await uploadFile(file);
        uploadId = uploaded?.id;
      } else {
        linkImagem = imageLink;
      }

      await BannerService.createBanner({
        Link: link,
        Titulo: titulo,
        Link_imagem: linkImagem,
        Upload: uploadId,
      });

      setToastMessage("Banner publicado com sucesso");
      setShowToast(true);
      setTimeout(() => history.push("/tabs/tab1"), 800);
    } catch (err) {
      setToastMessage("Falha ao publicar banner");
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
          <IonTitle className="title-centered">Adicionar Banner</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <div className="quiz-result-container">
        <IonItem lines="none">
          <IonLabel position="stacked">Título</IonLabel>
          <IonInput className="custom-input" value={titulo} onIonChange={(e) => setTitulo(e.detail.value || "")} />
        </IonItem>
        <IonItem lines="none">
          <IonLabel position="stacked">Link de destino</IonLabel>
          <IonInput className="custom-input" value={link} onIonChange={(e) => setLink(e.detail.value || "")} />
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
          <IonItem lines="none">
            <IonLabel position="stacked">URL da imagem</IonLabel>
            <IonInput className="custom-input" value={imageLink} onIonChange={(e) => setImageLink(e.detail.value || "")} />
          </IonItem>
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

export default AddBanner;
