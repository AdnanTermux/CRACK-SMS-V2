const router = {
    currentPage: 'dashboard',

    init() {
        window.addEventListener('popstate', () => {
            this.handleRoute();
        });
        this.handleRoute();
    },

    handleRoute() {
        const path = window.location.hash.substring(1) || 'dashboard';
        this.navigate(path, false);
    },

    navigate(page, updateHash = true) {
        if (!auth.isLoggedIn() && page !== 'login' && page !== 'signup') {
            this.currentPage = 'login';
            if (updateHash) window.location.hash = 'login';
            app.render();
            return;
        }

        this.currentPage = page;
        if (updateHash) window.location.hash = page;
        app.render();
    }
};
