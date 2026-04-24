export type ClientInputType =
  | "free_text"
  | "single_select"
  | "multi_select"
  | "number"
  | "currency"
  | "client_picker"
  | "poc_picker";

export type ClientCondition = {
  id: string;
  ifQuestionId: string;
  operator: "equals" | "contains";
  value: string;
  thenQuestionId: string;
};

export type ClientQuestion = {
  id: string;
  text: string;
  inputType: ClientInputType;
  active: boolean;
  required: boolean;
  options: string[]; // suggested answers / select options
  suggestedEnabled: boolean;
  conditions: ClientCondition[];
  order: number;
};

export const seedClientQuestions: ClientQuestion[] = [
  {
    id: "cq-client",
    text: "Which client is this job for?",
    inputType: "client_picker",
    active: true,
    required: true,
    options: [],
    suggestedEnabled: false,
    conditions: [],
    order: 0,
  },
  {
    id: "cq-poc",
    text: "Which point of contact will own this engagement?",
    inputType: "poc_picker",
    active: true,
    required: true,
    options: [],
    suggestedEnabled: false,
    conditions: [],
    order: 1,
  },
  {
    id: "cq-bill-rate",
    text: "What is the client bill rate?",
    inputType: "currency",
    active: true,
    required: true,
    options: [],
    suggestedEnabled: false,
    conditions: [],
    order: 2,
  },
  {
    id: "cq-payment-type",
    text: "What is the payment type?",
    inputType: "single_select",
    active: true,
    required: true,
    options: ["Hourly", "Monthly", "Fixed", "Milestone"],
    suggestedEnabled: true,
    conditions: [],
    order: 3,
  },
  {
    id: "cq-payment-terms",
    text: "What are the payment terms?",
    inputType: "single_select",
    active: true,
    required: true,
    options: ["Net 15", "Net 30", "Net 45", "Net 60"],
    suggestedEnabled: true,
    conditions: [],
    order: 4,
  },
  {
    id: "cq-contract-type",
    text: "What is the contract type?",
    inputType: "single_select",
    active: true,
    required: true,
    options: ["C2C", "W2", "1099", "Full-time"],
    suggestedEnabled: true,
    conditions: [],
    order: 5,
  },
  {
    id: "cq-start-date",
    text: "What is the expected start date?",
    inputType: "free_text",
    active: true,
    required: false,
    options: [],
    suggestedEnabled: false,
    conditions: [],
    order: 6,
  },
  {
    id: "cq-notes",
    text: "Any additional notes for the recruiter team?",
    inputType: "free_text",
    active: true,
    required: false,
    options: [],
    suggestedEnabled: false,
    conditions: [],
    order: 7,
  },
];

// Mock AI option generator tailored to client-side questions
export const aiGenerateClientOptions = (questionText: string): string[] => {
  const t = questionText.toLowerCase();
  if (t.includes("payment type")) return ["Hourly", "Monthly", "Fixed", "Milestone"];
  if (t.includes("payment terms") || t.includes("terms"))
    return ["Net 15", "Net 30", "Net 45", "Net 60"];
  if (t.includes("contract")) return ["C2C", "W2", "1099", "Full-time"];
  if (t.includes("priority")) return ["P0 — urgent", "P1 — high", "P2 — normal", "P3 — low"];
  if (t.includes("currency")) return ["USD", "EUR", "GBP", "INR"];
  if (t.includes("engagement") || t.includes("model"))
    return ["Direct hire", "Contract", "Contract-to-hire", "Staff augmentation"];
  return ["Option A", "Option B", "Option C"];
};
