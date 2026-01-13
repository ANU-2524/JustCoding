const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4334';

// Sync user profile with backend
export async function syncProfileToBackend(userId, profile) {
    try {
        const response = await fetch(`${API_BASE}/api/user/profile/${userId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(profile)
        });
        if (!response.ok) throw new Error('Failed to sync profile');
        const data = await response.json();
        return data.success ? data.data : null;
    } catch (error) {
        console.error('Profile sync error:', error);
        return null;
    }
}

// Fetch profile from backend
export async function fetchProfileFromBackend(userId) {
    try {
        const response = await fetch(`${API_BASE}/api/user/profile/${userId}`);
        if (!response.ok) throw new Error('Failed to fetch profile');
        const data = await response.json();
        return data.success ? data.data : null;
    } catch (error) {
        console.error('Fetch profile error:', error);
        return null;
    }
}

// Fetch snippets from backend
export async function fetchSnippetsFromBackend(userId) {
    try {
        const response = await fetch(`${API_BASE}/api/user/snippets/${userId}`);
        if (!response.ok) throw new Error('Failed to fetch snippets');
        const data = await response.json();
        return data.success ? data.data : [];
    } catch (error) {
        console.error('Fetch snippets error:', error);
        return [];
    }
}

// Create snippet on backend
export async function createSnippetOnBackend(userId, snippet) {
    try {
        const response = await fetch(`${API_BASE}/api/user/snippets`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, ...snippet })
        });
        if (!response.ok) throw new Error('Failed to create snippet');
        const data = await response.json();
        return data.success ? data.data : null;
    } catch (error) {
        console.error('Create snippet error:', error);
        return null;
    }
}

// Update snippet on backend
export async function updateSnippetOnBackend(snippetId, userId, updates) {
    try {
        const response = await fetch(`${API_BASE}/api/user/snippets/${snippetId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, ...updates })
        });
        if (!response.ok) throw new Error('Failed to update snippet');
        const data = await response.json();
        return data.success ? data.data : null;
    } catch (error) {
        console.error('Update snippet error:', error);
        return null;
    }
}

// Delete snippet on backend
export async function deleteSnippetOnBackend(snippetId, userId) {
    try {
        const response = await fetch(`${API_BASE}/api/user/snippets/${snippetId}?userId=${userId}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Failed to delete snippet');
        const data = await response.json();
        return data.success;
    } catch (error) {
        console.error('Delete snippet error:', error);
        return false;
    }
}

// Sync all local snippets to backend (one-time migration)
export async function syncLocalSnippetsToBackend(userId, snippets) {
    try {
        const response = await fetch(`${API_BASE}/api/user/snippets/sync`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, snippets })
        });
        if (!response.ok) throw new Error('Failed to sync snippets');
        const data = await response.json();
        return data.success ? data.synced : 0;
    } catch (error) {
        console.error('Sync snippets error:', error);
        return 0;
    }
}
