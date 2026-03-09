export type TransactionalTier = "tier_1" | "tier_2";
export type MessagePurpose = "marketing" | "non_marketing";
export type MessageChannel = "email" | "notification" | "sms";

export const TRANSACTIONAL_TIER_LABELS: Record<TransactionalTier, string> = {
  tier_1: "Tier 1 - Critical",
  tier_2: "Tier 2 - Non-Critical",
};

export const TRANSACTIONAL_SLO = {
  tier_1: {
    latencyP99: "< 30 seconds",
    deliverySLO: "99.9%",
    kafkaTopic: "Transactional_Priority (high partition)",
    retryPolicy: "3x, exp. backoff, 1-min cap",
    retryTTL: "15 minutes",
    examples: "OTPs, booking confirmations, payment receipts",
  },
  tier_2: {
    latencyP99: "< 5 minutes",
    deliverySLO: "99.5%",
    kafkaTopic: "Transactional_Priority (standard)",
    retryPolicy: "3x, exp. backoff, 5-min cap",
    retryTTL: "60 minutes",
    examples: "Check-in reminders, review requests",
  },
} as const;

export const CHANNEL_LABELS: Record<MessageChannel, string> = {
  email: "Email",
  notification: "Push Notification",
  sms: "SMS",
};

/**
 * Classification questionnaire — structured as a decision tree.
 *
 * Phase 1 (Marketing vs Non-Marketing): Q1–Q4
 *   - Any promotional intent (Q1/Q2 = yes) leans Marketing
 *   - Purely informational about an existing booking (Q3 = yes) leans Non-Marketing
 *   - Critical to trip (Q4 = yes) confirms Non-Marketing
 *
 * Phase 2 (Non-Marketing → Transactional gate): Q5–Q8
 *   Only shown when Phase 1 yields Non-Marketing.
 *   Q5 + Q6 + Q7 must all be "yes" AND Q8 must be "no" for transactional:
 *   - Triggered by customer/system/regulatory event (Q5) — broadened to capture
 *     system-initiated critical messages (cancellations, security alerts, legal)
 *   - Customer would expect it regardless of marketing prefs (Q6)
 *   - Primary purpose is operational/informational, not promotional (Q7)
 *   - Contains NO promotional/cross-sell/upsell content (Q8) — if "yes", forced
 *     back to Marketing regardless of other answers (hybrid message guardrail)
 *
 * Phase 3 (Tier determination): REMOVED
 *   Tier determination has been deferred. Once Phase 2 confirms transactional,
 *   the message is classified as transactional without a tier distinction.
 *   Tier 1 and Tier 2 follow the same workflow for now.
 */

// Phase 1: Marketing vs Non-Marketing
export const PHASE1_QUESTIONS = {
  q1: "Is the purpose of this message to make a sale or promote products/services?",
  q2: "Does this message include ads, offers, or invitations to buy or join something?",
  q3: "Does this message only provide information about an existing booking or benefits the customer already has?",
  q4: "Is this message critical to the trip, such that its non-delivery would disrupt the journey or prevent Booking.com from providing the agreed service?",
};

// Phase 2: Transactional gate (shown only when Phase 1 → non_marketing)
export const PHASE2_QUESTIONS = {
  q5: "Is this message triggered by a specific customer action OR by a system/regulatory event that the customer must be informed about (e.g., booking, payment, account change, property cancellation, security alert, legal notification)?",
  q6: "Would a reasonable customer expect to receive this message regardless of their marketing preferences?",
  q7: "Is the primary purpose of this message to provide operational or informational content (not to cross-sell, upsell, or re-engage)?",
  q8: "Does this message contain ANY promotional, cross-sell, or upsell content alongside its primary informational purpose?",
};

// Combined for backward compat
export const QUESTION_KEYS = {
  ...PHASE1_QUESTIONS,
  ...PHASE2_QUESTIONS,
};

/**
 * Input Topic Classification for event-driven transactional determination.
 *
 * State-change topics CAN produce transactional messages (but not always —
 * the same event can produce both a confirmation and a marketing upsell).
 * Behavioral topics can NEVER produce transactional messages.
 */

export type TopicCategory = "state_change" | "behavioral";

export interface InputTopicConfig {
  label: string;
  category: TopicCategory;
  description: string;
  /** Example transactional messages this topic can produce */
  transactionalExamples?: string[];
}

export const INPUT_TOPICS: Record<string, InputTopicConfig> = {
  // State-change topics — CAN produce transactional messages
  booking_events: {
    label: "Booking Events",
    category: "state_change",
    description: "Booking created, modified, cancelled",
    transactionalExamples: [
      "Booking confirmation",
      "Modification confirmation",
      "Cancellation confirmation",
    ],
  },
  payment_events: {
    label: "Payment Events",
    category: "state_change",
    description: "Payment succeeded, failed, refunded",
    transactionalExamples: [
      "Payment receipt",
      "Payment failure notification",
      "Refund confirmation",
    ],
  },
  identity_events: {
    label: "Identity & Security Events",
    category: "state_change",
    description: "OTP requested, password reset, account locked, suspicious login",
    transactionalExamples: [
      "OTP / verification code",
      "Password reset link",
      "Security alert",
      "Account lock notification",
    ],
  },
  invoice_events: {
    label: "Invoice & Legal Events",
    category: "state_change",
    description: "Invoice generated, GDPR breach detected, tax receipt issued",
    transactionalExamples: [
      "Invoice / tax receipt",
      "GDPR breach notification",
    ],
  },
  account_events: {
    label: "Account Events",
    category: "state_change",
    description: "Account created, email/phone change requested, account verified",
    transactionalExamples: [
      "Account creation verification",
      "Email/phone change verification",
    ],
  },

  // Behavioral topics — NEVER transactional
  browsing_events: {
    label: "Browsing Events",
    category: "behavioral",
    description: "Page views, search results, property views",
  },
  trip_reminder_events: {
    label: "Trip Reminder Events",
    category: "behavioral",
    description: "Check-in reminders, trip countdown, pre-arrival tips",
  },
  engagement_events: {
    label: "Engagement Events",
    category: "behavioral",
    description: "Cart abandonment, wishlist updates, price alerts",
  },
  loyalty_events: {
    label: "Loyalty & Rewards Events",
    category: "behavioral",
    description: "Status changes, points earned, reward expiry",
  },
  review_events: {
    label: "Review Events",
    category: "behavioral",
    description: "Post-stay review requests, review reminders",
  },
};

/**
 * Edge cases covered by the updated questionnaire:
 *
 * | Scenario                          | Q5  | Q6  | Q7  | Q8  | Result          |
 * |-----------------------------------|-----|-----|-----|-----|-----------------|
 * | OTP SMS                           | yes | yes | yes | no  | Transactional   |
 * | Booking confirmation              | yes | yes | yes | no  | Transactional   |
 * | Payment receipt                   | yes | yes | yes | no  | Transactional   |
 * | GDPR breach notification          | yes | yes | yes | no  | Transactional   |
 * | Property cancellation alert       | yes | yes | yes | no  | Transactional   |
 * | Check-in reminder                 | yes | yes | yes | no  | Transactional   |
 * | Review request                    | yes | yes | yes | no  | Transactional   |
 * | Confirmation + "you might like"   | yes | yes | no  | yes | → Marketing     |
 * | Security alert (suspicious login) | yes | yes | yes | no  | Transactional   |
 * | Payment failure notification      | yes | yes | yes | no  | Transactional   |
 */
