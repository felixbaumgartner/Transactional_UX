import TransactionalTierBadge from "../components/TransactionalTierBadge";
import { TransactionalTier, TRANSACTIONAL_SLO } from "../constants";

interface TransactionalMessage {
  id: number;
  name: string;
  type: "campaign" | "trigger";
  channel: "email" | "notification" | "sms";
  tier: TransactionalTier;
  status: "enabled" | "draft" | "LIVE" | "DRAFT";
  deliveryRate: string;
  avgLatency: string;
  owner: string;
}

const mockMessages: TransactionalMessage[] = [
  {
    id: 1001,
    name: "booking_confirmation_email",
    type: "campaign",
    channel: "email",
    tier: "tier_1",
    status: "enabled",
    deliveryRate: "99.94%",
    avgLatency: "12s",
    owner: "trip-comms",
  },
  {
    id: 501,
    name: "booking_confirmation_trigger",
    type: "trigger",
    channel: "email",
    tier: "tier_1",
    status: "LIVE",
    deliveryRate: "99.92%",
    avgLatency: "18s",
    owner: "trip-comms",
  },
  {
    id: 502,
    name: "otp_sms_trigger",
    type: "trigger",
    channel: "sms",
    tier: "tier_1",
    status: "LIVE",
    deliveryRate: "99.97%",
    avgLatency: "4s",
    owner: "identity-team",
  },
  {
    id: 1007,
    name: "payment_receipt_email",
    type: "campaign",
    channel: "email",
    tier: "tier_1",
    status: "draft",
    deliveryRate: "-",
    avgLatency: "-",
    owner: "payments-team",
  },
  {
    id: 1003,
    name: "checkin_reminder_push",
    type: "campaign",
    channel: "notification",
    tier: "tier_2",
    status: "enabled",
    deliveryRate: "99.61%",
    avgLatency: "2m 14s",
    owner: "trip-enrichment",
  },
  {
    id: 503,
    name: "review_invite_trigger",
    type: "trigger",
    channel: "email",
    tier: "tier_2",
    status: "LIVE",
    deliveryRate: "99.54%",
    avgLatency: "3m 02s",
    owner: "ugc-team",
  },
  {
    id: 1005,
    name: "review_request_email",
    type: "campaign",
    channel: "email",
    tier: "tier_2",
    status: "draft",
    deliveryRate: "-",
    avgLatency: "-",
    owner: "ugc-team",
  },
  {
    id: 505,
    name: "checkin_reminder_trigger",
    type: "trigger",
    channel: "notification",
    tier: "tier_2",
    status: "DRAFT",
    deliveryRate: "-",
    avgLatency: "-",
    owner: "trip-enrichment",
  },
];

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

function TypeBadge({ type }: { type: string }) {
  return (
    <span className="badge badge-outline">
      {type === "campaign" ? "Campaign" : "Trigger"}
    </span>
  );
}

function SLOStatus({
  tier,
  deliveryRate,
}: {
  tier: TransactionalTier;
  deliveryRate: string;
}) {
  if (deliveryRate === "-") {
    return <span className="text-muted">-</span>;
  }

  const target = parseFloat(TRANSACTIONAL_SLO[tier].deliverySLO);
  const actual = parseFloat(deliveryRate);
  const meeting = actual >= target;

  return (
    <span
      style={{
        fontWeight: 700,
        color: meeting ? "var(--color-green-600)" : "var(--color-red-600)",
      }}
    >
      {deliveryRate} {meeting ? "  ✓" : "  ✗"}
    </span>
  );
}

export default function TransactionalOverviewDemo() {
  const tier1Messages = mockMessages.filter((m) => m.tier === "tier_1");
  const tier2Messages = mockMessages.filter((m) => m.tier === "tier_2");

  const tier1Live = tier1Messages.filter(
    (m) => m.status === "enabled" || m.status === "LIVE"
  );
  const tier2Live = tier2Messages.filter(
    (m) => m.status === "enabled" || m.status === "LIVE"
  );

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Transactional Overview</h1>
        <p className="page-subtitle">
          Monitor all transactional messages across campaigns and triggers
        </p>
      </div>

      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        <div className="card" style={{ textAlign: "center" }}>
          <div className="text-muted mb-8">Total Transactional</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>
            {mockMessages.length}
          </div>
        </div>
        <div className="card" style={{ textAlign: "center" }}>
          <div className="text-muted mb-8">Tier 1 (Critical)</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "var(--color-green-600)" }}>
            {tier1Messages.length}
          </div>
          <div className="text-muted">{tier1Live.length} live</div>
        </div>
        <div className="card" style={{ textAlign: "center" }}>
          <div className="text-muted mb-8">Tier 2 (Non-Critical)</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "var(--color-yellow-600)" }}>
            {tier2Messages.length}
          </div>
          <div className="text-muted">{tier2Live.length} live</div>
        </div>
        <div className="card" style={{ textAlign: "center" }}>
          <div className="text-muted mb-8">DLQ Messages (24h)</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "var(--color-red-600)" }}>
            3
          </div>
          <div className="text-muted">2 email, 1 sms</div>
        </div>
      </div>

      {/* Filters */}
      <div className="filter-bar">
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
        <select className="form-select">
          <option>All Sources</option>
          <option>Campaigns</option>
          <option>Triggers</option>
        </select>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Source</th>
                <th>Tier</th>
                <th>Channel</th>
                <th>
                  Delivery Rate
                  <br />
                  <span style={{ fontWeight: 400, textTransform: "none" }}>
                    vs SLO target
                  </span>
                </th>
                <th>Avg Latency</th>
                <th>Owner</th>
              </tr>
            </thead>
            <tbody>
              {mockMessages.map((m) => (
                <tr key={`${m.type}-${m.id}`}>
                  <td>{m.id}</td>
                  <td style={{ fontWeight: 600 }}>{m.name}</td>
                  <td>
                    <TypeBadge type={m.type} />
                  </td>
                  <td>
                    <TransactionalTierBadge tier={m.tier} />
                  </td>
                  <td>
                    <ChannelBadge channel={m.channel} />
                  </td>
                  <td>
                    <SLOStatus tier={m.tier} deliveryRate={m.deliveryRate} />
                  </td>
                  <td>{m.avgLatency}</td>
                  <td>{m.owner}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
