import { useEffect, useMemo, useRef, useState } from "react";
import { Navigate } from "react-router-dom";
import { getLiveConfig } from "@/lib/lightning";
import { Header } from "@/components/lightning/Header";
import { CategoryRow } from "@/components/lightning/CategoryRow";
import {
  Wrench, Calculator, Timer, StickyNote, Clock, Palette,
  Ruler, Globe, Calendar, ListTodo, Coins, Languages,
  QrCode, KeyRound, Music, PenTool, Camera, Book, X, Dices,
} from "lucide-react";

type ToolId =
  | "calculator" | "timer" | "stopwatch" | "notes" | "clock" | "todo" | "calendar"
  | "palette" | "draw" | "dice" | "ruler" | "globe" | "currency" | "translate"
  | "qr" | "password" | "music" | "camera" | "read" | "misc";
type Tool = { id: ToolId; name: string; icon: any; topic: string };
const TOOLS: Tool[] = [
  { id: "calculator", name: "Calculator", icon: Calculator, topic: "Productivity" },
  { id: "timer", name: "Timer", icon: Timer, topic: "Productivity" },
  { id: "stopwatch", name: "Stopwatch", icon: Timer, topic: "Productivity" },
  { id: "notes", name: "Notes", icon: StickyNote, topic: "Productivity" },
  { id: "clock", name: "Clock", icon: Clock, topic: "Productivity" },
  { id: "todo", name: "Todo", icon: ListTodo, topic: "Productivity" },
  { id: "calendar", name: "Calendar", icon: Calendar, topic: "Productivity" },
  { id: "palette", name: "Palette", icon: Palette, topic: "Creative" },
  { id: "draw", name: "Draw", icon: PenTool, topic: "Creative" },
  { id: "dice", name: "Dice", icon: Dices, topic: "Creative" },
  { id: "camera", name: "Camera", icon: Camera, topic: "Creative" },
  { id: "music", name: "Music", icon: Music, topic: "Creative" },
  { id: "qr", name: "QR", icon: QrCode, topic: "Utility" },
  { id: "password", name: "Password", icon: KeyRound, topic: "Utility" },
  { id: "translate", name: "Translate", icon: Languages, topic: "Utility" },
  { id: "currency", name: "Coins", icon: Coins, topic: "Utility" },
  { id: "globe", name: "Globe", icon: Globe, topic: "Utility" },
  { id: "ruler", name: "Ruler", icon: Ruler, topic: "Utility" },
  { id: "read", name: "Read", icon: Book, topic: "Utility" },
  { id: "misc", name: "Misc", icon: Wrench, topic: "Utility" },
];

const Tile = ({ tool, onOpen }: { tool: Tool; onOpen: (t: Tool) => void }) => (
  <button
    type="button"
    title={tool.name}
    aria-label={tool.name}
    onClick={() => onOpen(tool)}
    className="group relative grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-[22px] bg-secondary shadow-soft transition-transform hover:-translate-y-0.5"
  >
    <tool.icon className="h-10 w-10 text-foreground transition-opacity group-hover:opacity-40" />
    <span className="pointer-events-none absolute inset-x-0 bottom-1.5 px-2 text-center text-[11px] font-semibold text-foreground opacity-0 transition-opacity group-hover:opacity-100">
      {tool.name}
    </span>
  </button>
);

const Tools = () => {
  const config = useMemo(() => getLiveConfig(), []);
  const [active, setActive] = useState<Tool | null>(null);
  useEffect(() => { document.title = `tools · ${config.siteName}`; }, [config.siteName]);
  if (config.maintenanceMode) return <Navigate to="/maintenance" replace />;

  return (
    <div className="min-h-screen bg-topo">
      <div className="w-full px-4 md:px-10 py-8 md:py-10">
        <Header siteName={config.siteName} version={config.version} nav={config.nav} />
        <main className="pt-8 md:pt-12">
          <CategoryRow title="The team's favourites">
            {TOOLS.slice(0, 6).map((t) => <Tile key={t.id} tool={t} onOpen={setActive} />)}
          </CategoryRow>
          {["Productivity", "Creative", "Utility"].map((topic) => (
            <CategoryRow key={topic} title={topic}>
              {TOOLS.filter((t) => t.topic === topic).map((t) => (
                <Tile key={t.id} tool={t} onOpen={setActive} />
              ))}
            </CategoryRow>
          ))}
          <CategoryRow title="All tools">
            {TOOLS.map((t) => <Tile key={t.id} tool={t} onOpen={setActive} />)}
          </CategoryRow>
        </main>
      </div>
      {active && <ToolModal tool={active} onClose={() => setActive(null)} />}
    </div>
  );
};

