import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ArrowLeft,
  Building2,
  GripVertical,
  ListChecks,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Trash2,
  UserRound,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  ClientField,
  ClientFieldType,
  fieldTypeLabel,
  groupLabel,
} from "@/data/clientFields";
import {
  loadClientFields,
  saveClientFields,
} from "@/data/clientFieldsStore";

const uid = () => Math.random().toString(36).slice(2, 10);

type EditorState = {
  open: boolean;
  mode: "create" | "edit";
  draft: ClientField;
};

const emptyDraft = (order: number, group: ClientField["group"]): ClientField => ({
  id: `cf-${uid()}`,
  label: "",
  placeholder: "",
  type: "text",
  group,
  active: true,
  required: false,
  options: [],
  order,
});

type FilterStatus = "all" | "active" | "inactive";

const ClientFieldsAdmin = () => {
  const [fields, setFields] = useState<ClientField[]>(() => loadClientFields());

  useEffect(() => {
    saveClientFields(fields);
  }, [fields]);

  const [filter, setFilter] = useState<FilterStatus>("all");
  const [search, setSearch] = useState("");
  const [editor, setEditor] = useState<EditorState>({
    open: false,
    mode: "create",
    draft: emptyDraft(0, "client"),
  });
  const [confirmDelete, setConfirmDelete] = useState<{
    open: boolean;
    id: string | null;
  }>({ open: false, id: null });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const filtered = useMemo(() => {
    return fields
      .filter((f) =>
        filter === "all" ? true : filter === "active" ? f.active : !f.active,
      )
      .filter((f) =>
        search.trim()
          ? f.label.toLowerCase().includes(search.toLowerCase())
          : true,
      );
  }, [fields, filter, search]);

  const clientFields = filtered.filter((f) => f.group === "client");
  const pocFields = filtered.filter((f) => f.group === "poc");

  const openCreate = (group: ClientField["group"]) => {
    setEditor({
      open: true,
      mode: "create",
      draft: emptyDraft(fields.length, group),
    });
  };

  const openEdit = (f: ClientField) => {
    setEditor({
      open: true,
      mode: "edit",
      draft: JSON.parse(JSON.stringify(f)),
    });
  };

  const closeEditor = () => setEditor((s) => ({ ...s, open: false }));

  const updateDraft = (patch: Partial<ClientField>) =>
    setEditor((s) => ({ ...s, draft: { ...s.draft, ...patch } }));

  const saveDraft = () => {
    const draft = editor.draft;
    if (!draft.label.trim()) {
      toast({ title: "Field label is required", variant: "destructive" });
      return;
    }
    const dup = fields.some(
      (f) =>
        f.id !== draft.id &&
        f.label.trim().toLowerCase() === draft.label.trim().toLowerCase(),
    );
    if (dup) {
      toast({
        title: "A field with this label already exists",
        variant: "destructive",
      });
      return;
    }
    if (draft.type === "single_select" && draft.options.length === 0) {
      toast({
        title: "Add at least one option for single select",
        variant: "destructive",
      });
      return;
    }
    const cleaned: ClientField = {
      ...draft,
      label: draft.label.trim(),
      placeholder: draft.placeholder?.trim() || "",
      options: Array.from(
        new Set(draft.options.map((o) => o.trim()).filter(Boolean)),
      ),
    };
    setFields((prev) => {
      if (editor.mode === "create") {
        return [...prev, { ...cleaned, order: prev.length }];
      }
      return prev.map((f) => (f.id === cleaned.id ? cleaned : f));
    });
    toast({
      title: editor.mode === "create" ? "Field added" : "Field updated",
    });
    closeEditor();
  };

  const requestDelete = (id: string) =>
    setConfirmDelete({ open: true, id });

  const performDelete = () => {
    if (!confirmDelete.id) return;
    setFields((prev) =>
      prev
        .filter((f) => f.id !== confirmDelete.id)
        .map((f, i) => ({ ...f, order: i })),
    );
    toast({ title: "Field deleted" });
    setConfirmDelete({ open: false, id: null });
  };

  const toggleActive = (id: string) => {
    setFields((prev) =>
      prev.map((f) => (f.id === id ? { ...f, active: !f.active } : f)),
    );
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setFields((prev) => {
      const oldIndex = prev.findIndex((f) => f.id === active.id);
      const newIndex = prev.findIndex((f) => f.id === over.id);
      const moved = arrayMove(prev, oldIndex, newIndex);
      return moved.map((f, i) => ({ ...f, order: i }));
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top bar */}
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
        {/* Section switcher */}
        <SectionSwitcher current="client" />

        {/* Heading */}
        <div className="mt-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              <Building2 className="h-3.5 w-3.5" />
              Post-JD capture
            </div>
            <h1 className="mt-2 font-display text-3xl md:text-4xl font-bold tracking-tight">
              Manage <span className="gradient-text">client &amp; POC fields</span>
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              These fields are collected after the job description is generated.
              They are stored with the job record but never appear inside the
              public JD.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Total fields" value={fields.length} />
          <StatCard
            label="Active"
            value={fields.filter((f) => f.active).length}
            accent
          />
          <StatCard
            label="Client fields"
            value={fields.filter((f) => f.group === "client").length}
          />
          <StatCard
            label="POC fields"
            value={fields.filter((f) => f.group === "poc").length}
          />
        </div>

        {/* Toolbar */}
        <div className="mt-8 glass-card rounded-2xl p-3 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search fields..."
              className="pl-9 bg-secondary/60 border-0 focus-visible:ring-1"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground hidden sm:inline">
              Filter:
            </span>
            {(["all", "active", "inactive"] as FilterStatus[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                  filter === f
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Two groups */}
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <GroupSection
            title="Client details"
            description="Information about the company hiring for this role."
            icon={<Building2 className="h-4 w-4" />}
            fields={clientFields}
            sensors={sensors}
            onDragEnd={handleDragEnd}
            onEdit={openEdit}
            onDelete={requestDelete}
            onToggleActive={toggleActive}
            onAdd={() => openCreate("client")}
          />
          <GroupSection
            title="Point of Contact"
            description="Who the recruiter or talent team should reach out to."
            icon={<UserRound className="h-4 w-4" />}
            fields={pocFields}
            sensors={sensors}
            onDragEnd={handleDragEnd}
            onEdit={openEdit}
            onDelete={requestDelete}
            onToggleActive={toggleActive}
            onAdd={() => openCreate("poc")}
          />
        </div>

        <p className="mt-10 text-center text-xs text-muted-foreground">
          Field changes apply to new jobs only. Saved client/POC details on
          existing jobs are preserved.
        </p>
      </main>

      {/* Editor */}
      <FieldEditor
        state={editor}
        onClose={closeEditor}
        onSave={saveDraft}
        onChange={updateDraft}
      />

      {/* Delete confirm */}
      <AlertDialog
        open={confirmDelete.open}
        onOpenChange={(o) => setConfirmDelete((s) => ({ ...s, open: o }))}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete field?</AlertDialogTitle>
            <AlertDialogDescription>
              This field will no longer appear in the post-JD capture form.
              Existing jobs keep any data already collected.
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

/* ---------- Shared switcher (also used by SystemBehavior) ---------- */
export const SectionSwitcher = ({
  current,
}: {
  current: "questions" | "client";
}) => (
  <div className="inline-flex items-center gap-1 rounded-xl border border-border bg-secondary/40 p-1">
    <Link
      to="/admin/system-behavior"
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
        current === "questions"
          ? "bg-background text-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground"
      }`}
    >
      <ListChecks className="h-3.5 w-3.5" />
      Chat questions
    </Link>
    <Link
      to="/admin/client-fields"
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
        current === "client"
          ? "bg-background text-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground"
      }`}
    >
      <Building2 className="h-3.5 w-3.5" />
      Client &amp; POC fields
    </Link>
  </div>
);

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

const GroupSection = ({
  title,
  description,
  icon,
  fields,
  sensors,
  onDragEnd,
  onEdit,
  onDelete,
  onToggleActive,
  onAdd,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  fields: ClientField[];
  sensors: ReturnType<typeof useSensors>;
  onDragEnd: (e: DragEndEvent) => void;
  onEdit: (f: ClientField) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string) => void;
  onAdd: () => void;
}) => (
  <section className="glass-card rounded-2xl p-4">
    <header className="flex items-center justify-between gap-3 px-1 pb-3">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </span>
        <div>
          <h2 className="font-display text-base font-semibold">{title}</h2>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <Button variant="hero" size="sm" onClick={onAdd}>
        <Plus className="h-4 w-4" /> Add field
      </Button>
    </header>

    {fields.length === 0 ? (
      <div className="rounded-xl border border-dashed border-border py-10 text-center">
        <p className="text-sm text-muted-foreground">No fields yet.</p>
      </div>
    ) : (
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
      >
        <SortableContext
          items={fields.map((f) => f.id)}
          strategy={verticalListSortingStrategy}
        >
          <ul className="space-y-2">
            {fields.map((f, i) => (
              <SortableFieldRow
                key={f.id}
                field={f}
                index={i}
                onEdit={() => onEdit(f)}
                onDelete={() => onDelete(f.id)}
                onToggleActive={() => onToggleActive(f.id)}
              />
            ))}
          </ul>
        </SortableContext>
      </DndContext>
    )}
  </section>
);

const SortableFieldRow = ({
  field,
  index,
  onEdit,
  onDelete,
  onToggleActive,
}: {
  field: ClientField;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
  onToggleActive: () => void;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 20 : "auto",
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`group flex items-center gap-2 rounded-xl border border-border bg-background/60 px-3 py-2 transition-colors ${
        isDragging ? "shadow-elegant" : ""
      }`}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground touch-none"
        aria-label="Drag to reorder"
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <span className="inline-flex items-center justify-center min-w-7 h-6 px-1.5 rounded-md bg-secondary text-xs font-mono text-muted-foreground">
        {String(index + 1).padStart(2, "0")}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-medium truncate">{field.label}</p>
          <Badge variant="secondary" className="text-[10px]">
            {fieldTypeLabel[field.type]}
          </Badge>
          {field.required && (
            <Badge variant="outline" className="text-[10px]">
              Required
            </Badge>
          )}
        </div>
        {field.placeholder && (
          <p className="text-xs text-muted-foreground truncate">
            {field.placeholder}
          </p>
        )}
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={onToggleActive}
          className={`hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
            field.active
              ? "bg-primary/10 text-primary hover:bg-primary/15"
              : "bg-muted text-muted-foreground hover:bg-secondary"
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              field.active ? "bg-primary" : "bg-muted-foreground"
            }`}
          />
          {field.active ? "Active" : "Inactive"}
        </button>
        <Button variant="ghost" size="icon" onClick={onEdit} aria-label="Edit">
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onDelete}
          aria-label="Delete"
          className="text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </li>
  );
};

