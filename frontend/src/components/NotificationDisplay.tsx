"use client";

import { useState, useEffect } from "react";
import { X, CheckCircle, XCircle, Info, AlertCircle, Bell } from "lucide-react";

export interface Notification {
  _id: string;
  type: string;
  message: string;
  createdAt?: string;
  read?: boolean;
}

interface NotificationDisplayProps {
  applicationId?: string;
  candidateId?: string;
  onNotificationClick?: (notification: Notification) => void;
}

export default function NotificationDisplay({
  applicationId,
  candidateId,
  onNotificationClick,
}: NotificationDisplayProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPanel, setShowPanel] = useState(false);

  useEffect(() => {
    if (applicationId || candidateId) {
      loadNotifications();
    }
  }, [applicationId, candidateId]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      // In a real implementation, you would fetch from the notification API
      // For now, this is a placeholder that shows the structure
      // const data = await notificationApi.getNotifications({ applicationId, candidateId });
      // setNotifications(data || []);
    } catch (error) {
      console.error("Error loading notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "APPLICATION_STATUS_UPDATE":
      case "OFFER_SENT":
        return <Info className="w-5 h-5 text-blue-400" />;
      case "APPLICATION_REJECTED":
        return <XCircle className="w-5 h-5 text-red-400" />;
      case "INTERVIEW_SCHEDULED":
      case "INTERVIEW_PANEL_INVITE":
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      default:
        return <AlertCircle className="w-5 h-5 text-yellow-400" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "APPLICATION_STATUS_UPDATE":
      case "OFFER_SENT":
        return "bg-blue-500/10 border-blue-500/30";
      case "APPLICATION_REJECTED":
        return "bg-red-500/10 border-red-500/30";
      case "INTERVIEW_SCHEDULED":
      case "INTERVIEW_PANEL_INVITE":
        return "bg-green-500/10 border-green-500/30";
      default:
        return "bg-yellow-500/10 border-yellow-500/30";
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="relative">
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="relative w-10 h-10 rounded-xl backdrop-blur-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all"
      >
        <Bell className="w-5 h-5 text-white" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {showPanel && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowPanel(false)}
          />
          <div className="absolute right-0 top-12 w-96 backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl z-50 max-h-96 overflow-y-auto">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-white font-semibold">Notifications</h3>
              <button
                onClick={() => setShowPanel(false)}
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>

            <div className="p-2">
              {loading ? (
                <div className="p-8 text-center text-slate-400">Loading...</div>
              ) : notifications.length > 0 ? (
                notifications.map((notification) => (
                  <div
                    key={notification._id}
                    onClick={() => {
                      if (onNotificationClick) {
                        onNotificationClick(notification);
                      }
                    }}
                    className={`p-4 rounded-lg border mb-2 cursor-pointer hover:bg-white/5 transition-all ${
                      !notification.read ? "bg-white/5" : ""
                    } ${getNotificationColor(notification.type)}`}
                  >
                    <div className="flex items-start gap-3">
                      {getNotificationIcon(notification.type)}
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm">{notification.message}</p>
                        {notification.createdAt && (
                          <p className="text-slate-400 text-xs mt-1">
                            {new Date(notification.createdAt).toLocaleString()}
                          </p>
                        )}
                      </div>
                      {!notification.read && (
                        <div className="w-2 h-2 rounded-full bg-blue-400 mt-2"></div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-slate-400">
                  No notifications
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

