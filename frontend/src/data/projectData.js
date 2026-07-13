import {
  BarChart3, BellRing, BrainCircuit, Database, FileSearch,
  LayoutDashboard, Radio, ShieldCheck, User, Users,
} from "lucide-react";

export const navigationGroups = [
  { label: "Overview", items: [{ label: "Dashboard", path: "/dashboard", icon: LayoutDashboard, permission: "dashboard:view" }] },
  { label: "Detection", items: [
    { label: "Live Capture", path: "/live-capture", icon: Radio, permission: "capture:start" },
    { label: "Manual Prediction", path: "/manual-prediction", icon: FileSearch, permission: "prediction:create" },
  ] },
  { label: "Intelligence", items: [
    { label: "Models", path: "/models", icon: BrainCircuit, permission: "models:view" },
    { label: "Dataset Overview", path: "/dataset-overview", icon: Database, permission: "dataset:view" },
    { label: "Alerts & Logs", path: "/alerts-logs", icon: BellRing, permission: "alerts:view" },
    { label: "Profile", path: "/profile", icon: User, permission: "profile:view" },
  ] },
  { label: "Administration", admin: true, items: [
    { label: "User Management", path: "/admin/users", icon: Users, permission: "users:view" },
  ] },
];

export const pageMeta = {
  "/dashboard": ["Security Overview", "Live detection posture and network activity"],
  "/live-capture": ["Live Capture", "Capture packets, build flows, and classify traffic"],
  "/manual-prediction": ["Manual Prediction", "Inspect a network flow with the deployed model"],
  "/models": ["Model Intelligence", "Compare the six evaluated detection models"],
  "/dataset-overview": ["Dataset Overview", "CIC-IDS2017 lineage, classes, and selected features"],
  "/alerts-logs": ["Alerts & Logs", "Investigate detections and prediction activity"],
  "/profile": ["Profile & Security", "Manage your account and active session"],
  "/admin/users": ["User Management", "Control platform access and role assignments"],
};

// Real metrics transcribed from the final supervisor-feedback notebook output.
export const modelMetrics = [
  { name: "Decision Tree", file: "decision_tree.pkl", accuracy: .9990, precision: .9997, recall: .9983, f1: .9990, fpr: .0003, auc: .9999, status: "Validated", deployed: false, strength: "Fast, interpretable, and highest measured test accuracy.", limitation: "Can overfit without pruning or validation." },
  { name: "Random Forest", file: "best_model.pkl", accuracy: .9990, precision: .9998, recall: .9983, f1: .9990, fpr: .0002, auc: .9999, status: "Active", deployed: true, strength: "Robust ensemble with the lowest measured false-positive rate.", limitation: "Larger artifact and less directly interpretable." },
  { name: "K-Nearest Neighbors", file: "knn.pkl", accuracy: .9989, precision: .9997, recall: .9982, f1: .9989, fpr: .0003, auc: .9993, status: "Validated", deployed: false, strength: "Strong nonlinear classification on balanced traffic.", limitation: "Large artifact and slower inference as data grows." },
  { name: "Support Vector Machine", file: "svm.pkl", accuracy: .8709, precision: .7952, recall: .9991, f1: .8856, fpr: .2572, auc: .9523, status: "Evaluated", deployed: false, strength: "Very high DDoS recall.", limitation: "High false-positive rate for benign traffic." },
  { name: "Logistic Regression", file: "logistic_regression.pkl", accuracy: .7535, precision: .8355, recall: .6313, f1: .7192, fpr: .1243, auc: .9419, status: "Evaluated", deployed: false, strength: "Fast baseline with clear coefficients.", limitation: "Misses more nonlinear attack patterns." },
  { name: "Naive Bayes", file: "naive_bayes.pkl", accuracy: .7351, precision: .6537, recall: 1, f1: .7906, fpr: .5298, auc: .9996, status: "Evaluated", deployed: false, strength: "Lightweight with complete attack recall in evaluation.", limitation: "Unacceptably high benign false positives." },
];

export const datasetStats = {
  name: "CIC-IDS2017", total: 755663, benign: 627636, ddos: 128027,
  rawColumns: 79, selectedFeatures: 12, trainSplit: 80, testSplit: 20,
};

