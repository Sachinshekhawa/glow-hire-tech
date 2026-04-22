export type POC = {
  id: string;
  name: string;
  designation?: string;
  email: string;
  phone?: string;
  notes?: string;
};

export type Client = {
  id: string;
  name: string;
  industry?: string;
  website?: string;
  location?: string;
  pocs: POC[];
};

export const industryOptions = [
  "Technology",
  "Finance",
  "Healthcare",
  "Retail",
  "Manufacturing",
  "Education",
  "Other",
];

export const seedClients: Client[] = [
  {
    id: "cl-acme",
    name: "Acme Inc.",
    industry: "Technology",
    website: "https://acme.com",
    location: "San Francisco, CA",
    pocs: [
      {
        id: "poc-acme-1",
        name: "Sarah Johnson",
        designation: "Talent Acquisition Lead",
        email: "sarah.johnson@acme.com",
        phone: "+1 415 555 0142",
        notes: "Prefers Slack. PT timezone.",
      },
      {
        id: "poc-acme-2",
        name: "David Chen",
        designation: "Engineering Director",
        email: "david.chen@acme.com",
        phone: "+1 415 555 0188",
      },
    ],
  },
  {
    id: "cl-northwind",
    name: "Northwind Health",
    industry: "Healthcare",
    website: "https://northwindhealth.com",
    location: "Boston, MA",
    pocs: [
      {
        id: "poc-northwind-1",
        name: "Priya Raman",
        designation: "Head of People",
        email: "priya.raman@northwindhealth.com",
        phone: "+1 617 555 0119",
      },
    ],
  },
  {
    id: "cl-fintrust",
    name: "FinTrust Capital",
    industry: "Finance",
    website: "https://fintrust.io",
    location: "New York, NY",
    pocs: [
      {
        id: "poc-fintrust-1",
        name: "Marcus Hale",
        designation: "VP, Talent",
        email: "marcus.hale@fintrust.io",
        phone: "+1 212 555 0166",
        notes: "EST timezone. Email only.",
      },
      {
        id: "poc-fintrust-2",
        name: "Anita Desai",
        designation: "Recruiting Manager",
        email: "anita.desai@fintrust.io",
      },
    ],
  },
  {
    id: "cl-brightpath",
    name: "BrightPath Education",
    industry: "Education",
    website: "https://brightpath.edu",
    location: "Austin, TX",
    pocs: [
      {
        id: "poc-brightpath-1",
        name: "Elena Vasquez",
        designation: "HR Business Partner",
        email: "elena.vasquez@brightpath.edu",
        phone: "+1 512 555 0173",
      },
    ],
  },
];
