"use client";

import { ROUTES } from "@/src/constants";
import { useAppSelector } from "@/src/redux/hooks";
import { BadgeCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useRef } from "react";
import type { Swiper as SwiperType } from "swiper";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { PricingPlanProps } from "../../types/landingPage";
import Image from "next/image";
import CurrencyValue from "@/src/shared/CurrencyValue";
import { useTranslation } from "react-i18next";

const billingCycleTKey = (raw?: string) => {
  const c = (raw || "monthly").toLowerCase();
  if (c === "monthly") return "per_month" as const;
  if (c === "yearly") return "per_year" as const;
  if (c === "lifetime") return "per_lifetime" as const;
  if (c === "trial") return "per_trial" as const;
  return "per_user" as const;
};

const PricingPlan: React.FC<PricingPlanProps> = ({ data }) => {
  const { t } = useTranslation();
  const router = useRouter();
  const swiperRef = useRef<SwiperType | null>(null);
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  const plans = (data.plans || [])
    .map((p) => {
      const planDoc = p._id;
      if (!planDoc) return null;

      const featureLimits = planDoc.features || {};
      const yn = (v: boolean | undefined) => (v ? t("landing.pricing.included") : t("landing.pricing.not_included"));
      const formattedFeatures = [
        { label: t("plan.features.contacts"), value: featureLimits.contacts },
        { label: t("plan.features.campaigns"), value: featureLimits.campaigns },
        { label: t("plan.features.staff"), value: featureLimits.staff },
        { label: t("plan.features.conversations"), value: featureLimits.conversations },
        { label: t("plan.features.ai_prompts"), value: featureLimits.ai_prompts },
        { label: t("plan.features.bot_flow"), value: featureLimits.bot_flow },
        { label: t("plan.features.rest_api"), value: yn(featureLimits.rest_api) },
        { label: t("plan.features.whatsapp_webhook"), value: yn(featureLimits.whatsapp_webhook) },
      ].filter((f) => f.value !== undefined);

      const cycleLabel = t(`landing.pricing.${billingCycleTKey(planDoc.billing_cycle)}`);

      return {
        name: planDoc.name,
        description:
          planDoc.name.toLowerCase() === "pro"
            ? t("landing.pricing.plan_pro_desc")
            : t("landing.pricing.plan_default_desc"),
        price: planDoc.price,
        currencyCode: planDoc?.currency,
        priceSuffix: t("landing.pricing.price_per", { cycle: cycleLabel }),
        features: formattedFeatures,
        isPopular: planDoc.name.toLowerCase() === "pro",
        is_featured: planDoc.is_featured,
      };
    })
    .filter(Boolean);

  if (plans.length === 3) {
    const featuredIdx = plans.findIndex((p) => p && p.is_featured);
    if (featuredIdx !== -1 && featuredIdx !== 1) {
      const featured = plans[featuredIdx];
      plans.splice(featuredIdx, 1);
      plans.splice(1, 0, featured);
    }
  }

  return (
    <section
      id="pricing"
      className="bg-[#F0F9FF] py-[calc(60px+(140-60)*((100vw-320px)/(1920-320)))] pb-0"
      style={{ overflowX: "clip" }}
    >
      <div className="mx-[calc(16px+(195-16)*((100vw-320px)/(1920-320)))]">
      <div style={{justifyContent: "center",
    alignItems: "center",
    display: "flex",
    flexDirection: "column"}} className="flex flex-col gap-[calc(20px+(40-20)*((100vw-320px)/(1920-320)))]">
            <div style={{justifyContent: "center",
    alignItems: "center",
    display: "flex",
    flexDirection: "column"}} className="[@media(max-width:1024px)]:text-center">
              <span className="text-[14px] font-bold uppercase tracking-[0.2em] text-primary">
                {data.badge || t("landing.pricing.badge_fallback")}
              </span>
              <h2 className="mt-4 text-[calc(28px+(56-28)*((100vw-320px)/(1920-320)))] font-extrabold leading-[1.1] tracking-tight text-[#0F172A] whitespace-pre-wrap">
                {data.title || t("landing.pricing.title_fallback")}
              </h2>
              <p className="mt-6 text-[18px] leading-relaxed text-[#64748B] whitespace-pre-wrap">
                {data.description || t("landing.pricing.desc_fallback")}
              </p>
            </div>

            <div className="flex items-center gap-4 mt-4 [@media(max-width:1024px)]:justify-center">
              <div className="flex -space-x-3 transition-all duration-300">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full border-2 border-white overflow-hidden bg-gray-100 shadow-sm hover:scale-110 hover:z-10 transition-transform"
                  >
                    <Image
                      src={`https://i.pravatar.cc/100?img=${i + 10}`}
                      alt="user"
                      className="w-full h-full object-cover"
                      width={100}
                      height={100}
                      unoptimized
                    />
                  </div>
                ))}
              </div>
              <div className="flex flex-col">
                <p className="text-sm font-bold text-[#0F172A] leading-tight">
                  {t("landing.pricing.rated", { rating: "4.9" })}
                </p>
                <p className="text-[12px] text-[#64748B]">
                  {t("landing.pricing.customers", { count: data.subscribed_count || "0" })}
                </p>
              </div>
            </div>
          </div>
        <div className="w-full max-w-6xl mx-auto px-0 md:px-4  lg:items-center">
         

          <div className="relative w-full py-6 overflow-hidden">
            <Swiper
              onSwiper={(swiper) => (swiperRef.current = swiper)}
              modules={[Pagination, Autoplay, Navigation]}
              spaceBetween={24}
              slidesPerView={1}
              centeredSlides={false}
              breakpoints={{
                640: { slidesPerView: 1, spaceBetween: 20 },
                1024: { slidesPerView: 2, spaceBetween: 30 },
                1280: { slidesPerView: 3, spaceBetween: 30 },
              }}
              grabCursor={true}
              pagination={{
                clickable: true,
                dynamicBullets: true,
              }}
              className="pricing-swiper pb-10! overflow-x-visible! overflow-y-visible!"
            >
              {plans.map((plan, idx) => {
                return (
                  <SwiperSlide
                    key={idx}
                    className="h-auto! flex! max-w-76.5 flex-col!"
                  >
                    <div
                      className={`relative flex flex-col flex-1 rounded-[35px] transition-all duration-500 ${plan!.is_featured ? "bg-primary p-1  z-10" : "bg-white border border-[#E2E8F0] shadow-[0_10px_40px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] hover:-translate-y-1"}`}
                      style={
                        plan!.is_featured
                          ? { transform: "translateY(-8px)" }
                          : {}
                      }
                    >
                      {plan!.is_featured && (
                        <div className="py-3 text-center">
                          <span className="text-[12px] font-bold uppercase tracking-[0.2em] text-white">
                            {t("landing.pricing.most_popular_plan")}
                          </span>
                        </div>
                      )}

                      <div
                        className={`flex flex-col flex-1 p-[calc(20px+(28-20)*((100vw-320px)/(1920-320)))] ${plan!.is_featured ? "bg-white rounded-[32px]" : ""}`}
                      >
                        <div className="mb-6">
                          <h3 className="text-[22px] font-bold text-[#0F172A]">
                            {plan!.name}
                          </h3>
                          <p className="mt-1.5 text-[14px] text-[#64748B] font-medium opacity-80">
                            {plan!.description}
                          </p>
                          <div className="mt-5 flex items-baseline gap-1.5">
                            <CurrencyValue
                              amount={plan!.price}
                              fromCode={plan!.currencyCode?.code}
                              className="text-[calc(28px+(40-28)*((100vw-320px)/(1920-320)))] font-extrabold text-[#0F172A] tracking-tight"
                              fallbackSymbol={
                                plan!.currencyCode === "INR" ? "₹" : "$"
                              }
                            />
                            <span className="text-[15px] text-[#64748B] font-medium">{plan!.priceSuffix}</span>
                          </div>
                        </div>

                        <div className="flex-1 space-y-3.5 mb-8">
                          {plan!.features.map((feature, fIdx) => (
                            <div key={fIdx} className="flex items-center gap-3">
                              <BadgeCheck
                                size={18}
                                className="text-primary shrink-0 opacity-80"
                              />
                              <p className="text-[14px] text-[#475569]">
                                <span className="text-[#64748B] opacity-90">
                                  {feature.label}:{" "}
                                </span>
                                <span className="font-bold text-[#1E293B] ml-1">
                                  {feature.value}
                                </span>
                              </p>
                            </div>
                          ))}
                        </div>

                        <div className="mt-auto space-y-3">
                          <button
                            onClick={() => {
                              if (isAuthenticated) {
                                router.push(
                                  user?.role === "agent"
                                    ? "/chat"
                                    : ROUTES.Subscription,
                                );
                              } else {
                                router.push(ROUTES.Login);
                              }
                            }}
                            className={`w-full rounded-xl py-3 px-3 text-[15px] font-bold transition-all duration-300 ${plan!.is_featured ? "bg-primary text-white shadow-lg shadow-primary/20 hover:bg-[#0090C7]" : "bg-primary text-white hover:bg-[#0090C7]"}`}
                          >
                            {t("landing.pricing.choose_plan")}
                          </button>
                          {plan!.is_featured && (
                            <p className="text-center text-[13px] text-[#64748B] font-medium">
                              {t("landing.pricing.or_contact_sales")}{" "}
                              <a
                                href="#"
                                className="text-[#0F172A] font-bold hover:text-primary transition-colors border-b border-[#0F172A]/20 hover:border-primary"
                              >
                                {t("landing.pricing.contact_sales")}
                              </a>
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </SwiperSlide>
                );
              })}
            </Swiper>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingPlan;
