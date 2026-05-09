"use client";

import { Check } from "lucide-react";

const plans = [
  {
    name: "Starter",
    price: "299",
    subtitle: "مثالي للمشاريع الصغيرة",
    features: ["1000 رسالة شهريًا", "واتساب + إنستجرام", "ردود ذكية تلقائية"],
    highlighted: false,
  },
  {
    name: "Growth",
    price: "799",
    subtitle: "الخطة الأكثر استخدامًا",
    features: ["رسائل غير محدودة", "جميع القنوات", "استخراج العملاء المحتملين", "لوحة تقارير متقدمة"],
    highlighted: true,
  },
  {
    name: "Scale",
    price: "1499",
    subtitle: "للشركات والفرق الكبيرة",
    features: ["متعدد الفرق", "تكاملات مخصصة", "مدير حساب مخصص", "دعم أولوية 24/7"],
    highlighted: false,
  },
];

const StaticPricing = () => {
  return (
    <section id="pricing" dir="rtl" className="relative bg-[#FAFCFF] py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="inline-flex items-center rounded-full border border-[#E2E8F0] bg-white px-4 py-2 text-[14px] font-semibold text-[#475569] shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            خطط الأسعار
          </span>
          <h2 className="mt-4 text-[calc(24px+(44-24)*((100vw-320px)/(1920-320)))] font-extrabold tracking-tight text-[#0F172A]">
            اختر الخطة المناسبة لنموك
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-[16px] text-[#64748B]">
            ابدأ بخطة تناسب حجم عملك اليوم، وطورها في أي وقت مع زيادة عدد الرسائل والعملاء.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 items-stretch">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-3xl border p-7 transition-all duration-300 h-full flex flex-col ${
                plan.highlighted
                  ? "border-primary bg-white shadow-[0_20px_50px_rgba(0,174,239,0.18)] lg:-translate-y-2"
                  : "border-[#E2E8F0] bg-white hover:border-primary/30 hover:shadow-[0_10px_30px_rgba(0,0,0,0.06)]"
              }`}
            >
              {plan.highlighted && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-[12px] font-bold text-white">
                  الأكثر استخدامًا
                </span>
              )}

              <h3 className="text-[24px] font-extrabold text-[#0F172A]">{plan.name}</h3>
              <p className="mt-1 text-[14px] text-[#64748B]">{plan.subtitle}</p>

              <div className="mt-5 flex items-end gap-2">
                <span className="text-[40px] font-extrabold leading-none text-[#0F172A]">${plan.price}</span>
                <span className="mb-1 text-[14px] text-[#94A3B8]">/ شهريًا</span>
              </div>

              <div className="mt-6 space-y-3 flex-1">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-start gap-2.5">
                    <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Check size={13} />
                    </span>
                    <span className="text-[15px] text-[#475569]">{feature}</span>
                  </div>
                ))}
              </div>

              <button
                className={`mt-8 w-full rounded-xl px-5 py-3 text-[15px] font-semibold transition-all ${
                  plan.highlighted
                    ? "bg-primary text-white hover:bg-[#0090C7] shadow-[0_6px_20px_rgba(0,174,239,0.3)]"
                    : "border border-[#E2E8F0] text-[#0F172A] hover:border-primary/40 hover:text-primary"
                }`}
              >
                ابدأ الآن
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StaticPricing;
