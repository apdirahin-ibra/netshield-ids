import { ArrowLeft, Radar } from "lucide-react";
import { Link } from "react-router-dom";
export default function NotFoundPage() { return <main className="status-page"><div className="status-page-card"><span><Radar size={32} /></span><small>404 • Route not found</small><h1>This signal is outside the map.</h1><p>The page may have moved, or the address does not belong to this workspace.</p><Link className="button button-primary" to="/"><ArrowLeft size={16} />Return to safety</Link></div></main>; }
