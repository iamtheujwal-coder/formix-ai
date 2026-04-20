"use client";

import { useState } from "react";
import { 
  X, 
  Trash2, 
  Plus, 
  ChevronDown, 
  ChevronUp, 
  Type, 
  AlignLeft, 
  ListOrdered,
  Save,
  CheckCircle2
} from "lucide-react";
import { FormSchema, FormQuestion, QuestionType } from "@/types/form";

interface SchemaEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedSchema: FormSchema) => void;
  initialSchema: FormSchema;
}

export function SchemaEditor({
  isOpen,
  onClose,
  onSave,
  initialSchema,
}: SchemaEditorProps) {
  const [schema, setSchema] = useState<FormSchema>({ ...initialSchema });
  const [activeQuestion, setActiveQuestion] = useState<number | null>(0);

  if (!isOpen) return null;

  const handleUpdateTitle = (title: string) => {
    setSchema({ ...schema, title });
  };

  const handleUpdateQuestion = (index: number, updates: Partial<FormQuestion>) => {
    const newQuestions = [...schema.questions];
    newQuestions[index] = { ...newQuestions[index], ...updates };
    setSchema({ ...schema, questions: newQuestions });
  };

  const handleDeleteQuestion = (index: number) => {
    const newQuestions = schema.questions.filter((_, i) => i !== index);
    setSchema({ ...schema, questions: newQuestions });
    if (activeQuestion === index) setActiveQuestion(null);
  };

  const handleAddQuestion = () => {
    const newQuestion: FormQuestion = {
      question: "New Question",
      type: "short_text"
    };
    setSchema({ ...schema, questions: [...schema.questions, newQuestion] });
    setActiveQuestion(schema.questions.length);
  };

  const handleAddOption = (qIndex: number) => {
    const question = schema.questions[qIndex];
    const options = [...(question.options || []), `Option ${(question.options?.length || 0) + 1}`];
    handleUpdateQuestion(qIndex, { options });
  };

  const handleUpdateOption = (qIndex: number, oIndex: number, value: string) => {
    const question = schema.questions[qIndex];
    if (!question.options) return;
    const newOptions = [...question.options];
    newOptions[oIndex] = value;
    handleUpdateQuestion(qIndex, { options: newOptions });
  };

  const handleDeleteOption = (qIndex: number, oIndex: number) => {
    const question = schema.questions[qIndex];
    if (!question.options) return;
    const newOptions = question.options.filter((_, i) => i !== oIndex);
    handleUpdateQuestion(qIndex, { options: newOptions });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-500" 
        onClick={onClose}
      />
      
      {/* Editor Content */}
      <div className="relative flex h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-[40px] border border-white/[0.08] bg-[#09090b] shadow-2xl shadow-black animate-in zoom-in-95 duration-500">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.05] p-6 pr-8">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 flex items-center justify-center rounded-2xl bg-violet-500/10 border border-violet-500/20">
              <CheckCircle2 className="h-5 w-5 text-violet-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Review & Edit Form</h2>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest uppercase">Refine your AI-generated structure</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-white/[0.05] text-zinc-500 transition-all"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Left Panel: Question List */}
          <div className="w-1/3 flex flex-col border-r border-white/[0.05] bg-white/[0.01]">
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {schema.questions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveQuestion(idx)}
                  className={`group w-full flex items-center justify-between gap-3 text-left p-4 rounded-3xl transition-all border ${
                    activeQuestion === idx 
                      ? 'bg-white/[0.05] border-white/[0.1] shadow-xl' 
                      : 'border-transparent hover:bg-white/[0.02]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-[10px] font-bold text-zinc-600 w-4">{idx + 1}</span>
                    <span className={`text-sm truncate font-medium ${activeQuestion === idx ? 'text-white' : 'text-zinc-500'}`}>
                      {q.question}
                    </span>
                  </div>
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-300 ${activeQuestion === idx ? 'rotate-180 text-violet-400' : 'text-zinc-700'}`} />
                </button>
              ))}
            </div>
            <div className="p-4 border-t border-white/[0.05]">
              <button
                onClick={handleAddQuestion}
                className="w-full flex items-center justify-center gap-2 rounded-2xl border border-dashed border-white/[0.1] py-3 text-xs font-bold text-zinc-500 transition-all hover:bg-white/[0.02] hover:text-white"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Question
              </button>
            </div>
          </div>

          {/* Right Panel: Editor */}
          <div className="flex-1 flex flex-col bg-[#09090b]">
            <div className="flex-1 overflow-y-auto p-8 sm:p-12">
              {activeQuestion !== null ? (
                <div className="max-w-2xl mx-auto space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                  {/* Question Title */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest pl-1">Question Text</label>
                    <textarea 
                      value={schema.questions[activeQuestion].question}
                      onChange={(e) => handleUpdateQuestion(activeQuestion, { question: e.target.value })}
                      className="w-full bg-transparent text-2xl font-bold text-white border-none focus:ring-0 resize-none placeholder:text-zinc-800"
                      rows={2}
                      placeholder="Enter question..."
                    />
                  </div>

                  {/* Question Type */}
                  <div className="space-y-4">
                    <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest pl-1">Response Type</label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { id: 'short_text', label: 'Short Text', icon: Type },
                        { id: 'paragraph', label: 'Paragraph', icon: AlignLeft },
                        { id: 'multiple_choice', label: 'Multiple Choice', icon: ListOrdered },
                      ].map((t) => (
                        <button
                          key={t.id}
                          onClick={() => handleUpdateQuestion(activeQuestion, { type: t.id as QuestionType })}
                          className={`flex flex-col items-center gap-3 p-4 rounded-3xl border transition-all ${
                            schema.questions[activeQuestion].type === t.id
                              ? 'bg-violet-500/10 border-violet-500/30 text-violet-400'
                              : 'bg-white/[0.02] border-white/[0.08] text-zinc-500 hover:border-white/[0.15] hover:text-zinc-300'
                          }`}
                        >
                          <t.icon className="h-5 w-5" />
                          <span className="text-[10px] font-bold uppercase tracking-widest">{t.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Options (if MC) */}
                  {schema.questions[activeQuestion].type === 'multiple_choice' && (
                    <div className="space-y-4 pt-4 border-t border-white/[0.05]">
                      <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest pl-1">Options</label>
                      <div className="space-y-3">
                        {schema.questions[activeQuestion].options?.map((opt, oIdx) => (
                          <div key={oIdx} className="group flex items-center gap-3">
                            <div className="h-2 w-2 rounded-full border border-zinc-700 bg-transparent shrink-0" />
                            <input 
                              type="text"
                              value={opt}
                              onChange={(e) => handleUpdateOption(activeQuestion, oIdx, e.target.value)}
                              className="flex-1 bg-transparent text-sm font-medium text-zinc-300 border-none focus:ring-0 p-0"
                            />
                            <button 
                              onClick={() => handleDeleteOption(activeQuestion, oIdx)}
                              className="opacity-0 group-hover:opacity-100 h-8 w-8 flex items-center justify-center rounded-lg hover:bg-red-500/10 text-zinc-600 hover:text-red-400 transition-all"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={() => handleAddOption(activeQuestion)}
                          className="flex items-center gap-3 pl-1 text-[11px] font-bold text-violet-400 hover:text-violet-300 transition-colors"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          Add Option
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="pt-10 flex border-t border-white/[0.05]">
                    <button
                      onClick={() => handleDeleteQuestion(activeQuestion)}
                      className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-red-500/5 border border-red-500/10 text-[11px] font-bold text-red-400 hover:bg-red-500/10 transition-all active:scale-95"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete Question
                    </button>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <div className="h-16 w-16 rounded-full bg-zinc-900 border border-white/[0.05] flex items-center justify-center mb-6">
                    <ListOrdered className="h-8 w-8 text-zinc-800" />
                  </div>
                  <h3 className="text-lg font-bold text-zinc-500 mb-2">Select a question to edit</h3>
                  <p className="text-sm text-zinc-700 max-w-xs">Click on a question on the left to start refining its details.</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-white/[0.05] p-8 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Form Word Count (Manual Edits Apply)</span>
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={onClose}
                  className="px-8 py-3 rounded-2xl bg-zinc-900 border border-white/[0.05] text-[11px] font-bold text-zinc-400 hover:bg-zinc-800 transition-all"
                >
                  Discard Changes
                </button>
                <button
                  onClick={() => onSave(schema)}
                  className="flex items-center gap-2 px-10 py-3 rounded-2xl premium-gradient text-[11px] font-bold text-white shadow-xl shadow-violet-500/20 hover:shadow-violet-500/40 active:scale-95 transition-all"
                >
                  <Save className="h-4 w-4" />
                  Confirm & Save Draft
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
