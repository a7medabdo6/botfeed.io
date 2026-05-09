"use client";

import { Clock, Zap, TrendingDown, Users, Shield } from "lucide-react";

const benefits = [
  {
    icon: <Clock size={22} className="text-primary" />,
    iconBg: "bg-primary/10 group-hover:bg-primary/20",
    title: "متاح على مدار الساعة",
    description: "عملك لا يتوقف أبدًا. ولا يجب أن يتوقف دعمك. احصل على عملاء محتملين وأنت نائم.",
    stat: "24/7",
    statLabel: "خدمة مستمرة",
    borderColor: "rgba(0, 174, 239, 0.18)",
  },
  {
    icon: <Zap size={22} className="text-[#F59E0B]" />,
    iconBg: "bg-[#F59E0B]/10 group-hover:bg-[#F59E0B]/20",
    title: "ردود فورية",
    description: "صفر وقت انتظار لعملائك. الذكاء الاصطناعي يستجيب فورًا للحفاظ على تفاعلهم.",
    stat: "<1s",
    statLabel: "وقت الاستجابة",
    borderColor: "rgba(245, 158, 11, 0.18)",
  },
  {
    icon: <TrendingDown size={22} className="text-[#22C55E]" />,
    iconBg: "bg-[#22C55E]/10 group-hover:bg-[#22C55E]/20",
    title: "فعّال من حيث التكلفة",
    description: "وكيل ذكاء اصطناعي واحد يتعامل مع عبء عمل عدة موظفي دعم.",
    stat: "10x",
    statLabel: "توفير في التكاليف",
    borderColor: "rgba(34, 197, 94, 0.18)",
  },
  {
    icon: <Users size={22} className="text-[#8B5CF6]" />,
    iconBg: "bg-[#8B5CF6]/10 group-hover:bg-[#8B5CF6]/20",
    title: "وفّر في تكاليف الموظفين",
    description: "توفر تكلفة 3 موظفي خدمة عملاء بدوام كامل. دع الذكاء الاصطناعي يتعامل مع الاستفسارات الروتينية.",
    stat: "3+",
    statLabel: "موظفين أقل",
    borderColor: "rgba(139, 92, 246, 0.18)",
  },
];

const metrics = [
  { label: "وقت الاستجابة", value: "-98%", color: "bg-[#22C55E]", textColor: "text-[#22C55E]", width: "95%",borderColor: "rgba(0, 132, 255, 0.18)" },
  { label: "رضا العملاء", value: "+75%", color: "bg-[#8B5CF6]", textColor: "text-[#8B5CF6]", width: "75%",borderColor: " rgba(245, 166, 35, 0.18)" },
  { label: "تحويل العملاء المحتملين", value: "+60%", color: "bg-[#00AEEF]", textColor: "text-[#00AEEF]", width: "60%",borderColor: " rgba(37, 211, 102, 0.18)" },
  { label: "توفير تكاليف الموظفين", value: "10x", color: "bg-[#F59E0B]", textColor: "text-[#F59E0B]", width: "80%",borderColor: "rgba(144, 108, 233, 0.18)" },
];

const WhyChoose = () => {
  return (
    <section dir="rtl" className="relative bg-[#FAFCFF] py-20 md:py-28 overflow-visible">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#0F172A] shadow-[0_8px_24px_rgba(15,23,42,0.2)] mb-6">
            <Shield size={26} className="text-white" />
          </div>
          <h2 className="text-[calc(24px+(44-24)*((100vw-320px)/(1920-320)))] font-extrabold text-[#0F172A] tracking-tight mb-4">
            لماذا تختار مَسار؟
          </h2>
          <p className="text-[#64748B] text-[16px] md:text-[17px] leading-relaxed max-w-lg mx-auto">
            نتائج حقيقية تحققها منصتنا لعملائنا كل يوم
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Benefits cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {benefits.map((item, idx) => (
              <div
                key={idx}
                className="group relative rounded-2xl border bg-white p-5 transition-all duration-500 hover:shadow-[0_12px_40px_rgba(0,174,239,0.1)] hover:border-primary/20 hover:-translate-y-1 animate-fade-in-up"
                style={{ animationDelay: `${idx * 100}ms` ,borderColor: item.borderColor as string} as React.CSSProperties}
              >
                <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${item.borderColor}, transparent)` }}></div>
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-11 h-11 rounded-xl ${item.iconBg} flex items-center justify-center transition-colors duration-300`}>
                    {item.icon}
                  </div>
                  <div className="text-left">
                    <span className="text-[20px] font-extrabold text-[#0F172A] leading-none">{item.stat}</span>
                    <p className="text-[11px] text-[#94A3B8] font-medium">{item.statLabel}</p>
                  </div>
                </div>
                <h3 className="text-[16px] font-bold text-[#0F172A] mb-2 group-hover:text-primary transition-colors duration-300">{item.title}</h3>
                <p className="text-[14px] leading-relaxed text-[#64748B]">{item.description}</p>
              </div>
            ))}
          </div>

          {/* Performance card */}
          <div className="relative rounded-[2rem] p-8 pt-0  backdrop-blur-sm">
            <div className="absolute inset-0  opacity-[0.07] blur-3xl rounded-full pointer-events-none" />

            <div className="relative z-10 flex items-center justify-between mb-8">
              <h3 className="text-[20px] font-bold text-[#0F172A]">تأثير الأداء</h3>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#22C55E]/10">
                <div className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
                <span className="text-[12px] font-semibold text-[#22C55E]">مباشر</span>
              </div>
            </div>

            <div className="relative z-10 space-y-6">
              {metrics.map((metric, idx) => (
                <div key={idx} className="group/metric animate-fade-in-up" style={{ animationDelay: `${idx * 150 + 200}ms` }}>
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-[15px] text-[#475569] font-medium">{metric.label}</span>
                    <span className={`text-[17px] font-extrabold ${metric.textColor}`}>{metric.value}</span>
                  </div>
                  <div className="relative h-3.5 rounded-full bg-white/40 overflow-hidden shadow-inner">
                    <div
                      className={`h-full rounded-full ${metric.color} transition-all duration-1000 ease-out relative`}
                      style={{ width: metric.width }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-l from-white/20 to-transparent rounded-full" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary stat */}
            <div className="relative z-10 mt-8 pt-6 border-t border-[#E2E8F0]/50 flex items-center justify-center gap-6">
              <div className="text-center">
                <span className="text-[24px] font-extrabold text-primary">+500</span>
                <p className="text-[12px] text-[#64748B]">عميل نشط</p>
              </div>
              <div className="w-px h-10 bg-[#E2E8F0]" />
              <div className="text-center">
                <span className="text-[24px] font-extrabold text-[#8B5CF6]">1M+</span>
                <p className="text-[12px] text-[#64748B]">رسالة شهريًا</p>
              </div>
              <div className="w-px h-10 bg-[#E2E8F0]" />
              <div className="text-center">
                <span className="text-[24px] font-extrabold text-[#22C55E]">99.9%</span>
                <p className="text-[12px] text-[#64748B]">وقت التشغيل</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* <img src="/assets/images/section-blob-2.svg" alt="" className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-[900px] h-auto pointer-events-none select-none" /> */}
    </section>
  );
};

export default WhyChoose;
