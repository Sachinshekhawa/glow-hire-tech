export type InputType = "free_text" | "single_select" | "multi_select";

export type Condition = {
  id: string;
  ifQuestionId: string;
  operator: "equals" | "contains";
  value: string;
  thenQuestionId: string;
};

export type ChatQuestion = {
  id: string;
  text: string;
  inputType: InputType;
  active: boolean;
  required: boolean;
  options: string[]; // suggested answers
  suggestedEnabled: boolean;
  conditions: Condition[];
  order: number;
};

export const seedQuestions: ChatQuestion[] = [
  {
    id: "q-1",
    text: "What is the job title you're hiring for?",
    inputType: "free_text",
    active: true,
    required: true,
    options: [],
    suggestedEnabled: false,
    conditions: [],
    order: 0,
  },
  {
    id: "q-2",
    text: "Which department does this role belong to?",
    inputType: "single_select",
    active: true,
    required: true,
    options: ["Engineering", "Product", "Design", "Sales", "Marketing", "Operations", "Finance", "People"],
    suggestedEnabled: true,
    conditions: [],
    order: 1,
  },
  {
    id: "q-3",
    text: "Is this a technical role?",
    inputType: "single_select",
    active: true,
    required: true,
    options: ["Yes", "No"],
    suggestedEnabled: true,
    conditions: [],
    order: 2,
  },
  {
    id: "q-4",
    text: "Select required technical skills",
    inputType: "multi_select",
    active: true,
    required: true,
    options: ["React", "TypeScript", "Node.js", "Python", "AWS", "Kubernetes", "PostgreSQL", "GraphQL"],
    suggestedEnabled: true,
    conditions: [
      {
        id: "c-1",
        ifQuestionId: "q-3",
        operator: "equals",
        value: "Yes",
        thenQuestionId: "q-4",
      },
    ],
    order: 3,
  },
  {
    id: "q-5",
    text: "What is the employment type?",
    inputType: "single_select",
    active: true,
    required: true,
    options: ["Full-time", "Part-time", "Contract", "Internship"],
    suggestedEnabled: true,
    conditions: [],
    order: 4,
  },
  {
    id: "q-6",
    text: "What is the work location preference?",
    inputType: "single_select",
    active: true,
    required: false,
    options: ["Remote", "Hybrid", "On-site"],
    suggestedEnabled: true,
    conditions: [],
    order: 5,
  },
  {
    id: "q-7",
    text: "What is the expected salary range?",
    inputType: "free_text",
    active: false,
    required: false,
    options: [],
    suggestedEnabled: false,
    conditions: [],
    order: 6,
  },
  {
    id: "q-8",
    text: "How many positions are open for this role?",
    inputType: "free_text",
    active: true,
    required: true,
    options: [],
    suggestedEnabled: false,
    conditions: [],
    order: 7,
  },
];

// Mock AI option generator — produces contextual suggestions
export const aiGenerateOptions = (questionText: string): string[] => {
  const t = questionText.toLowerCase();
  if (t.includes("skill")) return ["Communication", "Leadership", "Problem-solving", "Collaboration"];
  if (t.includes("experience") || t.includes("seniority"))
    return ["Junior (0-2 yrs)", "Mid (2-5 yrs)", "Senior (5-8 yrs)", "Lead (8+ yrs)"];
  if (t.includes("location")) return ["Remote", "Hybrid", "On-site"];
  if (t.includes("type") || t.includes("employment"))
    return ["Full-time", "Part-time", "Contract", "Internship"];
  if (t.includes("department")) return ["Engineering", "Product", "Design", "Sales", "Marketing"];
  if (t.includes("benefit")) return ["Health insurance", "Stock options", "Remote work", "Learning budget"];
  return ["Option A", "Option B", "Option C"];
};
