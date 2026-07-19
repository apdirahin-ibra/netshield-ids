import { ArrowRight, CheckCircle2, ChevronRight, Network, Shield, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { capabilityCards, landingProcess } from "../../data/projectData";

export default function LandingPage() {
  return <div className="landing-page">
    <nav className="landing-nav"><Link className="landing-brand" to="/"><span><Shield size={21} /></span><div><strong>NetShield IDS</strong><small>Threat Detection Platform</small></div></Link><div><a href="#capabilities">Capabilities</a><a href="#architecture">Architecture</a><Link className="button button-ghost" to="/login">Sign in</Link><Link className="button button-primary" to="/login">Launch NetShield <ArrowRight size={16} /></Link></div></nav>
    <main>
      <section className="hero-section">
        <div className="hero-copy"><span className="hero-kicker"><Sparkles size={15} />Machine learning-powered network defense</span><h1>Detect network threats <em>before they disrupt</em> your systems.</h1><p>NetShield IDS monitors network traffic, detects DDoS attacks, explains predictions, and delivers real-time security alerts from one focused workspace.</p><div className="hero-actions"><Link className="button button-primary button-lg" to="/login">Launch NetShield <ArrowRight size={17} /></Link><a className="button button-ghost button-lg" href="#capabilities">View system capabilities</a></div><div className="hero-trust"><span><CheckCircle2 size={16} />12 selected flow features</span><span><CheckCircle2 size={16} />Explainable results</span><span><CheckCircle2 size={16} />Role-based access</span></div></div>
        <div className="hero-visual hero-photo" aria-label="Cybersecurity network monitoring visualization">
          <figure className="hero-photo-frame">
            <img src="/hero-cybersecurity.jpg" alt="Illuminated digital circuit and cybersecurity interface" />
            <div className="hero-photo-copy">
              <span><i />Network defense active</span>
              <strong>See the signal.<br />Stop the threat.</strong>
              <small>Machine-learning detection across every analyzed flow.</small>
            </div>
            <a
              className="hero-photo-credit"
              href="https://unsplash.com/photos/turned-on-black-and-grey-laptop-computer-iIJrUoeRoCQ"
              target="_blank"
              rel="noreferrer"
            >
              Photo: Philipp Katzenberger / Unsplash
            </a>
          </figure>
          <div className="floating-alert"><span><Shield size={17} /></span><div><small>High-confidence detection</small><strong>DDoS flow contained</strong></div></div>
        </div>
      </section>
      <section className="landing-section" id="capabilities"><div className="section-heading"><span className="eyebrow">Platform capabilities</span><h2>Built for fast, explainable detection</h2><p>Move from packet activity to an actionable security decision without losing the evidence behind it.</p></div><div className="capability-grid">{capabilityCards.map(([Icon, title, copy]) => <article key={title}><span><Icon size={20} /></span><h3>{title}</h3><p>{copy}</p></article>)}</div></section>
      <section className="landing-section process-section"><div className="section-heading left"><span className="eyebrow">Detection pipeline</span><h2>From raw traffic to a clear decision</h2></div><div className="process-track">{landingProcess.map((step, index) => <div key={step}><span>{String(index + 1).padStart(2, "0")}</span><strong>{step}</strong>{index < landingProcess.length - 1 && <ChevronRight size={18} />}</div>)}</div></section>
      <section className="landing-section performance-section"><div className="performance-copy"><span className="eyebrow">Evaluation snapshot</span><h2>High detection quality, grounded in CIC-IDS2017</h2><p>The deployed Random Forest achieved a 99.90% test accuracy and 0.02% false-positive rate in the final project notebook evaluation.</p><div><article><strong>99.90%</strong><span>Test accuracy</span></article><article><strong>99.83%</strong><span>DDoS recall</span></article><article><strong>0.02%</strong><span>False positive rate</span></article></div><small>Source: final supervisor-feedback notebook. Results reflect the evaluated dataset and are not production guarantees.</small></div><div className="performance-card"><ResponsiveContainer width="100%" height={260}><BarChart layout="vertical" data={[{ name: "Decision Tree", score: 99.90 }, { name: "Random Forest", score: 99.90 }, { name: "KNN", score: 99.89 }, { name: "SVM", score: 87.09 }, { name: "Logistic", score: 75.35 }, { name: "Naive Bayes", score: 73.51 }]} margin={{ left: 8, right: 18 }}><XAxis type="number" domain={[0, 100]} hide /><YAxis type="category" dataKey="name" width={92} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#666375" }} /><Tooltip formatter={(value) => `${value}%`} /><Bar dataKey="score" fill="#7667f5" radius={[0, 5, 5, 0]} barSize={18} /></BarChart></ResponsiveContainer><div className="performance-legend"><span>Evaluated test accuracy</span><strong>Six models compared</strong></div></div></section>
      <section className="landing-section architecture-section" id="architecture"><div className="section-heading"><span className="eyebrow">System architecture</span><h2>A complete detection loop</h2></div><div className="architecture-flow"><div><Network size={24} /><strong>Network packets</strong><span>Scapy capture</span></div><ChevronRight /><div><BarChartIcon /><strong>Flow intelligence</strong><span>12 selected features</span></div><ChevronRight /><div><Shield size={24} /><strong>ML decision</strong><span>BENIGN or DDoS</span></div><ChevronRight /><div><Sparkles size={24} /><strong>Response</strong><span>Explain, alert, log</span></div></div><div className="stack-row"><span>React</span><span>FastAPI</span><span>scikit-learn</span><span>SQLite</span><span>Scapy</span><span>CIC-IDS2017</span></div></section>
      <section className="landing-cta"><div><span className="eyebrow">Ready to monitor</span><h2>Turn network activity into security intelligence.</h2></div><Link className="button button-light button-lg" to="/login">Open secure workspace <ArrowRight size={17} /></Link></section>
    </main>
    <footer className="landing-footer"><div><div className="landing-brand"><span><Shield size={20} /></span><div><strong>NetShield IDS</strong><small>Machine Learning-Based Network Traffic Anomaly Detection</small></div></div><p>Final-year cybersecurity project • Academic Year 2025/2026</p></div><div><strong>Technology</strong><span>React · FastAPI · Random Forest · CIC-IDS2017</span></div><div><strong>Documentation</strong><span>API documentation available at /docs</span></div></footer>
  </div>;
}

function BarChartIcon() { return <Network size={24} />; }
