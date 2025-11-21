import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Building, Mail, EyeOff, Eye } from "lucide-react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import { useAuth } from "../utils/authContext";

interface LoginFormData {
  email: string;
  password: string;
}

const Login = () => {
  const { login, resetPassword } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      const success = await login(data.email, data.password);

      if (success) {
        toast.success("Login successful!");
        navigate("/");
      }
      // Remove duplicate error handling - auth context handles all errors
    } catch (error) {
      console.error(error);
      // Remove duplicate error handling - auth context handles all errors
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) {
      toast.error("Please enter your email address");
      return;
    }
    try {
      setResetLoading(true);
      await resetPassword(resetEmail);
      toast.success("Password reset email sent! Please check your inbox.");
      setShowResetModal(false);
      setResetEmail("");
    } catch (error) {
      console.error(error);
      toast.error("Failed to send password reset email. Please try again.");
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Building className="h-12 w-12 text-accent" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-neutral-900">
          Welcome back
        </h2>
        <p className="mt-2 text-center text-sm text-neutral-600">
          Or{" "}
          <Link
            to="/signup"
            className="font-medium text-accent hover:text-accent-dark"
          >
            create a new account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card>
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <Input
              id="email"
              label="Email address"
              type="email"
              autoComplete="email"
              error={errors.email?.message}
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address",
                },
              })}
              icon={<Mail className="h-5 w-5 text-neutral-400" />}
            />

            <div className="relative">
              <Input
                id="password"
                label="Password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                error={errors.password?.message}
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
                  },
                })}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[38px] text-neutral-500 hover:text-neutral-700 focus:outline-none"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-accent focus:ring-accent border-neutral-300 rounded"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-neutral-700"
                >
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <button
                  type="button"
                  onClick={() => setShowResetModal(true)}
                  className="font-medium text-accent hover:text-accent-dark"
                >
                  Forgot your password?
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              fullWidth
              isLoading={isLoading}
            >
              Sign in
            </Button>
          </form>
        </Card>
      </div>

      {showResetModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Reset Password</h3>
            <form onSubmit={handleResetSubmit} className="space-y-4">
              <Input
                id="resetEmail"
                label="Email address"
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                required
                icon={<Mail className="h-5 w-5 text-neutral-400" />}
              />
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowResetModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" isLoading={resetLoading}>
                  Send Reset Email
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;

