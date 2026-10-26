import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Bell } from "lucide-react";
import { useIdentity } from "@/components/identity-context";
import { safeNext } from "@/lib/identity-state";
import { getMyNotifications, markNotificationRead } from "@/lib/notifications";

export function NotificationsMenu() {
  const { session } = useIdentity();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const queryKey = ["person-notifications", session?.user.id];
  const notifications = useQuery({
    queryKey,
    queryFn: getMyNotifications,
    enabled: Boolean(session),
  });
  const mark = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => void queryClient.invalidateQueries({ queryKey }),
  });
  const items = notifications.data ?? [];
  const unread = items.filter((notice) => !notice.read_at).length;

  return (
    <div className="relative">
      <button type="button" aria-label="Notificações"
        aria-expanded={open} onClick={() => setOpen((value) => !value)}
        className="relative rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
        <Bell className="h-4 w-4" />
        {unread > 0 && <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-destructive" />}
      </button>
      {open && (
        <>
          <button type="button" aria-label="Fechar notificações"
            onClick={() => setOpen(false)} className="fixed inset-0 z-40" />
          <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-xl border border-border bg-popover shadow-panel">
            <p className="border-b border-border px-4 py-2.5 text-xs font-medium">
              Notificações {unread ? \`· \${unread} por ler\` : ""}
            </p>
            {notifications.isPending && <p role="status" className="p-4 text-xs">A carregar notificações…</p>}
            {notifications.isError && <div className="p-4 text-xs" role="alert">
              Não foi possível carregar as notificações.
              <button type="button" className="ml-2 text-primary" onClick={() => void notifications.refetch()}>Repetir</button>
            </div>}
            {notifications.isSuccess && !items.length && (
              <p className="p-4 text-xs text-muted-foreground">Ainda não existem notificações.</p>
            )}
            <ul className="max-h-80 divide-y divide-border overflow-y-auto">
              {items.map((notice) => (
                <li key={notice.id} className={notice.read_at ? "opacity-70" : ""}>
                  <Link
                    to={safeNext(notice.target_path || "/pessoal")}
                    onClick={() => {
                      setOpen(false);
                      if (!notice.read_at) mark.mutate(notice.id);
                    }}
                    className="block px-4 py-3 transition-colors hover:bg-accent"
                  >
                    <p className="text-xs font-medium">{notice.title}</p>
                    {notice.body && <p className="mt-1 text-xs text-muted-foreground">{notice.body}</p>}
                    <p className="mt-1 text-[10px] text-muted-foreground">
                      {new Intl.DateTimeFormat("pt-PT", {dateStyle:"medium", timeStyle:"short"}).format(new Date(notice.created_at))}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
