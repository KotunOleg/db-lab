const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());

// Serve frontend static files
app.use(express.static(path.join('/app/frontend')));

// Mount API routes
app.use('/api/people', require('./routes/people'));
app.use('/api/agents', require('./routes/agents'));
app.use('/api/clients', require('./routes/clients'));
app.use('/api/relatives', require('./routes/relatives'));
app.use('/api/vehicles', require('./routes/vehicles'));
app.use('/api/policies', require('./routes/policies'));
app.use('/api/risks', require('./routes/risks'));
app.use('/api/marriages', require('./routes/marriages'));
app.use('/api/queries', require('./routes/queries'));

// Fallback to index.html for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join('/app/frontend', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Insurance Lab server running on port ${PORT}`);
  console.log(`Frontend: http://localhost:${PORT}`);
  console.log(`API: http://localhost:${PORT}/api`);
});
