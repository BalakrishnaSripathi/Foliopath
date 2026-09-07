import Editor, { loader } from "@monaco-editor/react";
import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import EditorWorker from "../workers/editor.worker?worker";
import "monaco-editor/esm/vs/languages/definitions/java/register.js";
import "monaco-editor/esm/vs/languages/definitions/python/register.js";
import "monaco-editor/esm/vs/languages/definitions/javascript/register.js";

// Bundle Monaco locally (no CDN). Java/Python/JavaScript highlighting is
// handled on the main thread by Monarch tokenizers, so only the default
// editor web worker is needed for UX/interactions.
self.MonacoEnvironment = {
  getWorker() {
    return new EditorWorker();
  },
};

loader.config({ monaco });

export default function CodeEditor({ value, onChange, language, readOnly, height = 320 }) {
  return (
    <Editor
      height={height}
      language={language}
      value={value}
      onChange={onChange}
      theme="vs-dark"
      loading={
        <div className="h-full flex items-center justify-center bg-[#0B2545]">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#00A86B]" />
        </div>
      }
      options={{
        readOnly,
        minimap: { enabled: false },
        fontSize: 14,
        fontFamily: "'JetBrains Mono', Consolas, 'Courier New', monospace",
        automaticLayout: true,
        tabSize: 4,
        insertSpaces: true,
        scrollBeyondLastLine: false,
        renderLineHighlight: "line",
        wordWrap: "on",
        folding: true,
        lineNumbers: "on",
        padding: { top: 12, bottom: 12 },
        scrollbar: { verticalScrollbarSize: 10, horizontalScrollbarSize: 10 },
      }}
    />
  );
}