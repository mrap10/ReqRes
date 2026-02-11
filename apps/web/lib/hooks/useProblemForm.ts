"use client";

import { useState, useCallback, useEffect } from "react";
import {
  ProblemFormData,
  DEFAULT_PROBLEM_FORM,
  generateSlug,
  StarterCodeFile,
} from "@/lib/types/problem-form";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export function useProblemForm(editId?: string | null) {
  const [formData, setFormData] = useState<ProblemFormData>(DEFAULT_PROBLEM_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingProblem, setIsLoadingProblem] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isEditMode = !!editId;

  useEffect(() => {
    if (!editId) return;
    setIsLoadingProblem(true);
    setError(null);

    fetch(`${API_BASE_URL}/problems/admin/${editId}`, { credentials: "include" })
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to load problem");
        const { problem } = await res.json();

        let starterCode: StarterCodeFile[] = [{ filename: "index.js", content: "" }];
        if (problem.starterCode) {
          try {
            starterCode = JSON.parse(problem.starterCode);
          } catch {
            starterCode = [{ filename: "index.js", content: problem.starterCode }];
          }
        }

        setFormData({
          title: problem.title || "",
          slug: problem.slug || "",
          difficulty: problem.difficulty || "EASY",
          track: problem.track || "ROUTING",
          shortDescription: problem.shortDescription || "",
          description: problem.description || "",
          instructions: problem.instructions || "",
          starterCode,
          constraints: problem.constraints || [],
          tags: problem.tags || [],
          testConfig: {
            timeoutMs: problem.testConfig?.timeoutMs || 3000,
            memoryMb: problem.testConfig?.memoryMb || 256,
          },
          examples: problem.examples ? JSON.stringify(problem.examples, null, 2) : "",
          isPublished: problem.isPublished ?? false,
        });
      })
      .catch((err) => setError(err.message))
      .finally(() => setIsLoadingProblem(false));
  }, [editId]);

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
      const url = isEditMode ? `${API_BASE_URL}/problems/${editId}` : `${API_BASE_URL}/problems`;
      const method = isEditMode ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || `Failed to ${isEditMode ? "update" : "create"} problem`);
        return false;
      }

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, isEditMode, editId]);

  return {
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
  };
}
