const users = {
    async render(container) {
        ui.showLoading(container);
        let page = 1;
        const load = async () => {
            try {
                const data = await api.call(`/users?page=${page}&limit=20`);
                const rows = data.data || [];
                const pg = data.pagination;
                container.innerHTML = `
                <div class="card">
                    <div class="card-header">
                        <div class="card-title">Users (${pg.total})</div>
                        <button class="fly-btn fly-btn-sm" id="add-user-btn">${ICONS.plus} Add User</button>
                    </div>
                    <div class="table-wrapper">
                        <table class="fly-table">
                            <thead><tr><th>Username</th><th>Email</th><th>Role</th><th>Status</th><th>Balance</th><th>Actions</th></tr></thead>
                            <tbody id="users-tbody">
                                ${rows.map(u => this.renderRow(u)).join('')}
                                ${!rows.length ? '<tr class="empty-row"><td colspan="6">No users found</td></tr>' : ''}
                            </tbody>
                        </table>
                    </div>
                </div>`;
            } catch (err) { ui.renderError(container, err.message); }
        };
        await load();
    },

    renderRow(u) {
        const roleLabels = { admin:'Admin', manager:'Manager', reseller:'Reseller', sub_reseller:'Sub Reseller', end_user:'End User' };
        const roleColors = { admin:'badge-danger', manager:'badge-warning', reseller:'badge-primary' };
        return `
        <tr>
            <td style="font-weight:600">${ui.escapeHtml(u.username)}</td>
            <td>${u.email || '-'}</td>
            <td><span class="badge ${roleColors[u.role]||'badge-secondary'}">${roleLabels[u.role]||u.role}</span></td>
            <td><span class="badge ${u.status==='active'?'badge-success':'badge-danger'}">${u.status}</span></td>
            <td>$${(u.balance || 0).toFixed(4)}</td>
            <td class="actions-cell">
                <button class="action-btn" onclick="users.edit('${u.id}')">${ICONS.edit}</button>
                <button class="action-btn delete" onclick="users.delete('${u.id}')">${ICONS.trash}</button>
            </td>
        </tr>`;
    },

    async renderRegistrationRequests(container) {
        ui.showLoading(container);
        const load = async () => {
            try {
                const data = await api.call('/users/registration-requests');
                const rows = data.data || [];
                container.innerHTML = `
                <div class="card">
                    <div class="card-header"><div class="card-title">Signup Requests (${rows.length})</div></div>
                    <div class="table-wrapper">
                        <table class="fly-table">
                            <thead><tr><th>User</th><th>Details</th><th>Payment</th><th>Proof</th><th>Actions</th></tr></thead>
                            <tbody>
                                ${rows.map(r => `
                                <tr>
                                    <td>
                                        <div style="font-weight:600">${ui.escapeHtml(r.username)}</div>
                                        <div style="font-size:11px;color:#9ca3af">${r.email}</div>
                                    </td>
                                    <td style="font-size:12px">
                                        <div>P: ${r.phone}</div>
                                        <div>C: ${r.country}</div>
                                        <div>Prof: ${r.profession}</div>
                                    </td>
                                    <td style="font-size:12px">
                                        <div style="font-weight:600">${r.payment_method.toUpperCase()}</div>
                                        <div>${r.payment_detail}</div>
                                    </td>
                                    <td>
                                        <a href="/${r.proof_path}" target="_blank" class="action-btn">View Proof</a>
                                    </td>
                                    <td class="actions-cell">
                                        <button class="action-btn" onclick="users.reviewRegistration('${r.id}', 'approved')">Approve</button>
                                        <button class="action-btn delete" onclick="users.reviewRegistration('${r.id}', 'rejected')">Reject</button>
                                    </td>
                                </tr>`).join('')}
                                ${!rows.length ? '<tr class="empty-row"><td colspan="5">No pending requests</td></tr>' : ''}
                            </tbody>
                        </table>
                    </div>
                </div>`;
            } catch (err) { ui.renderError(container, err.message); }
        };
        await load();
    },

    async reviewRegistration(id, status) {
        let role = 'user';
        let reason = null;
        if (status === 'approved') {
            role = prompt('Enter role for this user (user, reseller, sub_reseller, manager):', 'user') || 'user';
        } else {
            reason = prompt('Enter rejection reason:');
            if (reason === null) return;
        }
        try {
            await api.call(`/users/registration-requests/${id}/review`, { method: 'POST', body: JSON.stringify({ status, role, reason }) });
            ui.showToast(`Request ${status}`, 'success');
            app.renderCurrentPage();
        } catch (err) { ui.showToast(err.message, 'error'); }
    }
};
