const fs = require('fs');

const url = process.env.SUPABASE_URL || '';
const key = process.env.SUPABASE_KEY || '';

const content = `// Generated automatically during Netlify build
window.SUPABASE_URL = "${url}";
window.SUPABASE_KEY = "${key}";
`;

fs.writeFileSync('config.js', content);
console.log('✓ Successfully generated config.js for Netlify runtime!');
