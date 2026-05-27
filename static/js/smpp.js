const smpp = {
    async renderProviders(container) {
        ui.showLoading(container);
        const load = async () => {
            try {
                const data = await api.call('/providers');
                const rows = data.data || [];
                container.innerHTML = `
                <div class="card">
                    <div class="card-header">
                        <div class="card-title">SMS Providers (${rows.length})</div>
                        <button class="fly-btn fly-btn-sm" id="add-pv-btn">${ICONS.plus} Add Provider</button>
                    </div>
                    <div class="table-wrapper">
                        <table class="fly-table">
                            <thead><tr><th>Name</th><th>Type</th><th>Status</th><th>Host/URL</th><th>Actions</th></tr></thead>
                            <tbody>
                                ${rows.map(p => `
                                <tr>
                                    <td style="font-weight:600">${ui.escapeHtml(p.name)}</td>
                                    <td><span class="badge ${p.type === 'smpp' ? 'badge-warning' : 'badge-primary'}">${p.type.toUpperCase()}</span></td>
                                    <td><span class="badge ${p.status === 'active' ? 'badge-success' : 'badge-danger'}">${p.status}</span></td>
                                    <td style="font-family:monospace;font-size:12px">${p.type==='smpp' ? p.smpp_host : p.api_url}</td>
                                    <td class="actions-cell">
                                        <button class="action-btn" onclick="showProviderModal(${JSON.stringify(p).replace(/"/g, '&quot;')}, load)">${ICONS.edit}</button>
                                        <button class="action-btn delete" onclick="smpp.delete('${p.id}')">${ICONS.trash}</button>
                                    </td>
                                </tr>`).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>`;
                document.getElementById('add-pv-btn').onclick = () => showProviderModal(null, load);
            } catch (err) { ui.renderError(container, err.message); }
        };
        await load();
    },

    async renderDashboard(container) {
        ui.showLoading(container);
        try {
            const data = await api.call('/providers');
            const smppProviders = (data.data || []).filter(p => p.type === 'smpp');
            container.innerHTML = `
            <div class="card">
                <div class="card-header"><div class="card-title">SMPP Real-time Dashboard</div></div>
                <div style="padding: 24px;">
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-card-label">Active Sessions</div>
                            <div class="stat-card-value">${smppProviders.filter(p => p.status === 'active').length}</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-card-label">Total SMPP Providers</div>
                            <div class="stat-card-value">${smppProviders.length}</div>
                        </div>
                    </div>
                    <div class="table-wrapper" style="margin-top: 24px;">
                        <table class="fly-table">
                            <thead><tr><th>Provider</th><th>Host</th><th>Status</th><th>Last Active</th><th>SMS Recv</th></tr></thead>
                            <tbody>
                                ${smppProviders.map(p => `
                                <tr>
                                    <td style="font-weight:600">${ui.escapeHtml(p.name)}</td>
                                    <td><code>${p.smpp_host}:${p.smpp_port}</code></td>
                                    <td><span class="badge ${p.status==='active'?'badge-success':'badge-danger'}">${p.status}</span></td>
                                    <td>${ui.formatDate(p.last_active_at)}</td>
                                    <td>${p.total_sms_received || 0}</td>
                                </tr>`).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>`;
        } catch (err) { ui.renderError(container, err.message); }
    },

    async delete(id) {
        if (!confirm('Delete this provider?')) return;
        try {
            await api.call(`/providers/${id}`, { method: 'DELETE' });
            ui.showToast('Provider deleted', 'success');
            app.renderCurrentPage();
        } catch (err) { ui.showToast(err.message, 'error'); }
    }
};
