/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Button } from "@/src/elements/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/src/elements/ui/dialog";
import { Input } from "@/src/elements/ui/input";
import { Label } from "@/src/elements/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/elements/ui/select";
import { cn } from "@/src/lib/utils";
import { useGetFormsQuery } from "@/src/redux/api/formBuilderApi";
import { ReplyMaterialFormModalProps, ReplyMaterialType } from "@/src/types/replyMaterial";
import { Bot, FileArchive, FileText, GitBranch, Image as ImageIcon, Layout, Loader2, ShoppingBag, Smile, Upload, Video, X, Zap } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";

const PLACEHOLDER: Record<ReplyMaterialType, string> = {
  text: "Enter your quick-reply message…",
  image: "",
  document: "",
  video: "",
  sticker: "",
  sequence: "",
  template: "",
  catalog: "",
  chatbot: "",
  flow: "Enter the message body to send with the flow…",
};

const TYPE_ICON: Record<ReplyMaterialType, React.ReactNode> = {
  text: <FileText size={18} className="text-primary" />,
  image: <ImageIcon size={18} className="text-blue-400" />,
  document: <FileArchive size={18} className="text-amber-400" />,
  video: <Video size={18} className="text-purple-400" />,
  sticker: <Smile size={18} className="text-pink-400" />,
  sequence: <Zap size={18} className="text-yellow-400" />,
  template: <Layout size={18} className="text-indigo-400" />,
  catalog: <ShoppingBag size={18} className="text-sky-400" />,
  chatbot: <Bot size={18} className="text-cyan-400" />,
  flow: <GitBranch size={18} className="text-orange-400" />,
};

