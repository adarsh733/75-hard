const fs = require('fs');

// READ FROM NETLIFY ENV VARS OR FALLBACK TO PROJECT CREDENTIALS
const url = process.env.SUPABASE_URL || 'https://jamsrlijvqypdxucvhox.supabase.co';
const key = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImphbXNybGlqdnF5cGR4dWN2aG94Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY1MDczOTksImV4cCI6MjEwMjA4MzM5OX0.iInG76ebAetpdWrOefmqSlvpTeBqxt0z_RW_OUx6Ah4';

const content = `// Generated automatically during Netlify build
window.SUPABASE_URL = "${url}";
window.SUPABASE_KEY = "${key}";
`;

fs.writeFileSync('config.js', content);
console.log('✓ Successfully generated config.js for Supabase Live connection!');
