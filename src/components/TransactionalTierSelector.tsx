import { TransactionalTier, TRANSACTIONAL_SLO } from "../constants";

export default function TransactionalTierSelector({
  value,
  onChange,
  disabled,
}: {
  value: TransactionalTier | null;
  onChange: (tier: TransactionalTier) => void;
  disabled?: boolean;
}) {
  return (
    <div className="radio-card-group">
      <div
        className={`radio-card ${value === "tier_1" ? "selected" : ""} ${disabled ? "disabled" : ""}`}
        onClick={() => !disabled && onChange("tier_1")}
      >
        <div className="radio-card-header">
          <div className="radio-card-radio" />
          <div className="radio-card-title">Tier 1 - Critical</div>
        </div>
        <div className="radio-card-description">
          {TRANSACTIONAL_SLO.tier_1.examples}
        </div>
        <div className="radio-card-slo">
          <span className="radio-card-slo-item">
            SLO: {TRANSACTIONAL_SLO.tier_1.deliverySLO}
          </span>
          <span className="radio-card-slo-item">
            Latency: {TRANSACTIONAL_SLO.tier_1.latencyP99}
          </span>
          <span className="radio-card-slo-item">
            Retry: {TRANSACTIONAL_SLO.tier_1.retryPolicy}
          </span>
        </div>
      </div>
      <div
        className={`radio-card ${value === "tier_2" ? "selected" : ""} ${disabled ? "disabled" : ""}`}
        onClick={() => !disabled && onChange("tier_2")}
      >
        <div className="radio-card-header">
          <div className="radio-card-radio" />
          <div className="radio-card-title">Tier 2 - Non-Critical</div>
        </div>
        <div className="radio-card-description">
          {TRANSACTIONAL_SLO.tier_2.examples}
        </div>
        <div className="radio-card-slo">
          <span className="radio-card-slo-item">
            SLO: {TRANSACTIONAL_SLO.tier_2.deliverySLO}
          </span>
          <span className="radio-card-slo-item">
            Latency: {TRANSACTIONAL_SLO.tier_2.latencyP99}
          </span>
          <span className="radio-card-slo-item">
            Retry: {TRANSACTIONAL_SLO.tier_2.retryPolicy}
          </span>
        </div>
      </div>
    </div>
  );
}
