"use client";

import { ChevronDown } from "lucide-react";
import React, { useState } from "react";
import { FaqProps } from "../../types/landingPage";
import { useTranslation } from "react-i18next";

const Faq: React.FC<FaqProps> = ({ data }) => {
  const { t } = useTranslation();
  const [activeIndex, setActiveIndex] = useState<number | null>(0);

  const faqs = (data.faqs || []).map((f) => f._id).filter(Boolean);

  const toggleAccordion = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  if (faqs.length === 0) return null;

  return (
    <section id="faqs" className="bg-white py-[calc(40px+(100-40)*((100vw-320px)/(1920-320)))]">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 md:mb-16">
          <span className="inline-block text-[14px] font-bold uppercase tracking-[0.2em] text-primary mb-3">
            {data.badge || t("landing.sections.faq_badge")}
          </span>
          <h2 className="text-[calc(22px+(42-22)*((100vw-320px)/(1920-320)))] font-extrabold tracking-tight text-[#0F172A] whitespace-pre-wrap max-w-xl mx-auto">
            {data.title}
          </h2>
          {data.description && (
            <p className="mt-4 text-[16px] leading-relaxed text-[#64748B] max-w-lg mx-auto whitespace-pre-wrap">
              {data.description}
            </p>
          )}
        </div>

        <div className="space-y-3">
          {faqs.map((item, index) => (
            <div
              key={index}
              className={`rounded-2xl border transition-all duration-300 overflow-hidden
                ${activeIndex === index ? "border-[#00AEEF30] bg-[#F0FAFF] shadow-[0_4px_20px_rgba(0,174,239,0.06)]" : "border-[#E2E8F0] bg-white hover:border-[#00AEEF20]"}`}
            >
              <button
                onClick={() => toggleAccordion(index)}
                className="w-full flex items-center justify-between p-5 md:p-6 text-left"
              >
                <span className={`font-semibold text-[16px] pr-4 transition-colors ${activeIndex === index ? "text-primary" : "text-[#0F172A]"}`}>
                  {item.title}
                </span>
                <div className={`flex items-center justify-center w-8 h-8 rounded-full transition-all shrink-0
                  ${activeIndex === index ? "bg-primary text-white rotate-180" : "bg-[#F1F5F9] text-[#64748B]"}`}
                >
                  <ChevronDown size={16} />
                </div>
              </button>
              <div className={`overflow-hidden transition-all duration-300 ${activeIndex === index ? "max-h-96" : "max-h-0"}`}>
                <div className="px-5 md:px-6 pb-5 md:pb-6 pt-0">
                  <p className="text-[#64748B] text-[15px] leading-relaxed">{item.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Faq;
