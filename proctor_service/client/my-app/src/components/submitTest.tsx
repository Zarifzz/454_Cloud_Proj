import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { Clock, AlertCircle  } from 'lucide-react';

interface Question {
  id: string;
  question: string;
  choices: string[];
}

interface TestData {
  title?: string;
  instructions?: string;
  duration?: string;
  questions: Question[];
}

interface LoadTestResponse {
  error?: string;
  test?: TestData;
  testId?: string;
}

export default function TakeTest() {
  const { testId } = useParams<{ testId: string }>();
  const [testTitle, setTestTitle] = useState('Loading test...');
  const [testData, setTestData] = useState<TestData | null>(null);
  const [currentTestId, setCurrentTestId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitOutput, setSubmitOutput] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const role = localStorage.getItem('userRole');

    if (!token) {
      navigate('/login');
      return;
    }

    if (role !== 'student') {
      toast.error('Unauthorized access');
      navigate('/login');
      return;
    }

    if (!testId) {
      toast.error('No test ID provided');
      navigate('/student');
      return;
    }

    // Enter proctor mode when component mounts
    if (window.electron?.ipcRenderer) {
      window.electron.ipcRenderer.send('enter-proctor-mode');
    }

    loadTest();

    // Cleanup: exit proctor mode when component unmounts
    return () => {
      if (window.electron?.ipcRenderer) {
        window.electron.ipcRenderer.send('exit-proctor-mode');
      }
    };
  }, [testId, navigate]);

  const loadTest = async () => {
    try {
      if (!window.electron?.ipcRenderer) {
        toast.error('Electron IPC not available');
        setTestTitle('Failed to load test');
        setLoading(false);
        return;
      }

      const response: LoadTestResponse = await window.electron.ipcRenderer.invoke('takeTest', { testId });

      if (response.error) {
        setTestTitle('Error loading test');
        setSubmitOutput(response.error);
        toast.error(response.error);
        setLoading(false);
        return;
      }

      // Normalize structure: response.test contains the actual test
      const test = response.test;
      const loadedTestId = response.testId;

      if (!test || !loadedTestId) {
        toast.error('Invalid test data received');
        setLoading(false);
        return;
      }

      setTestData(test);
      setCurrentTestId(loadedTestId);
      setTestTitle(test.title || 'Test');
      setLoading(false);
      toast.success('Test loaded successfully');
    } catch (err: any) {
      console.error('loadTest error:', err);
      setTestTitle('Failed to load test');
      setSubmitOutput(err.message);
      toast.error('Failed to load test');
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (window.electron?.ipcRenderer) {
      window.electron.ipcRenderer.send('exit-proctor-mode');
      window.electron.ipcRenderer.send('navigate-student');
    }
    navigate('/student');
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleSubmitTest = async () => {
    if (!testData || !currentTestId) {
      toast.error('No test loaded');
      setSubmitOutput('No test loaded');
      return;
    }

    if (Object.keys(answers).length === 0) {
      toast.error('Please answer at least one question');
      return;
    }

    try {
      if (!window.electron?.ipcRenderer) {
        toast.error('Electron IPC not available');
        return;
      }

      // Build answers object, handling unanswered questions
      const submissionAnswers: Record<string, string | null> = {};
      for (const q of testData.questions) {
        submissionAnswers[q.id] = answers[q.id] || null;
      }

      const response = await window.electron.ipcRenderer.invoke('submitTest', {
        testId: currentTestId,
        answers: submissionAnswers,
      });

      setSubmitOutput(JSON.stringify(response, null, 2));
      
      if (response.error) {
        toast.error(response.error);
      } else {
        toast.success('Test submitted successfully!');
        
        // Optionally navigate back after a delay
        setTimeout(() => {
          handleBack();
        }, 2000);
      }
    } catch (err: any) {
      console.error('submitTest error:', err);
      setSubmitOutput(err.message);
      toast.error('Failed to submit test');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-gray-900">Take Test</h1>
          <Button onClick={handleBack} variant="outline">
            Back
          </Button>
        </div>

        <hr className="mb-6 border-gray-300" />

        {/* Test Title */}
        <h2 className="text-gray-900 mb-6">{testTitle}</h2>

        {/* Test Questions */}
        <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
          {loading ? (
            <p className="text-gray-600">Loading test questions...</p>
          ) : !testData || testData.questions.length === 0 ? (
            <p className="text-gray-600">No questions available for this test.</p>
          ) : (
            <form id="testForm" className="space-y-6">
              {testData.questions.map((question, index) => (
                <div key={question.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                  <div className="mb-3">
                    <p className="text-gray-900">
                      <strong>Question {index + 1}:</strong> {question.question}
                    </p>
                  </div>

                  <div className="space-y-2 ml-4">
                    {question.choices.map((choice, choiceIndex) => (
                      <label
                        key={choiceIndex}
                        className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                      >
                        <input
                          type="radio"
                          name={question.id}
                          value={choice}
                          checked={answers[question.id] === choice}
                          onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                          className="w-4 h-4"
                        />
                        <span className="text-gray-700">{choice}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </form>
          )}
        </section>

        {/* Submit Section */}
        <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <Button 
            onClick={handleSubmitTest} 
            className="w-full mb-4"
            disabled={loading || !testData || testData.questions.length === 0}
          >
            Submit Test
          </Button>

          {submitOutput && (
            <pre className="p-4 bg-gray-100 rounded-lg overflow-x-auto text-gray-800 border border-gray-300">
              {submitOutput}
            </pre>
          )}
        </section>
      </div>
    </div>
  );
}
