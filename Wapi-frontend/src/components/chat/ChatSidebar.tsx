/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "@/src/elements/ui/button";
import { Input } from "@/src/elements/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/elements/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/src/elements/ui/tooltip";
import { cn } from "@/src/lib/utils";
import { useGetRecentChatsQuery, useGetUnifiedChatsQuery, useTogglePinChatMutation, useToggleWebPinMutation } from "@/src/redux/api/chatApi";
import { useGetWabaPhoneNumbersQuery } from "@/src/redux/api/whatsappApi";
import { useAppDispatch, useAppSelector } from "@/src/redux/hooks";
import { ChatChannel, rehydrateChat, selectChat, selSelectPhoneNumber, setLeftSidebartoggle } from "@/src/redux/reducers/messenger/chatSlice";
import { RootState } from "@/src/redux/store";
import ConfirmModal from "@/src/shared/ConfirmModal";
import { RecentChatResponseItem } from "@/src/types/components/chat";
import { useChatSelection } from "@/src/utils/hooks/useChatSelection";
import useDebounce from "@/src/utils/hooks/useDebounce";
import { useNotifications } from "@/src/utils/hooks/useNotifications";
import { maskSensitiveData } from "@/src/utils/masking";
import { BellRing, CheckSquare, Filter, Globe, ListChecks, MessageSquare, Search, Trash2, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import ChatFilterModal from "./ChatFilterModal";
import ChatSidebarItem from "./ChatSidebarItem";
import { ChatSidebarSkeleton } from "./ChatSkeleton";
import { NotificationSettingsModal } from "./NotificationSettingsModal";
const ChatSidebar = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const { selectedPhoneNumberId, selectedChat, isRehydrated, isMobileScreen, selectedChannel } = useAppSelector((state: RootState) => state.chat);
  const { app_name } = useAppSelector((state: RootState) => state.setting);
  const { user } = useAppSelector((state) => state.auth);
  const { is_demo_mode } = useAppSelector((state) => state.setting);
  const { selectedWorkspace } = useAppSelector((state) => state.workspace);
  const selectedWabaId = selectedWorkspace?.waba_id;
  const isAgent = user?.role === "agent";
  const selectedChatId = selectedChat?.contact.id;
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 500);
  const [activeTab, setActiveTab] = useState("all");
  const { permission } = useNotifications();
  const searchParams = useSearchParams();
  const contactIdFromQuery = searchParams.get("contact_id");

  const goChannel = (ch: ChatChannel) => {
    const p = new URLSearchParams(searchParams.toString());
    p.set("channel", ch);
    const qs = p.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };
  const { userSetting } = useAppSelector((state) => state.setting);
  const userSettingData = userSetting?.data;

  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filters, setFilters] = useState<{ startDate?: string; endDate?: string; tagLabel?: string; hasNotes?: boolean; agentId?: string }>({});
  const activeFilterCount = Object.keys(filters).length;

  const { data: phoneNumbersData, isLoading: isLoadingPhones } = useGetWabaPhoneNumbersQuery(selectedWabaId || "", { skip: !selectedWabaId });

  const phoneNumbers = useMemo(() => {
    const list = (phoneNumbersData as any)?.data || [];
    return list;
  }, [phoneNumbersData]);

  useEffect(() => {
    dispatch(rehydrateChat());
  }, [dispatch]);

  useEffect(() => {
    if (isRehydrated && phoneNumbers.length > 0) {
      const isCurrentlySelectedValid = selectedPhoneNumberId && phoneNumbers.find((p: any) => String(p.id) === String(selectedPhoneNumberId));
      if (!isCurrentlySelectedValid) {
        const firstId = String(phoneNumbers[0].id);
        dispatch(selSelectPhoneNumber(firstId));
      }
    }
  }, [phoneNumbers, selectedPhoneNumberId, dispatch, isRehydrated]);

  const isWhatsappOnly = selectedChannel === "whatsapp";
  const useUnified = selectedChannel === "all" || selectedChannel === "web";

  const { data: waChatsData, isLoading: waLoading } = useGetRecentChatsQuery(
    {
      search: debouncedSearch || undefined,
      whatsapp_phone_number_id: selectedPhoneNumberId || undefined,
      start_date: filters.startDate,
      end_date: filters.endDate,
      tags: filters.tagLabel,
      has_notes: filters.hasNotes,
      agent_id: filters.agentId,
      last_message_read: activeTab === "unread" ? false : undefined,
      is_assigned: activeTab === "assigned" ? true : activeTab === "unassigned" ? false : undefined,
    },
    { skip: !selectedPhoneNumberId || !isWhatsappOnly }
  );

  const { data: unifiedChatsData, isLoading: unifiedLoading } = useGetUnifiedChatsQuery(
    {
      channel: selectedChannel,
      search: debouncedSearch || undefined,
      whatsapp_phone_number_id: isWhatsappOnly ? selectedPhoneNumberId || undefined : undefined,
      start_date: filters.startDate,
      end_date: filters.endDate,
      tags: filters.tagLabel,
      has_notes: filters.hasNotes,
      agent_id: filters.agentId,
      last_message_read: activeTab === "unread" ? false : undefined,
      is_assigned: activeTab === "assigned" ? true : activeTab === "unassigned" ? false : undefined,
    },
    { skip: !useUnified }
  );

  const chatsData = isWhatsappOnly ? waChatsData : unifiedChatsData;
  const isLoading = isWhatsappOnly ? waLoading : unifiedLoading;

  const [togglePinChat] = useTogglePinChatMutation();
  const [toggleWebPin] = useToggleWebPinMutation();

  const sortedChats = useMemo(() => {
    if (!chatsData?.data) return [];

    return [...chatsData.data].sort((a, b) => {
      if (a.is_pinned && !b.is_pinned) return -1;
      if (!a.is_pinned && b.is_pinned) return 1;

      const dateA = new Date(a.lastMessage.createdAt).getTime();
      const dateB = new Date(b.lastMessage.createdAt).getTime();
      return dateB - dateA;
    });
  }, [chatsData]);

  useEffect(() => {
    if (contactIdFromQuery && sortedChats.length > 0 && isRehydrated) {
      const targetChat = sortedChats.find((c) => c.contact.id === contactIdFromQuery);
      if (targetChat && selectedChatId !== contactIdFromQuery) {
        handleSelectChat(targetChat);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contactIdFromQuery, sortedChats, isRehydrated]);

  const handleTogglePin = async (e: React.MouseEvent, chat: RecentChatResponseItem) => {
    e.stopPropagation();
    try {
      if (chat.channel === "web") {
        await toggleWebPin({ conversation_id: chat.contact.id }).unwrap();
      } else {
        await togglePinChat({ contact_id: chat.contact.id, phone_number: chat.contact.number }).unwrap();
      }
    } catch (error) {
      console.error("Failed to toggle pin chat:", error);
    }
  };

  const handleSelectChat = (chat: RecentChatResponseItem) => {
    dispatch(selectChat(chat));
    if (window.innerWidth <= 991) {
      dispatch(
        setLeftSidebartoggle({
          isMobile: true,
          forceState: false,
        })
      );
    }
  };

  const handlePhoneNumberChange = (value: string) => {
    dispatch(selSelectPhoneNumber(value));
  };

  const handleSidebar = () => {
    dispatch(
      setLeftSidebartoggle({
        isMobile: window.innerWidth <= 991,
      })
    );
  };

  const { isSelectionMode, selectedContactIds, isDeleteModalOpen, isDeleting, setIsDeleteModalOpen, handleToggleSelectionMode, handleToggleChatSelection, handleSelectAll, handleDeleteChats } = useChatSelection({
    workspaceId: selectedWorkspace?._id,
    sortedChats,
  });

  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);

  return (
    <div className="[@media(max-width:1024px)]:z-50 w-full max-w-[320px] sm:min-w-[320px] sm:max-w-[320px] border rounded-lg border-gray-100 dark:border-(--card-border-color) flex flex-col bg-white dark:bg-(--card-color)! [@media(max-width:639px)]:left-0! [@media(max-width:639px)]:h-[calc(100vh-107px)]!  [@media(max-width:991px)]:absolute [@media(max-width:991px)]:bg-white dark:[@media(max-width:991px)]:bg-(--page-body-bg) [@media(max-width:991px)]:left-0 [@media(max-width:991px)]:h-[calc(100vh-82px-16px-16px)]" style={{ backgroundColor: userSettingData?.bg_color == "null" ? "#FFFFFF" : userSettingData?.bg_color ? "color-mix(in srgb, var(--chat-theme-color) , white 92%)" : "var(--chat-bg-color)" }}>
      <div className="p-4 pb-0 border-b border-gray-200 dark:border-(--card-border-color) space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">{isSelectionMode ? `${selectedContactIds.length} Selected` : "Chats"}</h2>
          <div className="flex gap-2">
            {isSelectionMode ? (
              <div className="flex gap-1 animate-in fade-in slide-in-from-right-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button onClick={handleSelectAll} variant="ghost" size="icon" className="h-8 w-8 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-(--chat-theme-color) transition-all">
                      <ListChecks size={18} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-primary/80">
                    <p>Select All</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button onClick={() => setIsDeleteModalOpen(true)} disabled={selectedContactIds.length === 0} variant="ghost" size="icon" className="h-8 w-8 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg text-slate-400 hover:text-rose-600 transition-all disabled:opacity-50">
                      <Trash2 size={18} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-red-500">
                    <p>Delete Selected</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button onClick={handleToggleSelectionMode} variant="ghost" size="icon" className="h-8 w-8 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-600 transition-all">
                      <X size={18} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-slate-700">
                    <p>Cancel</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            ) : (
              <>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button onClick={handleToggleSelectionMode} variant="ghost" size="icon" className="h-8 w-8 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-(--chat-theme-color) transition-all">
                      <CheckSquare size={18} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-primary/80">
                    <p>Select Chats</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button onClick={() => setIsNotificationModalOpen(true)} variant="ghost" size="icon" className={cn("h-8 w-8 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-(--chat-theme-color) transition-all", permission !== "granted" && "text-amber-500 hover:text-amber-600 animate-pulse bg-amber-50 dark:bg-amber-500/10")}>
                      <BellRing size={18} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-primary/80">
                    <p>Notification Settings</p>
                  </TooltipContent>
                </Tooltip>
              </>
            )}
            {isMobileScreen && (
              <Button onClick={handleSidebar} variant="ghost" size="icon" className="h-8 w-8 hover:bg-slate-100 dark:hover:bg-(--table-hover) rounded-lg">
                <X size={18} className="text-slate-600 dark:text-gray-500" />
              </Button>
            )}
          </div>
        </div>

        <div className="flex gap-1 rounded-lg bg-slate-100 dark:bg-(--page-body-bg) p-0.5">
          {([
            { id: "all" as ChatChannel, label: "All", icon: <MessageSquare size={13} /> },
            { id: "whatsapp" as ChatChannel, label: "WhatsApp", icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.611.611l4.458-1.495A11.943 11.943 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22a9.94 9.94 0 01-5.39-1.587l-.376-.227-2.645.887.887-2.645-.227-.376A9.94 9.94 0 012 12C2 6.486 6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z"/></svg> },
            { id: "web" as ChatChannel, label: "Web", icon: <Globe size={13} /> },
          ]).map((ch) => (
            <button
              key={ch.id}
              onClick={() => goChannel(ch.id)}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-semibold transition-all",
                selectedChannel === ch.id
                  ? "bg-white dark:bg-(--card-color) text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
              )}
            >
              {ch.icon}
              {ch.label}
            </button>
          ))}
        </div>

        {selectedChannel === "whatsapp" && (
          !isRehydrated ? (
            <div className="w-full h-10 bg-slate-50 dark:bg-(--page-body-bg) rounded-lg" />
          ) : (
            <Select value={selectedPhoneNumberId?.toString() || ""} onValueChange={handlePhoneNumberChange}>
              <SelectTrigger className="w-full h-8 bg-(--input-color) dark:border-none dark:bg-(--page-body-bg) dark:hover:bg-(--page-body-bg) border dark:border-(--card-border-color) rounded-lg focus:ring-0 dark:[@media(max-width:991px)]:bg-(--table-hover) dark:hover:[@media(max-width:991px)]:bg-(--table-hover)">
                <SelectValue>{selectedPhoneNumberId ? maskSensitiveData(phoneNumbers.find((p: any) => String(p.id) === String(selectedPhoneNumberId))?.display_phone_number || phoneNumbers.find((p: any) => String(p.id) === String(selectedPhoneNumberId))?.phone_number || "", "phone", is_demo_mode) : isLoadingPhones ? "Loading numbers..." : "Select Phone Number"}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {phoneNumbers.map((phone: any, index: number) => (
                  <SelectItem className="dark:bg-(--page-body-bg)" key={index} value={String(phone.id)}>
                    {maskSensitiveData(phone.display_phone_number, "phone", is_demo_mode) || maskSensitiveData(phone.phone_number, "phone", is_demo_mode) || "Unknown Number"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )
        )}

        <div className="flex gap-2">
          <div className="relative group flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors" size={16} />
            <Input placeholder="Search interactions" className="pl-10 bg-(--input-color) border dark:bg-(--page-body-bg) h-9 rounded-lg focus-visible:ring-1 focus-visible:ring-sky-500 transition-all font-medium dark:[@media(max-width:991px)]:bg-(--table-hover) focus:dark:[@media(max-width:991px)]:bg-(--table-hover) dark:hover:[@media(max-width:991px)]:bg-(--card-color)" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          <Button variant="ghost" size="icon" onClick={() => setIsFilterModalOpen(true)} className={`h-9 w-9 rounded-lg border border-transparent ${activeFilterCount > 0 ? "bg-sky-100 text-(--chat-theme-color) dark:bg-sky-900/30 dark:text-(--chat-theme-color)" : "bg-slate-50 text-slate-500 dark:bg-(--page-body-bg) dark:text-gray-500 hover:bg-slate-100 dark:hover:bg-(--table-hover)"}`} style={activeFilterCount > 0 ? { color: "var(--chat-theme-color)", backgroundColor: "color-mix(in srgb, var(--chat-theme-color), transparent 90%)" } : {}}>
            <div className="relative">
              <Filter size={16} />
              {activeFilterCount > 0 && <span className="absolute -top-1.5 -right-1.5 h-3 w-3 bg-sky-500 rounded-full border border-white dark:border-neutral-900" />}
            </div>
          </Button>
        </div>

        <div className="flex gap-2 overflow-x-auto py-1.5 no-scrollbar table-custom-scrollbar">
          {[
            { id: "all", label: "All" },
            { id: "unread", label: "Unread" },
            { id: "active", label: "Active" },
            { id: "assigned", label: "Assigned" },
            { id: "unassigned", label: "Unassigned" },
          ].map((tab) => (
            <Button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                px-4 py-0! h-8! rounded-full text-xs font-bold transition-all whitespace-nowrap
                ${activeTab === tab.id ? "text-white shadow-sm" : "bg-slate-100 text-slate-500 dark:bg-(--page-body-bg) dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-(--table-hover)"}
              `}
              style={activeTab === tab.id ? { backgroundColor: userSettingData?.theme_color == "null" ? "#00AEEF" : "var(--chat-theme-color)" } : {}}
            >
              {tab.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-2 flex flex-col gap-2">
        {isLoading ? (
          <ChatSidebarSkeleton />
        ) : sortedChats.length === 0 ? (
          <div className="text-center p-8 dark:text-gray-400 text-slate-500 text-sm flex flex-col items-center gap-2">
            <span className="p-3 bg-slate-50 dark:bg-(--page-body-bg) rounded-full">
              <Search size={20} className="text-slate-400" />
            </span>
            <p>No chats found</p>
          </div>
        ) : (
          sortedChats.map((chat: RecentChatResponseItem, index: number) => <ChatSidebarItem key={index} chat={chat} isSelected={selectedContactIds.includes(chat.contact.id)} isSelectionMode={isSelectionMode} selectedChatId={selectedChatId} isAgent={isAgent} user={user} app_name={app_name || "W"} selectedPhoneNumberId={selectedPhoneNumberId || ""} onSelect={handleSelectChat} onToggleSelection={handleToggleChatSelection} onTogglePin={handleTogglePin} />)
        )}
      </div>
      <ChatFilterModal isOpen={isFilterModalOpen} onClose={() => setIsFilterModalOpen(false)} onApply={setFilters} initialFilters={filters} />
      <NotificationSettingsModal isOpen={isNotificationModalOpen} onClose={() => setIsNotificationModalOpen(false)} />
      <ConfirmModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={handleDeleteChats} isLoading={isDeleting} title={selectedContactIds.length > 1 ? `Delete ${selectedContactIds.length} Chats?` : "Delete Chat?"} subtitle={selectedContactIds.length > 1 ? `Are you sure you want to delete these ${selectedContactIds.length} conversations? This action cannot be undone.` : "Are you sure you want to delete this conversation? This action cannot be undone."} confirmText="Delete" variant="danger" />
    </div>
  );
};

export default ChatSidebar;
