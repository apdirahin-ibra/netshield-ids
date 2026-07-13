import { ArrowLeft, ShieldX } from "lucide-react";
import { Link } from "react-router-dom";
export default function UnauthorizedPage() { return <main className="status-page"><div className="status-page-card"><span><ShieldX size={32} /></span><small>403 • Access restricted</small><h1>This area requires elevated access.</h1><p>Your account is signed in, but its role does not permit this administrative action.</p><Link className="button button-primary" to="/dashboard"><ArrowLeft size={16} />Return to dashboard</Link></div></main>; }
