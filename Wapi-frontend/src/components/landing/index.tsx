"use client";

import BrandCarousel from "./BrandCarousel";
import Channels from "./Channels";
import Features from "./Features";
import Footer from "./Footer";
import FunnelWidgetScripts from "../funnels/FunnelWidgetScripts";
import Header from "./Header";
import Home from "./Home";
import HowItWorks from "./HowItWorks";
import StaticPricing from "./StaticPricing";
import TapTop from "./TapTop";
import WhyChoose from "./WhyChoose";
import { useEffect } from "react";
import { useTheme } from "next-themes";
import { useGetLandingPageQuery } from "@/src/redux/api/landingPageApi";

const Landing = () => {
  const { theme, setTheme } = useTheme();
  const { data: landingData } = useGetLandingPageQuery();
  const adminConfiguredWidgetKey = landingData?.data?.landing_chatbot_widget_key?.trim() || null;
  const envFallbackWidgetKey = process.env.NEXT_PUBLIC_LANDING_CHATBOT_WIDGET_KEY || null;
  const widgetKey = adminConfiguredWidgetKey || envFallbackWidgetKey || "wk_2711169e952ece69ebc711fc4f122614f4f4d679dc3f28ef";
  const apiRaw = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5001/api";
  const scriptSrc = (apiRaw.includes("/api") ? apiRaw : `${apiRaw.replace(/\/$/, "")}/api`).replace(/\/api\/?$/, "/public/widget.js");
  useEffect(() => {
    const previousTheme = theme;
    setTheme("light");
    return () => {
      if (previousTheme) {
        setTheme(previousTheme);
      }
    };
  }, [setTheme, theme]);

  return (
    <div className="relative">
      {/* Sparkle overlay */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute w-1 h-1 bg-[#00AEEF] rounded-full opacity-40" style={{ left: "12%", top: "18%" }} />
        <div className="absolute w-1 h-1 bg-[#00AEEF] rounded-full opacity-30" style={{ left: "68%", top: "26%" }} />
        <div className="absolute w-1 h-1 bg-[#00AEEF] rounded-full opacity-25" style={{ left: "94%", top: "82%" }} />
        <div className="absolute w-1 h-1 bg-[#00AEEF] rounded-full opacity-35" style={{ left: "75%", top: "25%" }} />
        <div className="absolute w-1 h-1 bg-[#00AEEF] rounded-full opacity-30" style={{ left: "25%", top: "36%" }} />
        <div className="absolute w-1 h-1 bg-[#00AEEF] rounded-full opacity-20" style={{ left: "25%", top: "99%" }} />
        <div className="absolute w-1 h-1 bg-[#00AEEF] rounded-full opacity-40" style={{ left: "91%", top: "70%" }} />
        <div className="absolute w-1 h-1 bg-[#00AEEF] rounded-full opacity-30" style={{ left: "9%", top: "46%" }} />
        <div className="absolute w-1 h-1 bg-[#00AEEF] rounded-full opacity-35" style={{ left: "94%", top: "28%" }} />
        <div className="absolute w-1 h-1 bg-[#00AEEF] rounded-full opacity-25" style={{ left: "73%", top: "3%" }} />
        <div className="absolute w-1 h-1 bg-[#00AEEF] rounded-full opacity-30" style={{ left: "72%", top: "54%" }} />
        <div className="absolute w-1 h-1 bg-[#00AEEF] rounded-full opacity-35" style={{ left: "8%", top: "33%" }} />
        <div className="absolute w-1 h-1 bg-[#00AEEF] rounded-full opacity-25" style={{ left: "70%", top: "27%" }} />
        <div className="absolute w-1 h-1 bg-[#00AEEF] rounded-full opacity-30" style={{ left: "22%", top: "23%" }} />
        <div className="absolute w-1 h-1 bg-[#00AEEF] rounded-full opacity-40" style={{ left: "85%", top: "42%" }} />
        <div className="absolute w-1 h-1 bg-[#00AEEF] rounded-full opacity-20" style={{ left: "84%", top: "99%" }} />
        <div className="absolute w-1 h-1 bg-[#00AEEF] rounded-full opacity-35" style={{ left: "8%", top: "28%" }} />
        <div className="absolute w-1 h-1 bg-[#00AEEF] rounded-full opacity-30" style={{ left: "76%", top: "36%" }} />
        <div className="absolute w-1 h-1 bg-[#00AEEF] rounded-full opacity-25" style={{ left: "31%", top: "67%" }} />
        <div className="absolute w-1 h-1 bg-[#00AEEF] rounded-full opacity-30" style={{ left: "52%", top: "97%" }} />
        <div className="absolute w-1.5 h-1.5 bg-[#00AEEF] rounded-full opacity-20" style={{ left: "45%", top: "12%" }} />
        <div className="absolute w-1.5 h-1.5 bg-[#00AEEF] rounded-full opacity-15" style={{ left: "60%", top: "75%" }} />
        <div className="absolute w-1.5 h-1.5 bg-[#00AEEF] rounded-full opacity-20" style={{ left: "15%", top: "58%" }} />
        <div className="absolute w-1.5 h-1.5 bg-[#00AEEF] rounded-full opacity-15" style={{ left: "38%", top: "88%" }} />
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#00AEEF]/[0.03] blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#00AEEF]/[0.03] blur-[120px] rounded-full" />
      </div>

      <Header />
      <Home />
      <BrandCarousel />
      <Channels />
      <Features />
      <WhyChoose />
      <HowItWorks />
      <StaticPricing />
      <Footer />
      {/* <Platform data={data.platform_section} /> */}
      {/* <PricingPlan data={data.pricing_section} /> */}
      {/* <Testimonial data={data.testimonials_section} /> */}
      {/* <Faq data={data.faq_section} /> */}
      {/* <Connect data={data.contact_section} /> */}
      {/* <Footer data={data.footer_section} /> */}
      <TapTop />
      {widgetKey ? <FunnelWidgetScripts scriptSrc={scriptSrc} whatsappKey={null} chatbotKey={widgetKey} /> : null}
    </div>
  );
};

export default Landing;
