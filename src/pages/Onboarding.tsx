import { IonPage, IonButton, IonIcon } from "@ionic/react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import { chevronBack, chevronForward } from "ionicons/icons";
import "swiper/css";
import "swiper/css/pagination";
import "./Onboarding.css";
import React, { useState, useRef } from "react";
import imagem1 from "../Assets/slides/imagem1.svg";
import imagem2 from "../Assets/slides/imagem2.svg";
import imagem3 from "../Assets/slides/imagem3.svg";
import LogoConectaRedondo from "../Assets/slides/Logo-conectaelas-redondo.png";
import { EffectFade } from "swiper/modules";
import "swiper/css/effect-fade";

const slides = [
  {
    title: "Bem-vinda ao Conecta Elas!",
    text: "Um espaço seguro para você se informar, se conectar e receber apoio de quem entende você.",
    image: imagem1,
  },
  {
    title: "Informação é poder!",
    text: "Tenha acesso rápido a conteúdos e orientações importantes sobre seus direitos — de forma clara e segura.",
    image: imagem2,
  },
  {
    title: "Você nunca está sozinha.",
    text: "Converse de forma anônima com nosso assistente e encontre ajuda dos órgãos competentes sempre que precisar.",
    image: imagem3,
  },
  {
    title: "Pronta para começar?",
    text: "Descubra tudo que o Conecta Elas pode fazer por você. Vamos juntas!",
    image: LogoConectaRedondo,
    isLast: true,
  },
];

const Onboarding: React.FC = () => {
  const swiperRef = useRef<any>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    if (swiperRef.current) {
      swiperRef.current.slideNext();
    }
  };

  const prevSlide = () => {
    if (swiperRef.current) {
      swiperRef.current.slidePrev();
    }
  };

  const finishOnboarding = () => {
    localStorage.setItem("onboardingComplete", "true");
    window.location.href = "/tabs/tab1";
  };

  return (
    <IonPage className="onboarding-page">
      <div className="onboarding-container">
        <Swiper
          modules={[Pagination, EffectFade]}
          effect="fade"
          fadeEffect={{ crossFade: true }}
          //   pagination={{ clickable: true }}
          onSlideChange={(swiper) => setCurrentSlide(swiper.activeIndex)}
          onSwiper={(swiper) => (swiperRef.current = swiper)}
        >
          {slides.map((slide, index) => (
            <SwiperSlide key={index}>
              <div className="slide-image-container">
                <img src={slide.image} className="slide-image" />
              </div>
              <h2>{slide.title}</h2>
              <p>{slide.text}</p>

              {slide.isLast && (
                <button className="start-button" onClick={finishOnboarding}>
                  Começar agora
                </button>
              )}
            </SwiperSlide>
          ))}
        </Swiper>

        <div className="navigation">
          <IonButton
            fill="clear"
            onClick={prevSlide}
            disabled={currentSlide === 0}
          >
            <IonIcon icon={chevronBack} className="nav-button" />
          </IonButton>

          <div className="dots">
            {slides.map((_, index) => (
              <span
                key={index}
                className={`dot ${index === currentSlide ? "active" : ""}`}
              ></span>
            ))}
          </div>

          {currentSlide !== slides.length - 1 ? (
            <IonButton fill="clear" onClick={nextSlide}>
              <IonIcon icon={chevronForward} className="nav-button" />
            </IonButton>
          ) : (
            <div className="placeholder-button" />
          )}
        </div>
      </div>
    </IonPage>
  );
};

export default Onboarding;
