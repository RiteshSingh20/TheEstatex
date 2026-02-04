import { useEffect, lazy, Suspense } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Layout from "./components/Layout";
import { useAuth } from "./utils/authContext";

// Lazy loaded components
const Home = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const Dashboard = lazy(() => import("./pages/DashboardComponents/Dashboard/Dashboard"));
const Inventory = lazy(() => import("./pages/Inventory"));
const PropertyManagement = lazy(() => import("./pages/brokerInventory/PropertyFormSelector"));
const Profile = lazy(() => import("./pages/Profile"));
const Subscription = lazy(() => import("./pages/Subscription"));
const SubscriptionCheckout = lazy(() => import("./pages/SubscriptionCheckout"));
const Admin = lazy(() => import("./components/Admin Components/Admin"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Compare = lazy(() => import("./components/CompareComponents/Compare"));
const Pricing = lazy(() => import("./pages/Pricing"));
const AboutUs = lazy(() => import("./pages/AboutUs"));
const ContactSettings = lazy(() => import("./pages/ContactSettings"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));

// Loading component
const Loading = () => (
  <div className="min-h-screen flex items-center justify-center bg-neutral-50">
    <div className="animate-pulse flex flex-col items-center">
      <div className="h-12 w-12 rounded-full bg-primary mb-4"></div>
      <div className="h-4 w-32 bg-neutral-200 rounded"></div>
    </div>
  </div>
);

// Protected route component
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loading />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

// Admin route component - for users with admin panel access
const AdminRoute = ({ children }: { children: JSX.Element }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loading />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Allow admin, manager, and executive roles to access admin panel
  if (!["admin", "manager", "executive"].includes(user.role)) {
    return <Navigate to="/dashboard" state={{ from: location }} replace />;
  }

  return children;
};

// New component for login route to fix hook order violation
const LoginRoute = () => {
  const { user, loading } = useAuth();

  if (loading) return <Loading />;
  
  // If user is authenticated, show dashboard content instead of redirecting
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Login />;
};

// New component for signup route to fix hook order violation
const SignupRoute = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Loading />;
  if (user) {
    // For signup, redirect to subscription for new users
    const from = location.state?.from?.pathname || "/subscription";
    return <Navigate to={from} replace />;
  }
  return <Signup />;
};

function App() {
  const { loading } = useAuth();
  const location = useLocation();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Wait for auth state to resolve before rendering routes
  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<LoginRoute />} />
          <Route path="signup" element={<SignupRoute />} />
          <Route
            path="dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="inventory"
            element={
              <ProtectedRoute>
                <Inventory />
              </ProtectedRoute>
            }
          />
          <Route
            path="property-management"
            element={
              <ProtectedRoute>
                <PropertyManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="brokerInventory"
            element={
              <ProtectedRoute>
                <PropertyManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="subscription"
            element={
              <ProtectedRoute>
                <Subscription />
              </ProtectedRoute>
            }
          />
          <Route
            path="subscription/checkout"
            element={
              <ProtectedRoute>
                <SubscriptionCheckout />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin"
            element={
              <AdminRoute>
                <Admin />
              </AdminRoute>
            }
          />
          <Route
            path="compare"
            element={
              <ProtectedRoute>
                <Compare />
              </ProtectedRoute>
            }
          />
          <Route path="pricing" element={<Pricing />} />
          <Route path="about-us" element={<AboutUs />} />
          <Route path="privacy-policy" element={<PrivacyPolicy />} />
          <Route
            path="contact-settings"
            element={
              <AdminRoute>
                <ContactSettings />
              </AdminRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;
