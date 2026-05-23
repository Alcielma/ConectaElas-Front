import React, { useState, useEffect, useRef } from "react";
import { useHistory } from "react-router-dom";
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonRefresher,
  IonRefresherContent,
  useIonViewDidEnter,
  IonButtons,
  IonButton,
  IonIcon,
  IonPopover,
  IonList,
  IonItem,
  IonLabel,
  IonModal,
  IonAlert,
} from "@ionic/react";
import { ellipsisVertical, trashOutline, arrowBack } from "ionicons/icons";
import BannerService, { Banner } from "../Services/BannerService";
import Toast from "../components/Toast";
import "./Tab1.css";
import Carrossel from "../components/Carrossel/Carrossel";
import Feed from "../components/Feed";
import { useAuth } from "../Contexts/AuthContext";
import { setBannerModalOpen } from "../App";

const categorias = ["Notícia", "Informativo", "Favoritos"];

const Tab1: React.FC = () => {
  const history = useHistory();
  const pageRef = useRef<HTMLElement>(null);
  const [presentingElement, setPresentingElement] = useState<HTMLElement | undefined>(undefined);
  const [favoritesVersion, setFavoritesVersion] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const { isAssistant } = useAuth();
  
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [popoverEvent, setPopoverEvent] = useState<Event | undefined>(undefined);
  const [modalBannersOpen, setModalBannersOpen] = useState(false);
  
  const handleSetModalBannersOpen = (open: boolean) => {
    setModalBannersOpen(open);
    setBannerModalOpen(open, () => handleSetModalBannersOpen(false));
  };
  
  const [banners, setBanners] = useState<Banner[]>([]);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [bannerToDelete, setBannerToDelete] = useState<Banner | null>(null);
  const [toast, setToast] = useState({
    isOpen: false,
    message: "",
    type: "success" as "success" | "error" | "info"
  });


  const bumpFavoritesVersion = () => setFavoritesVersion((v) => v + 1);
  const bumpRefreshKey = () => setRefreshKey((k) => k + 1);

  const handleDeletePost = (postId: number) => {
    bumpRefreshKey(); // Atualiza a lista do feed
  };

  const handleAddPost = (categoria: string) => {
    history.push("/tabs/add-post", { categoriaPreSelecionada: categoria });
  };

  const handleAddBanner = () => {
    history.push("/tabs/add-banner");
  };

  const openPopover = (e: React.MouseEvent<HTMLIonButtonElement>) => {
    e.persist();
    setPopoverEvent(e.nativeEvent);
    setPopoverOpen(true);
  };

  const closePopover = () => {
    setPopoverOpen(false);
    setPopoverEvent(undefined);
  };

  const openDeleteBannersModal = async () => {
    closePopover();
    try {
      const bannersData = await BannerService.fetchBanners();
      setBanners(bannersData);
      handleSetModalBannersOpen(true);
    } catch (error) {
      console.error("Erro ao buscar banners:", error);
    }
  };

  const handleDeleteBanner = (banner: Banner) => {
    setBannerToDelete(banner);
    setShowDeleteAlert(true);
  };

  const confirmDeleteBanner = async () => {
    if (!bannerToDelete) return;
    try {
      await BannerService.deleteBanner(bannerToDelete.id, bannerToDelete.documentId);
      setBanners(banners.filter(b => b.id !== bannerToDelete.id));
      bumpRefreshKey();
      setToast({
        isOpen: true,
        message: "Banner apagado com sucesso!",
        type: "success"
      });
    } catch (error) {
      console.error("Erro ao deletar banner:", error);
      setToast({
        isOpen: true,
        message: "Erro ao apagar banner",
        type: "error"
      });
    } finally {
      setShowDeleteAlert(false);
      setBannerToDelete(null);
    }
  };



  useIonViewDidEnter(() => {
    // Recarrega quando a aba Home é re-entrata
    bumpRefreshKey();
  });

  useEffect(() => {
    if (pageRef.current) {
      setPresentingElement(pageRef.current);
    }
  }, []);

  const handleRefresh = async (event: CustomEvent) => {
    // Puxa para atualizar
    bumpRefreshKey();
    // Pequeno delay para UX e garantir render
    setTimeout(() => event.detail.complete(), 300);
  };



  return (
    <IonPage ref={pageRef}>
      <IonHeader>
        <IonToolbar className="header-gradient">
          {isAssistant && (
            <IonButtons slot="start">
              <IonButton onClick={openPopover} fill="clear">
                <IonIcon icon={ellipsisVertical} style={{ color: 'white', fontSize: '24px' }} />
              </IonButton>
              <IonPopover
                isOpen={popoverOpen}
                event={popoverEvent}
                onDidDismiss={closePopover}
                className="feed-popover"
              >
                <IonList className="feed-popover-list">
                  <IonItem button onClick={openDeleteBannersModal} className="feed-popover-item" lines="none">
                    <IonLabel className="feed-popover-label">Apagar banner</IonLabel>
                  </IonItem>
                </IonList>
              </IonPopover>
            </IonButtons>
          )}
          <IonTitle className="title-centered">Conecta Elas</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="custom-background">
        {/* Pull-to-refresh */}
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent pullingIcon="arrowDownCircle" refreshingSpinner="circles" />
        </IonRefresher>

        <div className="body-feed">
          {/* Carrossel */}
          <div className="carrossel-wrapper">
            <Carrossel refreshKey={refreshKey} onAddBanner={handleAddBanner} />
          </div>

          {/* Seções por categoria */}
          {categorias.map((categoria) => (
            <div key={categoria} className="categoria-section">
              <div className="categoria-header">
                <h3 className="categoria-title">{categoria}</h3>
                <span
                  className="ver-todos"
                  onClick={() => history.push(`/categoria/${categoria}`)}
                >
                  Ver todos
                </span>
              </div>

              <div className="categoria-cards">
                <Feed 
                  selectedCategory={categoria} 
                  horizontalLimit={5} 
                  favoritesVersion={favoritesVersion}
                  onAnyFavoriteChange={bumpFavoritesVersion}
                  refreshKey={refreshKey}
                  onDelete={handleDeletePost}
                  onAddPost={handleAddPost}
                />
              </div>
            </div>
          ))}
        </div>
      </IonContent>

      <IonModal 
        isOpen={modalBannersOpen} 
        onDidDismiss={() => handleSetModalBannersOpen(false)}
        canDismiss={true}
        backdropDismiss={true}
        presentingElement={presentingElement}
      >
        <IonHeader>
          <IonToolbar className="header-gradient">
            <IonButtons slot="start">
              <IonButton onClick={() => handleSetModalBannersOpen(false)} fill="clear">
                <IonIcon icon={arrowBack} style={{ color: 'white' }} />
              </IonButton>
            </IonButtons>
            <IonTitle style={{ color: 'white' }}>Gerenciar Banners</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          {banners.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#720079', marginTop: '24px' }}>
              Nenhum banner encontrado.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {banners.map((banner) => (
                <div 
                  key={banner.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    background: '#fff',
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}
                >
                  <img 
                    src={banner.imageUrl} 
                    alt={banner.Titulo}
                    style={{
                      width: '80px',
                      height: '60px',
                      objectFit: 'cover',
                      borderRadius: '4px'
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: 0, color: '#720079', fontSize: '14px' }}>
                      {banner.Titulo}
                    </h4>
                  </div>
                  <IonIcon
                    icon={trashOutline}
                    style={{
                      fontSize: '24px',
                      color: '#dc3545',
                      cursor: 'pointer',
                      padding: '4px'
                    }}
                    onClick={() => handleDeleteBanner(banner)}
                  />
                </div>
              ))}
            </div>
          )}
        </IonContent>
      </IonModal>

      <IonAlert
        isOpen={showDeleteAlert}
        onDidDismiss={() => setShowDeleteAlert(false)}
        header="Confirmar exclusão"
        message="Tem certeza que deseja apagar este banner? Esta ação não pode ser desfeita."
        buttons={[
          { text: "Cancelar", role: "cancel" },
          { 
            text: "Apagar", 
            handler: async () => {
              await confirmDeleteBanner();
            } 
          },
        ]}
      />

      <Toast
        isOpen={toast.isOpen}
        message={toast.message}
        type={toast.type}
        onDidDismiss={() => setToast({ ...toast, isOpen: false })}
      />
    </IonPage>
  );
};

export default Tab1;
