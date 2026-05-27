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
    }
};
