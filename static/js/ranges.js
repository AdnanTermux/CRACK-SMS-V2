const ranges = {
    async render(container) {
        ui.showLoading(container);
        try {
            const data = await api.call('/ranges');
            const rows = data.data || [];
            container.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <div class="card-title">Ranges (${rows.length})</div>
                    <button class="fly-btn fly-btn-sm" id="add-range-btn">${ICONS.plus} Add Range</button>
                </div>
                <div class="table-wrapper">
                    <table class="fly-table">
                        <thead><tr><th>Name</th><th>Country</th><th>Rate</th><th>Profit %</th><th>Status</th><th>Actions</th></tr></thead>
                        <tbody>
                            ${rows.map(r => this.renderRow(r)).join('')}
                        </tbody>
                    </table>
                </div>
            </div>`;
        } catch (err) { ui.renderError(container, err.message); }
    },

    renderRow(r) {
        return `
        <tr>
            <td style="font-weight:600">${ui.escapeHtml(r.name)}</td>
            <td>${r.country_name || '-'}</td>
            <td>$${r.rate}</td>
            <td>${r.profit_margin}%</td>
            <td><span class="badge ${r.status === 'active' ? 'badge-success' : 'badge-danger'}">${r.status}</span></td>
            <td class="actions-cell">
                <button class="action-btn" onclick="ranges.edit('${r.id}')">${ICONS.edit}</button>
                <button class="action-btn delete" onclick="ranges.delete('${r.id}')">${ICONS.trash}</button>
            </td>
        </tr>`;
    },

    async renderSmsRanges(container) {
        ui.showLoading(container);
        try {
            const data = await api.call('/ranges?status=active&limit=100');
            const ranges = data.data || [];
            container.innerHTML = `
            <div class="card">
                <div class="card-header"><div class="card-title">Available Ranges — Request Numbers</div></div>
                <div style="display:grid;gap:12px;padding:16px">
                    ${ranges.map(r => `
                    <div style="border:1px solid var(--border);border-radius:8px;padding:16px;display:flex;align-items:center;gap:16px;background:#fff">
                        <div style="flex:1">
                            <div style="font-weight:700;font-size:14px;margin-bottom:4px">${ui.escapeHtml(r.name)}</div>
                            <div style="font-size:12px;color:#6B7280">${r.country_name || '—'} &nbsp;·&nbsp; Rate: <strong>$${parseFloat(r.rate||0).toFixed(4)}</strong></div>
                        </div>
                        <button class="fly-btn fly-btn-sm" onclick="ranges.showRequestModal('${r.name}')">Request</button>
                    </div>`).join('')}
                </div>
            </div>`;
        } catch (err) { ui.renderError(container, err.message); }
    }
};
