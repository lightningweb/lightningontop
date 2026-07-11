import { useEffect, useMemo, useState } from "react";
import { Zap } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { getLiveConfig } from "@/lib/lightning";

const ONB_KEY = "thunder.onboarded.v2";

export function needsOnboarding() {
  try { return !localStorage.getItem(ONB_KEY); } catch { return false; }
}

const THEMES: { id: string; label: string; from: string; to: string }[] = [
  { id: "sunset",  label: "Sunset",  from: "#ff6a3d", to: "#a3103c" },
  { id: "sand",    label: "Sand",    from: "#e0c9a6", to: "#7b6448" },
  { id: "mint",    label: "Mint",    from: "#4bd6a4", to: "#0e6b56" },
  { id: "indigo",  label: "Indigo",  from: "#7aa5ff", to: "#312e81" },
  { id: "ivory",   label: "Ivory",   from: "#f3f0eb", to: "#c9c4bd" },
  { id: "amber",   label: "Amber",   from: "#ffb84a", to: "#b1560c" },
  { id: "sea",     label: "Sea",     from: "#3fc0d0", to: "#0b4b70" },
  { id: "violet",  label: "Violet",  from: "#c47bff", to: "#4a1a86" },
  { id: "slate",   label: "Slate",   from: "#5b6472", to: "#232830" },
};

const Shell = ({ children }: { children: React.ReactNode }) => (
  <div className="fixed inset-0 z-[9999] bg-topo animate-fade-in-up">
    <div className="min-h-screen w-full grid place-items-center px-6">
      <div className="w-full max-w-xl text-center">
        <div className="mx-auto mb-6 grid h-12 w-12 place-items-center text-foreground">
          <Zap className="h-9 w-9 fill-current" />
        </div>
        {children}
      </div>
    </div>
  </div>
);

const Pill = ({
  onClick, children, variant = "solid",
}: { onClick?: () => void; children: React.ReactNode; variant?: "solid" | "ghost" }) => (
  <button
    type="button"
    onClick={onClick}
    className={
      variant === "solid"
        ? "rounded-full bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground shadow-soft transition-transform hover:-translate-y-0.5"
        : "rounded-full bg-secondary/80 px-6 py-2 text-sm font-semibold text-foreground shadow-soft transition-transform hover:-translate-y-0.5"
    }
  >
    {children}
  </button>
);

export const Onboarding = ({ onDone }: { onDone: () => void }) => {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [theme, setTheme] = useState<string>("slate");
  const { user, signUp } = useAuth() as any;
  const config = useMemo(() => getLiveConfig(), []);

  useEffect(() => {
    document.title = `welcome · ${config.siteName}`;
  }, [config.siteName]);

  const finish = () => {
    try {
      localStorage.setItem(ONB_KEY, "1");
      localStorage.setItem("thunder.theme.v1", theme);
      if (name) localStorage.setItem("thunder.display_name", name);
    } catch {}
    onDone();
  };

  // Step 0: welcome
  if (step === 0) return (
    <Shell>
      <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-foreground">Thunder's back!</h1>
      <p className="mt-3 text-lg text-foreground/80">and it's better than ever.</p>
      <div className="mt-10 flex items-center justify-center gap-3">
        <Pill variant="ghost" onClick={() => setStep(1)}>What's changed?</Pill>
        <Pill onClick={() => setStep(2)}>Next</Pill>
      </div>
    </Shell>
  );

  if (step === 1) return (
    <Shell>
      <h2 className="text-3xl md:text-4xl font-bold text-foreground">Here's what's changed.</h2>
      <ul className="mt-6 mx-auto max-w-sm text-left text-foreground/85 space-y-2 text-base list-disc pl-6">
        <li>Profiles and accounts are back!</li>
        <li>New and refined design system.</li>
        <li>More customizable!</li>
        <li>Introducing apps! No longer limited to just games.</li>
        <li>Widgets, quests, leaderboard & DMs!</li>
      </ul>
      <div className="mt-10"><Pill onClick={() => setStep(2)}>Next</Pill></div>
    </Shell>
  );

  if (step === 2) return (
    <Shell>
      <h2 className="text-3xl md:text-4xl font-bold text-foreground">Before we enter…</h2>
      <p className="mt-2 text-foreground/80">care to make a profile?</p>
      <div className="mt-8 grid grid-cols-2 gap-3">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" className="col-span-1 rounded-full bg-secondary/80 px-5 py-3 text-sm text-foreground placeholder:text-foreground/50 outline-none" />
        <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" className="col-span-1 rounded-full bg-secondary/80 px-5 py-3 text-sm text-foreground placeholder:text-foreground/50 outline-none" />
        <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="Password" className="col-span-2 rounded-full bg-secondary/80 px-5 py-3 text-sm text-foreground placeholder:text-foreground/50 outline-none" />
        <input type="password" value={pw2} onChange={(e) => setPw2(e.target.value)} placeholder="Confirm Password" className="col-span-2 rounded-full bg-secondary/80 px-5 py-3 text-sm text-foreground placeholder:text-foreground/50 outline-none" />
      </div>
      <div className="mt-8 flex items-center justify-center gap-3">
        <button onClick={() => setStep(3)} className="text-sm text-foreground/60 hover:text-foreground underline">Skip</button>
        <Pill onClick={async () => {
          if (username && pw && pw === pw2 && signUp) {
            try { await signUp(`${username}@thunder.local`, pw, name || username); } catch {}
          }
          setStep(3);
        }}>Next</Pill>
      </div>
    </Shell>
  );

  if (step === 3) return (
    <Shell>
      <h2 className="text-3xl md:text-4xl font-bold text-foreground">What theme are we feeling?</h2>
      <p className="mt-2 text-foreground/80">Anything from now on will be in your theme!</p>
      <div className="mt-8 grid grid-cols-5 gap-4 justify-items-center">
        {THEMES.map((t) => (
          <button
            key={t.id}
            onClick={() => setTheme(t.id)}
            title={t.label}
            className={`h-16 w-16 rounded-[42%] transition-transform hover:-translate-y-0.5 ${theme === t.id ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""}`}
            style={{ backgroundImage: `radial-gradient(circle at 30% 30%, ${t.from}, ${t.to})` }}
          />
        ))}
      </div>
      <div className="mt-8"><Pill onClick={() => setStep(4)}>Next</Pill></div>
    </Shell>
  );

  if (step === 4) return (
    <Shell>
      <div className="mx-auto mb-6 grid h-24 w-24 place-items-center rounded-full bg-secondary text-foreground/70">
        <svg viewBox="0 0 24 24" className="h-16 w-16 fill-current"><path d="M12 12a5 5 0 100-10 5 5 0 000 10zm-8 10a8 8 0 1116 0H4z"/></svg>
      </div>
      <h2 className="mt-4 text-3xl md:text-4xl font-bold text-foreground">
        Ready to explore, {name || "friend"}?
      </h2>
      <div className="mt-10"><Pill onClick={() => setStep(5)}>Done</Pill></div>
    </Shell>
  );

  // Step 5: final marker
  useEffect(() => {
    if (step === 5) {
      const t = setTimeout(finish, 1400);
      return () => clearTimeout(t);
    }
  }, [step]);
  return (
    <Shell>
      <h1 className="mt-6 text-5xl md:text-6xl font-extrabold tracking-tight text-foreground animate-fade-in-up">
        This, is THUNDER.
      </h1>
    </Shell>
  );
};

export default Onboarding;