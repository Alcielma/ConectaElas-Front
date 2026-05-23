import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "./Carrossel.css";
import BannerService, { Banner } from "../../Services/BannerService";
import { useAuth } from "../../Contexts/AuthContext";

interface CarrosselProps {
  refreshKey?: number;
  onAddBanner?: () => void;
}

const Carrossel: React.FC<CarrosselProps> = ({ refreshKey, onAddBanner }) => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const { isAssistant } = useAuth();

  useEffect(() => {
    const loadBanners = async () => {
      const bannersData = await BannerService.fetchBanners();
      setBanners(bannersData);
    };

    loadBanners();
  }, [refreshKey]);

  return (
    <div className="carrossel-container">
      {banners.length === 0 && !isAssistant ? (
        <div className="carrossel-fallback">
          <p>Nenhum banner disponível no momento.</p>
        </div>
      ) : (
        <Swiper
          modules={[Pagination, Autoplay]}
          spaceBetween={10}
          slidesPerView={1}
          pagination={{ clickable: true }}
          autoplay={{ delay: 3000 }}
          loop={banners.length > 1}
        >
          {isAssistant && (
            <SwiperSlide key="add-banner">
              <div 
                className="add-banner-slide" 
                onClick={onAddBanner}
              >
                <div className="add-banner-icon">
                  <img src="/adicionar.svg" alt="Adicionar banner" style={{ width: '80px', height: '80px' }} />
                </div>
                <div className="add-banner-overlay">
                  <p className="add-banner-text">Adicionar novo banner</p>
                </div>
              </div>
            </SwiperSlide>
          )}
          {banners.map((banner) => (
            <SwiperSlide key={banner.id}>
              <a
                href={banner.Link}
                target="_blank"
                rel="noopener noreferrer"
                className="carrossel-slide"
              >
                <img
                  src={banner.imageUrl || "/default-image.jpg"}
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
      )}
    </div>
  );
};

export default Carrossel;