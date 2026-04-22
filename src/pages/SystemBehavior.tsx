import { useMemo, useState } from "react";
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
  Check,
  ChevronDown,
  ChevronRight,
  GitBranch,
  GripVertical,
  ListChecks,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Trash2,
  X,
  Zap,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ThemeToggle from "@/components/ThemeToggle";
import { toast } from "@/components/ui/use-toast";
import {
  ChatQuestion,
  Condition,
  InputType,
  aiGenerateOptions,
  seedQuestions,
} from "@/data/chatQuestions";

const MAX_WORDS = 50;
const MAX_OPTIONS = 50;
const MAX_AI_OPTIONS = 10;

const inputTypeLabel: Record<InputType, string> = {
  free_text: "Free text",
  single_select: "Single select",
  multi_select: "Multi select",
};

const wordCount = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;
const uid = () => Math.random().toString(36).slice(2, 10);

type FilterStatus = "all" | "active" | "inactive";

type EditorState = {
  open: boolean;
  mode: "create" | "edit";
  draft: ChatQuestion;
};

const emptyDraft = (order: number): ChatQuestion => ({
  id: `q-${uid()}`,
  text: "",
  inputType: "free_text",
  active: true,
  required: false,
  options: [],
  suggestedEnabled: false,
  conditions: [],
  order,
});

