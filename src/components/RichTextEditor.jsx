import { useEffect, useRef } from "react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
} from "lucide-react";

const TOOLBAR = [
  { cmd: "bold", icon: Bold, title: "Bold" },
  { cmd: "italic", icon: Italic, title: "Italic" },
  { cmd: "underline", icon: Underline, title: "Underline" },
  { cmd: "strikeThrough", icon: Strikethrough, title: "Strikethrough" },
  { cmd: "insertUnorderedList", icon: List, title: "Bullet list" },
  { cmd: "insertOrderedList", icon: ListOrdered, title: "Numbered list" },
];

function RichTextEditor({
  value = "",
  onChange,
  placeholder = "Write content...",
  minHeight = "120px",
}) {
  const editorRef = useRef(null);

  useEffect(() => {
    if (
      editorRef.current &&
      editorRef.current.innerHTML !== value &&
      document.activeElement !== editorRef.current
    ) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const emit = () => {
    if (editorRef.current && onChange) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const exec = (cmd) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, null);
    emit();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
    emit();
  };

  return (
    <div className="w-full bg-white rounded-lg border border-slate-200 focus-within:border-[#00A86B] transition-colors overflow-hidden">
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-slate-200 bg-slate-50">
        {TOOLBAR.map(({ cmd, icon: Icon, title }) => (
          <button
            key={cmd}
            type="button"
            title={title}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => exec(cmd)}
            className="p-1.5 rounded-md text-slate-600 hover:text-[#00A86B] hover:bg-white transition-colors"
          >
            <Icon className="w-4 h-4" />
          </button>
        ))}
      </div>
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-multiline="true"
        data-placeholder={placeholder}
        onInput={emit}
        onBlur={emit}
        onPaste={handlePaste}
        className="rich-text-editor w-full px-3 py-2 text-sm text-slate-700 leading-relaxed"
        style={{ minHeight }}
      />
    </div>
  );
}

export default RichTextEditor;
