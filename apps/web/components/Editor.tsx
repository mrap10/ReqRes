"use client";

import MonacoEditor from "@monaco-editor/react";
import { useRef } from "react";
import type { editor, IKeyboardEvent } from "monaco-editor";

interface EditorProps {
  starterCode?: string;
}

function getEditableRange(code: string): { startLineNumber: number; endLineNumber: number } | null {
  const lines = code.split("\n");
  const markerLine = lines.findIndex((line) => line.includes("// Your code here"));

  return {
    startLineNumber: markerLine + 2,
    endLineNumber: lines.length,
  };
}

export default function Editor({ starterCode }: EditorProps) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  function handleEditorDidMount(
    editorInstance: editor.IStandaloneCodeEditor,
    monaco: typeof import("monaco-editor")
  ): void {
    editorRef.current = editorInstance;

    const model = editorInstance.getModel();
    if (!model) {
      return;
    }

    const { startLineNumber, endLineNumber } = getEditableRange(starterCode || "") || {};

    const decorations = [
      {
        range: new monaco.Range(1, 1, startLineNumber! - 1, 1),
        options: {
          isWholeLine: true,
          className: "read-only-line",
        },
      },
    ];

    model.deltaDecorations([], decorations);

    editorInstance.onDidChangeCursorPosition((e: editor.ICursorPositionChangedEvent) => {
      const position = e.position;
      if (!position) return;

      if (position.lineNumber < startLineNumber! || position.lineNumber > endLineNumber!) {
        editorInstance.setPosition({ lineNumber: startLineNumber!, column: 1 });
      }
    });

    editorInstance.onDidAttemptReadOnlyEdit(() => {
      editorInstance.setPosition({ lineNumber: startLineNumber!, column: 1 });
    });

    editorInstance.onKeyDown((e: IKeyboardEvent) => {
      const position = editorInstance.getPosition();
      if (!position) return;
      if (position.lineNumber < startLineNumber! || position.lineNumber > endLineNumber!) {
        e.preventDefault();
        e.stopPropagation();
        editorInstance.setPosition({ lineNumber: startLineNumber!, column: 1 });
      }
    });

    editorInstance.onDidPaste(() => {
      const position = editorInstance.getPosition();
      if (!position) return;
      if (position.lineNumber < startLineNumber! || position.lineNumber > endLineNumber!) {
        editorInstance.executeEdits("", []);
      }
    });
  }

  return (
    <MonacoEditor
      height="100%"
      defaultLanguage="javascript"
      value={starterCode}
      onMount={handleEditorDidMount}
      theme="vs-dark"
      options={{
        fontSize: 14,
        minimap: { enabled: false },
        automaticLayout: true,
        scrollBeyondLastLine: false,
      }}
    />
  );
}
