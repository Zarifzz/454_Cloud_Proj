import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardHeader, CardContent } from './ui/card';
import { Shield } from 'lucide-react';
import { toast } from 'sonner';

// Declare electron for TypeScript

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);

    try {
      // Use Electron IPC if available
      if (window.electron?.ipcRenderer) {
        const response = await window.electron.ipcRenderer.invoke('login', { email, password });
        
        if (!response.success && response.error) {
          toast.error(response.error);
          setIsLoading(false);
          return;
        }

        // Store auth token and user info
        if (response.token) {
          localStorage.setItem('authToken', response.token);
          localStorage.setItem('userName', response.user?.name || response.name || email.split('@')[0]);
          localStorage.setItem('userRole', response.user?.role || 'student');
        }

        toast.success('Login successful!');
        
        // Redirect based on role from JWT token
        const userRole = response.user?.role || 'student';
        
        if (userRole === 'admin') {
          navigate('/admin');
        } else if (userRole === 'teacher') {
          navigate('/teacher');
        } else {
          navigate('/student');
        }
      } else {
        toast.error('Electron IPC not available. Please run this app in Electron.');
      }
      
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-blue-600 mb-4">
            <Shield className="size-8" />
            <span>ProctorSecure</span>
          </Link>
          <h1 className="text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-gray-600">Sign in to your account</p>
        </div>

        <Card>
          <CardHeader>
            <h2 className="text-gray-900">Login</h2>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-gray-700">
                  <input type="checkbox" className="rounded" />
                  Remember me
                </label>
                <a href="#" className="text-blue-600 hover:underline">
                  Forgot password?
                </a>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