export default Tools;

// ─── modal shell ────────────────────────────────────────────────────────────

const ToolModal = ({ tool, onClose }: { tool: Tool; onClose: () => void }) => (
  <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
    <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-soft" onClick={(e) => e.stopPropagation()}>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <tool.icon className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-bold text-foreground">{tool.name}</h2>
        </div>
        <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>
      <ToolBody id={tool.id} />
    </div>
  </div>
);

const ToolBody = ({ id }: { id: ToolId }) => {
  switch (id) {
    case "calculator": return <CalcTool />;
    case "timer": return <TimerTool />;
    case "stopwatch": return <StopwatchTool />;
    case "notes": return <NotesTool />;
    case "clock": return <ClockTool />;
    case "todo": return <TodoTool />;
    case "calendar": return <CalendarTool />;
    case "palette": return <PaletteTool />;
    case "draw": return <DrawTool />;
    case "dice": return <DiceTool />;
    case "password": return <PasswordTool />;
    case "qr": return <QRTool />;
    case "translate": return <TranslateTool />;
    case "currency": return <CurrencyTool />;
    case "ruler": return <RulerTool />;
    case "globe": return <GlobeTool />;
    case "camera": return <CameraTool />;
    case "music": return <MusicTool />;
    case "read": return <ReadTool />;
    default: return <p className="text-sm text-muted-foreground">More tools coming soon.</p>;
  }
};

// ─── individual tools ───────────────────────────────────────────────────────

const btn = "rounded-lg bg-secondary px-3 py-2 text-sm font-semibold hover:bg-secondary/80";
const input = "w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary/60";

const CalcTool = () => {
  const [expr, setExpr] = useState("");
  const [result, setResult] = useState("");
  const compute = (e: string) => {
    try {
      // eslint-disable-next-line no-new-func
      const r = Function(`"use strict";return (${e.replace(/[^-()\d/*+.%\s]/g, "")})`)();
      setResult(String(r));
    } catch { setResult("—"); }
  };
  return (
    <div className="space-y-3">
      <input className={`${input} text-right text-lg font-mono`} value={expr} onChange={(e) => { setExpr(e.target.value); compute(e.target.value); }} placeholder="1+2*3" />
      <div className="rounded-md bg-secondary/60 p-3 text-right text-2xl font-bold">{result || "0"}</div>
      <div className="grid grid-cols-4 gap-2">
        {["7","8","9","/","4","5","6","*","1","2","3","-","0",".","=","+"].map((k) => (
          <button key={k} className={btn} onClick={() => {
            if (k === "=") compute(expr);
            else { const next = expr + k; setExpr(next); compute(next); }
          }}>{k}</button>
        ))}
        <button className={`${btn} col-span-4 bg-destructive/20 text-destructive`} onClick={() => { setExpr(""); setResult(""); }}>Clear</button>
      </div>
    </div>
  );
};

const TimerTool = () => {
  const [secs, setSecs] = useState(60);
  const [left, setLeft] = useState(0);
  const [running, setRunning] = useState(false);
  const ref = useRef<number | null>(null);
  useEffect(() => {
    if (!running) return;
    ref.current = window.setInterval(() => {
      setLeft((l) => {
        if (l <= 1) { setRunning(false); return 0; }
        return l - 1;
      });
    }, 1000);
    return () => { if (ref.current) window.clearInterval(ref.current); };
  }, [running]);
  const fmt = (s: number) => `${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}`;
  return (
    <div className="space-y-3 text-center">
      <div className="text-5xl font-bold font-mono">{fmt(left || secs)}</div>
      <div className="flex items-center justify-center gap-2">
        <input type="number" className={`${input} w-24 text-center`} value={secs} onChange={(e) => setSecs(Math.max(1, +e.target.value))} />
        <button className={btn} onClick={() => { setLeft(secs); setRunning(true); }}>Start</button>
        <button className={btn} onClick={() => setRunning(false)}>Pause</button>
        <button className={btn} onClick={() => { setRunning(false); setLeft(0); }}>Reset</button>
      </div>
    </div>
  );
};

