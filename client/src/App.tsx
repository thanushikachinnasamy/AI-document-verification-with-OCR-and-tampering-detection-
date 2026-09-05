import { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Bell,
  BrainCircuit,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Clock3,
  Copy,
  Download,
  Eye,
  FileCheck2,
  FileImage,
  FileSearch2,
  FileText,
  Filter,
  Gauge,
  Grid2X2,
  HelpCircle,
  History,
  Image as ImageIcon,
  Info,
  LayoutDashboard,
  ListFilter,
  LogOut,
  Menu,
  MoreHorizontal,
  Paperclip,
  PenLine,
  PieChart as PieIcon,
  Plus,
  RotateCcw,
  Search,
  Send,
  Settings,
  Shield,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  UploadCloud,
  UserRound,
  X,
  XCircle,
  Zap,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  calculateOverall,
  chartData,
  demoRecords,
  monthlyData,
  processingSteps,
  verifyMockDocument,
  weeklyData,
  type Decision,
  type Risk,
  type SuspiciousRegion,
  type VerificationRecord,
} from "@/lib/mockVerification";

type Page = "dashboard" | "verify" | "ocr" | "tampering" | "ai" | "history" | "analytics" | "reports" | "settings";

type IconType = typeof LayoutDashboard;

const navItems: { id: Page; label: string; icon: IconType; section?: string }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, section: "WORKSPACE" },
  { id: "verify", label: "Verify document", icon: UploadCloud },
  { id: "ocr", label: "OCR results", icon: FileSearch2 },
  { id: "tampering", label: "Tampering detection", icon: Shield },
  { id: "ai", label: "AI verification", icon: BrainCircuit },
  { id: "history", label: "Verification history", icon: History, section: "MANAGE" },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "reports", label: "Reports", icon: FileText },
  { id: "settings", label: "Settings", icon: Settings, section: "SYSTEM" },
];

const statusMeta: Record<Decision, { label: string; className: string; icon: IconType }> = {
  VERIFIED: { label: "Verified", className: "status-verified", icon: CheckCircle2 },
  SUSPICIOUS: { label: "Suspicious", className: "status-suspicious", icon: AlertTriangle },
  TAMPERED: { label: "Tampered", className: "status-tampered", icon: XCircle },
};

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function StatusBadge({ decision, compact = false }: { decision: Decision; compact?: boolean }) {
  const meta = statusMeta[decision];
  const Icon = meta.icon;
  return <span className={cn("status-badge", meta.className, compact && "status-badge-compact")}><Icon size={compact ? 12 : 14} /> {meta.label}</span>;
}

function ScoreRing({ score, color = "#2667ff", size = 116, label = "confidence" }: { score: number; color?: string; size?: number; label?: string }) {
  const radius = (size - 12) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;
  return (
    <div className="score-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#e7edf5" strokeWidth="8" />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth="8" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      </svg>
      <div className="score-ring-content"><strong>{score}%</strong><span>{label}</span></div>
    </div>
  );
}

function ProgressBar({ label, score, color }: { label: string; score: number; color?: string }) {
  return <div className="progress-row"><div className="progress-label"><span>{label}</span><strong>{score}%</strong></div><div className="progress-track"><div className="progress-value" style={{ width: `${score}%`, background: color ?? "#2667ff" }} /></div></div>;
}

function Logo({ inverted = false }: { inverted?: boolean }) {
  return <div className={cn("brand-lockup", inverted && "brand-lockup-inverted")}><span className="brand-mark"><ShieldCheck size={19} strokeWidth={2.6} /></span><span><strong>DocVerify</strong><em>AI</em><small>TRUSTED DOCUMENT INTELLIGENCE</small></span></div>;
}

function DocumentPreview({ record, selectedRegion, onRegionClick, compact = false }: { record?: VerificationRecord; selectedRegion?: string | null; onRegionClick?: (region: SuspiciousRegion) => void; compact?: boolean }) {
  const regions = record?.regions ?? [];
  return <div className={cn("document-preview", compact && "document-preview-compact")}>
    <div className="preview-toolbar"><span><FileImage size={14} /> {record?.fileName ?? "document_preview.png"}</span><span className="preview-page">Page 1 of 1</span></div>
    <div className="paper-stage">
      <div className="paper-card">
        <div className="paper-top"><div className="paper-emblem"><Shield size={22} /></div><div><small>REPUBLIC OF INDIA</small><strong>{record?.documentType?.toUpperCase() ?? "IDENTITY DOCUMENT"}</strong></div><div className="paper-photo" /></div>
        <div className="paper-rule" />
        <div className="paper-body"><div className="paper-copy"><div className="tiny-label">DOCUMENT HOLDER</div><div className="paper-name">{record?.fields?.["Full Name"] ?? "Aarav Mehta"}</div><div className="paper-line long" /><div className="paper-line" /><div className="paper-grid"><div><span>DOCUMENT NO.</span><b>{record?.fields?.["Document Number"] ?? "XXXX XXXX 3892"}</b></div><div><span>ISSUE DATE</span><b>{record?.fields?.["Issue Date"] ?? "12 / 06 / 2022"}</b></div></div></div><div className="paper-qr"><div className="qr-grid" /><small>VERIFIED</small></div></div>
        <div className="paper-footer"><span>SECURE DIGITAL RECORD</span><span>DV / 24-091</span></div>
        {regions.map((region) => <button key={region.id} type="button" aria-label={`Select ${region.id}`} onClick={() => onRegionClick?.(region)} className={cn("region-box", region.risk === "HIGH" ? "region-high" : "region-medium", selectedRegion === region.id && "region-selected")} style={{ left: `${region.x}%`, top: `${region.y}%`, width: `${region.width}%`, height: `${region.height}%` }}><span>{region.id}</span></button>)}
      </div>
    </div>
    <div className="preview-controls"><button type="button"><ChevronLeft size={15} /></button><span>1 / 1</span><button type="button"><ChevronRight size={15} /></button><span className="control-spacer" /><button type="button"><RotateCcw size={14} /> Rotate</button><button type="button"><Plus size={14} /> Zoom</button></div>
  </div>;
}

