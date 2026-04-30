/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, ReactNode } from "react";
import { useGetSettingsQuery } from "@/src/redux/api/settingsApi";
import { useAppDispatch, useAppSelector } from "@/src/redux/hooks";
import { setSetting } from "@/src/redux/reducers/settingSlice";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";

const API_URL = process.env.NEXT_PUBLIC_STORAGE_URL ?? "";

const resolveUrl = (url?: string): string => {
  if (!url) return "";
  return url.startsWith("http") ? url : `${API_URL}${url}`;
};

const DEFAULT_FAVICON = "/branding/botfeed-logo.png";

function applyFavicon(href: string) {
  if (typeof window === "undefined") return;

  const links = document.querySelectorAll("link[rel*='icon']");

  if (links.length > 0) {
    links.forEach((link: any) => {
      if (link.href !== href) link.href = href;
    });
  } else {
    const link = document.createElement("link");
    link.rel = "icon";
    link.href = href;
    document.head.appendChild(link);
  }
}

interface DynamicSettingsProviderProps {
  children: ReactNode;
}

const DynamicSettingsProvider = ({ children }: DynamicSettingsProviderProps) => {
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const { data: settingsData, isSuccess } = useGetSettingsQuery({});
  const { app_name, favicon_url, app_description, pageTitle, pageDescription } = useAppSelector((state) => state.setting);
  const [mounted, setMounted] = useState(false);
  const { setTheme } = useTheme();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    try {
      const cached = localStorage.getItem("app_settings");
      if (cached) {
        const parsed = JSON.parse(cached);
        const settingsToSet = parsed.data || parsed;
        dispatch(setSetting({ ...settingsToSet, maintenance_mode: false }));
      }
    } catch {}
  }, [dispatch]);

  useEffect(() => {
    if (settingsData) {
      const dataToSet = settingsData.data || settingsData;
      dispatch(setSetting(dataToSet));
    }
  }, [settingsData, dispatch]);

  useEffect(() => {
    if (mounted && settingsData?.data?.default_theme_mode) {
      const saved = localStorage.getItem("theme");
      if (!saved || saved === "system") {
        setTheme(settingsData.data.default_theme_mode);
      }
    }
  }, [mounted, settingsData, setTheme]);

  useEffect(() => {
    if (!mounted && !settingsData) return;

    const faviconHref = isSuccess ? resolveUrl(favicon_url) || DEFAULT_FAVICON : null;

    const applyAll = () => {
      const baseTitle = app_name || "Botfeed";
      const fullTitle = pageTitle 
        ? `${pageTitle} | ${baseTitle}`
        : `${baseTitle} | All-in-One WhatsApp Marketing & Automation Platform`;

      if (document.title !== fullTitle) {
        document.title = fullTitle;
      }

      const description = pageDescription || app_description;
      if (description) {
        let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
        if (!meta) {
          meta = document.createElement("meta");
          meta.setAttribute("name", "description");
          document.head.appendChild(meta);
        }
        if (meta.getAttribute("content") !== description) {
          meta.setAttribute("content", description);
        }
      }

      if (faviconHref) {
        applyFavicon(faviconHref);
      }
    };

    applyAll();

    const observer = new MutationObserver(applyAll);
    observer.observe(document.head, { childList: true, subtree: true });

    const interval = setInterval(applyAll, 2000); // Increased interval as observer handles most changes

    return () => {
      observer.disconnect();
      clearInterval(interval);
    };
  }, [app_name, app_description, favicon_url, isSuccess, pathname, mounted, settingsData, pageTitle, pageDescription]);

  return <>{children}</>;
};

export default DynamicSettingsProvider;
