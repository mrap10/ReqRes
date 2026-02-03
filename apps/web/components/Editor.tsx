"use client";

import MonacoEditor from "@monaco-editor/react";
import { useRef, useImperativeHandle, forwardRef } from "react";
import type { editor } from "monaco-editor";

interface EditorProps {
  starterCode?: string | StarterCodeFormat;
}

export interface EditorRef {
  getCode: () => string;
  resetCode: () => void;
}

interface CodeFile {
  filename: string;
  content: string;
}

type StarterCodeFormat = CodeFile[] | CodeFile | { content: string };

function extractCode(data: string | StarterCodeFormat | undefined): string {
  if (!data) return "";

  if (typeof data === "string") {
    try {
      const parsed: unknown = JSON.parse(data);
      return extractCode(parsed as StarterCodeFormat);
    } catch {
      return data.replace(/\\n/g, "\n").replace(/\\t/g, "\t");
    }
  }

  if (Array.isArray(data) && data.length > 0 && data[0] && "content" in data[0]) {
    // unescaping the newlines and tabs
    return data[0].content.replace(/\\n/g, "\n").replace(/\\t/g, "\t");
  }

  if (typeof data === "object" && "content" in data && data !== null) {
    return data.content.replace(/\\n/g, "\n").replace(/\\t/g, "\t");
  }

  return "";
}

const Editor = forwardRef<EditorRef, EditorProps>(function Editor({ starterCode }, ref) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const initialCode = extractCode(starterCode);

  useImperativeHandle(ref, () => ({
    getCode: () => {
      return editorRef.current?.getValue() || "";
    },
    resetCode: () => {
      if (editorRef.current && initialCode) {
        editorRef.current.setValue(initialCode);
      }
    },
  }));

  function handleEditorDidMount(editorInstance: editor.IStandaloneCodeEditor): void {
    editorRef.current = editorInstance;
    editorInstance.focus();
  }

  return (
    <MonacoEditor
      height="100%"
      defaultLanguage="javascript"
      value={initialCode}
      onMount={handleEditorDidMount}
      theme="vs-dark"
      options={{
        fontSize: 14,
        minimap: { enabled: false },
        automaticLayout: true,
        scrollBeyondLastLine: false,
        lineNumbers: "on",
        roundedSelection: false,
        cursorStyle: "line",
        wordWrap: "on",
        wrappingIndent: "indent",
        formatOnPaste: true,
        formatOnType: true,
        autoClosingBrackets: "always",
        autoClosingQuotes: "always",
        suggestOnTriggerCharacters: true,
        quickSuggestions: {
          other: true,
          comments: false,
          strings: false,
        },
        tabSize: 2,
        insertSpaces: true,
        folding: true,
        renderLineHighlight: "all",
        selectOnLineNumbers: true,
        matchBrackets: "always",
      }}
    />
  );
});

export default Editor;