function LoginPage({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState("demo@docverify.ai");
  const [password, setPassword] = useState("password");
  const [showPassword, setShowPassword] = useState(false);
  return <div className="login-screen"><div className="login-visual"><div className="login-visual-inner"><Logo inverted /><div className="login-hero-copy"><p className="eyebrow">DOCUMENT TRUST, REIMAGINED</p><h1>Make every document<br /><span>worth trusting.</span></h1><p>Verify identity, education and business documents with explainable AI and image forensics.</p><div className="login-proof"><div><ShieldCheck size={17} /><span>99.1%<small>signal precision</small></span></div><div><Zap size={17} /><span>4.8 sec<small>average analysis</small></span></div></div></div><div className="login-grid-mark"><span /><span /><span /><span /><span /><span /><span /><span /><span /></div><small className="login-footnote">SECURE ANALYSIS ENVIRONMENT · ISO 27001 READY</small></div></div><div className="login-panel"><div className="login-form-wrap"><div className="mobile-logo"><Logo /></div><div className="login-heading"><span className="mini-kicker">WELCOME BACK</span><h2>Sign in to your workspace</h2><p>Continue managing document verification intelligence.</p></div><form onSubmit={(event) => { event.preventDefault(); onLogin(); }}><label>Email address<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@company.com" /></label><label>Password<div className="password-field"><input type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} /><button type="button" className="password-toggle" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword(!showPassword)}><Eye size={16} /></button></div></label><div className="form-meta"><label className="checkbox-label"><input type="checkbox" defaultChecked /> <span>Remember me</span></label><button type="button" className="text-button">Forgot password?</button></div><button className="primary-button login-button" type="submit">Sign in <ChevronRight size={17} /></button></form><div className="or-divider"><span>or</span></div><button type="button" className="secondary-button demo-button" onClick={onLogin}><Sparkles size={16} /> Continue with demo account</button><p className="login-caption">By continuing, you agree to our Terms of Service and Privacy Policy.</p></div></div></div>;
}

function AppShell({ page, setPage, children, onLogout }: { page: Page; setPage: (page: Page) => void; children: React.ReactNode; onLogout: () => void }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  return <div className="app-shell"><aside className={cn("sidebar", collapsed && "sidebar-collapsed", mobileOpen && "sidebar-mobile-open")}><div className="sidebar-header"><Logo inverted /><button type="button" className="sidebar-collapse" onClick={() => setCollapsed(!collapsed)}><ChevronLeft size={16} className={collapsed ? "rotate-180" : ""} /></button></div><div className="sidebar-scroll"><nav>{navItems.map((item) => { const Icon = item.icon; return <div key={item.id}>{item.section && <div className="nav-section-label">{item.section}</div>}<button type="button" className={cn("nav-item", page === item.id && "nav-item-active")} onClick={() => { setPage(item.id); setMobileOpen(false); }}><Icon size={18} /><span>{item.label}</span>{item.id === "verify" && <span className="nav-badge">NEW</span>}</button></div>; })}</nav></div><div className="sidebar-footer"><div className="system-status"><span className="status-dot" /><span><strong>All systems operational</strong><small>Last sync 2 min ago</small></span></div><button type="button" className="sidebar-user" onClick={onLogout}><div className="avatar avatar-small">AM</div><span><strong>Alex Morgan</strong><small>Administrator</small></span><LogOut size={15} /></button></div></aside><main className={cn("main-content", collapsed && "main-content-expanded")}><header className="topbar"><button type="button" className="mobile-menu-button" onClick={() => setMobileOpen(!mobileOpen)}><Menu size={20} /></button><div className="breadcrumb"><span>Workspace</span><ChevronRight size={14} /><strong>{navItems.find((item) => item.id === page)?.label}</strong></div><div className="topbar-actions"><div className="topbar-search"><Search size={17} /><input placeholder="Search documents..." /><span>⌘ K</span></div><button type="button" className="icon-button notification-button"><Bell size={18} /><i /></button><div className="profile-menu-wrap"><button type="button" className="profile-trigger" onClick={() => setProfileOpen(!profileOpen)}><div className="avatar">AM</div><span><strong>Alex Morgan</strong><small>Administrator</small></span><ChevronDown size={15} /></button>{profileOpen && <div className="profile-menu"><button type="button" onClick={() => setPage("settings")}><UserRound size={15} /> Profile settings</button><button type="button" onClick={onLogout}><LogOut size={15} /> Sign out</button></div>}</div></div></header><div className="page-wrap">{children}</div></main></div>;
}

function PageHeader({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description?: string; action?: React.ReactNode }) {
  return <div className="page-header"><div><div className="eyebrow">{eyebrow ?? "DOCVERIFY AI / WORKSPACE"}</div><h1>{title}</h1>{description && <p>{description}</p>}</div>{action}</div>;
}

function StatCard({ icon: Icon, label, value, change, caption, tone }: { icon: IconType; label: string; value: string; change: string; caption: string; tone: string }) {
  return <div className="stat-card"><div className={cn("stat-icon", tone)}><Icon size={19} /></div><div className="stat-label"><span>{label}</span><strong>{value}</strong><small className={change.startsWith("-") ? "negative" : "positive"}>{change} <span>{caption}</span></small></div><MoreHorizontal size={17} className="muted-icon" /></div>;
}

function ChartCard({ title, subtitle, children, action }: { title: string; subtitle?: string; children: React.ReactNode; action?: React.ReactNode }) {
  return <section className="surface-card chart-card"><div className="card-heading"><div><h3>{title}</h3>{subtitle && <p>{subtitle}</p>}</div>{action}</div>{children}</section>;
}

function DashboardPage({ records, setPage, selectRecord }: { records: VerificationRecord[]; setPage: (page: Page) => void; selectRecord: (record: VerificationRecord) => void }) {
  const latest = records.slice(0, 5);
  return <div className="page-content"><PageHeader title="Good morning, Alex" description="Here’s what’s happening across your document trust workspace today." action={<button type="button" className="primary-button" onClick={() => setPage("verify")}><UploadCloud size={16} /> Verify a document</button>} /><div className="dashboard-alert"><div className="alert-icon"><Sparkles size={17} /></div><div><strong>Verification intelligence is healthy</strong><span>Your team has processed 186 documents this week with a 96.4% average confidence score.</span></div><button type="button" onClick={() => setPage("analytics")} className="alert-link">View analytics <ChevronRight size={14} /></button></div><div className="stats-grid"><StatCard icon={FileCheck2} label="Total documents verified" value="1,248" change="+12.8%" caption="vs last month" tone="blue" /><StatCard icon={ShieldCheck} label="Genuine documents" value="1,105" change="+8.4%" caption="vs last month" tone="green" /><StatCard icon={AlertTriangle} label="Tampered documents" value="143" change="-4.2%" caption="vs last month" tone="red" /><StatCard icon={Clock3} label="Pending verification" value="24" change="+3.1%" caption="in queue" tone="amber" /><StatCard icon={Activity} label="Average verification time" value="4.8s" change="-0.6s" caption="vs last month" tone="violet" /><StatCard icon={Gauge} label="Overall accuracy" value="96.4%" change="+1.2%" caption="vs last month" tone="teal" /></div><div className="dashboard-chart-grid"><ChartCard title="Verification overview" subtitle="Daily verified and flagged documents" action={<select className="select-compact" defaultValue="7"><option value="7">Last 7 days</option><option value="30">Last 30 days</option></select>}><div className="chart-legend-inline"><span><i className="legend-dot verified-dot" />Verified</span><span><i className="legend-dot tampered-dot" />Tampered</span><strong>+18.6% <small>vs previous period</small></strong></div><div className="chart-height"><ResponsiveContainer width="100%" height="100%"><AreaChart data={chartData} margin={{ top: 12, right: 6, left: -22, bottom: 0 }}><defs><linearGradient id="verifiedGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#2667ff" stopOpacity={0.2} /><stop offset="100%" stopColor="#2667ff" stopOpacity={0} /></linearGradient><linearGradient id="tamperedGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#ef7b73" stopOpacity={0.2} /><stop offset="100%" stopColor="#ef7b73" stopOpacity={0} /></linearGradient></defs><CartesianGrid vertical={false} stroke="#edf1f6" /><XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: "#94a2b8", fontSize: 11 }} /><YAxis tickLine={false} axisLine={false} tick={{ fill: "#94a2b8", fontSize: 11 }} /><Tooltip contentStyle={{ border: "1px solid #e8eef6", borderRadius: 12, boxShadow: "0 12px 30px rgba(27,44,75,.1)" }} /><Area type="monotone" dataKey="verified" stroke="#2667ff" strokeWidth={2.5} fill="url(#verifiedGradient)" /><Area type="monotone" dataKey="tampered" stroke="#ef7b73" strokeWidth={2.5} fill="url(#tamperedGradient)" /></AreaChart></ResponsiveContainer></div></ChartCard><ChartCard title="Decision distribution" subtitle="Rolling 30 day performance"><div className="donut-wrap"><ResponsiveContainer width="55%" height={190}><PieChart><Pie data={[{ name: "Verified", value: 88 }, { name: "Suspicious", value: 7 }, { name: "Tampered", value: 5 }]} innerRadius={56} outerRadius={78} paddingAngle={4} dataKey="value" stroke="none"><Cell fill="#2667ff" /><Cell fill="#f3b84b" /><Cell fill="#ef7b73" /></Pie><Tooltip /></PieChart></ResponsiveContainer><div className="donut-center"><strong>1,248</strong><span>documents</span></div><div className="donut-legend"><div><i style={{ background: "#2667ff" }} /><span>Verified</span><strong>88%</strong></div><div><i style={{ background: "#f3b84b" }} /><span>Suspicious</span><strong>7%</strong></div><div><i style={{ background: "#ef7b73" }} /><span>Tampered</span><strong>5%</strong></div></div></div></ChartCard></div><section className="surface-card activity-card"><div className="card-heading"><div><h3>Recent verification activity</h3><p>Latest documents processed across your workspace</p></div><button type="button" className="link-button" onClick={() => setPage("history")}>View all history <ChevronRight size={14} /></button></div><VerificationTable records={latest} onView={(record) => { selectRecord(record); setPage("ai"); }} compact /></section></div>;
}

