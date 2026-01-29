const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4334';

export async function exportUserProgress(userId) {
  const response = await fetch(`${API_BASE}/api/progress/export/${userId}`);
  if (!response.ok) throw new Error('Failed to export progress');
  return response.json();
}
