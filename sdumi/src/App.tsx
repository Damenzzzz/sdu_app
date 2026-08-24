import { useEffect, useState } from "react";
import "./App.css";
import { Sidebar, type ViewKey } from "./components/Sidebar";
import { Dashboard } from "./views/Dashboard";
import { Schedule } from "./views/Schedule";
import { Syllabus } from "./views/Syllabus";
import { Grades } from "./views/Grades";
import { Books } from "./views/Books";
import { Dailies } from "./views/Dailies";
import { Focus } from "./views/Focus";
import { Leaderboard } from "./views/Leaderboard";
import { AI } from "./views/AI";
import { Profile } from "./views/Profile";
import { Settings } from "./views/Settings";
import { Login } from "./views/Login";
import { ConfettiLayer } from "./components/Confetti";
import { useDailies } from "./store/useDailies";
import { getSession, signOut, type Session } from "./auth/session";
import { isTauri, sduIsLoggedIn } from "./sdu/tauri";
import { useClassReminders } from "./sdu/useClassReminders";
import { isBackendConfigured } from "./backend/config";
import { pushPresence, computeScore } from "./backend/leaderboard";
import { loadJSON } from "./store/persist";
import { currentStreak } from "./store/streak";

function App() {
  const [session, setSession] = useState<Session | null>(() => getSession());
  const [validating, setValidating] = useState(true);
  const [view, setView] = useState<ViewKey>("dashboard");
  const dailies = useDailies();
  useClassReminders(!!session?.real);

  // A stored session in the desktop app is only valid if the Rust scraper still
  // holds an authenticated SIS session (its cookie jar is per-process, so it is
  // empty after a restart). If not, drop the stale session and force re-login.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const s = getSession();
      if (s && s.real && isTauri()) {
        try {
          const ok = await sduIsLoggedIn();
          if (!ok && !cancelled) {
            await signOut();
            setSession(null);
          }
        } catch {
          /* ignore */
        }
      } else if (s && !s.real && isTauri()) {
        // Stale demo session inside the desktop app — clear it so real login runs.
        await signOut();
        setSession(null);
      }
      if (!cancelled) setValidating(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Online presence + score heartbeat (only when a live backend is configured).
  useEffect(() => {
    if (!isBackendConfigured() || !session?.real) return;
    const push = () => {
      const focus = loadJSON<number>("focusSessions", 0);
      void pushPresence({
        id: session.studentId,
        name: session.studentName,
        points: computeScore(dailies.doneCount, focus),
        streak: currentStreak(),
      });
    };
    push();
    // 2.5-min heartbeat keeps write volume low at 2000+ users while presence
    // still reflects "online" within the 2-min window comfortably... use 90s.
    const t = setInterval(push, 90_000);
    return () => clearInterval(t);
  }, [session, dailies.doneCount]);

  if (validating) {
    return <div className="login-wrap" />;
  }

  if (!session) {
    return (
      <>
        <ConfettiLayer />
        <Login onSignedIn={setSession} />
      </>
    );
  }

  const pending = dailies.items.filter((d) => !d.done).length;

  const logout = () => {
    signOut();
    setSession(null);
    setView("dashboard");
  };

  return (
    <div className="app">
      <ConfettiLayer />
      <Sidebar
        active={view}
        onNavigate={setView}
        dailyBadge={pending}
        studentName={session.studentName}
      />
      <main className="main">
        {view === "dashboard" && (
          <Dashboard dailies={dailies} studentName={session.studentName} onNavigate={setView} />
        )}
        {view === "schedule" && <Schedule />}
        {view === "syllabus" && <Syllabus />}
        {view === "grades" && <Grades />}
        {view === "books" && <Books />}
        {view === "dailies" && <Dailies dailies={dailies} />}
        {view === "focus" && <Focus />}
        {view === "leaderboard" && <Leaderboard />}
        {view === "ai" && <AI />}
        {view === "profile" && <Profile studentId={session.studentId} studentName={session.studentName} />}
        {view === "settings" && <Settings onLogout={logout} />}
      </main>
    </div>
  );
}

export default App;