function VerificationTable({ records, onView, compact = false }: { records: VerificationRecord[]; onView: (record: VerificationRecord) => void; compact?: boolean }) {
  return <div className="table-wrap"><table><thead><tr><th>Document</th><th>Type</th><th>Processed</th><th>OCR</th><th>Tampering</th><th>AI confidence</th><th>Decision</th><th /></tr></thead><tbody>{records.map((record) => <tr key={record.id}><td><div className="doc-cell"><div className="doc-thumb"><FileText size={16} /></div><div><strong>{record.fileName}</strong><small>{record.id}</small></div></div></td><td><span className="muted-text">{record.documentType}</span></td><td><span className="muted-text">{record.uploadedAt}</span></td><td><span className="score-text">{record.ocrConfidence}%</span></td><td><span className={cn("table-status", record.tamperingStatus === "CLEAR" ? "clear" : record.tamperingStatus === "DETECTED" ? "danger" : "warning")}><i />{record.tamperingStatus === "CLEAR" ? "Clear" : record.tamperingStatus === "DETECTED" ? "Detected" : "Review"}</span></td><td><strong className="confidence-value">{record.aiConfidence}%</strong></td><td><StatusBadge decision={record.decision} compact /></td><td><button type="button" className="row-action" onClick={() => onView(record)}>{compact ? "View" : "View details"} <ChevronRight size={14} /></button></td></tr>)}</tbody></table></div>;
}

