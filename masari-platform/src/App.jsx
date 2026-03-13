import {
  BrowserRouter as Router,
  Link,
  NavLink,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import JobDetails from "./pages/JobDetails";
import Roadmap from "./pages/RoadMap";
import CourseAnalysis from "./pages/CourseAnalysis";
import { getCurrentUser, logoutUser } from "./services/auth";
import { LanguageProvider, useLanguage } from "./hooks/useLanguage.jsx";

const navItems = [
  { to: "/dashboard", labelKey: "nav.dashboard" },
  { to: "/job", labelKey: "nav.job" },
  { to: "/roadmap", labelKey: "nav.roadmap" },
  { to: "/course-analysis", labelKey: "nav.courseAnalysis" },
];

function RequireAuth({ children }) {
  return getCurrentUser() ? children : <Navigate to="/login" replace />;
}

function AppShell() {
  const authUser = getCurrentUser();
  const { isArabic, toggleLanguage, t } = useLanguage();

  return (
    <Router>
      <div dir={isArabic ? "rtl" : "ltr"} className="min-h-screen bg-slate-950 text-slate-100">
        <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/90 backdrop-blur">
          <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center gap-2 px-4 py-3 md:px-8">
            <Link to="/home" className="font-display text-lg font-bold text-white">
              {t("app.brand")}
            </Link>

            {authUser &&
              navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                      isActive
                        ? "bg-cyan-400 text-slate-950"
                        : "text-slate-300 hover:bg-slate-800 hover:text-white"
                    }`
                  }
                >
                  {t(item.labelKey)}
                </NavLink>
              ))}

            <div className="ml-auto flex items-center gap-2">
              <button
                type="button"
                onClick={toggleLanguage}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-1.5 text-sm font-semibold text-slate-200 transition hover:border-cyan-300 hover:text-cyan-200"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M2 12h20"></path>
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                </svg>
                <span>{t("app.language")}</span>
              </button>

              {authUser && (
                <button
                  type="button"
                  onClick={() => {
                    logoutUser();
                    window.location.href = "/login";
                  }}
                  className="rounded-lg border border-slate-700 px-3 py-1.5 text-sm font-semibold text-slate-200 transition hover:border-cyan-300 hover:text-cyan-200"
                >
                  {t("app.logout")}
                </button>
              )}
            </div>
          </div>
        </header>

        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/home" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <RequireAuth>
                <Dashboard />
              </RequireAuth>
            }
          />
          <Route
            path="/job"
            element={
              <RequireAuth>
                <JobDetails />
              </RequireAuth>
            }
          />
          <Route
            path="/job/:jobId"
            element={
              <RequireAuth>
                <JobDetails />
              </RequireAuth>
            }
          />
          <Route
            path="/roadmap"
            element={
              <RequireAuth>
                <Roadmap />
              </RequireAuth>
            }
          />
          <Route
            path="/roadmap/:jobId"
            element={
              <RequireAuth>
                <Roadmap />
              </RequireAuth>
            }
          />
          <Route
            path="/course-analysis"
            element={
              <RequireAuth>
                <CourseAnalysis />
              </RequireAuth>
            }
          />
          <Route
            path="/course-analysis/:courseId"
            element={
              <RequireAuth>
                <CourseAnalysis />
              </RequireAuth>
            }
          />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

function App() {
  return (
    <LanguageProvider>
      <AppShell />
    </LanguageProvider>
  )
}

export default App;


