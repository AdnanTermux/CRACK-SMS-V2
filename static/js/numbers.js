const numbers = {
    async render(container) {
        ui.showLoading(container);
        const user = auth.getUser();
        const isAdmin = user && (user.role === 'admin' || user.role === 'manager');
        let page = 1;

        const load = async () => {
            try {
                const data = await api.call(`/numbers?page=${page}&limit=20`);
                const rows = data.data || [];
                const pg = data.pagination;
                container.innerHTML = `
                <div class="card">
                    <div class="card-header">
                        <div class="card-title">Numbers (${pg.total})</div>
                        <div class="card-header-actions">
                            ${isAdmin ? `<button class="fly-btn fly-btn-sm" id="add-number-btn">${ICONS.plus} Add Number</button>
                            <button class="fly-btn fly-btn-sm secondary" id="bulk-import-btn">${ICONS.plus} Import Bulk</button>` : ''}
                        </div>
                    </div>
                    <div class="filter-bar">
                        <input type="text" class="search-input" placeholder="Search numbers..." id="numbers-search">
                    </div>
                    <div class="table-wrapper">
                        <table class="fly-table">
                            <thead><tr><th>Number</th><th>Country</th><th>Service</th><th>Range</th><th>Status</th><th>SMS Count</th><th>Actions</th></tr></thead>
                            <tbody id="numbers-tbody">
                                ${rows.map(n => this.renderRow(n, isAdmin)).join('')}
                                ${!rows.length ? '<tr class="empty-row"><td colspan="7">No numbers found</td></tr>' : ''}
                            </tbody>
                        </table>
                    </div>
                </div>`;

                document.getElementById('add-number-btn')?.addEventListener('click', () => this.showModal());
                document.getElementById('bulk-import-btn')?.addEventListener('click', () => this.showBulkImportModal(load));
            } catch (err) {
                ui.renderError(container, err.message);
            }
        };
        await load();
    },

    renderRow(n, isAdmin) {
        return `
        <tr>
            <td><code style="font-size:12px">${n.number}</code></td>
            <td>${n.country_name || n.country || '-'}</td>
            <td>${n.service ? `<span class="badge badge-primary">${n.service}</span>` : '-'}</td>
            <td>${n.range_name || '-'}</td>
            <td><span class="badge ${n.status === 'active' ? 'badge-success' : 'badge-danger'}">${n.status}</span></td>
            <td>${n.total_sms}</td>
            <td class="actions-cell">
                ${isAdmin ? `<button class="action-btn" onclick="numbers.edit('${n.id}')">${ICONS.edit}</button>
                <button class="action-btn delete" onclick="numbers.delete('${n.id}','${ui.escapeHtml(n.number)}')">${ICONS.trash}</button>` : '<span style="color:#9ca3af">Read only</span>'}
            </td>
        </tr>`;
    },

    async renderAllocations(container) {
        ui.showLoading(container);
        try {
            const data = await api.call('/numbers-ext/allocations');
            const rows = data.data || [];
            container.innerHTML = `
            <div class="card">
                <div class="card-header"><div class="card-title">Allocations (${rows.length})</div></div>
                <div class="table-wrapper">
                    <table class="fly-table">
                        <thead><tr><th>User</th><th>Range</th><th>Qty</th><th>Duration</th><th>Status</th><th>Allocated On</th><th>Expires</th><th>Actions</th></tr></thead>
                        <tbody>
                            ${rows.map(a => `
                            <tr>
                                <td style="font-weight:600">${ui.escapeHtml(a.username)}</td>
                                <td><span class="badge badge-primary">${ui.escapeHtml(a.range_name)}</span></td>
                                <td style="font-weight:700">${a.quantity}</td>
                                <td style="text-transform:capitalize">${a.duration}</td>
                                <td><span class="badge ${a.status === 'active' ? 'badge-success' : 'badge-secondary'}">${a.status}</span></td>
                                <td style="font-size:12px;color:#6B7280">${ui.formatDate(a.created_at)}</td>
                                <td style="font-size:12px;color:#6B7280">${a.expires_at ? ui.formatDate(a.expires_at) : '—'}</td>
                                <td class="actions-cell">
                                    ${a.status === 'active' ? `<button class="action-btn delete" onclick="numbers.returnAllocation('${a.id}')">Return</button>` : ''}
                                </td>
                            </tr>`).join('')}
                        </tbody>
                    </table>
                </div>
            </div>`;
        } catch (err) { ui.renderError(container, err.message); }
    },

    async returnAllocation(id) {
        if (!confirm('Return this allocation?')) return;
        try {
            await api.call(`/numbers-ext/allocations/${id}/return`, { method: 'POST' });
            ui.showToast('Numbers returned', 'success');
            app.renderCurrentPage();
        } catch (err) { ui.showToast(err.message, 'error'); }
    },

    async renderRevokeTools(container) {
        ui.showLoading(container);
        container.innerHTML = `
        <div class="card">
            <div class="card-header"><div class="card-title">Revoke Tools</div></div>
            <div style="padding: 24px; display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
                <div class="revoke-card" style="padding: 20px; border: 1px solid var(--border); border-radius: 12px; background: #fff;">
                    <h3 style="margin-bottom: 12px; font-size: 16px; color: #ef4444;">Revoke All Numbers</h3>
                    <p style="font-size: 14px; color: #6B7280; margin-bottom: 20px;">Immediately unassign all numbers from all users across all ranges. Use with extreme caution.</p>
                    <button class="fly-btn fly-btn-danger" style="width: 100%;" onclick="numbers.revokeAll()">Revoke All</button>
                </div>

                <div class="revoke-card" style="padding: 20px; border: 1px solid var(--border); border-radius: 12px; background: #fff;">
                    <h3 style="margin-bottom: 12px; font-size: 16px;">Revoke by User</h3>
                    <div class="form-group">
                        <label>Username</label>
                        <input type="text" id="revoke-username" class="fly-input" placeholder="Enter username">
                    </div>
                    <button class="fly-btn" style="width: 100%; margin-top: 12px;" onclick="numbers.revokeByUser()">Revoke by User</button>
                </div>

                <div class="revoke-card" style="padding: 20px; border: 1px solid var(--border); border-radius: 12px; background: #fff;">
                    <h3 style="margin-bottom: 12px; font-size: 16px;">Revoke by Range</h3>
                    <div class="form-group">
                        <label>Range Name</label>
                        <input type="text" id="revoke-range" class="fly-input" placeholder="Enter range name">
                    </div>
                    <button class="fly-btn" style="width: 100%; margin-top: 12px;" onclick="numbers.revokeByRange()">Revoke by Range</button>
                </div>
            </div>
        </div>`;
    },

    async revokeAll() {
        if (!confirm('Are you ABSOLUTELY sure you want to revoke ALL numbers from ALL users? This action cannot be undone.')) return;
        try {
            const res = await api.call('/numbers-ext/revoke-all', { method: 'POST' });
            ui.showToast(`Successfully revoked ${res.revoked} numbers`, 'success');
        } catch (err) { ui.showToast(err.message, 'error'); }
    },

    async revokeByUser() {
        const username = document.getElementById('revoke-username').value.trim();
        if (!username) return ui.showToast('Please enter a username', 'error');
        if (!confirm(`Revoke all numbers from user ${username}?`)) return;
        try {
            const res = await api.call('/numbers-ext/return-numbers', { method: 'POST', body: JSON.stringify({ username }) });
            ui.showToast(`Successfully revoked ${res.returned} numbers`, 'success');
        } catch (err) { ui.showToast(err.message, 'error'); }
    },

    async revokeByRange() {
        const rangeName = document.getElementById('revoke-range').value.trim();
        if (!rangeName) return ui.showToast('Please enter a range name', 'error');
        if (!confirm(`Revoke all numbers in range ${rangeName}?`)) return;
        try {
            const res = await api.call('/numbers-ext/return-numbers', { method: 'POST', body: JSON.stringify({ rangeName }) });
            ui.showToast(`Successfully revoked ${res.returned} numbers`, 'success');
        } catch (err) { ui.showToast(err.message, 'error'); }
    }
};
