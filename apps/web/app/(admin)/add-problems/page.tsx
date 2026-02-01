"use client";

import AdminSidebar from "@/components/AdminSidebar";
import { InputGroup, SelectInput, TextArea, TextInput } from "@/components/InputsAdmin";
import ListBuilder from "@/components/ListBuilder";
import { Braces, CheckCircle2, Code2, Eye, FileText, Save, Settings, X } from "lucide-react";
import { useState } from "react";

export default function AddProblemsPage() {
  const [showJsonPreview, setShowJsonPreview] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    difficulty: "EASY",
    track: "ROUTING",
    shortDescription: "",
    description: "",
    instructions: "",
    starterCode: "",
    constraints: [] as string[],
    tags: [] as string[],
    testConfig: {
      timeoutMs: 3000,
      memoryMb: 256,
    },
    isPublished: false,
  });

  const updateField = (field: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleTitleChange = (value: string) => {
    const title = value;
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    setFormData((prev) => ({ ...prev, title, slug }));
  };

  const addConstraint = (value: string) => {
    updateField("constraints", [...formData.constraints, value]);
  };

  const removeConstraint = (index: number) => {
    updateField(
      "constraints",
      formData.constraints.filter((_, i) => i !== index)
    );
  };

  const addTag = (value: string) => {
    updateField("tags", [...formData.tags, value]);
  };

  const removeTag = (index: number) => {
    updateField(
      "tags",
      formData.tags.filter((_, i) => i !== index)
    );
  };

  return (
    <div className="bg-zinc-950 min-h-screen text-slate-200 font-sans selection:bg-indigo-500/30 selection:text-indigo-200 flex">
      <AdminSidebar />
      <main className="flex-1 ml-16 lg:ml-64 p-6 lg:p-10 max-w-[1600px]">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Add New Problem</h1>
            <p className="text-zinc-500 text-sm">Create a new challenge for the users.</p>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <button
              onClick={() => setShowJsonPreview(!showJsonPreview)}
              className="px-4 py-2 flex items-center gap-2 font-medium text-zinc-300 bg-zinc-900 hover:bg-zinc-800 cursor-pointer border border-zinc-800 transition-colors rounded-lg"
            >
              {showJsonPreview ? <Eye className="w-4 h-4" /> : <Braces className="w-4 h-4" />}
              {showJsonPreview ? "Hide JSON" : "Show JSON"}
            </button>

            <button className="px-4 py-2 flex items-center gap-2 font-bold text-white bg-indigo-600 hover:bg-indigo-500 cursor-pointer shadow-lg shadow-indigo-500/20 active:scale-95 transition-colors rounded-lg">
              <Save className="w-4 h-4" />
              Save Problem
            </button>
          </div>
        </header>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-zinc-900/40 border border-white/5 rounded-xl p-6">
              <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-400" />
                Problem Metadata
              </h2>

              <div className="grid gap-6">
                <InputGroup label="Problem Title" required>
                  <TextInput
                    placeholder="e.g. Rate Limiting Middleware"
                    value={formData.title}
                    onchange={handleTitleChange}
                  />
                </InputGroup>

                <div className="grid sm:grid-cols-2 gap-6">
                  <InputGroup
                    label="Slug (Auto-generated)"
                    required
                    description="URL-friendly identifier"
                  >
                    <TextInput
                      placeholder="rate-limiting-middleware"
                      value={formData.slug}
                      onchange={(val) => updateField("slug", val)}
                      className="font-mono text-zinc-400"
                    />
                  </InputGroup>
                  <InputGroup label="Track" required>
                    <SelectInput
                      value={formData.track}
                      onchange={(val) => updateField("track", val)}
                      options={[
                        { label: "Routing & API", value: "ROUTING" },
                        { label: "Middleware", value: "MIDDLEWARE" },
                        { label: "Security", value: "SECURITY" },
                        { label: "Database", value: "DATABASE" },
                      ]}
                    />
                  </InputGroup>
                </div>

                <InputGroup
                  label="Short Description"
                  required
                  description="Appears in the problem list card (max 120 chars)"
                >
                  <TextInput
                    placeholder="Implement a rate limiter to prevent abuse..."
                    value={formData.shortDescription}
                    onchange={(val) => updateField("shortDescription", val)}
                  />
                </InputGroup>
              </div>
            </div>

            <div className="bg-zinc-900/40 border border-white/5 rounded-xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Code2 className="w-5 h-5 text-indigo-400" />
                  Content & Instructions
                </h2>
                <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-1 rounded border border-zinc-700">
                  Markdown Supported
                </span>
              </div>

              <div className="space-y-6">
                <InputGroup label="Full Description" required>
                  <TextArea
                    placeholder="Detailed explanation of the problem context..."
                    value={formData.description}
                    onchange={(val) => updateField("description", val)}
                    rows={3}
                  />
                </InputGroup>

                <InputGroup label="Instructions" required>
                  <TextArea
                    placeholder="### Requirements\n- Step 1...\n- Step 2..."
                    value={formData.instructions}
                    onchange={(val) => updateField("instructions", val)}
                    rows={8}
                  />
                </InputGroup>

                <InputGroup label="Starter Code">
                  <div className="relative">
                    <div className="absolute top-0 right-0 px-2 py-1 text-[10px] text-zinc-500 bg-zinc-950 rounded-bl border-b border-1 border-zinc-800 font-mono">
                      index.js
                    </div>
                    <TextArea
                      value={formData.starterCode}
                      onchange={(val) => updateField("starterCode", val)}
                      rows={10}
                      fontMono
                    />
                  </div>
                </InputGroup>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-zinc-900/40 border border-white/5 rounded-xl p-6">
              <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <Settings className="w-5 h-5 text-indigo-400" />
                Configuration
              </h2>

              <div className="space-y-6">
                <InputGroup label="Difficulty" required>
                  <div className="grid grid-cols-3 gap-2">
                    {["EASY", "MEDIUM", "HARD"].map((level) => (
                      <button
                        key={level}
                        onClick={() => updateField("difficulty", level)}
                        className={`py-2 rounded-lg text-xs font-bold border transition-all ${
                          formData.difficulty === level
                            ? level === "EASY"
                              ? "bg-emerald-500/20 border-emerald-500 text-emerald-400"
                              : level === "MEDIUM"
                                ? "bg-amber-500/20 border-amber-500 text-amber-400"
                                : "bg-rose-500/20 border-rose-500 text-rose-400"
                            : "bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-700"
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </InputGroup>
                <InputGroup label="Publish Status">
                  <div
                    onClick={() => updateField("isPublished", !formData.isPublished)}
                    className={`cursor-pointer flex items-center justify-between p-3 rounded-lg transition-all ${formData.isPublished ? "bg-emerald-500/10 border-emerald-500/30" : "bg-zinc-950 border-zinc-800"}`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-4 rounded-full relative transition-colors ${formData.isPublished ? "bg-emerald-500" : "bg-zinc-700"}`}
                      >
                        <div
                          className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${formData.isPublished ? "left-4.5" : "left-0.5"}`}
                          style={{ left: formData.isPublished ? "18px" : "2px" }}
                        />
                      </div>
                      <span
                        className={`text-sm font-medium ${formData.isPublished ? "text-white" : "text-zinc-500"}`}
                      >
                        {formData.isPublished ? "Published" : "Draft"}
                      </span>
                    </div>
                    {formData.isPublished && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                  </div>
                </InputGroup>
              </div>
            </div>
            <div className="bg-zinc-900/40 border border-white/5 rounded-xl p-6">
              <h2 className="text-lg font-bold text-white mb-6">Details</h2>
              <div className="space-y-6">
                <InputGroup
                  label="Constraints"
                  description="Add technical constraints (e.g. 'No external libs')"
                >
                  <ListBuilder
                    items={formData.constraints}
                    onAdd={addConstraint}
                    onRemove={removeConstraint}
                    placeholder="Add constraint..."
                  />
                </InputGroup>
                <InputGroup label="Tags" description="Keywords for search filtering">
                  <ListBuilder
                    items={formData.tags}
                    onAdd={addTag}
                    onRemove={removeTag}
                    placeholder="Add tag..."
                  />
                </InputGroup>
              </div>
            </div>
            <div className="bg-zinc-900/40 border border-white/5 rounded-xl p-6">
              <h2 className="text-lg font-bold text-white mb-6">Test Environment</h2>
              <div>
                <InputGroup label="Timeout (ms)">
                  <TextInput
                    value={formData.testConfig.timeoutMs.toString()}
                    onchange={(val) => ({
                      ...formData,
                      testConfig: { ...formData.testConfig, timeoutMs: parseInt(val) || 0 },
                    })}
                  />
                </InputGroup>
                <InputGroup label="Memory Limit (MB)">
                  <TextInput
                    value={formData.testConfig.memoryMb.toString()}
                    onchange={(val) => ({
                      ...formData,
                      testConfig: { ...formData.testConfig, memoryMb: parseInt(val) || 0 },
                    })}
                  />
                </InputGroup>
              </div>
            </div>
          </div>
        </div>

        {showJsonPreview && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-zinc-900 border border-white/10 rounded-xl w-full max-w-4xl max-h-[80vh] flex flex-col shadow-2xl">
              <div className="flex justify-between items-center p-4 border-b border-white/5">
                <h3 className="font-bold text-white flex items-center gap-2">
                  <Braces className="w-4 h-4 text-indigo-400" /> JSON Preview
                </h3>
                <button
                  onClick={() => setShowJsonPreview(false)}
                  className="text-zinc-400 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-auto p-4 bg-zinc-950 font-mono text-xs text-emerald-400">
                <pre>formData here</pre>
              </div>
              <div className="p-4 border-t border-white/5 bg-zinc-900 flex justify-end">
                <button
                  onClick={() => alert("Copied!")}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer text-sm font-bold rounded-lg"
                >
                  Copy & Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
