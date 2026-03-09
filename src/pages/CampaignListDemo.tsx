import { useState } from "react";
import { useNavigate } from "react-router-dom";
interface MockCampaign {
  id: number;
  name: string;
  channel: "email" | "notification" | "sms";
  status: "Draft" | "Published" | "Stopped";
  pipeline: string;
  purpose: "marketing" | "non_marketing";
  subPurpose?: "transactional";
  trackingId: string;
  dateRange: string;
  createdAt: string;
  updatedAt: string;
  updatedBy: string;
}

const mockCampaigns: MockCampaign[] = [
  {
    id: 1001,
    name: "booking_confirmation_email",
    channel: "email",
    status: "Published",
    pipeline: "Trigger: booking_confirmation_trigger",
    purpose: "non_marketing",
    subPurpose: "transactional",
    trackingId: "trk_booking_conf",
    dateRange: "1 Jan 2026 - 31 Dec 2026",
    createdAt: "8 Mar 2026",
    updatedAt: "8 Mar 2026",
    updatedBy: "trip-comms",
  },
  {
    id: 1002,
    name: "otp_verification_sms",
    channel: "sms",
    status: "Published",
    pipeline: "Trigger: otp_sms_trigger",
    purpose: "non_marketing",
    subPurpose: "transactional",
    trackingId: "trk_otp_sms",
    dateRange: "1 Jan 2026 - 31 Dec 2026",
    createdAt: "7 Mar 2026",
    updatedAt: "7 Mar 2026",
    updatedBy: "identity-team",
  },
  {
    id: 1003,
    name: "summer_deals_email",
    channel: "email",
    status: "Published",
    pipeline: "Scheduled: Daily EMK",
    purpose: "marketing",
    trackingId: "trk_summer_deals",
    dateRange: "1 Jun 2026 - 31 Aug 2026",
    createdAt: "5 Mar 2026",
    updatedAt: "5 Mar 2026",
    updatedBy: "engage-team",
  },
  {
    id: 1004,
    name: "payment_receipt_email",
    channel: "email",
    status: "Draft",
    pipeline: "Trigger: payment_receipt_trigger",
    purpose: "non_marketing",
    subPurpose: "transactional",
    trackingId: "trk_payment_receipt",
    dateRange: "1 Jan 2026 - 31 Dec 2026",
    createdAt: "2 Mar 2026",
    updatedAt: "4 Mar 2026",
    updatedBy: "payments-team",
  },
  {
    id: 1005,
    name: "genius_promo_push",
    channel: "notification",
    status: "Published",
    pipeline: "Scheduled: Daily Notifications",
    purpose: "marketing",
    trackingId: "trk_genius_promo",
    dateRange: "1 Mar 2026 - 30 Jun 2026",
    createdAt: "3 Mar 2026",
    updatedAt: "3 Mar 2026",
    updatedBy: "genius-team",
  },
  {
    id: 1006,
    name: "checkin_reminder_push",
    channel: "notification",
    status: "Published",
    pipeline: "Trigger: checkin_reminder_trigger",
    purpose: "non_marketing",
    subPurpose: "transactional",
    trackingId: "trk_checkin_reminder",
    dateRange: "1 Jan 2026 - 31 Dec 2026",
    createdAt: "6 Mar 2026",
    updatedAt: "6 Mar 2026",
    updatedBy: "trip-enrichment",
  },
  {
    id: 1007,
    name: "review_request_email",
    channel: "email",
    status: "Draft",
    pipeline: "Trigger: review_invite_trigger",
    purpose: "non_marketing",
    subPurpose: "transactional",
    trackingId: "trk_review_req",
    dateRange: "1 Jan 2026 - 31 Dec 2026",
    createdAt: "4 Mar 2026",
    updatedAt: "4 Mar 2026",
    updatedBy: "ugc-team",
  },
];

function StatusBadge({ status }: { status: string }) {
  const cls =
    status === "Published"
      ? "badge badge-published"
      : status === "Stopped"
        ? "badge badge-stopped"
        : "badge badge-draft";
  return <span className={cls}>{status}</span>;
}

