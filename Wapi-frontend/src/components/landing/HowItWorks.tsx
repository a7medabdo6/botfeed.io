"use client";

import { Zap, Brain, Target, ArrowLeft } from "lucide-react";

const steps = [
  {
    number: "1",
    icon: <Zap size={26} className="text-white" />,
    iconBg: "bg-gradient-to-br from-primary to-[#0090C7]",
    title: "نحن نعمل كل التقني نيابةً عنك",
    description: "بمجرد اشتراكك، فريقنا يربط صفحاتك (فيسبوك، إنستجرام، واتساب) بمنصة مسار ويدرب وكيلك الذكي. تستلم النظام جاهز للعمل فورًا.",
    accent: "from-[#00AEEF]/10 to-[#00AEEF]/5",
    borderAccent: "group-hover:border-[#00AEEF]/30",
  },
  {
    number: "2",
    icon: <Brain size={26} className="text-white" />,
    iconBg: "bg-gradient-to-br from-[#8B5CF6] to-[#6D28D9]",
    title: "علّم وكيلك الذكي",
    description: "أضف معلومات نشاطك (الأسعار، العروض، أوقات العمل) في لوحة التحكم. البوت يتعلم ويحدّث نفسه تلقائيًا بناءً على ما تضيفه.",
    accent: "from-[#8B5CF6]/10 to-[#8B5CF6]/5",
    borderAccent: "group-hover:border-[#8B5CF6]/30",
  },
  {
    number: "3",
    icon: <Target size={26} className="text-white" />,
    iconBg: "bg-gradient-to-br from-[#F59E0B] to-[#D97706]",
    title: "انطلق وحقق المبيعات!",
    description: "البوت يستلم الرسائل، يرد على الاستفسارات، ويستخرج بيانات العملاء المحتملين (Leads) نيابة عنك على مدار الساعة!",
    accent: "from-[#F59E0B]/10 to-[#F59E0B]/5",
    borderAccent: "group-hover:border-[#F59E0B]/30",
  },
];

const HowItWorks = () => {
  return (
    <section dir="rtl" className="relative bg-[#FAFCFF] py-20 md:py-28 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[radial-gradient(ellipse_at_center,rgba(0,174,239,0.03)_0%,transparent_60%)] pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-[#0090C7] shadow-[0_8px_32px_rgba(0,174,239,0.35)] mb-6 animate-[float-slower_4s_ease-in-out_infinite]">
            <Zap size={30} className="text-white" />
          </div>
          <h2 className="text-[calc(24px+(44-24)*((100vw-320px)/(1920-320)))] font-extrabold text-[#0F172A] tracking-tight mb-4">
            كيف نعمل؟
          </h2>
          <p className="text-[#64748B] text-[16px] md:text-[17px] leading-relaxed max-w-lg mx-auto">
            ٣ خطوات بسيطة — وأنت تستلم نظامك جاهزًا للعمل فورًا
          </p>
        </div>

        {/* Steps timeline */}
        <div className="relative">
          {/* Desktop connecting line */}
          <div className="hidden md:block absolute top-[100px] left-[20%] right-[20%] h-[3px]">
            <div className="w-full h-full bg-gradient-to-l from-[#F59E0B]/40 via-[#8B5CF6]/40 to-[#00AEEF]/40 rounded-full" />
            <div className="absolute top-1/2 -translate-y-1/2 left-1/3 -translate-x-1/2">
              <ArrowLeft size={16} className="text-[#8B5CF6]/60" />
            </div>
            <div className="absolute top-1/2 -translate-y-1/2 left-2/3 -translate-x-1/2">
              <ArrowLeft size={16} className="text-[#F59E0B]/60" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6">
            {steps.map((step, idx) => (
              <div
                key={idx}
                className={`group relative flex flex-col items-center text-center animate-fade-in-up rounded-3xl p-7 border border-transparent bg-white/50 backdrop-blur-sm transition-all duration-500 hover:scale-[1.04] hover:shadow-[0_20px_60px_rgba(0,174,239,0.1)] hover:bg-white ${step.borderAccent}`}
                style={{ animationDelay: `${idx * 200}ms` }}
              >
                {/* Hover gradient background */}
                <div className={`absolute inset-0 rounded-3xl bg-gradient-to-b ${step.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                {/* Step number badge */}
                <div className="relative z-10 w-11 h-11 rounded-full bg-[#F1F5F9] border-2 border-white shadow-[0_4px_12px_rgba(0,0,0,0.06)] flex items-center justify-center text-[15px] font-bold text-[#64748B] group-hover:bg-primary group-hover:text-white group-hover:shadow-[0_4px_16px_rgba(0,174,239,0.4)] transition-all duration-500 mb-6">
                  {step.number}
                </div>

                {/* Icon */}
                <div className={`relative z-10 w-16 h-16 rounded-2xl ${step.iconBg} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                  {step.icon}
                </div>

                {/* Content */}
                <h3 className="relative z-10 text-[18px] font-bold text-[#0F172A] mb-3 group-hover:text-primary transition-colors duration-300">{step.title}</h3>
                <p className="relative z-10 text-[15px] leading-relaxed text-[#64748B] max-w-[280px]">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
