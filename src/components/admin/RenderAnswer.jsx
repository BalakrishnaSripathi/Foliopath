import { Code } from "lucide-react";

const FENCE = "\u0060\u0060\u0060";

function parseInline(text) {
  if (!text) return [text];
  const parts = [];
  const re = /\*\*(.+?)\*\*|`([^`]+)`/g;
  let last = 0;
  let m;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push({ type: "plain", body: text.slice(last, m.index) });
    if (m[1] !== undefined) parts.push({ type: "bold", body: m[1] });
    else if (m[2] !== undefined) parts.push({ type: "inline", body: m[2] });
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push({ type: "plain", body: text.slice(last) });
  return parts.length ? parts : [{ type: "plain", body: text }];
}

function InlineText({ text }) {
  const parts = parseInline(text);
  return (
    <>
      {parts.map((p, i) => {
        if (p.type === "bold") return <strong key={i} className="font-bold text-[#0B2545]">{p.body}</strong>;
        if (p.type === "inline") {
          return (
            <code key={i} className="px-1.5 py-0.5 bg-slate-100 text-rose-600 rounded text-xs font-mono">
              {p.body}
            </code>
          );
        }
        return <span key={i}>{p.body}</span>;
      })}
    </>
  );
}

export default function RenderAnswer({ content }) {
  if (!content) return null;

  const parts = [];
  const blockRe = new RegExp(FENCE + "(\\w*)\\n?([\\s\\S]*?)" + FENCE, "g");
  let lastIndex = 0;
  let m;

  while ((m = blockRe.exec(content)) !== null) {
    if (m.index > lastIndex) {
      parts.push({ type: "text", body: content.slice(lastIndex, m.index) });
    }
    parts.push({ type: "codeblock", lang: m[1] || "", body: (m[2] || "").trimEnd() });
    lastIndex = m.index + m[0].length;
  }

  const tail = content.slice(lastIndex);
  const inlineRe = /`([^`]+)`|\*\*[^*]+\*\*/g;
  let tLast = 0;
  while ((m = inlineRe.exec(tail)) !== null) {
    if (m.index > tLast) {
      parts.push({ type: "text", body: tail.slice(tLast, m.index) });
    }
    parts.push({ type: "text", body: m[0] });
    tLast = m.index + m[0].length;
  }
  if (tLast < tail.length) {
    parts.push({ type: "text", body: tail.slice(tLast) });
  }

  if (parts.length === 0) parts.push({ type: "text", body: content });

  return (
    <div className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed space-y-3">
      {parts.map((p, i) => {
        if (p.type === "codeblock") {
          return (
            <div key={i}>
              {p.lang && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0a1628] rounded-t-xl border border-slate-700 border-b-0">
                  <Code className="w-3 h-3 text-slate-400" />
                  <span className="text-[10px] text-slate-400 font-mono">{p.lang}</span>
                </div>
              )}
              <pre className={`${p.lang ? "rounded-t-none" : "rounded-xl"} bg-[#0a1628] text-green-400 border border-slate-700 ${p.lang ? "border-t-0" : ""} p-3 overflow-x-auto text-xs font-mono leading-relaxed`}>
                <code>{p.body}</code>
              </pre>
            </div>
          );
        }
        return <InlineText key={i} text={p.body} />;
      })}
    </div>
  );
}