const StopwatchTool = () => {
  const [ms, setMs] = useState(0);
  const [running, setRunning] = useState(false);
  useEffect(() => {
    if (!running) return;
    const start = Date.now() - ms;
    const id = window.setInterval(() => setMs(Date.now() - start), 47);
    return () => window.clearInterval(id);
  }, [running]);
  const s = Math.floor(ms/1000);
  return (
    <div className="space-y-3 text-center">
      <div className="text-5xl font-bold font-mono">{Math.floor(s/60)}:{String(s%60).padStart(2,"0")}.{String(Math.floor((ms%1000)/10)).padStart(2,"0")}</div>
      <div className="flex items-center justify-center gap-2">
        <button className={btn} onClick={() => setRunning(!running)}>{running ? "Pause" : "Start"}</button>
        <button className={btn} onClick={() => { setMs(0); setRunning(false); }}>Reset</button>
      </div>
    </div>
  );
};

const NotesTool = () => {
  const [v, setV] = useState(() => localStorage.getItem("thunder.notes") || "");
  useEffect(() => { localStorage.setItem("thunder.notes", v); }, [v]);
  return <textarea rows={10} className={input} value={v} onChange={(e) => setV(e.target.value)} placeholder="Jot something down…" />;
};

const ClockTool = () => {
  const [now, setNow] = useState(new Date());
  useEffect(() => { const id = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(id); }, []);
  return (
    <div className="grid place-items-center gap-2 py-6">
      <div className="text-6xl font-bold font-mono">{now.toLocaleTimeString()}</div>
      <div className="text-sm text-muted-foreground">{now.toDateString()}</div>
    </div>
  );
};

const TodoTool = () => {
  const [items, setItems] = useState<{ t: string; done: boolean }[]>(() => {
    try { return JSON.parse(localStorage.getItem("thunder.todo") || "[]"); } catch { return []; }
  });
  const [t, setT] = useState("");
  useEffect(() => { localStorage.setItem("thunder.todo", JSON.stringify(items)); }, [items]);
  return (
    <div className="space-y-2">
      <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); if (t.trim()) { setItems([...items, { t: t.trim(), done: false }]); setT(""); } }}>
        <input className={input} value={t} onChange={(e) => setT(e.target.value)} placeholder="Add a task…" />
        <button className={btn}>Add</button>
      </form>
      <ul className="space-y-1 max-h-72 overflow-y-auto">
        {items.map((it, i) => (
          <li key={i} className="flex items-center gap-2 rounded-md bg-secondary/50 px-3 py-2">
            <input type="checkbox" checked={it.done} onChange={() => setItems(items.map((x, j) => j === i ? { ...x, done: !x.done } : x))} />
            <span className={`flex-1 text-sm ${it.done ? "line-through text-muted-foreground" : ""}`}>{it.t}</span>
            <button className="text-xs text-destructive" onClick={() => setItems(items.filter((_, j) => j !== i))}>×</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

const CalendarTool = () => {
  const [d, setD] = useState(new Date());
  const first = new Date(d.getFullYear(), d.getMonth(), 1);
  const days = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  const offset = first.getDay();
  const today = new Date();
  const isToday = (n: number) => today.getFullYear() === d.getFullYear() && today.getMonth() === d.getMonth() && today.getDate() === n;
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <button className={btn} onClick={() => setD(new Date(d.getFullYear(), d.getMonth() - 1, 1))}>‹</button>
        <div className="font-bold">{d.toLocaleString(undefined, { month: "long", year: "numeric" })}</div>
        <button className={btn} onClick={() => setD(new Date(d.getFullYear(), d.getMonth() + 1, 1))}>›</button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs">
        {"SMTWTFS".split("").map((c, i) => <div key={i} className="text-muted-foreground">{c}</div>)}
        {Array.from({ length: offset }).map((_, i) => <div key={"e"+i} />)}
        {Array.from({ length: days }).map((_, i) => {
          const n = i + 1;
          return <div key={n} className={`rounded-md py-2 ${isToday(n) ? "bg-primary text-primary-foreground font-bold" : "bg-secondary/40"}`}>{n}</div>;
        })}
      </div>
    </div>
  );
};

const PaletteTool = () => {
  const [c, setC] = useState("#7aa5ff");
  const hex = c.replace("#", "");
  const rgb = [0,2,4].map((i) => parseInt(hex.slice(i, i+2), 16));
  return (
    <div className="space-y-3">
      <input type="color" value={c} onChange={(e) => setC(e.target.value)} className="h-24 w-full rounded-lg border border-border bg-transparent" />
      <div className="grid grid-cols-2 gap-2 text-sm font-mono">
        <div className="rounded-md bg-secondary/60 p-2">HEX <div className="font-bold">{c}</div></div>
        <div className="rounded-md bg-secondary/60 p-2">RGB <div className="font-bold">{rgb.join(", ")}</div></div>
      </div>
    </div>
  );
};

const DrawTool = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [color, setColor] = useState("#ffffff");
  const start = (e: React.PointerEvent) => { drawing.current = true; const c = ref.current!.getContext("2d")!; c.beginPath(); c.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY); };
  const move = (e: React.PointerEvent) => { if (!drawing.current) return; const c = ref.current!.getContext("2d")!; c.strokeStyle = color; c.lineWidth = 3; c.lineCap = "round"; c.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY); c.stroke(); };
  const end = () => { drawing.current = false; };
  return (
    <div className="space-y-2">
      <canvas ref={ref} width={480} height={280} onPointerDown={start} onPointerMove={move} onPointerUp={end} onPointerLeave={end} className="w-full rounded-lg border border-border bg-black/60" />
      <div className="flex items-center gap-2">
        <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-8 w-8 rounded" />
        <button className={btn} onClick={() => { const c = ref.current!; c.getContext("2d")!.clearRect(0, 0, c.width, c.height); }}>Clear</button>
      </div>
    </div>
  );
};

