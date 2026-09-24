// Use import.meta.env instead of process.env in Vite
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

export const fetchStudentDashboard = async (authToken) => {
    const response = await fetch(`${API_BASE_URL}/student/dashboard`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
        }
    });

    if (!response.ok) {
        throw new Error(`Failed to load dashboard data (${response.status})`);
    }

    return await response.json();
};