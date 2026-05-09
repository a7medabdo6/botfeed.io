/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useContactInquiriesMutation } from "@/src/redux/api/contactApi";
import { Mail, Phone } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { ConnectProps } from "../../types/landingPage";

const Connect: React.FC<ConnectProps> = ({ data }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [inquiries] = useContactInquiriesMutation();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast.error(t("landing.connect.toast_fill"));
      return;
    }

    setLoading(true);
    try {
      const response = await inquiries(formData).unwrap();
      toast.success(response.message || t("landing.connect.toast_success"));
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error: any) {
      toast.error(error.message || t("landing.connect.toast_error"));
    }
    setLoading(false);
  };

  return (
    <section id="contact" className="bg-[#F8FAFC] py-[calc(40px+(100-40)*((100vw-320px)/(1920-320)))]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_1.3fr] lg:items-start">
          <div className="flex flex-col gap-6">
            <div>
              <span className="inline-block text-[14px] font-bold uppercase tracking-[0.2em] text-primary mb-3">
                {t("landing.connect.badge")}
              </span>
              <h2 className="text-[calc(22px+(38-22)*((100vw-320px)/(1920-320)))] font-extrabold leading-[1.15] tracking-tight text-[#0F172A] whitespace-pre-wrap">
                {data.title}
              </h2>
              <p className="mt-3 text-[15px] leading-relaxed text-[#64748B] max-w-md whitespace-pre-wrap">
                {data.subtitle} <br /> {data.description}
              </p>
            </div>

            <div className="flex flex-col gap-4">
              {data.phone_no && (
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#00AEEF10] text-primary">
                    <Phone size={18} strokeWidth={2.5} />
                  </div>
                  <span className="text-[15px] font-semibold text-[#0F172A]">{data.phone_no}</span>
                </div>
              )}
              {data.email && (
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#00AEEF10] text-primary">
                    <Mail size={18} strokeWidth={2.5} />
                  </div>
                  <span className="text-[15px] font-semibold text-[#0F172A]">{data.email}</span>
                </div>
              )}
            </div>
          </div>

          {data.form_enabled ? (
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 md:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.03)]">
              <form className="grid grid-cols-1 gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
                <div className="sm:col-span-1">
                  <input name="name" value={formData.name} onChange={handleChange} type="text" placeholder={t("landing.connect.placeholder_name")} className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3.5 text-[14px] text-[#0F172A] outline-none transition-all placeholder:text-[#94A3B8] focus:border-primary focus:ring-1 focus:ring-primary" />
                </div>
                <div className="sm:col-span-1">
                  <input name="email" value={formData.email} onChange={handleChange} type="email" placeholder={t("landing.connect.placeholder_email")} className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3.5 text-[14px] text-[#0F172A] outline-none transition-all placeholder:text-[#94A3B8] focus:border-primary focus:ring-1 focus:ring-primary" />
                </div>
                <div className="sm:col-span-2">
                  <input name="subject" value={formData.subject} onChange={handleChange} type="text" placeholder={t("landing.connect.placeholder_subject")} className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3.5 text-[14px] text-[#0F172A] outline-none transition-all placeholder:text-[#94A3B8] focus:border-primary focus:ring-1 focus:ring-primary" />
                </div>
                <div className="sm:col-span-2">
                  <textarea name="message" value={formData.message} onChange={handleChange} placeholder={t("landing.connect.placeholder_message")} rows={5} className="w-full resize-none rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3.5 text-[14px] text-[#0F172A] transition-all placeholder:text-[#94A3B8] focus:border-primary focus:ring-1 focus:ring-primary" />
                </div>
                <div className="sm:col-span-2">
                  <button disabled={loading} type="submit" className="w-full rounded-xl bg-primary px-8 py-3.5 text-[15px] font-semibold text-white transition-all hover:bg-[#0090C7] hover:shadow-[0_4px_16px_rgba(0,174,239,0.25)] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed">
                    {loading ? t("landing.connect.submitting") : t("landing.connect.submit")}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="w-full flex items-center justify-center p-12 bg-white rounded-2xl border-2 border-dashed border-[#E2E8F0]">
              <p className="text-[#94A3B8] font-medium">{t("landing.connect.form_disabled")}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Connect;
