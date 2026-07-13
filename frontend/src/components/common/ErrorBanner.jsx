import { AlertTriangle, RefreshCw } from "lucide-react";

export default function ErrorBanner({ message, onRetry }) {
  return <div className="error-banner" role="alert"><AlertTriangle size={18} /><span>{message}</span>{onRetry && <button className="button button-sm button-ghost" onClick={onRetry}><RefreshCw size={14} />Retry</button>}</div>;
}
