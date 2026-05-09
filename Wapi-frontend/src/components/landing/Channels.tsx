"use client";

import { Globe, Instagram, MessageCircle } from "lucide-react";

const channels = [
  {
    icon: (
      <div className="w-12 h-12 rounded-xl bg-[#0084FF]/10 flex items-center justify-center">
        <MessageCircle size={24} className="text-[#0084FF]" />
      </div>
    ),
    borderColor: " rgba(0, 132, 255, 0.18)",
    label: "MESSENGER",
    title: "ماسنجر",
    description: "ردود ذكية وتلقائية على فيسبوك ماسنجر للرد على استفسارات عملائك، تنظيم الحجوزات، وتقديم دعم فني متميز على مدار الساعة.",
  },
  {
    icon: (
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#F58529]/10 via-[#DD2A7B]/10 to-[#8134AF]/10 flex items-center justify-center">
        <Instagram size={24} className="text-[#DD2A7B]" />
      </div>
    ),
    borderColor: " rgba(220, 39, 67, 0.18)",
    label: "INSTAGRAM",
    title: "انستجرام",
    description: "تفاعل مع المتابعين فورًا والرد تلقائي على الرسائل المباشرة.",
    highlighted: true,
  },
  {
    icon: (
      <div className="w-12 h-12 rounded-xl bg-[#25D366]/10 flex items-center justify-center">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="#25D366">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492l4.611-1.46A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75c-2.09 0-4.026-.658-5.616-1.777l-.402-.265-2.733.866.72-2.632-.292-.426A9.72 9.72 0 012.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75z" />
        </svg>
      </div>
    ),
    borderColor: " rgba(37, 211, 102, 0.18)",
    label: "WHATSAPP",
    title: "واتساب",
    description: "ردود فورية وذكية على واتساب، حجز مواعيد تلقائي، وتلقي طلبات عملائك وتنظيمها بسهولة لتطوير عملك وزيادة مبيعاتك.",
  },
  {
    icon: (
      <div className="w-12 h-12 rounded-xl bg-[#6366F1]/10 flex items-center justify-center">
        <Globe size={24} className="text-[#6366F1]" />
      </div>
    ),
    borderColor: "rgba(144, 108, 233, 0.18)",
    label: "WEBSITE",
    title: "الموقع الإلكتروني",
    description: "إضافة وكيل ذكاء اصطناعي ذكي لموقعك، يقوم بالرد على استفسارات الزوار، جمع بيانات العملاء وزيادة المبيعات.",
  },
];

const Channels = () => {
  return (
    <section dir="rtl" className="relative bg-[#FAFCFF] py-16 md:py-24">
          <img src="/assets/images/section-blob.svg" alt="" className="absolute  left-1/2 -translate-x-1/2 translate-y-1/2 w-[900px] h-auto pointer-events-none select-none" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#E2E8F0] shadow-[0_2px_8px_rgba(0,0,0,0.04)] mb-5">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <span className="text-[14px] font-semibold text-[#475569]">دعم متعدد القنوات</span>
          </div>
          <h2 className="text-[calc(22px+(40-22)*((100vw-320px)/(1920-320)))] font-extrabold text-[#0F172A] tracking-tight mb-4">
            دعم متعدد القنوات
          </h2>
          <p className="text-[#64748B] text-[16px] md:text-[17px] leading-relaxed max-w-2xl mx-auto">
          نبني لك وكيل ذكاء اصطناعي يفهم نشاطك التجاري، يعمل باسمك، ويتواجد حيث يوجد عملاؤك.          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {channels.map((channel, idx) => (
            <div
              key={idx}
              className={`rounded-2xl relative p-6 flex flex-col gap-4 transition-all duration-300 ${
                channel.highlighted
                  ? "bg-white border border-primary/20 shadow-[0_8px_30px_rgba(0,174,239,0.08)]"
                  : "bg-white border  hover:border-primary/20 hover:shadow-[0_8px_30px_rgba(0,174,239,0.06)]"
              }`}
              style={{ borderColor: channel.borderColor }}
            >
              <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${channel.borderColor}, transparent)` }}></div>
              {channel.icon}
              <div> 
                <span className="text-[12px] font-bold uppercase tracking-widest text-[#94A3B8]">
                  {channel.label}
                </span>
                <h3 className="text-[18px] font-bold text-[#0F172A] mt-1">{channel.title}</h3>
              </div>
              <p className="text-[15px] leading-relaxed text-[#64748B]">{channel.description}</p>
              {channel.highlighted && (
                <span className="text-primary text-[14px] font-semibold mt-auto cursor-pointer hover:underline">
                  ← المزيد
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Channels;