function UploadPage({ onComplete, record }: { onComplete: (record: VerificationRecord) => void; record?: VerificationRecord }) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [docType, setDocType] = useState("Government ID");
  const [dragging, setDragging] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [step, setStep] = useState(-1);
  const [error, setError] = useState("");
  const selectFile = (file?: File) => {
    if (!file) return;
    if (!/[.]((jpg)|(jpeg)|(png)|(pdf))$/i.test(file.name)) { setError("Unsupported file format. Upload a JPG, PNG or PDF."); return; }
    if (file.size > 10 * 1024 * 1024) { setError("This file is larger than 10 MB. Please choose a smaller document."); return; }
    setError(""); setSelectedFile(file);
  };
  const startVerification = async () => {
    if (!selectedFile) { setError("Choose a document before starting verification."); return; }
    setProcessing(true); setStep(0);
    const interval = window.setInterval(() => setStep((current) => current < processingSteps.length - 1 ? current + 1 : current), 720);
    const result = await verifyMockDocument(selectedFile.name, docType);
    window.setTimeout(() => { window.clearInterval(interval); setProcessing(false); setStep(-1); onComplete(result); }, 5400);
  };
  if (processing) return <ProcessingView fileName={selectedFile?.name ?? "document"} step={step} />;
  return <div className="page-content"><PageHeader eyebrow="DOCVERIFY AI / VERIFY" title="Verify your document" description="Upload a document to run OCR, image forensics and AI-powered verification." /><div className="workflow-rail"><div className="workflow-active"><span>01</span><strong>Upload</strong></div><div><span>02</span><strong>Analyze</strong></div><div><span>03</span><strong>Decision</strong></div><div><span>04</span><strong>Report</strong></div></div><section className="surface-card upload-card"><div className="upload-card-heading"><div><h3>Upload source document</h3><p>Encrypted in transit. Your original file is never modified.</p></div><span className="secure-label"><ShieldCheck size={15} /> Secure upload</span></div><div className={cn("drop-zone", dragging && "drop-zone-active", selectedFile && "drop-zone-selected")} onDragOver={(event) => { event.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={(event) => { event.preventDefault(); setDragging(false); selectFile(event.dataTransfer.files?.[0]); }} onClick={() => fileInput.current?.click()}>{selectedFile ? <><div className="upload-success-icon"><Check size={22} /></div><strong>{selectedFile.name}</strong><span>{(selectedFile.size / 1024 / 1024).toFixed(2)} MB · Ready for analysis</span><button type="button" className="remove-upload" onClick={(event) => { event.stopPropagation(); setSelectedFile(null); }}><X size={14} /> Remove file</button></> : <><div className="upload-icon"><UploadCloud size={25} /></div><strong>Drop your document here, or <span>browse files</span></strong><span>JPG, JPEG, PNG or PDF · Max file size 10 MB</span></>}<input ref={fileInput} type="file" hidden accept=".jpg,.jpeg,.png,.pdf" onChange={(event) => selectFile(event.target.files?.[0])} /></div>{error && <div className="error-inline"><AlertTriangle size={15} />{error}<button type="button" onClick={() => setError("")}><X size={14} /></button></div>}<div className="upload-bottom"><label>Document type<select value={docType} onChange={(event) => setDocType(event.target.value)}><option>Government ID</option><option>Educational Certificate</option><option>Address Proof</option><option>Employee ID</option></select></label><div className="upload-actions"><button type="button" className="secondary-button" onClick={() => { setSelectedFile(null); setError(""); }}><RotateCcw size={15} /> Reset</button><button type="button" className="primary-button" onClick={startVerification}><ShieldCheck size={16} /> Verify document <ChevronRight size={15} /></button></div></div></section><div className="demo-shortcuts"><div><Sparkles size={16} /><span><strong>Need a fast demo?</strong> Load a sample document to see the full analysis flow.</span></div><div className="demo-buttons"><button type="button" onClick={() => { const demo = new File(["demo"], "aadhaar_front.png", { type: "image/png" }); selectFile(demo); setDocType("Government ID"); }}>Genuine ID</button><button type="button" onClick={() => { const demo = new File(["demo"], "marksheet_revised.jpg", { type: "image/jpeg" }); selectFile(demo); setDocType("Educational Certificate"); }}>Tampered sample</button></div></div>{record && <div className="last-result-strip"><div className="mini-result-icon"><CheckCircle2 size={17} /></div><div><strong>Last verification: {record.fileName}</strong><span>{record.overallConfidence}% confidence · {record.decision.toLowerCase()} decision</span></div><button type="button" className="link-button" onClick={() => onComplete(record)}>View result <ChevronRight size={14} /></button></div>}</div>;
}

function ProcessingView({ fileName, step }: { fileName: string; step: number }) {
  const progress = Math.min(100, Math.round(((step + 1) / processingSteps.length) * 100));
  return <div className="page-content processing-page"><div className="processing-intro"><div className="processing-orb"><div className="orb-inner"><BrainCircuit size={30} /></div></div><div className="eyebrow">LIVE ANALYSIS / {fileName}</div><h1>Reading the signals<br /><span>behind your document.</span></h1><p>DocVerify AI is combining OCR, structural validation and image-forensics evidence. This usually takes less than 10 seconds.</p></div><section className="surface-card processing-card"><div className="processing-header"><div><h3>Verification pipeline</h3><p>Do not close this window while analysis is in progress.</p></div><strong>{progress}%</strong></div><div className="pipeline-progress"><div style={{ width: `${progress}%` }} /></div><div className="processing-steps">{processingSteps.map((item, index) => { const state = index < step ? "complete" : index === step ? "active" : "pending"; return <div className={cn("processing-step", state)} key={item.label}><div className="step-icon">{state === "complete" ? <Check size={15} /> : state === "active" ? <span className="spinner" /> : <span>{String(index + 1).padStart(2, "0")}</span>}</div><div><strong>{item.label}</strong><span>{state === "active" ? item.detail : state === "complete" ? "Completed successfully" : "Queued"}</span></div><div className="step-state">{state === "complete" ? "Complete" : state === "active" ? "Processing" : "Pending"}</div></div>; })}</div><div className="processing-note"><Info size={15} /><span>Mock service layer active · Ready for FastAPI, Tesseract and OpenCV integration</span></div></section></div>;
}

function OCRPage({ record }: { record: VerificationRecord }) {
  const [copied, setCopied] = useState(false);
  return <div className="page-content"><PageHeader eyebrow="DOCVERIFY AI / OCR" title="OCR results" description="Review extracted fields and text before making a decision." action={<button type="button" className="secondary-button" onClick={() => navigator.clipboard?.writeText(record.extractedText).then(() => setCopied(true))}><Copy size={15} /> {copied ? "Copied" : "Copy text"}</button>} /><div className="ocr-layout"><section className="surface-card preview-card"><div className="card-heading"><div><h3>Original document</h3><p>Source image with recognized regions</p></div><span className="badge-light">Page 1 / 1</span></div><DocumentPreview record={record} compact /></section><section className="surface-card extracted-card"><div className="card-heading"><div><h3>Extracted information</h3><p>Fields detected by the OCR engine</p></div><ScoreRing score={record.ocrConfidence} size={82} color="#26a27c" label="OCR" /></div><div className="field-grid">{Object.entries(record.fields).map(([key, value]) => <div className={cn("extracted-field", (key === "Address" && record.ocrConfidence < 90) && "field-review")} key={key}><span>{key}</span><strong>{value}</strong>{key === "Address" && record.ocrConfidence < 90 && <em><AlertTriangle size={12} /> Manual review</em>}</div>)}</div><div className="text-extract"><div className="extract-heading"><strong>Extracted text</strong><div><button type="button" onClick={() => setCopied(true)}><Copy size={13} /> Copy</button><button type="button"><PenLine size={13} /> Edit</button></div></div><textarea value={record.extractedText} readOnly /></div><div className="card-footer-actions"><button type="button" className="secondary-button" onClick={() => setCopied(true)}><Copy size={15} /> {copied ? "Copied to clipboard" : "Copy full text"}</button><button type="button" className="primary-button"><Download size={15} /> Export .txt</button></div></section></div><div className="info-strip"><Info size={16} /><span>OCR confidence is calculated from character certainty, field boundaries and document language models.</span><strong>{record.ocrConfidence >= 90 ? "High confidence" : "Requires manual verification"}</strong></div></div>;
}

function ForensicsPanel({ record }: { record: VerificationRecord }) {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(record.regions[0]?.id ?? null);
  const riskColor = record.riskLevel === "HIGH" ? "#ef7b73" : record.riskLevel === "MEDIUM" ? "#f3b84b" : "#26a27c";
  return <div className="page-content"><PageHeader eyebrow="DOCVERIFY AI / FORENSICS" title="Tampering detection" description="Inspect the image-forensics signals behind the decision." action={<div className={cn("risk-pill", `risk-${record.riskLevel.toLowerCase()}`)}><span className="risk-dot" /> Risk level: {record.riskLevel}</div>} /><section className={cn("forensics-banner", record.tamperingStatus === "CLEAR" ? "forensics-clear" : record.riskLevel === "HIGH" ? "forensics-danger" : "forensics-warning")}><div className="forensics-status-icon">{record.tamperingStatus === "CLEAR" ? <ShieldCheck size={28} /> : <AlertTriangle size={28} />}</div><div><span>OVERALL TAMPERING RESULT</span><h2>{record.tamperingStatus === "CLEAR" ? "No tampering detected" : record.tamperingStatus === "DETECTED" ? "Tampering detected" : "Potential tampering detected"}</h2><p>{record.detectionReason}</p></div><div className="forensics-score"><strong>{100 - record.tamperingRisk}%</strong><span>integrity score</span></div></section><div className="forensics-grid"><section className="surface-card"><div className="card-heading"><div><h3>Error level analysis</h3><p>Compression consistency map</p></div><span className="score-chip" style={{ color: riskColor }}>{record.elaScore}% ELA score</span></div><div className="ela-grid"><div className="ela-tile original"><DocumentPreview record={record} compact /></div><div className="ela-tile"><div className="ela-visual"><div className="ela-noise" /><div className="ela-highlight h1" /><div className="ela-highlight h2" /><div className="ela-highlight h3" /><span>ELA HEATMAP</span></div></div></div><p className="explanation-copy">Error Level Analysis identifies regions with inconsistent compression levels that may indicate possible image manipulation.</p><div className="forensics-metrics"><div><span>Suspicious regions</span><strong>{record.regions.length}</strong></div><div><span>ELA detection rate</span><strong>{record.elaScore}%</strong></div><div><span>Analysis latency</span><strong>1.7s</strong></div></div></section><section className="surface-card"><div className="card-heading"><div><h3>Copy-move detection</h3><p>Duplicated region analysis</p></div><span className="score-chip" style={{ color: riskColor }}>{record.copyMoveScore}% match score</span></div><div className="copy-move-preview"><DocumentPreview record={record} selectedRegion={selectedRegion} onRegionClick={(region) => setSelectedRegion(region.id)} compact /></div><div className="region-list">{record.regions.length ? record.regions.map((region) => <button type="button" key={region.id} className={cn("region-row", selectedRegion === region.id && "region-row-selected")} onClick={() => setSelectedRegion(region.id)}><span className={cn("region-index", region.risk === "HIGH" ? "index-high" : "index-medium")}>{region.id}</span><span><strong>{region.type}</strong><small>{region.location}</small></span><b>{region.confidence}%</b><ChevronRight size={14} /></button>) : <div className="empty-mini"><ShieldCheck size={21} /><strong>No matching regions found</strong><span>The document passed the copy-move analysis.</span></div>}</div></section></div><section className="surface-card detection-summary"><div className="card-heading"><div><h3>Detection signal summary</h3><p>Weighted evidence from image-forensics services</p></div><button type="button" className="secondary-button"><Download size={15} /> Export evidence</button></div><div className="signal-grid"><ProgressBar label="ELA consistency" score={record.elaScore} color="#2667ff" /><ProgressBar label="Copy-move integrity" score={record.copyMoveScore} color="#7c66e8" /><ProgressBar label="Metadata consistency" score={Math.max(30, 100 - record.tamperingRisk)} color="#26a27c" /><ProgressBar label="Visual structure" score={record.validationScore} color="#e6a73a" /></div></section></div>;
}

function AIVerificationPage({ record, setPage }: { record: VerificationRecord; setPage: (page: Page) => void }) {
  const accent = record.decision === "VERIFIED" ? "#26a27c" : record.decision === "SUSPICIOUS" ? "#e6a73a" : "#ef7b73";
  return <div className="page-content"><PageHeader eyebrow="DOCVERIFY AI / DECISION ENGINE" title="AI verification result" description="An explainable decision assembled from every verification signal." action={<button type="button" className="secondary-button" onClick={() => setPage("reports")}><FileText size={15} /> Open report</button>} /><section className={cn("result-hero", `result-${record.decision.toLowerCase()}`)}><div className="result-hero-main"><div className="result-icon">{record.decision === "VERIFIED" ? <CheckCircle2 size={30} /> : record.decision === "SUSPICIOUS" ? <AlertTriangle size={30} /> : <XCircle size={30} />}</div><div><span>FINAL DECISION / {record.id}</span><h2>{record.decision === "VERIFIED" ? "Document verified" : record.decision === "SUSPICIOUS" ? "Manual review recommended" : "Verification failed"}</h2><p>{record.explanation}</p></div></div><div className="result-hero-score"><ScoreRing score={record.overallConfidence} size={126} color={accent} label="confidence" /></div></section><div className="ai-layout"><section className="surface-card"><div className="card-heading"><div><h3>Confidence breakdown</h3><p>How the decision engine arrived at this result</p></div><span className="calculated-badge"><Activity size={14} /> Calculated</span></div><div className="confidence-list"><ProgressBar label="OCR extraction" score={record.ocrConfidence} color="#2667ff" /><ProgressBar label="Document validation" score={record.validationScore} color="#7c66e8" /><ProgressBar label="ELA consistency" score={record.elaScore} color="#26a27c" /><ProgressBar label="Copy-move integrity" score={record.copyMoveScore} color="#e6a73a" /><ProgressBar label="Tampering safety" score={100 - record.tamperingRisk} color="#1e9e79" /><ProgressBar label="AI confidence" score={record.aiConfidence} color="#2667ff" /></div><div className="formula-note"><span>Weighted confidence score</span><strong>{record.overallConfidence}%</strong><small>OCR 20% · Validation 20% · ELA 20% · Copy-move 15% · AI 25%</small></div></section><section className="surface-card ai-explanation"><div className="ai-badge"><BrainCircuit size={19} /></div><div className="eyebrow">AI ANALYSIS</div><h3>Why this decision?</h3><p>{record.explanation}</p><div className="decision-checks"><CheckItem label="OCR extraction" status={record.ocrStatus === "PASSED" ? "passed" : "review"} /><CheckItem label="Document validation" status={record.validationScore > 75 ? "passed" : "failed"} /><CheckItem label="ELA analysis" status={record.elaScore > 70 ? "passed" : "review"} /><CheckItem label="Copy-move detection" status={record.copyMoveScore > 70 ? "passed" : "failed"} /><CheckItem label="Tampering detection" status={record.tamperingRisk < 25 ? "passed" : record.tamperingRisk < 55 ? "review" : "failed"} /></div></section></div><div className="result-actions"><button type="button" className="primary-button" onClick={() => setPage("reports")}><FileText size={16} /> View detailed report</button><button type="button" className="secondary-button" onClick={() => setPage("history")}><History size={16} /> View verification history</button><button type="button" className="secondary-button" onClick={() => setPage("verify")}><Plus size={16} /> Verify another document</button></div></div>;
}

function CheckItem({ label, status }: { label: string; status: "passed" | "review" | "failed" }) {
  return <div className="check-item"><span className={cn("check-icon", `check-${status}`)}>{status === "passed" ? <Check size={12} /> : status === "review" ? <AlertTriangle size={12} /> : <X size={12} />}</span><span>{label}</span><strong>{status === "passed" ? "Passed" : status === "review" ? "Review" : "Failed"}</strong></div>;
}

function HistoryPage({ records, selectRecord, setPage }: { records: VerificationRecord[]; selectRecord: (record: VerificationRecord) => void; setPage: (page: Page) => void }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("ALL");
  const [type, setType] = useState("ALL");
  const filtered = records.filter((record) => record.fileName.toLowerCase().includes(query.toLowerCase()) && (status === "ALL" || record.decision === status) && (type === "ALL" || record.documentType === type));
  const types = Array.from(new Set(records.map((record) => record.documentType)));
  return <div className="page-content"><PageHeader eyebrow="DOCVERIFY AI / MANAGE" title="Verification history" description="A searchable audit trail for every document your workspace has processed." action={<button type="button" className="primary-button" onClick={() => setPage("verify")}><Plus size={16} /> New verification</button>} /><div className="history-toolbar"><div className="search-field"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by filename or report ID..." /></div><div className="filter-selects"><select value={type} onChange={(event) => setType(event.target.value)}><option value="ALL">All document types</option>{types.map((item) => <option key={item}>{item}</option>)}</select><select value={status} onChange={(event) => setStatus(event.target.value)}><option value="ALL">All decisions</option><option value="VERIFIED">Verified</option><option value="SUSPICIOUS">Suspicious</option><option value="TAMPERED">Tampered</option></select><button type="button" className="secondary-button"><Filter size={15} /> More filters</button></div></div><section className="surface-card history-card"><div className="history-meta"><span>Showing <strong>{filtered.length}</strong> of {records.length} verification records</span><button type="button" className="sort-button"><ListFilter size={15} /> Sort: newest first <ChevronDown size={14} /></button></div>{filtered.length ? <VerificationTable records={filtered} onView={(record) => { selectRecord(record); setPage("ai"); }} /> : <div className="empty-state"><Search size={24} /><h3>No matching verifications</h3><p>Try changing your search or filter criteria.</p><button type="button" className="secondary-button" onClick={() => { setQuery(""); setStatus("ALL"); setType("ALL"); }}>Clear filters</button></div>}<div className="pagination"><span>Page 1 of 1</span><div><button type="button" disabled><ChevronLeft size={15} /></button><button type="button" className="active-page">1</button><button type="button" disabled><ChevronRight size={15} /></button></div></div></section></div>;
}

function AnalyticsPage() {
  return <div className="page-content"><PageHeader eyebrow="DOCVERIFY AI / INTELLIGENCE" title="Analytics" description="Performance signals across OCR, image forensics and AI decisioning." action={<button type="button" className="secondary-button"><CalendarDays size={15} /> Jun 01 – Jun 30, 2026 <ChevronDown size={14} /></button>} /><div className="analytics-kpis"><div><span>Total documents</span><strong>1,248</strong><small>+12.8% <em>vs last month</em></small></div><div><span>Genuine documents</span><strong>1,105</strong><small>88.5% <em>of all documents</em></small></div><div><span>Tampered documents</span><strong>143</strong><small>11.5% <em>of all documents</em></small></div><div><span>Average confidence</span><strong>96.4%</strong><small>+1.2% <em>vs last month</em></small></div></div><div className="analytics-chart-grid"><ChartCard title="Weekly verification trend" subtitle="Document volume and average confidence"><div className="chart-height chart-height-large"><ResponsiveContainer width="100%" height="100%"><LineChart data={weeklyData} margin={{ top: 12, right: 10, left: -22, bottom: 0 }}><CartesianGrid vertical={false} stroke="#edf1f6" /><XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: "#94a2b8", fontSize: 11 }} /><YAxis yAxisId="left" tickLine={false} axisLine={false} tick={{ fill: "#94a2b8", fontSize: 11 }} /><YAxis yAxisId="right" orientation="right" domain={[85, 100]} tickLine={false} axisLine={false} tick={{ fill: "#94a2b8", fontSize: 11 }} /><Tooltip /><Legend /><Bar yAxisId="left" dataKey="documents" name="Documents" fill="#dbe7ff" radius={[5, 5, 0, 0]} barSize={28} /><Line yAxisId="right" type="monotone" dataKey="confidence" name="Confidence %" stroke="#2667ff" strokeWidth={2.5} dot={{ fill: "#2667ff", r: 4 }} /></LineChart></ResponsiveContainer></div></ChartCard><ChartCard title="Monthly volume" subtitle="Document throughput over time"><div className="chart-height chart-height-large"><ResponsiveContainer width="100%" height="100%"><BarChart data={monthlyData} margin={{ top: 12, right: 5, left: -22, bottom: 0 }}><CartesianGrid vertical={false} stroke="#edf1f6" /><XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: "#94a2b8", fontSize: 11 }} /><YAxis tickLine={false} axisLine={false} tick={{ fill: "#94a2b8", fontSize: 11 }} /><Tooltip /><Bar dataKey="documents" name="All documents" fill="#2667ff" radius={[6, 6, 0, 0]} /><Bar dataKey="verified" name="Verified" fill="#81b6ff" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer></div></ChartCard></div><div className="analytics-detail-grid"><section className="surface-card metric-list-card"><div className="card-heading"><div><h3>Tampering analytics</h3><p>Forensics health signals</p></div><Shield size={18} className="heading-icon" /></div><MetricLine label="ELA detection rate" value="7.8%" progress={78} color="#7c66e8" /><MetricLine label="Copy-move detection rate" value="5.4%" progress={54} color="#e6a73a" /><MetricLine label="Overall tampering detection" value="96.2%" progress={96} color="#26a27c" /><MetricLine label="High-risk document percentage" value="2.1%" progress={21} color="#ef7b73" /></section><section className="surface-card metric-list-card"><div className="card-heading"><div><h3>OCR analytics</h3><p>Extraction reliability</p></div><FileSearch2 size={18} className="heading-icon" /></div><MetricLine label="OCR success rate" value="98.7%" progress={99} color="#2667ff" /><MetricLine label="Average OCR confidence" value="96.4%" progress={96} color="#26a27c" /><MetricLine label="Low-confidence documents" value="1.3%" progress={13} color="#f3b84b" /><MetricLine label="Avg. extraction latency" value="1.8s" progress={72} color="#7c66e8" /></section><section className="surface-card metric-list-card"><div className="card-heading"><div><h3>AI performance</h3><p>Decision engine quality</p></div><BrainCircuit size={18} className="heading-icon" /></div><MetricLine label="Overall accuracy" value="96.4%" progress={96} color="#2667ff" /><MetricLine label="Average confidence" value="93.8%" progress={94} color="#26a27c" /><MetricLine label="Successful verification rate" value="91.2%" progress={91} color="#7c66e8" /><MetricLine label="Manual review rate" value="8.8%" progress={9} color="#e6a73a" /></section></div></div>;
}

