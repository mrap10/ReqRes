"use client";

import { useRef, useCallback } from "react";
import Editor, { EditorRef } from "./Editor";
import RightSideHeader from "./RightSideHeader";
import RightSideTerminal from "./RightSideTerminal";
import { SubmissionProvider, useSubmission } from "./SubmissionContext";
import { useAuth } from "@/lib/providers/AuthProvider";
import { useRouter } from "next/navigation";

interface ProblemWorkspaceProps {
  problemId: string;
  starterCode?: string;
}

function WorkspaceContent({ problemId, starterCode }: ProblemWorkspaceProps) {
  const editorRef = useRef<EditorRef>(null);
  const { submitCode } = useSubmission();
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const handleRun = useCallback(() => {
    if (!isAuthenticated) {
      router.push(`/signin?redirectTo=/problems/${problemId}`);
      return;
    }

    const code = editorRef.current?.getCode();
    if (code) {
      submitCode(problemId, code);
    }
  }, [problemId, submitCode, isAuthenticated, router]);

  const handleSubmit = useCallback(() => {
    if (!isAuthenticated) {
      router.push(`/signin?redirectTo=/problems/${problemId}`);
      return;
    }

    const code = editorRef.current?.getCode();
    if (code) {
      submitCode(problemId, code);
    }
  }, [problemId, submitCode, isAuthenticated, router]);

  return (
    <div className="w-1/2 flex flex-col bg-zinc-950">
      <RightSideHeader onRun={handleRun} onSubmit={handleSubmit} />
      <div className="flex-1 relative overflow-hidden">
        <Editor ref={editorRef} starterCode={starterCode} />
      </div>
      <RightSideTerminal />
    </div>
  );
}

export default function ProblemWorkspace({ problemId, starterCode }: ProblemWorkspaceProps) {
  return (
    <SubmissionProvider problemId={problemId}>
      <WorkspaceContent problemId={problemId} starterCode={starterCode} />
    </SubmissionProvider>
  );
}
