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
} from "lucide-react";
import { useAuth } from "../../utils/authContext";
import Button from "../ui/Button";
import logo from "../../assets/logo.png";

const Navbar: React.FC = () => {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
                      {user.role === "admin" ? "Admin" : user.role === "manager" ? "Manager" : "Executive"}
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
                      {user.role === "admin" ? "Admin" : user.role === "manager" ? "Manager" : "Executive"}
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