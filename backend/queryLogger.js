const log = [];
const MAX = 20;

function record(text, params) {
  const sql = typeof text === 'object' ? text.text : text;
  const values = typeof text === 'object' ? text.values : params;
  log.unshift({
    sql: sql.trim().replace(/[ \t]+/g, ' '),
    params: values || [],
    time: new Date().toISOString(),
    op: /^\s*(SELECT|INSERT|UPDATE|DELETE|CREATE|DROP|ALTER)/i.exec(sql)?.[1]?.toUpperCase() || 'SQL'
  });
  if (log.length > MAX) log.pop();
}

function getLog() { return log; }

module.exports = { record, getLog };
