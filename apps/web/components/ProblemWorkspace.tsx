"use client";

import { useRef, useCallback } from "react";
import Editor, { EditorRef } from "./Editor";
import RightSideHeader from "./RightSideHeader";
import RightSideTerminal from "./RightSideTerminal";
import { SubmissionProvider, useSubmission } from "./SubmissionContext";

interface ProblemWorkspaceProps {
  problemId: string;
  starterCode?: string;
}

function WorkspaceContent({ problemId, starterCode }: ProblemWorkspaceProps) {
  const editorRef = useRef<EditorRef>(null);
  const { submitCode } = useSubmission();

  const handleRun = useCallback(() => {
    const code = editorRef.current?.getCode();
    if (code) {
      submitCode(problemId, code);
    }
  }, [problemId, submitCode]);

  const handleSubmit = useCallback(() => {
    const code = editorRef.current?.getCode();
    if (code) {
      submitCode(problemId, code);
    }
  }, [problemId, submitCode]);

  return (
    <div className="w-1/2 flex flex-col bg-zinc-950">
      <RightSideHeader onRun={handleRun} onSubmit={handleSubmit} />
      <Editor ref={editorRef} starterCode={starterCode} />
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
