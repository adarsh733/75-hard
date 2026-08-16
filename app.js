/* ==========================================
   75 HARD DUO - ADARSH & SANJANA LOGIC ENGINE
   COMPLETE SYSTEM WEB PUSH NOTIFICATION ENGINE
   ========================================== */

(function () {
  'use strict';

  const MASTER_SECURITY_PHONE = '9479918338';

  const DEFAULT_SUPABASE_URL = 'https://jamsrlijvqypdxucvhox.supabase.co';
  const DEFAULT_SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImphbXNybGlqdnF5cGR4dWN2aG94Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY1MDczOTksImV4cCI6MjEwMjA4MzM5OX0.iInG76ebAetpdWrOefmqSlvpTeBqxt0z_RW_OUx6Ah4';

  const DEFAULT_U1_HABITS = [
    "💧 Drink 4L Water",
    "🏃 45 Min Outdoor Workout",
    "🏋️ 45 Min Indoor Workout",
    "📖 Read 10 Pages (Non-Fiction)",
    "🥗 Clean Diet (No Alcohol/Cheat)"
  ];

  const DEFAULT_U2_HABITS = [
    "💧 Drink 3.5L Water",
    "🧘 45 Min Yoga / Workout",
    "🚶 45 Min Outdoor Walk",
    "📖 Read 10 Pages Book",
    "🥗 Clean Diet & No Sugar"
  ];

  const GET_SUPABASE_URL = () => {
    const override = localStorage.getItem('75hard_supabase_url');
    if (override && override.trim() && override.trim().startsWith('http')) return override.trim();
    if (window.SUPABASE_URL && window.SUPABASE_URL.trim() && window.SUPABASE_URL.trim().startsWith('http')) return window.SUPABASE_URL.trim();
    return DEFAULT_SUPABASE_URL;
  };

  const GET_SUPABASE_KEY = () => {
    const override = localStorage.getItem('75hard_supabase_key');
    if (override && override.trim() && override.trim().length > 20) return override.trim();
    if (window.SUPABASE_KEY && window.SUPABASE_KEY.trim() && window.SUPABASE_KEY.trim().length > 20) return window.SUPABASE_KEY.trim();
    return DEFAULT_SUPABASE_KEY;
  };

  const STORAGE_KEY_SETTINGS = '75hard_duo_settings';
  const STORAGE_KEY_DATA = '75hard_duo_history_data';
  const STORAGE_KEY_READ_NUDGES = '75hard_duo_read_nudges';
  const STORAGE_KEY_DEVICE_IDENTITY = '75hard_device_identity';
  const STORAGE_KEY_LAST_REMINDER = '75hard_last_reminder_time';

  let state = {
    settings: {
      u1Name: 'Adarsh',
      u2Name: 'Sanjana',
      u1Habits: [...DEFAULT_U1_HABITS],
      u2Habits: [...DEFAULT_U2_HABITS],
      startDate: formatDateToYYYYMMDD(new Date()),
      theme: 'dark',
      myUser: 'u1'
    },
    history: {},
    activeDateStr: formatDateToYYYYMMDD(new Date()),
    supabaseClient: null,
    isOnline: false,
    readNudges: [],
    unreadChatCount: 0,
    isChatOpen: false,
    showPartnerHabitsInSettings: false,
    swRegistration: null
  };

  // DOM Elements
  const dom = {
    // Header Logged-In User DP Avatar Button
    headerUserDpBtn: document.getElementById('header-user-dp-btn'),
    headerUserDpImg: document.getElementById('header-user-dp-img'),

    syncStatus: document.getElementById('sync-status'),
    notifBellBtn: document.getElementById('notif-bell-btn'),
    notifBellIcon: document.getElementById('notif-bell-icon'),
    settingsEnableNotifBtn: document.getElementById('settings-enable-notif-btn'),
    refreshBtn: document.getElementById('refresh-btn'),
    openSettingsBtn: document.getElementById('open-settings-btn'),
    settingsModal: document.getElementById('settings-modal'),
    closeModalBtn: document.getElementById('close-modal-btn'),
    saveSettingsBtn: document.getElementById('save-settings-btn'),
    resetDefaultsBtn: document.getElementById('reset-defaults-btn'),
    resetSupabaseBtn: document.getElementById('reset-supabase-btn'),

    // First Time / Switch Identity Prompt DOM
    firstTimeIdentityModal: document.getElementById('first-time-identity-modal'),
    closeIdentityModalBtn: document.getElementById('close-identity-modal-btn'),
    selectU1Card: document.getElementById('select-u1-card'),
    selectU2Card: document.getElementById('select-u2-card'),

    // Chat Header Fixed Device Badge
    chatUserDpImg: document.getElementById('chat-user-dp-img'),
    chatUserNameText: document.getElementById('chat-user-name-text'),

    // Security Verification Modal DOM
    securityModal: document.getElementById('security-modal'),
    closeSecurityModalBtn: document.getElementById('close-security-modal-btn'),
    cancelSecurityBtn: document.getElementById('cancel-security-btn'),
    confirmSecurityResetBtn: document.getElementById('confirm-security-reset-btn'),
    securityPhoneInput: document.getElementById('security-phone-input'),
    securityErrorMsg: document.getElementById('security-error-msg'),

    // Settings Habit Groups & Toggle Button
    u1HabitsSettingsGroup: document.getElementById('u1-habits-settings-group'),
    u2HabitsSettingsGroup: document.getElementById('u2-habits-settings-group'),
    togglePartnerHabitsBtn: document.getElementById('toggle-partner-habits-btn'),

    // Device User Identity DOM in Settings
    idU1Opt: document.getElementById('id-u1-opt'),
    idU2Opt: document.getElementById('id-u2-opt'),

    // Theme Switcher DOM
    themeDarkOpt: document.getElementById('theme-dark-opt'),
    themeLightOpt: document.getElementById('theme-light-opt'),

    // Day nav
    prevDayBtn: document.getElementById('prev-day-btn'),
    nextDayBtn: document.getElementById('next-day-btn'),
    currentDayLabel: document.getElementById('current-day-label'),
    dateInput: document.getElementById('date-input'),
    dateDisplayStr: document.getElementById('date-display-str'),

    // Banter & toast
    banterBanner: document.getElementById('banter-banner'),
    banterIcon: document.getElementById('banter-icon'),
    banterMessage: document.getElementById('banter-message'),
    nudgeBtn: document.getElementById('nudge-btn'),
    toast: document.getElementById('toast'),
    toastMsg: document.getElementById('toast-msg'),

    // Floating Action Button & Chat Modal
    floatingChatBtn: document.getElementById('floating-chat-btn'),
    chatUnreadBadge: document.getElementById('chat-unread-badge'),
    chatModal: document.getElementById('chat-modal'),
    closeChatModalBtn: document.getElementById('close-chat-modal-btn'),
    chatDatePill: document.getElementById('chat-date-pill'),
    chatContainer: document.getElementById('chat-messages-container'),
    chatEmptyState: document.getElementById('chat-empty-state'),
    chatForm: document.getElementById('chat-form'),
    chatInput: document.getElementById('chat-input'),

    // User 1 (Adarsh)
    u1Avatar: document.getElementById('u1-avatar'),
    u1NameDisplay: document.getElementById('u1-name-display'),
    u1Status: document.getElementById('u1-status'),
    u1Streak: document.getElementById('u1-streak'),
    u1RingFill: document.getElementById('u1-ring-fill'),
    u1Pct: document.getElementById('u1-pct'),
    u1HabitsContainer: document.getElementById('u1-habits-container'),
    u1BarFill: document.getElementById('u1-bar-fill'),

    // User 2 (Sanjana)
    u2Avatar: document.getElementById('u2-avatar'),
    u2NameDisplay: document.getElementById('u2-name-display'),
    u2Status: document.getElementById('u2-status'),
    u2Streak: document.getElementById('u2-streak'),
    u2RingFill: document.getElementById('u2-ring-fill'),
    u2Pct: document.getElementById('u2-pct'),
    u2HabitsContainer: document.getElementById('u2-habits-container'),
    u2BarFill: document.getElementById('u2-bar-fill'),

    // Popup Encouragement Modal
    encouragementPopup: document.getElementById('encouragement-popup'),
    encSenderDp: document.getElementById('enc-sender-dp'),
    encTitle: document.getElementById('enc-title'),
    encMessage: document.getElementById('enc-message'),
    encDismissBtn: document.getElementById('enc-dismiss-btn'),

    // Send Nudge Modal
    sendNudgeModal: document.getElementById('send-nudge-modal'),
    closeNudgeModalBtn: document.getElementById('close-nudge-modal-btn'),
    customNudgeText: document.getElementById('custom-nudge-text'),
    submitNudgeBtn: document.getElementById('submit-nudge-btn'),

    // Individual Matrices
    u1MatrixName: document.getElementById('u1-matrix-name'),
    u1CompletedCount: document.getElementById('u1-completed-count'),
    u1MatrixGrid: document.getElementById('u1-matrix-grid'),

    u2MatrixName: document.getElementById('u2-matrix-name'),
    u2CompletedCount: document.getElementById('u2-completed-count'),
    u2MatrixGrid: document.getElementById('u2-matrix-grid'),

    // Modal Inputs
    u1NameInput: document.getElementById('u1-name-input'),
    u2NameInput: document.getElementById('u2-name-input'),
    u1HabitInputs: [
      document.getElementById('u1-habit-0'),
      document.getElementById('u1-habit-1'),
      document.getElementById('u1-habit-2'),
      document.getElementById('u1-habit-3'),
      document.getElementById('u1-habit-4')
    ],
    u2HabitInputs: [
      document.getElementById('u2-habit-0'),
      document.getElementById('u2-habit-1'),
      document.getElementById('u2-habit-2'),
      document.getElementById('u2-habit-3'),
      document.getElementById('u2-habit-4')
    ],
    startDateInput: document.getElementById('start-date-input')
  };

  async function init() {
    loadLocalSettings();
    loadLocalHistory();
    loadReadNudges();

    applyTheme(state.settings.theme || 'dark');

    // Register Service Worker for PWAs and Push Notifications
    registerServiceWorker();

    // Auto-load device identity from localStorage if saved
    const savedIdentity = localStorage.getItem(STORAGE_KEY_DEVICE_IDENTITY);
    if (!savedIdentity) {
      if (dom.firstTimeIdentityModal) dom.firstTimeIdentityModal.classList.remove('hidden');
    } else {
      state.settings.myUser = savedIdentity;
    }

    applyIdentity(state.settings.myUser || 'u1');

    setupEventListeners();
    await attemptSupabaseReconnect();

    renderUI();
    checkPendingPopupEncouragement();
    updateNotifBellState();

    // AUTOMATICALLY REQUEST PUSH NOTIFICATION PERMISSION ON OPEN
    autoRequestNotificationPermission();

    // START SMART ACCOUNTABILITY REMINDER ENGINE
    startAccountabilityReminderEngine();

    // Listen to network online/offline events for self-healing status
    window.addEventListener('online', async () => {
      await attemptSupabaseReconnect();
      renderUI();
      showToast('⚡ Network restored! Live Sync Connected!');
    });

    window.addEventListener('offline', () => {
      updateSyncStatusBadge(false);
      showToast('⚠️ Network Offline - Local Mode Active');
    });
  }

  function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((reg) => {
          state.swRegistration = reg;
          console.log('✓ Service Worker registered successfully');
        })
        .catch((err) => {
          console.warn('Service Worker registration failed:', err);
        });
    }
  }

  function autoRequestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      setTimeout(() => {
        requestNotificationPermission();
      }, 1000);
    }
  }

  async function requestNotificationPermission() {
    if (!('Notification' in window)) {
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      updateNotifBellState();

      if (permission === 'granted') {
        showToast('🔔 System Push Notifications Enabled!');
        triggerDeviceNotification('🔔 Notifications Enabled!', 'You will receive instant lock-screen & on-screen push notifications for chat, boosts, acknowledgments & reminders!', 'apple-touch-icon.png');
        return true;
      }
      return false;
    } catch (e) {
      console.warn('Error requesting notification permission:', e);
      return false;
    }
  }

  function updateNotifBellState() {
    if (!dom.notifBellIcon) return;
    if ('Notification' in window && Notification.permission === 'granted') {
      dom.notifBellIcon.className = 'fa-solid fa-bell';
      if (dom.notifBellBtn) dom.notifBellBtn.style.color = 'var(--u1-color)';
      if (dom.settingsEnableNotifBtn) {
        dom.settingsEnableNotifBtn.innerHTML = '<i class="fa-solid fa-circle-check"></i> Notifications Active';
        dom.settingsEnableNotifBtn.className = 'btn btn-secondary btn-full active';
      }
    } else {
      dom.notifBellIcon.className = 'fa-regular fa-bell';
      if (dom.notifBellBtn) dom.notifBellBtn.style.color = 'var(--text-main)';
    }
  }

  // SYSTEM NOTIFICATION BANNER ENGINE (LOCK SCREEN & SCREEN DROP-DOWN BANNERS)
  function triggerDeviceNotification(title, bodyText, iconPath) {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      return;
    }

    const options = {
      body: bodyText,
      icon: iconPath || 'apple-touch-icon.png',
      badge: 'icon.png',
      vibrate: [300, 100, 300, 100, 300],
      tag: '75hard_push_' + Date.now(),
      renotify: true,
      requireInteraction: false,
      data: { url: '/' }
    };

    if (state.swRegistration && state.swRegistration.showNotification) {
      state.swRegistration.showNotification(title, options);
    } else {
      try {
        new Notification(title, options);
      } catch (e) {
        console.warn('Native Notification failed:', e);
      }
    }
  }

  // SMART ACCOUNTABILITY REMINDER ENGINE FOR INCOMPLETE TASKS
  function startAccountabilityReminderEngine() {
    checkAndTriggerTaskReminders();
    
    // Check every 30 minutes
    setInterval(() => {
      checkAndTriggerTaskReminders();
    }, 30 * 60 * 1000);
  }

  function checkAndTriggerTaskReminders() {
    const todayStr = formatDateToYYYYMMDD(new Date());
    const entry = getDayEntry(todayStr);

    const myUserKey = state.settings.myUser || 'u1';
    const myTicks = entry[myUserKey] || [false, false, false, false, false];
    const completedCount = myTicks.filter(Boolean).length;

    // If already completed 5/5 today, no reminder needed
    if (completedCount === 5) return;

    // Check last reminder time to avoid spamming (limit to once every 3 hours)
    const lastReminderTime = parseInt(localStorage.getItem(STORAGE_KEY_LAST_REMINDER) || '0', 10);
    const now = Date.now();
    const THREE_HOURS_MS = 3 * 60 * 60 * 1000;

    if (now - lastReminderTime < THREE_HOURS_MS) {
      return;
    }

    const isU1 = (myUserKey === 'u1');
    const myName = isU1 ? (state.settings.u1Name || 'Adarsh') : (state.settings.u2Name || 'Sanjana');
    const partnerName = isU1 ? (state.settings.u2Name || 'Sanjana') : (state.settings.u1Name || 'Adarsh');
    const myDp = isU1 ? 'adarsh.jpg' : 'sanjana.jpg';

    // Tailored customized accountability reminders by name and missing count
    const adarshReminders = [
      `Hey ${myName}! 🏋️ You have ${5 - completedCount} habits remaining! Don't let ${partnerName} win today!`,
      `${myName}, you're at ${completedCount}/5! Drink your water & get moving before ${partnerName} calls you out! 💧`,
      `Day is slipping away ${myName}! Finish your ${5 - completedCount} habits! 🔥`,
      `${myName}! 📖 Read those pages & finish your workouts or face the banter!`,
      `Accountability Check ${myName}! ${completedCount}/5 habits done. Time to crush the rest!`
    ];

    const sanjanaReminders = [
      `Hey ${myName}! 🧘 Time for your workout! ${partnerName} is watching the scoreboard!`,
      `${myName}, you're at ${completedCount}/5! Finish your habits & stay ahead of ${partnerName}! 💪`,
      `Don't slack now ${myName}! ${5 - completedCount} habits left for a 100% Green Day! 🔥`,
      `${myName}! 💧 Hydration & reading check! Let's get to 5/5!`,
      `Accountability Boost for ${myName}! ${completedCount}/5 complete. Let's finish strong!`
    ];

    const pool = isU1 ? adarshReminders : sanjanaReminders;
    const randomMsg = pool[Math.floor(Math.random() * pool.length)];

    // TRIGGER SYSTEM PUSH NOTIFICATION
    triggerDeviceNotification(`🔥 75 Hard Check: ${myName} (${completedCount}/5)`, randomMsg, myDp);
    localStorage.setItem(STORAGE_KEY_LAST_REMINDER, now.toString());
  }

  function loadLocalSettings() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (saved) {
        const parsed = JSON.parse(saved);
        state.settings = Object.assign({}, state.settings, parsed);
        
        // Auto-sanitize any lingering test data
        if (!state.settings.u1Habits || !Array.isArray(state.settings.u1Habits) || state.settings.u1Habits[0].includes('Habit A') || state.settings.u1Habits[0].includes('script')) {
          state.settings.u1Habits = [...DEFAULT_U1_HABITS];
        }
        if (!state.settings.u2Habits || !Array.isArray(state.settings.u2Habits) || state.settings.u2Habits[0].includes('Habit A') || state.settings.u2Habits[0].includes('script')) {
          state.settings.u2Habits = [...DEFAULT_U2_HABITS];
        }
        if (!state.settings.u1Name || state.settings.u1Name.includes('<test>')) state.settings.u1Name = 'Adarsh';
        if (!state.settings.u2Name || state.settings.u2Name.includes('& Co')) state.settings.u2Name = 'Sanjana';
        if (!state.settings.theme) state.settings.theme = 'dark';
        if (!state.settings.myUser) state.settings.myUser = 'u1';
      }
    } catch (e) {
      console.warn('Could not load settings', e);
    }
  }

  function saveLocalSettings() {
    try {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(state.settings));
      localStorage.setItem(STORAGE_KEY_DEVICE_IDENTITY, state.settings.myUser);
    } catch (e) {
      console.warn('Could not save settings', e);
    }
  }

  function applyTheme(themeName) {
    state.settings.theme = themeName;
    document.body.setAttribute('data-theme', themeName);

    if (themeName === 'light') {
      if (dom.themeLightOpt) dom.themeLightOpt.classList.add('active');
      if (dom.themeDarkOpt) dom.themeDarkOpt.classList.remove('active');
    } else {
      if (dom.themeDarkOpt) dom.themeDarkOpt.classList.add('active');
      if (dom.themeLightOpt) dom.themeLightOpt.classList.remove('active');
    }
  }

  function applyIdentity(userKey) {
    state.settings.myUser = userKey;
    localStorage.setItem(STORAGE_KEY_DEVICE_IDENTITY, userKey);

    const u1Name = state.settings.u1Name || 'Adarsh';
    const u2Name = state.settings.u2Name || 'Sanjana';
    const isU1 = (userKey === 'u1');
    const activeName = isU1 ? u1Name : u2Name;

    // Header Logged-In User Profile Avatar DP
    if (dom.headerUserDpImg) dom.headerUserDpImg.src = isU1 ? 'adarsh.jpg' : 'sanjana.jpg';
    if (dom.headerUserDpBtn) {
      dom.headerUserDpBtn.style.borderColor = isU1 ? 'var(--u1-color)' : 'var(--u2-color)';
      dom.headerUserDpBtn.style.boxShadow = isU1 ? '0 0 10px var(--u1-glow)' : '0 0 10px var(--u2-glow)';
    }

    // Chat Header Fixed Device Badge
    if (dom.chatUserDpImg) dom.chatUserDpImg.src = isU1 ? 'adarsh.jpg' : 'sanjana.jpg';
    if (dom.chatUserNameText) dom.chatUserNameText.textContent = activeName;

    // Settings Segmented Control Buttons
    if (userKey === 'u1') {
      if (dom.idU1Opt) dom.idU1Opt.classList.add('active');
      if (dom.idU2Opt) dom.idU2Opt.classList.remove('active');
    } else {
      if (dom.idU2Opt) dom.idU2Opt.classList.add('active');
      if (dom.idU1Opt) dom.idU1Opt.classList.remove('active');
    }

    // Auto-filter settings menu based on who is using the device
    if (!state.showPartnerHabitsInSettings) {
      if (userKey === 'u1') {
        if (dom.u1HabitsSettingsGroup) dom.u1HabitsSettingsGroup.classList.remove('hidden');
        if (dom.u2HabitsSettingsGroup) dom.u2HabitsSettingsGroup.classList.add('hidden');
      } else {
        if (dom.u2HabitsSettingsGroup) dom.u2HabitsSettingsGroup.classList.remove('hidden');
        if (dom.u1HabitsSettingsGroup) dom.u1HabitsSettingsGroup.classList.add('hidden');
      }
    } else {
      if (dom.u1HabitsSettingsGroup) dom.u1HabitsSettingsGroup.classList.remove('hidden');
      if (dom.u2HabitsSettingsGroup) dom.u2HabitsSettingsGroup.classList.remove('hidden');
    }

    renderBanterChat();
  }

  function loadLocalHistory() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_DATA);
      if (saved) {
        state.history = JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Could not load history', e);
    }
  }

  function saveLocalHistory() {
    try {
      localStorage.setItem(STORAGE_KEY_DATA, JSON.stringify(state.history));
    } catch (e) {
      console.warn('Could not save history', e);
    }
  }

  function loadReadNudges() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_READ_NUDGES);
      if (saved) {
        state.readNudges = JSON.parse(saved);
      }
    } catch (e) {
      state.readNudges = [];
    }
  }

  function saveReadNudges() {
    try {
      localStorage.setItem(STORAGE_KEY_READ_NUDGES, JSON.stringify(state.readNudges));
    } catch (e) {}
  }

  // SUPABASE REALTIME RECONNECT ENGINE WITH REST API PING VERIFICATION
  async function attemptSupabaseReconnect() {
    const targetUrl = GET_SUPABASE_URL();
    const targetKey = GET_SUPABASE_KEY();

    if (!window.supabase) {
      console.warn('Supabase JS SDK not loaded yet.');
      updateSyncStatusBadge(false);
      return false;
    }

    try {
      // Direct REST ping test to verify credentials & network reachability
      const pingRes = await fetch(`${targetUrl}/rest/v1/habit_history?select=date&limit=1`, {
        headers: {
          'apikey': targetKey,
          'Authorization': `Bearer ${targetKey}`
        }
      });

      if (!pingRes.ok) {
        console.error('Supabase REST Ping failed with status:', pingRes.status);
        state.isOnline = false;
        updateSyncStatusBadge(false);
        return false;
      }

      state.supabaseClient = window.supabase.createClient(targetUrl, targetKey);
      state.isOnline = true;
      updateSyncStatusBadge(true);

      const { data, error } = await state.supabaseClient.from('habit_history').select('*');
      if (!error && data && Array.isArray(data)) {
        data.forEach(row => {
          if (row.date === '_APP_SETTINGS_') {
            applySyncedAppSettings(row);
          } else if (row.date) {
            const u1Payload = unpackPayload(row.u1_ticks);
            const u2Payload = unpackPayload(row.u2_ticks);

            state.history[row.date] = {
              u1: u1Payload.ticks,
              u2: u2Payload.ticks,
              chat: u1Payload.chat || u2Payload.chat || [],
              nudge: u1Payload.nudge || u2Payload.nudge || null
            };
          }
        });
        saveLocalHistory();
        checkPendingPopupEncouragement();
      }

      // Subscribe to live Postgres channel
      state.supabaseClient
        .channel('realtime:habit_history')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'habit_history' }, (payload) => {
          if (payload.new && payload.new.date) {
            state.isOnline = true;
            updateSyncStatusBadge(true);

            const dateStr = payload.new.date;
            const u1Name = state.settings.u1Name || 'Adarsh';
            const u2Name = state.settings.u2Name || 'Sanjana';

            // PUSH NOTIFICATION FOR APP SETTINGS SYNC
            if (dateStr === '_APP_SETTINGS_') {
              applySyncedAppSettings(payload.new);
              saveLocalSettings();
              renderUI();
              const partnerName = state.settings.myUser === 'u1' ? u2Name : u1Name;
              const partnerDp = state.settings.myUser === 'u1' ? 'sanjana.jpg' : 'adarsh.jpg';

              triggerDeviceNotification(`⚙️ Settings Synced`, `${partnerName} updated habit names or challenge settings!`, partnerDp);
              showToast('⚙️ Habit names updated from partner!');
              return;
            }

            const prevChatCount = (state.history[dateStr]?.chat || []).length;
            
            const u1Payload = unpackPayload(payload.new.u1_ticks);
            const u2Payload = unpackPayload(payload.new.u2_ticks);

            const partnerUserKey = state.settings.myUser === 'u1' ? 'u2' : 'u1';
            const prevPartnerCount = (state.history[dateStr]?.[partnerUserKey] || []).filter(Boolean).length;
            const newPartnerCount = (partnerUserKey === 'u1' ? u1Payload.ticks : u2Payload.ticks).filter(Boolean).length;

            const newChatList = u1Payload.chat || u2Payload.chat || [];
            const newNudge = u1Payload.nudge || u2Payload.nudge || null;

            state.history[dateStr] = {
              u1: u1Payload.ticks,
              u2: u2Payload.ticks,
              chat: newChatList,
              nudge: newNudge
            };
            
            saveLocalHistory();
            renderUI();
            checkPendingPopupEncouragement();

            const todayStr = formatDateToYYYYMMDD(new Date());

            // TRIGGER SYSTEM PUSH NOTIFICATION FOR PARTNER 100% GREEN DAY (5/5 HABITS DONE)
            if (newPartnerCount === 5 && prevPartnerCount < 5 && dateStr === todayStr) {
              const partnerName = partnerUserKey === 'u1' ? u1Name : u2Name;
              const partnerDp = partnerUserKey === 'u1' ? 'adarsh.jpg' : 'sanjana.jpg';

              triggerDeviceNotification(`🌟 ${partnerName} finished 5/5 Habits!`, `${partnerName} just achieved a 100% Green Day! Hurry up and catch up! 🔥`, partnerDp);
              showToast(`🌟 ${partnerName} finished 5/5 Habits!`);
            }

            // TRIGGER SYSTEM PUSH NOTIFICATION FOR NEW CHAT MESSAGES
            if (newChatList.length > prevChatCount) {
              const latestMsg = newChatList[newChatList.length - 1];
              if (latestMsg && latestMsg.sender !== state.settings.myUser) {
                const senderName = (latestMsg.sender === 'u1' || latestMsg.sender === u1Name) ? u1Name : u2Name;
                const senderDp = (latestMsg.sender === 'u1' || latestMsg.sender === u1Name) ? 'adarsh.jpg' : 'sanjana.jpg';

                // Trigger System Push Notification Banner on phone lock screen / top bar
                triggerDeviceNotification(`💬 Banter from ${senderName}`, latestMsg.text, senderDp);

                if (!state.isChatOpen) {
                  state.unreadChatCount += (newChatList.length - prevChatCount);
                  updateUnreadChatBadge();
                  showToast(`💬 New banter from ${senderName}!`);
                } else {
                  renderBanterChat();
                }

                if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
              }
            }

            // TRIGGER SYSTEM PUSH NOTIFICATION FOR NEW ENCOURAGEMENT BOOST
            if (newNudge && newNudge.id && newNudge.sender !== state.settings.myUser && !state.readNudges.includes(newNudge.id)) {
              const senderName = (newNudge.sender === 'u1' || newNudge.sender === u1Name) ? u1Name : u2Name;
              const senderDp = (newNudge.sender === 'u1' || newNudge.sender === u1Name) ? 'adarsh.jpg' : 'sanjana.jpg';

              triggerDeviceNotification(`❤️ Boost from ${senderName}!`, newNudge.text, senderDp);
            }

            // TRIGGER SYSTEM PUSH NOTIFICATION WHEN PARTNER ACKNOWLEDGES A BOOST
            if (newNudge && newNudge.acknowledged && newNudge.sender === state.settings.myUser && newNudge.ackSender !== state.settings.myUser) {
              const ackKey = `ack_${newNudge.id}`;
              if (!state.readNudges.includes(ackKey)) {
                state.readNudges.push(ackKey);
                saveReadNudges();

                const partnerName = (newNudge.ackSender === 'u1' || newNudge.ackSender === u1Name) ? u1Name : u2Name;
                const partnerDp = (newNudge.ackSender === 'u1' || newNudge.ackSender === u1Name) ? 'adarsh.jpg' : 'sanjana.jpg';

                triggerDeviceNotification(`❤️ Boost Acknowledged by ${partnerName}!`, `${partnerName} tapped "Thanks! Let's Crush It!" 💪`, partnerDp);
                showToast(`❤️ ${partnerName} acknowledged your boost!`);
                if (navigator.vibrate) navigator.vibrate([100, 50, 100, 50, 100]);
              }
            }
          }
        })
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            state.isOnline = true;
            updateSyncStatusBadge(true);
          } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
            state.isOnline = false;
            updateSyncStatusBadge(false);
          }
        });

      return true;
    } catch (err) {
      console.error('Supabase Reconnect Error:', err);
      state.isOnline = false;
      updateSyncStatusBadge(false);
      return false;
    }
  }

  function applySyncedAppSettings(row) {
    if (!row || !row.u1_ticks || !row.u2_ticks) return;
    try {
      const u1Data = typeof row.u1_ticks === 'string' ? JSON.parse(row.u1_ticks) : row.u1_ticks;
      const u2Data = typeof row.u2_ticks === 'string' ? JSON.parse(row.u2_ticks) : row.u2_ticks;

      if (u1Data.habits && Array.isArray(u1Data.habits) && !u1Data.habits[0].includes('Habit A') && !u1Data.habits[0].includes('script')) {
        state.settings.u1Habits = u1Data.habits;
      } else {
        state.settings.u1Habits = [...DEFAULT_U1_HABITS];
      }

      if (u2Data.habits && Array.isArray(u2Data.habits) && !u2Data.habits[0].includes('Habit A') && !u2Data.habits[0].includes('script')) {
        state.settings.u2Habits = u2Data.habits;
      } else {
        state.settings.u2Habits = [...DEFAULT_U2_HABITS];
      }

      if (u1Data.name && !u1Data.name.includes('<test>')) {
        state.settings.u1Name = u1Data.name;
      } else {
        state.settings.u1Name = 'Adarsh';
      }

      if (u2Data.name && !u2Data.name.includes('& Co')) {
        state.settings.u2Name = u2Data.name;
      } else {
        state.settings.u2Name = 'Sanjana';
      }

      if (u1Data.startDate) state.settings.startDate = u1Data.startDate;

      saveLocalSettings();
    } catch (e) {
      console.warn('Error applying synced settings:', e);
    }
  }

  async function syncAppSettingsToSupabase() {
    if (!state.supabaseClient) return;
    try {
      const u1Payload = {
        habits: state.settings.u1Habits,
        name: state.settings.u1Name,
        startDate: state.settings.startDate
      };
      const u2Payload = {
        habits: state.settings.u2Habits,
        name: state.settings.u2Name,
        startDate: state.settings.startDate
      };

      await state.supabaseClient.from('habit_history').upsert({
        date: '_APP_SETTINGS_',
        u1_ticks: u1Payload,
        u2_ticks: u2Payload,
        updated_at: new Date().toISOString()
      });
    } catch (e) {
      console.error('Error syncing app settings to Supabase:', e);
    }
  }

  function updateUnreadChatBadge() {
    if (!dom.chatUnreadBadge) return;
    if (state.unreadChatCount > 0) {
      dom.chatUnreadBadge.textContent = state.unreadChatCount;
      dom.chatUnreadBadge.classList.remove('hidden');
    } else {
      dom.chatUnreadBadge.classList.add('hidden');
    }
  }

  function unpackPayload(val) {
    if (Array.isArray(val)) {
      return { ticks: val, chat: [], nudge: null };
    } else if (val && typeof val === 'object') {
      return {
        ticks: val.ticks || [false, false, false, false, false],
        chat: val.chat || [],
        nudge: val.nudge || null
      };
    }
    return { ticks: [false, false, false, false, false], chat: [], nudge: null };
  }

  function updateSyncStatusBadge(online) {
    if (!dom.syncStatus) return;
    if (online) {
      dom.syncStatus.className = 'sync-badge online';
      dom.syncStatus.setAttribute('title', 'Supabase Live Sync Connected - Tap to Re-test');
      dom.syncStatus.innerHTML = '<i class="fa-solid fa-bolt"></i>';
    } else {
      dom.syncStatus.className = 'sync-badge offline';
      dom.syncStatus.setAttribute('title', 'Offline / Connection Retry Required - Tap to Re-connect');
      dom.syncStatus.innerHTML = '<i class="fa-solid fa-bolt"></i>';
    }
  }

  function formatDateToYYYYMMDD(dateObj) {
    const yyyy = dateObj.getFullYear();
    const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
    const dd = String(dateObj.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  function parseYYYYMMDD(str) {
    const parts = str.split('-');
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }

  function calculateDayNumber(targetDateStr) {
    const start = parseYYYYMMDD(state.settings.startDate);
    const target = parseYYYYMMDD(targetDateStr);
    const diffTime = target.getTime() - start.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }

  function getDateForDayNumber(dayNum) {
    const start = parseYYYYMMDD(state.settings.startDate);
    start.setDate(start.getDate() + (dayNum - 1));
    return formatDateToYYYYMMDD(start);
  }

  function getDayEntry(dateStr) {
    if (!state.history[dateStr]) {
      state.history[dateStr] = {
        u1: [false, false, false, false, false],
        u2: [false, false, false, false, false],
        chat: [],
        nudge: null
      };
    }
    return state.history[dateStr];
  }

  function renderUI() {
    renderHeaderAndNav();
    renderUserCards();
    renderBanterBanner();
    renderBanterChat();
    renderIndividualMatrices();
  }

  function renderHeaderAndNav() {
    const dayNum = calculateDayNumber(state.activeDateStr);
    if (dom.currentDayLabel) dom.currentDayLabel.textContent = dayNum > 0 ? `DAY ${dayNum}` : `PRE-START`;
    if (dom.dateInput) dom.dateInput.value = state.activeDateStr;

    const dObj = parseYYYYMMDD(state.activeDateStr);
    const todayStr = formatDateToYYYYMMDD(new Date());
    let formattedStr = dObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' });
    if (state.activeDateStr === todayStr) {
      formattedStr = `Today, ${dObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    }
    if (dom.dateDisplayStr) dom.dateDisplayStr.textContent = formattedStr;

    const u1Name = state.settings.u1Name || 'Adarsh';
    const u2Name = state.settings.u2Name || 'Sanjana';

    if (dom.u1NameDisplay) dom.u1NameDisplay.textContent = u1Name;
    if (dom.u2NameDisplay) dom.u2NameDisplay.textContent = u2Name;

    if (dom.u1Avatar && !dom.u1Avatar.querySelector('img')) {
      dom.u1Avatar.textContent = u1Name.substring(0, 1).toUpperCase();
    }
    if (dom.u2Avatar && !dom.u2Avatar.querySelector('img')) {
      dom.u2Avatar.textContent = u2Name.substring(0, 1).toUpperCase();
    }

    if (dom.u1Streak) dom.u1Streak.textContent = calculateStreak('u1');
    if (dom.u2Streak) dom.u2Streak.textContent = calculateStreak('u2');
  }

  function calculateStreak(userKey) {
    let streak = 0;
    let currDate = new Date();
    
    for (let i = 0; i < 75; i++) {
      const dStr = formatDateToYYYYMMDD(currDate);
      const entry = state.history[dStr];
      if (entry && entry[userKey] && entry[userKey].every(Boolean)) {
        streak++;
      } else if (i === 0) {
      } else {
        break;
      }
      currDate.setDate(currDate.getDate() - 1);
    }
    return streak;
  }

  function renderUserCards() {
    const entry = getDayEntry(state.activeDateStr);

    renderHabitsForUser('u1', entry.u1, state.settings.u1Habits, dom.u1HabitsContainer);
    updateUserProgress(entry.u1, dom.u1Status, dom.u1RingFill, dom.u1Pct, dom.u1BarFill);

    renderHabitsForUser('u2', entry.u2, state.settings.u2Habits, dom.u2HabitsContainer);
    updateUserProgress(entry.u2, dom.u2Status, dom.u2RingFill, dom.u2Pct, dom.u2BarFill);
  }

  function renderHabitsForUser(userKey, userTicks, habitsList, containerEl) {
    if (!containerEl) return;
    containerEl.innerHTML = '';
    habitsList.forEach((habitText, idx) => {
      const isChecked = !!userTicks[idx];
      
      const itemEl = document.createElement('div');
      itemEl.className = `habit-item ${isChecked ? 'completed' : ''}`;
      itemEl.innerHTML = `
        <div class="habit-checkbox">
          <i class="fa-solid fa-check"></i>
        </div>
        <span class="habit-text">${escapeHtml(habitText)}</span>
      `;

      itemEl.addEventListener('click', () => {
        toggleHabit(userKey, idx);
      });

      containerEl.appendChild(itemEl);
    });
  }

  async function toggleHabit(userKey, habitIdx) {
    const entry = getDayEntry(state.activeDateStr);
    entry[userKey][habitIdx] = !entry[userKey][habitIdx];
    
    saveLocalHistory();
    renderUI();

    if (navigator.vibrate) {
      navigator.vibrate(25);
    }

    await syncRowToSupabase(state.activeDateStr);
  }

  async function syncRowToSupabase(dateStr) {
    if (!state.supabaseClient) return;
    const entry = getDayEntry(dateStr);

    const u1Payload = {
      ticks: entry.u1,
      chat: entry.chat || [],
      nudge: entry.nudge || null
    };

    const u2Payload = {
      ticks: entry.u2,
      chat: entry.chat || [],
      nudge: entry.nudge || null
    };

    try {
      await state.supabaseClient.from('habit_history').upsert({
        date: dateStr,
        u1_ticks: u1Payload,
        u2_ticks: u2Payload,
        updated_at: new Date().toISOString()
      });
    } catch (e) {
      console.error('Supabase Sync Error:', e);
    }
  }

  function updateUserProgress(ticksArr, statusEl, ringFillEl, pctEl, barFillEl) {
    const completedCount = ticksArr.filter(Boolean).length;
    const total = ticksArr.length;
    const pct = Math.round((completedCount / total) * 100);

    if (statusEl) statusEl.textContent = `${completedCount} of ${total} habits completed`;
    if (pctEl) pctEl.textContent = `${pct}%`;
    if (barFillEl) barFillEl.style.width = `${pct}%`;

    const circumference = 144.51;
    const offset = circumference - (pct / 100) * circumference;
    if (ringFillEl) ringFillEl.style.strokeDashoffset = offset;
  }

  function renderBanterBanner() {
    const entry = getDayEntry(state.activeDateStr);
    const u1Count = entry.u1.filter(Boolean).length;
    const u2Count = entry.u2.filter(Boolean).length;

    const u1Name = state.settings.u1Name || 'Adarsh';
    const u2Name = state.settings.u2Name || 'Sanjana';

    let icon = '⚡';
    if (u1Count === 5 && u2Count === 5) {
      icon = '🌟';
    } else if (u1Count === 5 || u2Count === 5) {
      icon = '💪';
    }

    if (dom.banterIcon) dom.banterIcon.textContent = icon;
    if (dom.banterMessage) {
      dom.banterMessage.innerHTML = `
        <div class="progress-line">${escapeHtml(u1Name)} - ${u1Count}/5</div>
        <div class="progress-line">${escapeHtml(u2Name)} - ${u2Count}/5</div>
      `;
    }
  }

  // RENDER REALTIME BANTER CHAT MESSAGES
  function renderBanterChat() {
    const entry = getDayEntry(state.activeDateStr);
    const chatList = entry.chat || [];

    const dObj = parseYYYYMMDD(state.activeDateStr);
    if (dom.chatDatePill) dom.chatDatePill.textContent = dObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    if (!dom.chatContainer) return;
    dom.chatContainer.innerHTML = '';

    if (chatList.length === 0) {
      if (dom.chatEmptyState) dom.chatContainer.appendChild(dom.chatEmptyState);
      return;
    }

    const u1Name = state.settings.u1Name || 'Adarsh';
    const u2Name = state.settings.u2Name || 'Sanjana';
    const myDeviceUser = state.settings.myUser || 'u1';

    chatList.forEach(msg => {
      const isMsgFromU1 = (msg.sender === 'u1' || msg.sender === u1Name);
      const msgSenderKey = isMsgFromU1 ? 'u1' : 'u2';
      const senderDisplayName = isMsgFromU1 ? u1Name : u2Name;
      const avatarSrc = isMsgFromU1 ? 'adarsh.jpg' : 'sanjana.jpg';

      // Check if message was sent by the current device user or partner
      const isMyOwnMessage = (msgSenderKey === myDeviceUser);

      const wrapEl = document.createElement('div');
      wrapEl.className = `chat-bubble-wrap ${isMyOwnMessage ? 'u-sent-msg' : 'u-received-msg'}`;

      wrapEl.innerHTML = `
        <div class="chat-meta">
          <img src="${avatarSrc}" class="chat-avatar-mini" alt="${escapeHtml(senderDisplayName)}">
          <span class="chat-sender-name">${escapeHtml(senderDisplayName)}</span>
          <span class="chat-time">• ${escapeHtml(msg.time || '')}</span>
        </div>
        <div class="chat-bubble ${msgSenderKey}-accent">
          <span class="chat-text">${escapeHtml(msg.text)}</span>
        </div>
      `;

      dom.chatContainer.appendChild(wrapEl);
    });

    dom.chatContainer.scrollTop = dom.chatContainer.scrollHeight;
  }

  async function postBanterMessage(text) {
    if (!text.trim()) return;

    const entry = getDayEntry(state.activeDateStr);
    if (!entry.chat) entry.chat = [];

    const senderKey = state.settings.myUser || 'u1';
    const nowStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    entry.chat.push({
      id: Date.now(),
      sender: senderKey,
      text: text.trim(),
      time: nowStr
    });

    saveLocalHistory();
    renderBanterChat();

    if (dom.chatInput) dom.chatInput.value = '';

    await syncRowToSupabase(state.activeDateStr);
  }

  function checkPendingPopupEncouragement() {
    const todayStr = formatDateToYYYYMMDD(new Date());
    const entry = getDayEntry(todayStr);

    if (!entry.nudge) return;

    const nudge = entry.nudge;
    if (!nudge.id) return;

    if (nudge.sender === state.settings.myUser) return;
    if (state.readNudges.includes(nudge.id)) return;

    const u1Name = state.settings.u1Name || 'Adarsh';
    const u2Name = state.settings.u2Name || 'Sanjana';

    const isFromU1 = nudge.sender === 'u1' || nudge.sender === u1Name;
    const senderName = isFromU1 ? u1Name : u2Name;
    const senderDp = isFromU1 ? 'adarsh.jpg' : 'sanjana.jpg';

    if (dom.encSenderDp) dom.encSenderDp.src = senderDp;
    if (dom.encTitle) dom.encTitle.textContent = `${senderName} sent you a boost!`;
    if (dom.encMessage) dom.encMessage.textContent = `"${nudge.text}"`;

    if (dom.encouragementPopup) dom.encouragementPopup.classList.remove('hidden');

    if (dom.encDismissBtn) {
      dom.encDismissBtn.onclick = async () => {
        state.readNudges.push(nudge.id);
        saveReadNudges();

        // Mark nudge object with acknowledged flag & sync to Supabase!
        if (entry.nudge) {
          entry.nudge.acknowledged = true;
          entry.nudge.ackSender = state.settings.myUser;
          entry.nudge.ackTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        }

        saveLocalHistory();
        await syncRowToSupabase(todayStr);

        if (dom.encouragementPopup) dom.encouragementPopup.classList.add('hidden');
        showToast(`❤️ Boost acknowledged!`);
      };
    }
  }

  async function sendEncouragementBoost(messageText) {
    const todayStr = formatDateToYYYYMMDD(new Date());
    const entry = getDayEntry(todayStr);

    const senderKey = state.settings.myUser || 'u1';
    const u1Name = state.settings.u1Name || 'Adarsh';
    const u2Name = state.settings.u2Name || 'Sanjana';
    const senderName = senderKey === 'u1' ? u1Name : u2Name;

    const nudgeObj = {
      id: 'nudge_' + Date.now(),
      sender: senderKey,
      senderName: senderName,
      text: messageText,
      timestamp: Date.now(),
      acknowledged: false,
      ackSender: null,
      ackTime: null
    };

    entry.nudge = nudgeObj;

    saveLocalHistory();
    await syncRowToSupabase(todayStr);

    showToast(`❤️ Boost sent to ${senderKey === 'u1' ? u2Name : u1Name}!`);
  }

  function renderIndividualMatrices() {
    const u1Name = state.settings.u1Name || 'Adarsh';
    const u2Name = state.settings.u2Name || 'Sanjana';

    if (dom.u1MatrixName) dom.u1MatrixName.textContent = `${u1Name}'s 75 Days`;
    if (dom.u2MatrixName) dom.u2MatrixName.textContent = `${u2Name}'s 75 Days`;

    let u1CompleteCount = 0;
    let u2CompleteCount = 0;

    const todayStr = formatDateToYYYYMMDD(new Date());

    if (dom.u1MatrixGrid) dom.u1MatrixGrid.innerHTML = '';
    if (dom.u2MatrixGrid) dom.u2MatrixGrid.innerHTML = '';

    for (let day = 1; day <= 75; day++) {
      const dateStr = getDateForDayNumber(day);
      const entry = state.history[dateStr];
      const isSelected = (dateStr === state.activeDateStr);
      const isPastOrToday = (dateStr <= todayStr);

      const u1Done = entry && entry.u1 && entry.u1.every(Boolean);
      const u2Done = entry && entry.u2 && entry.u2.every(Boolean);

      if (u1Done) u1CompleteCount++;
      if (u2Done) u2CompleteCount++;

      const u1Cell = createMatrixCell(day, dateStr, u1Done, isPastOrToday, isSelected);
      if (dom.u1MatrixGrid) dom.u1MatrixGrid.appendChild(u1Cell);

      const u2Cell = createMatrixCell(day, dateStr, u2Done, isPastOrToday, isSelected);
      if (dom.u2MatrixGrid) dom.u2MatrixGrid.appendChild(u2Cell);
    }

    if (dom.u1CompletedCount) dom.u1CompletedCount.textContent = `${u1CompleteCount} / 75 Days Green`;
    if (dom.u2CompletedCount) dom.u2CompletedCount.textContent = `${u2CompleteCount} / 75 Days Green`;
  }

  function createMatrixCell(dayNum, dateStr, isDone, isPastOrToday, isSelected) {
    const cell = document.createElement('div');
    
    let statusClass = 'cell-future';
    if (isDone) {
      statusClass = 'cell-green';
    } else if (isPastOrToday) {
      statusClass = 'cell-red';
    }

    cell.className = `matrix-cell ${statusClass} ${isSelected ? 'active-day' : ''}`;
    cell.textContent = dayNum;
    cell.setAttribute('title', `Day ${dayNum} (${dateStr}): ${isDone ? 'Completed' : 'Incomplete'}`);

    cell.addEventListener('click', () => {
      state.activeDateStr = dateStr;
      renderUI();
    });

    return cell;
  }

  function setupEventListeners() {
    // Logged-in User Profile Picture Avatar Button in Header (Opens Identity Switcher Modal)
    if (dom.headerUserDpBtn) {
      dom.headerUserDpBtn.addEventListener('click', () => {
        if (dom.firstTimeIdentityModal) dom.firstTimeIdentityModal.classList.remove('hidden');
      });
    }

    if (dom.closeIdentityModalBtn) {
      dom.closeIdentityModalBtn.addEventListener('click', () => {
        if (dom.firstTimeIdentityModal) dom.firstTimeIdentityModal.classList.add('hidden');
      });
    }

    // Push Notification Bell Button Handlers
    if (dom.notifBellBtn) {
      dom.notifBellBtn.addEventListener('click', requestNotificationPermission);
    }
    if (dom.settingsEnableNotifBtn) {
      dom.settingsEnableNotifBtn.addEventListener('click', requestNotificationPermission);
    }

    // First-Time / Switch Identity Modal Choice Cards
    if (dom.selectU1Card) {
      dom.selectU1Card.addEventListener('click', () => {
        applyIdentity('u1');
        saveLocalSettings();
        if (dom.firstTimeIdentityModal) dom.firstTimeIdentityModal.classList.add('hidden');
        showToast('👤 Device Identity set to Adarsh!');
        requestNotificationPermission();
      });
    }

    if (dom.selectU2Card) {
      dom.selectU2Card.addEventListener('click', () => {
        applyIdentity('u2');
        saveLocalSettings();
        if (dom.firstTimeIdentityModal) dom.firstTimeIdentityModal.classList.add('hidden');
        showToast('👤 Device Identity set to Sanjana!');
        requestNotificationPermission();
      });
    }

    // Refresh Data Button
    if (dom.refreshBtn) {
      dom.refreshBtn.addEventListener('click', async () => {
        const iconEl = dom.refreshBtn.querySelector('i');
        if (iconEl) iconEl.classList.add('fa-spin');
        
        const success = await attemptSupabaseReconnect();
        renderUI();

        setTimeout(() => {
          if (iconEl) iconEl.classList.remove('fa-spin');
          showToast(success ? '⚡ Connected to Supabase Live Sync!' : '⚠️ Retry Connection...');
        }, 500);
      });
    }

    // Dedicated Sync Status Re-Connection Test Handler (Clears stale local overrides & re-establishes clean Supabase connection)
    if (dom.syncStatus) {
      dom.syncStatus.addEventListener('click', async (e) => {
        if (e) {
          e.stopPropagation();
          e.preventDefault();
        }

        showToast('⚡ Reconnecting to Supabase...');

        // Clear any stale local overrides
        localStorage.removeItem('75hard_supabase_url');
        localStorage.removeItem('75hard_supabase_key');

        const success = await attemptSupabaseReconnect();
        if (success) {
          renderUI();
          showToast('⚡ Connected to Supabase Live Sync!');
          if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
        } else {
          showToast('⚠️ Connection failed. Retrying...');
          if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
        }
      });
    }

    if (dom.prevDayBtn) {
      dom.prevDayBtn.addEventListener('click', () => {
        const current = parseYYYYMMDD(state.activeDateStr);
        current.setDate(current.getDate() - 1);
        state.activeDateStr = formatDateToYYYYMMDD(current);
        renderUI();
      });
    }

    if (dom.nextDayBtn) {
      dom.nextDayBtn.addEventListener('click', () => {
        const current = parseYYYYMMDD(state.activeDateStr);
        current.setDate(current.getDate() + 1);
        state.activeDateStr = formatDateToYYYYMMDD(current);
        renderUI();
      });
    }

    if (dom.dateInput) {
      dom.dateInput.addEventListener('change', (e) => {
        if (e.target.value) {
          state.activeDateStr = e.target.value;
          renderUI();
        }
      });
    }

    // Toggle partner habits view in settings
    if (dom.togglePartnerHabitsBtn) {
      dom.togglePartnerHabitsBtn.addEventListener('click', () => {
        state.showPartnerHabitsInSettings = !state.showPartnerHabitsInSettings;
        dom.togglePartnerHabitsBtn.innerHTML = state.showPartnerHabitsInSettings 
          ? '<i class="fa-solid fa-eye-slash"></i> Hide Partner Habits'
          : '<i class="fa-solid fa-eye"></i> View Partner Habits';
        applyIdentity(state.settings.myUser || 'u1');
      });
    }

    // Device Owner Identity Switchers in Settings
    if (dom.idU1Opt) {
      dom.idU1Opt.addEventListener('click', () => {
        applyIdentity('u1');
        saveLocalSettings();
      });
    }

    if (dom.idU2Opt) {
      dom.idU2Opt.addEventListener('click', () => {
        applyIdentity('u2');
        saveLocalSettings();
      });
    }

    // Theme Switchers
    if (dom.themeDarkOpt) {
      dom.themeDarkOpt.addEventListener('click', () => {
        applyTheme('dark');
        saveLocalSettings();
      });
    }

    if (dom.themeLightOpt) {
      dom.themeLightOpt.addEventListener('click', () => {
        applyTheme('light');
        saveLocalSettings();
      });
    }

    // FLOATING ACTION BUTTON (FAB) CHAT HANDLER
    if (dom.floatingChatBtn) {
      dom.floatingChatBtn.addEventListener('click', () => {
        state.isChatOpen = true;
        state.unreadChatCount = 0;
        updateUnreadChatBadge();
        if (dom.chatModal) dom.chatModal.classList.remove('hidden');
        renderBanterChat();
      });
    }

    if (dom.closeChatModalBtn) {
      dom.closeChatModalBtn.addEventListener('click', () => {
        state.isChatOpen = false;
        if (dom.chatModal) dom.chatModal.classList.add('hidden');
      });
    }

    // Encouragement Nudge button opens Send Nudge Modal
    if (dom.nudgeBtn) {
      dom.nudgeBtn.addEventListener('click', () => {
        if (dom.sendNudgeModal) dom.sendNudgeModal.classList.remove('hidden');
      });
    }

    if (dom.closeNudgeModalBtn) {
      dom.closeNudgeModalBtn.addEventListener('click', () => {
        if (dom.sendNudgeModal) dom.sendNudgeModal.classList.add('hidden');
      });
    }

    document.querySelectorAll('.preset-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const text = btn.getAttribute('data-text');
        if (dom.customNudgeText) dom.customNudgeText.value = text;
      });
    });

    if (dom.submitNudgeBtn) {
      dom.submitNudgeBtn.addEventListener('click', async () => {
        const text = dom.customNudgeText ? (dom.customNudgeText.value.trim() || 'Wake up! Finish today\'s 5 habits! ⏰') : 'Wake up!';
        await sendEncouragementBoost(text);
        if (dom.sendNudgeModal) dom.sendNudgeModal.classList.add('hidden');
        if (dom.customNudgeText) dom.customNudgeText.value = '';
      });
    }

    // Banter Chat form submit
    if (dom.chatForm) {
      dom.chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (dom.chatInput) postBanterMessage(dom.chatInput.value);
      });
    }

    document.querySelectorAll('.emoji-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const text = chip.getAttribute('data-msg');
        postBanterMessage(text);
      });
    });

    // OPEN SETTINGS MODAL EVENT LISTENERS (Gear Button ONLY)
    if (dom.openSettingsBtn) {
      dom.openSettingsBtn.addEventListener('click', openSettingsModal);
    }
    if (dom.closeModalBtn) {
      dom.closeModalBtn.addEventListener('click', closeSettingsModal);
    }
    if (dom.settingsModal) {
      dom.settingsModal.addEventListener('click', (e) => {
        if (e.target === dom.settingsModal) closeSettingsModal();
      });
    }

    if (dom.saveSettingsBtn) {
      dom.saveSettingsBtn.addEventListener('click', saveSettingsFromModal);
    }
    if (dom.resetDefaultsBtn) {
      dom.resetDefaultsBtn.addEventListener('click', resetDefaultSettings);
    }
    if (dom.resetSupabaseBtn) {
      dom.resetSupabaseBtn.addEventListener('click', openSecurityModal);
    }

    // Security Reset Verification Handlers
    if (dom.closeSecurityModalBtn) {
      dom.closeSecurityModalBtn.addEventListener('click', closeSecurityModal);
    }
    if (dom.cancelSecurityBtn) {
      dom.cancelSecurityBtn.addEventListener('click', closeSecurityModal);
    }
    if (dom.confirmSecurityResetBtn) {
      dom.confirmSecurityResetBtn.addEventListener('click', confirmSecurityReset);
    }
  }

  function openSecurityModal() {
    if (dom.settingsModal) dom.settingsModal.classList.add('hidden');
    if (dom.securityPhoneInput) dom.securityPhoneInput.value = '';
    if (dom.securityErrorMsg) dom.securityErrorMsg.classList.add('hidden');
    if (dom.securityModal) dom.securityModal.classList.remove('hidden');

    setTimeout(() => {
      if (dom.securityPhoneInput) dom.securityPhoneInput.focus();
    }, 100);
  }

  function closeSecurityModal() {
    if (dom.securityModal) dom.securityModal.classList.add('hidden');
    if (dom.settingsModal) dom.settingsModal.classList.remove('hidden');
  }

  async function confirmSecurityReset() {
    const rawVal = dom.securityPhoneInput ? dom.securityPhoneInput.value : '';
    const cleanDigits = rawVal.replace(/\D/g, '');
    const last10Digits = cleanDigits.slice(-10);

    if (last10Digits === MASTER_SECURITY_PHONE) {
      try {
        state.history = {};
        saveLocalHistory();
        if (state.supabaseClient) {
          await state.supabaseClient.from('habit_history').delete().neq('date', '1970-01-01');
        }
        renderUI();
        if (dom.securityModal) dom.securityModal.classList.add('hidden');
        if (dom.settingsModal) dom.settingsModal.classList.add('hidden');
        showToast("🗑️ Master phone verified! Supabase table reset!");
      } catch (err) {
        console.error('Reset Supabase Error:', err);
        showToast("Error resetting Supabase table");
      }
    } else {
      if (dom.securityErrorMsg) dom.securityErrorMsg.classList.remove('hidden');
      if (navigator.vibrate) navigator.vibrate([150, 80, 150]);
    }
  }

  function showToast(message) {
    if (!dom.toastMsg || !dom.toast) return;
    dom.toastMsg.textContent = message;
    dom.toast.classList.remove('hidden');

    setTimeout(() => {
      if (dom.toast) dom.toast.classList.add('hidden');
    }, 3500);
  }

  function openSettingsModal() {
    try {
      if (dom.u1NameInput) dom.u1NameInput.value = state.settings.u1Name || 'Adarsh';
      if (dom.u2NameInput) dom.u2NameInput.value = state.settings.u2Name || 'Sanjana';

      const u1Habits = state.settings.u1Habits || DEFAULT_U1_HABITS;
      (dom.u1HabitInputs || []).forEach((inputEl, idx) => {
        if (inputEl) inputEl.value = u1Habits[idx] || '';
      });

      const u2Habits = state.settings.u2Habits || DEFAULT_U2_HABITS;
      (dom.u2HabitInputs || []).forEach((inputEl, idx) => {
        if (inputEl) inputEl.value = u2Habits[idx] || '';
      });

      if (dom.startDateInput) dom.startDateInput.value = state.settings.startDate || formatDateToYYYYMMDD(new Date());

      applyTheme(state.settings.theme || 'dark');
      applyIdentity(state.settings.myUser || 'u1');

      if (dom.settingsModal) dom.settingsModal.classList.remove('hidden');
    } catch (err) {
      console.error('Error opening settings modal:', err);
      if (dom.settingsModal) dom.settingsModal.classList.remove('hidden');
    }
  }

  function closeSettingsModal() {
    if (dom.settingsModal) dom.settingsModal.classList.add('hidden');
  }

  async function saveSettingsFromModal() {
    try {
      if (dom.u1NameInput) state.settings.u1Name = dom.u1NameInput.value.trim() || 'Adarsh';
      if (dom.u2NameInput) state.settings.u2Name = dom.u2NameInput.value.trim() || 'Sanjana';

      if (dom.u1HabitInputs) {
        state.settings.u1Habits = dom.u1HabitInputs.map((inputEl, i) => {
          return (inputEl && inputEl.value.trim()) ? inputEl.value.trim() : DEFAULT_U1_HABITS[i];
        });
      }

      if (dom.u2HabitInputs) {
        state.settings.u2Habits = dom.u2HabitInputs.map((inputEl, i) => {
          return (inputEl && inputEl.value.trim()) ? inputEl.value.trim() : DEFAULT_U2_HABITS[i];
        });
      }

      if (dom.startDateInput && dom.startDateInput.value) {
        state.settings.startDate = dom.startDateInput.value;
      }

      const activeThemeBtn = document.querySelector('.theme-opt-btn.active');
      if (activeThemeBtn) {
        const selectedTheme = activeThemeBtn.getAttribute('data-theme-val');
        applyTheme(selectedTheme);
      }

      const activeIdBtn = document.querySelector('.identity-opt-btn.active');
      if (activeIdBtn) {
        const selectedUser = activeIdBtn.getAttribute('data-id-val');
        applyIdentity(selectedUser);
      }

      saveLocalSettings();
      await syncAppSettingsToSupabase();

      closeSettingsModal();
      renderUI();
      showToast('⚙️ Settings saved & synced to partner!');
    } catch (err) {
      console.error('Error saving settings:', err);
      closeSettingsModal();
    }
  }

  function resetDefaultSettings() {
    if (confirm('Reset default names and habit lists?')) {
      state.settings.u1Name = 'Adarsh';
      state.settings.u2Name = 'Sanjana';
      state.settings.u1Habits = [...DEFAULT_U1_HABITS];
      state.settings.u2Habits = [...DEFAULT_U2_HABITS];
      state.settings.theme = 'dark';
      state.settings.myUser = 'u1';
      applyTheme('dark');
      applyIdentity('u1');
      saveLocalSettings();
      syncAppSettingsToSupabase();
      openSettingsModal();
      renderUI();
    }
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  document.addEventListener('DOMContentLoaded', init);

})();
