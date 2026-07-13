import { Inbox } from "lucide-react";

export default function EmptyState({ title = "Nothing here yet", message, action }) {
  return <div className="empty-state"><span><Inbox size={22} /></span><strong>{title}</strong>{message && <p>{message}</p>}{action}</div>;
}
