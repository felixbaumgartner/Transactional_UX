import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  MessageChannel,
  CHANNEL_LABELS,
} from "../constants";
import ClassificationQuestionnaire, {
  Classification,
} from "../components/ClassificationQuestionnaire";

type TriggerType = "non_transactional" | "transactional";

/* ── Topic schema fields (mock) ── */
const TOPIC_FIELDS: Record<string, string[]> = {
  booking_events: [
    "booking_id",
    "affiliate_id",
    "hotel_id",
    "checkin_date",
    "checkout_date",
    "booker_cc1",
    "hotel_cc1",
    "status",
    "room_count",
    "total_price",
    "currency",
    "created_at",
  ],
  payment_events: [
    "payment_id",
    "booking_id",
    "amount",
    "currency",
    "status",
    "method",
    "created_at",
  ],
  identity_events: [
    "user_id",
    "event_type",
    "email",
    "phone",
    "ip_address",
    "created_at",
  ],
  trip_events: [
    "trip_id",
    "booking_id",
    "event_type",
    "destination",
    "checkin_date",
    "created_at",
  ],
  browsing_events: [
    "session_id",
    "user_id",
    "page_url",
    "dest_id",
    "search_query",
    "created_at",
  ],
  engagement_events: [
    "user_id",
    "campaign_id",
    "action",
    "channel",
    "created_at",
  ],
};

const OPERATORS = [
  { value: "eq", label: "Equals" },
  { value: "ne", label: "Not equals" },
  { value: "lt", label: "Less than" },
  { value: "le", label: "Less than or equal" },
  { value: "gt", label: "Greater than" },
  { value: "ge", label: "Greater than or equal" },
  { value: "in", label: "In" },
];

interface RuleItem {
  id: string;
  field: string;
  operator: string;
  value: string;
  tag: string;
}

interface RuleGroup {
  id: string;
  combinator: "and" | "or";
  rules: RuleItem[];
}

interface OutputField {
  id: string;
  field: string;
  propertyName: string;
}

let _ruleId = 0;
function nextId(prefix: string) {
  return `${prefix}_${++_ruleId}`;
}

