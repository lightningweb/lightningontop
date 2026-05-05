import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { pullSavesFromCloud, pushAllLocalSavesToCloud, setSyncUser } from "@/lib/gameSaves";

type Profile = { id: string; username: string };

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
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      setSyncUser(s?.user?.id ?? null);
      if (s?.user) {
        // defer to avoid deadlocks
        setTimeout(async () => {
          const { data } = await supabase
            .from("profiles")
            .select("id,username")
            .eq("id", s.user.id)
            .maybeSingle();
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
          .select("id,username")
          .eq("id", s.user.id)
          .maybeSingle()
          .then(({ data }) => setProfile(data ?? null));
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