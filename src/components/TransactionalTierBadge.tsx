import { TransactionalTier, TRANSACTIONAL_TIER_LABELS } from "../constants";

export default function TransactionalTierBadge({
  tier,
}: {
  tier: TransactionalTier | null | undefined;
}) {
  if (!tier) return null;

  const className = tier === "tier_1" ? "badge badge-tier1" : "badge badge-tier2";

  return <span className={className}>{TRANSACTIONAL_TIER_LABELS[tier]}</span>;
}
