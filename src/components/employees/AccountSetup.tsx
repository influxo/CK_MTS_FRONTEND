import {
  Check,
  CheckCircle,
  Info,
  Key,
  Lock,
  Shield,
  Smartphone,
} from "lucide-react";
import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Progress } from "../ui/progress";
import { Switch } from "../ui/switch";

interface AccountSetupProps {
  token: string;
  onSetupComplete: () => void;
}

export function AccountSetup({ token, onSetupComplete }: AccountSetupProps) {
  // In a real app, we would validate the token and fetch user data
  console.log("token test me i ik unused declaration", token);
  // Mock data for the invited user
  const mockInvitedUser = {
    email: "john.smith@example.com",
    role: "Field Staff",
    invitedBy: "Jane Smith",
    projects: ["Rural Healthcare Initiative"],
    subProjects: ["Maternal Health Services", "Child Vaccination Campaign"],
  };

  // Form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
    enableTwoFactor: true,
  });

  // Setup steps
  const [currentStep, setCurrentStep] = useState(1);
  const [setupProgress, setSetupProgress] = useState(25);

  // Password strength state
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    hasMinLength: false,
    hasUppercase: false,
    hasNumber: false,
    hasSpecial: false,
  });

  // 2FA state
  const [twoFactorCode, setTwoFactorCode] = useState("");
  // const [twoFactorQRImage, setTwoFactorQRImage] = useState(
  //   "/qr-placeholder.png"
  // );

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Check password strength if changing password
    if (name === "password") {
      checkPasswordStrength(value);
    }
  };

  // Handle 2FA toggle
  const handle2FAToggle = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, enableTwoFactor: checked }));
  };

  // Check password strength
  const checkPasswordStrength = (password: string) => {
    const hasMinLength = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);

    let score = 0;
    if (hasMinLength) score += 1;
    if (hasUppercase) score += 1;
    if (hasNumber) score += 1;
    if (hasSpecial) score += 1;

    setPasswordStrength({
      score,
      hasMinLength,
      hasUppercase,
      hasNumber,
      hasSpecial,
    });
  };

  // Get password strength text
  const getPasswordStrengthText = () => {
    const { score } = passwordStrength;
    if (score === 0) return "Very Weak";
    if (score === 1) return "Weak";
    if (score === 2) return "Fair";
    if (score === 3) return "Good";
    return "Strong";
  };

  // Get password strength color
  const getPasswordStrengthColor = () => {
    const { score } = passwordStrength;
    if (score === 0) return "bg-red-500";
    if (score === 1) return "bg-red-500";
    if (score === 2) return "bg-yellow-500";
    if (score === 3) return "bg-amber-500";
    return "bg-green-500";
  };

  // Navigate to next step
  const goToNextStep = () => {
    const nextStep = currentStep + 1;
    setCurrentStep(nextStep);
    setSetupProgress(nextStep * 25);
  };

  // Navigate to previous step
  const goToPreviousStep = () => {
    const prevStep = currentStep - 1;
    setCurrentStep(prevStep);
    setSetupProgress(prevStep * 25);
  };

  // Complete account setup
  const completeSetup = () => {
    // In a real app, we would submit the form data to an API
    console.log("Account setup completed", formData);
    onSetupComplete();
  };

  // Check if current step is valid
  const isCurrentStepValid = () => {
    if (currentStep === 1) {
      return (
        formData.firstName.trim() !== "" && formData.lastName.trim() !== ""
      );
    }

    if (currentStep === 2) {
      return (
        formData.password.trim() !== "" &&
        formData.confirmPassword.trim() !== "" &&
        formData.password === formData.confirmPassword &&
        passwordStrength.score >= 2
      );
    }

    if (currentStep === 3) {
      if (formData.enableTwoFactor) {
        return twoFactorCode.length === 6;
      }
      return true;
    }

    return true;
  };

  return (
    <div className="container max-w-md mx-auto py-10">
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1>Account Setup</h1>
          <p className="text-muted-foreground">
            Complete your profile and set up your account.
          </p>
        </div>

        <Progress value={setupProgress} className="h-2" />

        <Card>
          <CardHeader>
            <CardTitle>
              {currentStep === 1 && "Personal Information"}
              {currentStep === 2 && "Create Password"}
              {currentStep === 3 && "Two-Factor Authentication"}
              {currentStep === 4 && "Review & Complete"}
            </CardTitle>
            <CardDescription>
              {currentStep === 1 && "Enter your name and contact details"}
              {currentStep === 2 && "Create a secure password for your account"}
              {currentStep === 3 &&
                "Set up two-factor authentication for enhanced security"}
              {currentStep === 4 &&
                "Review your information and complete the setup"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentStep === 1 && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={mockInvitedUser.email}
                    disabled
                  />
                  <p className="text-xs text-muted-foreground">
                    Your email address cannot be changed.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number (Optional)</Label>
                  <Input
                    id="phoneNumber"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>Invited Information</AlertTitle>
                  <AlertDescription>
                    <div className="text-sm space-y-1 mt-2">
                      <p>
                        You were invited by:{" "}
                        <span className="font-medium">
                          {mockInvitedUser.invitedBy}
                        </span>
                      </p>
                      <p>
                        Role: <Badge>{mockInvitedUser.role}</Badge>
                      </p>
                    </div>
                  </AlertDescription>
                </Alert>
              </>
            )}

            {currentStep === 2 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <Label>Password Strength</Label>
                      <span className="text-xs font-medium">
                        {getPasswordStrengthText()}
                      </span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full ${getPasswordStrengthColor()}`}
                        style={{
                          width: `${(passwordStrength.score / 4) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div className="flex items-center gap-2 text-xs">
                      <div
                        className={`h-2 w-2 rounded-full ${
                          passwordStrength.hasMinLength
                            ? "bg-green-500"
                            : "bg-muted-foreground"
                        }`}
                      ></div>
                      <span
                        className={
                          passwordStrength.hasMinLength
                            ? "text-foreground"
                            : "text-muted-foreground"
                        }
                      >
                        8+ characters
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <div
                        className={`h-2 w-2 rounded-full ${
                          passwordStrength.hasUppercase
                            ? "bg-green-500"
                            : "bg-muted-foreground"
                        }`}
                      ></div>
                      <span
                        className={
                          passwordStrength.hasUppercase
                            ? "text-foreground"
                            : "text-muted-foreground"
                        }
                      >
                        Uppercase letter
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <div
                        className={`h-2 w-2 rounded-full ${
                          passwordStrength.hasNumber
                            ? "bg-green-500"
                            : "bg-muted-foreground"
                        }`}
                      ></div>
                      <span
                        className={
                          passwordStrength.hasNumber
                            ? "text-foreground"
                            : "text-muted-foreground"
                        }
                      >
                        Number
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <div
                        className={`h-2 w-2 rounded-full ${
                          passwordStrength.hasSpecial
                            ? "bg-green-500"
                            : "bg-muted-foreground"
                        }`}
                      ></div>
                      <span
                        className={
                          passwordStrength.hasSpecial
                            ? "text-foreground"
                            : "text-muted-foreground"
                        }
                      >
                        Special character
                      </span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                  />
                  {formData.password &&
                    formData.confirmPassword &&
                    formData.password !== formData.confirmPassword && (
                      <p className="text-xs text-red-500">
                        Passwords do not match
                      </p>
                    )}
                </div>
              </>
            )}

            {currentStep === 3 && (
              <>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="enableTwoFactor">
                      Enable Two-Factor Authentication
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <Switch
                    id="enableTwoFactor"
                    checked={formData.enableTwoFactor}
                    onCheckedChange={handle2FAToggle}
                  />
                </div>

                {formData.enableTwoFactor && (
                  <div className="space-y-4 mt-4">
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertTitle>Set up 2FA</AlertTitle>
                      <AlertDescription>
                        Scan the QR code below with an authenticator app like
                        Google Authenticator or Authy.
                      </AlertDescription>
                    </Alert>

                    <div className="flex justify-center p-4">
                      <div className="border p-4 bg-white inline-block">
                        <img
                          src="https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg"
                          alt="2FA QR Code"
                          className="w-48 h-48"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="twoFactorCode">
                        Enter 6-digit code from your app
                      </Label>
                      <Input
                        id="twoFactorCode"
                        value={twoFactorCode}
                        onChange={(e) => setTwoFactorCode(e.target.value)}
                        maxLength={6}
                        placeholder="000000"
                        className="text-center text-lg tracking-widest"
                      />
                    </div>

                    <div className="flex items-center gap-2 p-3 border rounded-md bg-muted/30">
                      <Smartphone className="h-5 w-5 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        You will need to provide a 2FA code each time you log in
                        to your account.
                      </p>
                    </div>
                  </div>
                )}

                {!formData.enableTwoFactor && (
                  <Alert className="mt-4 border-amber-200 text-amber-800 dark:border-amber-900 dark:text-amber-500">
                    <Shield className="h-4 w-4" />
                    <AlertTitle>Security Recommendation</AlertTitle>
                    <AlertDescription>
                      Two-factor authentication significantly improves your
                      account security. We strongly recommend enabling it.
                    </AlertDescription>
                  </Alert>
                )}
              </>
            )}

            {currentStep === 4 && (
              <>
                <div className="space-y-6">
                  <div className="flex justify-center">
                    <Avatar className="h-20 w-20">
                      <AvatarFallback className="text-xl">
                        {formData.firstName && formData.lastName
                          ? `${formData.firstName[0]}${formData.lastName[0]}`
                          : "U"}
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  <div className="space-y-4">
                    <div className="border rounded-md p-4 space-y-3">
                      <h4 className="font-medium text-sm">
                        Personal Information
                      </h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Name:</span>
                          <span className="ml-2">{`${formData.firstName} ${formData.lastName}`}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Email:</span>
                          <span className="ml-2">{mockInvitedUser.email}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Phone:</span>
                          <span className="ml-2">
                            {formData.phoneNumber || "Not provided"}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Role:</span>
                          <span className="ml-2">{mockInvitedUser.role}</span>
                        </div>
                      </div>
                    </div>

                    <div className="border rounded-md p-4 space-y-3">
                      <h4 className="font-medium text-sm">Security Settings</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Lock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            Password:
                          </span>
                          <Badge variant="outline" className="ml-auto">
                            {getPasswordStrengthText()}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Key className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            Two-Factor Authentication:
                          </span>
                          {formData.enableTwoFactor ? (
                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 ml-auto">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Enabled
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="ml-auto">
                              Disabled
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="border rounded-md p-4 space-y-3">
                      <h4 className="font-medium text-sm">Project Access</h4>
                      <div className="space-y-1 text-sm">
                        <p>
                          <span className="text-muted-foreground">
                            Projects:
                          </span>
                          <span className="ml-2">
                            {mockInvitedUser.projects.length > 0
                              ? mockInvitedUser.projects.join(", ")
                              : "None"}
                          </span>
                        </p>
                        <p>
                          <span className="text-muted-foreground">
                            Sub-Projects:
                          </span>
                          <span className="ml-2">
                            {mockInvitedUser.subProjects.length > 0
                              ? mockInvitedUser.subProjects.join(", ")
                              : "None"}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <Alert className="bg-green-50 border-green-200 text-green-800 dark:bg-green-950/20 dark:border-green-900 dark:text-green-400">
                    <Check className="h-4 w-4" />
                    <AlertTitle>Ready to Complete</AlertTitle>
                    <AlertDescription>
                      Click "Complete Setup" below to finish setting up your
                      account and sign in.
                    </AlertDescription>
                  </Alert>
                </div>
              </>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={currentStep === 1 ? undefined : goToPreviousStep}
              disabled={currentStep === 1}
            >
              {currentStep === 1 ? "Cancel" : "Back"}
            </Button>
            <Button
              onClick={currentStep < 4 ? goToNextStep : completeSetup}
              disabled={!isCurrentStepValid()}
            >
              {currentStep < 4 ? "Continue" : "Complete Setup"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
