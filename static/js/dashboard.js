const dashboard = {
    async render(container) {
        ui.showLoading(container);
        try {
            const stats = await api.call('/dashboard/stats');
            const recent = await api.call('/dashboard/recent-sms?limit=10');

            const maxChart = Math.max(...stats.weekSmsByDay.map(d => d.count), 1);

            container.innerHTML = `
            <div class="stats-grid">
                <div class="stat-card"><div class="stat-card-label">Today's SMS</div><div class="stat-card-value">${stats.todaySms}</div></div>
                <div class="stat-card"><div class="stat-card-label">This Week</div><div class="stat-card-value">${stats.weekSms}</div></div>
                <div class="stat-card"><div class="stat-card-label">This Month</div><div class="stat-card-value">${stats.monthSms}</div></div>
                <div class="stat-card"><div class="stat-card-label">Total Numbers</div><div class="stat-card-value">${stats.totalNumbers}</div><div class="stat-card-change">${stats.activeNumbers} active</div></div>
                <div class="stat-card"><div class="stat-card-label">Today's Profit</div><div class="stat-card-value">$${stats.todayProfit.toFixed(2)}</div></div>
                <div class="stat-card"><div class="stat-card-label">Month Profit</div><div class="stat-card-value">$${stats.monthProfit.toFixed(2)}</div></div>
                <div class="stat-card"><div class="stat-card-label">Total Users</div><div class="stat-card-value">${stats.totalUsers}</div></div>
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:24px">
                <div class="card">
                    <div class="card-header"><div class="card-title">Weekly SMS Activity</div></div>
                    <div class="chart-container" id="weekly-chart">
                        ${stats.weekSmsByDay.map(d => `
                            <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;height:100%">
                                <div style="font-size:11px;font-weight:600;color:#222F36;margin-bottom:4px">${d.count}</div>
                                <div style="width:100%;max-width:40px;background:linear-gradient(to top,#735DFF,#a78bfa);border-radius:4px 4px 0 0;height:${Math.max((d.count / maxChart) * 100, 4)}%;transition:height 0.3s ease"></div>
                                <div style="font-size:10px;color:#6B7280;margin-top:6px">${d.date.slice(5)}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="card">
                    <div class="card-header"><div class="card-title">Top Services Today</div></div>
                    <div class="service-list">
                        ${stats.todaySmsByService.length ? stats.todaySmsByService.map(s => `
                            <div class="service-chip">${s.service || 'Unknown'} <span class="service-chip-count">${s.count}</span></div>
                        `).join('') : '<div class="empty-state"><p>No SMS received today</p></div>'}
                    </div>
                </div>
            </div>

            <div class="card">
                <div class="card-header"><div class="card-title">Recent SMS</div></div>
                <div class="table-wrapper">
                    <table class="fly-table">
                        <thead><tr><th>Number</th><th>Service (Sender)</th><th>Recipient</th><th>OTP</th><th>Message</th><th>Received</th></tr></thead>
                        <tbody>
                            ${recent.data.length ? recent.data.map(s => `
                                <tr>
                                    <td><code style="font-size:12px">${s.number}</code></td>
                                    <td>${s.service ? `<span class="badge badge-primary">${s.service}</span>` : '<span style="color:#9ca3af">N/A</span>'}</td>
                                    <td>${s.recipient || '<span style="color:#9ca3af">-</span>'}</td>
                                    <td>${s.otp ? `<span class="otp-code">${s.otp}</span>` : '-'}</td>
                                    <td class="message-text" title="${ui.escapeHtml(s.message)}">${ui.escapeHtml(s.message)}</td>
                                    <td style="font-size:12px;color:#6B7280">${ui.formatDate(s.received_at)}</td>
                                </tr>
                            `).join('') : '<tr class="empty-row"><td colspan="6">No SMS received yet</td></tr>'}
                        </tbody>
                    </table>
                </div>
            </div>`;
        } catch (err) {
            ui.renderError(container, err.message);
        }
    },

    async renderProfitStats(container) {
        ui.showLoading(container);
        try {
            const stats = await api.call('/dashboard/stats');
            container.innerHTML = `
            <div class="card">
                <div class="card-header"><div class="card-title">Profit Statistics</div></div>
                <div style="padding: 24px;">
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-card-label">Today's Profit</div>
                            <div class="stat-card-value">$${stats.todayProfit.toFixed(2)}</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-card-label">Month's Profit</div>
                            <div class="stat-card-value">$${stats.monthProfit.toFixed(2)}</div>
                        </div>
                    </div>
                </div>
            </div>`;
        } catch (err) { ui.renderError(container, err.message); }
    },

    async renderSearchAccess(container) {
        ui.showLoading(container);
        container.innerHTML = `
        <div class="card">
            <div class="card-header"><div class="card-title">Search Access</div></div>
            <div style="padding: 24px;">
                <div class="filter-bar">
                    <input type="text" class="search-input" placeholder="Search by service or range..." id="search-access-q">
                    <select class="filter-select" id="search-access-type">
                        <option value="services">Services</option>
                        <option value="ranges">Ranges</option>
                    </select>
                </div>
                <div id="search-access-results" style="margin-top: 20px;"></div>
            </div>
        </div>`;

        const load = async () => {
            const q = document.getElementById('search-access-q').value;
            const type = document.getElementById('search-access-type').value;
            const results = document.getElementById('search-access-results');
            ui.showLoading(results);
            try {
                const data = await api.call(`/search-access/${type}?q=${encodeURIComponent(q)}`);
                if (type === 'services') {
                    results.innerHTML = `
                    <div class="table-wrapper">
                        <table class="fly-table">
                            <thead><tr><th>Service</th><th>Available Numbers</th></tr></thead>
                            <tbody>
                                ${data.data.map(s => `<tr><td><span class="badge badge-primary">${s.service}</span></td><td>${s.count}</td></tr>`).join('')}
                            </tbody>
                        </table>
                    </div>`;
                } else {
                    results.innerHTML = `
                    <div class="table-wrapper">
                        <table class="fly-table">
                            <thead><tr><th>Range Name</th><th>Country</th><th>Numbers</th><th>Status</th></tr></thead>
                            <tbody>
                                ${data.data.map(r => `<tr><td>${r.name}</td><td>${r.country_name}</td><td>${r.total_numbers}</td><td><span class="badge ${r.status==='active'?'badge-success':'badge-danger'}">${r.status}</span></td></tr>`).join('')}
                            </tbody>
                        </table>
                    </div>`;
                }
            } catch (err) { ui.renderError(results, err.message); }
        };

        document.getElementById('search-access-q').oninput = debounce(load, 300);
        document.getElementById('search-access-type').onchange = load;
        load();
    },

    async renderLiveAccess(container) {
        ui.showLoading(container);
        container.innerHTML = `
        <div class="card">
            <div class="card-header"><div class="card-title">Live Access — Incoming OTP Feed</div></div>
            <div id="live-access-feed" class="table-wrapper"></div>
        </div>`;
        const feed = document.getElementById('live-access-feed');
        const load = async () => {
            try {
                const data = await api.call('/dashboard/recent-sms?limit=50');
                feed.innerHTML = `
                <table class="fly-table">
                    <thead><tr><th>Number</th><th>Service</th><th>OTP</th><th>Time</th></tr></thead>
                    <tbody>
                        ${data.data.map(s => `
                        <tr>
                            <td><code>${s.number}</code></td>
                            <td><span class="badge badge-primary">${s.service || 'Unknown'}</span></td>
                            <td><span class="otp-code">${s.otp || '-'}</span></td>
                            <td style="font-size:12px;color:#6B7280">${ui.formatDate(s.received_at)}</td>
                        </tr>`).join('')}
                    </tbody>
                </table>`;
            } catch (err) { ui.renderError(feed, err.message); }
        };
        load();
        this._liveInterval = setInterval(load, 5000);
        // Clean up on page change would be better, but SPA style is tricky without a destroyer
    },

    async renderSupport(container) {
        // ... (existing support code moved here if needed or kept in specific module)
    },

    async renderApiManagement(container) {
        ui.showLoading(container);
        const role = auth.getUser()?.role || 'admin';
        try {
            if (['admin','manager'].includes(role)) {
                const data = await api.call('/api-management/admin/tokens');
                const rows = data.data || [];
                container.innerHTML = `
                <div class="card">
                    <div class="card-header"><div class="card-title">API Token Management — All Users (${rows.length})</div></div>
                    <div class="table-wrapper">
                        <table class="fly-table">
                            <thead><tr><th>Username</th><th>Role</th><th>Status</th><th>API Token</th><th>Actions</th></tr></thead>
                            <tbody>
                                ${rows.map(u => `
                                <tr>
                                    <td style="font-weight:600">${ui.escapeHtml(u.username)}</td>
                                    <td><span class="badge ${ROLE_COLORS[u.role]||'badge-secondary'}">${ROLE_LABELS[u.role]||u.role}</span></td>
                                    <td><span class="badge ${u.status==='active'?'badge-success':'badge-danger'}">${u.status}</span></td>
                                    <td>
                                        ${u.api_token
                                            ? `<div style="display:flex;align-items:center;gap:6px"><code style="font-size:11px;background:#f3f4f6;padding:2px 8px;border-radius:4px">${u.api_token.slice(0,24)}…</code><button class="action-btn" onclick="navigator.clipboard.writeText('${u.api_token}').then(()=>ui.showToast('Copied!','success'))">Copy</button></div>`
                                            : '<span style="color:#9ca3af;font-size:12px">No token</span>'}
                                    </td>
                                    <td class="actions-cell">
                                        <button class="action-btn" onclick="dashboard.adminRegenToken('${u.id}')">Regenerate</button>
                                        ${u.api_token ? `<button class="action-btn delete" onclick="dashboard.adminRevokeToken('${u.id}')">Revoke</button>` : ''}
                                    </td>
                                </tr>`).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>`;
            } else {
                const tokenData = await api.call('/api-management/my-token');
                const token = tokenData.token || '';
                const webhookUrl = `${window.location.origin}/api/webhook/sms`;
                container.innerHTML = `
                <div style="display:grid;gap:16px">
                    <div class="card">
                        <div class="card-header"><div class="card-title">API Playground</div></div>
                        <div style="padding:20px">
                            <label class="fly-label">Your API Token</label>
                            <div style="display:flex;gap:8px;margin-bottom:8px">
                                <input class="fly-input" id="my-tok" value="${token}" readonly style="flex:1;font-family:monospace;font-size:13px;background:#f9fafb">
                                <button class="fly-btn" onclick="navigator.clipboard.writeText(document.getElementById('my-tok').value).then(()=>ui.showToast('Copied!','success'))">Copy</button>
                                <button class="fly-btn fly-btn-secondary" onclick="dashboard.regenMyToken()">Regenerate</button>
                            </div>

                            <div style="margin-top: 24px;">
                                <h4 style="margin-bottom: 12px;">Live Test Request</h4>
                                <div class="form-row">
                                    <div class="form-group"><label>Service</label><input type="text" id="test-service" class="fly-input" placeholder="e.g. Google"></div>
                                    <div class="form-group"><label>Number</label><input type="text" id="test-number" class="fly-input" placeholder="e.g. +123456789"></div>
                                </div>
                                <button class="fly-btn" style="margin-top: 12px;" onclick="dashboard.testApiRequest()">Generate & Send Test</button>
                            </div>
                        </div>
                    </div>

                    <div id="api-test-results"></div>
                </div>`;
            }
        } catch (err) { ui.renderError(container, err.message); }
    },

    async regenMyToken() {
        try {
            const d = await api.call('/api-management/regenerate-token', { method: 'POST' });
            document.getElementById('my-tok').value = d.token;
            ui.showToast('Token regenerated', 'success');
        } catch (err) { ui.showToast(err.message, 'error'); }
    },

    async adminRegenToken(userId) {
        try {
            await api.call(`/api-management/admin/regenerate-token/${userId}`, { method: 'POST' });
            ui.showToast('Token regenerated', 'success');
            app.renderCurrentPage();
        } catch (err) { ui.showToast(err.message, 'error'); }
    },

    async adminRevokeToken(userId) {
        if (!confirm("Revoke this user's API token?")) return;
        try {
            await api.call(`/api-management/admin/revoke-token/${userId}`, { method: 'POST' });
            ui.showToast('Token revoked', 'success');
            app.renderCurrentPage();
        } catch (err) { ui.showToast(err.message, 'error'); }
    },

    async testApiRequest() {
        const results = document.getElementById('api-test-results');
        results.innerHTML = '<div class="loading-spinner"><div class="spinner"></div></div>';
        const service = document.getElementById('test-service').value;
        const number = document.getElementById('test-number').value;

        try {
            // This is a dummy call for demonstration in the playground
            const res = await api.call(`/sms?service=${service}&number=${number}&limit=1`);
            results.innerHTML = `
            <div class="card" style="margin-top: 16px;">
                <div class="card-header"><div class="card-title">Sample Response</div></div>
                <div style="padding: 20px;">
                    <pre style="background: #1e1b4b; color: #a5b4fc; padding: 16px; border-radius: 8px; font-size: 12px; overflow: auto;">${JSON.stringify(res, null, 2)}</pre>
                </div>
            </div>`;
        } catch (err) { ui.renderError(results, err.message); }
    },

    async renderNotifications(container) {
        ui.showLoading(container);
        const user = auth.getUser();
        const role = user?.role || 'admin';
        const canCreate = ['admin', 'manager', 'reseller'].includes(role);

        const load = async () => {
            try {
                const data = await api.call('/notifications');
                const rows = data.data || [];
                container.innerHTML = `
                <div class="card">
                    <div class="card-header">
                        <div class="card-title">Notifications (${rows.length})</div>
                        <div class="card-header-actions">
                            <button class="fly-btn fly-btn-sm fly-btn-secondary" id="mark-all-btn">Mark all read</button>
                            ${canCreate ? `<button class="fly-btn fly-btn-sm" id="new-notif-btn">${ICONS.plus} Send</button>` : ''}
                        </div>
                    </div>
                    <div>
                        ${rows.length ? rows.map(n => `
                        <div style="display:flex;align-items:flex-start;gap:14px;padding:14px 16px;border-bottom:1px solid var(--border);background:${n.is_read ? 'transparent' : 'rgba(115,93,255,0.04)'}">
                            <div style="width:8px;height:8px;border-radius:50%;background:${n.is_read ? '#e5e7eb' : '#735DFF'};margin-top:6px;flex-shrink:0"></div>
                            <div style="flex:1">
                                <div style="display:flex;align-items:center;gap:8px;margin-bottom:3px">
                                    <span style="font-weight:600;font-size:13px">${ui.escapeHtml(n.title)}</span>
                                    <span class="badge badge-${n.type === 'danger' ? 'danger' : n.type === 'warning' ? 'warning' : n.type === 'success' ? 'success' : 'primary'}">${n.type || 'info'}</span>
                                    <span style="font-size:11px;color:#9ca3af">→ ${n.target_role || 'all'}</span>
                                </div>
                                <div style="font-size:13px;color:#6B7280">${ui.escapeHtml(n.message)}</div>
                                <div style="font-size:11px;color:#9ca3af;margin-top:4px">${ui.formatDate(n.created_at)}</div>
                            </div>
                            <div style="display:flex;gap:6px;flex-shrink:0">
                                ${!n.is_read ? `<button class="action-btn" onclick="dashboard.markNotifRead('${n.id}', load)">Read</button>` : ''}
                                ${canCreate ? `<button class="action-btn delete" onclick="dashboard.deleteNotif('${n.id}', load)">${ICONS.trash}</button>` : ''}
                            </div>
                        </div>`).join('') : '<div class="empty-state" style="padding:40px"><p>No notifications yet</p></div>'}
                    </div>
                </div>`;

                document.getElementById('mark-all-btn').onclick = async () => {
                    try {
                        await api.call('/notifications/mark-all-read', { method: 'POST' });
                        ui.showToast('All marked as read', 'success');
                        load();
                        app.loadNotifCount();
                    } catch (err) { ui.showToast(err.message, 'error'); }
                };

                document.getElementById('new-notif-btn')?.addEventListener('click', () => this.showNotifModal(load));
            } catch (err) {
                ui.renderError(container, err.message);
            }
        };
        await load();
    },

    showNotifModal(reload) {
        const root = document.getElementById('modal-root');
        const user = auth.getUser();
        const role = user?.role || 'admin';
        const targetOpts = role === 'reseller'
            ? [['sub_reseller', 'Sub Resellers'], ['end_user', 'End Users']]
            : [['reseller', 'Resellers'], ['sub_reseller', 'Sub Resellers'], ['end_user', 'End Users']];

        root.innerHTML = `
        <div class="modal-overlay" id="notif-overlay">
            <div class="modal" style="max-width:460px">
                <div class="modal-header"><div class="modal-title">Send Notification</div><button class="modal-close" id="close-notif">${ICONS.x}</button></div>
                <div class="modal-body">
                    <div class="form-group"><label>Title *</label><input class="fly-input" id="notif-title" placeholder="Notification title"></div>
                    <div class="form-group" style="margin-top:12px"><label>Message *</label><textarea class="fly-input" id="notif-msg" rows="3" style="resize:vertical" placeholder="Write your message here"></textarea></div>
                    <div class="form-row" style="margin-top:12px">
                        <div class="form-group"><label>Target</label>
                            <select class="fly-input" id="notif-target">${targetOpts.map(([v, l]) => `<option value="${v}">${l}</option>`).join('')}</select>
                        </div>
                        <div class="form-group"><label>Type</label>
                            <select class="fly-input" id="notif-type">
                                <option value="info">Info</option><option value="success">Success</option>
                                <option value="warning">Warning</option><option value="danger">Danger</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="fly-btn fly-btn-secondary" id="cancel-notif">Cancel</button>
                    <button class="fly-btn" id="save-notif">Send</button>
                </div>
            </div>
        </div>`;

        const close = () => root.innerHTML = '';
        document.getElementById('close-notif').onclick = close;
        document.getElementById('cancel-notif').onclick = close;
        document.getElementById('save-notif').onclick = async () => {
            const title = document.getElementById('notif-title').value.trim();
            const message = document.getElementById('notif-msg').value.trim();
            if (!title || !message) { ui.showToast('Title and message are required', 'error'); return; }
            try {
                await api.call('/notifications', { method: 'POST', body: JSON.stringify({ title, message, type: document.getElementById('notif-type').value, targetRole: document.getElementById('notif-target').value }) });
                ui.showToast('Notification sent', 'success');
                close();
                if (reload) reload();
                app.loadNotifCount();
            } catch (err) { ui.showToast(err.message, 'error'); }
        };
    },

    async markNotifRead(id, reload) {
        try {
            await api.call(`/notifications/${id}/read`, { method: 'POST' });
            reload();
            app.loadNotifCount();
        } catch (e) {}
    },

    async deleteNotif(id, reload) {
        if (!confirm('Delete this notification?')) return;
        try {
            await api.call(`/notifications/${id}`, { method: 'DELETE' });
            ui.showToast('Deleted', 'success');
            reload();
            app.loadNotifCount();
        } catch (err) { ui.showToast(err.message, 'error'); }
    },

    async renderSettings(container) {
        ui.showLoading(container);
        const user = auth.getUser();
        try {
            const settings = await api.call('/settings');
            container.innerHTML = `
            <div class="card">
                <div class="card-header"><div class="card-title">System Settings</div></div>
                <div style="padding:20px">
                    <div class="form-group">
                        <label>Webhook URL (for receiving SMS)</label>
                        <div style="display:flex;gap:8px;margin-top:4px">
                            <input class="fly-input" id="webhook-url" value="${location.origin}/api/webhook/sms" readonly style="flex:1;background:#f9fafb">
                            <button class="fly-btn fly-btn-sm" onclick="navigator.clipboard.writeText(document.getElementById('webhook-url').value);ui.showToast('Copied!','success')">Copy</button>
                        </div>
                    </div>
                </div>
            </div>
            <div class="card" style="margin-top:16px">
                <div class="card-header"><div class="card-title">Account</div></div>
                <div style="padding:20px">
                    <div class="form-row">
                        <div class="form-group"><label>Username</label><input class="fly-input" value="${user?.username || ''}" readonly style="background:#f9fafb"></div>
                        <div class="form-group"><label>Role</label><input class="fly-input" value="${user?.role || 'admin'}" readonly style="background:#f9fafb"></div>
                    </div>
                </div>
            </div>`;
        } catch (err) {
            ui.renderError(container, err.message);
        }
    }
};
