import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "./Carrossel.css";

const slides = [
  {
    image:
      "https://www.cnnbrasil.com.br/wp-content/uploads/sites/12/2023/07/christina-wocintechchat-com-Q80LYxv_Tbs-unsplash.jpg?w=1220&h=674&crop=1&quality=85",
    link: "https://www.cnnbrasil.com.br/economia/macroeconomia/cargos-de-lideranca-mulheres-ganham-r-40-mil-a-menos-que-homens-por-ano/",
    title:
      "Mulheres em cargos de liderança ainda enfrentam desigualdade salarial",
  },
  {
    image:
      "https://www.cnnbrasil.com.br/wp-content/uploads/sites/12/Reuters_Direct_Media/BrazilOnlineReportDomesticNews/tagreuters.com2023binary_LYNXMPEJ770E4-FILEDIMAGE.jpg?w=1220&h=674&crop=1&quality=85",
    link: "https://www.cnnbrasil.com.br/lifestyle/por-que-o-dia-internacional-da-mulher-e-comemorado-em-8-de-marco/",
    title: "Por que o Dia Internacional da Mulher é comemorado em 8 de março?",
  },
  {
    image:
      "https://www.cnnbrasil.com.br/wp-content/uploads/sites/12/2022/01/GettyImages-1295903823.jpg?w=1220&h=674&crop=1&quality=85",
    link: "https://www.cnnbrasil.com.br/economia/financas/numero-de-mulheres-investidoras-cresce-e-atinge-recorde-em-2024-diz-b3/",
    title: "Número de mulheres investidoras atinge recorde em 2024",
  },
];

const Carrossel: React.FC = () => {
  return (
    <div className="carrossel-container">
      <Swiper
        modules={[Pagination, Autoplay]}
        spaceBetween={10}
        slidesPerView={1}
        pagination={{ clickable: true }}
        autoplay={{ delay: 3000 }}
        loop={true}
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={index}>
            <a
              href={slide.link}
              target="_blank"
              rel="noopener noreferrer"
              className="carrossel-slide"
            >
              <img
                src={slide.image}
                alt={`Slide ${index + 1}`}
                className="carrossel-image"
              />
              <div className="carrossel-overlay">
                <h3 className="carrossel-title">{slide.title}</h3>
              </div>
            </a>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default Carrossel;
