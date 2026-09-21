import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Bot, Send, Sparkles, User } from 'lucide-react';
import { PanelHeader } from '../../layouts/AppShell.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { careerAssistant } from '../../services/aiService.js';
import { cn } from '../../utils/cn.js';

const SUGGESTED_PROMPTS = [
  'I want to become an Operations Manager.',
  'What is missing from my profile?',
  'Is my resume good enough?',
  'What should I learn next?',
];

function Bubble({ role, children }) {
  const isUser = role === 'user';
  return (
    <div className={cn('flex gap-3', isUser && 'flex-row-reverse')}>
      <span
        className={cn(
          'grid h-8 w-8 shrink-0 place-items-center rounded-full',
          isUser ? 'bg-ink-800 text-white' : 'bg-btn-grad text-white shadow-blue'
        )}
      >
        {isUser ? <User className="h-4 w-4" aria-hidden /> : <Bot className="h-4 w-4" aria-hidden />}
      </span>
      <div
        className={cn(
          'max-w-[80%] rounded-xl px-4 py-3 text-small leading-relaxed',
          isUser ? 'bg-ink-800 text-white' : 'border border-line bg-white text-slate-700'
        )}
      >
        {children}
      </div>
    </div>
  );
}

/**
 * Demo AI Career Assistant. There is no backend model behind this yet —
 * `careerAssistant()` in aiService.js is a deterministic mock that reads
 * the signed-in user's real profile. The chat is structured so a future
 * backend endpoint can replace that one function call without touching
 * this component.
 */
export default function Assistant() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: `Hi ${user?.name?.split(' ')[0] || ''}. Tell me a role you're aiming for, or ask what's missing from your profile, and I'll compare it with what's on file.`,
    },
  ]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, thinking]);

  const send = (text) => {
    const value = (text ?? input).trim();
    if (!value) return;
    setMessages((m) => [...m, { role: 'user', text: value }]);
    setInput('');
    setThinking(true);
    // Simulated latency so the response doesn't feel like a lookup table.
    setTimeout(() => {
      const { reply, actions } = careerAssistant(value, user);
      setMessages((m) => [...m, { role: 'assistant', text: reply, actions }]);
      setThinking(false);
    }, 600);
  };

  return (
    <>
      <PanelHeader
        title="AI Career Assistant"
        description="A demo assistant that reasons over your current profile — no live model is connected yet."
      />

      <div className="tile flex h-[560px] flex-col overflow-hidden p-0">
        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          {messages.map((m, i) => (
            <div key={i} className="space-y-3">
              <Bubble role={m.role}>{m.text}</Bubble>
              {m.actions && (
                <div className="ml-11 flex flex-wrap gap-2">
                  {m.actions.map((a) => (
                    <Link
                      key={a.label}
                      to={a.to}
                      className="inline-flex items-center gap-1.5 rounded-full border border-line bg-paper px-3 py-1.5 text-caption font-semibold text-ink hover:border-azure-200 hover:bg-azure-50 hover:text-azure-700"
                    >
                      <Sparkles className="h-3 w-3 text-azure" aria-hidden />
                      {a.label}
                      <ArrowUpRight className="h-3 w-3" aria-hidden />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
          {thinking && (
            <Bubble role="assistant">
              <span className="inline-flex gap-1">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-azure-300" />
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-azure-300 [animation-delay:150ms]" />
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-azure-300 [animation-delay:300ms]" />
              </span>
            </Bubble>
          )}
          <div ref={endRef} />
        </div>

        <div className="border-t border-line p-4">
          <div className="flex flex-wrap gap-2 pb-3">
            {SUGGESTED_PROMPTS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => send(p)}
                className="rounded-full border border-line px-3 py-1.5 text-caption font-medium text-slate-600 hover:border-azure-200 hover:bg-azure-50 hover:text-azure-700"
              >
                {p}
              </button>
            ))}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
            className="flex items-center gap-2"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about a role, your profile, or what to learn next…"
              className="h-11 flex-1 rounded-lg border border-line bg-white px-3.5 text-small outline-none focus:border-azure-300 focus:ring-2 focus:ring-azure-100"
            />
            <button
              type="submit"
              className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-btn-grad text-white shadow-blue hover:shadow-blue-lg"
              aria-label="Send"
            >
              <Send className="h-4.5 w-4.5" aria-hidden />
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
