const smpp = {
    async renderProviders(container) {
        ui.showLoading(container);
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
                        <thead><tr><th>Name</th><th>Type</th><th>Status</th><th>Actions</th></tr></thead>
                        <tbody>
                            ${rows.map(p => `
                            <tr>
                                <td style="font-weight:600">${ui.escapeHtml(p.name)}</td>
                                <td><span class="badge ${p.type === 'smpp' ? 'badge-warning' : 'badge-primary'}">${p.type.toUpperCase()}</span></td>
                                <td><span class="badge ${p.status === 'active' ? 'badge-success' : 'badge-danger'}">${p.status}</span></td>
                                <td class="actions-cell">
                                    <button class="action-btn" onclick="smpp.edit('${p.id}')">${ICONS.edit}</button>
                                </td>
                            </tr>`).join('')}
                        </tbody>
                    </table>
                </div>
            </div>`;
        } catch (err) { ui.renderError(container, err.message); }
    }
};