export default function TriggerCreateDemo() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // If navigated from campaign page with ?type=transactional
  const preselectedType =
    searchParams.get("type") === "transactional" ? "transactional" : null;

  // Basic trigger info
  const [triggerName, setTriggerName] = useState("");
  const [reportingLabel, setReportingLabel] = useState("");
  const [description, setDescription] = useState("");
  const [channel, setChannel] = useState<MessageChannel>("email");

  // Type selection
  const [triggerType, setTriggerType] = useState<TriggerType | null>(
    preselectedType
  );

  // Classification from questionnaire (transactional path)
  const [classification, setClassification] = useState<Classification | null>(
    null
  );

  // Input topic
  const [inputTopic, setInputTopic] = useState("");

  // Input configuration extras
  const [consentCheck, setConsentCheck] = useState(false);
  const [eventTimeWindow, setEventTimeWindow] = useState(false);
  const [eventTimeMinutes, setEventTimeMinutes] = useState("");
  const [eventDelay, setEventDelay] = useState(false);
  const [eventDelayMinutes, setEventDelayMinutes] = useState("");

  // Rules
  const [ruleGroups, setRuleGroups] = useState<RuleGroup[]>([]);

  // Output configuration
  const [outputFields, setOutputFields] = useState<OutputField[]>([]);
  const [uuidFields, setUuidFields] = useState<string[]>([]);
  const [reuseUuid, setReuseUuid] = useState(false);

  // Modals
  const [showNonTxModal, setShowNonTxModal] = useState(false);
  const [showTxModal, setShowTxModal] = useState(preselectedType === "transactional");

  // UI state
  const [toast, setToast] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const isTransactionalConfirmed =
    classification?.subPurpose === "transactional";

  function canSave(): boolean {
    if (!triggerName || !inputTopic) return false;
    if (triggerType === "transactional") {
      return isTransactionalConfirmed;
    }
    return triggerType === "non_transactional";
  }

  function handleSave() {
    setSaved(true);
    setToast("Trigger saved successfully!");
    setTimeout(() => setToast(null), 3000);
  }

  if (saved) {
    return (
      <div className="app-page">
        <div className="page-header">
          <div className="page-header-main">
            <h1 className="page-title">Message Trigger Created</h1>
          </div>
        </div>
        <div className="bui-box" style={{ textAlign: "center", padding: 48 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>&#10003;</div>
          <h2 style={{ marginBottom: 8 }}>Trigger Created</h2>
          <p className="text-muted mb-16">
            "{triggerName}" has been saved as a{" "}
            {isTransactionalConfirmed ? "Transactional" : "Non-transactional"}{" "}
            trigger.
          </p>
          <div
            className="btn-group"
            style={{ justifyContent: "center", marginTop: 24 }}
          >
            <button
              className="btn btn-secondary"
              onClick={() => navigate("/triggers")}
            >
              View All Triggers
            </button>
            <button
              className="btn btn-primary"
              onClick={() => {
                setSaved(false);
                setTriggerName("");
                setReportingLabel("");
                setDescription("");
                setTriggerType(null);
                setClassification(null);
                setInputTopic("");
                setChannel("email");
                setConsentCheck(false);
                setEventTimeWindow(false);
                setEventTimeMinutes("");
                setEventDelay(false);
                setEventDelayMinutes("");
                setRuleGroups([]);
                setOutputFields([]);
                setUuidFields([]);
                setReuseUuid(false);
              }}
            >
              Create Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-page">
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-main">
          <h1 className="page-title">Create Message Trigger</h1>
          <p className="page-subtitle">
            Configure an event-driven message trigger
          </p>
        </div>
      </div>

      {/* Basic Info */}
      <div className="bui-box">
        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 16 }}>
          Trigger Configuration
        </div>
        <div className="form-group">
          <label className="form-label">Trigger Name</label>
          <input
            className="form-input"
            placeholder="e.g., booking_confirmation_trigger"
            value={triggerName}
            onChange={(e) => {
              setTriggerName(e.target.value);
              setReportingLabel(
                e.target.value.toLowerCase().replace(/\s+/g, "_")
              );
            }}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Reporting Label</label>
          <input
            className="form-input"
            value={reportingLabel}
            onChange={(e) => setReportingLabel(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea
            className="form-textarea"
            placeholder="Describe what this trigger does..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
      </div>

      {/* Message Type Selection */}
      <div className="bui-box">
        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 16 }}>
          Message Type
        </div>
        <div className="form-group">
          <label className="form-label">
            Trigger Message Type
            <span
              title="Non-Transactional: Marketing, informational, or non-marketing messages routed through the standard pipeline.&#10;Transactional: Booking confirmations, OTPs, payment receipts, security alerts. Bypasses subscriptions, gets priority routing."
              style={{
                marginLeft: 6,
                cursor: "help",
                color: "var(--color-gray-300)",
                fontSize: 14,
              }}
            >
              &#9432;
            </span>
          </label>
          <select
            className="form-select"
            value={triggerType ?? ""}
            onChange={(e) => {
              const val = e.target.value as TriggerType | "";
              if (val === "non_transactional") {
                setTriggerType("non_transactional");
                setClassification(null);
                return;
              }
              if (val === "transactional") {
                setShowTxModal(true);
                setClassification(null);
                return;
              }
              setTriggerType(val || null);
              setClassification(null);
            }}
          >
            <option value="">Select message type...</option>
            <option value="non_transactional">Non-Transactional</option>
            <option value="transactional">Transactional</option>
          </select>
        </div>
      </div>

      {/* Transactional: inline confirmation after modal */}
      {triggerType === "transactional" && isTransactionalConfirmed && (
        <div className="tier-selection-appear">
          <div
            className="alert"
            style={{
              background: "var(--color-green-100)",
              borderLeft: "4px solid var(--color-green-600)",
              color: "var(--color-green-600)",
            }}
          >
            This message has been validated as transactional. It will be routed
            through the priority transactional pipeline, bypassing Janeway.
          </div>
        </div>
      )}

      {/* Input Configuration */}
      <div className="bui-box">
        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 16 }}>
          Input Configuration
        </div>

        {/* Channel as radio cards */}
        <div className="form-group">
          <label className="form-label">Channel</label>
          <div
            className="radio-card-group"
            style={{ gridTemplateColumns: "1fr 1fr 1fr" }}
          >
            {(["email", "notification", "sms"] as MessageChannel[]).map(
              (ch) => (
                <div
                  key={ch}
                  className={`radio-card ${channel === ch ? "selected" : ""}`}
                  onClick={() => setChannel(ch)}
                  style={{ padding: "12px 16px" }}
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

        {/* Topics */}
        <div className="form-group">
          <label className="form-label">Input Topic</label>
          <select
            className="form-select"
            value={inputTopic}
            onChange={(e) => setInputTopic(e.target.value)}
          >
            <option value="">Select a topic...</option>
            <option>booking_events</option>
            <option>payment_events</option>
            <option>identity_events</option>
            <option>trip_events</option>
            <option>browsing_events</option>
            <option>engagement_events</option>
          </select>
        </div>

        {/* Consent check */}
        <div className="form-group">
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={consentCheck}
              onChange={() => setConsentCheck(!consentCheck)}
            />
            Enable Consent Check
            <span
              title="When enabled, checks marketing vs non-marketing campaign eligibility before sending."
              style={{
                cursor: "help",
                color: "var(--color-gray-300)",
                fontSize: 14,
              }}
            >
              &#9432;
            </span>
          </label>
        </div>

        {/* Event time window */}
        <div className="form-group">
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={eventTimeWindow}
              onChange={() => setEventTimeWindow(!eventTimeWindow)}
            />
            Set event time window
          </label>
          {eventTimeWindow && (
            <div
              className="tier-selection-appear"
              style={{
                marginTop: 8,
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 14,
                paddingLeft: 24,
              }}
            >
              Track topics in the last
              <input
                className="form-input"
                type="number"
                min="1"
                style={{ width: 80 }}
                value={eventTimeMinutes}
                onChange={(e) => setEventTimeMinutes(e.target.value)}
                placeholder="60"
              />
              minutes
            </div>
          )}
        </div>

        {/* Event evaluation delay */}
        <div className="form-group">
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={eventDelay}
              onChange={() => setEventDelay(!eventDelay)}
            />
            Set event evaluation delay
          </label>
          {eventDelay && (
            <div
              className="tier-selection-appear"
              style={{
                marginTop: 8,
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 14,
                paddingLeft: 24,
              }}
            >
              Delay event evaluation
              <input
                className="form-input"
                type="number"
                min="1"
                max="360"
                style={{ width: 80 }}
                value={eventDelayMinutes}
                onChange={(e) => setEventDelayMinutes(e.target.value)}
                placeholder="5"
              />
              minutes
            </div>
          )}
        </div>
      </div>

      {/* Rules Section */}
      <div className="bui-box">
        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>
          Rules
        </div>
        <p className="text-muted mb-16">
          Configure filtering rules to determine which events trigger a message.
          Rules are evaluated against the input event fields.
        </p>

        {ruleGroups.length === 0 ? (
          <div
            style={{
              padding: 24,
              border: "1px dashed var(--border-color)",
              borderRadius: "var(--radius-md)",
              textAlign: "center",
            }}
          >
            <p
              className="text-muted"
              style={{ marginBottom: 12 }}
            >
              No rules configured. Add a rule group to filter events.
            </p>
            <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
              <button
                className="btn btn-secondary"
                onClick={() =>
                  setRuleGroups([
                    {
                      id: nextId("grp"),
                      combinator: "and",
                      rules: [
                        {
                          id: nextId("rule"),
                          field: "",
                          operator: "eq",
                          value: "",
                          tag: "",
                        },
                      ],
                    },
                  ])
                }
              >
                + Add Rule
              </button>
              <button
                className="btn btn-secondary"
                onClick={() =>
                  setRuleGroups([
                    {
                      id: nextId("grp"),
                      combinator: "and",
                      rules: [],
                    },
                  ])
                }
              >
                + Add Group
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {ruleGroups.map((group, gi) => (
              <div key={group.id} className="rule-group">
                {/* Group header */}
                <div className="rule-group-header">
                  <button
                    className={`combinator-toggle ${group.combinator}`}
                    onClick={() =>
                      setRuleGroups((gs) =>
                        gs.map((g, i) =>
                          i === gi
                            ? {
                                ...g,
                                combinator:
                                  g.combinator === "and" ? "or" : "and",
                              }
                            : g
                        )
                      )
                    }
                  >
                    {group.combinator.toUpperCase()}
                  </button>
                  <button
                    className="btn btn-tertiary btn-destructive"
                    style={{ fontSize: 12, marginLeft: "auto" }}
                    onClick={() =>
                      setRuleGroups((gs) => gs.filter((_, i) => i !== gi))
                    }
                  >
                    Remove Group
                  </button>
                </div>

                {/* Rules in group */}
                {group.rules.map((rule, ri) => (
                  <div key={rule.id} className="rule-row">
                    <select
                      className="form-select"
                      value={rule.field}
                      style={{ minWidth: 160 }}
                      onChange={(e) =>
                        setRuleGroups((gs) =>
                          gs.map((g, i) =>
                            i === gi
                              ? {
                                  ...g,
                                  rules: g.rules.map((r, j) =>
                                    j === ri
                                      ? { ...r, field: e.target.value }
                                      : r
                                  ),
                                }
                              : g
                          )
                        )
                      }
                    >
                      <option value="">Select field</option>
                      {inputTopic &&
                        (TOPIC_FIELDS[inputTopic] || []).map((f) => (
                          <option key={f} value={f}>
                            {f}
                          </option>
                        ))}
                    </select>

                    <select
                      className="form-select"
                      value={rule.operator}
                      style={{ minWidth: 140 }}
                      onChange={(e) =>
                        setRuleGroups((gs) =>
                          gs.map((g, i) =>
                            i === gi
                              ? {
                                  ...g,
                                  rules: g.rules.map((r, j) =>
                                    j === ri
                                      ? { ...r, operator: e.target.value }
                                      : r
                                  ),
                                }
                              : g
                          )
                        )
                      }
                    >
                      {OPERATORS.map((op) => (
                        <option key={op.value} value={op.value}>
                          {op.label}
                        </option>
                      ))}
                    </select>

                    <input
                      className="form-input"
                      placeholder="Value"
                      value={rule.value}
                      style={{ minWidth: 120 }}
                      onChange={(e) =>
                        setRuleGroups((gs) =>
                          gs.map((g, i) =>
                            i === gi
                              ? {
                                  ...g,
                                  rules: g.rules.map((r, j) =>
                                    j === ri
                                      ? { ...r, value: e.target.value }
                                      : r
                                  ),
                                }
                              : g
                          )
                        )
                      }
                    />

                    <input
                      className="form-input"
                      placeholder="Metric tag"
                      value={rule.tag}
                      style={{ width: 120 }}
                      title="Events failing this rule will be labeled with this tag on the Triggers dashboard"
                      onChange={(e) =>
                        setRuleGroups((gs) =>
                          gs.map((g, i) =>
                            i === gi
                              ? {
                                  ...g,
                                  rules: g.rules.map((r, j) =>
                                    j === ri
                                      ? { ...r, tag: e.target.value }
                                      : r
                                  ),
                                }
                              : g
                          )
                        )
                      }
                    />

                    <button
                      className="btn btn-tertiary btn-destructive"
                      style={{ padding: "6px 8px", fontSize: 16 }}
                      title="Remove rule"
                      onClick={() =>
                        setRuleGroups((gs) =>
                          gs.map((g, i) =>
                            i === gi
                              ? {
                                  ...g,
                                  rules: g.rules.filter((_, j) => j !== ri),
                                }
                              : g
                          )
                        )
                      }
                    >
                      &minus;
                    </button>
                  </div>
                ))}

                {/* Add rule button */}
                <div style={{ marginTop: 8, marginLeft: 48 }}>
                  <button
                    className="btn btn-secondary"
                    style={{ fontSize: 12 }}
                    onClick={() =>
                      setRuleGroups((gs) =>
                        gs.map((g, i) =>
                          i === gi
                            ? {
                                ...g,
                                rules: [
                                  ...g.rules,
                                  {
                                    id: nextId("rule"),
                                    field: "",
                                    operator: "eq",
                                    value: "",
                                    tag: "",
                                  },
                                ],
                              }
                            : g
                        )
                      )
                    }
                  >
                    + Add Rule
                  </button>
                </div>
              </div>
            ))}

            {/* Add group button */}
            <div>
              <button
                className="btn btn-secondary"
                onClick={() =>
                  setRuleGroups((gs) => [
                    ...gs,
                    {
                      id: nextId("grp"),
                      combinator: "and",
                      rules: [
                        {
                          id: nextId("rule"),
                          field: "",
                          operator: "eq",
                          value: "",
                          tag: "",
                        },
                      ],
                    },
                  ])
                }
              >
                + Add Group
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Output Configuration */}
      <div className="bui-box">
        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>
          Output Configuration
        </div>
        <p className="text-muted mb-16">
          Configure output data to be available to the Trigger's consumer.
          Output fields can be mapped onto email, push notification, or SMS
          content, or used to create campaign eligibility rules.
        </p>

        {/* Output fields */}
        {outputFields.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
            {outputFields.map((of, i) => (
              <div
                key={of.id}
                className="rule-row"
                style={{ background: "var(--color-gray-50)" }}
              >
                <select
                  className="form-select"
                  value={of.field}
                  style={{ minWidth: 200 }}
                  onChange={(e) =>
                    setOutputFields((fs) =>
                      fs.map((f, j) =>
                        j === i ? { ...f, field: e.target.value } : f
                      )
                    )
                  }
                >
                  <option value="">Select topic and field</option>
                  {inputTopic &&
                    (TOPIC_FIELDS[inputTopic] || []).map((f) => (
                      <option key={f} value={`${inputTopic}.${f}`}>
                        {inputTopic}.{f}
                      </option>
                    ))}
                </select>

                <input
                  className="form-input"
                  placeholder="Property Name"
                  value={of.propertyName}
                  style={{ minWidth: 200 }}
                  onChange={(e) =>
                    setOutputFields((fs) =>
                      fs.map((f, j) =>
                        j === i
                          ? { ...f, propertyName: e.target.value }
                          : f
                      )
                    )
                  }
                />

                <button
                  className="btn btn-tertiary btn-destructive"
                  style={{ padding: "6px 8px", fontSize: 16 }}
                  title="Remove field"
                  onClick={() =>
                    setOutputFields((fs) => fs.filter((_, j) => j !== i))
                  }
                >
                  &minus;
                </button>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: "flex", gap: 8 }}>
          <button
            className="btn btn-secondary"
            disabled={!inputTopic}
            onClick={() =>
              setOutputFields((fs) => [
                ...fs,
                { id: nextId("out"), field: "", propertyName: "" },
              ])
            }
          >
            + Add Field
          </button>
          <button
            className="btn btn-secondary"
            disabled={!inputTopic}
            title="Add an advanced field with custom JSON configuration"
            onClick={() =>
              setOutputFields((fs) => [
                ...fs,
                { id: nextId("out"), field: "", propertyName: "" },
              ])
            }
          >
            + Add Advanced Field
          </button>
        </div>

        {/* UUID */}
        <div style={{ marginTop: 24, paddingTop: 16, borderTop: "1px solid var(--border-color)" }}>
          <div
            style={{
              fontWeight: 600,
              fontSize: 14,
              marginBottom: 4,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            UUID
            <span
              title="UUID uniquely identifies each message using fields from the output payload. Used for deduplication when duplicate events are produced at source."
              style={{
                cursor: "help",
                color: "var(--color-gray-300)",
                fontSize: 14,
              }}
            >
              &#9432;
            </span>
          </div>
          <p className="text-muted" style={{ marginBottom: 8 }}>
            Select output fields to compose the unique message identifier.
          </p>

          <select
            className="form-select"
            multiple
            value={uuidFields}
            style={{ minHeight: 60 }}
            onChange={(e) =>
              setUuidFields(
                Array.from(e.target.selectedOptions, (o) => o.value)
              )
            }
          >
            {outputFields
              .filter((f) => f.propertyName)
              .map((f) => (
                <option key={f.id} value={f.propertyName}>
                  {f.propertyName}
                </option>
              ))}
          </select>

          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 13,
              marginTop: 8,
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={reuseUuid}
              onChange={() => setReuseUuid(!reuseUuid)}
            />
            The field is already in standard UUID format (e.g.,
            12345678-abcd-1234-abcd-123456789abc)
          </label>
        </div>
      </div>

      {/* Save */}
      <div className="btn-group">
        <button
          className="btn btn-secondary"
          onClick={() => navigate("/triggers")}
        >
          Cancel
        </button>
        <button
          className="btn btn-primary"
          disabled={!canSave()}
          onClick={handleSave}
        >
          Save Trigger
        </button>
      </div>

      {toast && <div className="toast">{toast}</div>}

      {/* Transactional validation modal */}
      {showTxModal && (
        <div className="modal-overlay">
          <div className="modal" style={{ width: 680, maxHeight: "90vh" }}>
            <div className="modal-title">Transactional Validation</div>
            <div className="modal-subtitle">
              Answer the following questions to validate that this message
              qualifies as transactional. The questionnaire determines the
              classification.
            </div>

            <ClassificationQuestionnaire
              mode="inline"
              onChange={(c) => setClassification(c)}
            />

            {/* Result alerts inside modal */}
            {classification && (
              <div style={{ marginTop: 16 }}>
                {classification.subPurpose === "transactional" && (
                    <div
                      className="alert"
                      style={{
                        background: "var(--color-green-100)",
                        borderLeft: "4px solid var(--color-green-600)",
                        color: "var(--color-green-600)",
                      }}
                    >
                      This message has been validated as transactional. It will
                      be routed through the priority transactional pipeline,
                      bypassing Janeway.
                    </div>
                  )}

                {classification.purpose === "marketing" && (
                  <div className="alert alert-warning">
                    <div className="alert-title">
                      Does not qualify as Transactional
                    </div>
                    Based on your answers, this message is classified as{" "}
                    <strong>Marketing</strong>. It does not meet the criteria
                    for transactional delivery.
                  </div>
                )}

                {classification.purpose === "non_marketing" &&
                  !classification.subPurpose && (
                    <div className="alert alert-info">
                      <div className="alert-title">
                        Non-Marketing but not Transactional
                      </div>
                      This message is non-marketing but does not meet all
                      transactional criteria.
                    </div>
                  )}
              </div>
            )}

            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setShowTxModal(false);
                  setClassification(null);
                }}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                disabled={!isTransactionalConfirmed}
                onClick={() => {
                  setTriggerType("transactional");
                  setShowTxModal(false);
                }}
              >
                Confirm as Transactional
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Non-transactional confirmation modal */}
      {showNonTxModal && (
        <div className="modal-overlay">
          <div className="modal" style={{ width: 560 }}>
            <div className="modal-title">Change Message Type</div>
            <div className="modal-subtitle">
              You are about to classify this trigger as Non-Transactional. This
              means the message will be routed through the standard messaging
              pipeline (via Janeway).
            </div>

            <div className="alert alert-info">
              <div className="alert-title">Non-Transactional Trigger</div>
              This trigger will follow the standard delivery path. Subscription
              preferences and eligibility rules configured on the campaign will
              apply.
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setShowNonTxModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  setTriggerType("non_transactional");
                  setClassification(null);
                  setShowNonTxModal(false);
                }}
              >
                Confirm Non-Transactional
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
