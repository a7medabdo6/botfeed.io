"use client";

import { Facebook, Instagram, Linkedin, Twitter } from "lucide-react";
import Link from "next/link";

type FooterProps = {
  data?: unknown;
};

const Footer = ({ data: _data }: FooterProps) => {
  const quickLinks = [
    { label: "الرئيسية", href: "#home" },
    { label: "المميزات", href: "#features" },
    { label: "لماذا تختارنا", href: "#why-choose" },
    { label: "كيف نعمل", href: "#how-it-works" },
  ];

  const socialLinks = [
    { icon: <Twitter size={16} />, href: "#" },
    { icon: <Facebook size={16} />, href: "#" },
    { icon: <Instagram size={16} />, href: "#" },
    { icon: <Linkedin size={16} />, href: "#" },
  ];

  return (
    <footer className="relative mt-16 px-4 sm:px-6 lg:px-8 pb-8">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-3xl border border-[#E2E8F0] bg-white/80 backdrop-blur-sm p-8 md:p-10 shadow-[0_10px_40px_rgba(0,174,239,0.08)]">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            <div>
              <h3 className="text-[26px] font-extrabold text-[#0F172A]">botfeed.io</h3>
              <p className="mt-2 text-[15px] text-[#64748B] max-w-md">
                منصة ذكاء اصطناعي لإدارة محادثات عملائك وتحويل الرسائل إلى مبيعات.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-6">
              {quickLinks.map((item) => (
                <Link key={item.label} href={item.href} className="text-[15px] font-medium text-[#475569] hover:text-primary transition-colors">
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-[14px] text-[#64748B]">© 2026 botfeed.io. جميع الحقوق محفوظة.</p>
            <div className="flex items-center gap-2">
              {socialLinks.map((item, idx) => (
                <a
                  key={idx}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl border border-[#E2E8F0] text-[#64748B] hover:text-primary hover:border-primary/30 hover:bg-primary/5 flex items-center justify-center transition-all"
                >
                  {item.icon}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