const FieldEditor = ({
  state,
  onClose,
  onSave,
  onChange,
}: {
  state: EditorState;
  onClose: () => void;
  onSave: () => void;
  onChange: (patch: Partial<ClientField>) => void;
}) => {
  const { draft } = state;
  const [newOption, setNewOption] = useState("");

  const addOption = (val: string) => {
    const v = val.trim();
    if (!v) return;
    if (draft.options.some((o) => o.toLowerCase() === v.toLowerCase())) {
      toast({ title: "Duplicate option", variant: "destructive" });
      return;
    }
    onChange({ options: [...draft.options, v] });
    setNewOption("");
  };

  const removeOption = (idx: number) =>
    onChange({ options: draft.options.filter((_, i) => i !== idx) });

  return (
    <Dialog open={state.open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {state.mode === "create" ? "Add field" : "Edit field"}
          </DialogTitle>
          <DialogDescription>
            Configure how this {groupLabel[draft.group].toLowerCase()} field is
            collected after the JD is generated.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          <div className="space-y-2">
            <Label>Label</Label>
            <Input
              value={draft.label}
              onChange={(e) => onChange({ label: e.target.value })}
              placeholder="e.g. POC email"
            />
          </div>

          <div className="space-y-2">
            <Label>Placeholder</Label>
            <Input
              value={draft.placeholder ?? ""}
              onChange={(e) => onChange({ placeholder: e.target.value })}
              placeholder="Hint text shown inside the input"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Group</Label>
              <Select
                value={draft.group}
                onValueChange={(v) =>
                  onChange({ group: v as ClientField["group"] })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="client">Client</SelectItem>
                  <SelectItem value="poc">POC</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={draft.type}
                onValueChange={(v) =>
                  onChange({ type: v as ClientFieldType })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="phone">Phone</SelectItem>
                  <SelectItem value="url">URL</SelectItem>
                  <SelectItem value="textarea">Long text</SelectItem>
                  <SelectItem value="single_select">Single select</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <ToggleRow
              label="Required"
              description="Recruiter must fill before saving."
              checked={draft.required}
              onChange={(v) => onChange({ required: v })}
            />
            <ToggleRow
              label="Active"
              description="Show in capture form."
              checked={draft.active}
              onChange={(v) => onChange({ active: v })}
            />
          </div>

          {draft.type === "single_select" && (
            <div className="space-y-2">
              <Label>Options</Label>
              <div className="space-y-2">
                {draft.options.map((opt, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 rounded-lg bg-secondary/40 px-2 py-1"
                  >
                    <span className="text-xs font-mono text-muted-foreground w-6 text-center">
                      {idx + 1}
                    </span>
                    <span className="flex-1 text-sm">{opt}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={() => removeOption(idx)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newOption}
                  onChange={(e) => setNewOption(e.target.value)}
                  placeholder="Add option and press Enter"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addOption(newOption);
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addOption(newOption)}
                >
                  Add
                </Button>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="mt-6">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="hero" onClick={onSave}>
            Save field
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const ToggleRow = ({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) => (
  <div className="flex items-start justify-between gap-4 rounded-lg border border-border bg-background/60 px-3 py-2">
    <div className="min-w-0">
      <div className="text-sm font-medium">{label}</div>
      {description && (
        <div className="text-xs text-muted-foreground">{description}</div>
      )}
    </div>
    <Switch checked={checked} onCheckedChange={onChange} />
  </div>
);

export default ClientFieldsAdmin;
