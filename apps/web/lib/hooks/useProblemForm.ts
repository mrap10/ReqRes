"use client";

import { useState, useCallback } from "react";
import {
  ProblemFormData,
  DEFAULT_PROBLEM_FORM,
  generateSlug,
  StarterCodeFile,
} from "@/lib/types/problem-form";

export function useProblemForm(initialData?: Partial<ProblemFormData>) {
  const [formData, setFormData] = useState<ProblemFormData>({
    ...DEFAULT_PROBLEM_FORM,
    ...initialData,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateField = useCallback(
    <K extends keyof ProblemFormData>(field: K, value: ProblemFormData[K]) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const handleTitleChange = useCallback((title: string) => {
    setFormData((prev) => ({
      ...prev,
      title,
      slug: generateSlug(title),
    }));
  }, []);

  const updateTestConfig = useCallback((field: "timeoutMs" | "memoryMb", value: number) => {
    setFormData((prev) => ({
      ...prev,
      testConfig: { ...prev.testConfig, [field]: value },
    }));
  }, []);

  const addToList = useCallback((field: "constraints" | "tags", value: string) => {
    if (!value.trim()) return;
    setFormData((prev) => ({
      ...prev,
      [field]: [...prev[field], value.trim()],
    }));
  }, []);

  const removeFromList = useCallback((field: "constraints" | "tags", index: number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  }, []);

  const updateStarterCode = useCallback((files: StarterCodeFile[]) => {
    setFormData((prev) => ({ ...prev, starterCode: files }));
  }, []);

  const resetForm = useCallback(() => {
    setFormData(DEFAULT_PROBLEM_FORM);
    setError(null);
  }, []);

  const submitForm = useCallback(async (): Promise<boolean> => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/problems`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to create problem");
        return false;
      }

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [formData]);

  return {
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
  };
}
