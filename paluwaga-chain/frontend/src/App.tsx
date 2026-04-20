import { Link, Navigate, Route, Routes, useLocation } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import CreateGroup from "./pages/CreateGroup";
import GroupDetail from "./pages/GroupDetail";
import Profile from "./pages/Profile";
import AuthPage from "./pages/AuthPage";
import ConnectWalletButton from "./components/wallet/ConnectWalletButton";
import { useAuthStore } from "./store/authStore";

const RequireAuth = ({ children }: { children: JSX.Element }) => {
  const location = useLocation();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace state={{ from: `${location.pathname}${location.search}` }} />;
  }

  return children;
};

const App = () => {
  const location = useLocation();
  const isHome = location.pathname === "/";
  const isDashboard = location.pathname === "/dashboard";
  const isGroupDetail = location.pathname.startsWith("/group/");
  const isAuth = location.pathname === "/auth";

  return (
    <div className="min-h-screen text-on-surface">
      {!isHome && !isDashboard && !isGroupDetail && !isAuth && (
        <header className="sticky top-0 z-20 border-b border-outline-variant bg-surface/80 backdrop-blur">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3">
            <Link to="/" className="font-headline text-2xl tracking-tight text-primary">
              PaluwagaChain
            </Link>

            <nav className="hidden items-center gap-6 text-sm font-semibold md:flex">
              <Link to="/dashboard" className="hover:text-primary">
                Dashboard
              </Link>
              <Link to="/create" className="hover:text-primary">
                Create Group
              </Link>
              <Link to="/profile" className="hover:text-primary">
                Profile
              </Link>
            </nav>

            <ConnectWalletButton />
          </div>
        </header>
      )}

      <main className={isHome || isDashboard || isGroupDetail ? "" : "mx-auto w-full max-w-6xl px-4 py-8"}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/create" element={<RequireAuth><CreateGroup /></RequireAuth>} />
          <Route path="/group/:id" element={<GroupDetail />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;
