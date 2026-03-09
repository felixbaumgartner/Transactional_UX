import { useState } from "react";
import { TransactionalTier, TRANSACTIONAL_SLO } from "../constants";
import TransactionalTierBadge from "../components/TransactionalTierBadge";

/* ─────── Types ─────── */

type ExperimentStatus = "draft" | "running" | "paused" | "completed" | "rolled_back";

interface Variant {
  id: string;
  name: string;
  trafficPct: number;
  deliveryRate: string;
  avgLatency: string;
  openRate: string;
  clickRate: string;
}

interface Experiment {
  id: number;
  name: string;
  messageName: string;
  messageType: "campaign" | "trigger";
  channel: "email" | "notification" | "sms";
  tier: TransactionalTier;
  status: ExperimentStatus;
  variants: Variant[];
  guardrails: {
    minDeliveryRate: number;
    maxLatencyMs: number;
    autoRollback: boolean;
    holdoutPct: number;
  };
  startDate: string;
  endDate?: string;
  createdBy: string;
  sampleSize: string;
  significance?: string;
  winner?: string;
}

/* ─────── Mock Data ─────── */

const mockExperiments: Experiment[] = [
  {
    id: 1,
    name: "Booking confirmation — shorter subject line",
    messageName: "booking_confirmation_email",
    messageType: "campaign",
    channel: "email",
    tier: "tier_1",
    status: "running",
    variants: [
      { id: "control", name: "Control (current)", trafficPct: 50, deliveryRate: "99.94%", avgLatency: "11s", openRate: "72.3%", clickRate: "34.1%" },
      { id: "v1", name: "Short subject + emoji", trafficPct: 50, deliveryRate: "99.93%", avgLatency: "12s", openRate: "76.8%", clickRate: "35.9%" },
    ],
    guardrails: { minDeliveryRate: 99.9, maxLatencyMs: 30000, autoRollback: true, holdoutPct: 0 },
    startDate: "2026-03-01",
    createdBy: "trip-comms",
    sampleSize: "1.2M sends",
    significance: "87%",
  },
  {
    id: 2,
    name: "OTP SMS — include app link",
    messageName: "otp_sms_trigger",
    messageType: "trigger",
    channel: "sms",
    tier: "tier_1",
    status: "completed",
    variants: [
      { id: "control", name: "Control (OTP only)", trafficPct: 50, deliveryRate: "99.97%", avgLatency: "3s", openRate: "-", clickRate: "-" },
      { id: "v1", name: "OTP + deep link", trafficPct: 50, deliveryRate: "99.96%", avgLatency: "4s", openRate: "-", clickRate: "12.4%" },
    ],
    guardrails: { minDeliveryRate: 99.9, maxLatencyMs: 30000, autoRollback: true, holdoutPct: 0 },
    startDate: "2026-02-15",
    endDate: "2026-03-01",
    createdBy: "identity-team",
    sampleSize: "3.4M sends",
    significance: "99%",
    winner: "v1",
  },
  {
    id: 3,
    name: "Check-in reminder — timing test",
    messageName: "checkin_reminder_push",
    messageType: "campaign",
    channel: "notification",
    tier: "tier_2",
    status: "running",
    variants: [
      { id: "control", name: "Control (24h before)", trafficPct: 34, deliveryRate: "99.61%", avgLatency: "2m 10s", openRate: "41.2%", clickRate: "18.3%" },
      { id: "v1", name: "48h before check-in", trafficPct: 33, deliveryRate: "99.58%", avgLatency: "2m 22s", openRate: "38.7%", clickRate: "16.1%" },
      { id: "v2", name: "12h before check-in", trafficPct: 33, deliveryRate: "99.63%", avgLatency: "2m 05s", openRate: "45.1%", clickRate: "22.0%" },
    ],
    guardrails: { minDeliveryRate: 99.5, maxLatencyMs: 300000, autoRollback: true, holdoutPct: 5 },
    startDate: "2026-03-03",
    createdBy: "trip-enrichment",
    sampleSize: "890K sends",
    significance: "72%",
  },
  {
    id: 4,
    name: "Review request — CTA button color",
    messageName: "review_request_email",
    messageType: "campaign",
    channel: "email",
    tier: "tier_2",
    status: "rolled_back",
    variants: [
      { id: "control", name: "Control (blue CTA)", trafficPct: 50, deliveryRate: "99.54%", avgLatency: "3m 01s", openRate: "28.4%", clickRate: "8.2%" },
      { id: "v1", name: "Green CTA + urgency copy", trafficPct: 50, deliveryRate: "99.11%", avgLatency: "4m 45s", openRate: "29.1%", clickRate: "9.0%" },
    ],
    guardrails: { minDeliveryRate: 99.5, maxLatencyMs: 300000, autoRollback: true, holdoutPct: 5 },
    startDate: "2026-02-20",
    endDate: "2026-02-22",
    createdBy: "ugc-team",
    sampleSize: "210K sends",
    significance: "-",
    winner: "control",
  },
  {
    id: 5,
    name: "Payment receipt — rich HTML vs plain",
    messageName: "payment_receipt_email",
    messageType: "campaign",
    channel: "email",
    tier: "tier_1",
    status: "draft",
    variants: [
      { id: "control", name: "Control (plain text)", trafficPct: 50, deliveryRate: "-", avgLatency: "-", openRate: "-", clickRate: "-" },
      { id: "v1", name: "Rich HTML with breakdown", trafficPct: 50, deliveryRate: "-", avgLatency: "-", openRate: "-", clickRate: "-" },
    ],
    guardrails: { minDeliveryRate: 99.9, maxLatencyMs: 30000, autoRollback: true, holdoutPct: 0 },
    startDate: "-",
    createdBy: "payments-team",
    sampleSize: "-",
  },
];

