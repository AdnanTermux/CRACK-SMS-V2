const app = {
    async init() {
        console.log("Initializing SIGMAPANEL...");
        try {
            router.init();
        } catch (err) {
            console.error("Initialization Failed:", err);
            document.getElementById('app').innerHTML = `
                <div style="padding: 20px; text-align: center;">
                    <h1>Critical Error</h1>
                    <p>${err.message}</p>
                    <button onclick="location.reload()">Retry</button>
                </div>
            `;
        }
    },

    render() {
        const user = auth.getUser();
        if (!auth.isLoggedIn()) {
            if (router.currentPage === 'signup') {
                this.renderSignup();
            } else {
                this.renderLogin();
            }
            return;
        }

        this.renderDashboardShell();
    },

    renderLogin() {
        // Implementation from original app.js, updated to use modules
        document.getElementById('app').innerHTML = `
        <div class="auth-page">
            <div class="auth-card">
                <div class="auth-cover">
                    <div class="auth-cover-content">
                        <div style="font-size:64px;opacity:0.9;margin-bottom:16px">${ICONS.send}</div>
                        <h2>"Welcome to SIGMAPANEL. Your one stop solutions for all A2P, P2P SMS with High Availability and Worldwide Access"</h2>
                    </div>
                </div>
                <div class="auth-form">
                    <div class="auth-form-inner">
                        <div style="text-align:center;margin-bottom:16px">${ICONS.lock}</div>
                        <h1 style="text-align:center;font-size:24px;font-weight:600;color:#222F36;margin-bottom:4px">Sign In</h1>
                        <p style="text-align:center;color:#6B7280;font-size:14px;margin-bottom:24px">Welcome back!</p>
                        <div id="login-error" style="display:none;margin-bottom:16px;padding:12px;background:#fef2f2;border:1px solid #fecaca;border-radius:6px;color:#ef4444;font-size:13px;font-weight:500"></div>
                        <form id="login-form">
                            <div class="form-group">
                                <label class="fly-label">User Name</label>
                                <input type="text" id="login-username" class="fly-input" placeholder="Enter User Name" autocomplete="username" required>
                            </div>
                            <div class="form-group">
                                <label class="fly-label">Password</label>
                                <div class="input-wrapper">
                                    <input type="password" id="login-password" class="fly-input" placeholder="Password" autocomplete="current-password" required style="padding-right:44px">
                                    <button type="button" class="password-toggle" id="toggle-password">${ICONS.eye}</button>
                                </div>
                            </div>
                            <div class="form-group">
                                <div class="captcha-section">
                                    <div class="captcha-question">What is <span id="captcha-text"></span> = ?</div>
                                    <div class="captcha-answer">
                                        <input type="number" id="captcha-answer" class="fly-input" placeholder="Answer" style="font-size:14px;padding:6px 12px">
                                    </div>
                                </div>
                            </div>
                            <div style="margin-top:20px">
                                <button type="submit" class="fly-btn" style="width:100%" id="login-btn">Sign-In</button>
                            </div>
                            <div style="margin-top:16px; text-align:center; font-size:14px">
                                <span style="color:#6B7280">Don't have an account?</span>
                                <a href="#signup" onclick="router.navigate('signup')" style="color:#735DFF; font-weight:600; text-decoration:none">Sign Up</a>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>`;

        this.initCaptcha();
        this.initLoginEvents();
    },

    renderSignup() {
        document.getElementById('app').innerHTML = `
        <div class="auth-page">
            <div class="auth-card" style="max-width: 900px;">
                <div class="auth-form" style="width: 100%; padding: 40px;">
                    <h1 style="text-align:center;font-size:24px;font-weight:600;color:#222F36;margin-bottom:4px">Create Account</h1>
                    <p style="text-align:center;color:#6B7280;font-size:14px;margin-bottom:24px">Join SIGMAPANEL telecom infrastructure</p>
                    <div id="signup-error" style="display:none;margin-bottom:16px;padding:12px;background:#fef2f2;border:1px solid #fecaca;border-radius:6px;color:#ef4444;font-size:13px;font-weight:500"></div>

                    <form id="signup-form">
                        <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                            <div class="form-group"><label class="fly-label" for="sup-username">Username *</label><input type="text" id="sup-username" class="fly-input" required></div>
                            <div class="form-group"><label class="fly-label" for="sup-email">Email *</label><input type="email" id="sup-email" class="fly-input" required></div>
                            <div class="form-group"><label class="fly-label" for="sup-phone">Phone Number *</label><input type="text" id="sup-phone" class="fly-input" required></div>
                            <div class="form-group"><label class="fly-label" for="sup-country">Country *</label><input type="text" id="sup-country" class="fly-input" required></div>
                            <div class="form-group">
                                <label class="fly-label" for="sup-profession">Profession *</label>
                                <select id="sup-profession" class="fly-input" required>
                                    <option value="programmer">Programmer</option>
                                    <option value="team_owner">Team Owner</option>
                                    <option value="solo_worker">Solo Worker</option>
                                    <option value="marketer">Marketer</option>
                                    <option value="agency">Agency</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label class="fly-label">Payment Method *</label>
                                <select id="sup-payment" class="fly-input" required>
                                    <option value="binance_uid">Binance UID</option>
                                    <option value="usdt_trc20">USDT TRC20</option>
                                </select>
                            </div>
                            <div class="form-group" style="grid-column: span 2;">
                                <label class="fly-label">Binance UID / USDT Address *</label>
                                <input type="text" id="sup-payment-detail" class="fly-input" required>
                            </div>
                            <div class="form-group"><label class="fly-label">Password *</label><input type="password" id="sup-password" class="fly-input" required></div>
                            <div class="form-group">
                                <label class="fly-label">Proof of Business/Payment (Image) *</label>
                                <input type="file" id="sup-proof" class="fly-input" accept="image/*" required>
                            </div>
                        </div>
                        <div style="margin-top:24px">
                            <button type="submit" class="fly-btn" style="width:100%" id="signup-btn">Submit Request</button>
                        </div>
                        <div style="margin-top:16px; text-align:center; font-size:14px">
                            <span style="color:#6B7280">Already have an account?</span>
                            <a href="#login" onclick="router.navigate('login')" style="color:#735DFF; font-weight:600; text-decoration:none">Sign In</a>
                        </div>
                    </form>
                </div>
            </div>
        </div>`;
        this.initSignupEvents();
    },

    renderDashboardShell() {
        const user = auth.getUser();
        const role = user?.role || 'admin';

        let navHtml = '';
        NAV_ITEMS.forEach(section => {
            const sectionItems = section.items.filter(item => !item.roles || item.roles.includes(role));
            if (sectionItems.length > 0) {
                navHtml += `<div class="sidebar-section">
                    <div class="sidebar-section-title">${section.label}</div>
                    ${sectionItems.map(item => `
                        <button class="sidebar-nav-item ${router.currentPage === item.key ? 'active' : ''}" onclick="router.navigate('${item.key}')">
                            ${item.icon} <span>${item.label}</span>
                        </button>
                    `).join('')}
                </div>`;
            }
        });

        document.getElementById('app').innerHTML = `
        <div class="dashboard-layout">
            <button class="mobile-menu-btn" id="mobile-menu-btn">${ICONS.menu}</button>
            <div class="sidebar-overlay" id="sidebar-overlay"></div>
            <aside class="sidebar" id="sidebar">
                <div class="sidebar-logo">
                    <div class="sidebar-logo-icon">${ICONS.send}</div>
                    <div><h1>SIGMAPANEL</h1><p>SMS Panel</p></div>
                </div>
                <nav class="sidebar-nav">${navHtml}</nav>
                <div class="sidebar-user">
                    <div class="sidebar-user-info">
                        <div class="sidebar-user-avatar">${(user?.username || 'U').charAt(0).toUpperCase()}</div>
                        <div><div class="sidebar-user-name">${user?.fullName || user?.username || 'User'}</div><div class="sidebar-user-role">${user?.role || 'admin'}</div></div>
                    </div>
                    <button class="sidebar-logout" onclick="auth.logout()">${ICONS.logout} Logout</button>
                </div>
            </aside>
            <div class="main-content">
                <header class="top-bar">
                    <h2 class="top-bar-title">${PAGE_TITLES[router.currentPage] || 'Dashboard'}</h2>
                    <div class="top-bar-actions">
                        <button id="notif-btn" onclick="router.navigate('notifications')" style="position:relative;padding:8px;border-radius:8px;border:none;background:none;cursor:pointer;color:#6B7280">${ICONS.bell}<span id="notif-badge" style="display:none;position:absolute;top:6px;right:6px;min-width:16px;height:16px;padding:0 3px;background:#ef4444;color:white;font-size:9px;font-weight:700;border-radius:8px;display:flex;align-items:center;justify-content:center">0</span></button>
                        <div class="top-bar-user">
                            <div class="top-bar-avatar">${(user?.username || 'U').charAt(0).toUpperCase()}</div>
                            <div class="top-bar-user-name"><div style="font-size:12px;font-weight:600;color:#222F36">${user?.fullName || user?.username || 'User'}</div><div class="top-bar-user-role" style="font-size:10px;color:#6B7280;text-transform:uppercase;letter-spacing:0.1em">${user?.role || 'admin'}</div></div>
                        </div>
                    </div>
                </header>
                <main class="page-content" id="page-content"></main>
            </div>
        </div>
        <div id="modal-root"></div>
        <div class="toast-container" id="toast-container"></div>`;

        this.initShellEvents();
        this.renderCurrentPage();
        this.loadNotifCount();
    },

    renderCurrentPage() {
        const content = document.getElementById('page-content');
        switch (router.currentPage) {
            case 'dashboard':     dashboard.render(content); break;
            case 'numbers':       numbers.render(content); break;
            case 'ranges':        ranges.render(content); break;
            case 'sms-ranges':    ranges.renderSmsRanges(content); break;
            case 'allocations':   numbers.renderAllocations(content); break;
            case 'sms-reports':   sms.renderReports(content); break;
            case 'users':         users.render(content); break;
            case 'providers':     smpp.renderProviders(content); break;
            case 'blacklist':     dashboard.renderBlacklist(content); break;
            case 'pricing':       payments.renderPricing(content); break;
            case 'transactions':  payments.renderTransactions(content); break;
            case 'audit-logs':    dashboard.renderAuditLogs(content); break;
            case 'support':       dashboard.renderSupport(content); break;
            case 'api-management':dashboard.renderApiManagement(content); break;
            case 'notifications': dashboard.renderNotifications(content); break;
            case 'settings':      dashboard.renderSettings(content); break;
            case 'registration-requests': users.renderRegistrationRequests(content); break;
            case 'payouts':       payments.renderPayouts(content); break;
            case 'revoke-tools':  numbers.renderRevokeTools(content); break;
            case 'smpp-dashboard':smpp.renderDashboard(content); break;
            case 'profit-stats':  dashboard.renderProfitStats(content); break;
            case 'search-access': dashboard.renderSearchAccess(content); break;
            case 'live-access':   dashboard.renderLiveAccess(content); break;
            default:              dashboard.render(content);
        }
    },

    initCaptcha() {
        const ops = ['+', '-'];
        const op = ops[Math.floor(Math.random() * ops.length)];
        let n1, n2, answer;
        if (op === '+') { n1 = Math.floor(Math.random() * 9) + 1; n2 = Math.floor(Math.random() * 9) + 1; answer = n1 + n2; }
        else { n1 = Math.floor(Math.random() * 9) + 2; n2 = Math.floor(Math.random() * (n1 - 1)) + 1; answer = n1 - n2; }
        window._captchaAnswer = answer;
        const captchaText = document.getElementById('captcha-text');
        if (captchaText) captchaText.textContent = `${n1} ${op} ${n2}`;
    },

    initLoginEvents() {
        document.getElementById('toggle-password')?.addEventListener('click', () => {
            const inp = document.getElementById('login-password');
            const isPassword = inp.type === 'password';
            inp.type = isPassword ? 'text' : 'password';
            document.getElementById('toggle-password').innerHTML = isPassword ? ICONS.eyeOff : ICONS.eye;
        });

        document.getElementById('login-form')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('login-username').value.trim();
            const password = document.getElementById('login-password').value;
            const captchaVal = document.getElementById('captcha-answer').value;
            const errorEl = document.getElementById('login-error');

            if (!username || !password) { errorEl.textContent = 'Username and password are required'; errorEl.style.display = 'block'; return; }
            if (!captchaVal || parseInt(captchaVal) !== window._captchaAnswer) { errorEl.textContent = 'Incorrect captcha answer'; errorEl.style.display = 'block'; return; }
            errorEl.style.display = 'none';

            const btn = document.getElementById('login-btn');
            btn.disabled = true;
            btn.textContent = 'Signing In...';

            try {
                const data = await api.call('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) });
                auth.saveSession(data.token, data.user);
                router.navigate('dashboard');
                ui.showToast('Welcome back!', 'success');
            } catch (err) {
                errorEl.textContent = err.message;
                errorEl.style.display = 'block';
                this.initCaptcha();
            } finally {
                btn.disabled = false;
                btn.textContent = 'Sign-In';
            }
        });
    },

    initSignupEvents() {
        document.getElementById('signup-form')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = document.getElementById('signup-btn');
            const errorEl = document.getElementById('signup-error');
            errorEl.style.display = 'none';

            const formData = new FormData();
            formData.append('username', document.getElementById('sup-username').value.trim());
            formData.append('email', document.getElementById('sup-email').value.trim());
            formData.append('phone', document.getElementById('sup-phone').value.trim());
            formData.append('country', document.getElementById('sup-country').value.trim());
            formData.append('profession', document.getElementById('sup-profession').value);
            formData.append('paymentMethod', document.getElementById('sup-payment').value);
            formData.append('paymentDetail', document.getElementById('sup-payment-detail').value.trim());
            formData.append('password', document.getElementById('sup-password').value);
            formData.append('proof', document.getElementById('sup-proof').files[0]);

            btn.disabled = true;
            btn.textContent = 'Submitting...';

            try {
                await api.call('/auth/signup', { method: 'POST', body: formData, headers: { 'Content-Type': undefined } });
                ui.showToast('Signup request submitted! Please wait for admin approval.', 'success');
                router.navigate('login');
            } catch (err) {
                errorEl.textContent = err.message;
                errorEl.style.display = 'block';
            } finally {
                btn.disabled = false;
                btn.textContent = 'Submit Request';
            }
        });
    },

    initShellEvents() {
        document.getElementById('mobile-menu-btn')?.addEventListener('click', () => {
            document.getElementById('sidebar').classList.toggle('open');
            document.getElementById('sidebar-overlay').classList.toggle('open');
        });
        document.getElementById('sidebar-overlay')?.addEventListener('click', () => {
            document.getElementById('sidebar').classList.remove('open');
            document.getElementById('sidebar-overlay').classList.remove('open');
        });
    },

    async loadNotifCount() {
        try {
            const data = await api.call('/notifications?unread_only=true');
            const count = data.unread_count || 0;
            const badge = document.getElementById('notif-badge');
            if (badge) {
                badge.textContent = count > 99 ? '99+' : count;
                badge.style.display = count > 0 ? 'flex' : 'none';
            }
        } catch (e) {}
    }
};

document.addEventListener('DOMContentLoaded', () => app.init());
