import {
  TransactionalTier,
  TRANSACTIONAL_SLO,
  TRANSACTIONAL_TIER_LABELS,
} from "../constants";

export default function TransactionalSLOInfoCard({
  tier,
}: {
  tier: TransactionalTier;
}) {
  const slo = TRANSACTIONAL_SLO[tier];

  return (
    <div className="alert alert-success">
      <div className="alert-title">
        SLO Commitments for {TRANSACTIONAL_TIER_LABELS[tier]}
      </div>
      <div>
        Messages classified as {TRANSACTIONAL_TIER_LABELS[tier].toLowerCase()}{" "}
        will be routed to the <strong>{slo.kafkaTopic}</strong> topic with
        guaranteed delivery targets.
      </div>
      <div className="slo-grid">
        <div className="slo-item">
          <div className="slo-item-label">Delivery SLO</div>
          <div className="slo-item-value">{slo.deliverySLO}</div>
        </div>
        <div className="slo-item">
          <div className="slo-item-label">Latency (p99)</div>
          <div className="slo-item-value">{slo.latencyP99}</div>
        </div>
        <div className="slo-item">
          <div className="slo-item-label">Retry Policy</div>
          <div className="slo-item-value">{slo.retryPolicy}</div>
        </div>
        <div className="slo-item">
          <div className="slo-item-label">Retry TTL</div>
          <div className="slo-item-value">{slo.retryTTL}</div>
        </div>
      </div>
    </div>
  );
}
