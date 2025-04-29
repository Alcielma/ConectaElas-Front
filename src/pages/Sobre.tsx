import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonBackButton,
} from "@ionic/react";
import React from "react";
import "./Sobre.css";

const Sobre: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/tabs/tab1" />
          </IonButtons>
          <IonTitle className="center-title">Sobre o Conecta Elas</IonTitle>
          <IonButtons slot="end">
            <div style={{ width: "44px" }} />{" "}
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="sobre-content">
        <div className="sobre-text-container">
          <h2>Bem-vinda ao Conecta Elas!</h2>
          <p>
            O Conecta Elas é um espaço seguro, desenvolvido para facilitar o
            acesso à informação, apoio e serviços para mulheres.
          </p>
          <p>
            Aqui você encontra conteúdos informativos, pode interagir
            anonimamente e buscar ajuda através de contatos de órgãos
            competentes ou via nosso chat assistente.
          </p>
          <p>
            Nosso compromisso é promover acolhimento, autonomia e fortalecimento
            feminino, com respeito e privacidade.
          </p>
          <p>Seja muito bem-vinda à nossa rede de apoio!</p>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Sobre;
