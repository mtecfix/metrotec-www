const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

// AI Configuration Routes
app.get('/admin/ai-config', (req, res) => {
  res.sendFile(path.join(__dirname, 'views/ai-config.html'));
});

app.get('/admin/content-generator', (req, res) => {
  res.sendFile(path.join(__dirname, 'views/content-generator.html'));
});

app.get('/admin/seo-optimizer', (req, res) => {
  res.sendFile(path.join(__dirname, 'views/seo-optimizer.html'));
});

// API Routes
app.post('/api/generate-content', (req, res) => {
  const { type, topic, keywords } = req.body;
  res.json({
    success: true,
    content: `Generated ${type} content for ${topic} with keywords: ${keywords.join(', ')}`
  });
});

app.post('/api/optimize-seo', (req, res) => {
  const { url, content } = req.body;
  res.json({
    success: true,
    suggestions: [
      'Add meta description',
      'Optimize title length',
      'Include focus keyword in H1'
    ]
  });
});

app.listen(PORT, () => {
  console.log(`MetroTec CMS running on port ${PORT}`);
});
