"use client";

import { FilePlus, Trash2, FileCode } from "lucide-react";
import { useState } from "react";

export interface StarterCodeFile {
  filename: string;
  content: string;
}

interface StarterCodeEditorProps {
  files: StarterCodeFile[];
  onChange: (files: StarterCodeFile[]) => void;
}

export default function StarterCodeEditor({ files, onChange }: StarterCodeEditorProps) {
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [newFileName, setNewFileName] = useState("");
  const [isAddingFile, setIsAddingFile] = useState(false);

  const addFile = () => {
    if (!newFileName.trim()) return;
    const filename = newFileName.trim();

    // Check for duplicate filename
    if (files.some((f) => f.filename === filename)) {
      return;
    }

    onChange([...files, { filename, content: "" }]);
    setActiveFileIndex(files.length);
    setNewFileName("");
    setIsAddingFile(false);
  };

  const removeFile = (index: number) => {
    if (files.length <= 1) return;
    const updated = files.filter((_, i) => i !== index);
    onChange(updated);
    setActiveFileIndex(Math.min(activeFileIndex, updated.length - 1));
  };

  const updateContent = (content: string) => {
    const updated = files.map((file, i) => (i === activeFileIndex ? { ...file, content } : file));
    onChange(updated);
  };

  const updateFilename = (index: number, filename: string) => {
    const updated = files.map((file, i) => (i === index ? { ...file, filename } : file));
    onChange(updated);
  };

  return (
    <div className="border border-zinc-800 rounded-lg overflow-hidden bg-zinc-950">
      <div className="flex items-center gap-1 p-2 bg-zinc-900/50 border-b border-zinc-800 overflow-x-auto">
        {files.map((file, index) => (
          <div
            key={index}
            className={`group flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-mono cursor-pointer transition-colors ${
              activeFileIndex === index
                ? "bg-zinc-800 text-white"
                : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50"
            }`}
            onClick={() => setActiveFileIndex(index)}
          >
            <FileCode className="w-3.5 h-3.5" />
            <input
              type="text"
              value={file.filename}
              onChange={(e) => updateFilename(index, e.target.value)}
              onClick={(e) => e.stopPropagation()}
              className="bg-transparent border-none outline-none w-24 text-inherit"
            />
            {files.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(index);
                }}
                className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-rose-400 transition-opacity"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>
        ))}

        {isAddingFile ? (
          <div className="flex items-center gap-1">
            <input
              type="text"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") addFile();
                if (e.key === "Escape") setIsAddingFile(false);
              }}
              placeholder="filename.js"
              autoFocus
              className="px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-xs text-white font-mono w-32 outline-none focus:border-indigo-500"
            />
            <button onClick={addFile} className="p-1 text-emerald-500 hover:text-emerald-400">
              <FilePlus className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsAddingFile(true)}
            className="flex items-center gap-1 px-2 py-1.5 text-xs text-zinc-500 hover:text-indigo-400 transition-colors"
          >
            <FilePlus className="w-3.5 h-3.5" />
            Add File
          </button>
        )}
      </div>

      <div className="relative">
        <div className="absolute top-2 right-2 px-2 py-1 text-[10px] text-zinc-500 bg-zinc-900 rounded border border-zinc-800 font-mono z-10">
          {files[activeFileIndex]?.filename || "index.js"}
        </div>
        <textarea
          value={files[activeFileIndex]?.content || ""}
          onChange={(e) => updateContent(e.target.value)}
          placeholder="// Write your starter code here..."
          rows={12}
          className="w-full bg-zinc-950 px-4 py-3 pt-10 text-sm text-zinc-300 font-mono focus:outline-none resize-y min-h-[300px]"
        />
      </div>
    </div>
  );
}