const DiceTool = () => {
  const [n, setN] = useState(6);
  const [r, setR] = useState<number | null>(null);
  return (
    <div className="space-y-3 text-center">
      <div className="text-6xl font-bold">{r ?? "–"}</div>
      <div className="flex items-center justify-center gap-2">
        <span className="text-sm">d</span>
        <input type="number" className={`${input} w-20 text-center`} value={n} onChange={(e) => setN(Math.max(2, +e.target.value))} />
        <button className={btn} onClick={() => setR(1 + Math.floor(Math.random() * n))}>Roll</button>
      </div>
    </div>
  );
};

const PasswordTool = () => {
  const [len, setLen] = useState(16);
  const [pw, setPw] = useState("");
  const gen = () => {
    const alpha = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    let s = ""; for (let i = 0; i < len; i++) s += alpha[Math.floor(Math.random() * alpha.length)];
    setPw(s);
  };
  useEffect(() => { gen(); /* eslint-disable-next-line */ }, []);
  return (
    <div className="space-y-3">
      <div className="break-all rounded-md bg-secondary/60 p-3 font-mono text-sm">{pw}</div>
      <div className="flex items-center gap-2">
        <input type="range" min={6} max={48} value={len} onChange={(e) => setLen(+e.target.value)} className="flex-1" />
        <span className="w-10 text-right text-sm">{len}</span>
        <button className={btn} onClick={gen}>Regen</button>
        <button className={btn} onClick={() => navigator.clipboard.writeText(pw)}>Copy</button>
      </div>
    </div>
  );
};

const QRTool = () => {
  const [t, setT] = useState("https://thunder-new.pages.dev/");
  const src = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(t)}`;
  return (
    <div className="space-y-3">
      <input className={input} value={t} onChange={(e) => setT(e.target.value)} />
      <img src={src} alt="qr" className="mx-auto rounded-lg bg-white p-2" />
    </div>
  );
};

const TranslateTool = () => {
  const [t, setT] = useState("");
  const [to, setTo] = useState("es");
  const [out, setOut] = useState("");
  const go = async () => {
    try {
      const r = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(t)}&langpair=en|${to}`);
      const j = await r.json();
      setOut(j?.responseData?.translatedText || "—");
    } catch { setOut("error"); }
  };
  return (
    <div className="space-y-2">
      <textarea rows={3} className={input} value={t} onChange={(e) => setT(e.target.value)} placeholder="English text…" />
      <div className="flex gap-2">
        <select className={input} value={to} onChange={(e) => setTo(e.target.value)}>
          {["es","fr","de","it","pt","ja","ko","zh","ru","ar"].map((l) => <option key={l} value={l}>{l}</option>)}
        </select>
        <button className={btn} onClick={go}>Translate</button>
      </div>
      <div className="rounded-md bg-secondary/60 p-3 text-sm">{out}</div>
    </div>
  );
};

