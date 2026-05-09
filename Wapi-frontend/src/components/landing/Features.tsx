"use client";

import { ROUTES } from "@/src/constants";
import { useAppSelector } from "@/src/redux/hooks";
import { Brain, Inbox, MessageSquareWarning, UserPlus, Sparkles, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

const features = [
  {
    icon: <Inbox size={24} className="text-[#0084FF]" />,
    iconBg: "bg-gradient-to-br from-[#0084FF]/15 to-[#0084FF]/5",
    hoverBg: "group-hover:bg-[#EBF5FF]",
    borderColor: " rgba(0, 132, 255, 0.18)",
    accentColor: "#0084FF",
    label: "UNIFIED INBOX",
    title: "صندوق الوارد الموحد",
    description: "كل محادثاتك من واتساب، ماسنجر، إنستجرام، والموقع — في شاشة واحدة. لا تفوّت أي رسالة مرة أخرى.",
    badge: "الأكثر استخدامًا",
  },
  {
    icon: <Brain size={24} className="text-[#00AEEF]" />,
    iconBg: "bg-gradient-to-br from-[#00AEEF]/15 to-[#00AEEF]/5",
    hoverBg: "group-hover:bg-[#E8F9FF]",
    borderColor: " rgba(0, 132, 255, 0.18)",
    accentColor: "#00AEEF",
    label: "AI KNOWLEDGE BASE",
    title: "قاعدة المعرفة الذكية",
    description: "ارفع ملفاتك، سياساتك، أو أسعارك. وكيل مسار يحفظها ويرد على العملاء بدقة متناهية بناءً على معلومات عملك فقط.",
    badge: null,
  },
  {
    icon: <MessageSquareWarning size={24} className="text-[#22C55E]" />,
    iconBg: "bg-gradient-to-br from-[#22C55E]/15 to-[#22C55E]/5",
    hoverBg: "group-hover:bg-[#ECFDF5]",
    borderColor: "rgba(37, 211, 102, 0.18)",
    accentColor: "#22C55E",
    label: "COMMENTS SHIELD",
    title: "درع التعليقات الذكي",
    description: "الذكاء الاصطناعي يرد على تعليقات فيسبوك وإنستجرام فورًا، مع إخفاء تلقائي للتعليقات السلبية أو أسعار المنافسين.",
    badge: "جديد",
  },
  {
    icon: <UserPlus size={24} className="text-[#F59E0B]" />,
    iconBg: "bg-gradient-to-br from-[#F59E0B]/15 to-[#F59E0B]/5",
    hoverBg: "group-hover:bg-[#FFFBEB]",
    borderColor: "rgba(245, 166, 35, 0.18)",
    accentColor: "#F59E0B",
    label: "LEAD GENERATION",
    title: "صائد العملاء التلقائي",
    description: "مسار يستخرج أرقام العملاء المحتملين تلقائيًا ويجمع بياناتهم في مكان واحد جاهز للمتابعة.",
    badge: null,
  },
];

const Features: React.FC<{ data?: { cta_button?: { text?: string; link: string } } }> = ({ data }) => {
  const route = useRouter();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  return (
    <section id="features" dir="rtl" className="relative bg-[#FAFCFF] py-20 md:py-28 overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[radial-gradient(ellipse_at_center,rgba(0,174,239,0.04)_0%,transparent_60%)] pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14 md:mb-18">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border border-[#E2E8F0] shadow-[0_4px_12px_rgba(0,0,0,0.04)] mb-6">
            <Sparkles size={16} className="text-primary" />
            <span className="text-[14px] font-semibold text-[#475569]">مميزات المنصة</span>
          </div>
          <h2 className="text-[calc(24px+(44-24)*((100vw-320px)/(1920-320)))] font-extrabold text-[#0F172A] tracking-tight mb-4">
            كل اللي تحتاجه في مكان واحد
          </h2>
          <p className="text-[#64748B] text-[16px] md:text-[17px] leading-relaxed max-w-2xl mx-auto">
          بوتفيد مش مجرد أداة خدمة عملاء… دي بنية تشغيل كاملة مدعومة بالذكاء الاصطناعي.          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className={`${idx === 0 || idx === 3 ? "md:col-span-5" : "md:col-span-7"} group relative animate-fade-in-up feature-card-border rounded-2xl bg-white border  p-7 transition-all duration-500 ${feature.borderColor} hover:shadow-[0_16px_48px_rgba(0,0,0,0.07)] hover:-translate-y-1.5 hover:border-transparent`}
              style={{ animationDelay: `${idx * 150}ms`, "--card-accent": feature.accentColor ,borderColor: feature.borderColor} as React.CSSProperties}
            >
                            <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${feature.borderColor}, transparent)` }}></div>

              {/* Hover background color */}
              <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
                <div className={`w-full h-full opacity-0 group-hover:opacity-100 transition-opacity duration-500`} style={{ backgroundColor: `${feature.accentColor}08` }} />
              </div>

              {/* Badge */}
              {feature.badge && (
                <div className="absolute top-4 left-4 px-2.5 py-1 rounded-full text-[11px] font-bold" style={{ backgroundColor: `${feature.accentColor}15`, color: feature.accentColor }}>
                  {feature.badge}
                </div>
              )}

              <div className="relative z-10 flex items-start gap-5">
                {/* Icon */}
                <div className={`w-14 h-14 shrink-0 rounded-2xl ${feature.iconBg} flex items-center justify-center group-hover:scale-110 group-hover:rotate-2 transition-all duration-500 shadow-sm`}>
                  {feature.icon}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#94A3B8] group-hover:text-primary/70 transition-colors duration-300">{feature.label}</span>
                  <h3 className="text-[18px] font-bold text-[#0F172A] mt-1.5 mb-2.5 group-hover:text-[#0F172A] transition-colors duration-300">{feature.title}</h3>
                  <p className="text-[15px] leading-[1.7] text-[#64748B]">{feature.description}</p>

                  {/* Hover arrow */}
                  <div className="flex items-center gap-1.5 mt-4 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-400">
                    <span className="text-[13px] font-semibold" style={{ color: feature.accentColor }}>اعرف المزيد</span>
                    <ArrowLeft size={14} style={{ color: feature.accentColor }} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {data?.cta_button?.text && (
          <div className="text-center mt-12">
            <button
              className="group/btn inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-4 text-[15px] font-semibold text-white shadow-[0_4px_20px_rgba(0,174,239,0.3)] transition-all duration-300 hover:scale-[1.03] hover:bg-[#0090C7] hover:shadow-[0_8px_32px_rgba(0,174,239,0.4)]"
              onClick={() => {
                if (isAuthenticated) {
                  const isAgent = user?.role === "agent";
                  const targetLink = isAgent ? "/chat" : data?.cta_button?.link || "/";
                  route.push(targetLink);
                } else {
                  route.push(ROUTES.Login);
                }
              }}
            >
              {data.cta_button.text}
              <ArrowLeft size={16} className="group-hover/btn:-translate-x-1 transition-transform duration-300" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default Features;
