const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://grade-management-api-qfe3.onrender.com';

type ApiPayload = Record<string, unknown>;
type ApiFetchOptions = RequestInit & {
  headers?: HeadersInit;
};

export async function apiFetch(endpoint: string, options: ApiFetchOptions = {}) {
  const isServer = typeof window === 'undefined';
  const token = !isServer ? localStorage.getItem('token') : null;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token && token !== 'null' && token !== 'undefined') {
    headers['Authorization'] = `Bearer ${token}`;
    console.log(`[API] Calling ${endpoint} with token: ${token.substring(0, 10)}...`);
  } else {
    console.warn(`[API] Calling ${endpoint} WITHOUT token`);
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data: unknown = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      typeof data === 'object' &&
      data !== null &&
      'message' in data &&
      typeof (data as { message?: unknown }).message === 'string'
        ? (data as { message: string }).message
        : 'Something went wrong';
    throw new Error(message);
  }

  return data;
}

export const authService = {
  login: (credentials: ApiPayload) => apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }),
  register: (studentData: ApiPayload) => apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify(studentData),
  }),
};

export const gradesService = {
  enterGrade: (gradeData: ApiPayload) => apiFetch('/grades/enter', {
    method: 'POST',
    body: JSON.stringify(gradeData),
  }),
  getStudentReport: (studentId: string, semesterId: string) =>
    apiFetch(`/grades/report/${studentId}?semesterId=${semesterId}`),
  getExistingGrade: (studentId: string, subjectId: string) =>
    apiFetch(`/grades/existing?studentId=${studentId}&subjectId=${subjectId}`),
  downloadBulletin: async (studentId: string, semesterId: string) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const headers: Record<string, string> = {};
    
    if (token && token !== 'null' && token !== 'undefined') {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const url = `${API_URL}/exports/bulletin/${studentId}?semesterId=${semesterId}`;
    const response = await fetch(url, { headers });
    if (!response.ok) throw new Error('Erreur lors du téléchargement');
    return response.blob();
  },
  downloadAnnualBulletin: async (studentId: string, year: string) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const headers: Record<string, string> = {};
    if (token && token !== 'null' && token !== 'undefined') {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const url = `${API_URL}/exports/bulletin-annual/${studentId}?year=${encodeURIComponent(year)}`;
    const response = await fetch(url, { headers });
    if (!response.ok) throw new Error('Erreur lors du téléchargement');
    return response.blob();
  },
  getPromotionStats: (semesterId: string) => apiFetch(`/grades/stats?semesterId=${semesterId}`),
  getAnnualReport: (studentId: string, year: string) => apiFetch(`/grades/report-annual/${studentId}?year=${year}`),
  getAnnualPromotionStats: (year: string) => apiFetch(`/grades/stats-annual?year=${year}`),
};

export const academicService = {
  getStructure: () => apiFetch('/academic/structure'),
  createUE: (data: ApiPayload) => apiFetch('/academic/ue', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateUE: (id: string, data: ApiPayload) => apiFetch(`/academic/ue/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  deleteUE: (id: string) => apiFetch(`/academic/ue/${id}`, {
    method: 'DELETE',
  }),
  createSubject: (data: ApiPayload) => apiFetch('/academic/subject', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateSubject: (id: string, data: ApiPayload) => apiFetch(`/academic/subject/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  deleteSubject: (id: string) => apiFetch(`/academic/subject/${id}`, {
    method: 'DELETE',
  }),
};

export const userService = {
  getStudents: () => apiFetch('/users/students'),
  createStudent: (data: ApiPayload) => apiFetch('/users/students', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateStudent: (id: string, data: ApiPayload) => apiFetch(`/users/students/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  deleteStudent: (id: string) => apiFetch(`/users/student/${id}`, {
    method: 'DELETE',
  }),

  getStaff: () => apiFetch('/users/staff'),
  createTeacher: (data: ApiPayload) => apiFetch('/users/teacher', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  createSecretary: (data: ApiPayload) => apiFetch('/users/secretary', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateStaff: (id: string, data: ApiPayload) => apiFetch(`/users/staff/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  deleteStaff: (id: string) => apiFetch(`/users/staff/${id}`, {
    method: 'DELETE',
  }),
  getProfile: () => apiFetch('/users/profile'),
  updateProfile: (data: ApiPayload) => apiFetch('/users/profile', {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  getAuditLogs: () => apiFetch('/grades/audit'),
  getTeachers: () => apiFetch('/users/teachers'),
};

export const attendanceService = {
  getAttendances: () => apiFetch('/attendance'),
  createAttendance: (data: ApiPayload) => apiFetch('/attendance', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateAttendance: (id: string, hoursAbsent: number) => apiFetch(`/attendance/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ hoursAbsent }),
  }),
  deleteAttendance: (id: string) => apiFetch(`/attendance/${id}`, {
    method: 'DELETE',
  }),
};

export const settingsService = {
  getAcademicRules: () => apiFetch('/settings/academic-rules'),
  updateAcademicRules: (data: ApiPayload) => apiFetch('/settings/academic-rules', {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
};

export const exportService = {
  downloadTemplate: async (type: 'STUDENTS' | 'GRADES') => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const headers: Record<string, string> = {};
    if (token && token !== 'null' && token !== 'undefined') {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${API_URL}/exports/template/${type}`, { headers });
    if (!response.ok) throw new Error('Erreur lors du téléchargement du modèle');
    return response.blob();
  },
  importExcel: async (type: 'students' | 'grades', file: File, semesterId?: string) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const formData = new FormData();
    formData.append('file', file);
    
    const url = type === 'students' 
      ? `${API_URL}/exports/import-students`
      : `${API_URL}/exports/import-grades?semesterId=${semesterId}`;

    const headers: Record<string, string> = {};
    if (token && token !== 'null' && token !== 'undefined') {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });
    if (!response.ok) throw new Error('Erreur lors de l\'importation');
    return response.json();
  },
  downloadPromotionXlsx: async (semesterId: string) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const headers: Record<string, string> = {};
    if (token && token !== 'null' && token !== 'undefined') {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${API_URL}/exports/promotion?semesterId=${encodeURIComponent(semesterId)}`, { headers });
    if (!response.ok) throw new Error('Erreur lors du téléchargement');
    return response.blob();
  },
  downloadGradesXlsx: async (semesterId: string) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const headers: Record<string, string> = {};
    if (token && token !== 'null' && token !== 'undefined') {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${API_URL}/exports/grades?semesterId=${encodeURIComponent(semesterId)}`, { headers });
    if (!response.ok) throw new Error('Erreur lors du téléchargement');
    return response.blob();
  },
  downloadAllBulletinsZip: async (semesterId: string) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const headers: Record<string, string> = {};
    if (token && token !== 'null' && token !== 'undefined') {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${API_URL}/exports/bulletins-zip?semesterId=${encodeURIComponent(semesterId)}`, { headers });
    if (!response.ok) throw new Error('Erreur lors du téléchargement');
    return response.blob();
  },
  downloadAllAnnualBulletinsZip: async (year: string) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const headers: Record<string, string> = {};
    if (token && token !== 'null' && token !== 'undefined') {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${API_URL}/exports/bulletins-annual-zip?year=${encodeURIComponent(year)}`, { headers });
    if (!response.ok) throw new Error('Erreur lors du téléchargement');
    return response.blob();
  },
};