const SystemBehavior = () => {
  const [questions, setQuestions] = useState<ChatQuestion[]>(
    [...seedQuestions].sort((a, b) => a.order - b.order),
  );
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [editor, setEditor] = useState<EditorState>({
    open: false,
    mode: "create",
    draft: emptyDraft(0),
  });
  const [confirmDelete, setConfirmDelete] = useState<{
    open: boolean;
    ids: string[];
  }>({ open: false, ids: [] });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const visible = useMemo(() => {
    return questions
      .filter((q) =>
        filter === "all" ? true : filter === "active" ? q.active : !q.active,
      )
      .filter((q) =>
        search.trim()
          ? q.text.toLowerCase().includes(search.toLowerCase())
          : true,
      );
  }, [questions, filter, search]);

  const allVisibleSelected =
    visible.length > 0 && visible.every((q) => selected.has(q.id));

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allVisibleSelected) {
        visible.forEach((q) => next.delete(q.id));
      } else {
        visible.forEach((q) => next.add(q.id));
      }
      return next;
    });
  };

  const openCreate = () => {
    setEditor({
      open: true,
      mode: "create",
      draft: emptyDraft(questions.length),
    });
  };

  const openEdit = (q: ChatQuestion) => {
    setEditor({
      open: true,
      mode: "edit",
      draft: JSON.parse(JSON.stringify(q)),
    });
  };

  const closeEditor = () =>
    setEditor((s) => ({ ...s, open: false }));

  const updateDraft = (patch: Partial<ChatQuestion>) =>
    setEditor((s) => ({ ...s, draft: { ...s.draft, ...patch } }));

  const saveDraft = () => {
    const draft = editor.draft;
    if (!draft.text.trim()) {
      toast({ title: "Question text is required", variant: "destructive" });
      return;
    }
    if (wordCount(draft.text) > MAX_WORDS) {
      toast({
        title: `Question exceeds ${MAX_WORDS} words`,
        variant: "destructive",
      });
      return;
    }
    const isDuplicate = questions.some(
      (q) =>
        q.id !== draft.id &&
        q.text.trim().toLowerCase() === draft.text.trim().toLowerCase(),
    );
    if (isDuplicate) {
      toast({
        title: "A question with this text already exists",
        variant: "destructive",
      });
      return;
    }
    if (draft.suggestedEnabled && draft.options.length === 0) {
      toast({
        title: "Add at least one suggested answer",
        variant: "destructive",
      });
      return;
    }

    const cleaned: ChatQuestion = {
      ...draft,
      options: Array.from(
        new Set(draft.options.map((o) => o.trim()).filter(Boolean)),
      ),
    };

    setQuestions((prev) => {
      if (editor.mode === "create") {
        return [...prev, { ...cleaned, order: prev.length }];
      }
      return prev.map((q) => (q.id === cleaned.id ? cleaned : q));
    });
    toast({
      title:
        editor.mode === "create" ? "Question added" : "Question updated",
    });
    closeEditor();
  };

  const requestDelete = (ids: string[]) => {
    if (ids.length === 0) return;
    if (questions.length - ids.length < 1) {
      toast({
        title: "Cannot delete the last question",
        description: "At least one question must remain in the chat flow.",
        variant: "destructive",
      });
      return;
    }
    setConfirmDelete({ open: true, ids });
  };

  const performDelete = () => {
    setQuestions((prev) =>
      prev
        .filter((q) => !confirmDelete.ids.includes(q.id))
        .map((q, i) => ({ ...q, order: i })),
    );
    setSelected((prev) => {
      const next = new Set(prev);
      confirmDelete.ids.forEach((id) => next.delete(id));
      return next;
    });
    toast({
      title: `${confirmDelete.ids.length} question${
        confirmDelete.ids.length > 1 ? "s" : ""
      } deleted`,
    });
    setConfirmDelete({ open: false, ids: [] });
  };

  const toggleActive = (id: string) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, active: !q.active } : q)),
    );
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setQuestions((prev) => {
      const oldIndex = prev.findIndex((q) => q.id === active.id);
      const newIndex = prev.findIndex((q) => q.id === over.id);
      const moved = arrayMove(prev, oldIndex, newIndex);
      return moved.map((q, i) => ({ ...q, order: i }));
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
        {/* Page heading */}
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              <ListChecks className="h-3.5 w-3.5" />
              Chat Job Creation
            </div>
            <h1 className="mt-2 font-display text-3xl md:text-4xl font-bold tracking-tight">
              Manage <span className="gradient-text">chat questions</span>
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Configure the questions Glohire AI asks recruiters during chat-based
              job creation. Add suggested answers, branch the flow with conditional
              logic, and reorder to match your hiring playbook.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {selected.size > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => requestDelete(Array.from(selected))}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
                Delete ({selected.size})
              </Button>
            )}
            <Button variant="hero" size="sm" onClick={openCreate}>
              <Plus className="h-4 w-4" />
              Add Question
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Total questions" value={questions.length} />
          <StatCard
            label="Active"
            value={questions.filter((q) => q.active).length}
            accent
          />
          <StatCard
            label="With suggestions"
            value={questions.filter((q) => q.suggestedEnabled).length}
          />
          <StatCard
            label="Conditional"
            value={questions.filter((q) => q.conditions.length > 0).length}
          />
        </div>

        {/* Toolbar */}
        <div className="mt-8 glass-card rounded-2xl p-3 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search questions..."
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

        {/* Select-all bar */}
        {visible.length > 0 && (
          <div className="mt-4 flex items-center gap-3 px-4 text-xs text-muted-foreground">
            <Checkbox
              checked={allVisibleSelected}
              onCheckedChange={toggleSelectAll}
              aria-label="Select all"
            />
            <span>
              {selected.size > 0
                ? `${selected.size} selected`
                : `${visible.length} question${visible.length > 1 ? "s" : ""}`}
            </span>
            <span className="ml-auto flex items-center gap-1.5">
              <GripVertical className="h-3.5 w-3.5" />
              Drag to reorder
            </span>
          </div>
        )}

        {/* Questions list */}
        <div className="mt-3">
          {visible.length === 0 ? (
            <EmptyState onAdd={openCreate} hasFilter={!!search || filter !== "all"} />
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={visible.map((q) => q.id)}
                strategy={verticalListSortingStrategy}
              >
                <ul className="space-y-3">
                  {visible.map((q, i) => (
                    <SortableRow
                      key={q.id}
                      question={q}
                      index={i}
                      selected={selected.has(q.id)}
                      onSelect={() => toggleSelect(q.id)}
                      onEdit={() => openEdit(q)}
                      onDelete={() => requestDelete([q.id])}
                      onToggleActive={() => toggleActive(q.id)}
                      questions={questions}
                    />
                  ))}
                </ul>
              </SortableContext>
            </DndContext>
          )}
        </div>

        {/* Footer note */}
        <p className="mt-10 text-center text-xs text-muted-foreground">
          Changes apply only to new chat sessions. Active job creation chats
          continue with their existing question set.
        </p>
      </main>

      {/* Editor Modal */}
      <QuestionEditor
        state={editor}
        questions={questions}
        onClose={closeEditor}
        onSave={saveDraft}
        onChange={updateDraft}
      />

      {/* Delete confirmation */}
      <AlertDialog
        open={confirmDelete.open}
        onOpenChange={(o) =>
          setConfirmDelete((s) => ({ ...s, open: o }))
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {confirmDelete.ids.length > 1 ? "questions" : "question"}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The chat flow will skip{" "}
              {confirmDelete.ids.length > 1
                ? "these questions"
                : "this question"}{" "}
              for new sessions. Historical job records remain unaffected.
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

const EmptyState = ({
  onAdd,
  hasFilter,
}: {
  onAdd: () => void;
  hasFilter: boolean;
}) => (
  <div className="glass-card rounded-2xl p-12 text-center">
    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
      <ListChecks className="h-6 w-6" />
    </div>
    <h3 className="mt-4 font-display text-lg font-semibold">
      {hasFilter ? "No questions match your filter" : "No questions yet"}
    </h3>
    <p className="mt-1 text-sm text-muted-foreground">
      {hasFilter
        ? "Try clearing the search or status filter."
        : "Add your first question to start configuring the chat flow."}
    </p>
    {!hasFilter && (
      <Button variant="hero" size="sm" className="mt-6" onClick={onAdd}>
        <Plus className="h-4 w-4" />
        Add Question
      </Button>
    )}
  </div>
);

const SortableRow = ({
  question,
  index,
  selected,
  onSelect,
  onEdit,
  onDelete,
  onToggleActive,
  questions,
}: {
  question: ChatQuestion;
  index: number;
  selected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggleActive: () => void;
  questions: ChatQuestion[];
}) => {
  const [expanded, setExpanded] = useState(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 20 : "auto",
  };

  const conditionLabel = (c: Condition) => {
    const ifQ = questions.find((q) => q.id === c.ifQuestionId);
    const thenQ = questions.find((q) => q.id === c.thenQuestionId);
    return `IF "${ifQ?.text.slice(0, 30) ?? "?"}…" ${c.operator} "${
      c.value
    }" → "${thenQ?.text.slice(0, 30) ?? "?"}…"`;
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`glass-card rounded-2xl transition-all ${
        selected ? "ring-1 ring-primary" : ""
      } ${isDragging ? "shadow-elegant" : ""}`}
    >
      <div className="flex items-start gap-3 p-4">
        <button
          {...attributes}
          {...listeners}
          className="mt-1 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground touch-none"
          aria-label="Drag to reorder"
        >
          <GripVertical className="h-4 w-4" />
        </button>

        <Checkbox
          checked={selected}
          onCheckedChange={onSelect}
          className="mt-1"
          aria-label={`Select question ${index + 1}`}
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 flex-wrap">
            <span className="inline-flex items-center justify-center min-w-7 h-6 px-1.5 rounded-md bg-secondary text-xs font-mono text-muted-foreground">
              {String(index + 1).padStart(2, "0")}
            </span>
            <p className="font-medium text-sm md:text-base flex-1 min-w-0 break-words">
              {question.text}
            </p>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="gap-1.5 text-xs">
              {inputTypeLabel[question.inputType]}
            </Badge>
            {question.required && (
              <Badge variant="outline" className="text-xs">
                Required
              </Badge>
            )}
            {question.suggestedEnabled && question.options.length > 0 && (
              <Badge
                variant="outline"
                className="text-xs gap-1.5 border-primary/40 text-primary"
              >
                <Sparkles className="h-3 w-3" />
                {question.options.length} suggestion
                {question.options.length > 1 ? "s" : ""}
              </Badge>
            )}
            {question.conditions.length > 0 && (
              <Badge
                variant="outline"
                className="text-xs gap-1.5 border-accent/40 text-accent"
              >
                <GitBranch className="h-3 w-3" />
                {question.conditions.length} condition
                {question.conditions.length > 1 ? "s" : ""}
              </Badge>
            )}
            <button
              onClick={() => setExpanded((s) => !s)}
              className="ml-auto text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
            >
              {expanded ? "Hide" : "Preview"}
              {expanded ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onToggleActive}
            className={`hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              question.active
                ? "bg-primary/10 text-primary hover:bg-primary/15"
                : "bg-muted text-muted-foreground hover:bg-secondary"
            }`}
            aria-label={question.active ? "Deactivate" : "Activate"}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                question.active ? "bg-primary" : "bg-muted-foreground"
              }`}
            />
            {question.active ? "Active" : "Inactive"}
          </button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onEdit}
            aria-label="Edit"
          >
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
      </div>

      {expanded && (
        <div className="border-t border-border px-4 py-4 bg-secondary/30 rounded-b-2xl space-y-4">
          {question.suggestedEnabled && question.options.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Suggested answers
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {question.options.map((o) => (
                  <span
                    key={o}
                    className="px-3 py-1.5 rounded-full bg-background border border-border text-xs"
                  >
                    {o}
                  </span>
                ))}
              </div>
            </div>
          )}
          {question.conditions.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Conditional logic
              </div>
              <ul className="mt-2 space-y-1.5">
                {question.conditions.map((c) => (
                  <li
                    key={c.id}
                    className="text-xs px-3 py-2 rounded-lg bg-background border border-border font-mono"
                  >
                    {conditionLabel(c)}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="flex md:hidden">
            <button
              onClick={onToggleActive}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${
                question.active
                  ? "bg-primary/10 text-primary"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  question.active ? "bg-primary" : "bg-muted-foreground"
                }`}
              />
              {question.active ? "Active" : "Inactive"}
            </button>
          </div>
        </div>
      )}
    </li>
  );
};

