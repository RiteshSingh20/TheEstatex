import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Building, User, Phone, Mail, Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { GoogleMap, useLoadScript, Marker } from "@react-google-maps/api";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import Button from "../components/ui/Button";
import { useAuth } from "../utils/authContext";
import { fetchStates, fetchCities } from "../utils/api";
import { State, City } from "../types";
import { generateId } from "../utils/localStorage";
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
} from "firebase/auth";
import app from "../../src/utils/firebase";

declare global {
  interface Window {
    recaptchaVerifier: RecaptchaVerifier;
  }
}

const mapContainerStyle = {
  width: "100%",
  height: "300px",
};

const center = {
  lat: 19.076,
  lng: 72.8777,
};

interface SignupFormData {
  fullName: string;
  firmName?: string;
  phone: string;
  email: string;
  reraNumber: string;
  state: string;
  city: string;
  password: string;
  confirmPassword: string;
}

const Signup = () => {
  const { signup, user, checkPhoneExists } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [selectedStateCode, setSelectedStateCode] = useState("");
  const [markerPosition, setMarkerPosition] = useState(center);
  const [step, setStep] = useState(1); // Step 1: Phone verification
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] =
    useState<ConfirmationResult | null>(null);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [showOtpField, setShowOtpField] = useState(false);
  const [otpSending, setOtpSending] = useState(false);

  // Initialize Firebase auth
  const auth = getAuth(app);

  // Initialize Recaptcha
  useEffect(() => {
    window.recaptchaVerifier = new RecaptchaVerifier(
      auth,
      "recaptcha-container",
      {
        size: "invisible",
        callback: () => {
          // reCAPTCHA solved, allow sendOTP
        },
      }
    );
  }, [auth]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    trigger,
    // setValue,
  } = useForm<SignupFormData>();

  const password = watch("password");
  const phone = watch("phone");

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: "AIzaSyDmzDIeYZ2uxW1L317vDrWJ3zxEP8WB5ps",
  });

  useEffect(() => {
    // If user is set after signup, navigate
    if (user && step === 3) {
      navigate("/subscription");
    }
  }, [user, step, navigate]);

  useEffect(() => {
    const loadStates = async () => {
      try {
        const statesData = await fetchStates();
        setStates(statesData);
      } catch (error: unknown) {
        
        toast.error("Failed to load states. Please try again later.");
      }
    };
    loadStates();
  }, []);

  // Send OTP to phone
  const sendOTP = async () => {
    if (!phone) {
      toast.error("Phone number is required");
      return;
    }

    if (!/^[0-9]{10}$/.test(phone)) {
      toast.error("Please enter a valid 10-digit phone number");
      return;
    }

    // Check if phone number already exists
    const phoneExists = await checkPhoneExists(phone);
    if (phoneExists) {
      toast.error("This phone number is already registered. Please use a different number or try logging in.");
      return;
    }

    // Show OTP field immediately
    setShowOtpField(true);
    setOtpSending(true);

    try {
      const formattedPhone = `+91${phone}`;
      const confirmation = await signInWithPhoneNumber(
        auth,
        formattedPhone,
        window.recaptchaVerifier
      );

      setConfirmationResult(confirmation);
      setIsOtpSent(true);
      setOtpSending(false);
      toast.success("OTP sent successfully!");
    } catch (error: unknown) {
      
      setShowOtpField(false);
      setOtpSending(false);
      toast.error(
        `Failed to send OTP: ${
          typeof error === "object" && error !== null && "message" in error
            ? (error as { message: string }).message
            : "Unknown error"
        }`
      );
    }
  };

  // Verify OTP
  const verifyOTP = async () => {
    if (!confirmationResult) return;

    try {
      await confirmationResult.confirm(otp);
      toast.success("Phone number verified!");
      setStep(2); // Move to personal info step after verification
    } catch (error: unknown) {
      
      toast.error("Invalid OTP. Please try again.");
    }
  };

  const handleStateChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const stateCode = e.target.value;
    setSelectedStateCode(stateCode);
    if (stateCode) {
      try {
        const citiesData = await fetchCities(stateCode);
        setCities(citiesData);
      } catch (error: unknown) {
        
        toast.error("Failed to load cities. Please try again later.");
        setCities([]);
      }
    } else {
      setCities([]);
    }
  };

  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const newPos = {
        lat: e.latLng.lat(),
        lng: e.latLng.lng(),
      };
      setMarkerPosition(newPos);
    }
  };

  const nextStep = async () => {
    if (step === 2) {
      const isValid = await trigger([
        "fullName",
        "email",
        "reraNumber",
        "password",
        "confirmPassword",
      ]);
      if (isValid) {
        setStep(3); // Move to location step
      }
    }
  };

  const prevStep = () => {
    if (step === 2) {
      setStep(1); // Back to phone verification
    } else if (step === 3) {
      setStep(2); // Back to personal info
    }
  };

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true);
    try {
      if (data.password !== data.confirmPassword) {
        toast.error("Passwords do not match");
        setIsLoading(false);
        return;
      }

      const userData = {
        id: generateId(),
        fullName: data.fullName,
        firmName: data.firmName,
        phone: phone, // Use the phone from step 1
        email: data.email,
        reraNumber: data.reraNumber,
        state: data.state,
        city: data.city,
        password: data.password,
        location: markerPosition,
        subscriptionLocations: [],
      };

      const success = await signup(userData);
      if (success) {
        // Set flag to indicate recent signup
        localStorage.setItem('justSignedUp', 'true');
        toast.success("Account created successfully!");
        navigate("/subscription");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
      {/* Recaptcha container (invisible) */}
      <div id="recaptcha-container"></div>
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Building className="h-12 w-12 text-accent" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-neutral-900">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-neutral-600">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-medium text-accent hover:text-accent-dark"
          >
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <Card>
          {/* Step indicators */}
          <div className="mb-6">
            <div className="flex items-center">
              <div
                className={`flex-1 border-t-2 ${
                  step >= 1 ? "border-accent" : "border-neutral-300"
                }`}
              ></div>
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                  step >= 1 ? "bg-accent" : "bg-neutral-300"
                }`}
              >
                1
              </div>
              <div
                className={`flex-1 border-t-2 ${
                  step >= 2 ? "border-accent" : "border-neutral-300"
                }`}
              ></div>
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                  step >= 2 ? "bg-accent" : "bg-neutral-300"
                }`}
              >
                2
              </div>
              <div
                className={`flex-1 border-t-2 ${
                  step >= 3 ? "border-accent" : "border-neutral-300"
                }`}
              ></div>
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                  step >= 3 ? "bg-accent" : "bg-neutral-300"
                }`}
              >
                3
              </div>
              <div className="flex-1 border-t-2 border-neutral-300"></div>
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-sm font-medium text-neutral-700 w-1/3 text-center">
                Verify Phone
              </span>
              <span className="text-sm font-medium text-neutral-700 w-1/3 text-center">
                Personal Info
              </span>
              <span className="text-sm font-medium text-neutral-700 w-1/3 text-center">
                Location
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Step 1: Phone Verification */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-lg font-medium text-neutral-900">
                    Verify Your Phone Number
                  </p>
                  <p className="text-sm text-neutral-600 mt-2">
                    We'll send you a verification code
                  </p>
                </div>

                <Input
                  id="phone"
                  label="Phone Number"
                  type="tel"
                  autoComplete="tel"
                  error={errors.phone?.message}
                  {...register("phone", {
                    required: "Phone number is required",
                    pattern: {
                      value: /^[0-9]{10}$/,
                      message: "Please enter a valid 10-digit phone number",
                    },
                  })}
                  icon={<Phone className="h-5 w-5 text-neutral-400" />}
                />

                {showOtpField && (
                  <Input
                    id="otp"
                    label={otpSending ? "Sending OTP..." : "OTP Code"}
                    type="text"
                    value={otp}
                    onChange={(e) =>
                      setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    placeholder={otpSending ? "Please wait..." : "Enter 6-digit code"}
                    disabled={otpSending}
                  />
                )}

                <div className="pt-4 flex flex-col gap-3">
                  {!showOtpField ? (
                    <Button
                      type="button"
                      variant="primary"
                      onClick={sendOTP}
                      fullWidth
                    >
                      Send OTP
                    </Button>
                  ) : (
                    <>
                      <Button
                        type="button"
                        variant="primary"
                        onClick={verifyOTP}
                        disabled={otp.length !== 6 || !isOtpSent}
                        isLoading={otpSending}
                        fullWidth
                      >
                        {otpSending ? "Sending OTP..." : "Verify OTP"}
                      </Button>
                      {isOtpSent && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setIsOtpSent(false);
                            setShowOtpField(false);
                            setOtpSending(false);
                            setOtp("");
                          }}
                          fullWidth
                        >
                          Resend OTP
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Personal Info */}
            {step === 2 && (
              <div className="space-y-4">
                <Input
                  id="fullName"
                  label="Full Name"
                  autoComplete="name"
                  error={errors.fullName?.message}
                  {...register("fullName", {
                    required: "Full name is required",
                  })}
                  icon={<User className="h-5 w-5 text-neutral-400" />}
                />

                <Input
                  id="firmName"
                  label="Firm Name (Optional)"
                  error={errors.firmName?.message}
                  {...register("firmName")}
                />

                <Input
                  id="email"
                  label="Email address"
                  type="email"
                  autoComplete="email"
                  error={errors.email?.message}
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                      message: "Invalid email address",
                    },
                  })}
                  icon={<Mail className="h-5 w-5 text-neutral-400" />}
                />

                <Input
                  id="reraNumber"
                  label="RERA Number"
                  error={errors.reraNumber?.message}
                  {...register("reraNumber", {
                    required: "RERA number is required",
                  })}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="relative">
                    <Input
                      id="password"
                      label="Password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
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
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-neutral-500" />
                      ) : (
                        <Eye className="h-5 w-5 text-neutral-500" />
                      )}
                    </button>
                  </div>

                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      label="Confirm Password"
                      type={showConfirmPassword ? "text" : "password"}
                      autoComplete="new-password"
                      error={errors.confirmPassword?.message}
                      {...register("confirmPassword", {
                        required: "Please confirm your password",
                        validate: (value) =>
                          value === password || "Passwords do not match",
                      })}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      tabIndex={-1}
                      aria-label={
                        showConfirmPassword
                          ? "Hide confirm password"
                          : "Show confirm password"
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5 text-neutral-500" />
                      ) : (
                        <Eye className="h-5 w-5 text-neutral-500" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="pt-4 flex space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(1)}
                  >
                    Back
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    onClick={nextStep}
                    fullWidth
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Location */}
            {step === 3 && (
              <div className="space-y-4">
                <Select
                  id="state"
                  label="State"
                  options={states.map((state) => ({
                    value: state.iso2,
                    label: state.name,
                  }))}
                  error={errors.state?.message}
                  {...register("state", {
                    required: "State is required",
                  })}
                  onChange={(e) => {
                    handleStateChange(e);
                    register("state").onChange(e);
                  }}
                />

                <Select
                  id="city"
                  label="City"
                  options={cities.map((city) => ({
                    value: city.name,
                    label: city.name,
                    key: `${city.id}-${city.name}`, // Ensure unique keys
                  }))}
                  error={errors.city?.message}
                  disabled={!selectedStateCode}
                  {...register("city", { required: "City is required" })}
                />

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Pin Your Location on Map
                  </label>
                  <div className="rounded-md overflow-hidden border border-neutral-300">
                    {!isLoaded ? (
                      <div className="h-[300px] bg-neutral-100 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-accent"></div>
                      </div>
                    ) : (
                      <GoogleMap
                        mapContainerStyle={mapContainerStyle}
                        center={center}
                        zoom={12}
                        onClick={handleMapClick}
                      >
                        <Marker
                          position={markerPosition}
                          options={{
                            title: "Your office location",
                            optimized: true,
                          }}
                        />
                      </GoogleMap>
                    )}
                  </div>
                  <p className="text-sm text-neutral-500 mt-1">
                    Click on the map to set your office location
                  </p>
                </div>

                <div className="pt-4 flex space-x-4">
                  <Button type="button" variant="outline" onClick={prevStep}>
                    Back
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    isLoading={isLoading}
                    fullWidth
                  >
                    Create Account
                  </Button>
                </div>
              </div>
            )}
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Signup;
