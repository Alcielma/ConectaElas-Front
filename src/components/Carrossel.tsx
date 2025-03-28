import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "./Carrossel.css";
import BannerService, { Banner } from "../Services/BannerService";

const Carrossel: React.FC = () => {
  const [banners, setBanners] = useState<Banner[]>([]);

  // Função para carregar banners da API
  useEffect(() => {
    const loadBanners = async () => {
      const bannersData = await BannerService.fetchBanners();
      setBanners(bannersData);
    };

    loadBanners();
  }, []);

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
        {banners.map((banner) => (
          <SwiperSlide key={banner.id}>
            <a
              href={banner.Link}
              target="_blank"
              rel="noopener noreferrer"
              className="carrossel-slide"
            >
              <img
                src={banner.imageUrl}
                alt={banner.Titulo}
                className="carrossel-image"
              />
              <div className="carrossel-overlay">
                <h3 className="carrossel-title">{banner.Titulo}</h3>
              </div>
            </a>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default Carrossel;
