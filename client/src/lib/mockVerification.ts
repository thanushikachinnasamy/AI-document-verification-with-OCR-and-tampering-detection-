export type Decision = "VERIFIED" | "SUSPICIOUS" | "TAMPERED";
export type Risk = "LOW" | "MEDIUM" | "HIGH";

export type SuspiciousRegion = {
  id: string;
  location: string;
  type: string;
  confidence: number;
  risk: Risk;
  x: number;
  y: number;
  width: number;
  height: number;
};

export type VerificationRecord = {
  id: string;
  fileName: string;
  documentType: string;
  uploadedAt: string;
  size: string;
  ocrConfidence: number;
  validationScore: number;
  elaScore: number;
  copyMoveScore: number;
  tamperingRisk: number;
  aiConfidence: number;
  overallConfidence: number;
  decision: Decision;
  ocrStatus: "PASSED" | "REVIEW";
  tamperingStatus: "CLEAR" | "SUSPICIOUS" | "DETECTED";
  riskLevel: Risk;
  detectionReason: string;
  explanation: string;
  fields: Record<string, string>;
  extractedText: string;
  regions: SuspiciousRegion[];
};

const now = new Date();
const formatDate = (offsetHours: number) => {
  const date = new Date(now.getTime() - offsetHours * 60 * 60 * 1000);
  return date.toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
};

const fieldSet = (name: string, number: string, type: string) => ({
  "Full Name": name,
  "Document Number": number,
  "Date of Birth": "14 / 08 / 1998",
  Address: "24 Lakeview Road, Pune, Maharashtra 411001",
  "Issue Date": "12 / 06 / 2022",
  "Expiry Date": "11 / 06 / 2032",
  "Document Type": type,
});

const textFor = (name: string, number: string, type: string) =>
  `GOVERNMENT OF INDIA\n${type.toUpperCase()}\n\nName: ${name}\nDocument No: ${number}\nDate of Birth: 14 / 08 / 1998\nAddress: 24 Lakeview Road, Pune, Maharashtra 411001\nIssue Date: 12 / 06 / 2022\nExpiry Date: 11 / 06 / 2032\n\nThis document has been digitally issued and verified by DocVerify AI.`;

export const demoRecords: VerificationRecord[] = [
  {
    id: "DV-24091",
    fileName: "aadhaar_front.png",
    documentType: "Government ID",
    uploadedAt: formatDate(1),
    size: "1.8 MB",
    ocrConfidence: 98,
    validationScore: 97,
    elaScore: 96,
    copyMoveScore: 99,
    tamperingRisk: 4,
    aiConfidence: 97,
    overallConfidence: 97,
    decision: "VERIFIED",
    ocrStatus: "PASSED",
    tamperingStatus: "CLEAR",
    riskLevel: "LOW",
    detectionReason: "No inconsistent compression or duplicated regions detected.",
    explanation: "Based on OCR consistency, document structure, image analysis and tampering checks, the document appears authentic.",
    fields: fieldSet("Aarav Mehta", "XXXX XXXX 3892", "Aadhaar Card"),
    extractedText: textFor("Aarav Mehta", "XXXX XXXX 3892", "Aadhaar Card"),
    regions: [],
  },
  {
    id: "DV-24090",
    fileName: "degree_certificate.pdf",
    documentType: "Educational Certificate",
    uploadedAt: formatDate(5),
    size: "2.4 MB",
    ocrConfidence: 96,
    validationScore: 94,
    elaScore: 95,
    copyMoveScore: 97,
    tamperingRisk: 7,
    aiConfidence: 95,
    overallConfidence: 95,
    decision: "VERIFIED",
    ocrStatus: "PASSED",
    tamperingStatus: "CLEAR",
    riskLevel: "LOW",
    detectionReason: "Certificate typography and seal regions are internally consistent.",
    explanation: "The certificate aligns with expected structure and the visual analysis found no signs of manipulation.",
    fields: fieldSet("Nisha Kulkarni", "SPPU / BTECH / 21-0841", "B.Tech Certificate"),
    extractedText: textFor("Nisha Kulkarni", "SPPU / BTECH / 21-0841", "B.Tech Certificate"),
    regions: [],
  },
  {
    id: "DV-24087",
    fileName: "utility_bill_march.jpg",
    documentType: "Address Proof",
    uploadedAt: formatDate(22),
    size: "963 KB",
    ocrConfidence: 92,
    validationScore: 90,
    elaScore: 88,
    copyMoveScore: 93,
    tamperingRisk: 13,
    aiConfidence: 91,
    overallConfidence: 91,
    decision: "VERIFIED",
    ocrStatus: "PASSED",
    tamperingStatus: "CLEAR",
    riskLevel: "LOW",
    detectionReason: "Minor scan artifacts, but no evidence of targeted manipulation.",
    explanation: "The address proof is consistent with a genuine scanned utility bill. Minor scan artifacts do not affect the decision.",
    fields: fieldSet("Aarav Mehta", "MSEDCL / 2024 / 33821", "Electricity Bill"),
    extractedText: textFor("Aarav Mehta", "MSEDCL / 2024 / 33821", "Electricity Bill"),
    regions: [],
  },
  {
    id: "DV-24086",
    fileName: "employee_badge_scan.png",
    documentType: "Employee ID",
    uploadedAt: formatDate(29),
    size: "1.2 MB",
    ocrConfidence: 86,
    validationScore: 82,
    elaScore: 64,
    copyMoveScore: 72,
    tamperingRisk: 39,
    aiConfidence: 79,
    overallConfidence: 79,
    decision: "SUSPICIOUS",
    ocrStatus: "REVIEW",
    tamperingStatus: "SUSPICIOUS",
    riskLevel: "MEDIUM",
    detectionReason: "Background compression differs around the portrait and employee number.",
    explanation: "Potential inconsistencies were detected in the document. Image analysis indicates possible manipulation and requires further verification.",
    fields: fieldSet("Rohan Desai", "DV / EMP / 0821", "Employee Identity Card"),
    extractedText: textFor("Rohan Desai", "DV / EMP / 0821", "Employee Identity Card"),
    regions: [
      { id: "R1", location: "Portrait block · x: 68, y: 24", type: "ELA inconsistency", confidence: 78, risk: "MEDIUM", x: 67, y: 19, width: 21, height: 32 },
      { id: "R2", location: "Employee number · x: 42, y: 72", type: "Copy-move candidate", confidence: 71, risk: "MEDIUM", x: 36, y: 68, width: 34, height: 10 },
    ],
  },
  {
    id: "DV-24082",
    fileName: "marksheet_revised.jpg",
    documentType: "Educational Certificate",
    uploadedAt: formatDate(44),
    size: "2.1 MB",
    ocrConfidence: 84,
    validationScore: 61,
    elaScore: 36,
    copyMoveScore: 42,
    tamperingRisk: 78,
    aiConfidence: 31,
    overallConfidence: 31,
    decision: "TAMPERED",
    ocrStatus: "REVIEW",
    tamperingStatus: "DETECTED",
    riskLevel: "HIGH",
    detectionReason: "Multiple pasted regions and inconsistent compression around final marks.",
    explanation: "Potential inconsistencies were detected in the document. Multiple image-forensics signals indicate likely manipulation and the document should not be accepted without manual review.",
    fields: fieldSet("Priya Shah", "UNI / 2020 / 1148", "University Marksheet"),
    extractedText: textFor("Priya Shah", "UNI / 2020 / 1148", "University Marksheet"),
    regions: [
      { id: "R1", location: "Final marks table · x: 12, y: 58", type: "ELA inconsistency", confidence: 94, risk: "HIGH", x: 9, y: 55, width: 79, height: 18 },
      { id: "R2", location: "Registrar stamp · x: 69, y: 80", type: "Copy-move match", confidence: 91, risk: "HIGH", x: 66, y: 76, width: 23, height: 15 },
      { id: "R3", location: "Student name · x: 18, y: 26", type: "Font mismatch", confidence: 84, risk: "HIGH", x: 14, y: 22, width: 38, height: 9 },
    ],
  },
];