function MetricLine({ label, value, progress, color }: { label: string; value: string; progress: number; color: string }) { return <div className="metric-line"><div><span>{label}</span><strong>{value}</strong></div><div className="metric-track"><div style={{ width: `${progress}%`, background: color }} /></div></div>; }

function ReportsPage({ record, setPage }: { record: VerificationRecord; setPage: (page: Page) => void }) {
  const reports = [record, ...demoRecords.filter((item) => item.id !== record.id).slice(0, 4)];
  return <div className="page-content"><PageHeader eyebrow="DOCVERIFY AI / REPORTING" title="Reports" description="Exportable evidence packages for every verification decision." action={<button type="button" className="primary-button" onClick={() => setPage("verify")}><Plus size={16} /> New verification</button>} /><section className="surface-card reports-card"><div className="card-heading"><div><h3>Generated reports</h3><p>PDF-ready records with chain-of-evidence details</p></div><div className="report-count"><FileText size={15} /> {reports.length} reports</div></div><div className="report-list">{reports.map((item, index) => <div className="report-row" key={item.id}><div className="report-icon"><FileText size={18} /></div><div className="report-main"><strong>Verification report · {item.fileName}</strong><span>{item.id} · Generated {item.uploadedAt}</span></div><StatusBadge decision={item.decision} compact /><strong className="report-confidence">{item.overallConfidence}%</strong><button type="button" className="report-action" onClick={() => { selectRecordGlobal(item); setPage("ai"); }}>View <Eye size={14} /></button><button type="button" className="report-action" onClick={() => window.print()}><Download size={14} /> Download</button><button type="button" className="more-button"><MoreHorizontal size={17} /></button></div>)}</div></section><ReportPreview record={record} /></div>;
  function selectRecordGlobal(item: VerificationRecord) { window.dispatchEvent(new CustomEvent("docverify:select", { detail: item })); }
}

