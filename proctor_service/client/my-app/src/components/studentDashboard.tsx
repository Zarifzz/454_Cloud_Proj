import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Shield, LogOut } from 'lucide-react';
import { toast } from 'sonner';

// Declare electron for TypeScript

export default function StudentDashboard() {
  const [userName, setUserName] = useState('');
  const [availableTestsOutput, setAvailableTestsOutput] = useState('');
  const [takeTestId, setTakeTestId] = useState('');
  const [takeTestOutput, setTakeTestOutput] = useState('');
  const [statusTestId, setStatusTestId] = useState('');
  const [statusOutput, setStatusOutput] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const role = localStorage.getItem('userRole');
    const name = localStorage.getItem('userName');

    if (!token) {
      navigate('/login');
      return;
    }

    if (role !== 'student') {
      toast.error('Unauthorized access');
      navigate('/login');
      return;
    }

    setUserName(name || 'Student');
  }, [navigate]);

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

  const handleBackToHome = () => {
    navigate('/');
  };

  const handleListAvailableTests = async () => {
    try {
      if (!window.electron?.ipcRenderer) {
        toast.error('Electron IPC not available');
        return;
      }

      const response = await window.electron.ipcRenderer.invoke('listAvailableTests');
      
      if (response.error) {
        setAvailableTestsOutput(JSON.stringify({ error: response.error }, null, 2));
        toast.error(response.error);
        return;
      }

      setAvailableTestsOutput(JSON.stringify(response, null, 2));
      toast.success('Available tests loaded');
    } catch (error: any) {
      const errorOutput = {
        success: false,
        error: error.message || 'Failed to load available tests',
      };
      setAvailableTestsOutput(JSON.stringify(errorOutput, null, 2));
      toast.error('Failed to load available tests');
    }
  };

  const handleLoadTest = async () => {
    if (!takeTestId) {
      toast.error('Please enter a test ID');
      return;
    }

    try {
      if (!window.electron?.ipcRenderer) {
        toast.error('Electron IPC not available');
        return;
      }

      const response = await window.electron.ipcRenderer.invoke('takeTest', { testId: takeTestId });
      
      if (response.error) {
        setTakeTestOutput(JSON.stringify({ error: response.error }, null, 2));
        toast.error(response.error);
        return;
      }

      setTakeTestOutput(JSON.stringify(response, null, 2));
      toast.success('Test loaded successfully');
    } catch (error: any) {
      const errorOutput = {
        success: false,
        error: error.message || 'Failed to load test',
      };
      setTakeTestOutput(JSON.stringify(errorOutput, null, 2));
      toast.error('Failed to load test');
    }
  };

  const handleOpenTestPage = () => {
    if (!takeTestId) {
      toast.error('Please enter a test ID first');
      return;
    }
    
    // Navigate to the test page with the test ID
    navigate(`/test/${takeTestId}`);
  };

  const handleCheckStatus = async () => {
    if (!statusTestId) {
      toast.error('Please enter a test ID');
      return;
    }

    try {
      if (!window.electron?.ipcRenderer) {
        toast.error('Electron IPC not available');
        return;
      }

      const response = await window.electron.ipcRenderer.invoke('getSubmissionStatus', { testId: statusTestId });
      
      if (response.error) {
        setStatusOutput(JSON.stringify({ error: response.error }, null, 2));
        toast.error(response.error);
        return;
      }

      setStatusOutput(JSON.stringify(response, null, 2));
      toast.success('Submission status loaded');
    } catch (error: any) {
      const errorOutput = {
        success: false,
        error: error.message || 'Failed to check submission status',
      };
      setStatusOutput(JSON.stringify(errorOutput, null, 2));
      toast.error('Failed to check submission status');
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
          <h1 className="text-gray-900">Student Dashboard</h1>
          <Button onClick={handleBackToHome} variant="outline">
            Back to Home
          </Button>
        </div>

        <hr className="mb-6 border-gray-300" />

        {/* List Available Tests Section */}
        <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
          <h2 className="text-gray-900 mb-4">Available Tests</h2>
          
          <Button onClick={handleListAvailableTests} className="w-full mb-4">
            Load Available Tests
          </Button>

          {availableTestsOutput && (
            <pre className="p-4 bg-gray-100 rounded-lg overflow-x-auto text-gray-800 border border-gray-300">
              {availableTestsOutput}
            </pre>
          )}
        </section>

        <hr className="mb-6 border-gray-300" />

        {/* Take Test Section */}
        <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
          <h2 className="text-gray-900 mb-4">Take Test</h2>

          <div className="space-y-4">
            <div>
              <label htmlFor="takeTestId" className="block text-gray-700 mb-2">
                Test ID:
              </label>
              <Input
                id="takeTestId"
                placeholder="Enter test ID"
                type="text"
                value={takeTestId}
                onChange={(e) => setTakeTestId(e.target.value)}
                className="w-full"
              />
            </div>

            <div className="flex gap-3">
              <Button onClick={handleLoadTest} className="flex-1">
                Load Test
              </Button>
              <Button onClick={handleOpenTestPage} className="flex-1">
                Open Test Page
              </Button>
            </div>

            {takeTestOutput && (
              <pre className="p-4 bg-gray-100 rounded-lg overflow-x-auto text-gray-800 border border-gray-300">
                {takeTestOutput}
              </pre>
            )}
          </div>
        </section>

        <hr className="mb-6 border-gray-300" />

        {/* Submission Status Section */}
        <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-gray-900 mb-4">Your Submission Status</h2>

          <div className="space-y-4">
            <div>
              <label htmlFor="statusTestId" className="block text-gray-700 mb-2">
                Test ID:
              </label>
              <Input
                id="statusTestId"
                placeholder="Enter test ID"
                type="text"
                value={statusTestId}
                onChange={(e) => setStatusTestId(e.target.value)}
                className="w-full"
              />
            </div>

            <Button onClick={handleCheckStatus} className="w-full">
              Check Status
            </Button>

            {statusOutput && (
              <pre className="p-4 bg-gray-100 rounded-lg overflow-x-auto text-gray-800 border border-gray-300">
                {statusOutput}
              </pre>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
