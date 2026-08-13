const fs = require('fs');

const url = process.env.SUPABASE_URL || '';
const key = process.env.SUPABASE_KEY || '';

const content = `// Generated automatically during Netlify build - DO NOT COMMIT TO GIT
window.SUPABASE_URL = "${url}";
window.SUPABASE_KEY = "${key}";
`;

fs.writeFileSync('config.js', content);
console.log('✓ Successfully generated runtime config.js from Netlify environment variables!');