function ReportPreview({ record }: { record: VerificationRecord }) {
  return <section className="surface-card report-preview"><div className="report-preview-top"><div><span className="eyebrow">REPORT PREVIEW / {record.id}</span><h3>Document Verification Report</h3><p>Prepared by DocVerify AI · {record.uploadedAt}</p></div><div className="report-actions"><button type="button" className="secondary-button" onClick={() => window.print()}><Download size={15} /> Download PDF</button><button type="button" className="secondary-button" onClick={() => window.print()}><FileText size={15} /> Print report</button></div></div><div className="report-preview-body"><div className="report-cover"><Logo /><span>FINAL DECISION</span><h2>{record.decision}</h2><p>{record.explanation}</p><ScoreRing score={record.overallConfidence} size={108} color={record.decision === "VERIFIED" ? "#26a27c" : "#e6a73a"} label="confidence" /></div><div className="report-sections"><div><strong>Document information</strong><p>{record.fileName} · {record.documentType} · {record.size}</p></div><div><strong>OCR extraction</strong><p>{record.ocrConfidence}% confidence · {Object.keys(record.fields).length} fields recognized</p></div><div><strong>Image forensics</strong><p>ELA score {record.elaScore}% · Copy-move score {record.copyMoveScore}% · {record.regions.length} regions flagged</p></div><div><strong>AI verification</strong><p>Weighted confidence {record.overallConfidence}% · {record.riskLevel} risk</p></div></div></div></section>;
}