export function calculateOverall(scores: Pick<VerificationRecord, "ocrConfidence" | "validationScore" | "elaScore" | "copyMoveScore" | "aiConfidence">) {
  const weighted = scores.ocrConfidence * 0.2 + scores.validationScore * 0.2 + scores.elaScore * 0.2 + scores.copyMoveScore * 0.15 + scores.aiConfidence * 0.25;
  return Math.round(weighted);
}

export async function verifyMockDocument(fileName: string, documentType = "Government ID"): Promise<VerificationRecord> {
  await new Promise((resolve) => setTimeout(resolve, 400));
  const isTampered = /tamper|revised|edited|fake/i.test(fileName);
  const isSuspicious = /employee|badge|scan/i.test(fileName);
  const template = isTampered ? demoRecords[4] : isSuspicious ? demoRecords[3] : demoRecords[0];
  const name = fileName.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
  const overallConfidence = calculateOverall(template);
  return {
    ...template,
    id: `DV-${Math.floor(24100 + Math.random() * 800)}`,
    fileName,
    documentType,
    uploadedAt: "Just now",
    size: "1.6 MB",
    overallConfidence,
    fields: { ...template.fields, "Full Name": name || template.fields["Full Name"] },
  };
}

export const chartData = [
  { name: "Mon", verified: 52, tampered: 8 },
  { name: "Tue", verified: 68, tampered: 12 },
  { name: "Wed", verified: 61, tampered: 7 },
  { name: "Thu", verified: 84, tampered: 14 },
  { name: "Fri", verified: 72, tampered: 9 },
  { name: "Sat", verified: 42, tampered: 6 },
  { name: "Sun", verified: 36, tampered: 5 },
];

export const weeklyData = [
  { name: "W1", documents: 296, confidence: 93 },
  { name: "W2", documents: 388, confidence: 95 },
  { name: "W3", documents: 342, confidence: 94 },
  { name: "W4", documents: 418, confidence: 96 },
];

export const monthlyData = [
  { name: "Apr", documents: 1042, verified: 931 },
  { name: "May", documents: 1180, verified: 1089 },
  { name: "Jun", documents: 1248, verified: 1105 },
];

export const processingSteps = [
  { label: "Preprocessing", detail: "Resize, grayscale & enhance image" },
  { label: "OCR Processing", detail: "Extract text and detect fields" },
  { label: "Document Validation", detail: "Check required fields and structure" },
  { label: "ELA Analysis", detail: "Find inconsistent compression regions" },
  { label: "Copy-Move Detection", detail: "Search for duplicated image regions" },
  { label: "AI Verification", detail: "Combine signals and calculate confidence" },
  { label: "Report Generation", detail: "Package evidence into a report" },
];
