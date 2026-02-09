import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  UserCircle,
  LogOut,
  Home,
  ListChecks,
  Settings,
  Menu,
  X,
  Bell,
} from "lucide-react";
import { useAuth } from "../../utils/authContext";
import Button from "../ui/Button";
import logo from "../../assets/EstateX-Logo.png";
import { doc, onSnapshot, Timestamp } from "firebase/firestore";
import { db } from "../../utils/firebase";

const Navbar: React.FC = () => {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = React.useRef<HTMLDivElement>(null);
  const [packageNameById, setPackageNameById] = useState<Record<string, string>>(
    {}
  );
  // Expiry window: 1 day.
  const EXPIRY_WINDOW_MS = 24 * 60 * 60 * 1000;

  const toDate = (value: unknown): Date | null => {
    if (!value) return null;
    if (value instanceof Date) return value;
    if (value instanceof Timestamp) return value.toDate();
    if (typeof value === "string" || typeof value === "number") {
      const d = new Date(value);
      return Number.isNaN(d.getTime()) ? null : d;
    }
    if (typeof value === "object" && "toDate" in (value as any)) {
      try {
        return (value as any).toDate();
      } catch {
        return null;
      }
    }
    return null;
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "--";
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  useEffect(() => {
    if (!user) return;
    const docRef = doc(db, "settings", "pricing");
    const unsubscribe = onSnapshot(docRef, (snap) => {
      if (!snap.exists()) {
        setPackageNameById({});
        return;
      }
      const data = snap.data();
      const packages = data.packages || {};
      const nextMap: Record<string, string> = {};

      if (packages.resaleRental) {
        Object.entries(packages.resaleRental).forEach(
          ([id, pkg]: [string, any]) => {
            nextMap[id] = pkg?.name || "Custom Package";
          }
        );
      }

      if (packages.newProperty) {
        Object.entries(packages.newProperty).forEach(
          ([id, pkg]: [string, any]) => {
            nextMap[id] = pkg?.name || "Custom Package";
          }
        );
      }

      setPackageNameById(nextMap);
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!showNotifications) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showNotifications]);

  const expiryNotifications =
    user?.role === "user" && Array.isArray(user?.subscriptions)
      ? user.subscriptions
          .filter((sub: any) => sub?.status === "active")
          .map((sub: any) => {
            const endDate = toDate(sub.endDate);
            const startDate = toDate(sub.startDate);
            if (!endDate) return null;
            const now = Date.now();
            const diff = endDate.getTime() - now;
            if (diff <= 0 || diff > EXPIRY_WINDOW_MS) return null;

            const packageName =
              (sub.packageId && packageNameById[sub.packageId]) ||
              (sub.type === "RR"
                ? "Rental & Resale"
                : sub.type === "ND"
                ? "New Properties"
                : "Subscription");

            return {
              id: sub.id || `${packageName}-${endDate.toISOString()}`,
              packageName,
              purchasedOn: formatDate(startDate),
              amount: sub.amount ?? sub.discountedPrice ?? 0,
              expiresOn: formatDate(endDate),
            };
          })
          .filter(Boolean)
      : [];

  const notificationTotal = expiryNotifications.length;
  const notificationBadgeText =
    notificationTotal > 9 ? "9+" : String(notificationTotal);

  useEffect(() => {
    setDropdownOpen(false);
    setMobileMenuOpen(false);
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path: string) => location.pathname === path;

  if (loading) return null;

  return (
    <header className="bg-white shadow-md border-b sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-3">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="Logo" className="h-12 w-15 object-contain" />
          </Link>

          {/* Desktop Navigation - Only shown on md screens and above */}
          <div className="hidden md:flex items-center gap-6">
            {user ? (
              <>
                <nav className="flex items-center gap-4">
                  <Link
                    to="/"
                    className={`flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition hover:text-primary ${
                      isActive("/")
                        ? "text-primary font-semibold"
                        : "text-gray-700"
                    }`}
                  >
                    <Home className="w-4 h-4" /> Home
                  </Link>
                  <Link
                    to="/dashboard"
                    className={`flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition hover:text-primary ${
                      isActive("/dashboard")
                        ? "text-primary font-semibold"
                        : "text-gray-700"
                    }`}
                  >
                    <ListChecks className="w-4 h-4" /> Dashboard
                  </Link>
                  {user.role === "user" && (
                    <div className="flex items-center gap-2">
                      <Link
                        to="/inventory"
                        className={`flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition hover:text-primary ${
                          isActive("/inventory")
                            ? "text-primary font-semibold"
                            : "text-gray-700"
                        }`}
                      >
                        Inventory
                      </Link>
                      <div className="relative" ref={notificationRef}>
                        <button
                          type="button"
                          onClick={() => setShowNotifications((prev) => !prev)}
                          className="relative inline-flex items-center justify-center h-8 w-8 rounded-full border border-neutral-200 bg-white text-neutral-700 shadow-sm hover:bg-neutral-50 transition-colors"
                          aria-label="Notifications"
                        >
                          <Bell className="h-4 w-4" />
                          {notificationTotal > 0 && (
                            <span className="absolute -top-1 -right-1 min-w-[18px] h-4 px-1 rounded-full bg-red-600 text-white text-[10px] font-semibold flex items-center justify-center">
                              {notificationBadgeText}
                            </span>
                          )}
                        </button>
                        {showNotifications && (
                          <div className="absolute right-0 mt-2 w-80 bg-white border border-neutral-200 rounded-lg shadow-lg z-50">
                            <div className="px-4 py-3 border-b border-neutral-100">
                              <div className="text-sm font-semibold text-neutral-900">
                                Notifications
                              </div>
                              
                            </div>
                            <div className="max-h-72 overflow-y-auto">
                              {notificationTotal === 0 ? (
                                <div className="px-4 py-6 text-sm text-neutral-500 text-center">
                                  No expiring subscriptions right now.
                                </div>
                              ) : (
                                expiryNotifications.map((item: any) => (
                                  <div
                                    key={item.id}
                                    className="px-4 py-3 border-b border-neutral-100 last:border-none"
                                  >
                                    <div className="text-sm font-semibold text-neutral-800">
                                      {item.packageName}
                                    </div>
                                    <div className="text-xs text-neutral-500 mt-1">
                                      Purchased on {item.purchasedOn} • ₹
                                      {Number(item.amount).toLocaleString("en-IN")}
                                    </div>
                                    <div className="text-xs text-red-600 mt-1 font-medium">
                                      Expires on {item.expiresOn}
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  {["admin", "manager", "executive"].includes(user.role) && (
                    <Link
                      to="/admin"
                      className={`flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition hover:text-primary ${
                        isActive("/admin")
                          ? "text-primary font-semibold"
                          : "text-gray-700"
                      }`}
                    >
                      <Settings className="w-4 h-4" />{" "}
                      {user.role === "admin"
                        ? "Admin"
                        : user.role === "manager"
                        ? "Manager"
                        : "Executive"}
                    </Link>
                  )}
                </nav>

                <div className="relative flex items-center gap-2">
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-800">
                      {user.fullName}
                    </div>
                    <div className="text-xs text-gray-500">{user.email}</div>
                  </div>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="relative focus:outline-none"
                  >
                    <UserCircle className="w-8 h-8 text-gray-600 hover:text-primary" />
                  </button>
                  {dropdownOpen && (
                    <div
                      className="absolute right-0 top-full mt-2 w-48 bg-white border rounded-md shadow-md z-10"
                      onMouseLeave={() => setDropdownOpen(false)}
                    >
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Profile
                      </Link>
                      <Link
                        to="/subscription"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        My Subscription
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      >
                        <div className="flex items-center">
                          <LogOut className="w-4 h-4 mr-2" /> Logout
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <Link to="/login">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-primary border-primary hover:bg-primary/10"
                  >
                    Login
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button variant="primary" size="sm">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button - shown only on small screens */}
          <button
            className="md:hidden p-2 rounded-md text-gray-600 hover:text-primary focus:outline-none"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile menu - shown only on small screens */}
        {mobileMenuOpen && (
          <nav className="md:hidden bg-white border-t border-b shadow-md z-40">
            <div className="flex flex-col py-2">
              {user ? (
                <>
                  <Link
                    to="/"
                    className={`flex items-center gap-1 px-4 py-2 text-sm font-medium transition hover:text-primary ${
                      isActive("/")
                        ? "text-primary font-semibold"
                        : "text-gray-700"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Home className="w-4 h-4" /> Home
                  </Link>
                  <Link
                    to="/dashboard"
                    className={`flex items-center gap-1 px-4 py-2 text-sm font-medium transition hover:text-primary ${
                      isActive("/dashboard")
                        ? "text-primary font-semibold"
                        : "text-gray-700"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <ListChecks className="w-4 h-4" /> Dashboard
                  </Link>
                  {user.role === "user" && (
                    <Link
                      to="/inventory"
                      className={`px-4 py-2 text-sm font-medium transition hover:text-primary ${
                        isActive("/inventory")
                          ? "text-primary font-semibold"
                          : "text-gray-700"
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Inventory
                    </Link>
                  )}
                  {["admin", "manager", "executive"].includes(user.role) && (
                    <Link
                      to="/admin"
                      className={`flex items-center gap-1 px-4 py-2 text-sm font-medium transition hover:text-primary ${
                        isActive("/admin")
                          ? "text-primary font-semibold"
                          : "text-gray-700"
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Settings className="w-4 h-4" />{" "}
                      {user.role === "admin"
                        ? "Admin"
                        : user.role === "manager"
                        ? "Manager"
                        : "Executive"}
                    </Link>
                  )}
                  <div className="border-t mt-2 pt-2">
                    <Link
                      to="/profile"
                      className="flex items-center gap-1 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <UserCircle className="w-4 h-4" /> Profile
                    </Link>
                    <Link
                      to="/subscription"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      My Subscription
                    </Link>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        handleLogout();
                      }}
                      className="w-full flex items-center gap-1 px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="block px-4 py-3 text-center font-medium text-primary border border-primary rounded-md mx-4 my-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="block px-4 py-3 text-center font-medium text-white bg-primary rounded-md mx-4 my-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Navbar;