const ReplyMaterialFormModal: React.FC<ReplyMaterialFormModalProps> = ({ isOpen, onClose, onSubmit, isLoading, config, editItem, wabaId }) => {
  const isEditMode = !!editItem;

  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [buttonText, setButtonText] = useState("");
  const [selectedFlowId, setSelectedFlowId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: formsData, isLoading: isLoadingForms } = useGetFormsQuery({ waba_id: wabaId, limit: 100 }, { skip: !isOpen || config.type !== "flow" || !wabaId });

  const publishedForms = formsData?.data?.filter((f: any) => f.meta_status === "PUBLISHED" || f.flow?.meta_status === "PUBLISHED") || [];

  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setName(editItem?.name ?? "");
      setContent(editItem?.content ?? "");
      setButtonText(editItem?.button_text ?? "");
      setSelectedFlowId(editItem?.flow_id ?? "");
      setFile(null);
      setPreview(editItem?.file_url ?? null);
    }
  }, [isOpen, editItem]);

  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const handleFileChange = (incoming: File | null) => {
    if (!incoming) return;
    setFile(incoming);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) handleFileChange(dropped);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append("name", name.trim());
    fd.append("type", config.type);

    if (config.type === "text" || config.type === "flow") {
      fd.append("content", content.trim());
    }

    if (config.type === "flow") {
      fd.append("button_text", buttonText.trim());
      fd.append("flow_id", selectedFlowId);
    }

    if (file) {
      fd.append("file", file);
    }
    await onSubmit(fd);
  };

  const resetAndClose = () => {
    setName("");
    setContent("");
    setButtonText("");
    setSelectedFlowId("");
    setFile(null);
    setPreview(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={!isLoading ? resetAndClose : undefined}>
      <DialogContent className="sm:max-w-lg p-0! overflow-hidden dark:border-(--card-border-color) bg-white dark:bg-(--card-color) rounded-lg shadow-2xl">
        <DialogHeader className="sm:px-6 px-4 pt-6 pb-0">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-lg bg-primary/5 dark:bg-primary/10 flex items-center justify-center">{TYPE_ICON[config.type]}</div>
            <div>
              <DialogTitle className="text-lg text-left rtl:text-right font-bold text-slate-900 dark:text-white tracking-tight">
                {isEditMode ? "Edit" : "Add"} {config.label}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-400 font-medium mt-0.5">{isEditMode ? "Update the details below" : `Create a new ${config.label.toLowerCase()} quick reply`}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="sm:px-6 px-4 pb-6 pt-0 space-y-4 max-h-[80vh] overflow-y-auto custom-scrollbar">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-slate-500">Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Welcome message" required disabled={isLoading} className="h-11 rounded-lg border-slate-200 dark:border-(--card-border-color) bg-slate-50 dark:bg-(--dark-body) focus:border-primary" />
          </div>

          {(config.type === "text" || config.type === "flow") && (
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-slate-500">Message Body</Label>
              <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder={PLACEHOLDER[config.type]} rows={4} required disabled={isLoading} className="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-(--card-border-color) bg-slate-50 dark:bg-(--dark-body) focus:outline-none focus:border-primary resize-none transition-colors text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600" />
            </div>
          )}

          {config.type === "flow" && (
            <>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-slate-500">Button Text</Label>
                <Input value={buttonText} onChange={(e) => setButtonText(e.target.value)} placeholder="e.g. Open Form" required disabled={isLoading} className="h-11 rounded-lg border-slate-200 dark:border-(--card-border-color) bg-slate-50 dark:bg-(--dark-body) focus:border-primary" />
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-slate-500">Select Flow</Label>
                <Select value={selectedFlowId} onValueChange={setSelectedFlowId} required disabled={isLoading || isLoadingForms}>
                  <SelectTrigger className="h-12! rounded-lg border-slate-200 dark:border-(--card-border-color) bg-slate-50 dark:bg-(--dark-body)">
                    <SelectValue placeholder={isLoadingForms ? "Loading flows..." : "Choose a published flow"} />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-(--card-color)">
                    {publishedForms.map((flow: any) => (
                      <SelectItem className="dark:hover:bg-(--table-hover)" key={flow._id} value={flow.flow?.flow_id || flow._id}>
                        {flow.name}
                      </SelectItem>
                    ))}
                    {publishedForms.length === 0 && !isLoadingForms && <div className="p-2 text-xs text-center text-slate-400 italic">No published flows found</div>}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {config.hasFile && (
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-slate-500">{isEditMode ? "Replace File (optional)" : "Upload File"}</Label>

              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                className={cn("relative h-36 rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all", dragOver ? "border-primary bg-primary/5" : "border-slate-200 dark:border-slate-700/50 bg-slate-50 dark:bg-(--dark-body) hover:border-primary/40 hover:bg-primary/5")}
              >
                {preview && config.type === "image" ? (
                  <Image src={preview} alt="preview" width={100} height={100} className="absolute inset-0 w-full h-full object-cover rounded-lg" />
                ) : preview && config.type !== "image" ? (
                  <div className="flex flex-col items-center gap-1.5 text-slate-400">
                    {TYPE_ICON[config.type]}
                    <p className="text-xs font-semibold">{file?.name ?? "File selected"}</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-slate-400">
                    <Upload size={24} />
                    <p className="text-xs font-semibold text-center px-4">
                      Drag & drop or <span className="text-primary">browse</span>
                    </p>
                    <p className="text-[10px] text-slate-300 dark:text-slate-600">{config.accept ?? "Any file"}</p>
                  </div>
                )}

                {(file || preview) && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                      setPreview(null);
                    }}
                    className="absolute top-2 ltr:right-2 rtl:left-2 w-6 h-6 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:text-red-500 shadow-sm z-10"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>

              <input ref={fileInputRef} type="file" accept={config.accept} className="hidden" onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)} />
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={resetAndClose} disabled={isLoading} className="flex-1 h-11 rounded-lg border-slate-200 dark:border-(--card-border-color) text-slate-600 dark:text-slate-300">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1 h-11 rounded-lg bg-primary text-white font-semibold shadow-lg shadow-primary/20 active:scale-95 transition-all">
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin ltr:mr-2 rtl:ml-2" />
                  Saving…
                </>
              ) : isEditMode ? (
                "Save Changes"
              ) : (
                "Create"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ReplyMaterialFormModal;
