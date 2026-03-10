import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { MessageChannel, CHANNEL_LABELS } from "../constants";

/**
 * Original 4 questions from the targeting UI (utils.ts questionKey).
 * These determine marketing vs non-marketing vs non-marketing transactional.
 */
const PURPOSE_QUESTIONS = {
  q1: "Is the purpose of this message to make a sale or promote products or services to a potential customer?",
  q2: "Does this message include ads, offers, or invitations to buy or join something?",
  q3: "Does this message only provide information about an existing booking or about benefits/features the customer already has?",
};

function decidePurpose(answers: Record<string, "yes" | "no">): {
  purpose: "marketing" | "non_marketing";
} | null {
  const qs = Object.values(PURPOSE_QUESTIONS);
  if (!qs.every((q) => answers[q] !== undefined)) return null;

  if (answers[qs[0]] === "yes" || answers[qs[1]] === "yes") {
    return { purpose: "marketing" };
  }
  return { purpose: "non_marketing" };
}

type CampaignPurpose = "" | "marketing" | "non_marketing" | "transactional";

export default function CampaignCreateDemo() {
  const navigate = useNavigate();

  // Basic info
  const [campaignName, setCampaignName] = useState("");
  const [description, setDescription] = useState("");

  // Metadata
  const [purpose, setPurpose] = useState<CampaignPurpose>("");
  const [usesVouchers, setUsesVouchers] = useState("");
  const [holdoutVertical, setHoldoutVertical] = useState("");
  const [holdoutFunnel, setHoldoutFunnel] = useState("");

  // Non-marketing questionnaire modal
  const [showPurposeModal, setShowPurposeModal] = useState(false);
  const [purposeResponses, setPurposeResponses] = useState<
    Record<string, "yes" | "no">
  >({});

  // Transactional trigger flow
  const [hasTrigger, setHasTrigger] = useState<"yes" | "no" | null>(null);
  const [selectedTrigger, setSelectedTrigger] = useState("");

  // Send config
  const [pipeline, setPipeline] = useState("");
  const [activationType, setActivationType] = useState("");
  const [channel] = useState<MessageChannel>("email");

  // Content
  const [contentTrackingLabel, setContentTrackingLabel] = useState("");
  const [messageCategory, setMessageCategory] = useState("");

  // Eligibility
  const [eligibilityRules, setEligibilityRules] = useState<
    { id: number; field: string; operator: string; value: string }[]
  >([]);

  // Experiments
  const [experimentEnabled, setExperimentEnabled] = useState(false);
  const [experimentTag, setExperimentTag] = useState("");
  const [variantCount, setVariantCount] = useState(2);

  // Reporting
  const [affiliateId, setAffiliateId] = useState("");
  const [parentAffiliateId, setParentAffiliateId] = useState("");

  // UI state
  const [toast, setToast] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const purposeDecision = useMemo(
    () => decidePurpose(purposeResponses),
    [purposeResponses]
  );

  function handlePurposeChange(value: CampaignPurpose) {
    if (value === "non_marketing") {
      // Open the questionnaire modal (same as original targeting UI)
      setShowPurposeModal(true);
      setPurposeResponses({});
      return;
    }
    setPurpose(value);
    // Reset trigger state when switching purpose
    setHasTrigger(null);
    setSelectedTrigger("");
  }

  function handlePurposeModalConfirm() {
    if (!purposeDecision || purposeDecision.purpose !== "non_marketing") return;
    setPurpose("non_marketing");
    setShowPurposeModal(false);
    setHasTrigger(null);
    setSelectedTrigger("");
  }

  function handlePurposeModalCancel() {
    setShowPurposeModal(false);
    setPurposeResponses({});
    // Keep as marketing (same as original)
    setPurpose("marketing");
  }

  function handleSave() {
    setSaved(true);
    setToast("Campaign saved successfully!");
    setTimeout(() => setToast(null), 3000);
  }

  if (saved) {
    return (
      <div className="app-page">
        <div className="page-header">
          <div className="page-header-main">
            <h1 className="page-title">Campaign Created</h1>
          </div>
        </div>
        <div className="bui-box" style={{ textAlign: "center", padding: 48 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>&#10003;</div>
          <h2 style={{ marginBottom: 8 }}>Campaign Created</h2>
          <p className="text-muted mb-16">
            "{campaignName}" has been saved as a{" "}
            {purpose === "transactional"
              ? "Transactional"
              : purpose === "non_marketing"
                ? "Non-marketing"
                : "Marketing"}{" "}
            campaign.
          </p>
          <div
            className="btn-group"
            style={{ justifyContent: "center", marginTop: 24 }}
          >
            <button
              className="btn btn-secondary"
              onClick={() => navigate("/campaigns")}
            >
              View All Campaigns
            </button>
            <button
              className="btn btn-primary"
              onClick={() => {
                setSaved(false);
                setCampaignName("");
                setDescription("");
                setPurpose("");
                setUsesVouchers("");
                setHoldoutVertical("");
                setHoldoutFunnel("");
                setHasTrigger(null);
                setSelectedTrigger("");
                setPipeline("");
                setActivationType("");
                setContentTrackingLabel("");
                setMessageCategory("");
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
          <h1 className="page-title">New Campaign</h1>
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <span className="badge badge-outline">
              {CHANNEL_LABELS[channel]}
            </span>
            {purpose === "marketing" && (
              <span className="badge badge-marketing">Marketing</span>
            )}
            {purpose === "non_marketing" && (
              <span className="badge badge-outline">Non-marketing</span>
            )}
            {purpose === "transactional" && (
              <span className="badge badge-constructive">Transactional</span>
            )}
            <span className="badge badge-draft">Draft</span>
          </div>
        </div>
        <div className="page-header-actions">
          <button
            className="btn btn-secondary"
            onClick={() => navigate("/campaigns")}
          >
            Cancel
          </button>
          <button
            className="btn btn-primary btn-large"
            disabled={!campaignName || !purpose}
            onClick={handleSave}
          >
            Save
          </button>
        </div>
      </div>

      {/* Section 1: Basic Information */}
      <div className="bui-box">
        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 16 }}>
          Basic Information
        </div>

        <div className="form-group">
          <label className="form-label">Campaign Name</label>
          <input
            className="form-input"
            placeholder="e.g., booking_confirmation_email"
            value={campaignName}
            onChange={(e) => setCampaignName(e.target.value)}
            maxLength={50}
          />
          <div
            className="text-muted"
            style={{ marginTop: 4, fontSize: 12 }}
          >
            {campaignName.length}/50 chars
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea
            className="form-textarea"
            placeholder="Describe the purpose of this campaign..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
      </div>

      {/* Section 2: Metadata */}
      <div className="bui-box">
        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 16 }}>
          Metadata
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {/* Campaign Purpose */}
          <div className="form-group">
            <label className="form-label">
              Campaign Purpose
              <span
                title="Marketing: Main goal is to drive business. Marketing holdout and subscriptions apply.&#10;Non-marketing: Main goal is to give updates that do not drive business. Subscription categories apply.&#10;Transactional: Booking confirmations, cancellations, OTPs, payment receipts. Bypasses subscriptions, requires a trigger."
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
              value={purpose}
              onChange={(e) =>
                handlePurposeChange(e.target.value as CampaignPurpose)
              }
            >
              <option value="">Select purpose...</option>
              <option value="marketing">Marketing</option>
              <option value="non_marketing">Non-marketing</option>
              <option value="transactional">Transactional</option>
            </select>
          </div>

          {/* Vouchers */}
          <div className="form-group">
            <label className="form-label">
              Campaign Uses Vouchers or Coupons
            </label>
            <select
              className="form-select"
              value={usesVouchers}
              onChange={(e) => setUsesVouchers(e.target.value)}
            >
              <option value="">Please select</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>

          {/* Holdout Vertical */}
          <div className="form-group">
            <label className="form-label">Holdout Vertical</label>
            <select
              className="form-select"
              value={holdoutVertical}
              onChange={(e) => setHoldoutVertical(e.target.value)}
            >
              <option value="">Select vertical...</option>
              <option>Hotels</option>
              <option>Flights</option>
              <option>Cars</option>
              <option>Attractions</option>
            </select>
          </div>

          {/* Holdout Funnel */}
          <div className="form-group">
            <label className="form-label">Holdout Funnel</label>
            <select
              className="form-select"
              value={holdoutFunnel}
              onChange={(e) => setHoldoutFunnel(e.target.value)}
            >
              <option value="">Select funnel...</option>
              <option>Acquisition</option>
              <option>Booking</option>
              <option>Post-booking</option>
              <option>Loyalty</option>
            </select>
          </div>
        </div>

        {/* Transactional trigger flow — shown when questionnaire determined transactional */}
        {purpose === "transactional" && (
          <div className="tier-selection-appear" style={{ marginTop: 8 }}>
            <div
              style={{
                padding: 16,
                background: "var(--color-blue-50)",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--action-200)",
              }}
            >
              <div style={{ fontWeight: 700, marginBottom: 8 }}>
                Transactional messages require a trigger
              </div>
              <p
                className="text-muted"
                style={{ marginBottom: 12 }}
              >
                Transactional messages are event-driven — they are sent in
                response to a specific customer action (booking, payment, OTP
                request). A trigger must be created first to define the input
                event and validate the transactional classification.
              </p>

              <div className="form-group" style={{ marginBottom: 12 }}>
                <label className="form-label">
                  Have you already created a trigger for this transactional
                  message?
                </label>
                <div style={{ display: "flex", gap: 12 }}>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      cursor: "pointer",
                      fontSize: 14,
                    }}
                  >
                    <input
                      type="radio"
                      name="hasTrigger"
                      checked={hasTrigger === "yes"}
                      onChange={() => setHasTrigger("yes")}
                      style={{ accentColor: "var(--color-blue-500)" }}
                    />
                    Yes, I have a trigger
                  </label>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      cursor: "pointer",
                      fontSize: 14,
                    }}
                  >
                    <input
                      type="radio"
                      name="hasTrigger"
                      checked={hasTrigger === "no"}
                      onChange={() => setHasTrigger("no")}
                      style={{ accentColor: "var(--color-blue-500)" }}
                    />
                    No, I need to create one
                  </label>
                </div>
              </div>

              {/* Yes — select existing trigger */}
              {hasTrigger === "yes" && (
                <div className="tier-selection-appear">
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Select Trigger</label>
                    <select
                      className="form-select"
                      value={selectedTrigger}
                      onChange={(e) => setSelectedTrigger(e.target.value)}
                    >
                      <option value="">Select a trigger...</option>
                      <option value="booking_confirmation_trigger">
                        booking_confirmation_trigger (Email, LIVE)
                      </option>
                      <option value="otp_sms_trigger">
                        otp_sms_trigger (SMS, LIVE)
                      </option>
                      <option value="review_invite_trigger">
                        review_invite_trigger (Email, LIVE)
                      </option>
                      <option value="checkin_reminder_trigger">
                        checkin_reminder_trigger (Notification, DRAFT)
                      </option>
                    </select>
                  </div>
                  {selectedTrigger && (
                    <div
                      className="tier-selection-appear"
                      style={{
                        marginTop: 12,
                        padding: 12,
                        background: "var(--color-green-100)",
                        borderRadius: "var(--radius-sm)",
                        color: "var(--color-green-600)",
                        fontSize: 13,
                      }}
                    >
                      <strong>Trigger linked.</strong> The pipeline will be set
                      to "Trigger: {selectedTrigger}" and the transactional
                      classification from the trigger will be inherited.
                    </div>
                  )}
                </div>
              )}

              {/* No — redirect to trigger creation */}
              {hasTrigger === "no" && (
                <div className="tier-selection-appear">
                  <div
                    className="alert alert-info"
                    style={{ marginBottom: 0 }}
                  >
                    <div className="alert-title">
                      Create a trigger first
                    </div>
                    <p style={{ margin: "4px 0 12px" }}>
                      You need to create a trigger rule that defines the input
                      event for this transactional message. The trigger creation
                      flow includes a questionnaire to validate the
                      transactional classification.
                    </p>
                    <button
                      className="btn btn-primary"
                      onClick={() =>
                        navigate("/trigger/new?type=transactional")
                      }
                    >
                      Go to Create Trigger
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Section 3: Send Configuration */}
      <div className="bui-box">
        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 16 }}>
          Send Configuration
        </div>

        {purpose === "non_marketing" && (
          <div className="alert alert-info" style={{ marginBottom: 16 }}>
            Non-marketing messages are published to the test pipeline first.
            Once approved, traffic type and pipeline will be updated by the
            Platform team.
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
          <div className="form-group">
            <label className="form-label">Pipeline</label>
            <select
              className="form-select"
              value={
                purpose === "transactional" && selectedTrigger
                  ? `trigger:${selectedTrigger}`
                  : pipeline
              }
              onChange={(e) => setPipeline(e.target.value)}
              disabled={purpose === "transactional" && !!selectedTrigger}
            >
              <option value="">Select pipeline...</option>
              <option value="scheduled_daily_emk">Scheduled: Daily EMK</option>
              <option value="scheduled_daily_emk_test">
                Scheduled: Daily EMK Test
              </option>
              {purpose === "transactional" && selectedTrigger && (
                <option value={`trigger:${selectedTrigger}`}>
                  Trigger: {selectedTrigger}
                </option>
              )}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Sender Profile</label>
            <select className="form-select">
              <option>Default Sender</option>
              <option>Booking.com</option>
              <option>Booking.com Payments</option>
            </select>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 16 }}>
          <div className="form-group">
            <label className="form-label">Activation Type</label>
            <select
              className="form-select"
              value={activationType}
              onChange={(e) => setActivationType(e.target.value)}
            >
              <option value="">Select type...</option>
              <option value="manual">Manual</option>
              <option value="single_day">Scheduled for Single Day</option>
              <option value="multi_day">Scheduled for Multiple Days</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Activation Dates</label>
            <div style={{ display: "flex", gap: 8 }}>
              <input className="form-input" type="date" />
              <span style={{ alignSelf: "center", color: "var(--color-gray-500)" }}>
                to
              </span>
              <input className="form-input" type="date" />
            </div>
          </div>
        </div>
      </div>

      {/* Section 4: Base Content */}
      <div className="bui-box">
        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 16 }}>
          Base Content
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div className="form-group">
            <label className="form-label">Content Tracking Label</label>
            <input
              className="form-input"
              placeholder="e.g., booking_conf_v1"
              value={contentTrackingLabel}
              onChange={(e) => setContentTrackingLabel(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Message Category</label>
            <select
              className="form-select"
              value={messageCategory}
              onChange={(e) => setMessageCategory(e.target.value)}
            >
              <option value="">Select category...</option>
              <option>booking</option>
              <option>payment</option>
              <option>identity</option>
              <option>promotional</option>
              <option>informational</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Content ID</label>
          <input className="form-input" placeholder="Select content..." />
        </div>
      </div>

      {/* Section 5: Eligibility Rules (hidden for transactional campaigns) */}
      {purpose !== "transactional" && <div className="bui-box">
        <div
          style={{
            fontWeight: 700,
            fontSize: 16,
            marginBottom: 4,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          Eligibility Rules
          <span
            title="Define rules to filter which users are eligible to receive this campaign. Rules are evaluated at send time."
            style={{
              cursor: "help",
              color: "var(--color-gray-300)",
              fontSize: 14,
            }}
          >
            &#9432;
          </span>
        </div>
        <p className="text-muted mb-16">
          Define audience eligibility criteria for this campaign.
        </p>

        {eligibilityRules.length > 0 && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
              marginBottom: 16,
            }}
          >
            {eligibilityRules.map((rule, i) => (
              <div
                key={rule.id}
                className="rule-row"
                style={{ background: "var(--color-gray-50)" }}
              >
                <select
                  className="form-select"
                  value={rule.field}
                  style={{ minWidth: 160 }}
                  onChange={(e) =>
                    setEligibilityRules((rs) =>
                      rs.map((r, j) =>
                        j === i ? { ...r, field: e.target.value } : r
                      )
                    )
                  }
                >
                  <option value="">Select field...</option>
                  <option value="country">Country</option>
                  <option value="language">Language</option>
                  <option value="genius_level">Genius Level</option>
                  <option value="booking_count">Booking Count</option>
                  <option value="last_booking_date">Last Booking Date</option>
                  <option value="device_type">Device Type</option>
                  <option value="subscription_status">
                    Subscription Status
                  </option>
                </select>

                <select
                  className="form-select"
                  value={rule.operator}
                  style={{ minWidth: 120 }}
                  onChange={(e) =>
                    setEligibilityRules((rs) =>
                      rs.map((r, j) =>
                        j === i ? { ...r, operator: e.target.value } : r
                      )
                    )
                  }
                >
                  <option value="eq">Equals</option>
                  <option value="ne">Not equals</option>
                  <option value="gt">Greater than</option>
                  <option value="lt">Less than</option>
                  <option value="in">In</option>
                </select>

                <input
                  className="form-input"
                  placeholder="Value"
                  value={rule.value}
                  onChange={(e) =>
                    setEligibilityRules((rs) =>
                      rs.map((r, j) =>
                        j === i ? { ...r, value: e.target.value } : r
                      )
                    )
                  }
                />

                <button
                  className="btn btn-tertiary btn-destructive"
                  style={{ padding: "6px 8px", fontSize: 16 }}
                  onClick={() =>
                    setEligibilityRules((rs) => rs.filter((_, j) => j !== i))
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
            onClick={() =>
              setEligibilityRules((rs) => [
                ...rs,
                {
                  id: Date.now(),
                  field: "",
                  operator: "eq",
                  value: "",
                },
              ])
            }
          >
            + Add Rule
          </button>
          <button className="btn btn-secondary">Import Audience</button>
        </div>
      </div>}

      {/* Section 6: Experiments */}
      <div className="bui-box">
        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 16 }}>
          Experiment
        </div>

        {!experimentEnabled ? (
          <div
            style={{
              padding: 24,
              border: "1px dashed var(--border-color)",
              borderRadius: "var(--radius-md)",
              textAlign: "center",
            }}
          >
            <p className="text-muted" style={{ marginBottom: 12 }}>
              No experiment configured. Set up an A/B test to compare content
              variants.
            </p>
            <button
              className="btn btn-secondary"
              onClick={() => setExperimentEnabled(true)}
            >
              Setup Experiment
            </button>
          </div>
        ) : (
          <div className="tier-selection-appear">
            <div className="form-group">
              <label className="form-label">
                Experiment Tag
                <span
                  className="text-muted"
                  style={{ fontWeight: 400, marginLeft: 8, fontSize: 12 }}
                >
                  For automatic stage tracking, tag should begin with "emk",
                  "mm_email", or "attr_mm_email"
                </span>
              </label>
              <input
                className="form-input"
                placeholder="e.g., emk_booking_conf_experiment"
                value={experimentTag}
                onChange={(e) => setExperimentTag(e.target.value)}
              />
            </div>

            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 8 }}>
              Content Variants
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
                marginBottom: 16,
              }}
            >
              {Array.from({ length: variantCount }, (_, i) => (
                <div
                  key={i}
                  style={{
                    padding: 16,
                    border: "1px solid var(--border-color)",
                    borderRadius: "var(--radius-md)",
                    background: "var(--color-gray-50)",
                  }}
                >
                  <div
                    style={{
                      fontWeight: 600,
                      fontSize: 13,
                      marginBottom: 12,
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    Variant {i + 1}
                    {variantCount > 2 && (
                      <button
                        className="btn btn-tertiary btn-destructive"
                        style={{ padding: "2px 6px", fontSize: 12 }}
                        onClick={() => setVariantCount((c) => c - 1)}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <div className="form-group" style={{ marginBottom: 8 }}>
                    <label className="form-label">Content ID</label>
                    <input
                      className="form-input"
                      placeholder="Select content..."
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Tracking Label</label>
                    <input
                      className="form-input"
                      placeholder={`variant_${i + 1}`}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button
                className="btn btn-secondary"
                onClick={() => setVariantCount((c) => c + 1)}
              >
                + Add Variant
              </button>
              <button
                className="btn btn-secondary btn-destructive"
                onClick={() => {
                  setExperimentEnabled(false);
                  setExperimentTag("");
                  setVariantCount(2);
                }}
              >
                Remove Experiment
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Section 7: Reporting Settings */}
      <div className="bui-box">
        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 16 }}>
          Reporting Settings
        </div>

        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
        >
          <div className="form-group">
            <label className="form-label">Affiliate ID</label>
            <input
              className="form-input"
              type="number"
              placeholder="e.g., 123456"
              value={affiliateId}
              onChange={(e) => setAffiliateId(e.target.value)}
            />
            <div
              className="text-muted"
              style={{ marginTop: 4, fontSize: 12 }}
            >
              Required to publish. Used for reporting attribution.
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Parent Affiliate ID</label>
            <input
              className="form-input"
              type="number"
              placeholder="e.g., 654321"
              value={parentAffiliateId}
              onChange={(e) => setParentAffiliateId(e.target.value)}
            />
            <div
              className="text-muted"
              style={{ marginTop: 4, fontSize: 12 }}
            >
              Required to publish.
            </div>
          </div>
        </div>
      </div>

      {/* Bottom save */}
      <div className="btn-group">
        <button
          className="btn btn-secondary"
          onClick={() => navigate("/campaigns")}
        >
          Cancel
        </button>
        <button
          className="btn btn-primary btn-large"
          disabled={!campaignName || !purpose}
          onClick={handleSave}
        >
          Save
        </button>
      </div>

      {toast && <div className="toast">{toast}</div>}

      {/* Non-marketing purpose questionnaire modal — same 4 questions as original targeting UI */}
      {showPurposeModal && (
        <div className="modal-overlay">
          <div className="modal" style={{ width: 640 }}>
            <div className="modal-title">Change Campaign Purpose</div>
            <div className="modal-subtitle">
              The default purpose for a campaign is Marketing, changing it
              requires you to answer the following questions
            </div>

            {Object.entries(PURPOSE_QUESTIONS).map(([key, question]) => (
              <div key={key} className="question-block">
                <div className="question-text">{question}</div>
                <div className="question-radios">
                  <label>
                    <input
                      type="radio"
                      name={`purpose-${key}`}
                      value="yes"
                      checked={purposeResponses[question] === "yes"}
                      onChange={() =>
                        setPurposeResponses((r) => ({
                          ...r,
                          [question]: "yes",
                        }))
                      }
                    />
                    Yes
                  </label>
                  <label>
                    <input
                      type="radio"
                      name={`purpose-${key}`}
                      value="no"
                      checked={purposeResponses[question] === "no"}
                      onChange={() =>
                        setPurposeResponses((r) => ({
                          ...r,
                          [question]: "no",
                        }))
                      }
                    />
                    No
                  </label>
                </div>
              </div>
            ))}

            {purposeDecision?.purpose === "marketing" && (
              <div className="alert alert-warning">
                <div className="alert-title">
                  This is a Marketing campaign
                </div>
                If you believe your campaign should not be categorised as
                Marketing, reach out to #targeting-support.
              </div>
            )}

            {purposeDecision?.purpose === "non_marketing" && (
              <div className="alert alert-info">
                <div className="alert-title">
                  This is a Non-marketing campaign
                </div>
                Subscription categories will apply. Marketing holdout does not
                apply.
              </div>
            )}

            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={handlePurposeModalCancel}
              >
                Keep as Marketing
              </button>
              <button
                className="btn btn-primary"
                disabled={purposeDecision?.purpose !== "non_marketing"}
                onClick={handlePurposeModalConfirm}
              >
                Change to Non-marketing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
