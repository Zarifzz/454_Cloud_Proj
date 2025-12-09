import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Shield, LogOut } from 'lucide-react';
import { toast } from 'sonner';

// Declare electron for TypeScript

export default function AdminDashboard() {
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Teachers');
  const [createUserOutput, setCreateUserOutput] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userRole = localStorage.getItem('userRole');
    const name = localStorage.getItem('userName');

    if (!token) {
      navigate('/login');
      return;
    }

    if (userRole !== 'admin') {
      toast.error('Unauthorized access');
      navigate('/login');
      return;
    }

    setUserName(name || 'Admin');
  }, [navigate]);

  const handleBackToHome = () => {
    navigate('/');
  };

  const handleCreateUser = async () => {
    if (!email) {
      toast.error('Please enter an email');
      return;
    }

    try {
      if (!window.electron?.ipcRenderer) {
        toast.error('Electron IPC not available');
        return;
      }

      // Use Electron IPC
      const response = await window.electron.ipcRenderer.invoke('createUser', { email, role });
      
      // Check if response has error
      if (response.error) {
        setCreateUserOutput(JSON.stringify({ error: response.error }, null, 2));
        toast.error(response.error);
        return;
      }

      setCreateUserOutput(JSON.stringify(response, null, 2));
      toast.success(`User created: ${email} as ${role}`);
      
      // Clear form
      setEmail('');
      setRole('Teachers');
    } catch (error: any) {
      const errorOutput = {
        success: false,
        error: error.message || 'Failed to create user',
      };
      setCreateUserOutput(JSON.stringify(errorOutput, null, 2));
      toast.error('Failed to create user');
    }
  };

  const handleLogout = async () => {
    try {
      if (window.electron?.ipcRenderer) {
        await window.electron.ipcRenderer.invoke('logout');
      }
      localStorage.removeItem('authToken');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userName');
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Logout failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-blue-600">
            <Shield className="size-8" />
            <span>ProctorSecure</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-gray-700">Welcome, {userName}</span>
            <Button onClick={handleLogout} variant="outline" size="sm">
              <LogOut className="mr-2 size-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-gray-900">Admin Dashboard</h1>
          <Button onClick={handleBackToHome} variant="outline">
            Back to Home
          </Button>
        </div>

        <hr className="mb-6 border-gray-300" />

        <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-gray-900 mb-4">Create User</h2>

          <div className="space-y-4">
            <Input
              id="emailInput"
              placeholder="email"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full"
            />

            <Select value={role} onValueChange={setRole}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Teachers">Teachers</SelectItem>
                <SelectItem value="Students">Students</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={handleCreateUser} className="w-full">
              Create User
            </Button>

            {createUserOutput && (
              <pre className="mt-4 p-4 bg-gray-100 rounded-lg overflow-x-auto text-gray-800 border border-gray-300">
                {createUserOutput}
              </pre>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