const QuestionEditor = ({
  state,
  questions,
  onClose,
  onSave,
  onChange,
}: {
  state: EditorState;
  questions: ChatQuestion[];
  onClose: () => void;
  onSave: () => void;
  onChange: (patch: Partial<ChatQuestion>) => void;
}) => {
  const { draft } = state;
  const [newOption, setNewOption] = useState("");
  const words = wordCount(draft.text);
  const overLimit = words > MAX_WORDS;

  const addOption = (val: string) => {
    const v = val.trim();
    if (!v) return;
    if (draft.options.length >= MAX_OPTIONS) {
      toast({
        title: `Maximum ${MAX_OPTIONS} options allowed`,
        variant: "destructive",
      });
      return;
    }
    if (
      draft.options.some(
        (o) => o.toLowerCase() === v.toLowerCase(),
      )
    ) {
      toast({ title: "Duplicate option", variant: "destructive" });
      return;
    }
    onChange({ options: [...draft.options, v] });
    setNewOption("");
  };

  const removeOption = (idx: number) =>
    onChange({ options: draft.options.filter((_, i) => i !== idx) });

  const updateOption = (idx: number, val: string) =>
    onChange({
      options: draft.options.map((o, i) => (i === idx ? val : o)),
    });

  const generateAI = () => {
    if (!draft.text.trim()) {
      toast({
        title: "Add question text first",
        description: "AI uses your question to generate relevant suggestions.",
      });
      return;
    }
    const generated = aiGenerateOptions(draft.text).slice(0, MAX_AI_OPTIONS);
    const merged = Array.from(
      new Set([...draft.options, ...generated].map((o) => o.trim())),
    ).slice(0, MAX_OPTIONS);
    onChange({ options: merged, suggestedEnabled: true });
    toast({
      title: "AI generated suggestions",
      description: `Added ${merged.length - draft.options.length} new option${
        merged.length - draft.options.length === 1 ? "" : "s"
      }.`,
    });
  };

  const addCondition = () => {
    const otherQs = questions.filter((q) => q.id !== draft.id);
    if (otherQs.length < 1) {
      toast({ title: "Need at least one other question to add a condition" });
      return;
    }
    const cond: Condition = {
      id: `c-${uid()}`,
      ifQuestionId: otherQs[0].id,
      operator: "equals",
      value: otherQs[0].options[0] ?? "",
      thenQuestionId: draft.id,
    };
    onChange({ conditions: [...draft.conditions, cond] });
  };

  const updateCondition = (id: string, patch: Partial<Condition>) =>
    onChange({
      conditions: draft.conditions.map((c) =>
        c.id === id ? { ...c, ...patch } : c,
      ),
    });

  const removeCondition = (id: string) =>
    onChange({
      conditions: draft.conditions.filter((c) => c.id !== id),
    });

  const otherQuestions = questions.filter((q) => q.id !== draft.id);

  return (
    <Dialog open={state.open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {state.mode === "create" ? "Add new question" : "Edit question"}
          </DialogTitle>
          <DialogDescription>
            Configure how Glohire AI asks this question during chat-based job
            creation.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="basics" className="mt-2">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="basics">Basics</TabsTrigger>
            <TabsTrigger value="answers">
              <Sparkles className="h-3.5 w-3.5 mr-1.5" />
              Answers
            </TabsTrigger>
            <TabsTrigger value="logic">
              <GitBranch className="h-3.5 w-3.5 mr-1.5" />
              Logic
            </TabsTrigger>
          </TabsList>

          {/* BASICS */}
          <TabsContent value="basics" className="space-y-5 pt-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="q-text">Question text</Label>
                <span
                  className={`text-xs ${
                    overLimit ? "text-destructive" : "text-muted-foreground"
                  }`}
                >
                  {words}/{MAX_WORDS} words
                </span>
              </div>
              <Textarea
                id="q-text"
                value={draft.text}
                onChange={(e) => onChange({ text: e.target.value })}
                placeholder="e.g. Which programming languages are required for this role?"
                className="min-h-[88px]"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Input type</Label>
                <Select
                  value={draft.inputType}
                  onValueChange={(v) =>
                    onChange({ inputType: v as InputType })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free_text">Free text</SelectItem>
                    <SelectItem value="single_select">Single select</SelectItem>
                    <SelectItem value="multi_select">Multi select</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3 pt-1">
                <ToggleRow
                  label="Required"
                  description="Recruiter must answer before continuing."
                  checked={draft.required}
                  onChange={(v) => onChange({ required: v })}
                />
                <ToggleRow
                  label="Active"
                  description="Show in chat flow."
                  checked={draft.active}
                  onChange={(v) => onChange({ active: v })}
                />
              </div>
            </div>
          </TabsContent>

          {/* ANSWERS */}
          <TabsContent value="answers" className="space-y-5 pt-4">
            <ToggleRow
              label="Enable suggested answers"
              description="Show pre-defined options as buttons in the chat."
              checked={draft.suggestedEnabled}
              onChange={(v) => onChange({ suggestedEnabled: v })}
            />

            {draft.suggestedEnabled && (
              <>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={generateAI}
                    className="gap-1.5"
                  >
                    <Zap className="h-3.5 w-3.5" />
                    Generate with AI
                  </Button>
                  <span className="text-xs text-muted-foreground">
                    {draft.options.length}/{MAX_OPTIONS} options
                  </span>
                </div>

                <div className="space-y-2">
                  {draft.options.map((opt, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 rounded-lg bg-secondary/40 px-2 py-1"
                    >
                      <span className="text-xs font-mono text-muted-foreground w-6 text-center">
                        {idx + 1}
                      </span>
                      <Input
                        value={opt}
                        onChange={(e) => updateOption(idx, e.target.value)}
                        className="border-0 bg-transparent focus-visible:ring-0 h-9"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeOption(idx)}
                        aria-label="Remove option"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    addOption(newOption);
                  }}
                  className="flex gap-2"
                >
                  <Input
                    value={newOption}
                    onChange={(e) => setNewOption(e.target.value)}
                    placeholder="Type an option and press Enter"
                  />
                  <Button type="submit" variant="outline" size="sm">
                    <Plus className="h-4 w-4" />
                    Add
                  </Button>
                </form>

                {draft.options.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    No options yet. Add manually or use AI to generate suggestions.
                  </p>
                )}
              </>
            )}
          </TabsContent>

          {/* LOGIC */}
          <TabsContent value="logic" className="space-y-4 pt-4">
            <div className="rounded-xl bg-secondary/40 border border-border p-3 text-xs text-muted-foreground">
              Conditional logic shows this question only when the recruiter's prior
              answer matches a condition. Define one or more rules below.
            </div>

            <div className="space-y-3">
              {draft.conditions.map((c) => {
                const ifQ = otherQuestions.find((q) => q.id === c.ifQuestionId);
                const valueOptions = ifQ?.options ?? [];
                return (
                  <div
                    key={c.id}
                    className="rounded-xl border border-border bg-background p-3 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-primary">
                        Condition
                      </span>
                      <button
                        onClick={() => removeCondition(c.id)}
                        className="text-muted-foreground hover:text-destructive"
                        aria-label="Remove condition"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="grid sm:grid-cols-12 gap-2 items-center">
                      <span className="sm:col-span-1 text-xs font-semibold text-muted-foreground">
                        IF
                      </span>
                      <div className="sm:col-span-5">
                        <Select
                          value={c.ifQuestionId}
                          onValueChange={(v) =>
                            updateCondition(c.id, {
                              ifQuestionId: v,
                              value: "",
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Question" />
                          </SelectTrigger>
                          <SelectContent>
                            {otherQuestions.map((q) => (
                              <SelectItem key={q.id} value={q.id}>
                                {q.text.slice(0, 50)}
                                {q.text.length > 50 ? "…" : ""}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="sm:col-span-2">
                        <Select
                          value={c.operator}
                          onValueChange={(v) =>
                            updateCondition(c.id, {
                              operator: v as Condition["operator"],
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="equals">equals</SelectItem>
                            <SelectItem value="contains">contains</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="sm:col-span-4">
                        {valueOptions.length > 0 ? (
                          <Select
                            value={c.value}
                            onValueChange={(v) =>
                              updateCondition(c.id, { value: v })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Value" />
                            </SelectTrigger>
                            <SelectContent>
                              {valueOptions.map((o) => (
                                <SelectItem key={o} value={o}>
                                  {o}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input
                            value={c.value}
                            onChange={(e) =>
                              updateCondition(c.id, { value: e.target.value })
                            }
                            placeholder="Value"
                          />
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pt-1 text-xs text-muted-foreground">
                      <ChevronRight className="h-3 w-3" />
                      THEN show this question
                      <Check className="h-3 w-3 text-primary" />
                    </div>
                  </div>
                );
              })}
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addCondition}
              disabled={otherQuestions.length === 0}
            >
              <Plus className="h-4 w-4" />
              Add condition
            </Button>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="hero"
            onClick={onSave}
            disabled={!draft.text.trim() || overLimit}
          >
            {state.mode === "create" ? "Create question" : "Save changes"}
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
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) => (
  <div className="flex items-start justify-between gap-4 rounded-lg bg-secondary/40 px-3 py-2">
    <div>
      <div className="text-sm font-medium">{label}</div>
      <div className="text-xs text-muted-foreground">{description}</div>
    </div>
    <Switch checked={checked} onCheckedChange={onChange} />
  </div>
);

export default SystemBehavior;
