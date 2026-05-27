const auth = {
    getToken() { return localStorage.getItem('token'); },
    getUser() {
        try { return JSON.parse(localStorage.getItem('user')); }
        catch { return null; }
    },
    saveSession(token, user) {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
    },
    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.reload();
    },
    isLoggedIn() {
        return !!this.getToken() && !!this.getUser();
    }
};
