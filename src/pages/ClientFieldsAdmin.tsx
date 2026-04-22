import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  ChevronDown,
  ChevronRight,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Plus,
  Search,
  Sparkles,
  Trash2,
  UserRound,
  Globe,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ThemeToggle from "@/components/ThemeToggle";
import { toast } from "@/components/ui/use-toast";

import { Client, POC, industryOptions } from "@/data/clients";
import { loadClients, saveClients } from "@/data/clientsStore";
import { SectionSwitcher } from "./ClientFieldsAdmin.shared";

const uid = () => Math.random().toString(36).slice(2, 10);

type ClientDraft = Client;
type POCDraft = POC & { clientId: string };

const emptyClient = (): ClientDraft => ({
  id: `cl-${uid()}`,
  name: "",
  industry: "",
  website: "",
  location: "",
  pocs: [],
});

const emptyPoc = (clientId: string): POCDraft => ({
  clientId,
  id: `poc-${uid()}`,
  name: "",
  designation: "",
  email: "",
  phone: "",
  notes: "",
});

const ClientFieldsAdmin = () => {
  const [clients, setClients] = useState<Client[]>(() => loadClients());

  useEffect(() => {
    saveClients(clients);
  }, [clients]);

  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const [clientEditor, setClientEditor] = useState<{
    open: boolean;
    mode: "create" | "edit";
    draft: ClientDraft;
  }>({ open: false, mode: "create", draft: emptyClient() });

  const [pocEditor, setPocEditor] = useState<{
    open: boolean;
    mode: "create" | "edit";
    draft: POCDraft;
  }>({ open: false, mode: "create", draft: emptyPoc("") });

  const [confirmDelete, setConfirmDelete] = useState<{
    open: boolean;
    kind: "client" | "poc" | null;
    clientId: string | null;
    pocId: string | null;
  }>({ open: false, kind: null, clientId: null, pocId: null });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return clients;
    return clients.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.industry?.toLowerCase().includes(q) ||
        c.pocs.some(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.email.toLowerCase().includes(q),
        ),
    );
  }, [clients, search]);

  const totalPocs = clients.reduce((acc, c) => acc + c.pocs.length, 0);

  const toggleExpand = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  /* -------- Client CRUD -------- */
  const openCreateClient = () =>
    setClientEditor({ open: true, mode: "create", draft: emptyClient() });

  const openEditClient = (c: Client) =>
    setClientEditor({
      open: true,
      mode: "edit",
      draft: JSON.parse(JSON.stringify(c)),
    });

  const saveClient = () => {
    const d = clientEditor.draft;
    if (!d.name.trim()) {
      toast({ title: "Client name is required", variant: "destructive" });
      return;
    }
    const dup = clients.some(
      (c) =>
        c.id !== d.id &&
        c.name.trim().toLowerCase() === d.name.trim().toLowerCase(),
    );
    if (dup) {
      toast({ title: "A client with this name already exists", variant: "destructive" });
      return;
    }
    setClients((prev) => {
      if (clientEditor.mode === "create") return [...prev, { ...d, name: d.name.trim() }];
      return prev.map((c) => (c.id === d.id ? { ...d, name: d.name.trim() } : c));
    });
    toast({ title: clientEditor.mode === "create" ? "Client added" : "Client updated" });
    setClientEditor((s) => ({ ...s, open: false }));
  };

  const deleteClient = (id: string) =>
    setConfirmDelete({ open: true, kind: "client", clientId: id, pocId: null });

  /* -------- POC CRUD -------- */
  const openCreatePoc = (clientId: string) =>
    setPocEditor({ open: true, mode: "create", draft: emptyPoc(clientId) });

  const openEditPoc = (clientId: string, p: POC) =>
    setPocEditor({
      open: true,
      mode: "edit",
      draft: { ...JSON.parse(JSON.stringify(p)), clientId },
    });

  const savePoc = () => {
    const d = pocEditor.draft;
    if (!d.name.trim()) {
      toast({ title: "POC name is required", variant: "destructive" });
      return;
    }
    if (!d.email.trim()) {
      toast({ title: "POC email is required", variant: "destructive" });
      return;
    }
    setClients((prev) =>
      prev.map((c) => {
        if (c.id !== d.clientId) return c;
        if (pocEditor.mode === "create") {
          return {
            ...c,
            pocs: [
              ...c.pocs,
              {
                id: d.id,
                name: d.name.trim(),
                designation: d.designation?.trim() || "",
                email: d.email.trim(),
                phone: d.phone?.trim() || "",
                notes: d.notes?.trim() || "",
              },
            ],
          };
        }
        return {
          ...c,
          pocs: c.pocs.map((p) =>
            p.id === d.id
              ? {
                  id: d.id,
                  name: d.name.trim(),
                  designation: d.designation?.trim() || "",
                  email: d.email.trim(),
                  phone: d.phone?.trim() || "",
                  notes: d.notes?.trim() || "",
                }
              : p,
          ),
        };
      }),
    );
    setExpanded((prev) => new Set(prev).add(d.clientId));
    toast({ title: pocEditor.mode === "create" ? "POC added" : "POC updated" });
    setPocEditor((s) => ({ ...s, open: false }));
  };

  const deletePoc = (clientId: string, pocId: string) =>
    setConfirmDelete({ open: true, kind: "poc", clientId, pocId });

  const performDelete = () => {
    if (confirmDelete.kind === "client" && confirmDelete.clientId) {
      setClients((prev) => prev.filter((c) => c.id !== confirmDelete.clientId));
      toast({ title: "Client deleted" });
    } else if (
      confirmDelete.kind === "poc" &&
      confirmDelete.clientId &&
      confirmDelete.pocId
    ) {
      setClients((prev) =>
        prev.map((c) =>
          c.id === confirmDelete.clientId
            ? { ...c, pocs: c.pocs.filter((p) => p.id !== confirmDelete.pocId) }
            : c,
        ),
      );
      toast({ title: "POC deleted" });
    }
    setConfirmDelete({ open: false, kind: null, clientId: null, pocId: null });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border hover:bg-secondary transition-colors"
              aria-label="Back to home"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary shadow-glow">
                <Sparkles className="h-4 w-4 text-primary-foreground" />
              </span>
              <div>
                <div className="text-xs text-muted-foreground leading-tight">
                  Glohire Admin
                </div>
                <div className="font-display text-sm font-semibold leading-tight">
                  System Behavior
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="hidden sm:inline-flex gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              BU Admin
            </Badge>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container py-8 md:py-12">
        <SectionSwitcher current="client" />

        <div className="mt-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              <Building2 className="h-3.5 w-3.5" />
              Directory
            </div>
            <h1 className="mt-2 font-display text-3xl md:text-4xl font-bold tracking-tight">
              Manage <span className="gradient-text">clients &amp; POCs</span>
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Maintain your master directory of client companies and their
              points of contact. Recruiters select from this list when creating
              a job — no duplicate entry needed.
            </p>
          </div>
          <Button variant="hero" onClick={openCreateClient}>
            <Plus className="h-4 w-4" /> Add client
          </Button>
        </div>

        <div className="mt-8 grid grid-cols-2 md:grid-cols-3 gap-3">
          <StatCard label="Total clients" value={clients.length} accent />
          <StatCard label="Total POCs" value={totalPocs} />
          <StatCard
            label="Avg POCs / client"
            value={
              clients.length === 0
                ? 0
                : Math.round((totalPocs / clients.length) * 10) / 10
            }
          />
        </div>

        <div className="mt-8 glass-card rounded-2xl p-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search clients, POCs, or emails..."
              className="pl-9 bg-secondary/60 border-0 focus-visible:ring-1"
            />
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {filtered.length === 0 ? (
            <div className="glass-card rounded-2xl p-10 text-center">
              <Building2 className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-3 text-sm text-muted-foreground">
                {clients.length === 0
                  ? "No clients yet — add your first one to get started."
                  : "No results match your search."}
              </p>
            </div>
          ) : (
            filtered.map((c) => (
              <ClientCard
                key={c.id}
                client={c}
                expanded={expanded.has(c.id)}
                onToggle={() => toggleExpand(c.id)}
                onEdit={() => openEditClient(c)}
                onDelete={() => deleteClient(c.id)}
                onAddPoc={() => openCreatePoc(c.id)}
                onEditPoc={(p) => openEditPoc(c.id, p)}
                onDeletePoc={(p) => deletePoc(c.id, p.id)}
              />
            ))
          )}
        </div>
      </main>

      {/* Client editor */}
      <Dialog
        open={clientEditor.open}
        onOpenChange={(o) => setClientEditor((s) => ({ ...s, open: o }))}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {clientEditor.mode === "create" ? "Add client" : "Edit client"}
            </DialogTitle>
            <DialogDescription>
              Company-level details. POCs are managed separately under each
              client.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="cl-name">
                Client / Company name
                <span className="text-destructive ml-0.5">*</span>
              </Label>
              <Input
                id="cl-name"
                value={clientEditor.draft.name}
                onChange={(e) =>
                  setClientEditor((s) => ({
                    ...s,
                    draft: { ...s.draft, name: e.target.value },
                  }))
                }
                placeholder="e.g. Acme Inc."
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Industry</Label>
                <Select
                  value={clientEditor.draft.industry || ""}
                  onValueChange={(v) =>
                    setClientEditor((s) => ({
                      ...s,
                      draft: { ...s.draft, industry: v },
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    {industryOptions.map((o) => (
                      <SelectItem key={o} value={o}>
                        {o}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cl-loc">Location</Label>
                <Input
                  id="cl-loc"
                  value={clientEditor.draft.location || ""}
                  onChange={(e) =>
                    setClientEditor((s) => ({
                      ...s,
                      draft: { ...s.draft, location: e.target.value },
                    }))
                  }
                  placeholder="e.g. New York, NY"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cl-web">Website</Label>
              <Input
                id="cl-web"
                type="url"
                value={clientEditor.draft.website || ""}
                onChange={(e) =>
                  setClientEditor((s) => ({
                    ...s,
                    draft: { ...s.draft, website: e.target.value },
                  }))
                }
                placeholder="https://acme.com"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setClientEditor((s) => ({ ...s, open: false }))}
            >
              Cancel
            </Button>
            <Button variant="hero" onClick={saveClient}>
              {clientEditor.mode === "create" ? "Add client" : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* POC editor */}
      <Dialog
        open={pocEditor.open}
        onOpenChange={(o) => setPocEditor((s) => ({ ...s, open: o }))}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {pocEditor.mode === "create"
                ? "Add point of contact"
                : "Edit point of contact"}
            </DialogTitle>
            <DialogDescription>
              Contact details for this client. Recruiters will choose this
              person when assigning a job.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="poc-name">
                  Full name
                  <span className="text-destructive ml-0.5">*</span>
                </Label>
                <Input
                  id="poc-name"
                  value={pocEditor.draft.name}
                  onChange={(e) =>
                    setPocEditor((s) => ({
                      ...s,
                      draft: { ...s.draft, name: e.target.value },
                    }))
                  }
                  placeholder="e.g. Sarah Johnson"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="poc-desig">Designation</Label>
                <Input
                  id="poc-desig"
                  value={pocEditor.draft.designation || ""}
                  onChange={(e) =>
                    setPocEditor((s) => ({
                      ...s,
                      draft: { ...s.draft, designation: e.target.value },
                    }))
                  }
                  placeholder="e.g. Talent Acquisition Lead"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="poc-email">
                  Email
                  <span className="text-destructive ml-0.5">*</span>
                </Label>
                <Input
                  id="poc-email"
                  type="email"
                  value={pocEditor.draft.email}
                  onChange={(e) =>
                    setPocEditor((s) => ({
                      ...s,
                      draft: { ...s.draft, email: e.target.value },
                    }))
                  }
                  placeholder="name@company.com"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="poc-phone">Phone</Label>
                <Input
                  id="poc-phone"
                  type="tel"
                  value={pocEditor.draft.phone || ""}
                  onChange={(e) =>
                    setPocEditor((s) => ({
                      ...s,
                      draft: { ...s.draft, phone: e.target.value },
                    }))
                  }
                  placeholder="+1 555 123 4567"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="poc-notes">Internal notes</Label>
              <Textarea
                id="poc-notes"
                value={pocEditor.draft.notes || ""}
                onChange={(e) =>
                  setPocEditor((s) => ({
                    ...s,
                    draft: { ...s.draft, notes: e.target.value },
                  }))
                }
                placeholder="Preferred channel, timezone, etc."
                className="min-h-[80px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setPocEditor((s) => ({ ...s, open: false }))}
            >
              Cancel
            </Button>
            <Button variant="hero" onClick={savePoc}>
              {pocEditor.mode === "create" ? "Add POC" : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={confirmDelete.open}
        onOpenChange={(o) =>
          setConfirmDelete((s) => ({ ...s, open: o }))
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmDelete.kind === "client"
                ? "Delete client?"
                : "Delete POC?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDelete.kind === "client"
                ? "This will remove the client and all of its POCs from the directory."
                : "This will remove the POC from this client."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={performDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

/* ---------- Sub-components ---------- */

const StatCard = ({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: number;
  accent?: boolean;
}) => (
  <div className="glass-card rounded-xl p-4">
    <div className="text-xs text-muted-foreground">{label}</div>
    <div
      className={`mt-1 font-display text-2xl font-bold ${
        accent ? "gradient-text" : ""
      }`}
    >
      {value}
    </div>
  </div>
);

const ClientCard = ({
  client,
  expanded,
  onToggle,
  onEdit,
  onDelete,
  onAddPoc,
  onEditPoc,
  onDeletePoc,
}: {
  client: Client;
  expanded: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onAddPoc: () => void;
  onEditPoc: (p: POC) => void;
  onDeletePoc: (p: POC) => void;
}) => (
  <div className="glass-card rounded-2xl overflow-hidden">
    <div className="flex items-center gap-3 p-4">
      <button
        onClick={onToggle}
        className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
        aria-label={expanded ? "Collapse" : "Expand"}
      >
        {expanded ? (
          <ChevronDown className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
      </button>
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Building2 className="h-5 w-5" />
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-display text-base font-semibold truncate">
            {client.name}
          </h3>
          {client.industry && (
            <Badge variant="secondary" className="text-[10px]">
              {client.industry}
            </Badge>
          )}
          <Badge variant="outline" className="text-[10px] gap-1">
            <UserRound className="h-3 w-3" />
            {client.pocs.length} POC{client.pocs.length === 1 ? "" : "s"}
          </Badge>
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          {client.location && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {client.location}
            </span>
          )}
          {client.website && (
            <a
              href={client.website}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 hover:text-primary"
            >
              <Globe className="h-3 w-3" />
              {client.website.replace(/^https?:\/\//, "")}
            </a>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm" onClick={onEdit}>
          <Pencil className="h-3.5 w-3.5" /> Edit
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onDelete}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>

    {expanded && (
      <div className="border-t border-border/60 bg-secondary/30 px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Points of Contact
          </h4>
          <Button variant="outline" size="sm" onClick={onAddPoc}>
            <Plus className="h-3.5 w-3.5" /> Add POC
          </Button>
        </div>
        {client.pocs.length === 0 ? (
          <p className="text-xs text-muted-foreground py-3 text-center">
            No POCs yet for this client.
          </p>
        ) : (
          <div className="grid gap-2 md:grid-cols-2">
            {client.pocs.map((p) => (
              <div
                key={p.id}
                className="rounded-xl border border-border/60 bg-background/60 p-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-primary">
                        <UserRound className="h-3.5 w-3.5" />
                      </span>
                      <p className="text-sm font-medium truncate">{p.name}</p>
                    </div>
                    {p.designation && (
                      <p className="mt-0.5 ml-8 text-xs text-muted-foreground truncate">
                        {p.designation}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-0.5">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() => onEditPoc(p)}
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                      onClick={() => onDeletePoc(p)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div className="mt-2 ml-8 space-y-1 text-xs text-muted-foreground">
                  <div className="inline-flex items-center gap-1.5">
                    <Mail className="h-3 w-3" />
                    <span className="truncate">{p.email}</span>
                  </div>
                  {p.phone && (
                    <div className="inline-flex items-center gap-1.5 ml-3">
                      <Phone className="h-3 w-3" />
                      {p.phone}
                    </div>
                  )}
                </div>
                {p.notes && (
                  <p className="mt-2 ml-8 text-[11px] italic text-muted-foreground line-clamp-2">
                    {p.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    )}
  </div>
);

export default ClientFieldsAdmin;
