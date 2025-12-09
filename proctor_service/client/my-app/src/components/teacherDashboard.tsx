import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Shield, LogOut } from 'lucide-react';
import { toast } from 'sonner';

export default function TeacherDashboard() {
  const [userName, setUserName] = useState('');
  const navigate = useNavigate();

  // Upload Test State
  const [uploadTestId, setUploadTestId] = useState('');
  const [testJsonFile, setTestJsonFile] = useState<File | null>(null);
  const [answersJsonFile, setAnswersJsonFile] = useState<File | null>(null);
  const [uploadOutput, setUploadOutput] = useState('');

  // Publish Test State
  const [publishTestId, setPublishTestId] = useState('');
  const [publishDuration, setPublishDuration] = useState('');
  const [publishFrom, setPublishFrom] = useState('');
  const [publishTo, setPublishTo] = useState('');
  const [publishOutput, setPublishOutput] = useState('');

  // List Tests State
  const [testsOutput, setTestsOutput] = useState('');

  // Submissions State
  const [submissionsTestId, setSubmissionsTestId] = useState('');
  const [subsOutput, setSubsOutput] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const role = localStorage.getItem('userRole');
    const name = localStorage.getItem('userName');

    if (!token) {
      navigate('/login');
      return;
    }

    if (role !== 'teacher') {
      toast.error('Unauthorized access');
      navigate('/login');
      return;
    }

    setUserName(name || 'Teacher');
  }, [navigate]);

  const handleBack = () => {
    navigate('/');
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

  // Upload Test Handler
  const handleUploadTest = async () => {
    if (!uploadTestId || !testJsonFile || !answersJsonFile) {
      toast.error('Please fill in all fields and select both files');
      return;
    }

    try {
      if (!window.electron?.ipcRenderer) {
        toast.error('Electron IPC not available');
        return;
      }

      // Read file contents
      const testJsonContent = await testJsonFile.text();
      const answersJsonContent = await answersJsonFile.text();

      const testData = JSON.parse(testJsonContent);
      const answersData = JSON.parse(answersJsonContent);

      const payload = {
        testId: uploadTestId,
        test: testData,
        answers: answersData,
      };

      const response = await window.electron.ipcRenderer.invoke('uploadTest', payload);
      setUploadOutput(JSON.stringify(response, null, 2));
      
      if (response.error) {
        toast.error(response.error);
      } else {
        toast.success('Test uploaded successfully!');
      }
    } catch (error: any) {
      console.error('Upload test error:', error);
      const errorMessage = error.message || 'Failed to upload test';
      setUploadOutput(JSON.stringify({ error: errorMessage }, null, 2));
      toast.error(errorMessage);
    }
  };

  // Publish Test Handler
  const handlePublishTest = async () => {
    if (!publishTestId || !publishDuration || !publishFrom || !publishTo) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      if (!window.electron?.ipcRenderer) {
        toast.error('Electron IPC not available');
        return;
      }

      const metadata = {
        duration: parseInt(publishDuration),
        availableFrom: publishFrom,
        availableTo: publishTo,
      };

      const response = await window.electron.ipcRenderer.invoke('publishTest', { testId: publishTestId, metadata });
      setPublishOutput(JSON.stringify(response, null, 2));
      
      if (response.error) {
        toast.error(response.error);
      } else {
        toast.success('Test published successfully!');
      }
    } catch (error: any) {
      console.error('Publish test error:', error);
      const errorMessage = error.message || 'Failed to publish test';
      setPublishOutput(JSON.stringify({ error: errorMessage }, null, 2));
      toast.error(errorMessage);
    }
  };

  // List Tests Handler
  const handleListTests = async () => {
    try {
      if (!window.electron?.ipcRenderer) {
        toast.error('Electron IPC not available');
        return;
      }

      const response = await window.electron.ipcRenderer.invoke('listTests');
      setTestsOutput(JSON.stringify(response, null, 2));
      
      if (response.error) {
        toast.error(response.error);
      } else {
        toast.success('Tests loaded successfully!');
      }
    } catch (error: any) {
      console.error('List tests error:', error);
      const errorMessage = error.message || 'Failed to load tests';
      setTestsOutput(JSON.stringify({ error: errorMessage }, null, 2));
      toast.error(errorMessage);
    }
  };

  // View Submissions Handler
  const handleViewSubmissions = async () => {
    if (!submissionsTestId) {
      toast.error('Please enter a test ID');
      return;
    }

    try {
      if (!window.electron?.ipcRenderer) {
        toast.error('Electron IPC not available');
        return;
      }

      const response = await window.electron.ipcRenderer.invoke('getSubmissionsForTest', { testId: submissionsTestId });
      setSubsOutput(JSON.stringify(response, null, 2));
      
      if (response.error) {
        toast.error(response.error);
      } else {
        toast.success('Submissions loaded successfully!');
      }
    } catch (error: any) {
      console.error('View submissions error:', error);
      const errorMessage = error.message || 'Failed to load submissions';
      setSubsOutput(JSON.stringify({ error: errorMessage }, null, 2));
      toast.error(errorMessage);
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
          <h1 className="text-gray-900">Teacher Dashboard</h1>
          <Button onClick={handleBack} variant="outline">
            Back to Home
          </Button>
        </div>

        <hr className="mb-6 border-gray-300" />

        {/* Upload Test Section */}
        <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
          <h2 className="text-gray-900 mb-4">Upload Test</h2>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="uploadTestId">Test ID:</Label>
              <Input
                id="uploadTestId"
                type="text"
                placeholder="Enter test ID"
                value={uploadTestId}
                onChange={(e) => setUploadTestId(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="testJsonFile">test.json:</Label>
              <Input
                id="testJsonFile"
                type="file"
                accept="application/json"
                onChange={(e) => setTestJsonFile(e.target.files?.[0] || null)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="answersJsonFile">answers.json:</Label>
              <Input
                id="answersJsonFile"
                type="file"
                accept="application/json"
                onChange={(e) => setAnswersJsonFile(e.target.files?.[0] || null)}
                className="mt-1"
              />
            </div>

            <Button onClick={handleUploadTest} className="w-full">
              Upload Test
            </Button>

            {uploadOutput && (
              <pre className="p-4 bg-gray-100 rounded-lg overflow-x-auto text-gray-800 border border-gray-300">
                {uploadOutput}
              </pre>
            )}
          </div>
        </section>

        <hr className="mb-6 border-gray-300" />

        {/* Publish Test Section */}
        <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
          <h2 className="text-gray-900 mb-4">Publish Test</h2>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="publishTestId">Test ID:</Label>
              <Input
                id="publishTestId"
                type="text"
                placeholder="Enter test ID"
                value={publishTestId}
                onChange={(e) => setPublishTestId(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="publishDuration">Duration (minutes):</Label>
              <Input
                id="publishDuration"
                type="number"
                placeholder="30"
                value={publishDuration}
                onChange={(e) => setPublishDuration(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="publishFrom">Available From:</Label>
              <Input
                id="publishFrom"
                type="datetime-local"
                value={publishFrom}
                onChange={(e) => setPublishFrom(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="publishTo">Available To:</Label>
              <Input
                id="publishTo"
                type="datetime-local"
                value={publishTo}
                onChange={(e) => setPublishTo(e.target.value)}
                className="mt-1"
              />
            </div>

            <Button onClick={handlePublishTest} className="w-full">
              Publish
            </Button>

            {publishOutput && (
              <pre className="p-4 bg-gray-100 rounded-lg overflow-x-auto text-gray-800 border border-gray-300">
                {publishOutput}
              </pre>
            )}
          </div>
        </section>

        <hr className="mb-6 border-gray-300" />

        {/* List Tests Section */}
        <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
          <h2 className="text-gray-900 mb-4">List Tests</h2>
          
          <div className="space-y-4">
            <Button onClick={handleListTests} className="w-full">
              Load Tests
            </Button>

            {testsOutput && (
              <pre className="p-4 bg-gray-100 rounded-lg overflow-x-auto text-gray-800 border border-gray-300">
                {testsOutput}
              </pre>
            )}
          </div>
        </section>

        <hr className="mb-6 border-gray-300" />

        {/* View Submissions Section */}
        <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
          <h2 className="text-gray-900 mb-4">View Submissions for Test</h2>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="submissionsTestId">Test ID:</Label>
              <Input
                id="submissionsTestId"
                type="text"
                placeholder="Enter test ID"
                value={submissionsTestId}
                onChange={(e) => setSubmissionsTestId(e.target.value)}
                className="mt-1"
              />
            </div>

            <Button onClick={handleViewSubmissions} className="w-full">
              View Submissions
            </Button>

            {subsOutput && (
              <pre className="p-4 bg-gray-100 rounded-lg overflow-x-auto text-gray-800 border border-gray-300">
                {subsOutput}
              </pre>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