export const selectedFeatureDetails = [
  ["Flow Duration", "Elapsed time of the flow", "µs", "Timing", "61,165"],
  ["Total Fwd Packets", "Packets sent from source to destination", "packets", "Packet counts", "11"],
  ["Total Backward Packets", "Packets returned by the destination", "packets", "Packet counts", "6"],
  ["Total Length of Fwd Packets", "Combined forward packet bytes", "bytes", "Traffic volume", "801"],
  ["Total Length of Bwd Packets", "Combined return packet bytes", "bytes", "Traffic volume", "2,532"],
  ["Flow Bytes/s", "Transfer rate across the flow", "bytes/s", "Traffic volume", "28,073"],
  ["Flow Packets/s", "Packet arrival rate", "packets/s", "Traffic volume", "143.19"],
  ["Packet Length Mean", "Mean observed packet length", "bytes", "Packet profile", "185.17"],
  ["SYN Flag Count", "TCP synchronization flags", "count", "TCP flags", "0"],
  ["ACK Flag Count", "TCP acknowledgement flags", "count", "TCP flags", "1"],
  ["PSH Flag Count", "TCP push flags", "count", "TCP flags", "1"],
  ["Average Packet Size", "Average bytes per packet", "bytes", "Packet profile", "196.06"],
].map(([name, meaning, unit, category, example]) => ({ name, meaning, unit, category, example }));

export const sampleFlows = [
  { label: "BENIGN", source: "Monday-WorkingHours.pcap_ISCX.csv", features: { "Flow Duration": 61165, "Total Fwd Packets": 1, "Total Backward Packets": 1, "Total Length of Fwd Packets": 58, "Total Length of Bwd Packets": 114, "Flow Bytes/s": 2812.065724, "Flow Packets/s": 32.69843865, "Packet Length Mean": 76.66666667, "SYN Flag Count": 0, "ACK Flag Count": 0, "PSH Flag Count": 0, "Average Packet Size": 115 } },
  { label: "BENIGN", source: "Monday-WorkingHours.pcap_ISCX.csv", features: { "Flow Duration": 115743288, "Total Fwd Packets": 24, "Total Backward Packets": 21, "Total Length of Fwd Packets": 908, "Total Length of Bwd Packets": 6312, "Flow Bytes/s": 62.37942713, "Flow Packets/s": .388791443, "Packet Length Mean": 156.9565217, "SYN Flag Count": 0, "ACK Flag Count": 0, "PSH Flag Count": 1, "Average Packet Size": 160.4444444 } },
  { label: "DDoS", source: "Friday-WorkingHours-Afternoon-DDos.pcap_ISCX.csv", features: { "Flow Duration": 1014742, "Total Fwd Packets": 3, "Total Backward Packets": 5, "Total Length of Fwd Packets": 26, "Total Length of Bwd Packets": 11607, "Flow Bytes/s": 11463.99775, "Flow Packets/s": 7.883777354, "Packet Length Mean": 1292.555556, "SYN Flag Count": 0, "ACK Flag Count": 0, "PSH Flag Count": 1, "Average Packet Size": 1454.125 } },
  { label: "DDoS", source: "Friday-WorkingHours-Afternoon-DDos.pcap_ISCX.csv", features: { "Flow Duration": 17511, "Total Fwd Packets": 3, "Total Backward Packets": 4, "Total Length of Fwd Packets": 26, "Total Length of Bwd Packets": 11601, "Flow Bytes/s": 663982.6395, "Flow Packets/s": 399.7487294, "Packet Length Mean": 1453.375, "SYN Flag Count": 0, "ACK Flag Count": 0, "PSH Flag Count": 1, "Average Packet Size": 1661 } },
];

export const mockUsers = [
  { id: 1, name: "System Administrator", email: "admin@netshield.local", role: "ADMIN", status: "Active", lastLogin: "Current session", created: "Jul 01, 2026" },
  { id: 2, name: "Security Analyst", email: "analyst@netshield.local", role: "SECURITY_ANALYST", status: "Active", lastLogin: "Jul 10, 2026", created: "Jul 01, 2026" },
  { id: 3, name: "SOC Review Account", email: "reviewer@netshield.local", role: "SECURITY_ANALYST", status: "Disabled", lastLogin: "Never", created: "Jul 04, 2026" },
];

export const capabilityCards = [
  [Radio, "Real-time monitoring", "Convert packet activity into classified network flows."],
  [BrainCircuit, "Machine learning detection", "Detect BENIGN and DDoS patterns with the deployed Random Forest."],
  [FileSearch, "Explainable predictions", "Pair every manual result with a readable feature-pattern explanation."],
  [BellRing, "Security alerts", "Escalate high-confidence attacks into an investigation queue."],
  [Database, "Dataset intelligence", "Trace detection inputs back to CIC-IDS2017 sources and features."],
  [BarChart3, "Model comparison", "Compare six evaluated algorithms using notebook-backed metrics."],
  [ShieldCheck, "Role-based access", "Separate operational detection from protected administration."],
];

export const landingProcess = ["Capture traffic", "Build network flows", "Extract 12 features", "Predict BENIGN or DDoS", "Generate a reason", "Create alerts and logs"];
