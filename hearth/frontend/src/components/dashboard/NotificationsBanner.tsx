import { useNotificationsDismissed } from "../../hooks/useNotificationsDismissed";

export type NotificationVariant = "info" | "warning" | "ready";

export interface DashboardNotification {
  id: string;
  message: string;
  variant: NotificationVariant;
}

interface NotificationsBannerProps {
  notifications: DashboardNotification[];
}

const VARIANT_STYLES: Record<NotificationVariant, string> = {
  info: "border-warmgray/70 bg-white/85 text-wood",
  warning: "border-error/30 bg-error/10 text-wood",
  ready: "border-amber/60 bg-amber-soft/40 text-wood"
};

const VARIANT_ICON: Record<NotificationVariant, string> = {
  info: "info",
  warning: "warning",
  ready: "local_fire_department"
};

const NotificationsBanner = ({ notifications }: NotificationsBannerProps) => {
  const { dismissed, dismiss } = useNotificationsDismissed();
  const visible = notifications.filter((n) => !dismissed.has(n.id));

  if (visible.length === 0) {
    return null;
  }

  return (
    <div className="mb-6 space-y-3">
      {visible.map((notification) => (
        <div
          key={notification.id}
          role="status"
          className={`flex items-start justify-between gap-3 rounded-2xl border px-4 py-3 text-sm ${
            VARIANT_STYLES[notification.variant]
          }`}
        >
          <div className="flex items-start gap-3">
            <span
              aria-hidden="true"
              className="material-symbols-outlined mt-0.5 text-base text-ember"
            >
              {VARIANT_ICON[notification.variant]}
            </span>
            <p className="leading-relaxed">{notification.message}</p>
          </div>
          <button
            type="button"
            onClick={() => dismiss(notification.id)}
            className="text-xs font-semibold text-wood-soft hover:text-wood"
            aria-label="Dismiss notification"
          >
            Dismiss
          </button>
        </div>
      ))}
    </div>
  );
};

export default NotificationsBanner;
