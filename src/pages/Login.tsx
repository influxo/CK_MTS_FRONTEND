import { useEffect, useState } from 'react';
import { Form, useNavigate } from 'react-router-dom';
import type { LoginRequest } from '../services/auth/authModels';
import authService from '../services/auth/authService';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/data-display/card';
import { Alert, AlertDescription } from '../components/ui/feedback/alert';
import { Label } from '../components/ui/form/label';
import { Input } from '../components/ui/form/input';
import { Button } from '../components/ui/button/button';

const Login = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<LoginRequest>({
    email: '',
    password: ''
  });

  useEffect(() => {
    // Check if user is already logged in and redirect if needed
    if (authService.isAuthenticated()) {
      navigate('/dashboard');
    }
  }, [navigate]); // Add navigate to the dependency array

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await authService.login(formData);
      
      if (response.success) {
        // Redirect to dashboard on successful login
        navigate('/dashboard');
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Login</CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
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
                  href="#" 
                  className="text-sm text-blue-600 hover:text-blue-800"
                  onClick={(e) => {
                    e.preventDefault();
                    // Implement forgot password functionality here
                    alert('Forgot password functionality not implemented yet');
                  }}
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
                value={formData.password}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
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

export default Login;
