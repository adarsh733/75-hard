const webpush = require('web-push');

const VAPID_PUBLIC = 'BCjVIB7D_7Z-YY7DB26ZrVBtx_S4sOpjxfGo7hjnntCeY82kjRGhmqpwztsmFsfH8a7bAN_oK54LkW9vkwqiaHU';
const VAPID_PRIVATE = '7rAP_tdDnJLFzRjXe2qcvpgKivaOUHiyaehqnCAi1kw';

webpush.setVapidDetails(
  'mailto:adarsh@75hard.app',
  VAPID_PUBLIC,
  VAPID_PRIVATE
);

exports.handler = async (event) => {
  // CORS Preflight Handling
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: 'OK'
    };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { subscription, title, body, icon, badge, image } = JSON.parse(event.body);

    if (!subscription || !subscription.endpoint) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Invalid subscription endpoint' })
      };
    }

    const payload = JSON.stringify({
      title: title || '75 Hard Alert',
      body: body || '',
      icon: icon || 'apple-touch-icon.png',
      badge: badge || 'icon.png',
      image: image || undefined
    });

    await webpush.sendNotification(subscription, payload);

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ success: true })
    };
  } catch (err) {
    console.error('Web Push Execution Error:', err);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: err.message || 'Web Push error' })
    };
  }
};
