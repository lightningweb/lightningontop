import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { pullSavesFromCloud, pushAllLocalSavesToCloud, setSyncUser } from "@/lib/gameSaves";

type Profile = { id: string; username: string; tag?: string | null; banned_until?: string | null; ban_reason?: string | null };

const REMEMBER_KEY = "lightning.auth.remember.v1";
const SESSION_FLAG = "lightning.auth.session.v1";

export const setRememberMe = (v: boolean) => {
  try {
    if (v) localStorage.setItem(REMEMBER_KEY, "1");
    else localStorage.removeItem(REMEMBER_KEY);
    sessionStorage.setItem(SESSION_FLAG, "1");
  } catch {
    /* ignore */
  }
};

type AuthCtx = {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

const Ctx = createContext<AuthCtx>({
  user: null,
  session: null,
  profile: null,
  loading: true,
  signOut: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If the user did NOT check "remember me", clear the persisted session
    // when they open a new browser session (sessionStorage was wiped).
    try {
      const remembered = localStorage.getItem(REMEMBER_KEY) === "1";
      const sameSession = sessionStorage.getItem(SESSION_FLAG) === "1";
      if (!remembered && !sameSession) {
        supabase.auth.signOut().catch(() => {});
      }
      sessionStorage.setItem(SESSION_FLAG, "1");
    } catch { /* ignore */ }

    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      setSyncUser(s?.user?.id ?? null);
      if (s?.user) {
        // defer to avoid deadlocks
        setTimeout(async () => {
          const { data } = await supabase
            .from("profiles")
            .select("id,username,tag,banned_until,ban_reason")
            .eq("id", s.user.id)
            .maybeSingle();
          if (data?.banned_until && new Date(data.banned_until) > new Date()) {
            const reason = data.ban_reason || "no reason provided";
            await supabase.auth.signOut();
            alert(`Your account is banned.\nReason: ${reason}`);
            return;
          }
          setProfile(data ?? null);
          await pullSavesFromCloud(s.user.id);
          await pushAllLocalSavesToCloud(s.user.id);
        }, 0);
      } else {
        setProfile(null);
      }
    });
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      setSyncUser(s?.user?.id ?? null);
      setLoading(false);
      if (s?.user) {
        supabase
          .from("profiles")
          .select("id,username,tag,banned_until,ban_reason")
          .eq("id", s.user.id)
          .maybeSingle()
          .then(({ data }) => {
            if (data?.banned_until && new Date(data.banned_until) > new Date()) {
              const reason = data.ban_reason || "no reason provided";
              supabase.auth.signOut();
              alert(`Your account is banned.\nReason: ${reason}`);
              return;
            }
            setProfile(data ?? null);
          });
        pullSavesFromCloud(s.user.id);
      }
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <Ctx.Provider value={{ user, session, profile, loading, signOut }}>
      {children}
    </Ctx.Provider>
  );
};

export const useAuth = () => useContext(Ctx);