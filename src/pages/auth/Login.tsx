import { useEffect, useState } from "react";
import { Form, useLocation, useNavigate } from "react-router-dom";
import caritas from "../../../public/images/caritas.jpg";
import logo from "../../../public/images/logo.jpg";
// import donation from "../../../public/images/donation.jpg";
// import volunteer from "../../../public/images/volunteer.jpg";
import { Eye, EyeOff } from "lucide-react";
import donation from "../../../public/images/donation.jpg";
import volunteer from "../../../public/images/volunteer.jpg";
import { Button } from "../../components/ui/button/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/data-display/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "../../components/ui/data-display/carousel";
import { Alert, AlertDescription } from "../../components/ui/feedback/alert";
import { Input } from "../../components/ui/form/input";
import { Label } from "../../components/ui/form/label";
import { useAuth } from "../../hooks/useAuth";
import { useTranslation } from "../../hooks/useTranslation";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const {
    login,
    isAuthenticated,
    isLoading: authLoading,
    error: authError,
  } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [carouselApi, setCarouselApi] = useState<CarouselApi | null>(null);

  const sliderImages = [caritas, donation, volunteer];

  // Get the intended destination from location state, or default to dashboard
  const from = location.state?.from?.pathname || "/dashboard";

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
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await login(formData);
      // Navigation is handled in the useEffect
    } catch (err) {
      console.error("Login error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading = authLoading || isSubmitting;

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 min-h-[100dvh] md:h-screen bg-white overflow-hidden">
      {/* Left: Image slider (60%) */}
      <div className="relative hidden md:block md:col-span-3 bg-black h-full min-h-0">
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
      {/* Right: Login form (40%) */}

      <div className="md:col-span-2 h-full min-h-0 px-4 sm:px-6 py-4 sm:py-6 flex flex-col">
        <div className="h-24 sm:h-32 md:h-[250px] shrink-0 flex items-center justify-center">
          <img src={logo} alt="Logo" className="h-full w-auto object-contain" />
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto flex justify-center items-center md:items-start pt-4">
          <Card className="w-full border-0 max-w-md">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center">
                {t('auth.login')}
              </CardTitle>
              <CardDescription className="text-center">
                {t('auth.loginSubtitle')}
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
              <Form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>{t('common.email')}</Label>
                  <Input
                    className="bg-black/5 border-0 focus:ring-1 focus:border-1 focus:ring-black/5 focus:border-black/5  "
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
                    <Label>{t('common.password')}</Label>
                    <a
                      href="/forgot-password"
                      className="text-sm text-[#00a6ff]  "
                    >
                      {t('auth.forgotPassword')}
                    </a>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      disabled={isLoading}
                      className="pr-10 bg-black/5 border-0 focus:ring-1 focus:border-1 focus:ring-black/5 focus:border-black/5"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      title={showPassword ? "Hide password" : "Show password"}
                      disabled={isLoading}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full bg-[#2E343E] text-white"
                  disabled={isLoading}
                >
                  {isLoading ? t('auth.loggingIn') : t('auth.logIn')}
                </Button>
              </Form>
            </CardContent>
            <CardFooter className="flex justify-center">
              <p className="text-sm text-gray-500">
                {t('auth.noAccount')}
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login;
