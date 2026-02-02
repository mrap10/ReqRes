"use client";

import AdminSidebar from "@/components/admin-components/AdminSidebar";
import ConfigurationSection from "@/components/admin-components/ConfigurationSection";
import ContentSection from "@/components/admin-components/ContentSection";
import DetailsSection from "@/components/admin-components/DetailsSection";
import JsonPreviewModal from "@/components/admin-components/JsonPreviewModal";
import MetadataSection from "@/components/admin-components/MetaDataSection";
import PageHeader from "@/components/admin-components/PageHeader";
import TestEnvironmentSection from "@/components/admin-components/TestEnvironmentSection";
import { useProblemForm } from "@/lib/hooks/useProblemForm";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { useState } from "react";

export default function AddProblemsPage() {
  const [showJsonPreview, setShowJsonPreview] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    formData,
    isSubmitting,
    error,
    updateField,
    handleTitleChange,
    updateTestConfig,
    addToList,
    removeFromList,
    updateStarterCode,
    resetForm,
    submitForm,
    setError,
  } = useProblemForm();

  const handleSave = async () => {
    if (!formData.title.trim()) {
      setError("Title is required");
      return;
    }
    if (!formData.shortDescription.trim()) {
      setError("Short description is required");
      return;
    }
    if (!formData.description.trim()) {
      setError("Full description is required");
      return;
    }
    if (!formData.instructions.trim()) {
      setError("Instructions are required");
      return;
    }

    const success = await submitForm();
    if (success) {
      setSuccessMessage("Problem created successfully!");
      setTimeout(() => {
        resetForm();
        setSuccessMessage(null);
      }, 2000);
    }
  };

  return (
    <div className="bg-zinc-950 min-h-screen text-slate-200 font-sans selection:bg-indigo-500/30 selection:text-indigo-200 flex">
      <AdminSidebar />
      <main className="flex-1 ml-16 lg:ml-64 p-6 lg:p-10 max-w-[1600px]">
        <PageHeader
          showJsonPreview={showJsonPreview}
          setShowJsonPreview={setShowJsonPreview}
          onSave={handleSave}
          isSubmitting={isSubmitting}
        />

        {error && (
          <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
            <p className="text-rose-400 text-sm">{error}</p>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
            <p className="text-emerald-400 text-sm">{successMessage}</p>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <MetadataSection
              formData={formData}
              onTitleChange={handleTitleChange}
              onFieldChange={updateField}
            />
            <ContentSection
              formData={formData}
              onFieldChange={updateField}
              onStarterCodeChange={updateStarterCode}
            />
          </div>

          <div className="space-y-8">
            <ConfigurationSection formData={formData} onFieldChange={updateField} />
            <DetailsSection
              formData={formData}
              onAddToList={addToList}
              onRemoveFromList={removeFromList}
            />
            <TestEnvironmentSection
              testConfig={formData.testConfig}
              onTestConfigChange={updateTestConfig}
            />
          </div>
        </div>

        {showJsonPreview && (
          <JsonPreviewModal formData={formData} onClose={() => setShowJsonPreview(false)} />
        )}
      </main>
    </div>
  );
}
