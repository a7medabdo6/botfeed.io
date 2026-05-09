"use client";

import { Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

const brands = [
  { name: "Meta", color: "#64748B" },
  { name: "WhatsApp", color: "#16A34A" },
  { name: "Shopify", color: "#65A30D" },
  { name: "OpenAI", color: "#0F172A" },
  { name: "ManyChat", color: "#14B8A6" },
  { name: "Crisp", color: "#84CC16" },
  { name: "Telegram", color: "#0EA5E9" },
];

const BrandCarousel = () => {
  return (
    <section className="relative py-8 md:py-10 bg-[#FAFCFF]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-center text-[20px] font-bold text-[#0F172A]">
        اختيرت كمنصة مفضلة لدى +١٤٠ شركة عالميًا
        </p>

        <div className="mt-7 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
          <Swiper
            modules={[Autoplay]}
            loop
            freeMode
            allowTouchMove={false}
            slidesPerView="auto"
            spaceBetween={36}
            speed={5000}
            autoplay={{
              delay: 0,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            className="brand-carousel-swiper"
          >
            {[...brands, ...brands].map((brand, idx) => (
              <SwiperSlide key={`${brand.name}-${idx}`} className="!w-auto">
                <div className="flex items-center gap-2.5 whitespace-nowrap select-none py-1">
                  <span
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[12px] font-bold text-white shadow-sm"
                    style={{ backgroundColor: brand.color }}
                  >
                    {brand.name.charAt(0)}
                  </span>
                  <span className="text-[28px] font-extrabold tracking-tight" style={{ color: brand.color }}>
                    {brand.name}
                  </span>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
};

export default BrandCarousel;
