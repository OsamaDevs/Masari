import {
  BrowserRouter as Router,
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
import Assessment from "./pages/Assessment";
import InterestAssessment from "./pages/InterestAssessment";
import Fields from "./pages/Fields";
import { getCurrentUser, logoutUser } from "./services/auth";
import { LanguageProvider, useLanguage } from "./hooks/useLanguage.jsx";
import BrandLogo from './components/BrandLogo'

const navItems = [
  { to: "/dashboard", labelKey: "nav.dashboard" },
  { to: "/craft-roadmap", labelKey: "nav.craftRoadmap" },
];

function RequireAuth({ children }) {
  return getCurrentUser() ? children : <Navigate to="/login" replace />;
}

function AppShell() {
  const authUser = getCurrentUser();
  const { isArabic, toggleLanguage, t } = useLanguage();

  return (
    <Router>
    <div dir={isArabic ? "rtl" : "ltr"} className="min-h-screen bg-masari-deep text-masari-light">
      <header className="sticky top-0 z-40 border-b border-masari-accent bg-masari-deep/90 backdrop-blur">
          <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center gap-2 px-4 py-3 md:px-8">
            <BrandLogo compact withSubtitle={false} className="me-1" to="/home" />

            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                    isActive
                      ? "bg-masari-primary text-white"
                      : "text-masari-light hover:bg-gray-800 hover:text-masari-light"
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
                className="inline-flex items-center gap-2 rounded-lg border border-masari-accent px-3 py-1.5 text-sm font-semibold text-masari-light transition hover:border-masari-primary hover:text-masari-primary"
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
                  className="rounded-lg border border-masari-accent px-3 py-1.5 text-sm font-semibold text-masari-light transition hover:border-masari-primary hover:text-masari-primary"
                >
                  {t("app.logout")}
                </button>
              )}
            </div>
          </div>
        </header>

        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/craft-roadmap" element={<Roadmap />} />
          <Route path="/roadmap" element={<Roadmap />} />
          <Route path="/roadmap/:jobId" element={<Roadmap />} />
          <Route path="/craft-roadmap/fields" element={<Fields />} />
          <Route path="/craft-roadmap/jobs" element={<JobDetails />} />
          <Route path="/craft-roadmap/jobs/:jobId" element={<JobDetails />} />
          <Route path="*" element={<Navigate to="/home" replace />} />
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


