import axios from 'axios';
import fs from 'fs';
import path from 'path';
import {
  AuthenticationDetails,
  CognitoUser,
  CognitoUserPool,
} from 'amazon-cognito-identity-js';

interface ClientConfig {
  API_URLS: Record<string, string>;
  POOL_DATA: {
    USER_POOL_ID: string;
    CLIENT_ID: string;
  };
}

const configPath = path.resolve(__dirname, '..', '..', 'client_config.json');
const clientConfig: ClientConfig = JSON.parse(
  fs.readFileSync(configPath, 'utf-8'),
);

const API_URLS = clientConfig.API_URLS;
const userPool = new CognitoUserPool({
  UserPoolId: clientConfig.POOL_DATA.USER_POOL_ID,
  ClientId: clientConfig.POOL_DATA.CLIENT_ID,
});

// Allow overriding via env (defaults to real backend)
const MOCK_MODE = process.env.MOCK_MODE === 'true';

let currentToken = '';
let currentUserEmail: string | null = null;

export function setAuthToken(token: string) {
  currentToken = token;
}

export function getAuthToken() {
  return currentToken;
}

function getAuthHeaders() {
  if (!currentToken) return {};
  return { Authorization: currentToken };
}

// Auth APIs
export async function login(email: string, password: string) {
  if (MOCK_MODE) {
    const mockUsers: Record<string, any> = {
      'admin@test.com': {
        success: false,
        token: 'mock-jwt-token-admin',
        user: {
          email: 'admin@test.com',
          name: 'Admin User',
          role: 'admin',
        },
      },
      'teacher@test.com': {
        success: false,
        token: 'mock-jwt-token-teacher',
        user: {
          email: 'teacher@test.com',
          name: 'Teacher User',
          role: 'teacher',
        },
      },
      'student@test.com': {
        success: false,
        token: 'mock-jwt-token-student',
        user: {
          email: 'student@test.com',
          name: 'Student User',
          role: 'student',
        },
      },
    };

    const user = mockUsers[email];
    if (user && password === 'password') {
      setAuthToken(user.token);
      currentUserEmail = email;
      return user;
    }
    return { success: false, error: 'Invalid credentials' };
  }

  return new Promise((resolve) => {
    const authDetails = new AuthenticationDetails({
      Username: email,
      Password: password,
    });

    const cognitoUser = new CognitoUser({
      Username: email,
      Pool: userPool,
    });

    cognitoUser.authenticateUser(authDetails, {
      onSuccess: (result) => {
        const token = result.getIdToken().getJwtToken();
        const payload = result.getIdToken().decodePayload
          ? result.getIdToken().decodePayload()
          : (result.getIdToken() as any).payload;
        const groups = payload?.['cognito:groups'];
        const role = Array.isArray(groups) && groups.length > 0
          ? String(groups[0]).toLowerCase()
          : 'student';

        currentUserEmail = email;
        setAuthToken(token);

        resolve({
          success: true,
          token,
          user: {
            email,
            name: payload?.name || payload?.email || email.split('@')[0],
            role,
          },
        });
      },
      onFailure: (err) => {
        console.error('Cognito login error:', err);
        resolve({ success: false, error: err.message || 'Login failed' });
      },
      newPasswordRequired: (userAttributes) => {
        delete userAttributes.email_verified;
        delete userAttributes.phone_number_verified;

        cognitoUser.completeNewPasswordChallenge(
          password,
          userAttributes,
          {
            onSuccess: (result) => {
              const token = result.getIdToken().getJwtToken();
              currentUserEmail = email;
              setAuthToken(token);

              resolve({
                success: true,
                token,
                user: {
                  email,
                  name: email.split('@')[0],
                  role: 'student',
                },
              });
            },
            onFailure: (challengeErr) => {
              resolve({
                success: false,
                error: challengeErr.message || 'Password update required',
              });
            },
          },
        );
      },
    });
  });
}

export async function logout() {
  if (MOCK_MODE) {
    currentUserEmail = null;
    setAuthToken('');
    return { success: true, message: 'Logged out successfully' };
  }

  if (!currentUserEmail) {
    setAuthToken('');
    return { success: true };
  }

  try {
    const user = new CognitoUser({
      Username: currentUserEmail,
      Pool: userPool,
    });
    user.signOut();
    currentUserEmail = null;
    setAuthToken('');
    return { success: true, message: 'Logged out successfully' };
  } catch (err: any) {
    console.error('Logout error:', err);
    currentUserEmail = null;
    setAuthToken('');
    return { success: false, error: err.message || 'Logout failed' };
  }
}

// Admin APIs
export async function createUser(email: string, role: string) {
  if (MOCK_MODE) {
    return {
      success: true,
      message: `User ${email} created with role ${role}`,
      user: { email, role },
    };
  }

  try {
    const response = await axios.post(
      API_URLS.AssignRole,
      { email, role },
      { headers: getAuthHeaders() },
    );
    return response.data;
  } catch (err: any) {
    console.error('Create user error:', err.response?.data || err);
    return { error: err.response?.data?.message || 'Failed to create user' };
  }
}

// Teacher APIs
export async function uploadTest(payload: any) {
  if (MOCK_MODE) {
    return {
      success: true,
      message: `Test ${payload.testId} uploaded successfully`,
      testId: payload.testId,
    };
  }

  try {
    const response = await axios.post(
      API_URLS.UploadTest,
      payload,
      { headers: getAuthHeaders() },
    );
    return response.data;
  } catch (err: any) {
    console.error('Upload test error:', err.response?.data || err);
    return { error: err.response?.data?.message || 'Failed to upload test' };
  }
}

