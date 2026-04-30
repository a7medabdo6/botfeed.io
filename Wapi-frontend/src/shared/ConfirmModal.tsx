import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/src/elements/ui/alert-dialog";
import { Button } from "@/src/elements/ui/button";
import { ConfirmModalProps } from "@/src/types/shared";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Info
} from "lucide-react";
import React from "react";

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
  title = "Are you sure?",
  subtitle = "This action cannot be undone. All values associated with this field will be lost.",
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  showIcon = true,
  showCancelButton = true,
  loadingText,
}) => {
  const getVariantConfig = () => {
    switch (variant) {
      case "primary":
        return {
          icon: Info,
          iconBgColor: "bg-(--light-primary)",
          iconColor: "text-primary",
          buttonColor: "bg-primary hover:bg-primary/90",
        };
      case "danger":
        return {
          icon: AlertCircle,
          iconBgColor: "bg-red-100",
          iconColor: "text-red-600",
          buttonColor: "bg-red-600 hover:bg-red-700",
        };
      case "warning":
        return {
          icon: AlertTriangle,
          iconBgColor: "bg-yellow-100",
          iconColor: "text-yellow-600",
          buttonColor: "bg-yellow-600 hover:bg-yellow-700",
        };
      case "success":
        return {
          icon: CheckCircle,
          iconBgColor: "bg-sky-100",
          iconColor: "text-sky-600",
          buttonColor: "bg-primary hover:bg-sky-700",
        };
      case "info":
        return {
          icon: Info,
          iconBgColor: "bg-blue-100",
          iconColor: "text-blue-600",
          buttonColor: "bg-blue-600 hover:bg-blue-700",
        };
      default:
        return {
          icon: Info,
          iconBgColor: "bg-primary/10",
          iconColor: "text-primary",
          buttonColor: "bg-primary hover:bg-primary/90",
        };
    }
  };

  const config = getVariantConfig();
  const IconComponent = config.icon;

  return (
    <AlertDialog open={isOpen} onOpenChange={!isLoading ? onClose : undefined}>
      <AlertDialogContent className="sm:max-w-md max-w-[calc(100%-2rem)]">
        <AlertDialogHeader className="text-center space-y-4 relative">
          {showIcon && (
            <div className="flex justify-center absolute -top-14.25 left-[42%]">
              <div
                className={`${config.iconBgColor} rounded-full p-3 w-16 h-16 flex items-center justify-center`}
              >
                <IconComponent className={`${config.iconColor} w-12 h-12`} />
              </div>
            </div>
          )}
          <AlertDialogTitle className="text-xl font-semibold text-center mt-4    text-gray-900 dark:text-amber-50">
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-gray-600 dark:text-gray-400 text-center text-sm">
            {subtitle}
          </AlertDialogDescription>
          {isLoading && loadingText && (
            <div className="text-sm text-gray-500 mt-2">{loadingText}</div>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter className="flex gap-2 mt-4">
          {showCancelButton && (
            <Button
              onClick={onClose}
              disabled={isLoading}
              className="w-50 py-2.5 px-4 mr-4 rounded-lg font-medium bg-white border border-gray-300 text-gray-700 dark:bg-(--page-body-bg) dark:hover:bg-(--table-hover) dark:text-gray-400 dark:border-none hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cancelText}
            </Button>
          )}
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            className={`${config.buttonColor} w-60 text-white py-2.5 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center`}
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Loading...
              </>
            ) : (
              confirmText
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ConfirmModal;
