import { IonPage, IonButton, IonIcon, IonSpinner } from "@ionic/react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, EffectFade } from "swiper/modules";
import { chevronBack, chevronForward } from "ionicons/icons";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";
import "./Onboarding.css";
import React, { useState, useRef } from "react";
import { arrowForward } from "ionicons/icons";
import imagem1 from "../Assets/slides/imagem1.svg";
import imagem2 from "../Assets/slides/imagem2.svg";
import imagem3 from "../Assets/slides/imagem3.svg";
import LogoConectaRedondo from "../Assets/slides/Logo-conectaelas-redondo.png";
import { FieldValues, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import AuthService from "../Services/AuthService";
import { useAuth } from "../Contexts/AuthContext";
import InputErrorMessage from "../components/inputErrorMessage";

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
    title: "Este é seu espaço seguro.",
    text: "Nos diga como prefere ser chamada e vamos juntas nessa!",
    image: LogoConectaRedondo,
    isLast: true,
  },
];

const schema = z.object({
  nome: z
    .string()
    .min(3, "O nome é muito pequeno.")
    .max(58, "O nome é muito grande."),
});

type FormData = z.infer<typeof schema>;

const Onboarding: React.FC = () => {
  const { user, updateUser } = useAuth();
  const swiperRef = useRef<any>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const [prevSlideIndex, setPrevSlideIndex] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      nome: "",
    },
  });

  const nextSlide = () => {
    if (swiperRef.current && !transitioning) {
      swiperRef.current.slideNext();
    }
  };

  const prevSlide = () => {
    if (swiperRef.current && !transitioning) {
      swiperRef.current.slidePrev();
    }
  };

  const handleSlideChange = (swiper: any) => {
    setTransitioning(true);
    setPrevSlideIndex(currentSlide);
    setCurrentSlide(swiper.activeIndex);

    // Tempo deve coincidir com a duração da animação CSS
    setTimeout(() => setTransitioning(false), 500);
  };

  const finishOnboarding = async (data: FieldValues) => {
    const { nome } = data;

    const success = await AuthService.updateuser(user!.id, {
      nome,
      is_onboarding_viewed: true,
    });
    if (success) updateUser({ isOnboardingViewed: true, name: nome });
    window.location.href = "/tabs/tab1";
  };

  return (
    <IonPage className="onboarding-page">
      <div className="onboarding-container">
        <Swiper
          modules={[Pagination, EffectFade]}
          effect="fade"
          fadeEffect={{ crossFade: true }}
          speed={500}
          onSlideChange={handleSlideChange}
          onSwiper={(swiper) => (swiperRef.current = swiper)}
        >
          {slides.map((slide, index) => (
            <SwiperSlide key={index}>
              <div className="slide-image-container">
                <img src={slide.image} className="slide-image" />
              </div>

              {/* Título com animação */}
              <h2
                className={`
                ${
                  transitioning && index === prevSlideIndex
                    ? "slide-text-out"
                    : ""
                }
                ${
                  transitioning && index === currentSlide ? "slide-text-in" : ""
                }
              `}
              >
                {slide.title}
              </h2>

              {/* Texto com animação */}
              <p
                className={`
                ${
                  transitioning && index === prevSlideIndex
                    ? "slide-text-out"
                    : ""
                }
                ${
                  transitioning && index === currentSlide ? "slide-text-in" : ""
                }
              `}
              >
                {slide.text}
              </p>

              {slide.isLast && (
                <form
                  onSubmit={handleSubmit(finishOnboarding)}
                  className="last-slide-form"
                >
                  <div className="input-group">
                    <input
                      type="text"
                      className={`form-input ${errors.nome ? "error" : ""}`}
                      placeholder="Como você quer ser chamada?"
                      {...register("nome")}
                    />
                    {errors.nome && errors.nome.message && (
                      <InputErrorMessage message={errors.nome.message} />
                    )}
                  </div>

                  <button
                    className="start-button"
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <IonSpinner name="crescent" color="light" />
                    ) : (
                      <>
                        Começar agora
                        <IonIcon
                          icon={arrowForward}
                          style={{ marginLeft: "8px" }}
                        />
                      </>
                    )}
                  </button>
                </form>
              )}
            </SwiperSlide>
          ))}
        </Swiper>

        <div className="navigation">
          <IonButton
            fill="clear"
            onClick={prevSlide}
            disabled={currentSlide === 0 || transitioning}
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
            <IonButton
              fill="clear"
              onClick={nextSlide}
              disabled={transitioning}
            >
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
