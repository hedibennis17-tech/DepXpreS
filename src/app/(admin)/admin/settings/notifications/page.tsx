import { Bell } from "lucide-react";

export default function SettingsNotificationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Paramètres notifications</h1>
        <p className="text-muted-foreground mt-1">Configuration des notifications push, SMS et email</p>
      </div>
      <div className="rounded-xl border bg-card p-6">
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Bell className="h-12 w-12 text-muted-foreground/30 mb-3" />
          <p className="font-semibold text-foreground">Configuration disponible</p>
          <p className="text-sm text-muted-foreground mt-1">
            Configurez les canaux de notification et les modèles de messages.
          </p>
        </div>
        <div className="space-y-3 mt-4">
          <div className="flex items-center justify-between py-3 border-b last:border-0">
            <p className="text-sm font-medium">Push notifications</p>
            <span className="text-sm text-muted-foreground">Activé (Firebase FCM)</span>
          </div>
          <div className="flex items-center justify-between py-3 border-b last:border-0">
            <p className="text-sm font-medium">SMS</p>
            <span className="text-sm text-muted-foreground">Activé (Twilio)</span>
          </div>
          <div className="flex items-center justify-between py-3 border-b last:border-0">
            <p className="text-sm font-medium">Email</p>
            <span className="text-sm text-muted-foreground">Activé (SendGrid)</span>
          </div>
          <div className="flex items-center justify-between py-3 border-b last:border-0">
            <p className="text-sm font-medium">Notifications temps réel</p>
            <span className="text-sm text-muted-foreground">Activé</span>
          </div>
        </div>
      </div>
    </div>
  );
}