function SettingsPage() {
  const [saved, setSaved] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  return <div className="page-content"><PageHeader eyebrow="DOCVERIFY AI / SYSTEM" title="Settings" description="Configure how your workspace handles verification signals and notifications." action={<button type="button" className="primary-button" onClick={() => { setSaved(true); window.setTimeout(() => setSaved(false), 1800); }}>{saved ? <Check size={16} /> : <CheckCircle2 size={16} />} {saved ? "Changes saved" : "Save changes"}</button>} /><div className="settings-layout"><div className="settings-nav"><span className="settings-nav-active"><UserRound size={15} /> Profile</span><span><SlidersHorizontal size={15} /> Verification</span><span><Bell size={15} /> Notifications</span><span><Sparkles size={15} /> Appearance</span><span><ShieldCheck size={15} /> Security</span></div><div className="settings-stack"><section className="surface-card settings-card"><div className="settings-heading"><div><h3>Profile</h3><p>How you appear across the workspace</p></div><div className="avatar avatar-large">AM</div></div><div className="settings-fields"><label>Full name<input defaultValue="Alex Morgan" /></label><label>Email address<input defaultValue="alex.morgan@northstar.co" /></label><label>Role<select defaultValue="Administrator"><option>Administrator</option><option>Analyst</option><option>Reviewer</option></select></label></div></section><section className="surface-card settings-card"><div className="settings-heading"><div><h3>Verification thresholds</h3><p>Fine-tune when signals require manual review</p></div><SlidersHorizontal size={19} className="heading-icon" /></div><label className="range-setting"><span><strong>OCR confidence threshold</strong><small>Flag extracted fields below this score</small></span><input type="range" min="60" max="99" defaultValue="85" /><b>85%</b></label><label className="range-setting"><span><strong>Tampering sensitivity</strong><small>Higher sensitivity catches subtler edits</small></span><input type="range" min="40" max="99" defaultValue="78" /><b>78%</b></label><label className="range-setting"><span><strong>AI confidence threshold</strong><small>Required to automatically mark verified</small></span><input type="range" min="60" max="99" defaultValue="90" /><b>90%</b></label></section><section className="surface-card settings-card"><div className="settings-heading"><div><h3>Notifications</h3><p>Choose which events reach your inbox</p></div><Bell size={19} className="heading-icon" /></div><ToggleRow label="Verification completed" description="Notify me when a document finishes processing" defaultOn /><ToggleRow label="Tampering detected" description="Send an alert for high-risk forensics signals" defaultOn /><ToggleRow label="Report generated" description="Notify me when a report is ready to download" defaultOn /></section><section className="surface-card settings-card"><div className="settings-heading"><div><h3>Appearance</h3><p>Make the workspace feel like yours</p></div><Sparkles size={19} className="heading-icon" /></div><ToggleRow label="Dark mode" description="Use a darker workspace theme" on={darkMode} onChange={() => setDarkMode(!darkMode)} /><ToggleRow label="Compact layout" description="Show more rows and data per screen" /></section></div></div></div>;
}

