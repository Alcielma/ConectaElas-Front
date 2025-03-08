import React from "react";
import { IonContent, IonPage, IonImg } from "@ionic/react";
import "./Carrossel.css";

const Carrossel: React.FC = () => {
  const imagens = [
    {
      url: "https://unale.org.br/dia-nacional-de-luta-contra-a-violencia-a-mulher/",
      src: "https://unale.org.br/wp-content/uploads/2023/10/Banner.jpg",
    },
    {
      url: "https://unale.org.br/dia-nacional-de-luta-contra-a-violencia-a-mulher/",
      src: "https://unale.org.br/wp-content/uploads/2023/10/Banner.jpg",
    },
    {
      url: "https://unale.org.br/dia-nacional-de-luta-contra-a-violencia-a-mulher/",
      src: "https://unale.org.br/wp-content/uploads/2023/10/Banner.jpg",
    },
  ];

  return (
    <IonPage>
      <IonContent>
        <div className="carrossel">
          {imagens.map((imagem, index) => (
            <a
              href={imagem.url}
              target="_blank"
              rel="noopener noreferrer"
              key={index}
            >
              <IonImg className="imagem-arredondada" src={imagem.src} />
            </a>
          ))}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Carrossel;
