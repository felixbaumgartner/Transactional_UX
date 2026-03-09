import { createContext, useContext } from "react";
import { MessageChannel } from "./constants";

export interface ClassificationRecord {
  id: string;
  messageName: string;
  description: string;
  channel: MessageChannel;
  purpose: "marketing" | "non_marketing";
  subPurpose?: "transactional";
  tier: null;
  questionnaireResponses: Record<string, "yes" | "no">;
  classifiedBy: string;
  classifiedAt: string;
}

// Seed data — pre-classified messages
export const SEED_RECORDS: ClassificationRecord[] = [
  {
    id: "cr-001",
    messageName: "booking_confirmation",
    description: "Sent immediately after a booking is made",
    channel: "email",
    purpose: "non_marketing",
    subPurpose: "transactional",
    tier: null,
    questionnaireResponses: {},
    classifiedBy: "trip-comms",
    classifiedAt: "2026-02-10",
  },
  {
    id: "cr-002",
    messageName: "otp_verification",
    description: "One-time passcode for identity verification",
    channel: "sms",
    purpose: "non_marketing",
    subPurpose: "transactional",
    tier: null,
    questionnaireResponses: {},
    classifiedBy: "identity-team",
    classifiedAt: "2026-02-12",
  },
  {
    id: "cr-003",
    messageName: "payment_receipt",
    description: "Receipt sent after payment is processed",
    channel: "email",
    purpose: "non_marketing",
    subPurpose: "transactional",
    tier: null,
    questionnaireResponses: {},
    classifiedBy: "payments-team",
    classifiedAt: "2026-02-15",
  },
  {
    id: "cr-004",
    messageName: "checkin_reminder",
    description: "Reminder before check-in date",
    channel: "notification",
    purpose: "non_marketing",
    subPurpose: "transactional",
    tier: null,
    questionnaireResponses: {},
    classifiedBy: "trip-enrichment",
    classifiedAt: "2026-02-18",
  },
  {
    id: "cr-005",
    messageName: "review_request",
    description: "Post-stay review invitation",
    channel: "email",
    purpose: "non_marketing",
    subPurpose: "transactional",
    tier: null,
    questionnaireResponses: {},
    classifiedBy: "ugc-team",
    classifiedAt: "2026-02-20",
  },
  {
    id: "cr-006",
    messageName: "summer_deals_promo",
    description: "Seasonal promotional campaign",
    channel: "email",
    purpose: "marketing",
    tier: null,
    questionnaireResponses: {},
    classifiedBy: "convert-team",
    classifiedAt: "2026-03-01",
  },
  {
    id: "cr-007",
    messageName: "cart_abandonment",
    description: "Re-engage users who abandoned search",
    channel: "notification",
    purpose: "marketing",
    tier: null,
    questionnaireResponses: {},
    classifiedBy: "convert-team",
    classifiedAt: "2026-03-02",
  },
];

export interface ClassificationStoreType {
  records: ClassificationRecord[];
  addRecord: (record: ClassificationRecord) => void;
  getRecord: (id: string) => ClassificationRecord | undefined;
}

export const ClassificationStoreContext = createContext<ClassificationStoreType>({
  records: SEED_RECORDS,
  addRecord: () => {},
  getRecord: () => undefined,
});

export function useClassificationStore() {
  return useContext(ClassificationStoreContext);
}
