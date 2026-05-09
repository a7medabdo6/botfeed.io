"use client";

import { ROUTES } from "@/src/constants";
import { Button } from "@/src/elements/ui/button";
import { useAppSelector } from "@/src/redux/hooks";
import { useRouter } from "next/navigation";
import Images from "../../shared/Image";

const Home = () => {
  const router = useRouter();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  return (
    <section
      id="home"
      dir="rtl"
      className="relative min-h-screen flex items-center overflow-hidden bg-[#FAFCFF] pt-24 md:pt-28 pb-16"
    >
                  <img src="/assets/images/hero-background.svg" alt="" className="absolute -bottom-20 -right-20 w-[450px] h-auto pointer-events-none select-none" />
            <img src="/assets/images/hero-background-circle.svg" alt="" className="absolute -top-10 -left-16 w-[350px] h-auto pointer-events-none select-none" />

      {/* Background gradient blobs */}
      <div className="absolute top-[10%] left-[20%] w-[500px] h-[500px] bg-[radial-gradient(ellipse_at_center,rgba(0,174,239,0.07)_0%,transparent_70%)] pointer-events-none blur-3xl" />
      <div className="absolute top-[30%] right-[10%] w-[600px] h-[600px] bg-[radial-gradient(ellipse_at_center,rgba(0,174,239,0.05)_0%,transparent_70%)] pointer-events-none blur-3xl" />
      <div className="absolute bottom-[10%] left-[5%] w-[400px] h-[400px] bg-[radial-gradient(ellipse_at_center,rgba(0,174,239,0.04)_0%,transparent_70%)] pointer-events-none blur-3xl" />
      <div className="absolute top-[60%] right-[30%] w-[300px] h-[300px] bg-[radial-gradient(ellipse_at_center,rgba(0,174,239,0.06)_0%,transparent_70%)] pointer-events-none blur-2xl" />

      <div className="relative z-10 w-full mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Text content */}
          <div className="relative flex flex-col gap-6 max-w-xl lg:max-w-none">
            <div className="inline-flex items-center gap-2 self-start px-4 py-2 rounded-full bg-white border border-[#E2E8F0] shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-[14px] font-semibold text-[#475569]">
              موظف خدمة عملاء مابيغلطش              </span>
            </div>

            <h1 className="text-[calc(26px+(52-26)*((100vw-320px)/(1920-320)))] font-extrabold text-[#0F172A] leading-[1.2] tracking-tight">
              موظف خدمة عملاء مابيغلطش{"\n"}
              ومابيطلبش بريك!
            </h1>

            <p className="text-[#64748B] text-[15px] md:text-[17px] leading-[1.8] max-w-lg">
            كل رسالة من عميلك هي فرصة بيع… وإحنا مانخليش أي فرصة تضيع.
            منصة ذكية تجمع محادثات واتساب، إنستجرام، ماسنجر وموقعك في مكان واحد، مع وكيل AI يفهم نشاطك ويرد باحتراف… في ثواني.            </p>

            <div className="flex items-center gap-3 flex-wrap mt-2">
              <Button
                className="bg-primary hover:bg-[#0090C7] text-white px-7 py-3 h-12 rounded-xl font-semibold text-[15px] transition-all hover:scale-[1.02] active:scale-[0.97] shadow-[0_4px_20px_rgba(0,174,239,0.3)]"
                onClick={() => {
                  if (isAuthenticated) {
                    router.push("/dashboard");
                  } else {
                    router.push(ROUTES.Login);
                  }
                }}
              >
                ابدأ تجربتك الآن
              </Button>
              <Button
                variant="outline"
                className="border-[#E2E8F0] text-[#475569] px-7 py-3 h-12 rounded-xl font-semibold text-[15px] hover:border-primary hover:text-primary transition-all"
                onClick={() => {
                  if (isAuthenticated) {
                    router.push("/dashboard");
                  } else {
                    router.push(ROUTES.Login);
                  }
                }}
              >
                تسجيل الدخول
              </Button>
            </div>
          </div>

          {/* Floating visual elements */}
          <div className="relative w-full h-[400px] sm:h-[480px] lg:h-[540px] hidden md:block">
            {/* Chat mockup card */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[320px] h-[460px] sm:h-[500px] bg-white/70 backdrop-blur-xl rounded-3xl p-5 border border-[#00AEEF]/20 shadow-[0_20px_60px_rgba(0,174,239,0.12)] z-10" dir="rtl">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#00AEEF] to-[#0090C7] p-0.5">
                  <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                    <Images src="/assets/branding/botfeed-logo.png" alt="Logo" width={24} height={24} className="w-6 h-6 object-contain" unoptimized />
                  </div>
                </div>
                <div>
                  <div className="h-2 w-20 bg-[#0F172A]/15 rounded mb-1.5" />
                  <div className="h-2 w-14 bg-[#0F172A]/8 rounded" />
                </div>
              </div>

              <div className="space-y-3 h-[360px] sm:h-[400px] overflow-hidden">
                <div className="p-3 rounded-xl text-[12px] bg-[#F1F5F9] border border-[#E2E8F0] rounded-tr-none mr-auto max-w-[85%]">
                  <p className="text-[#0F172A] text-right"
                  >
                    
                    مساء الخير، عايز أحجز موعد.                    </p>
                </div>
                <div className="p-3 rounded-xl text-[12px] bg-[#00AEEF]/10 border border-[#00AEEF]/20 rounded-tl-none ml-auto max-w-[85%]">
                  <p className="text-[#0F172A] text-right">
                  أهلًا بحضرتك 👋 {"\n"}
                  {"\n"} {"\n"}
أكيد، تحب تحجز لأي يوم ووقت؟ 



                    
                    </p>
                </div>
                <div className="p-3 rounded-xl text-[12px] bg-[#F1F5F9] border border-[#E2E8F0] rounded-tr-none mr-auto max-w-[85%]">
                  <p className="text-[#0F172A] text-right"
                  >
بكرة بعد الساعة 6.
                  </p>
                </div>
                <div className="p-3 rounded-xl text-[12px] bg-[#00AEEF]/10 border border-[#00AEEF]/20 rounded-tl-none ml-auto max-w-[85%]">
                  <p className="text-[#0F172A] text-right">
                  متاح غدًا 6:30 مساءً أو 8:00 مساءً ✨
                  أي موعد يناسبك؟
                  </p>
                </div>
                <div className="p-3 rounded-xl text-[12px] bg-[#F1F5F9] border border-[#E2E8F0] rounded-tr-none mr-auto max-w-[85%]">
                  <p className="text-[#0F172A] text-right">
                  6:30 مناسب.
                  </p>
                </div>
                <div className="p-3 rounded-xl text-[12px] bg-[#00AEEF]/10 border border-[#00AEEF]/20 rounded-tl-none ml-auto max-w-[85%]">
                  <p className="text-[#0F172A] text-right"
                  >
تم الحجز بنجاح ✅
موعدك غدًا الساعة 6:30 مساءً.
                  </p>
                </div>
                <div className="p-3 rounded-xl text-[12px] bg-[#F1F5F9] border border-[#E2E8F0] rounded-tr-none mr-auto max-w-[85%]">
                  <p className="text-[#0F172A] text-right">
                  شكرًا.
                  </p>
                </div>
                <div className="p-3 rounded-xl text-[12px] bg-[#00AEEF]/10 border border-[#00AEEF]/20 rounded-tl-none ml-auto max-w-[85%]">
                  <p className="text-[#0F172A] text-right">يسعدنا نبدأ مع حضرتك فورًا</p>
                </div>
              </div>
            </div>

            {/* WhatsApp floating icon - top right */}
            <div className="absolute top-[5%] right-[2%] w-[100px] h-[100px] animate-[float-slower_6s_ease-in-out_infinite]">
              <Images
                src="/assets/images/whatspp.svg"
                alt="واتساب"
                width={100}
                height={100}
                className="w-full h-full drop-shadow-lg"
                unoptimized
              />
            </div>

            {/* Instagram floating icon - top left */}
            <div className="absolute top-[10%] left-[0%] w-[95px] h-[95px] animate-[float-slower_7s_ease-in-out_infinite_0.5s]">
              <Images
                src="/assets/images/floating-instagram.svg"
                alt="إنستجرام"
                width={95}
                height={95}
                className="w-full h-full drop-shadow-lg"
                unoptimized
              />
            </div>

            {/* Messenger floating icon - bottom right */}
            <div className="absolute bottom-[8%] right-[2%] w-[100px] h-[100px] animate-[float-slower_5s_ease-in-out_infinite_1s]">
              <Images
                src="/assets/images/floating-messenger.svg"
                alt="ماسنجر"
                width={100}
                height={100}
                className="w-full h-full drop-shadow-lg"
                unoptimized
              />
            </div>

            {/* Microphone floating icon - bottom left */}
            <div className="absolute bottom-[15%] left-[5%] w-[90px] h-[90px] animate-[float-slower_6s_ease-in-out_infinite_1.5s]">
              <Images
                src="/assets/images/floating-microphone.svg"
                alt="ميكروفون"
                width={90}
                height={90}
                className="w-full h-full drop-shadow-lg"
                unoptimized
              />
            </div>

            {/* Robot floating icon - middle left */}
            <div className="absolute top-[42%] left-[-5%] w-[105px] h-[95px] animate-[float-slower_8s_ease-in-out_infinite_2s]">
              <Images
                src="/assets/images/floating-robot.svg"
                alt="روبوت ذكي"
                width={105}
                height={95}
                className="w-full h-full drop-shadow-lg"
                unoptimized
              />
            </div>

            {/* TikTok floating icon - middle right */}
            <div className="absolute top-[38%] right-[-3%] w-[90px] h-[90px] animate-[float-slower_7s_ease-in-out_infinite_2.5s]">
              <Images
                src="/assets/images/floating-tiktok.svg"
                alt="تيك توك"
                width={90}
                height={90}
                className="w-full h-full drop-shadow-lg"
                unoptimized
              />
            </div>

            {/* Decorative circles */}
            <div className="absolute top-[60%] right-[8%] w-10 h-10 rounded-full bg-primary/10 border border-primary/20 animate-pulse" />
            <div className="absolute top-[28%] left-[22%] w-6 h-6 rounded-full bg-primary/5 border border-primary/10" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Home;
