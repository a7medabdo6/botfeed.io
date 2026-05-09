"use client";

import { Quote, Star } from "lucide-react";
import React, { useState } from "react";
import { Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import Images from "../../shared/Image";
import { TestimonialPopulated, TestimonialProps } from "../../types/landingPage";
import { useTranslation } from "react-i18next";

const Testimonial: React.FC<TestimonialProps> = ({ data }) => {
  const { t } = useTranslation();
  const testimonials = (data.testimonials || []).map((item) => item._id).filter((item): item is TestimonialPopulated => !!item && typeof item === "object");

  const testimonialsFinal = testimonials.length === 4 ? [...testimonials, ...testimonials] : testimonials;

  const [activeIndex, setActiveIndex] = useState(0);

  if (testimonialsFinal.length === 0) return null;

  return (
    <section id="testimonials" className="bg-[#F8FAFC] py-[calc(40px+(100-40)*((100vw-320px)/(1920-320)))] overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 md:mb-16">
          <span className="inline-block text-[14px] font-bold uppercase tracking-[0.2em] text-primary mb-3">
            {data.badge || t("landing.sections.testimonials_badge")}
          </span>
          <h2 className="text-[calc(22px+(42-22)*((100vw-320px)/(1920-320)))] font-extrabold leading-[1.2] tracking-tight text-[#0F172A] max-w-2xl mx-auto whitespace-pre-wrap">
            {data.title}
          </h2>
        </div>

        <div className="relative">
          <Swiper
            modules={[Autoplay]}
            spaceBetween={24}
            slidesPerView={3}
            centeredSlides={true}
            loop={testimonialsFinal.length > 3}
            speed={800}
            grabCursor={true}
            watchSlidesProgress={true}
            observer={true}
            observeParents={true}
            onRealIndexChange={(swiper) => {
              setActiveIndex(swiper.realIndex % testimonials.length);
            }}
            autoplay={testimonialsFinal.length > 1 ? { delay: 4000, disableOnInteraction: false } : false}
            breakpoints={{
              320: { slidesPerView: Math.min(1, testimonialsFinal.length), spaceBetween: 16 },
              640: { slidesPerView: Math.min(1.5, testimonialsFinal.length), spaceBetween: 20 },
              768: { slidesPerView: Math.min(2, testimonialsFinal.length), spaceBetween: 24 },
              1024: { slidesPerView: Math.min(3, testimonialsFinal.length), spaceBetween: 28 },
            }}
            className="testimonial-swiper"
          >
            {testimonialsFinal.map((item, idx) => (
              <SwiperSlide key={idx} className="h-auto! py-4">
                {({ isActive }) => (
                  <div
                    className={`transition-all duration-500 ease-out h-full
                      ${isActive ? "scale-[1.02] opacity-100" : "scale-95 opacity-60"}
                    `}
                  >
                    <div className="bg-white rounded-2xl p-6 h-full flex flex-col border border-[#E2E8F0] shadow-[0_4px_24px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_40px_rgba(0,174,239,0.08)] transition-shadow">
                      <div className="mb-5">
                        <div className="bg-[#00AEEF10] w-11 h-11 rounded-xl flex items-center justify-center">
                          <Quote className="text-primary fill-primary transform scale-x-[-1]" size={20} strokeWidth={0} />
                        </div>
                      </div>

                      <p className="text-[#475569] text-[15px] mb-6 grow leading-relaxed">{item.description}</p>

                      <div className="flex items-center gap-3 pt-4 border-t border-[#F1F5F9]">
                        <Images src={item?.user_image} alt={item?.user_name || "image"} className="w-10 h-10 max-w-10 max-h-10 rounded-full object-cover shrink-0" width={100} height={100} unoptimized />
                        <div className="flex-1">
                          <h4 className="font-semibold text-[#0F172A] text-[15px] leading-tight">{item.user_name}</h4>
                          <span className="text-[14px] text-[#94A3B8]">{item.user_post}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star size={14} className="fill-[#FBBF24] text-[#FBBF24]" />
                          <span className="text-[14px] font-bold text-[#0F172A]">{item.rating?.toFixed(1) || "5.0"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </SwiperSlide>
            ))}
          </Swiper>

          <div className="flex justify-center gap-2 mt-10">
            {testimonials.map((_, i) => (
              <span
                key={i}
                className={`block rounded-full transition-all duration-300 cursor-pointer
                  ${activeIndex === i ? "w-6 h-2 bg-primary" : "w-2 h-2 bg-[#CBD5E1]"}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonial;
