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

  // Get the intended destination from location state, or default to dashboard
  const from = location.state?.from?.pathname || "/dashboard";

  useEffect(() => {
    // Parse token and email from the URL query parameters
    const params = new URLSearchParams(location.search);
    const t = params.get("token") || "";
    const emailParam = params.get("email") || "";
    setToken(t);
    if (emailParam) {
      setFormData((prev) => ({ ...prev, email: decodeURIComponent(emailParam) }));
    }
  }, [location.search]);

  useEffect(() => {
    // Only redirect if already authenticated
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

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
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
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
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{authError}</AlertDescription>
            </Alert>
          )}
          {validationError && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{validationError}</AlertDescription>
            </Alert>
          )}
          <Form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="name@example.com"
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
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Forgot password?
                </a>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                minLength={8}
                pattern="(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}"
                title="At least 8 characters, include an uppercase letter and a special character"
                value={formData.password}
                onChange={handleChange}
                disabled={isLoading}
              />
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
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={isLoading}
              />
              {formData.confirmPassword && !passwordsMatch && (
                <p className="text-sm text-red-600 mt-1">Passwords do not match.</p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={isLoading || !token || !passwordsMatch || !passwordMeetsRules}>
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
  );
};

export default AcceptInvitation;
