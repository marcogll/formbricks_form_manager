require('dotenv').config();
const express = require('express');
const path = require('path');
const surveyRoutes = require('./routes/surveys');
const adminRoutes = require('./routes/admin');
const { refreshSurveyCache } = require('./services/formbricks');

const app = express();
const PORT = process.env.PORT || 3011;

// Template Engine Setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Root landing page
app.get('/', (req, res) => {
  res.render('index', {
    title: 'Formbricks Survey Portal'
  });
});

// Admin UI
app.get('/admin', (req, res) => {
  res.render('admin', {
    title: 'Admin - Formbricks Vanity'
  });
});

// Admin API routes
app.use('/api/mappings', adminRoutes);

// Main survey routes (catch-all for vanity URLs)
app.use('/', surveyRoutes);

// Handle 404 for any other route
app.use((req, res, next) => {
  res.status(404).send('Sorry, that page does not exist.');
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Initialize the survey cache at startup
refreshSurveyCache()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running at http://localhost:${PORT}`);
    });
  })
  .catch(error => {
    console.error('Failed to initialize Formbricks survey cache. Please check API key and connection.', error);
    process.exit(1); // Exit if we can't load the initial surveys
  });
