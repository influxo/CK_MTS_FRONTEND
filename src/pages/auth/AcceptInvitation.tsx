import { useEffect, useState } from "react";
import { Form, useNavigate, useLocation } from "react-router-dom";
import caritas from "../../../public/images/caritas.jpg";
import logo from "../../../public/images/logo.jpg";
import { useAuth } from "../../hooks/useAuth";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/data-display/card";
import { Alert, AlertDescription } from "../../components/ui/feedback/alert";
import { Label } from "../../components/ui/form/label";
import { Input } from "../../components/ui/form/input";
import { Button } from "../../components/ui/button/button";
import { Eye, EyeOff } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "../../components/ui/data-display/carousel";
import reactLogo from "../../assets/react.svg";

const AcceptInvitation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    acceptInvitationUser,
    isAuthenticated,
    isLoading: authLoading,
    error: authError,
  } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [token, setToken] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [carouselApi, setCarouselApi] = useState<CarouselApi | null>(null);

  const sliderImages = [caritas, reactLogo, "/vite.svg"];

  // Get the intended destination from location state, or default to dashboard
  const from = location.state?.from?.pathname || "/dashboard";

  useEffect(() => {
    // Parse token and email from the URL query parameters
    const params = new URLSearchParams(location.search);
    const t = params.get("token") || "";
    const emailParam = params.get("email") || "";
    setToken(t);
    if (emailParam) {
      setFormData((prev) => ({
        ...prev,
        email: decodeURIComponent(emailParam),
      }));
    }
  }, [location.search]);

  useEffect(() => {
    // Only redirect if already authenticated
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  useEffect(() => {
    if (!carouselApi) return;
    const id = setInterval(() => {
      if (!carouselApi) return;
      if (carouselApi.canScrollNext()) carouselApi.scrollNext();
      else carouselApi.scrollTo(0);
    }, 4000);
    return () => clearInterval(id);
  }, [carouselApi]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Clear validation error on input change
    setValidationError(null);
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Password complexity validation
    const minLenOk = formData.password.length >= 8;
    const hasUpper = /[A-Z]/.test(formData.password);
    const hasSpecial = /[^a-zA-Z0-9]/.test(formData.password);
    const passwordMeetsRules = minLenOk && hasUpper && hasSpecial;

    if (!passwordMeetsRules) {
      setValidationError(
        "Password must be at least 8 characters, include an uppercase letter and a special character."
      );
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setValidationError("Passwords do not match.");
      return;
    }
    setIsSubmitting(true);

    try {
      const ok = await acceptInvitationUser({
        email: formData.email,
        password: formData.password,
        token,
      });
      if (ok) {
        // Navigation is handled in the useEffect when isAuthenticated becomes true
      }
    } catch (err) {
      console.error("Login error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const minLenOk = formData.password.length >= 8;
  const hasUpper = /[A-Z]/.test(formData.password);
  const hasSpecial = /[^a-zA-Z0-9]/.test(formData.password);
  const passwordMeetsRules = minLenOk && hasUpper && hasSpecial;
  const passwordsMatch = formData.password === formData.confirmPassword;
  const isLoading = authLoading || isSubmitting;

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 h-screen bg-white overflow-hidden">
      {/* Left: Image slider (60%) */}
      <div className="relative hidden md:block md:col-span-3 bg-black h-full">
        <Carousel
          setApi={setCarouselApi}
          opts={{ loop: true }}
          className="h-full"
        >
          <CarouselContent className="h-full">
            {sliderImages.map((src, idx) => (
              <CarouselItem key={idx} className="h-full">
                <img
                  src={src}
                  alt={`Slide ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
      {/* Right: Accept Invitation form (40%) */}
      <div className="md:col-span-2 h-full px-6 py-6 flex flex-col">
        <div className="h-[250px] shrink-0 flex items-center justify-center">
          <img src={logo} alt="Logo" className="h-full w-auto object-contain" />
        </div>
        <div className="flex-1 overflow-y-auto flex justify-center items-start pt-4">
          <Card className="w-full border-0 max-w-md">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center">
                Accept Invitation
              </CardTitle>
              <CardDescription className="text-center">
                Set your password to activate your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              {authError && (
                <Alert
                  variant="destructive"
                  className="mb-4 bg-[#E5ECF6] border-0"
                >
                  <AlertDescription>{authError}</AlertDescription>
                </Alert>
              )}
              {validationError && (
                <Alert
                  variant="destructive"
                  className="mb-4 bg-[#E5ECF6] border-0"
                >
                  <AlertDescription>{validationError}</AlertDescription>
                </Alert>
              )}
              <Form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    className="bg-black/5 border-0 focus:ring-1 focus:border-1 focus:ring-black/5 focus:border-black/5"
                    id="email"
                    name="email"
                    type="email"
                    placeholder="name@example.com "
                    required
                    value={formData.email}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Password</Label>
                    <a
                      href="/forgot-password"
                      className="text-sm text-[#00a6ff]"
                    >
                      Forgot password?
                    </a>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      required
                      minLength={8}
                      pattern="(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}"
                      title="At least 8 characters, include an uppercase letter and a special character"
                      value={formData.password}
                      onChange={handleChange}
                      disabled={isLoading}
                      className="pr-10 bg-black/5 border-0 focus:ring-1 focus:border-1 focus:ring-black/5 focus:border-black/5"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      title={showPassword ? "Hide password" : "Show password"}
                      disabled={isLoading}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {formData.password && !passwordMeetsRules && (
                    <ul className="text-sm text-red-600 mt-1 list-disc pl-5">
                      {!minLenOk && <li>Minimum 8 characters</li>}
                      {!hasUpper && <li>At least one uppercase letter</li>}
                      {!hasSpecial && <li>At least one special character</li>}
                    </ul>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirm ? "text" : "password"}
                      placeholder="••••••••"
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      disabled={isLoading}
                      className="pr-10 bg-black/5 border-0 focus:ring-1 focus:border-1 focus:ring-black/5 focus:border-black/5"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((prev) => !prev)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                      aria-label={showConfirm ? "Hide password" : "Show password"}
                      title={showConfirm ? "Hide password" : "Show password"}
                      disabled={isLoading}
                    >
                      {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {formData.confirmPassword && !passwordsMatch && (
                    <p className="text-sm text-red-600 mt-1">
                      Passwords do not match.
                    </p>
                  )}
                </div>
                <Button
                  type="submit"
                  className="w-full bg-[#2E343E] text-white"
                  disabled={
                    isLoading ||
                    !token ||
                    !passwordsMatch ||
                    !passwordMeetsRules
                  }
                >
                  {isLoading ? "Accepting invitation..." : "Accept invitation"}
                </Button>
              </Form>
            </CardContent>
            <CardFooter className="flex justify-center">
              <p className="text-sm text-gray-500">
                Don't have an account? Contact your administrator.
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AcceptInvitation;
