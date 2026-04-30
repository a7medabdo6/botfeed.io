"use client";

import { useChatTheme } from "@/src/hooks/useChatTheme";
import { useAppDispatch, useAppSelector } from "@/src/redux/hooks";
import { openPreview } from "@/src/redux/reducers/previewSlice";
import Images from "@/src/shared/Image";
import { MediaType, ProfileMediaAssetsProps } from "@/src/types/components/chat";
import { FileText, ImageIcon, MapPin, Maximize2, Mic, PlayCircle } from "lucide-react";
import { useState } from "react";

const ProfileMediaAssets = ({ media }: ProfileMediaAssetsProps) => {
  const { isCustom } = useChatTheme();
  const dispatch = useAppDispatch();
  const [activeTab, setActiveTab] = useState<MediaType>("images");
  const { userSetting } = useAppSelector((state) => state.setting);
  const userSettingData = userSetting?.data;

  const handleImageClick = (imageUrl: string) => {
    const allImages = Object.values(media || {})
      .flatMap((week) => week.images || [])
      .map((item) => item.fileUrl);

    const index = allImages.indexOf(imageUrl);
    dispatch(openPreview({ images: allImages, index: index >= 0 ? index : 0 }));
  };

  const tabs = [
    { id: "images", icon: <ImageIcon size={18} />, label: "Images" },
    { id: "videos", icon: <PlayCircle size={18} />, label: "Videos" },
    { id: "audios", icon: <Mic size={18} />, label: "Audio" },
    { id: "documents", icon: <FileText size={18} />, label: "Files" },
    { id: "locations", icon: <MapPin size={18} />, label: "Location" },
  ];

  const mediaWeeks = Object.values(media || {});

  const currentMedia = mediaWeeks
    .map((weekGroup) => ({
      week: weekGroup.week,
      items: weekGroup[activeTab] || [],
    }))
    .filter((group) => group.items.length > 0);

  const totalCount = mediaWeeks.reduce((acc, weekGroup) => {
    return acc + (weekGroup[activeTab]?.length || 0);
  }, 0);

  return (
    <div className="dark:border-none dark:bg-(--table-hover)! border border-gray-100 rounded-lg p-4 space-y-4" style={isCustom ? { backgroundColor: "color-mix(in srgb, var(--chat-theme-color), transparent 95%)" } : {}}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-slate-900 dark:text-white font-semibold">
          <ImageIcon size={18} style={isCustom ? { color: userSettingData?.theme_color == "null" ? "#00AEEF" : "var(--chat-theme-color)" } : {}} />
          <span>Media Assets</span>
        </div>
        <span className="flex items-center justify-center min-w-5 h-5 rounded-full bg-slate-100 dark:bg-(--card-color) text-slate-500 text-[10px] font-bold px-1.5">{totalCount}</span>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between bg-slate-50/50 dark:bg-(--card-color) p-1 rounded-lg">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as MediaType)}
            className={`
              flex flex-1 items-center justify-center p-2 rounded-lg transition-all
              ${activeTab === tab.id ? (isCustom ? "bg-white dark:bg-(--page-body-bg) shadow-sm" : "bg-white dark:bg-(--page-body-bg) shadow-sm text-primary") : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"}
            `}
            style={activeTab === tab.id && isCustom ? { color: userSettingData?.theme_color == "null" ? "#00AEEF" : "var(--chat-theme-color)" } : {}}
          >
            {tab.icon}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-2 font-semibold text-sm" style={isCustom ? { color: userSettingData?.theme_color == "null" ? "#00AEEF" : "var(--chat-theme-color)" } : {}}>
          <ImageIcon size={16} />
          <span>
            {tabs.find((t) => t.id === activeTab)?.label} ({totalCount})
          </span>
        </div>

        {currentMedia.length > 0 ? (
          <div className="space-y-6">
            {currentMedia.map((group, idx) => (
              <div key={idx} className="space-y-3">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{group.week}</p>
                <div className="grid grid-cols-3 gap-2">
                  {group.items.map((item) => (
                    <div key={item.id} className="aspect-square rounded-lg bg-slate-100 dark:bg-neutral-800 overflow-hidden cursor-pointer relative group" onClick={() => activeTab === "images" && handleImageClick(item.fileUrl)}>
                      {activeTab === "images" ? (
                        <>
                          <Images src={item.fileUrl} alt="Media" fill className="object-cover transition-transform duration-500 group-hover:scale-110" unoptimized />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Maximize2 size={24} className="text-white scale-75 group-hover:scale-100 transition-transform duration-300" />
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400">{tabs.find((t) => t.id === activeTab)?.icon}</div>
                      )}
                    </div>
                  ))}
                  
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 flex flex-col items-center justify-center gap-4 bg-slate-50/30 dark:bg-(--card-color) rounded-lg border border-dashed border-slate-200 dark:border-(--card-border-color)">
            <div className="p-4 bg-white dark:bg-(--dark-body) rounded-lg shadow-sm">
              <ImageIcon size={32} className="text-slate-200" />
            </div>
            <p className="text-sm font-semibold text-slate-400">No {activeTab}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileMediaAssets;
