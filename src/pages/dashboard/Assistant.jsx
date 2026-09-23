import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { ArrowUpRight, Compass, MessageCircle, Send, Sparkles, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { careerAssistant, calculateProfileStrength, recommendCourses } from '../../services/aiService.js';
import { ProgressRing } from '../../components/ui/Progress.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { usePrefersReducedMotion } from '../../hooks/useMediaQuery.js';
import { cn } from '../../utils/cn.js';

const SUGGESTED_PROMPTS = [
  'I want to become an Operations Manager.',
  'What is missing from my profile?',
  'Is my resume good enough?',
  'What should I learn next?',
];

const MAX_HISTORY_SENT = 16;
const MAX_TEXT_CHARS = 2000;

const DATA_SOURCES = ['Pricing', 'Courses', 'Higher education', 'Documentation', 'Jobs', 'FAQs'];

const VIEW_TABS = [
  { id: 'chat', label: 'Chat', icon: MessageCircle },
  { id: 'snapshot', label: 'Career snapshot', icon: Compass },
];

// Reused on the orb, the assistant avatar and the thinking indicator so the
// "AI" identity reads as one deliberate accent rather than scattered color.
const AI_GRADIENT = 'bg-[conic-gradient(from_140deg,#6D4AE8,#2B72D4,#8C6DFB,#1D5DB8,#6D4AE8)]';

function strengthTone(score) {
  if (score >= 85) return 'success';
  if (score >= 70) return 'azure';
  if (score >= 50) return 'amber';
  return 'danger';
}

/* ------------------------------------------------------------------ *
 * AI Orb — the one bold, genuinely interactive moment on this page.
 * Real CSS 3D: a perspective-transformed layer tilts toward the pointer,
 * over a rotating conic-gradient core and a glass highlight. Respects
 * prefers-reduced-motion by disabling both the tilt and the spin.
 * ------------------------------------------------------------------ */
function AiOrb({ size = 88, thinking = false, className }) {
  const reduceMotion = usePrefersReducedMotion();
  const ref = useRef(null);
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const rotateX = useTransform(py, [0, 1], [12, -12]);
  const rotateY = useTransform(px, [0, 1], [-12, 12]);

  const handleMove = (e) => {
    if (reduceMotion) return;
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    px.set((e.clientX - rect.left) / rect.width);
    py.set((e.clientY - rect.top) / rect.height);
  };
  const reset = () => {
    px.set(0.5);
    py.set(0.5);
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      style={{ width: size, height: size, perspective: 700 }}
      className={cn('relative shrink-0', className)}
    >
      <motion.div
        style={reduceMotion ? undefined : { rotateX, rotateY }}
        transition={{ type: 'spring', stiffness: 120, damping: 14 }}
        className="relative h-full w-full [transform-style:preserve-3d]"
      >
        <div
          className={cn(
            'absolute inset-0 rounded-full shadow-glow',
            AI_GRADIENT,
            !reduceMotion && 'animate-[spin_10s_linear_infinite]'
          )}
        />
        <div className="absolute inset-[3px] rounded-full bg-gradient-to-br from-white/40 via-white/5 to-transparent" />
        <div className="absolute inset-[3px] rounded-full bg-gradient-to-tl from-black/25 via-transparent to-transparent mix-blend-overlay" />
        <div className="absolute inset-[24%] grid place-items-center rounded-full bg-ink-900/85 backdrop-blur-sm">
          <Sparkles className="h-[45%] w-[45%] text-violet-200" aria-hidden />
        </div>
        {thinking && (
          <motion.div
            className="absolute -inset-2 rounded-full border border-violet-300/50"
            animate={{ scale: [1, 1.3, 1], opacity: [0.55, 0, 0.55] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}
      </motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Minimal markdown rendering — the model's replies use **bold** and
 * [label](/path) plus "* " bullet lines (sometimes as real newlines,
 * sometimes inline). Rendered properly instead of showing raw
 * asterisks/brackets, and internal links become real, styled links.
 * ------------------------------------------------------------------ */
function renderInline(text, keyPrefix) {
  const regex = /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g;
  return text
    .split(regex)
    .filter((part) => part !== undefined && part !== '')
    .map((part, i) => {
      const key = `${keyPrefix}-${i}`;
      const bold = part.match(/^\*\*([^*]+)\*\*$/);
      if (bold) {
        return (
          <strong key={key} className="font-semibold text-ink">
            {bold[1]}
          </strong>
        );
      }
      const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (link) {
        const [, label, href] = link;
        const linkClass = 'font-semibold text-violet-600 underline underline-offset-2 hover:text-violet-700';
        return href.startsWith('/') ? (
          <Link key={key} to={href} className={linkClass}>
            {label}
          </Link>
        ) : (
          <a key={key} href={href} target="_blank" rel="noopener noreferrer" className={linkClass}>
            {label}
          </a>
        );
      }
      return <span key={key}>{part}</span>;
    });
}

/** Splits a paragraph on inline " * " bullet markers when the model didn't
 * emit real newlines. Requires an intro plus at least two bullets, and
 * never matches "**" (bold), so it only fires when genuinely confident. */
function splitInlineBullets(text) {
  const parts = text.split(/\s\*(?!\*)\s+/);
  if (parts.length < 3) return null;
  const [intro, ...rest] = parts;
  return { intro: intro.trim(), items: rest.map((s) => s.trim()).filter(Boolean) };
}

function toBlocks(text) {
  const blocks = [];
  let list = null;
  let para = [];
  const flushPara = () => {
    if (para.length) {
      blocks.push({ type: 'p', text: para.join(' ').trim() });
      para = [];
    }
  };
  const flushList = () => {
    if (list) {
      blocks.push({ type: 'ul', items: list });
      list = null;
    }
  };

  for (const rawLine of text.split('\n')) {
    const line = rawLine.trim();
    if (!line) {
      flushPara();
      flushList();
      continue;
    }
    const bullet = line.match(/^(?:[*-]|\d+[.)])\s+(.*)$/);
    if (bullet) {
      flushPara();
      list = list || [];
      list.push(bullet[1]);
    } else {
      flushList();
      para.push(line);
    }
  }
  flushPara();
  flushList();
  return blocks;
}

function MessageBody({ text }) {
  const blocks = toBlocks(text);
  return (
    <div className="space-y-2.5">
      {blocks.map((block, bi) => {
        if (block.type === 'ul') {
          return (
            <ul key={bi} className="space-y-1.5">
              {block.items.map((item, ii) => (
                <li key={ii} className="flex gap-2">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-violet-400" aria-hidden />
                  <span>{renderInline(item, `${bi}-${ii}`)}</span>
                </li>
              ))}
            </ul>
          );
        }
        const inline = splitInlineBullets(block.text);
        if (inline) {
          return (
            <div key={bi} className="space-y-1.5">
              {inline.intro && <p>{renderInline(inline.intro, `${bi}-intro`)}</p>}
              <ul className="space-y-1.5">
                {inline.items.map((item, ii) => (
                  <li key={ii} className="flex gap-2">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-violet-400" aria-hidden />
                    <span>{renderInline(item, `${bi}-i-${ii}`)}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        }
        return <p key={bi}>{renderInline(block.text, `${bi}`)}</p>;
      })}
    </div>
  );
}

function Bubble({ role, children }) {
  const isUser = role === 'user';
  return (
    <div className={cn('flex gap-3', isUser && 'flex-row-reverse')}>
      <span
        className={cn(
          'grid h-8 w-8 shrink-0 place-items-center rounded-full',
          isUser ? 'bg-ink-800 text-white' : cn(AI_GRADIENT, 'text-white shadow-glow')
        )}
      >
        {isUser ? <User className="h-4 w-4" aria-hidden /> : <Sparkles className="h-3.5 w-3.5" aria-hidden />}
      </span>
      <div
        className={cn(
          // min-w-0 + overflow-wrap:anywhere keep long URLs / unbroken strings inside the bubble
          'min-w-0 max-w-[80%] rounded-xl px-4 py-3 text-small leading-relaxed [overflow-wrap:anywhere]',
          isUser ? 'bg-ink-800 text-white' : 'border border-line bg-white text-slate-700'
        )}
      >
        {children}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Career Snapshot — not decorative: this is the same profile-strength
 * and course-recommendation logic already used elsewhere in the app,
 * surfaced here so the assistant is a working console, not just a chat box.
 * ------------------------------------------------------------------ */
function CareerSnapshot({ user, onAsk }) {
  const strength = calculateProfileStrength(user);
  const courses = recommendCourses(user, { limit: 3 });
  const tone = strengthTone(strength.score);

  return (
    <div className="grid gap-5 lg:grid-cols-[15rem_1fr]">
      <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-line bg-white p-6 text-center">
        <ProgressRing value={strength.score} tone={tone} sublabel="/ 100" size={104} />
        <div>
          <p className="text-small font-bold text-ink">Profile strength</p>
          <p className="mt-1 text-caption text-slate-500">{strength.summary}</p>
        </div>
      </div>

      <div className="space-y-5">
        {strength.missing.length > 0 && (
          <div className="rounded-xl border border-line bg-white p-5">
            <p className="text-small font-bold text-ink">Fastest wins</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {strength.missing.map((m) => (
                <Badge key={m} tone="amber">
                  {m}
                </Badge>
              ))}
            </div>
            <button
              type="button"
              onClick={() => onAsk('What is missing from my profile, and what should I fix first?')}
              className="mt-4 inline-flex items-center gap-1.5 text-caption font-semibold text-violet-600 hover:text-violet-700"
            >
              Ask the assistant about this
              <ArrowUpRight className="h-3 w-3" aria-hidden />
            </button>
          </div>
        )}

        {courses.length > 0 && (
          <div className="rounded-xl border border-line bg-white p-5">
            <p className="text-small font-bold text-ink">Suggested next skills</p>
            <ul className="mt-3 space-y-2">
              {courses.map((c) => (
                <li
                  key={c.skill}
                  className="flex items-center justify-between gap-3 rounded-lg bg-paper px-3.5 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-small font-semibold text-ink">{c.skill}</p>
                    <p className="truncate text-caption text-slate-500">{c.reason}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onAsk(`What should I learn or do to build ${c.skill}?`)}
                    className="shrink-0 rounded-full border border-violet-200 bg-violet-50 px-3 py-1.5 text-caption font-semibold text-violet-700 hover:border-violet-300 hover:bg-violet-100"
                  >
                    Ask
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {strength.missing.length === 0 && courses.length === 0 && (
          <div className="rounded-xl border border-line bg-white p-5 text-small text-slate-500">
            Your profile is complete and up to date. Ask the assistant about a specific role to see how you match.
          </div>
        )}
      </div>
    </div>
  );
}

export default function Assistant() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('chat');
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: `Hi ${user?.name?.split(' ')[0] || ''}. Tell me a role you're aiming for, or ask what's missing from your profile, and I'll compare it with what's on file.`,
    },
  ]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    // Scroll only the chat panel. scrollIntoView() also scrolls the window,
    // which made the page jump past the header on load (very visible on mobile).
    const el = scrollRef.current;
    if (activeTab === 'chat' && el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [messages, thinking, activeTab]);

  const send = async (text) => {
    const value = (text ?? input).trim();
    if (!value || thinking) return;

    // Mirror the server's limits (aiChatSchema: <= 40 turns, <= 2000 chars
    // each; the service only uses the last 8 pairs anyway). Without this a
    // long chat, or one long reply, fails validation on every later message.
    // Error bubbles are UI-only and never sent back as assistant turns.
    const history = messages
      .filter((m, i) => i > 0 && !m.isError && m.text)
      .slice(-MAX_HISTORY_SENT)
      .map((m) => ({ role: m.role, text: m.text.slice(0, MAX_TEXT_CHARS) }));

    setMessages((m) => [...m, { role: 'user', text: value }]);
    setInput('');
    setThinking(true);

    try {
      const { reply, actions } = await careerAssistant(value, history);
      setMessages((m) => [...m, { role: 'assistant', text: reply, actions }]);
    } catch (err) {
      setMessages((m) => [
        ...m,
        {
          role: 'assistant',
          isError: true,
          text: err?.message || "I couldn't reach the assistant just now. Please try again.",
        },
      ]);
    } finally {
      setThinking(false);
    }
  };

  const askAndSwitch = (question) => {
    setActiveTab('chat');
    send(question);
  };

  return (
    <>
      {/* Hero — the one deliberate bold moment on this page */}
      <div className="surface-dark relative mb-6 overflow-hidden rounded-2xl px-6 py-8 sm:px-9 sm:py-10">
        <div className="relative z-[1] flex flex-col items-start gap-6 sm:flex-row sm:items-center">
          <AiOrb size={88} thinking={thinking} />
          <div className="min-w-0">
            <h1 className="text-h2 font-extrabold text-white">AI Career Assistant</h1>
            <p className="mt-2 max-w-prose text-small text-white/70">
              Grounded entirely in DutyLaunch's live pricing, courses, jobs and documentation data — ask a
              direct question and get a direct, sourced answer, personalised to your profile.
            </p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {DATA_SOURCES.map((s) => (
                <span
                  key={s}
                  className="rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-caption font-medium text-white/70 backdrop-blur"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Segmented view switcher */}
      <div role="tablist" aria-label="Assistant view" className="mb-5 inline-flex rounded-full border border-line bg-white p-1">
        {VIEW_TABS.map((t) => {
          const active = activeTab === t.id;
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setActiveTab(t.id)}
              className="relative flex items-center gap-1.5 rounded-full px-4 py-2 text-caption font-semibold"
            >
              {active && (
                <motion.span
                  layoutId="assistant-tab-pill"
                  className="absolute inset-0 rounded-full bg-ink-800"
                  transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                />
              )}
              <span className={cn('relative flex items-center gap-1.5', active ? 'text-white' : 'text-slate-600')}>
                <Icon className="h-3.5 w-3.5" aria-hidden />
                {t.label}
              </span>
            </button>
          );
        })}
      </div>

      {activeTab === 'snapshot' ? (
        <CareerSnapshot user={user} onAsk={askAndSwitch} />
      ) : (
        <div className="flex h-[560px] flex-col overflow-hidden rounded-xl border border-line bg-white">
          <div className="h-[3px] shrink-0 bg-gradient-to-r from-violet-500 via-azure-400 to-violet-500" />
          <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-5">
            {messages.map((m, i) => (
              <div key={i} className="space-y-3">
                <Bubble role={m.role}>{m.role === 'assistant' ? <MessageBody text={m.text} /> : m.text}</Bubble>
                {m.actions && m.actions.length > 0 && (
                  <div className="ml-11 flex flex-wrap gap-2">
                    {m.actions.map((a) => (
                      <Link
                        key={a.label}
                        to={a.to}
                        className="inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50 px-3 py-1.5 text-caption font-semibold text-violet-700 hover:border-violet-300 hover:bg-violet-100"
                      >
                        <Sparkles className="h-3 w-3" aria-hidden />
                        {a.label}
                        <ArrowUpRight className="h-3 w-3" aria-hidden />
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {thinking && (
              <div className="flex gap-3">
                <AiOrb size={32} thinking className="shrink-0" />
                <div className="flex items-center rounded-xl border border-line bg-white px-4 py-3">
                  <span className="inline-flex gap-1">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-violet-300" />
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-violet-300 [animation-delay:150ms]" />
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-violet-300 [animation-delay:300ms]" />
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-line p-4">
            <div className="flex flex-wrap gap-2 pb-3">
              {SUGGESTED_PROMPTS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => send(p)}
                  disabled={thinking}
                  className="rounded-full border border-line px-3 py-1.5 text-caption font-medium text-slate-600 hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
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
                maxLength={MAX_TEXT_CHARS}
                placeholder="Ask about a role, your profile, or what to learn next…"
                disabled={thinking}
                className="h-11 flex-1 rounded-lg border border-line bg-white px-3.5 text-small outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-100 disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={thinking || !input.trim()}
                className={cn(
                  AI_GRADIENT,
                  'grid h-11 w-11 shrink-0 place-items-center rounded-lg text-white shadow-glow hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60'
                )}
                aria-label="Send"
              >
                <Send className="h-4.5 w-4.5" aria-hidden />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
