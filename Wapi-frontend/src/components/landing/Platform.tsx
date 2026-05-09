"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import React, { useRef, useState } from "react";
import type { Swiper as SwiperType } from "swiper";
import { Autoplay, EffectFade, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import Images from "../../shared/Image";
import { PlatformProps } from "../../types/landingPage";
import { getStaticPlatformImage } from "@/src/constants/landing-static-media";
import { CheckCircle2 } from "lucide-react";

const Platform: React.FC<PlatformProps> = ({ data }) => {
  const progressRef = useRef<HTMLDivElement>(null);
  const swiperRef = useRef<SwiperType | null>(null);
  const [activeStep, setActiveStep] = useState(0);

  const steps = data.items || [];

  useGSAP(() => {
    if (progressRef.current && steps.length > 0) {
      const progress = (activeStep + 1) / steps.length;
      gsap.to(progressRef.current, {
        width: `${progress * 100}%`,
        duration: 0.6,
        ease: "power2.out",
      });
    }
  }, [activeStep, steps.length]);

  const handleStepClick = (index: number) => {
    setActiveStep(index);
    swiperRef.current?.slideTo(index);
  };

  if (steps.length === 0) return null;

  return (
    <section id="support" className="bg-white py-[calc(40px+(100-40)*((100vw-320px)/(1920-320)))]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 md:mb-16">
          <span className="inline-block text-[14px] font-bold uppercase tracking-[0.2em] text-primary mb-3">
            {data.badge || "Platform"}
          </span>
          <h2 className="text-[calc(22px+(42-22)*((100vw-320px)/(1920-320)))] font-extrabold tracking-tight text-[#0F172A] whitespace-pre-wrap max-w-2xl mx-auto">
            {data.title}
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Image/Swiper side */}
          <div className="relative w-full overflow-hidden rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] shadow-[0_8px_40px_rgba(0,174,239,0.06)]">
            <Swiper
              loop
              onSwiper={(swiper) => (swiperRef.current = swiper)}
              onSlideChange={(swiper) => setActiveStep(swiper.realIndex)}
              modules={[Autoplay, Pagination, EffectFade]}
              effect="fade"
              slidesPerView={1}
              pagination={{ clickable: true }}
              className="h-full w-full platform-swiper cursor-grab active:cursor-grabbing aspect-[4/3]"
            >
              {steps.map((step, index) => (
                <SwiperSlide key={index}>
                  <div className="relative h-full w-full">
                    <Images
                      src={getStaticPlatformImage(index)}
                      alt={step.title}
                      fill
                      className="object-cover rounded-2xl"
                      priority={index === 0}
                      unoptimized
                    />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>

          {/* Content side */}
          <div className="flex flex-col gap-6">
            {/* Step indicators */}
            {steps.length > 1 && (
              <div className="flex items-center gap-3 mb-2">
                {steps.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => handleStepClick(i)}
                    className={`flex h-9 w-9 items-center justify-center rounded-full text-[12px] font-bold transition-all duration-300
                      ${i === activeStep ? "bg-primary text-white shadow-[0_4px_12px_rgba(0,174,239,0.3)]" : i < activeStep ? "bg-primary/20 text-primary" : "bg-[#F1F5F9] text-[#94A3B8] border border-[#E2E8F0]"}`}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </button>
                ))}
                <div className="flex-1 h-1 bg-[#F1F5F9] rounded-full overflow-hidden ml-2">
                  <div ref={progressRef} className="h-full bg-primary rounded-full transition-all" style={{ width: 0 }} />
                </div>
              </div>
            )}

            {/* Active step content */}
            <div>
              {steps[activeStep].tagline && (
                <span className="text-[13px] font-bold uppercase tracking-widest text-primary">
                  {steps[activeStep].tagline}
                </span>
              )}
              <h3 className="mt-2 text-[calc(18px+(28-18)*((100vw-320px)/(1920-320)))] font-bold text-[#0F172A]">
                {steps[activeStep].title}
              </h3>
              <p className="mt-3 text-[15px] leading-relaxed text-[#64748B]">
                {steps[activeStep].description}
              </p>
            </div>

            {/* Bullet points */}
            <ul className="space-y-3">
              {(steps[activeStep].bullets || []).map((feature, i) => (
                <li key={i} className="flex items-start gap-3 text-[14px] text-[#475569]">
                  <CheckCircle2 size={18} className="text-primary shrink-0 mt-0.5" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Platform;
