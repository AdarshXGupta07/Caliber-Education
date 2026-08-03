"use client";

import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, ArrowLeft, Save, Upload, AlertCircle, FileText, Settings2, GripVertical, CheckCircle, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// -- Models matching Backend V3 Schema --
export interface Question {
  id: string;
  type: "normal" | "case";
  content: string;
  options: string[];
  correct_option: number;
  explanation: string;
  marks: number;
  negative_marks: number;
  difficulty: "easy" | "medium" | "hard";
  case_scenario_id?: string;
}

export interface CaseScenario {
  id: string;
  narrative: string;
}

export interface ExamSection {
  id: string;
  title: string;
  questions: Question[];
}

export interface MCQPaper {
  id: string;
  title: string;
  level: string; 
  groupName: string; 
  subjectCode: string; 
  chapterName?: string;
  testType: string; 
  durationMinutes: number;
  passingMarks: number;
  totalMarks: number;
  status: "draft" | "published" | "archived";
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  sections: ExamSection[];
  case_scenarios?: CaseScenario[]; // we manage cases per paper here
  sectionCount?: number;
  questionCount?: number;
}

// Master Data
const LEVELS = ["FINAL", "INTERMEDIATE", "FOUNDATION"];
const GROUPS = ["GROUP_1", "GROUP_2", "BOTH", "NONE"];
const TEST_TYPES = ["COMPLETE_GROUP", "FULL_SUBJECT", "CHAPTER_WISE"];
const SUBJECTS = [
  { code: "FR", name: "Financial Reporting", level: "FINAL", group: "GROUP_1" },
  { code: "AFM", name: "Advanced Financial Management", level: "FINAL", group: "GROUP_1" },
  { code: "AUD", name: "Advanced Auditing", level: "FINAL", group: "GROUP_1" },
  { code: "DT", name: "Direct Tax", level: "FINAL", group: "GROUP_2" },
  { code: "IDT", name: "Indirect Tax", level: "FINAL", group: "GROUP_2" },
  { code: "IBS", name: "Integrated Business Solutions", level: "FINAL", group: "GROUP_2" },
  { code: "ACC", name: "Advanced Accounting", level: "INTERMEDIATE", group: "GROUP_1" },
  { code: "LAW", name: "Corporate & Other Laws", level: "INTERMEDIATE", group: "GROUP_1" },
  { code: "TAX", name: "Taxation", level: "INTERMEDIATE", group: "GROUP_1" },
  { code: "CMA", name: "Cost & Management Accounting", level: "INTERMEDIATE", group: "GROUP_2" },
  { code: "AUD_INT", name: "Auditing & Ethics", level: "INTERMEDIATE", group: "GROUP_2" },
  { code: "FM_SM", name: "FM & Strategic Management", level: "INTERMEDIATE", group: "GROUP_2" }
];

