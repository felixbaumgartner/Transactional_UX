import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MessageChannel, CHANNEL_LABELS } from "../constants";
import {
  useClassificationStore,
  ClassificationRecord,
} from "../classificationStore";
import ClassificationQuestionnaire, {
  Classification,
} from "../components/ClassificationQuestionnaire";
import TransactionalTierBadge from "../components/TransactionalTierBadge";
import TransactionalSLOInfoCard from "../components/TransactionalSLOInfoCard";

function PurposeBadge({ record }: { record: ClassificationRecord }) {
  if (record.subPurpose === "transactional") {
    return (
      <div className="badge-row">
        <span className="badge badge-outline">Transactional</span>
        <TransactionalTierBadge tier={record.tier} />
      </div>
    );
  }
  if (record.purpose === "non_marketing") {
    return <span className="badge badge-outline">Non-marketing</span>;
  }
  return <span className="badge badge-marketing">Marketing</span>;
}

function ChannelBadge({ channel }: { channel: string }) {
  const cls =
    channel === "email"
      ? "badge badge-email"
      : channel === "sms"
        ? "badge badge-sms"
        : "badge badge-push";
  const label =
    channel === "email" ? "Email" : channel === "sms" ? "SMS" : "Push";
  return <span className={cls}>{label}</span>;
}

/* ─── Register New Message Flow ─── */

type RegisterStep = "info" | "classify" | "done";

