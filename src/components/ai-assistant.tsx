import { useState } from "react";
import { Bot, Send, Sparkles, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface Msg {
  from: "bot" | "user";
  text: string;
}

const faqs: { q: string; a: string }[] = [
  {
    q: "How long does quotation review take?",
    a: "Standard commercial quotations are triaged within 24 hours and receive a formal decision in 3–5 business days. Power & Energy and Heavy Machinery packages requiring compliance review may take up to 10 business days.",
  },
  {
    q: "How are documents dispatched?",
    a: "Approved contracts are dispatched from contracts@oscorp.com to your registered inbox with a signed PDF and a verification reference such as OSC-QT-90821.",
  },
  {
    q: "How do I onboard as a vendor?",
    a: "Register from the Portal Login panel, complete your company profile, then upload incorporation and compliance documents with your first quotation. Verification typically clears in 48 hours.",
  },
  {
    q: "Why was my account blocked?",
    a: "Accounts are suspended by an Oscorp administrator for policy violations, unverified documents, or payment disputes. Reply to your suspension email with corrected documents to request reinstatement.",
  },
];

function answer(input: string): string {
  const q = input.toLowerCase();
  if (q.includes("block") || q.includes("suspend")) return faqs[3]!.a;
  if (q.includes("onboard") || q.includes("register") || q.includes("vendor")) return faqs[2]!.a;
  if (q.includes("email") || q.includes("dispatch") || q.includes("document")) return faqs[1]!.a;
  if (q.includes("time") || q.includes("long") || q.includes("status") || q.includes("quot"))
    return faqs[0]!.a;
  return "I can help with onboarding, document dispatch, quotation timelines and account status. Try asking about one of those, or track your reference ID from the home page tracker.";
}

export function AiAssistant() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [messages, setMessages] = useState<Msg[]>([
    {
      from: "bot",
      text: "Hello, I'm ORACLE — the Oscorp portal assistant. Ask me about onboarding, document dispatch, or quotation timelines.",
    },
  ]);

  const send = (text: string) => {
    if (!text.trim()) return;
    setMessages((m) => [...m, { from: "user", text }, { from: "bot", text: answer(text) }]);
    setValue("");
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      {open && (
        <div className="flex h-[26rem] w-[min(22rem,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-xl glass-card">
          <div className="flex items-center gap-2 forest-panel px-4 py-3">
            <Sparkles className="size-4 text-emerald-glow" />
            <div className="leading-tight">
              <p className="text-sm font-semibold">ORACLE Assistant</p>
              <p className="text-[11px] opacity-75">Oscorp Portal Support · Online</p>
            </div>
            <button onClick={() => setOpen(false)} className="ml-auto opacity-80 hover:opacity-100">
              <X className="size-4" />
            </button>
          </div>

          <ScrollArea className="flex-1 px-3 py-3">
            <div className="space-y-2.5">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={cn(
                    "max-w-[85%] rounded-lg px-3 py-2 text-sm",
                    m.from === "bot"
                      ? "bg-secondary text-foreground"
                      : "ml-auto bg-primary text-primary-foreground",
                  )}
                >
                  {m.text}
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="border-t border-border/60 p-2">
            <div className="mb-2 flex flex-wrap gap-1.5">
              {faqs.map((f) => (
                <button
                  key={f.q}
                  onClick={() => send(f.q)}
                  className="rounded-full border border-accent/30 bg-accent/8 px-2.5 py-1 text-[11px] text-accent transition-colors hover:bg-accent/15"
                >
                  {f.q}
                </button>
              ))}
            </div>
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                send(value);
              }}
            >
              <Input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Ask about your quotation…"
                className="h-9"
              />
              <Button type="submit" size="icon" className="size-9 shrink-0">
                <Send className="size-4" />
              </Button>
            </form>
          </div>
        </div>
      )}

      <Button
        size="lg"
        className="rounded-full shadow-lg"
        onClick={() => setOpen((v) => !v)}
        aria-label="Open AI assistant"
      >
        <Bot className="size-5" /> {open ? "Close" : "ORACLE AI"}
      </Button>
    </div>
  );
}
