"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl text-white shadow-lg",
          title: "text-white",
          description: "text-slate-400",
          success:
            "backdrop-blur-xl bg-green-500/20 border border-green-500/30 text-green-300",
          error:
            "backdrop-blur-xl bg-red-500/20 border border-red-500/30 text-red-300",
          warning:
            "backdrop-blur-xl bg-amber-500/20 border border-amber-500/30 text-amber-300",
          info:
            "backdrop-blur-xl bg-blue-500/20 border border-blue-500/30 text-blue-300",
          actionButton:
            "bg-gradient-to-r from-slate-600 to-slate-700 text-white hover:from-slate-700 hover:to-slate-800",
          cancelButton:
            "bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10",
        },
      }}
      style={
        {
          "--normal-bg": "rgba(255, 255, 255, 0.05)",
          "--normal-text": "#ffffff",
          "--normal-border": "rgba(255, 255, 255, 0.1)",
          "--success-bg": "rgba(34, 197, 94, 0.2)",
          "--success-text": "#86efac",
          "--success-border": "rgba(34, 197, 94, 0.3)",
          "--error-bg": "rgba(239, 68, 68, 0.2)",
          "--error-text": "#fca5a5",
          "--error-border": "rgba(239, 68, 68, 0.3)",
          "--warning-bg": "rgba(245, 158, 11, 0.2)",
          "--warning-text": "#fcd34d",
          "--warning-border": "rgba(245, 158, 11, 0.3)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
