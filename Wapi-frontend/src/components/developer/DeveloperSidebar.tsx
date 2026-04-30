"use client";

import { cn } from "@/src/lib/utils";
import { DeveloperSidebarData } from "@/src/types/developer";
import { Code2, FileText, LayoutDashboard, MessageSquare, Send, Settings, Terminal, Users } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

const DeveloperSidebar: React.FC<DeveloperSidebarData> = ({ activeTab, onTabChange }) => {
  const { t } = useTranslation();

  const menuItems = [
    {
      id: "conversational",
      title: t("developer.conversational_api"),
      desc: t("developer.conversational_api_desc"),
      icon: <MessageSquare size={20} />,
    },
    {
      id: "template",
      title: t("developer.template_api"),
      desc: t("developer.template_api_desc"),
      icon: <FileText size={20} />,
    },
    {
      id: "campaign",
      title: "Campaign API",
      desc: "Send bulk messages for marketing campaigns",
      icon: <Send size={20} />,
    },
    {
      id: "contacts",
      title: "Contact API",
      desc: "Manage and organize your contact list",
      icon: <Users size={20} />,
    },
    {
      id: "infrastructure",
      title: "Infrastructure",
      desc: "Configure system and messaging settings",
      icon: <Settings size={20} />,
    },
    {
      id: "dashboard",
      title: t("developer.api_keys"),
      desc: t("developer.api_keys_desc"),
      icon: <LayoutDashboard size={20} />,
    },
  ];

  return (
    <div className="w-72 lg:w-80 border-r border-slate-200 dark:border-(--card-border-color) bg-white dark:bg-(--card-color) flex flex-col h-full overflow-hidden shadow-sm">
      <div className="p-8 pb-2 flex items-center space-x-4">
        <div className="w-14 h-14 rounded-lg bg-(--light-primary) dark:bg-sky-500/10 flex items-center justify-center text-primary border border-sky-100 dark:border-sky-500/20 shadow-sm">
          <Terminal size={30} className="text-primary" />
        </div>
        <div>
          <h2 className="text-[18px] font-bold text-slate-900 dark:text-white">{t("developer.title")}</h2>
          <p className="text-[13px] text-slate-500 dark:text-gray-400 mt-1">{t("developer.subtitle")}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-2 custom-scrollbar">
        <p className="text-[11px] font-bold text-slate-400 dark:text-gray-500 px-4 mb-3 tracking-wider uppercase">{t("developer.api_types")}</p>

        {menuItems.map((item) => (
          <button key={item.id} onClick={() => onTabChange(item.id)} className={cn("w-full text-left p-3 rounded-xl flex items-center gap-4 transition-all duration-200 group relative", activeTab === item.id ? "bg-sky-50 dark:bg-sky-500/10 text-primary border border-sky-100 dark:border-sky-500/20" : "text-slate-600 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-(--table-hover)")}>
            <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center transition-colors shadow-xs", activeTab === item.id ? "bg-white dark:bg-primary text-primary dark:text-white" : "bg-slate-100 dark:bg-(--dark-body) text-slate-400 dark:text-gray-500 group-hover:bg-white dark:group-hover:bg-(--card-color)")}>{item.icon}</div>
            <div className="flex-1 min-w-0">
              <p className={cn("font-semibold text-sm truncate", activeTab === item.id ? "text-primary-dark dark:text-primary" : "text-slate-900 dark:text-white")}>{item.title}</p>
              <p className="text-xs text-slate-500 dark:text-gray-500 break-word mt-0.5">{item.desc}</p>
            </div>
            {activeTab === item.id && <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-l-full shadow-sm" />}
          </button>
        ))}
      </div>

      <div className="p-3 mt-auto">
        <button className="w-full h-12 bg-sky-50 dark:bg-sky-500/10 text-primary border border-sky-100 dark:border-sky-500/20 rounded-lg flex items-center justify-center gap-3 font-semibold text-sm hover:bg-sky-100 dark:hover:bg-sky-500/20 transition-colors shadow-sm">
          <Code2 size={18} />
          {t("developer.documentation_v1")}
        </button>
      </div>
    </div>
  );
};

export default DeveloperSidebar;
