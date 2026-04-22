export type ClientFieldType =
  | "text"
  | "email"
  | "phone"
  | "url"
  | "textarea"
  | "single_select";

export type ClientField = {
  id: string;
  label: string;
  placeholder?: string;
  type: ClientFieldType;
  group: "client" | "poc";
  active: boolean;
  required: boolean;
  options: string[]; // for single_select
  order: number;
};

export const seedClientFields: ClientField[] = [
  {
    id: "cf-client-name",
    label: "Client / Company name",
    placeholder: "e.g. Acme Inc.",
    type: "text",
    group: "client",
    active: true,
    required: true,
    options: [],
    order: 0,
  },
  {
    id: "cf-client-industry",
    label: "Industry",
    placeholder: "Select an industry",
    type: "single_select",
    group: "client",
    active: true,
    required: false,
    options: [
      "Technology",
      "Finance",
      "Healthcare",
      "Retail",
      "Manufacturing",
      "Education",
      "Other",
    ],
    order: 1,
  },
  {
    id: "cf-client-website",
    label: "Company website",
    placeholder: "https://acme.com",
    type: "url",
    group: "client",
    active: true,
    required: false,
    options: [],
    order: 2,
  },
  {
    id: "cf-poc-name",
    label: "POC full name",
    placeholder: "e.g. Sarah Johnson",
    type: "text",
    group: "poc",
    active: true,
    required: true,
    options: [],
    order: 3,
  },
  {
    id: "cf-poc-designation",
    label: "POC designation",
    placeholder: "e.g. Talent Acquisition Lead",
    type: "text",
    group: "poc",
    active: true,
    required: false,
    options: [],
    order: 4,
  },
  {
    id: "cf-poc-email",
    label: "POC email",
    placeholder: "name@company.com",
    type: "email",
    group: "poc",
    active: true,
    required: true,
    options: [],
    order: 5,
  },
  {
    id: "cf-poc-phone",
    label: "POC phone",
    placeholder: "+1 555 123 4567",
    type: "phone",
    group: "poc",
    active: true,
    required: false,
    options: [],
    order: 6,
  },
  {
    id: "cf-poc-notes",
    label: "Internal notes about POC",
    placeholder: "Preferred communication channel, timezone, etc.",
    type: "textarea",
    group: "poc",
    active: false,
    required: false,
    options: [],
    order: 7,
  },
];

export const fieldTypeLabel: Record<ClientFieldType, string> = {
  text: "Text",
  email: "Email",
  phone: "Phone",
  url: "URL",
  textarea: "Long text",
  single_select: "Single select",
};

export const groupLabel: Record<ClientField["group"], string> = {
  client: "Client",
  poc: "POC",
};
