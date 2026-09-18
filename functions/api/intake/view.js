// Admin page to view and export intake submissions from D1
// Access at: /api/intake/view?pass=YOUR_PASSWORD
// Set ADMIN_PASSWORD in Pages environment variables (production)

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  // Simple password protection
  const adminPassword = env.ADMIN_PASSWORD || 'forthelovedog2026';
  const pass = url.searchParams.get('pass');

  if (pass !== adminPassword) {
    return new Response(`
      <!DOCTYPE html>
      <html><head><title>Admin Login</title>
      <style>body{font-family:Arial,sans-serif;background:#f5f0e8;display:flex;justify-content:center;align-items:center;height:100vh;margin:0;}
      .box{background:#fff;padding:30px;border-radius:10px;box-shadow:0 2px 8px rgba(0,0,0,0.1);text-align:center;}
      input{padding:10px;width:200px;border:1px solid #ccc;border-radius:6px;margin:10px;}
      button{padding:10px 20px;background:#5a3a22;color:#fff;border:none;border-radius:6px;cursor:pointer;}
      </style></head>
      <body><div class="box">
      <h2>Admin Access</h2>
      <p>Enter password to view intake submissions</p>
      <form method="GET" action="">
      <input type="password" name="pass" placeholder="Password" autofocus>
      <br><button type="submit">Login</button>
      </form>
      </div></body></html>
    `, {
      status: 200,
      headers: { 'Content-Type': 'text/html' }
    });
  }

  // Query all submissions
  let submissions = [];
  if (env.INTAKE_DB) {
    const result = await env.INTAKE_DB.prepare(
      'SELECT * FROM intake_submissions ORDER BY submitted_at DESC'
    ).all();
    submissions = result.results || [];
  }

  // Build HTML table
  const rows = submissions.map(s => {
    const data = JSON.parse(s.form_data || '{}');
    const detailRows = Object.entries(data)
      .map(([k, v]) => `<tr><td><strong>${k.replace(/_/g, ' ')}</strong></td><td>${String(v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</td></tr>`)
      .join('');
    return `
      <tr>
        <td>${s.id}</td>
        <td>${s.submitted_at}</td>
        <td>${String(s.owner_name || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</td>
        <td>${String(s.dog_name || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</td>
        <td>${String(s.email || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</td>
        <td>${String(s.phone || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</td>
        <td><button onclick="document.getElementById('modal-${s.id}').style.display='block'">View</button></td>
        <td><button onclick="exportSingle(${s.id})" style="background:#4a7c59;">CSV</button></td>
      </tr>
      <div id="modal-${s.id}" class="modal" onclick="if(event.target===this)this.style.display='none'">
        <div class="modal-content">
          <span class="close" onclick="document.getElementById('modal-${s.id}').style.display='none'">&times;</span>
          <h2>Intake: ${String(s.owner_name || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')} - ${String(s.dog_name || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</h2>
          <p>Submitted: ${s.submitted_at}</p>
          <table class="detail-table">${detailRows}</table>
        </div>
      </div>
    `;
  }).join('');

  return new Response(`
    <!DOCTYPE html>
    <html><head><title>Intake Submissions - For the Love of Dog</title>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: Arial, sans-serif; background: #f5f0e8; color: #333; padding: 20px; }
      h1 { color: #5a3a22; margin-bottom: 20px; }
      .toolbar { margin-bottom: 15px; }
      .toolbar button { padding: 10px 20px; border: none; border-radius: 6px; cursor: pointer; font-size: 0.95em; }
      .btn-export { background: #4a7c59; color: #fff; }
      .btn-export:hover { background: #3a6c49; }
      table { width: 100%; border-collapse: collapse; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
      th { background: #5a3a22; color: #fff; padding: 10px; text-align: left; font-size: 0.9em; }
      td { padding: 10px; border-bottom: 1px solid #eee; font-size: 0.9em; }
      tr:hover { background: #f9f5f0; }
      button { padding: 6px 12px; border: 1px solid #ccc; border-radius: 4px; cursor: pointer; background: #5a3a22; color: #fff; font-size: 0.85em; }
      button:hover { background: #3d2815; }
      .modal { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1000; }
      .modal-content { background: #fff; margin: 30px auto; padding: 30px; border-radius: 10px; max-width: 800px; max-height: 85vh; overflow-y: auto; }
      .close { float: right; font-size: 28px; cursor: pointer; color: #999; }
      .close:hover { color: #333; }
      .detail-table { width: 100%; border-collapse: collapse; margin-top: 15px; }
      .detail-table td { padding: 6px 10px; border-bottom: 1px solid #eee; vertical-align: top; }
      .detail-table td:first-child { width: 200px; font-weight: bold; color: #5a3a22; text-transform: capitalize; }
      .empty { text-align: center; padding: 40px; color: #999; }
    </style>
    </head>
    <body>
      <h1>Intake Submissions</h1>
      <div class="toolbar">
        <button class="btn-export" onclick="exportAll()">Export All as CSV</button>
      </div>
      ${submissions.length === 0 ? '<p class="empty">No submissions yet.</p>' : `
      <table>
        <thead><tr><th>ID</th><th>Submitted</th><th>Owner</th><th>Dog</th><th>Email</th><th>Phone</th><th>Details</th><th>Export</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
      `}
      <script>
        const submissions = ${JSON.stringify(submissions.map(s => ({ ...s, form_data: JSON.parse(s.form_data || '{}') })))};

        function downloadCsv(filename, rows) {
          if (rows.length === 0) return;
          const headers = [...new Set(rows.flatMap(r => Object.keys(r)))];
          const csv = [
            headers.join(','),
            ...rows.map(r => headers.map(h => '"' + String(r[h] || '').replace(/"/g, '""') + '"').join(','))
          ].join('\\n');
          const blob = new Blob([csv], { type: 'text/csv' });
          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = filename;
          link.click();
        }

        function exportAll() {
          downloadCsv('intake-submissions.csv', submissions.map(s => s.form_data));
        }

        function exportSingle(id) {
          const s = submissions.find(x => x.id === id);
          if (s) downloadCsv('intake-' + s.owner_name + '-' + s.dog_name + '.csv', [s.form_data]);
        }
      </script>
    </body></html>
  `, {
    status: 200,
    headers: { 'Content-Type': 'text/html' }
  });
}
