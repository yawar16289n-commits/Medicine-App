// API configuration and helper functions
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Generic API call function
async function apiCall<T = unknown>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Something went wrong',
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}

// Auth API functions
export const authApi = {
  signup: async (userData: {
    name: string;
    email: string;
    password: string;
    role: 'learner' | 'instructor';
  }) => {
    return apiCall('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  login: async (credentials: { email: string; password: string }) => {
    return apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  getUser: async (userId: number) => {
    return apiCall(`/auth/users/${userId}`, {
      method: 'GET',
    });
  },
};

// User API functions
export const userApi = {
  getPublicProfile: async (userId: number) => {
    return apiCall(`/users/profile/${userId}`, {
      method: 'GET',
    });
  },

  getMyProfile: async (userId: number) => {
    return apiCall(`/users/my-profile/${userId}`, {
      method: 'GET',
    });
  },

  updateProfile: async (
    userId: number,
    updates: { name?: string; bio?: string; profile_picture?: string }
  ) => {
    return apiCall(`/users/profile/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },
};

// Course API functions
export const courseApi = {
  getCourses: async (filters?: {
    category?: string;
    level?: string;
    search?: string;
  }) => {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.level) params.append('level', filters.level);
    if (filters?.search) params.append('search', filters.search);

    const query = params.toString() ? `?${params.toString()}` : '';
    return apiCall(`/courses/${query}`, {
      method: 'GET',
    });
  },

  getCourse: async (courseId: number) => {
    return apiCall(`/courses/${courseId}`, {
      method: 'GET',
    });
  },
};

// Dashboard API functions
export const dashboardApi = {
  getStudentDashboard: async (userId: number) => {
    return apiCall(`/dashboard/student/${userId}`, {
      method: 'GET',
    });
  },

  getInstructorDashboard: async (userId: number) => {
    return apiCall(`/dashboard/instructor/${userId}`, {
      method: 'GET',
    });
  },
};

// Enrollment API functions
export const enrollmentApi = {
  enroll: async (userId: number, courseId: number) => {
    return apiCall('/enrollments/', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, course_id: courseId }),
    });
  },

  unenroll: async (enrollmentId: number) => {
    return apiCall(`/enrollments/${enrollmentId}`, {
      method: 'DELETE',
    });
  },

  checkEnrollment: async (userId: number, courseId: number) => {
    return apiCall(`/enrollments/check/${userId}/${courseId}`, {
      method: 'GET',
    });
  },

  updateProgress: async (enrollmentId: number, progress: number) => {
    return apiCall(`/enrollments/${enrollmentId}/progress`, {
      method: 'PUT',
      body: JSON.stringify({ progress }),
    });
  },

  getUserEnrollments: async (userId: number, status?: string) => {
    const query = status ? `?status=${status}` : '';
    return apiCall(`/enrollments/user/${userId}${query}`, {
      method: 'GET',
    });
  },
};

export { API_BASE_URL };
