import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, TrendingUp, Truck, GraduationCap, AlertTriangle, Check } from "lucide-react";
import { mockNotifications, type Notification } from "@/lib/mock-data";

const iconMap = {
  trend_alert: TrendingUp,
  training_complete: GraduationCap,
  delivery: Truck,
  override: AlertTriangle,
};

const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);

  const unread = notifications.filter((n) => !n.read).length;

  const markRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold tracking-tight text-foreground">
            Notifications
          </h1>
          <p className="text-sm text-muted-foreground mt-1 font-body">
            {unread} unread notification{unread !== 1 ? "s" : ""}
          </p>
        </div>
        {unread > 0 && (
          <Button variant="outline" size="sm" className="text-xs font-body" onClick={markAllRead}>
            <Check className="mr-1 h-3 w-3" /> Mark all read
          </Button>
        )}
      </div>

      <div className="space-y-2">
        {notifications.map((n) => {
          const Icon = iconMap[n.type];
          return (
            <Card
              key={n.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                !n.read ? "border-foreground/20 shadow-sm" : "opacity-60"
              }`}
              onClick={() => markRead(n.id)}
            >
              <CardContent className="p-4 flex items-start gap-3">
                <div className={`mt-0.5 p-2 rounded ${!n.read ? "bg-foreground/5" : "bg-muted"}`}>
                  <Icon className={`h-4 w-4 ${!n.read ? "text-foreground" : "text-muted-foreground"}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`text-sm font-body ${!n.read ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
                      {n.title}
                    </p>
                    {!n.read && (
                      <span className="h-2 w-2 rounded-full bg-foreground shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 font-body">{n.message}</p>
                </div>
                <span className="text-[10px] text-muted-foreground whitespace-nowrap shrink-0 font-body">
                  {n.timestamp}
                </span>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default Notifications;
