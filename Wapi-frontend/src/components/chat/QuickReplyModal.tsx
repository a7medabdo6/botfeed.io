"use client";

import { Button } from "@/src/elements/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/src/elements/ui/dialog";
import { QuickReplyModalProps } from "@/src/types/components/chat";
import { Check, Copy, MessageSquare, MessageSquareQuote, Send, X } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";

const QUICK_REPLIES = ["Hello! How can I help you today?", "Thank you for contacting us. We will get back to you shortly.", "Your order has been confirmed.", "Our support team is currently busy. Please wait a moment.", "Can you please provide your order ID?", "Is there anything else I can assist you with?", "Have a great day!"];

const QuickReplyModal: React.FC<QuickReplyModalProps> = ({ isOpen, onClose, onSelect, onDirectSend }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (text: string, index: number) => {
    onSelect(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
    toast.success("Copied to input field");
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-150 overflow-hidden bg-white dark:bg-(--card-color) border-none shadow-2xl p-0! flex flex-col max-h-[85vh]">
        <div className="p-4 flex flex-col flex-1 overflow-hidden">
          <DialogHeader className="shrink-0 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-lg bg-sky-100 dark:bg-(--table-hover) flex items-center justify-center text-primary">
                <MessageSquareQuote size={32} />
              </div>
              <div className="text-left">
                <DialogTitle className="text-xl font-bold tracking-tight text-primary">Quick Replies</DialogTitle>
                <DialogDescription className="text-slate-500 dark:text-gray-500">Select a pre-defined message to send or copy to input.</DialogDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose} className="rounded-lg ml-auto dark:hover:bg-(--table-hover)">
                <X size={20} />
              </Button>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto custom-scrollbar [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] pr-2">
            <div className="space-y-4">
              <div className="space-y-3">
                {QUICK_REPLIES.map((message, index) => (
                  <div key={index} className="group relative p-4 rounded-lg border border-slate-100 dark:border-(--card-border-color) bg-white dark:bg-(--dark-sidebar) hover:border-primary/25 dark:hover:border-(--card-border-color) transition-all duration-300">
                    <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium mb-3">{message}</p>
                    <div className="flex items-center justify-end gap-3 transition-opacity">
                      <Button variant="outline" size="sm" onClick={() => handleCopy(message, index)} className="h-9 px-3 rounded-lg text-slate-500 border-slate-200 dark:border-(--card-border-color) hover:bg-slate-50 dark:hover:bg-(--table-hover) hover:text-primary transition-all">
                        {copiedIndex === index ? (
                          <div className="flex items-center gap-2 text-primary">
                            <Check size={16} /> <span className="text-[10px] font-bold uppercase">Copied</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Copy size={16} /> <span className="text-[10px] font-bold uppercase tracking-tight">Copy to Input</span>
                          </div>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => {
                          onDirectSend(message);
                          onClose();
                        }}
                        className="h-9 text-[12px] flex items-center gap-2 rounded-lg bg-primary hover:bg-sky-600 text-white font-bold px-4 shadow-lg shadow-sky-600/10 transition-all active:scale-95"
                      >
                        <Send size={14} /> Send Directly
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="shrink-0 bg-slate-50/50 dark:bg-(--card-color) p-4 border-t border-slate-100 dark:border-(--card-border-color)">
          <div className="w-full flex items-center justify-center gap-2 text-slate-400">
            <MessageSquare size={14} />
            <p className="text-[10px] font-medium uppercase tracking-widest">Speed up your communication</p>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default QuickReplyModal;