/* ─────── Helper Components ─────── */

function StatusBadge({ status }: { status: ExperimentStatus }) {
  const map: Record<ExperimentStatus, { cls: string; label: string }> = {
    draft: { cls: "badge-draft", label: "Draft" },
    running: { cls: "badge-running", label: "Running" },
    paused: { cls: "badge-paused", label: "Paused" },
    completed: { cls: "badge-completed", label: "Completed" },
    rolled_back: { cls: "badge-rolled-back", label: "Rolled Back" },
  };
  const { cls, label } = map[status];
  return <span className={`badge ${cls}`}>{label}</span>;
}

function ChannelBadge({ channel }: { channel: string }) {
  const cls = channel === "email" ? "badge badge-email" : channel === "sms" ? "badge badge-sms" : "badge badge-push";
  const label = channel === "email" ? "Email" : channel === "sms" ? "SMS" : "Push";
  return <span className={cls}>{label}</span>;
}

function SLOComplianceIndicator({ tier, deliveryRate }: { tier: TransactionalTier; deliveryRate: string }) {
  if (deliveryRate === "-") return <span className="text-muted">-</span>;
  const target = parseFloat(TRANSACTIONAL_SLO[tier].deliverySLO);
  const actual = parseFloat(deliveryRate);
  const meeting = actual >= target;
  return (
    <span style={{ fontWeight: 700, color: meeting ? "var(--color-green-600)" : "var(--color-red-600)" }}>
      {deliveryRate} {meeting ? "  pass" : "  FAIL"}
    </span>
  );
}

function GuardrailsCard({ experiment }: { experiment: Experiment }) {
  const g = experiment.guardrails;
  const slo = TRANSACTIONAL_SLO[experiment.tier];
  return (
    <div className="card">
      <div className="card-title">Experiment Guardrails</div>
      <div className="guardrails-grid">
        <div className="guardrail-item">
          <div className="guardrail-label">Min Delivery Rate</div>
          <div className="guardrail-value">{g.minDeliveryRate}%</div>
          <div className="guardrail-hint">SLO target: {slo.deliverySLO}</div>
        </div>
        <div className="guardrail-item">
          <div className="guardrail-label">Max Latency (p99)</div>
          <div className="guardrail-value">{g.maxLatencyMs >= 60000 ? `${g.maxLatencyMs / 60000}m` : `${g.maxLatencyMs / 1000}s`}</div>
          <div className="guardrail-hint">SLO target: {slo.latencyP99}</div>
        </div>
        <div className="guardrail-item">
          <div className="guardrail-label">Auto-Rollback</div>
          <div className="guardrail-value" style={{ color: g.autoRollback ? "var(--color-green-600)" : "var(--color-red-600)" }}>
            {g.autoRollback ? "Enabled" : "Disabled"}
          </div>
          <div className="guardrail-hint">{experiment.tier === "tier_1" ? "Required for Tier 1" : "Recommended"}</div>
        </div>
        <div className="guardrail-item">
          <div className="guardrail-label">Holdout Group</div>
          <div className="guardrail-value">
            {g.holdoutPct === 0 ? (
              <span style={{ color: "var(--color-gray-500)" }}>Not allowed</span>
            ) : (
              `${g.holdoutPct}%`
            )}
          </div>
          <div className="guardrail-hint">{experiment.tier === "tier_1" ? "Tier 1: holdout forbidden" : "Max 10% for Tier 2"}</div>
        </div>
      </div>
    </div>
  );
}

