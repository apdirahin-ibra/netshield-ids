import { AlertTriangle, X } from "lucide-react";

export default function ConfirmDialog({ open, title, message, confirmLabel = "Confirm", onConfirm, onCancel, tone = "danger" }) {
  if (!open) return null;
  return <div className="modal-backdrop" role="presentation" onMouseDown={onCancel}>
    <section className="dialog" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" onMouseDown={(event) => event.stopPropagation()}>
      <button className="dialog-close icon-button" onClick={onCancel} aria-label="Close dialog"><X size={18} /></button>
      <span className={`dialog-icon dialog-icon-${tone}`}><AlertTriangle size={22} /></span>
      <h2 id="confirm-title">{title}</h2><p>{message}</p>
      <div className="dialog-actions"><button className="button button-ghost" onClick={onCancel}>Cancel</button><button className={`button button-${tone}`} onClick={onConfirm}>{confirmLabel}</button></div>
    </section>
  </div>;
}
