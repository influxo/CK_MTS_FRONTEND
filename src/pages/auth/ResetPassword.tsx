import { useEffect, useState } from "react";
import { Form, useNavigate, useLocation } from "react-router-dom";
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
import caritas from "../../../public/images/caritas.jpg";
import logo from "../../../public/images/logo.jpg";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "../../components/ui/data-display/carousel";
import reactLogo from "../../assets/react.svg";

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    resetPassword,
    isAuthenticated,
    isLoading: authLoading,
    error: authError,
  } = useAuth();

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Get the intended destination from location state, or default to dashboard
  const from = location.state?.from?.pathname || "/dashboard";

  useEffect(() => {
    // Only redirect if already authenticated
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await resetPassword(formData);
      // Navigation is handled in the useEffect
    } catch (err) {
      console.error("Reset Password error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading = authLoading || isSubmitting;

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 h-screen bg-white overflow-hidden">
      {/* Left: Image slider (60%) */}
      <div className="relative hidden md:block md:col-span-3 bg-black h-full">
        <Carousel opts={{ loop: true }} className="h-full">
          <CarouselContent className="h-full">
            <CarouselItem className="h-full">
              <img
                src={caritas}
                alt="Slide 1"
                className="w-full h-full object-cover"
              />
            </CarouselItem>
            <CarouselItem className="h-full">
              <img
                src={reactLogo}
                alt="Slide 2"
                className="w-full h-full object-cover"
              />
            </CarouselItem>
            <CarouselItem className="h-full">
              <img
                src="/vite.svg"
                alt="Slide 3"
                className="w-full h-full object-cover"
              />
            </CarouselItem>
          </CarouselContent>
        </Carousel>
      </div>
      {/* Right: Reset form (40%) */}
      <div className="md:col-span-2 h-full px-6 py-6 flex flex-col min-h-0">
        <div className="h-[250px] shrink-0 flex items-center justify-center">
          <img src={logo} alt="Logo" className="h-full w-auto object-contain" />
        </div>
        <div className="flex-1 overflow-y-auto flex justify-center items-start pt-4">
          <Card className="w-full max-w-md border-0">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center">
                Reset Password
              </CardTitle>
              <CardDescription className="text-center">
                Create new password
              </CardDescription>
            </CardHeader>
            <CardContent>
              {authError && (
                <Alert
                  variant="destructive"
                  className="mb-4 border-0 bg-[#E5ECF6]"
                >
                  <AlertDescription>{authError}</AlertDescription>
                </Alert>
              )}
              <Form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>New Password</Label>
                  <div className="relative">
                    <Input
                      className="pr-10 bg-black/5 border-0 focus:ring-1 focus:border-1 focus:ring-black/5 focus:border-black/5"
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      disabled={isLoading}
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
                </div>
                <div className="space-y-2">
                  <Label>Confirm New Password</Label>
                  <div className="relative">
                    <Input
                      className="pr-10 bg-black/5 border-0 focus:ring-1 focus:border-1 focus:ring-black/5 focus:border-black/5"
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirm ? "text" : "password"}
                      placeholder="••••••••"
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      disabled={isLoading}
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
                </div>
                <Button
                  type="submit"
                  className="w-full bg-[#2E343E] text-white"
                  disabled={isLoading}
                >
                  {isLoading ? "Resetting Password..." : "Reset Password"}
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

export default ResetPassword;