export default function MCQStudio({ series }: { series: any[] }) {
  const [papers, setPapers] = useState<MCQPaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPaper, setEditingPaper] = useState<MCQPaper | null>(null);

  useEffect(() => {
    fetchPapers();
  }, []);

  async function fetchPapers() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/mcq-sets");
      if (res.ok) {
        const data = await res.json();
        setPapers(data);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }

  function handleCreate() {
    setEditingPaper({
      id: "", // indicates new
      title: "New Test Paper",
      level: "FINAL",
      groupName: "GROUP_1",
      subjectCode: "FR",
      testType: "FULL_SUBJECT",
      durationMinutes: 60,
      passingMarks: 40,
      totalMarks: 100,
      status: "draft",
      shuffleQuestions: false,
      shuffleOptions: false,
      sections: [],
      case_scenarios: []
    });
  }

  if (editingPaper) {
    return <PaperEditor paper={editingPaper} onBack={() => { setEditingPaper(null); fetchPapers(); }} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-ink-navy dark:text-paper">MCQ Papers (CA Hierarchy)</h2>
          <p className="text-sm text-slate dark:text-paper/60">Manage mock tests, question banks, and case scenarios.</p>
        </div>
        <button onClick={handleCreate} className="flex items-center gap-2 bg-primary-gold text-ink-navy px-4 py-2 rounded-xl font-bold hover:shadow-lg transition-all">
          <Plus className="w-4 h-4" /> New Paper
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate">Loading papers...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {papers.map(p => (
            <div key={p.id} className="bg-white dark:bg-line-gray-dark/50 p-6 rounded-2xl border border-line-gray-light dark:border-line-gray-dark shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${p.status === 'published' ? 'bg-signal-emerald/10 text-signal-emerald' : 'bg-primary-gold/20 text-primary-gold'}`}>
                    {p.status}
                  </span>
                  <h3 className="font-bold text-ink-navy dark:text-paper mt-2">{p.title}</h3>
                </div>
                <button onClick={() => setEditingPaper(p)} className="p-2 text-slate hover:text-primary-gold hover:bg-primary-gold/10 rounded-lg transition-colors">
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
              
              <div className="space-y-2 mb-6">
                <div className="flex items-center text-sm text-slate dark:text-paper/70">
                  <span className="w-20 font-medium">Hierarchy:</span>
                  <span className="text-xs bg-slate/10 px-2 py-0.5 rounded text-ink-navy dark:text-paper">{p.level} • {p.groupName}</span>
                </div>
                <div className="flex items-center text-sm text-slate dark:text-paper/70">
                  <span className="w-20 font-medium">Subject:</span>
                  <span className="font-semibold text-primary-gold">{p.subjectCode}</span>
                </div>
                <div className="flex items-center text-sm text-slate dark:text-paper/70">
                  <span className="w-20 font-medium">Type:</span>
                  <span className="text-xs border border-line-gray-light dark:border-line-gray-dark px-2 py-0.5 rounded">{p.testType.replace("_", " ")}</span>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-line-gray-light dark:border-line-gray-dark pt-4">
                <div className="text-center">
                  <p className="text-2xl font-black text-ink-navy dark:text-paper">{p.durationMinutes}</p>
                  <p className="text-[10px] uppercase text-slate font-bold">Mins</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-black text-ink-navy dark:text-paper">{p.totalMarks}</p>
                  <p className="text-[10px] uppercase text-slate font-bold">Marks</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-black text-ink-navy dark:text-paper">{p.questionCount || 0}</p>
                  <p className="text-[10px] uppercase text-slate font-bold">Qs</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PaperEditor({ paper, onBack }: { paper: MCQPaper, onBack: () => void }) {
  const [data, setData] = useState<MCQPaper>(paper);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"settings"|"cases"|"questions">("settings");

  const inp = "w-full px-3 py-2 text-sm border border-line-gray-light dark:border-line-gray-dark bg-white dark:bg-line-gray-dark/50 text-ink-navy dark:text-paper rounded-xl focus:outline-none focus:border-signal-emerald transition-colors";

  useEffect(() => {
    if (paper.id) {
      // Fetch full details including sections and cases
      fetch(`/api/admin/mcq-sets/${paper.id}`)
        .then(res => res.json())
        .then(full => setData({...data, sections: full.sections || [], case_scenarios: full.case_scenarios || []}));
    }
  }, [paper.id]);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/mcq-sets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        alert("Saved successfully!");
        onBack();
      } else {
        alert("Failed to save.");
      }
    } catch(e) {
      alert("Error saving paper.");
    }
    setSaving(false);
  }

  const filteredSubjects = SUBJECTS.filter(s => s.level === data.level && s.group === data.groupName);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-line-gray-light dark:border-line-gray-dark">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 bg-line-gray-light dark:bg-line-gray-dark rounded-full hover:bg-slate/20 transition-colors">
            <ArrowLeft className="w-5 h-5 text-ink-navy dark:text-paper" />
          </button>
          <h2 className="text-xl font-bold text-ink-navy dark:text-paper">
            {paper.id ? "Edit Paper" : "Create New Paper"}
          </h2>
        </div>
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-signal-emerald text-white px-6 py-2 rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50">
          <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save Paper"}
        </button>
      </div>

      <div className="flex gap-2 border-b border-line-gray-light dark:border-line-gray-dark">
        {[
          { id: "settings", icon: <Settings2 className="w-4 h-4" />, label: "Hierarchy & Settings" },
          { id: "cases", icon: <FileText className="w-4 h-4" />, label: "Case Scenarios" },
          { id: "questions", icon: <CheckCircle className="w-4 h-4" />, label: "Sections & Questions" },
        ].map(t => (
          <button 
            key={t.id} 
            onClick={() => setActiveTab(t.id as any)}
            className={`flex items-center gap-2 px-4 py-3 font-semibold text-sm transition-colors border-b-2 ${activeTab === t.id ? "border-primary-gold text-primary-gold" : "border-transparent text-slate hover:text-ink-navy dark:hover:text-paper"}`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {activeTab === "settings" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="font-bold text-lg text-ink-navy dark:text-paper border-b border-line-gray-light dark:border-line-gray-dark pb-2">Basic Info</h3>
            <div>
              <label className="block text-xs font-bold text-slate uppercase mb-1">Title</label>
              <input className={inp} value={data.title} onChange={e => setData({...data, title: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate uppercase mb-1">Status</label>
                <select className={inp} value={data.status} onChange={e => setData({...data, status: e.target.value as any})}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate uppercase mb-1">Test Type</label>
                <select className={inp} value={data.testType} onChange={e => setData({...data, testType: e.target.value})}>
                  {TEST_TYPES.map(t => <option key={t} value={t}>{t.replace("_", " ")}</option>)}
                </select>
              </div>
            </div>

            <h3 className="font-bold text-lg text-ink-navy dark:text-paper border-b border-line-gray-light dark:border-line-gray-dark pb-2 mt-8">CA Hierarchy Mapping</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate uppercase mb-1">Level</label>
                <select className={inp} value={data.level} onChange={e => setData({...data, level: e.target.value, subjectCode: ""})}>
                  {LEVELS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate uppercase mb-1">Group</label>
                <select className={inp} value={data.groupName} onChange={e => setData({...data, groupName: e.target.value, subjectCode: ""})}>
                  {GROUPS.map(t => <option key={t} value={t}>{t.replace("_", " ")}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate uppercase mb-1">Subject</label>
              <select className={inp} value={data.subjectCode} onChange={e => setData({...data, subjectCode: e.target.value})}>
                <option value="">-- Select Subject --</option>
                {filteredSubjects.map(s => <option key={s.code} value={s.code}>{s.code} - {s.name}</option>)}
              </select>
            </div>
            {data.testType === "CHAPTER_WISE" && (
              <div>
                <label className="block text-xs font-bold text-slate uppercase mb-1">Chapter Name</label>
                <input className={inp} placeholder="e.g. Chapter 4: Capital Gains" value={data.chapterName || ""} onChange={e => setData({...data, chapterName: e.target.value})} />
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-lg text-ink-navy dark:text-paper border-b border-line-gray-light dark:border-line-gray-dark pb-2">Grading & Rules</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate uppercase mb-1">Duration (Mins)</label>
                <input type="number" className={inp} value={data.durationMinutes} onChange={e => setData({...data, durationMinutes: parseInt(e.target.value) || 0})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate uppercase mb-1">Total Marks</label>
                <input type="number" className={inp} value={data.totalMarks} onChange={e => setData({...data, totalMarks: parseInt(e.target.value) || 0})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate uppercase mb-1">Passing Marks</label>
                <input type="number" className={inp} value={data.passingMarks} onChange={e => setData({...data, passingMarks: parseInt(e.target.value) || 0})} />
              </div>
            </div>
            <div className="p-4 bg-line-gray-light dark:bg-line-gray-dark/50 rounded-xl space-y-3 mt-4">
              <label className="flex items-center gap-3 cursor-pointer text-sm font-semibold text-ink-navy dark:text-paper">
                <input type="checkbox" checked={data.shuffleQuestions} onChange={e => setData({...data, shuffleQuestions: e.target.checked})} className="w-4 h-4 text-primary-gold rounded border-slate" />
                Shuffle Questions
              </label>
              <label className="flex items-center gap-3 cursor-pointer text-sm font-semibold text-ink-navy dark:text-paper">
                <input type="checkbox" checked={data.shuffleOptions} onChange={e => setData({...data, shuffleOptions: e.target.checked})} className="w-4 h-4 text-primary-gold rounded border-slate" />
                Shuffle Options
              </label>
            </div>
          </div>
        </div>
      )}

      {activeTab === "cases" && (
        <CaseScenarioStudio data={data} setData={setData} inp={inp} />
      )}

      {activeTab === "questions" && (
        <QuestionsStudio data={data} setData={setData} inp={inp} />
      )}
    </div>
  );
}

function CaseScenarioStudio({ data, setData, inp }: any) {
  const cases = data.case_scenarios || [];

  function addCase() {
    setData({
      ...data, 
      case_scenarios: [...cases, { id: `cs-temp-${Date.now()}`, narrative: "" }]
    });
  }

  function updateCase(idx: number, text: string) {
    const newCases = [...cases];
    newCases[idx].narrative = text;
    setData({ ...data, case_scenarios: newCases });
  }

  function deleteCase(idx: number) {
    const newCases = [...cases];
    newCases.splice(idx, 1);
    setData({ ...data, case_scenarios: newCases });
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-sm text-slate dark:text-paper/70">Create multi-paragraph case scenarios that questions can link to.</p>
        <button onClick={addCase} className="flex items-center gap-2 bg-ink-navy dark:bg-paper text-white dark:text-ink-navy px-4 py-2 rounded-lg font-bold text-sm">
          <Plus className="w-4 h-4" /> Add Scenario
        </button>
      </div>

      <div className="space-y-6">
        {cases.map((c: any, idx: number) => (
          <div key={c.id} className="bg-white dark:bg-line-gray-dark/30 border border-line-gray-light dark:border-line-gray-dark rounded-xl p-4">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-bold text-primary-gold uppercase text-xs tracking-wider">Scenario #{idx + 1}</h4>
              <button onClick={() => deleteCase(idx)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <textarea 
              rows={5} 
              className={inp} 
              placeholder="Paste the full case study text here..."
              value={c.narrative} 
              onChange={e => updateCase(idx, e.target.value)}
            />
            <p className="text-xs text-slate mt-2">ID: <span className="font-mono bg-slate/10 px-1 rounded">{c.id}</span> (Link questions to this ID)</p>
          </div>
        ))}
        {cases.length === 0 && (
          <div className="text-center py-12 border-2 border-dashed border-line-gray-light dark:border-line-gray-dark rounded-2xl">
            <p className="text-slate font-semibold mb-2">No case scenarios created</p>
            <button onClick={addCase} className="text-primary-gold hover:underline font-semibold text-sm">Create your first scenario</button>
          </div>
        )}
      </div>
    </div>
  );
}

function QuestionsStudio({ data, setData, inp }: any) {
  // Simplistic representation for questions studio to keep file manageable
  // Real implementation would have full CRUD for sections/questions and Bulk Upload
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-slate dark:text-paper/70">Manage Sections and Questions for this paper.</p>
        <button className="flex items-center gap-2 bg-primary-gold text-ink-navy px-4 py-2 rounded-lg font-bold text-sm">
          <Upload className="w-4 h-4" /> CSV / JSON Upload
        </button>
      </div>
      
      <div className="text-center py-12 border-2 border-dashed border-line-gray-light dark:border-line-gray-dark rounded-2xl">
        <p className="text-slate font-semibold mb-2">Manual Question Editor & Bulk Uploader</p>
        <p className="text-xs text-slate/70">Connects to Case Scenarios created in the previous tab.</p>
        <p className="text-xs text-slate/70 mt-2">Will be fully integrated with `bulk_upload` parser.</p>
      </div>
    </div>
  );
}
