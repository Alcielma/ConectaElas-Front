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
            O <strong>Conecta Elas</strong> é um aplicativo criado para
            fortalecer os direitos das mulheres e combater a violência doméstica
            e familiar na cidade de <strong>Lagoa de Itaenga (PE)</strong>.
          </p>
          <p>
            Desenvolvido em parceria com o{" "}
            <strong>
              Laboratório Multidisciplinar de Tecnologias Sociais (LMTS)
            </strong>{" "}
            da{" "}
            <strong>
              Universidade Federal do Agreste de Pernambuco (UFAPE)
            </strong>
            , o Conecta Elas nasce como uma ferramenta de apoio, acolhimento e
            empoderamento feminino.
          </p>
          <p>
            Aqui, você encontra conteúdos informativos sobre seus direitos, pode
            interagir anonimamente em publicações, receber orientações e, quando
            necessário, buscar ajuda através de contatos diretos com órgãos
            competentes ou via nosso{" "}
            <strong>chat com assistente anônima</strong>.
          </p>
          <p>
            Nosso compromisso é promover o acesso à informação, o fortalecimento
            da autonomia das mulheres e a construção de um espaço seguro e de
            confiança.
          </p>
          <p>
            Seja muito bem-vinda à nossa rede de apoio. Você não está sozinha.
            💜
          </p>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Sobre;