function ChannelBadge({ channel }: { channel: string }) {
  const label =
    channel === "email" ? "Email" : channel === "sms" ? "SMS" : "Notifications";
  return <span className="badge badge-outline">{label}</span>;
}

export default function CampaignListDemo() {
  const navigate = useNavigate();
  const [filterText, setFilterText] = useState("");
  const [filterChannel, setFilterChannel] = useState("all");
  const [sortField, setSortField] = useState("updated_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const filtered = mockCampaigns
    .filter((c) => {
      if (filterText && !c.name.toLowerCase().includes(filterText.toLowerCase()))
        return false;
      if (filterChannel !== "all" && c.channel !== filterChannel) return false;
      return true;
    })
    .sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      if (sortField === "name") return a.name.localeCompare(b.name) * dir;
      return a.id > b.id ? dir : -dir;
    });

  return (
    <div className="app-page">
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-main">
          <h1 className="page-title">Campaigns</h1>
        </div>
        <div className="page-header-actions">
          <button
            className="btn btn-primary btn-large"
            onClick={() => navigate("/campaign/new")}
          >
            + New Campaign
          </button>
        </div>
      </div>

      {/* Filter card */}
      <div className="filter-card">
        <div className="filter-row">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Filter</label>
            <input
              className="form-input"
              placeholder="Filter by Name or Description"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Channel</label>
            <select
              className="form-select"
              value={filterChannel}
              onChange={(e) => setFilterChannel(e.target.value)}
            >
              <option value="all">All</option>
              <option value="email">Email</option>
              <option value="notification">Notification</option>
              <option value="sms">SMS</option>
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Status</label>
            <select className="form-select">
              <option value="all">All</option>
              <option value="Draft">Draft</option>
              <option value="Published">Published</option>
              <option value="Stopped">Stopped</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results card */}
      <div className="results-card">
        <div className="results-header">
          <div className="results-count">
            {filtered.length}{" "}
            {filtered.length === 1 ? "Campaign" : "Campaigns"} total
          </div>
          <div className="results-sort">
            <span className="results-sort-label">Sort by</span>
            <select
              className="form-select"
              style={{ width: "auto" }}
              value={sortField}
              onChange={(e) => setSortField(e.target.value)}
            >
              <option value="updated_at">Updated Date</option>
              <option value="created_at">Created Date</option>
              <option value="name">Name</option>
            </select>
            <button
              className="btn btn-secondary"
              style={{ padding: "6px 10px" }}
              onClick={() =>
                setSortDir((d) => (d === "asc" ? "desc" : "asc"))
              }
            >
              {sortDir === "asc" ? "\u2191" : "\u2193"}
            </button>
          </div>
        </div>

        <div className="results-list">
          {filtered.map((c) => (
            <div key={c.id} className="list-card">
              <div className="list-card-content">
                {/* Title row */}
                <div className="list-card-title">
                  <span>{c.name}</span>
                  <StatusBadge status={c.status} />
                </div>

                {/* Badge row 1: tracking, pipeline, date */}
                <div className="list-card-meta">
                  <span className="badge badge-media">{c.trackingId}</span>
                  <span className="badge badge-media">{c.pipeline}</span>
                  <span className="badge badge-media">{c.dateRange}</span>
                  <ChannelBadge channel={c.channel} />
                </div>

                {/* Badge row 2: metadata */}
                <div className="list-card-meta">
                  <span className="badge badge-media">
                    Created {c.createdAt}
                  </span>
                  <span className="badge badge-media">
                    Updated {c.updatedAt} by {c.updatedBy}
                  </span>
                  <span className="badge badge-media">ID: {c.id}</span>
                </div>
              </div>

              <div className="list-card-actions">
                <button
                  className="btn btn-tertiary"
                  style={{ fontSize: 12 }}
                  title="Clone"
                >
                  Clone
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
