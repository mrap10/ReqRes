"use client";

import AdminSidebar from "@/components/admin-components/AdminSidebar";
import ConfigurationSection from "@/components/admin-components/ConfigurationSection";
import ContentSection from "@/components/admin-components/ContentSection";
import DetailsSection from "@/components/admin-components/DetailsSection";
import ExamplesSection from "@/components/admin-components/ExamplesSection";
import JsonPreviewModal from "@/components/admin-components/JsonPreviewModal";
import MetadataSection from "@/components/admin-components/MetaDataSection";
import PageHeader from "@/components/admin-components/PageHeader";
import TestEnvironmentSection from "@/components/admin-components/TestEnvironmentSection";
import { useProblemForm } from "@/lib/hooks/useProblemForm";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function AddProblemsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const editId = searchParams.get("edit");

  const [showJsonPreview, setShowJsonPreview] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    formData,
    isSubmitting,
    isLoadingProblem,
    isEditMode,
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
  } = useProblemForm(editId);

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
      setSuccessMessage(
        isEditMode ? "Problem updated successfully!" : "Problem created successfully!"
      );
      setTimeout(() => {
        if (isEditMode) {
          router.push("/problem");
        } else {
          resetForm();
        }
        setSuccessMessage(null);
      }, 1500);
    }
  };

  if (isLoadingProblem) {
    return (
      <div className="bg-zinc-950 min-h-screen text-slate-200 font-sans flex">
        <AdminSidebar />
        <main className="flex-1 ml-16 lg:ml-64 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
        </main>
      </div>
    );
  }

  return (
    <div className="bg-zinc-950 min-h-screen text-slate-200 font-sans selection:bg-indigo-500/30 selection:text-indigo-200 flex">
      <AdminSidebar />
      <main className="flex-1 ml-16 lg:ml-64 p-6 lg:p-10 max-w-400">
        <PageHeader
          showJsonPreview={showJsonPreview}
          setShowJsonPreview={setShowJsonPreview}
          onSave={handleSave}
          isSubmitting={isSubmitting}
          isEditMode={isEditMode}
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
            <ExamplesSection formData={formData} onFieldChange={updateField} />
          </div>
        </div>

        {showJsonPreview && (
          <JsonPreviewModal formData={formData} onClose={() => setShowJsonPreview(false)} />
        )}
      </main>
    </div>
  );
}
