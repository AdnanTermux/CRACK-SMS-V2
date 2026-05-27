const API_BASE = '/api';

const api = {
    async call(endpoint, options = {}) {
        const token = localStorage.getItem('token');
        const headers = {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers
        };

        try {
            const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });

            if (res.status === 401) {
                auth.logout();
                throw new Error('Unauthorized');
            }

            if (!res.ok) {
                let msg = 'Request failed';
                try {
                    const j = await res.json();
                    msg = j.error || j.detail || msg;
                } catch {}
                throw new Error(msg);
            }

            return res.json();
        } catch (err) {
            console.error(`API Call Error (${endpoint}):`, err);
            throw err;
        }
    }
};
