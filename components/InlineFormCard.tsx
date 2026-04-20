"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Copy,
  Check,
  Send,
  Edit3,
  Loader2,
  Sparkles,
  FileText,
  Type,
  AlignLeft,
  CheckSquare,
  ChevronDown as DropdownIcon,
  BarChart2,
  Calendar,
  Minus,
  RefreshCw,
} from "lucide-react";
import { FormSchema, QuestionType } from "@/types/form";

interface InlineFormCardProps {
  schema: FormSchema;
  formId: string;
  formLink?: string;
  isPublished?: boolean;
  isPublishing?: boolean;
  isDemo?: boolean;
  onPublish: () => void;
  onEdit: () => void;
  onCopyLink?: () => void;
  copied?: boolean;
}

const typeIcons: Record<QuestionType, React.ReactNode> = {
  short_text: <Type className="h-3 w-3" />,
  paragraph: <AlignLeft className="h-3 w-3" />,
  multiple_choice: <FileText className="h-3 w-3" />,
  checkbox: <CheckSquare className="h-3 w-3" />,
  dropdown: <DropdownIcon className="h-3 w-3" />,
  scale: <BarChart2 className="h-3 w-3" />,
  date: <Calendar className="h-3 w-3" />,
  section_header: <Minus className="h-3 w-3" />,
};

const typeLabels: Record<QuestionType, string> = {
  short_text: "Short text",
  paragraph: "Paragraph",
  multiple_choice: "Multiple choice",
  checkbox: "Checkboxes",
  dropdown: "Dropdown",
  scale: "Scale",
  date: "Date",
  section_header: "Section",
};

export function InlineFormCard({
  schema,
  formId,
  formLink,
  isPublished,
  isPublishing,
  isDemo,
  onPublish,
  onEdit,
  onCopyLink,
  copied,
}: InlineFormCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const questionCount = schema.questions.filter(
    (q) => q.type !== "section_header"
  ).length;

  if (isPublished && formLink) {
    return (
      <div className="mt-4 inline-flex flex-col gap-0 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 overflow-hidden min-w-[300px] max-w-[440px] shadow-xl shadow-emerald-500/5">
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b border-emerald-500/10">
          <div className="h-9 w-9 rounded-xl bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
            <Check className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-emerald-400">Published to Google Forms</p>
            <p className="text-[11px] text-zinc-500 font-medium truncate">{schema.title}</p>
          </div>
        </div>
        {/* Actions */}
        <div className="flex gap-2 p-3">
          <a
            href={formLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 h-9 inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-500 text-[11px] font-bold text-white hover:bg-emerald-400 transition-all active:scale-95 shadow-lg shadow-emerald-500/20"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Open Form
          </a>
          <button
            onClick={onCopyLink}
            className="h-9 px-4 inline-flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.03] text-[11px] font-bold text-zinc-400 hover:text-white hover:bg-white/[0.07] transition-all active:scale-95"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied!" : "Copy Link"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 inline-flex flex-col rounded-2xl border border-violet-500/20 bg-violet-500/[0.04] overflow-hidden min-w-[300px] max-w-[440px] shadow-xl shadow-violet-500/5">
      {/* Header */}
      <div className="flex items-center gap-3 p-4">
        <div className="h-9 w-9 rounded-xl bg-violet-500/15 border border-violet-500/20 flex items-center justify-center flex-shrink-0">
          <Sparkles className="h-4 w-4 text-violet-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-violet-300 truncate">{schema.title}</p>
          <p className="text-[10px] text-zinc-600 font-medium uppercase tracking-wider">
            {questionCount} questions · Draft
            {isDemo && " · Demo mode"}
          </p>
        </div>
        <button
          onClick={() => setIsExpanded((v) => !v)}
          className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-white/[0.05] text-zinc-600 hover:text-zinc-300 transition-all"
        >
          {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>
      </div>

      {/* Expandable question list */}
      {isExpanded && (
        <div className="border-t border-violet-500/10 bg-black/20 max-h-[260px] overflow-y-auto">
          {schema.questions.map((q, i) => (
            <div
              key={i}
              className={`flex items-start gap-3 px-4 py-2.5 border-b border-white/[0.03] last:border-0 ${
                q.type === "section_header" ? "bg-white/[0.02]" : ""
              }`}
            >
              <span className="text-[9px] font-bold text-zinc-700 mt-0.5 w-4 shrink-0">
                {q.type !== "section_header" ? i + 1 : "—"}
              </span>
              <div className="flex-1 min-w-0">
                <p
                  className={`text-[12px] font-medium leading-snug ${
                    q.type === "section_header"
                      ? "text-zinc-400 font-bold uppercase tracking-wider text-[10px]"
                      : "text-zinc-300"
                  }`}
                >
                  {q.question}
                </p>
                {q.options && (
                  <p className="text-[10px] text-zinc-600 mt-0.5">
                    {q.options.slice(0, 3).join(", ")}
                    {q.options.length > 3 ? ` +${q.options.length - 3} more` : ""}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0 text-zinc-700 mt-0.5">
                {typeIcons[q.type]}
                <span className="text-[9px] font-medium">{typeLabels[q.type]}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Schema description */}
      {schema.description && !isExpanded && (
        <p className="px-4 pb-2 text-[11px] text-zinc-500 font-medium leading-relaxed line-clamp-2">
          {schema.description}
        </p>
      )}

      {/* Action buttons */}
      <div className="flex gap-2 p-3 border-t border-violet-500/10">
        <button
          onClick={onEdit}
          disabled={isPublishing}
          className="flex-1 h-9 inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.02] text-[11px] font-bold text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-all active:scale-95 disabled:opacity-40"
        >
          <Edit3 className="h-3.5 w-3.5" />
          Edit
        </button>
        <button
          onClick={onPublish}
          disabled={isPublishing}
          className="flex-[2] h-9 inline-flex items-center justify-center gap-1.5 rounded-xl bg-violet-500 text-[11px] font-bold text-white hover:bg-violet-400 transition-all active:scale-95 disabled:opacity-60 shadow-lg shadow-violet-500/20"
        >
          {isPublishing ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Publishing...
            </>
          ) : (
            <>
              <Send className="h-3.5 w-3.5" />
              Publish to Google Forms
            </>
          )}
        </button>
      </div>
    </div>
  );
}