function ToggleRow({ label, description, defaultOn = false, on, onChange }: { label: string; description: string; defaultOn?: boolean; on?: boolean; onChange?: () => void }) { const [internal, setInternal] = useState(defaultOn); const active = on ?? internal; return <div className="toggle-row"><div><strong>{label}</strong><span>{description}</span></div><button type="button" aria-pressed={active} className={cn("toggle", active && "toggle-on")} onClick={() => { setInternal(!internal); onChange?.(); }}><i /></button></div>; }

function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [page, setPage] = useState<Page>("dashboard");
  const [records, setRecords] = useState<VerificationRecord[]>(demoRecords);
  const [selectedRecord, setSelectedRecord] = useState<VerificationRecord>(demoRecords[0]);
  useEffect(() => { const handler = (event: Event) => { const custom = event as CustomEvent<VerificationRecord>; if (custom.detail) setSelectedRecord(custom.detail); }; window.addEventListener("docverify:select", handler); return () => window.removeEventListener("docverify:select", handler); }, []);
  const handleComplete = (record: VerificationRecord) => { setRecords((current) => [record, ...current.filter((item) => item.id !== record.id)]); setSelectedRecord(record); setPage("ai"); };
  if (!authenticated) return <LoginPage onLogin={() => setAuthenticated(true)} />;
  const pageContent = page === "dashboard" ? <DashboardPage records={records} setPage={setPage} selectRecord={setSelectedRecord} /> : page === "verify" ? <UploadPage onComplete={handleComplete} record={selectedRecord} /> : page === "ocr" ? <OCRPage record={selectedRecord} /> : page === "tampering" ? <ForensicsPanel record={selectedRecord} /> : page === "ai" ? <AIVerificationPage record={selectedRecord} setPage={setPage} /> : page === "history" ? <HistoryPage records={records} selectRecord={setSelectedRecord} setPage={setPage} /> : page === "analytics" ? <AnalyticsPage /> : page === "reports" ? <ReportsPage record={selectedRecord} setPage={setPage} /> : <SettingsPage />;
  return <AppShell page={page} setPage={setPage} onLogout={() => setAuthenticated(false)}>{pageContent}</AppShell>;
}

export default App;
