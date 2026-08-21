import { useState } from "react";
import "./App.css";
import { Sidebar, type ViewKey } from "./components/Sidebar";
import { Dashboard } from "./views/Dashboard";
import { Schedule } from "./views/Schedule";
import { Syllabus } from "./views/Syllabus";
import { Dailies } from "./views/Dailies";
import { Focus } from "./views/Focus";
import { Leaderboard } from "./views/Leaderboard";
import { AI } from "./views/AI";
import { Settings } from "./views/Settings";
import { Login } from "./views/Login";
import { useDailies } from "./store/useDailies";
import { getSession, signOut, type Session } from "./auth/session";

function App() {
  const [session, setSession] = useState<Session | null>(() => getSession());
  const [view, setView] = useState<ViewKey>("dashboard");
  const dailies = useDailies();

  if (!session) {
    return <Login onSignedIn={setSession} />;
  }

  const pending = dailies.items.filter((d) => !d.done).length;

  const logout = () => {
    signOut();
    setSession(null);
    setView("dashboard");
  };

  return (
    <div className="app">
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
        {view === "dailies" && <Dailies dailies={dailies} />}
        {view === "focus" && <Focus />}
        {view === "leaderboard" && <Leaderboard />}
        {view === "ai" && <AI />}
        {view === "settings" && <Settings onLogout={logout} />}
      </main>
    </div>
  );
}

export default App;
