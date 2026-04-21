const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://grade-management-api-qfe3.onrender.com';

export async function apiFetch(endpoint: string, options: any = {}) {
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

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
}

export const authService = {
  login: (credentials: any) => apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }),
  register: (studentData: any) => apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify(studentData),
  }),
};

export const gradesService = {
  enterGrade: (gradeData: any) => apiFetch('/grades/enter', {
    method: 'POST',
    body: JSON.stringify(gradeData),
  }),
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
  getPromotionStats: (semesterId: string) => apiFetch(`/grades/stats?semesterId=${semesterId}`),
  getAnnualReport: (studentId: string, year: string) => apiFetch(`/grades/report-annual/${studentId}?year=${year}`),
};

export const academicService = {
  getStructure: () => apiFetch('/academic/structure'),
  createUE: (data: any) => apiFetch('/academic/ue', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateUE: (id: string, data: any) => apiFetch(`/academic/ue/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  deleteUE: (id: string) => apiFetch(`/academic/ue/${id}`, {
    method: 'DELETE',
  }),
  createSubject: (data: any) => apiFetch('/academic/subject', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateSubject: (id: string, data: any) => apiFetch(`/academic/subject/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  deleteSubject: (id: string) => apiFetch(`/academic/subject/${id}`, {
    method: 'DELETE',
  }),
};

export const userService = {
  getStudents: () => apiFetch('/users/students'),
  createStudent: (data: any) => apiFetch('/users/students', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateStudent: (id: string, data: any) => apiFetch(`/users/students/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  deleteStudent: (id: string) => apiFetch(`/users/student/${id}`, {
    method: 'DELETE',
  }),

  getStaff: () => apiFetch('/users/staff'),
  createTeacher: (data: any) => apiFetch('/users/teacher', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  createSecretary: (data: any) => apiFetch('/users/secretary', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateStaff: (id: string, data: any) => apiFetch(`/users/staff/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  deleteStaff: (id: string) => apiFetch(`/users/staff/${id}`, {
    method: 'DELETE',
  }),
  getProfile: () => apiFetch('/users/profile'),
  getAuditLogs: () => apiFetch('/grades/audit'),
  getTeachers: () => apiFetch('/users/teachers'),
};

export const attendanceService = {
  getAttendances: () => apiFetch('/attendance'),
  createAttendance: (data: any) => apiFetch('/attendance', {
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
  }
};