export async function publishTest(testId: string, metadata: any) {
  if (MOCK_MODE) {
    return {
      success: true,
      message: `Test ${testId} published successfully`,
      testId,
      metadata,
    };
  }

  try {
    const response = await axios.post(
      API_URLS.PublishTest,
      { testId, metadata },
      { headers: getAuthHeaders() },
    );
    return response.data;
  } catch (err: any) {
    console.error('Publish test error:', err.response?.data || err);
    return { error: err.response?.data?.message || 'Failed to publish test' };
  }
}

export async function listTests() {
  if (MOCK_MODE) {
    return {
      success: true,
      tests: [
        {
          testId: 'test-001',
          title: 'Mathematics Final Exam',
          status: 'published',
          duration: 60,
          createdAt: '2024-12-01',
        },
        {
          testId: 'test-002',
          title: 'Physics Midterm',
          status: 'draft',
          duration: 45,
          createdAt: '2024-12-05',
        },
      ],
    };
  }

  try {
    const response = await axios.get(API_URLS.ListTest, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (err: any) {
    console.error('List tests error:', err.response?.data || err);
    return { error: err.response?.data?.message || 'Failed to list tests' };
  }
}

export async function getSubmissionsForTest(testId: string) {
  if (MOCK_MODE) {
    return {
      success: true,
      testId,
      submissions: [
        {
          studentId: 'student-001',
          studentName: 'John Doe',
          submittedAt: '2024-12-08 10:30:00',
          score: 85,
          status: 'graded',
        },
        {
          studentId: 'student-002',
          studentName: 'Jane Smith',
          submittedAt: '2024-12-08 11:00:00',
          score: 92,
          status: 'graded',
        },
      ],
    };
  }

  try {
    const response = await axios.get(
      `${API_URLS.GetSubmissionsForTest}?testId=${testId}`,
      { headers: getAuthHeaders() },
    );
    return response.data;
  } catch (err: any) {
    console.error('Get submissions error:', err.response?.data || err);
    return { error: err.response?.data?.message || 'Failed to fetch submissions' };
  }
}

// Student APIs
export async function listAvailableTests() {
  if (MOCK_MODE) {
    return {
      success: true,
      tests: [
        {
          testId: 'test-001',
          title: 'Mathematics Final Exam',
          duration: 60,
          availableFrom: '2024-12-01 09:00:00',
          availableTo: '2024-12-15 17:00:00',
          status: 'available',
        },
        {
          testId: 'test-003',
          title: 'Chemistry Quiz',
          duration: 30,
          availableFrom: '2024-12-10 10:00:00',
          availableTo: '2024-12-12 23:59:59',
          status: 'available',
        },
      ],
    };
  }

  try {
    const response = await axios.get(API_URLS.ListAvailableTest, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (err: any) {
    console.error('List available tests error:', err.response?.data || err);
    return { error: err.response?.data?.message || 'Failed to list available tests' };
  }
}

export async function takeTest(testId: string) {
  if (MOCK_MODE) {
    return {
      success: true,
      testId,
      test: {
        title: 'Mathematics Final Exam',
        instructions: 'Answer all questions. You have 60 minutes to complete this test.',
        duration: '60 minutes',
        questions: [
          {
            id: 'q1',
            question: 'What is 2 + 2?',
            choices: ['3', '4', '5', '6'],
          },
          {
            id: 'q2',
            question: 'What is the square root of 16?',
            choices: ['2', '4', '8', '16'],
          },
          {
            id: 'q3',
            question: 'What is 10 × 5?',
            choices: ['15', '50', '100', '5'],
          },
        ],
      },
    };
  }

  try {
    const response = await axios.get(
      `${API_URLS.TakeTest}?testId=${testId}`,
      { headers: getAuthHeaders() },
    );
    return response.data;
  } catch (err: any) {
    console.error('Take test error:', err.response?.data || err);
    return { error: err.response?.data?.message || 'Failed to load test' };
  }
}

export async function getSubmissionStatus(testId: string) {
  if (MOCK_MODE) {
    return {
      success: true,
      testId,
      status: 'submitted',
      submittedAt: '2024-12-08 14:30:00',
      score: 90,
      feedback: 'Great job! You answered 9 out of 10 questions correctly.',
    };
  }

  try {
    const response = await axios.post(
      API_URLS.GetSubmissionStatus,
      { testId },
      { headers: getAuthHeaders() },
    );
    return response.data;
  } catch (err: any) {
    console.error('Get submission status error:', err.response?.data || err);
    return { error: err.response?.data?.message || 'Failed to check submission status' };
  }
}

export async function submitTest(testId: string, answers: Record<string, string | null>) {
  if (MOCK_MODE) {
    return {
      success: true,
      message: 'Test submitted successfully',
      testId,
      submittedAt: new Date().toISOString(),
      answersReceived: Object.keys(answers).length,
    };
  }

  try {
    const response = await axios.post(
      API_URLS.SubmitTest,
      { testId, answers },
      { headers: getAuthHeaders() },
    );
    return response.data;
  } catch (err: any) {
    console.error('Submit test error:', err.response?.data || err);
    return { error: err.response?.data?.message || 'Failed to submit test' };
  }
}