function VariantsTable({ experiment }: { experiment: Experiment }) {
  return (
    <div className="card" style={{ padding: 0, overflow: "hidden" }}>
      <div style={{ padding: "20px 20px 0" }}>
        <div className="card-title" style={{ marginBottom: 4 }}>Variant Performance</div>
        {experiment.significance && experiment.significance !== "-" && (
          <div className="text-muted" style={{ marginBottom: 12 }}>
            Statistical significance: <strong style={{ color: parseFloat(experiment.significance) >= 95 ? "var(--color-green-600)" : "var(--color-yellow-600)" }}>{experiment.significance}</strong>
            {parseFloat(experiment.significance) >= 95 && " — ready to call"}
          </div>
        )}
      </div>
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Variant</th>
              <th>Traffic</th>
              <th>Delivery Rate</th>
              <th>Avg Latency</th>
              <th>Open Rate</th>
              <th>Click Rate</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {experiment.variants.map((v) => (
              <tr key={v.id}>
                <td>
                  <div style={{ fontWeight: 600 }}>{v.name}</div>
                  {experiment.winner === v.id && (
                    <span className="badge badge-tier1" style={{ marginTop: 4 }}>Winner</span>
                  )}
                </td>
                <td>{v.trafficPct}%</td>
                <td>
                  <SLOComplianceIndicator tier={experiment.tier} deliveryRate={v.deliveryRate} />
                </td>
                <td>{v.avgLatency}</td>
                <td>{v.openRate}</td>
                <td>{v.clickRate}</td>
                <td>
                  {v.deliveryRate === "-" ? (
                    <span className="text-muted">Pending</span>
                  ) : parseFloat(v.deliveryRate) < parseFloat(TRANSACTIONAL_SLO[experiment.tier].deliverySLO) ? (
                    <span style={{ color: "var(--color-red-600)", fontWeight: 600, fontSize: 12 }}>Below SLO</span>
                  ) : (
                    <span style={{ color: "var(--color-green-600)", fontWeight: 600, fontSize: 12 }}>Healthy</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─────── Create Experiment Modal ─────── */

interface CreateFormState {
  name: string;
  messageId: string;
  variantCount: number;
  trafficSplit: "even" | "custom";
  autoRollback: boolean;
  holdoutPct: number;
}

function CreateExperimentModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (name: string) => void;
}) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [form, setForm] = useState<CreateFormState>({
    name: "",
    messageId: "",
    variantCount: 2,
    trafficSplit: "even",
    autoRollback: true,
    holdoutPct: 0,
  });

  const selectedMessage = mockExperiments.find(
    (e) => e.messageName === form.messageId
  );
  const selectedTier = selectedMessage?.tier ?? "tier_2";
  const isTier1 = selectedTier === "tier_1";

  // Available transactional messages to experiment on
  const availableMessages = [
    { id: "booking_confirmation_email", name: "Booking Confirmation Email", tier: "tier_1" as const, channel: "email" },
    { id: "otp_sms_trigger", name: "OTP SMS Trigger", tier: "tier_1" as const, channel: "sms" },
    { id: "payment_receipt_email", name: "Payment Receipt Email", tier: "tier_1" as const, channel: "email" },
    { id: "checkin_reminder_push", name: "Check-in Reminder Push", tier: "tier_2" as const, channel: "notification" },
    { id: "review_request_email", name: "Review Request Email", tier: "tier_2" as const, channel: "email" },
    { id: "review_invite_trigger", name: "Review Invite Trigger", tier: "tier_2" as const, channel: "email" },
  ];

  const selectedMsg = availableMessages.find((m) => m.id === form.messageId);

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ width: 620 }}>
        <div className="modal-title">Create Transactional Experiment</div>
        <div className="modal-subtitle">
          A/B test content and delivery for transactional messages with SLO-aware guardrails.
        </div>

        {/* Mini stepper */}
        <div className="stepper" style={{ marginBottom: 24 }}>
          {["Message", "Variants", "Guardrails"].map((label, i) => (
            <span key={label} style={{ display: "contents" }}>
              {i > 0 && <div className={`step-connector ${step > i ? "completed" : ""}`} />}
              <div className={`step ${step > i + 1 ? "completed" : step === i + 1 ? "active" : ""}`}>
                <div className="step-number">{step > i + 1 ? "✓" : i + 1}</div>
                <div className="step-label">{label}</div>
              </div>
            </span>
          ))}
        </div>

        {/* Step 1: Select message */}
        {step === 1 && (
          <div>
            <div className="form-group">
              <label className="form-label">Experiment Name</label>
              <input
                className="form-input"
                placeholder="e.g., Booking confirmation — shorter subject line"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Transactional Message</label>
              <select
                className="form-select"
                value={form.messageId}
                onChange={(e) => setForm({ ...form, messageId: e.target.value })}
              >
                <option value="">Select a transactional message...</option>
                {availableMessages.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.tier === "tier_1" ? "Tier 1" : "Tier 2"} — {m.channel})
                  </option>
                ))}
              </select>
            </div>

            {selectedMsg && (
              <div className="tier-selection-appear">
                <div className="alert alert-info">
                  <div className="alert-title">
                    <TransactionalTierBadge tier={selectedMsg.tier} />{" "}
                    {selectedMsg.tier === "tier_1" ? "Critical Message" : "Non-Critical Message"}
                  </div>
                  {selectedMsg.tier === "tier_1" ? (
                    <>
                      <strong>Constraints:</strong> No holdout group allowed. Auto-rollback is mandatory.
                      All variants must maintain 99.9% delivery SLO and &lt;30s p99 latency.
                      Content variants must all include required transactional information.
                    </>
                  ) : (
                    <>
                      <strong>Constraints:</strong> Holdout group max 10%. Auto-rollback recommended.
                      All variants must maintain 99.5% delivery SLO and &lt;5min p99 latency.
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Variants */}
        {step === 2 && (
          <div>
            <div className="form-group">
              <label className="form-label">Number of Variants (including control)</label>
              <select
                className="form-select"
                value={form.variantCount}
                onChange={(e) => setForm({ ...form, variantCount: parseInt(e.target.value) })}
              >
                <option value={2}>2 (Control + 1 treatment)</option>
                <option value={3}>3 (Control + 2 treatments)</option>
                <option value={4}>4 (Control + 3 treatments)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Traffic Split</label>
              <div className="radio-card-group" style={{ flexDirection: "column" }}>
                <div
                  className={`radio-card ${form.trafficSplit === "even" ? "selected" : ""}`}
                  onClick={() => setForm({ ...form, trafficSplit: "even" })}
                  style={{ flex: "none" }}
                >
                  <div className="radio-card-header">
                    <div className="radio-card-radio" />
                    <div className="radio-card-title">Even split</div>
                  </div>
                  <div className="radio-card-description">
                    {Math.floor(100 / form.variantCount)}% each variant
                    {isTier1 && " (recommended for Tier 1 — minimizes risk exposure)"}
                  </div>
                </div>
                <div
                  className={`radio-card ${form.trafficSplit === "custom" ? "selected" : ""}`}
                  onClick={() => setForm({ ...form, trafficSplit: "custom" })}
                  style={{ flex: "none" }}
                >
                  <div className="radio-card-header">
                    <div className="radio-card-radio" />
                    <div className="radio-card-title">Custom split</div>
                  </div>
                  <div className="radio-card-description">
                    Define custom traffic percentages per variant
                  </div>
                </div>
              </div>
            </div>

            {form.trafficSplit === "custom" && (
              <div className="tier-selection-appear">
                {Array.from({ length: form.variantCount }, (_, i) => (
                  <div key={i} className="form-group" style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <label className="form-label" style={{ width: 140, marginBottom: 0 }}>
                      {i === 0 ? "Control" : `Treatment ${i}`}
                    </label>
                    <input
                      className="form-input"
                      type="number"
                      min={5}
                      max={95}
                      defaultValue={Math.floor(100 / form.variantCount)}
                      style={{ width: 80 }}
                    />
                    <span className="text-muted">%</span>
                  </div>
                ))}
              </div>
            )}

            <div className="alert alert-info" style={{ marginTop: 16 }}>
              <div className="alert-title">Variant Content Requirements</div>
              All variants <strong>must</strong> contain the core transactional information
              (booking reference, amounts, dates, etc.). Only presentation, subject lines,
              CTAs, and supplementary content can differ between variants.
            </div>
          </div>
        )}

        {/* Step 3: Guardrails */}
        {step === 3 && (
          <div>
            <div className="form-group">
              <label className="form-label">Auto-Rollback</label>
              <div className="radio-card-group" style={{ flexDirection: "column" }}>
                <div
                  className={`radio-card ${form.autoRollback ? "selected" : ""}`}
                  onClick={() => !isTier1 && setForm({ ...form, autoRollback: true })}
                  style={{ flex: "none", opacity: 1 }}
                >
                  <div className="radio-card-header">
                    <div className="radio-card-radio" />
                    <div className="radio-card-title">
                      Enabled {isTier1 && <span className="badge badge-tier1" style={{ marginLeft: 8, fontSize: 10 }}>Required</span>}
                    </div>
                  </div>
                  <div className="radio-card-description">
                    Automatically revert to control if any variant's delivery rate drops below SLO
                    or latency exceeds threshold for 5 consecutive minutes.
                  </div>
                </div>
                <div
                  className={`radio-card ${!form.autoRollback ? "selected" : ""}`}
                  onClick={() => !isTier1 && setForm({ ...form, autoRollback: false })}
                  style={{ flex: "none", opacity: isTier1 ? 0.5 : 1, cursor: isTier1 ? "not-allowed" : "pointer" }}
                >
                  <div className="radio-card-header">
                    <div className="radio-card-radio" />
                    <div className="radio-card-title">Disabled</div>
                  </div>
                  <div className="radio-card-description">
                    Manual monitoring only. {isTier1 && "Not available for Tier 1 messages."}
                  </div>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                Holdout Group
                {isTier1 && <span style={{ color: "var(--color-red-600)", fontSize: 12, marginLeft: 8 }}>Not allowed for Tier 1</span>}
              </label>
              {isTier1 ? (
                <div className="alert alert-warning" style={{ marginBottom: 0 }}>
                  <div className="alert-title">Holdout groups are forbidden for Tier 1 messages</div>
                  Critical transactional messages (OTPs, confirmations, receipts) must be delivered to 100%
                  of eligible users. Withholding delivery would directly harm the customer experience.
                </div>
              ) : (
                <>
                  <select
                    className="form-select"
                    value={form.holdoutPct}
                    onChange={(e) => setForm({ ...form, holdoutPct: parseInt(e.target.value) })}
                  >
                    <option value={0}>No holdout (0%)</option>
                    <option value={1}>1% holdout</option>
                    <option value={2}>2% holdout</option>
                    <option value={5}>5% holdout (recommended)</option>
                    <option value={10}>10% holdout (max allowed)</option>
                  </select>
                  <div className="text-muted" style={{ marginTop: 4 }}>
                    Holdout users will NOT receive this message. Max 10% for Tier 2.
                  </div>
                </>
              )}
            </div>

            <div className="divider" />

            {/* Summary */}
            <div className="alert alert-success">
              <div className="alert-title">Experiment Summary</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 8, fontSize: 13 }}>
                <div><strong>Message:</strong> {form.messageId || "—"}</div>
                <div><strong>Tier:</strong> {selectedMsg ? (selectedMsg.tier === "tier_1" ? "Tier 1 (Critical)" : "Tier 2 (Non-Critical)") : "—"}</div>
                <div><strong>Variants:</strong> {form.variantCount}</div>
                <div><strong>Split:</strong> {form.trafficSplit === "even" ? `${Math.floor(100 / form.variantCount)}% each` : "Custom"}</div>
                <div><strong>Auto-rollback:</strong> {form.autoRollback ? "Yes" : "No"}</div>
                <div><strong>Holdout:</strong> {form.holdoutPct}%</div>
              </div>
            </div>
          </div>
        )}

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          {step > 1 && (
            <button className="btn btn-secondary" onClick={() => setStep((step - 1) as 1 | 2)}>
              Back
            </button>
          )}
          {step < 3 ? (
            <button
              className="btn btn-primary"
              disabled={step === 1 && (!form.name || !form.messageId)}
              onClick={() => setStep((step + 1) as 2 | 3)}
            >
              Next
            </button>
          ) : (
            <button className="btn btn-primary" onClick={() => onCreate(form.name)}>
              Create Experiment
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─────── Main Page ─────── */

export default function TransactionalExperimentsDemo() {
  const [showCreate, setShowCreate] = useState(false);
  const [selectedExperiment, setSelectedExperiment] = useState<Experiment | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [filter, setFilter] = useState<ExperimentStatus | "all">("all");

  const filteredExperiments =
    filter === "all" ? mockExperiments : mockExperiments.filter((e) => e.status === filter);

  const running = mockExperiments.filter((e) => e.status === "running").length;
  const completed = mockExperiments.filter((e) => e.status === "completed").length;
  const rolledBack = mockExperiments.filter((e) => e.status === "rolled_back").length;

  function handleCreate(name: string) {
    setShowCreate(false);
    setToast(`Experiment "${name}" created successfully!`);
    setTimeout(() => setToast(null), 3000);
  }

  // Detail view
  if (selectedExperiment) {
    const exp = selectedExperiment;
    return (
      <div>
        <div className="page-header">
          <button
            className="btn btn-secondary"
            style={{ marginBottom: 12 }}
            onClick={() => setSelectedExperiment(null)}
          >
            &larr; Back to Experiments
          </button>
          <div className="flex-between">
            <div>
              <h1 className="page-title">{exp.name}</h1>
              <p className="page-subtitle">
                {exp.messageName} &middot; {exp.channel} &middot; {exp.createdBy}
              </p>
            </div>
            <div className="flex gap-8">
              <StatusBadge status={exp.status} />
              <TransactionalTierBadge tier={exp.tier} />
            </div>
          </div>
        </div>

        {/* Summary cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
          <div className="card" style={{ textAlign: "center" }}>
            <div className="text-muted mb-8">Sample Size</div>
            <div style={{ fontSize: 22, fontWeight: 700 }}>{exp.sampleSize}</div>
          </div>
          <div className="card" style={{ textAlign: "center" }}>
            <div className="text-muted mb-8">Variants</div>
            <div style={{ fontSize: 22, fontWeight: 700 }}>{exp.variants.length}</div>
          </div>
          <div className="card" style={{ textAlign: "center" }}>
            <div className="text-muted mb-8">Significance</div>
            <div style={{
              fontSize: 22,
              fontWeight: 700,
              color: exp.significance && parseFloat(exp.significance) >= 95
                ? "var(--color-green-600)"
                : "var(--color-yellow-600)",
            }}>
              {exp.significance ?? "-"}
            </div>
          </div>
          <div className="card" style={{ textAlign: "center" }}>
            <div className="text-muted mb-8">Duration</div>
            <div style={{ fontSize: 22, fontWeight: 700 }}>
              {exp.endDate
                ? `${Math.ceil((new Date(exp.endDate).getTime() - new Date(exp.startDate).getTime()) / 86400000)}d`
                : exp.startDate !== "-"
                  ? `${Math.ceil((new Date("2026-03-09").getTime() - new Date(exp.startDate).getTime()) / 86400000)}d`
                  : "-"}
            </div>
          </div>
        </div>

        {/* Rolled back alert */}
        {exp.status === "rolled_back" && (
          <div className="alert alert-warning" style={{ marginBottom: 20 }}>
            <div className="alert-title">Experiment Auto-Rolled Back</div>
            Treatment variant "Green CTA + urgency copy" delivery rate dropped to 99.11%,
            below the 99.5% SLO threshold. Traffic was automatically reverted to control
            on 2026-02-22 at 14:32 UTC.
          </div>
        )}

        {/* Winner announcement */}
        {exp.status === "completed" && exp.winner && (
          <div className="alert alert-success" style={{ marginBottom: 20 }}>
            <div className="alert-title">Experiment Complete — Winner: {exp.variants.find((v) => v.id === exp.winner)?.name}</div>
            Statistical significance reached 99%. The winning variant has been promoted to production.
          </div>
        )}

        <VariantsTable experiment={exp} />
        <GuardrailsCard experiment={exp} />

        {/* Actions */}
        {exp.status === "running" && (
          <div className="btn-group" style={{ justifyContent: "flex-start" }}>
            <button className="btn btn-secondary">Pause Experiment</button>
            <button className="btn btn-secondary" style={{ color: "var(--color-red-600)" }}>
              Stop &amp; Rollback
            </button>
            {exp.significance && parseFloat(exp.significance) >= 95 && (
              <button className="btn btn-primary">Declare Winner &amp; Promote</button>
            )}
          </div>
        )}
      </div>
    );
  }

  // List view
  return (
    <div>
      <div className="flex-between page-header">
        <div>
          <h1 className="page-title">Transactional Experiments</h1>
          <p className="page-subtitle">
            A/B test transactional messages with SLO-aware guardrails and auto-rollback
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
          + New Experiment
        </button>
      </div>

      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        <div className="card" style={{ textAlign: "center" }}>
          <div className="text-muted mb-8">Total Experiments</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{mockExperiments.length}</div>
        </div>
        <div className="card" style={{ textAlign: "center" }}>
          <div className="text-muted mb-8">Running</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "var(--color-blue-500)" }}>{running}</div>
        </div>
        <div className="card" style={{ textAlign: "center" }}>
          <div className="text-muted mb-8">Completed</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "var(--color-green-600)" }}>{completed}</div>
        </div>
        <div className="card" style={{ textAlign: "center" }}>
          <div className="text-muted mb-8">Rolled Back</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "var(--color-red-600)" }}>{rolledBack}</div>
        </div>
      </div>

      {/* Tier-specific rules info */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
        <div className="alert alert-success" style={{ margin: 0 }}>
          <div className="alert-title">Tier 1 Experiment Rules</div>
          <ul style={{ margin: "8px 0 0 16px", fontSize: 13, lineHeight: 1.8 }}>
            <li>No holdout groups — 100% of users must receive the message</li>
            <li>Auto-rollback is mandatory</li>
            <li>All variants must maintain 99.9% delivery, &lt;30s latency</li>
            <li>Core transactional content required in every variant</li>
          </ul>
        </div>
        <div className="alert alert-warning" style={{ margin: 0 }}>
          <div className="alert-title">Tier 2 Experiment Rules</div>
          <ul style={{ margin: "8px 0 0 16px", fontSize: 13, lineHeight: 1.8 }}>
            <li>Holdout groups allowed up to 10%</li>
            <li>Auto-rollback recommended (not required)</li>
            <li>All variants must maintain 99.5% delivery, &lt;5min latency</li>
            <li>More flexibility on content and timing variants</li>
          </ul>
        </div>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <select
          className="form-select"
          value={filter}
          onChange={(e) => setFilter(e.target.value as ExperimentStatus | "all")}
        >
          <option value="all">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="running">Running</option>
          <option value="paused">Paused</option>
          <option value="completed">Completed</option>
          <option value="rolled_back">Rolled Back</option>
        </select>
        <select className="form-select">
          <option>All Tiers</option>
          <option>Tier 1 - Critical</option>
          <option>Tier 2 - Non-Critical</option>
        </select>
        <select className="form-select">
          <option>All Channels</option>
          <option>Email</option>
          <option>Push Notification</option>
          <option>SMS</option>
        </select>
      </div>

      {/* Experiments table */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Experiment</th>
                <th>Message</th>
                <th>Tier</th>
                <th>Channel</th>
                <th>Status</th>
                <th>Variants</th>
                <th>Significance</th>
                <th>Owner</th>
              </tr>
            </thead>
            <tbody>
              {filteredExperiments.map((exp) => (
                <tr
                  key={exp.id}
                  style={{ cursor: "pointer" }}
                  onClick={() => setSelectedExperiment(exp)}
                >
                  <td style={{ fontWeight: 600 }}>{exp.name}</td>
                  <td>
                    <span className="text-muted">{exp.messageName}</span>
                  </td>
                  <td>
                    <TransactionalTierBadge tier={exp.tier} />
                  </td>
                  <td>
                    <ChannelBadge channel={exp.channel} />
                  </td>
                  <td>
                    <StatusBadge status={exp.status} />
                  </td>
                  <td>{exp.variants.length}</td>
                  <td>
                    {exp.significance ? (
                      <span style={{
                        fontWeight: 600,
                        color: parseFloat(exp.significance) >= 95
                          ? "var(--color-green-600)"
                          : "var(--color-yellow-600)",
                      }}>
                        {exp.significance}
                      </span>
                    ) : (
                      <span className="text-muted">-</span>
                    )}
                  </td>
                  <td>{exp.createdBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showCreate && (
        <CreateExperimentModal
          onClose={() => setShowCreate(false)}
          onCreate={handleCreate}
        />
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
