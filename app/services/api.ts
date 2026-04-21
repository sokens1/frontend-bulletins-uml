const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://grade-management-api-qfe3.onrender.com';

export async function apiFetch(endpoint: string, options: any = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

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
  downloadBulletin: async (studentId: string) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/exports/bulletin/${studentId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) throw new Error('Erreur lors du téléchargement');
    return response.blob();
  }
};

export const academicService = {
  getStructure: () => apiFetch('/academic/structure'),
};
