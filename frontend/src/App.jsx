import { Routes, Route, Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Layout from "./components/layout/Layout";
import HomePage from "./components/pages/HomePage";
import LoginPage from "./components/pages/LoginPage";
import SignupPage from "./components/pages/SignupPage";
import ProfilePage from "./components/pages/ProfilePage";
import NotificationsPage from "./components/pages/NotificationsPage";
import LoadingSpinner from "./components/common/LoadingSpinner";

function App() {
  const { data: authUser, isLoading } = useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (data.error) return null;
      return data;
    },
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-surface-0">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          authUser ? (
            <Layout authUser={authUser}>
              <HomePage authUser={authUser} />
            </Layout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/profile/:username"
        element={
          authUser ? (
            <Layout authUser={authUser}>
              <ProfilePage authUser={authUser} />
            </Layout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/notifications"
        element={
          authUser ? (
            <Layout authUser={authUser}>
              <NotificationsPage />
            </Layout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/login"
        element={!authUser ? <LoginPage /> : <Navigate to="/" replace />}
      />
      <Route
        path="/signup"
        element={!authUser ? <SignupPage /> : <Navigate to="/" replace />}
      />
    </Routes>
  );
}

export default App;