function RegisterMessageModal({
  onClose,
  onRegister,
}: {
  onClose: () => void;
  onRegister: (record: ClassificationRecord) => void;
}) {
  const [step, setStep] = useState<RegisterStep>("info");
  const [messageName, setMessageName] = useState("");
  const [description, setDescription] = useState("");
  const [channel, setChannel] = useState<MessageChannel | null>(null);
  const [classification, setClassification] = useState<Classification | null>(
    null
  );

  function handleConfirmClassification(c: Classification) {
    setClassification(c);
    setStep("done");
  }

  function handleRegister() {
    if (!classification || !channel) return;
    const record: ClassificationRecord = {
      id: `cr-${Date.now()}`,
      messageName,
      description,
      channel,
      purpose: classification.purpose,
      subPurpose: classification.subPurpose,
      tier: classification.tier,
      questionnaireResponses: {},
      classifiedBy: "current-user",
      classifiedAt: new Date().toISOString().slice(0, 10),
    };
    onRegister(record);
  }

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ width: 640, maxHeight: "90vh" }}>
        <div className="modal-title">Register & Classify a New Message</div>
        <div className="modal-subtitle">
          This classification will be stored centrally and reused whenever this
          message is attached to a campaign or trigger. Classify once, use
          everywhere.
        </div>

        {/* Mini stepper */}
        <div className="stepper" style={{ marginBottom: 24 }}>
          {["Message Info", "Classify", "Confirm"].map((label, i) => {
            const idx =
              step === "info" ? 0 : step === "classify" ? 1 : 2;
            return (
              <span key={label} style={{ display: "contents" }}>
                {i > 0 && (
                  <div
                    className={`step-connector ${idx > i - 1 ? "completed" : ""}`}
                  />
                )}
                <div
                  className={`step ${idx > i ? "completed" : idx === i ? "active" : ""}`}
                >
                  <div className="step-number">
                    {idx > i ? "\u2713" : i + 1}
                  </div>
                  <div className="step-label">{label}</div>
                </div>
              </span>
            );
          })}
        </div>

        {/* Step 1: Basic info */}
        {step === "info" && (
          <div>
            <div className="form-group">
              <label className="form-label">Message Name</label>
              <input
                className="form-input"
                placeholder="e.g., booking_confirmation"
                value={messageName}
                onChange={(e) => setMessageName(e.target.value)}
              />
              <div className="text-muted" style={{ marginTop: 4 }}>
                A unique identifier for this message type. Used across campaigns
                and triggers.
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-textarea"
                placeholder="What does this message do? When is it sent?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Primary Channel</label>
              <div className="radio-card-group">
                {(["email", "notification", "sms"] as MessageChannel[]).map(
                  (ch) => (
                    <div
                      key={ch}
                      className={`radio-card ${channel === ch ? "selected" : ""}`}
                      onClick={() => setChannel(ch)}
                    >
                      <div className="radio-card-header">
                        <div className="radio-card-radio" />
                        <div className="radio-card-title">
                          {CHANNEL_LABELS[ch]}
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Classification questionnaire */}
        {step === "classify" && (
          <ClassificationQuestionnaire
            mode="inline"
            onConfirm={handleConfirmClassification}
            onChange={(c) => setClassification(c)}
          />
        )}

        {/* Step 3: Confirm */}
        {step === "done" && classification && (
          <div>
            <div className="alert alert-success">
              <div className="alert-title">Classification Complete</div>
              <strong>{messageName}</strong> has been classified. This record
              will be available when creating campaigns or triggers.
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
                marginBottom: 16,
              }}
            >
              <div className="slo-item">
                <div className="slo-item-label">Message Name</div>
                <div className="slo-item-value" style={{ fontSize: 14 }}>
                  {messageName}
                </div>
              </div>
              <div className="slo-item">
                <div className="slo-item-label">Channel</div>
                <div className="slo-item-value" style={{ fontSize: 14 }}>
                  {channel ? CHANNEL_LABELS[channel] : "-"}
                </div>
              </div>
              <div className="slo-item">
                <div className="slo-item-label">Classification</div>
                <div style={{ marginTop: 4 }}>
                  {classification.subPurpose === "transactional" ? (
                    <div className="badge-row">
                      <span className="badge badge-outline">Transactional</span>
                      <TransactionalTierBadge tier={classification.tier} />
                    </div>
                  ) : classification.purpose === "non_marketing" ? (
                    <span className="badge badge-outline">Non-marketing</span>
                  ) : (
                    <span className="badge badge-marketing">Marketing</span>
                  )}
                </div>
              </div>
              <div className="slo-item">
                <div className="slo-item-label">Description</div>
                <div className="slo-item-value" style={{ fontSize: 14 }}>
                  {description || "-"}
                </div>
              </div>
            </div>

            {classification.subPurpose === "transactional" &&
              classification.tier && (
                <TransactionalSLOInfoCard tier={classification.tier} />
              )}
          </div>
        )}

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          {step === "info" && (
            <button
              className="btn btn-primary"
              disabled={!messageName || !channel}
              onClick={() => setStep("classify")}
            >
              Next: Classify
            </button>
          )}
          {step === "classify" && (
            <>
              <button
                className="btn btn-secondary"
                onClick={() => setStep("info")}
              >
                Back
              </button>
              <button
                className="btn btn-primary"
                disabled={!classification}
                onClick={() => setStep("done")}
              >
                Next: Confirm
              </button>
            </>
          )}
          {step === "done" && (
            <>
              <button
                className="btn btn-secondary"
                onClick={() => setStep("classify")}
              >
                Back
              </button>
              <button className="btn btn-primary" onClick={handleRegister}>
                Register Message
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ─── */

export default function MessageRegistryDemo() {
  const navigate = useNavigate();
  const store = useClassificationStore();
  const [showRegister, setShowRegister] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [filterPurpose, setFilterPurpose] = useState<string>("all");
  const [selectedRecord, setSelectedRecord] =
    useState<ClassificationRecord | null>(null);

  const filtered =
    filterPurpose === "all"
      ? store.records
      : filterPurpose === "transactional"
        ? store.records.filter((r) => r.subPurpose === "transactional")
        : filterPurpose === "marketing"
          ? store.records.filter((r) => r.purpose === "marketing")
          : store.records.filter(
              (r) => r.purpose === "non_marketing" && !r.subPurpose
            );

  const transactionalCount = store.records.filter(
    (r) => r.subPurpose === "transactional"
  ).length;
  const marketingCount = store.records.filter(
    (r) => r.purpose === "marketing"
  ).length;

  function handleRegister(record: ClassificationRecord) {
    store.addRecord(record);
    setShowRegister(false);
    setToast(`"${record.messageName}" registered and classified successfully!`);
    setTimeout(() => setToast(null), 3000);
  }

  // Detail view
  if (selectedRecord) {
    return (
      <div>
        <div className="page-header">
          <button
            className="btn btn-secondary"
            style={{ marginBottom: 12 }}
            onClick={() => setSelectedRecord(null)}
          >
            &larr; Back to Registry
          </button>
          <div className="flex-between">
            <div>
              <h1 className="page-title">{selectedRecord.messageName}</h1>
              <p className="page-subtitle">{selectedRecord.description}</p>
            </div>
            <PurposeBadge record={selectedRecord} />
          </div>
        </div>

        <div className="card">
          <div className="card-title">Classification Details</div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 12,
            }}
          >
            <div className="slo-item">
              <div className="slo-item-label">Classification</div>
              <div style={{ marginTop: 4 }}>
                <PurposeBadge record={selectedRecord} />
              </div>
            </div>
            <div className="slo-item">
              <div className="slo-item-label">Channel</div>
              <div style={{ marginTop: 4 }}>
                <ChannelBadge channel={selectedRecord.channel} />
              </div>
            </div>
            <div className="slo-item">
              <div className="slo-item-label">Classified By</div>
              <div className="slo-item-value" style={{ fontSize: 14 }}>
                {selectedRecord.classifiedBy}
              </div>
            </div>
            <div className="slo-item">
              <div className="slo-item-label">Classified Date</div>
              <div className="slo-item-value" style={{ fontSize: 14 }}>
                {selectedRecord.classifiedAt}
              </div>
            </div>
            <div className="slo-item">
              <div className="slo-item-label">Record ID</div>
              <div className="slo-item-value" style={{ fontSize: 14 }}>
                {selectedRecord.id}
              </div>
            </div>
            <div className="slo-item">
              <div className="slo-item-label">Description</div>
              <div className="slo-item-value" style={{ fontSize: 14 }}>
                {selectedRecord.description}
              </div>
            </div>
          </div>
        </div>

        {selectedRecord.subPurpose === "transactional" &&
          selectedRecord.tier && (
            <div className="card">
              <div className="card-title">SLO Configuration</div>
              <TransactionalSLOInfoCard tier={selectedRecord.tier} />
            </div>
          )}

        <div className="card">
          <div className="card-title">Usage</div>
          <p className="text-muted mb-16">
            This classification record can be attached to any number of
            campaigns or triggers. The classification is shared — no need to
            re-answer the questionnaire.
          </p>
          <div className="btn-group" style={{ justifyContent: "flex-start" }}>
            <button
              className="btn btn-primary"
              onClick={() =>
                navigate(
                  `/campaign/new?classificationId=${selectedRecord.id}`
                )
              }
            >
              Create Campaign with this Message
            </button>
            <button
              className="btn btn-secondary"
              onClick={() =>
                navigate(
                  `/trigger/new?classificationId=${selectedRecord.id}`
                )
              }
            >
              Create Trigger with this Message
            </button>
          </div>
        </div>

        <div className="alert alert-info">
          <div className="alert-title">Reclassification</div>
          To change the classification of this message, a new questionnaire
          review is required. Reclassification creates an audit trail and
          requires approval from the Transactional Messaging governance team.
        </div>
      </div>
    );
  }

  // List view
  return (
    <div>
      <div className="flex-between page-header">
        <div>
          <h1 className="page-title">Message Registry</h1>
          <p className="page-subtitle">
            Central registry of all classified messages. Classify once here, then
            attach to campaigns or triggers — no duplicate questionnaires.
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowRegister(true)}
        >
          + Register New Message
        </button>
      </div>

      {/* Summary cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 16,
          marginBottom: 24,
        }}
      >
        <div className="card" style={{ textAlign: "center" }}>
          <div className="text-muted mb-8">Total Messages</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>
            {store.records.length}
          </div>
        </div>
        <div className="card" style={{ textAlign: "center" }}>
          <div className="text-muted mb-8">Transactional</div>
          <div
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: "var(--color-green-600)",
            }}
          >
            {transactionalCount}
          </div>
        </div>
        <div className="card" style={{ textAlign: "center" }}>
          <div className="text-muted mb-8">Marketing</div>
          <div
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: "var(--color-blue-500)",
            }}
          >
            {marketingCount}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <select
          className="form-select"
          value={filterPurpose}
          onChange={(e) => setFilterPurpose(e.target.value)}
        >
          <option value="all">All Classifications</option>
          <option value="transactional">Transactional</option>
          <option value="marketing">Marketing</option>
          <option value="non_marketing">Non-marketing (other)</option>
        </select>
        <select className="form-select">
          <option>All Channels</option>
          <option>Email</option>
          <option>Push Notification</option>
          <option>SMS</option>
        </select>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Message Name</th>
                <th>Description</th>
                <th>Classification</th>
                <th>Channel</th>
                <th>Classified By</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr
                  key={r.id}
                  style={{ cursor: "pointer" }}
                  onClick={() => setSelectedRecord(r)}
                >
                  <td style={{ fontWeight: 600 }}>{r.messageName}</td>
                  <td className="text-muted">{r.description}</td>
                  <td>
                    <PurposeBadge record={r} />
                  </td>
                  <td>
                    <ChannelBadge channel={r.channel} />
                  </td>
                  <td>{r.classifiedBy}</td>
                  <td className="text-muted">{r.classifiedAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showRegister && (
        <RegisterMessageModal
          onClose={() => setShowRegister(false)}
          onRegister={handleRegister}
        />
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