const CurrencyTool = () => {
  const [amt, setAmt] = useState(1);
  const [from, setFrom] = useState("USD");
  const [to, setTo] = useState("EUR");
  const [out, setOut] = useState<string>("");
  const go = async () => {
    try {
      const r = await fetch(`https://api.frankfurter.app/latest?amount=${amt}&from=${from}&to=${to}`);
      const j = await r.json();
      setOut(`${j.rates?.[to] ?? "—"} ${to}`);
    } catch { setOut("error"); }
  };
  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input type="number" className={input} value={amt} onChange={(e) => setAmt(+e.target.value)} />
        <input className={input} value={from} onChange={(e) => setFrom(e.target.value.toUpperCase())} />
        <span className="self-center">→</span>
        <input className={input} value={to} onChange={(e) => setTo(e.target.value.toUpperCase())} />
      </div>
      <button className={btn} onClick={go}>Convert</button>
      <div className="rounded-md bg-secondary/60 p-3 text-lg font-bold">{out || "—"}</div>
    </div>
  );
};

const RulerTool = () => {
  const UNITS = { m: 1, cm: 0.01, mm: 0.001, km: 1000, in: 0.0254, ft: 0.3048, mi: 1609.34 } as const;
  const [v, setV] = useState(1);
  const [from, setFrom] = useState<keyof typeof UNITS>("m");
  const [to, setTo] = useState<keyof typeof UNITS>("ft");
  const r = (v * UNITS[from]) / UNITS[to];
  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input type="number" className={input} value={v} onChange={(e) => setV(+e.target.value)} />
        <select className={input} value={from} onChange={(e) => setFrom(e.target.value as any)}>{Object.keys(UNITS).map((k) => <option key={k}>{k}</option>)}</select>
        <span className="self-center">→</span>
        <select className={input} value={to} onChange={(e) => setTo(e.target.value as any)}>{Object.keys(UNITS).map((k) => <option key={k}>{k}</option>)}</select>
      </div>
      <div className="rounded-md bg-secondary/60 p-3 text-lg font-bold">{r.toLocaleString()} {to}</div>
    </div>
  );
};

const GlobeTool = () => {
  const [q, setQ] = useState("");
  return (
    <div className="space-y-2">
      <form onSubmit={(e) => { e.preventDefault(); if (q) window.open(`https://www.google.com/search?q=${encodeURIComponent(q)}`, "_blank"); }} className="flex gap-2">
        <input className={input} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search the web…" />
        <button className={btn}>Go</button>
      </form>
      <p className="text-xs text-muted-foreground">Opens in a new tab.</p>
    </div>
  );
};

const CameraTool = () => {
  const ref = useRef<HTMLVideoElement>(null);
  const [on, setOn] = useState(false);
  const start = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: true });
      if (ref.current) { ref.current.srcObject = s; ref.current.play(); }
      setOn(true);
    } catch {}
  };
  return (
    <div className="space-y-2">
      <video ref={ref} className="w-full rounded-lg bg-black" />
      {!on && <button className={btn} onClick={start}>Enable camera</button>}
    </div>
  );
};

const MusicTool = () => {
  const play = (freq: number) => {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const o = ctx.createOscillator(); const g = ctx.createGain();
    o.frequency.value = freq; o.type = "sine"; o.connect(g); g.connect(ctx.destination);
    g.gain.setValueAtTime(0.2, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6);
    o.start(); o.stop(ctx.currentTime + 0.6);
  };
  const notes = [["C",261.63],["D",293.66],["E",329.63],["F",349.23],["G",392],["A",440],["B",493.88],["C↑",523.25]] as const;
  return (
    <div className="grid grid-cols-8 gap-1">
      {notes.map(([n, f]) => (
        <button key={n} className="h-24 rounded-md bg-white text-black font-bold hover:bg-white/80" onClick={() => play(f as number)}>{n}</button>
      ))}
    </div>
  );
};

const ReadTool = () => (
  <div className="max-h-72 overflow-y-auto text-sm text-muted-foreground">
    <p>THUNDER is your personal hub for games, apps, and small tools. Everything runs in your browser — no installs, no signups required (unless you want cloud saves).</p>
    <p className="mt-2">Tips:</p>
    <ul className="mt-1 list-disc pl-5 space-y-1">
      <li>Pin favourites by playing them — the home page remembers.</li>
      <li>Complete quests to level up.</li>
      <li>Add friends and DM them from the Messages tab.</li>
      <li>Change your avatar in Settings.</li>
    </ul>
  </div>
);