/* ==========================================
   75 HARD DUO - ADARSH & SANJANA LOGIC ENGINE
   NETLIFY ENV RUNTIME CONFIG INITIALIZATION
   ========================================== */

(function () {
  'use strict';

  const MASTER_SECURITY_PHONE = '9479918338';

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

  // READ CREDENTIALS FROM NETLIFY INJECTED RUNTIME (WINDOW.SUPABASE_URL / WINDOW.SUPABASE_KEY) OR LOCALSTORAGE
  const GET_SUPABASE_URL = () => window.SUPABASE_URL || localStorage.getItem('75hard_supabase_url') || '';
  const GET_SUPABASE_KEY = () => window.SUPABASE_KEY || localStorage.getItem('75hard_supabase_key') || '';

  const STORAGE_KEY_SETTINGS = '75hard_duo_settings';
  const STORAGE_KEY_DATA = '75hard_duo_history_data';
  const STORAGE_KEY_READ_NUDGES = '75hard_duo_read_nudges';

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
    showPartnerHabitsInSettings: false
  };

  // DOM Elements
  const dom = {
    syncStatus: document.getElementById('sync-status'),
    openSettingsBtn: document.getElementById('open-settings-btn'),
    settingsModal: document.getElementById('settings-modal'),
    closeModalBtn: document.getElementById('close-modal-btn'),
    saveSettingsBtn: document.getElementById('save-settings-btn'),
    resetDefaultsBtn: document.getElementById('reset-defaults-btn'),
    resetSupabaseBtn: document.getElementById('reset-supabase-btn'),

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

    // Device User Identity DOM
    idU1Opt: document.getElementById('id-u1-opt'),
    idU2Opt: document.getElementById('id-u2-opt'),

    // Theme Switcher DOM
    themeToggleBtn: document.getElementById('theme-toggle-btn'),
    themeBtnIcon: document.getElementById('theme-btn-icon'),
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
    banterTitle: document.getElementById('banter-title'),
    banterMessage: document.getElementById('banter-message'),
    nudgeBtn: document.getElementById('nudge-btn'),
    toast: document.getElementById('toast'),
    toastMsg: document.getElementById('toast-msg'),

    // Floating Action Button & Chat Modal
    floatingChatBtn: document.getElementById('floating-chat-btn'),
    chatUnreadBadge: document.getElementById('chat-unread-badge'),
    chatModal: document.getElementById('chat-modal'),
    closeChatModalBtn: document.getElementById('close-chat-modal-btn'),
    chatUserIndicator: document.getElementById('chat-user-indicator'),
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
    applyIdentity(state.settings.myUser || 'u1');

    setupEventListeners();
    await initSupabase();

    renderUI();
    checkPendingPopupEncouragement();
  }

  function loadLocalSettings() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (saved) {
        const parsed = JSON.parse(saved);
        state.settings = Object.assign({}, state.settings, parsed);
        if (!state.settings.u1Habits) state.settings.u1Habits = [...DEFAULT_U1_HABITS];
        if (!state.settings.u2Habits) state.settings.u2Habits = [...DEFAULT_U2_HABITS];
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
    } catch (e) {
      console.warn('Could not save settings', e);
    }
  }

  function applyTheme(themeName) {
    state.settings.theme = themeName;
    document.body.setAttribute('data-theme', themeName);

    if (themeName === 'light') {
      dom.themeBtnIcon.className = 'fa-solid fa-sun';
      dom.themeToggleBtn.setAttribute('title', 'Switch to Dark Mode');
      if (dom.themeLightOpt) dom.themeLightOpt.classList.add('active');
      if (dom.themeDarkOpt) dom.themeDarkOpt.classList.remove('active');
    } else {
      dom.themeBtnIcon.className = 'fa-solid fa-moon';
      dom.themeToggleBtn.setAttribute('title', 'Switch to Light Mode');
      if (dom.themeDarkOpt) dom.themeDarkOpt.classList.add('active');
      if (dom.themeLightOpt) dom.themeLightOpt.classList.remove('active');
    }
  }

  function applyIdentity(userKey) {
    state.settings.myUser = userKey;
    const u1Name = state.settings.u1Name || 'Adarsh';
    const u2Name = state.settings.u2Name || 'Sanjana';
    const activeName = (userKey === 'u1') ? u1Name : u2Name;

    if (dom.chatUserIndicator) {
      dom.chatUserIndicator.textContent = activeName;
    }

    if (userKey === 'u1') {
      if (dom.idU1Opt) dom.idU1Opt.classList.add('active');
      if (dom.idU2Opt) dom.idU2Opt.classList.remove('active');
    } else {
      if (dom.idU2Opt) dom.idU2Opt.classList.add('active');
      if (dom.idU1Opt) dom.idU1Opt.classList.remove('active');
    }

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

  // SUPABASE REALTIME INITIALIZATION & SYNC FROM ENVIRONMENT VARIABLES
  async function initSupabase() {
    const targetUrl = GET_SUPABASE_URL();
    const targetKey = GET_SUPABASE_KEY();

    if (window.supabase && targetUrl && targetKey) {
      try {
        state.supabaseClient = window.supabase.createClient(targetUrl, targetKey);
        state.isOnline = true;
        updateSyncStatusBadge(true);

        // Initial fetch
        const { data, error } = await state.supabaseClient.from('habit_history').select('*');
        if (data && Array.isArray(data)) {
          data.forEach(row => {
            if (row.date) {
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
          renderUI();
          checkPendingPopupEncouragement();
        }

        // Subscribe to live Postgres changes across devices
        state.supabaseClient
          .channel('realtime:habit_history')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'habit_history' }, (payload) => {
            if (payload.new && payload.new.date) {
              const prevChatCount = (state.history[payload.new.date]?.chat || []).length;
              
              const u1Payload = unpackPayload(payload.new.u1_ticks);
              const u2Payload = unpackPayload(payload.new.u2_ticks);

              const newChatList = u1Payload.chat || u2Payload.chat || [];

              state.history[payload.new.date] = {
                u1: u1Payload.ticks,
                u2: u2Payload.ticks,
                chat: newChatList,
                nudge: u1Payload.nudge || u2Payload.nudge || null
              };
              
              saveLocalHistory();
              renderUI();
              checkPendingPopupEncouragement();

              if (newChatList.length > prevChatCount && !state.isChatOpen) {
                const latestMsg = newChatList[newChatList.length - 1];
                if (latestMsg && latestMsg.sender !== state.settings.myUser) {
                  state.unreadChatCount += (newChatList.length - prevChatCount);
                  updateUnreadChatBadge();
                  showToast(`💬 New banter from partner!`);
                  if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
                }
              }
            }
          })
          .subscribe();

      } catch (err) {
        console.error('Supabase Init Error:', err);
        updateSyncStatusBadge(false);
      }
    } else {
      updateSyncStatusBadge(false);
    }
  }

  function updateUnreadChatBadge() {
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
    if (online) {
      dom.syncStatus.className = 'sync-badge supabase';
      dom.syncStatus.innerHTML = '<i class="fa-solid fa-bolt"></i> <span>Supabase Live</span>';
    } else {
      dom.syncStatus.className = 'sync-badge local';
      dom.syncStatus.innerHTML = '<i class="fa-solid fa-hard-drive"></i> <span>Local Mode</span>';
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
    dom.currentDayLabel.textContent = dayNum > 0 ? `DAY ${dayNum}` : `PRE-START`;
    dom.dateInput.value = state.activeDateStr;

    const dObj = parseYYYYMMDD(state.activeDateStr);
    const todayStr = formatDateToYYYYMMDD(new Date());
    let formattedStr = dObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' });
    if (state.activeDateStr === todayStr) {
      formattedStr = `Today, ${dObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    }
    dom.dateDisplayStr.textContent = formattedStr;

    const u1Name = state.settings.u1Name || 'Adarsh';
    const u2Name = state.settings.u2Name || 'Sanjana';

    dom.u1NameDisplay.textContent = u1Name;
    dom.u2NameDisplay.textContent = u2Name;

    if (!dom.u1Avatar.querySelector('img')) {
      dom.u1Avatar.textContent = u1Name.substring(0, 1).toUpperCase();
    }
    if (!dom.u2Avatar.querySelector('img')) {
      dom.u2Avatar.textContent = u2Name.substring(0, 1).toUpperCase();
    }

    dom.u1Streak.textContent = calculateStreak('u1');
    dom.u2Streak.textContent = calculateStreak('u2');
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

    statusEl.textContent = `${completedCount} of ${total} habits completed`;
    pctEl.textContent = `${pct}%`;
    barFillEl.style.width = `${pct}%`;

    const circumference = 144.51;
    const offset = circumference - (pct / 100) * circumference;
    ringFillEl.style.strokeDashoffset = offset;
  }

  function renderBanterBanner() {
    const entry = getDayEntry(state.activeDateStr);
    const u1Count = entry.u1.filter(Boolean).length;
    const u2Count = entry.u2.filter(Boolean).length;

    const u1Name = state.settings.u1Name || 'Adarsh';
    const u2Name = state.settings.u2Name || 'Sanjana';

    let icon = '🤝';
    let title = 'Partners in 75 Hard';
    let msg = '';

    if (u1Count === 5 && u2Count === 5) {
      icon = '🌟';
      title = 'Perfect Day Together!';
      msg = `Awesome teamwork! Both ${u1Name} and ${u2Name} completed all 5 daily habits! Keep building momentum!`;
    } else if (u1Count === 5) {
      icon = '💪';
      title = `${u1Name} Completed Day!`;
      msg = `${u1Name} is done! Support ${u2Name} to complete her ${5 - u2Count} remaining habits today!`;
    } else if (u2Count === 5) {
      icon = '💪';
      title = `${u2Name} Completed Day!`;
      msg = `${u2Name} is 100% done! Cheer on ${u1Name} to finish his ${5 - u1Count} remaining habits!`;
    } else if (u1Count > 0 || u2Count > 0) {
      icon = '⚡';
      title = 'Making Progress Together';
      msg = `${u1Name} has ${u1Count}/5 habits done • ${u2Name} has ${u2Count}/5 habits done. Let's finish the day 5/5!`;
    } else {
      icon = '🌱';
      title = 'New Day Focus';
      msg = `Day ${calculateDayNumber(state.activeDateStr)} is here! Tap habits as you complete them throughout the day.`;
    }

    dom.banterIcon.textContent = icon;
    dom.banterTitle.textContent = title;
    dom.banterMessage.textContent = msg;
  }

  function renderBanterChat() {
    const entry = getDayEntry(state.activeDateStr);
    const chatList = entry.chat || [];

    const dObj = parseYYYYMMDD(state.activeDateStr);
    dom.chatDatePill.textContent = dObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    dom.chatContainer.innerHTML = '';

    if (chatList.length === 0) {
      dom.chatContainer.appendChild(dom.chatEmptyState);
      return;
    }

    const u1Name = state.settings.u1Name || 'Adarsh';
    const u2Name = state.settings.u2Name || 'Sanjana';

    chatList.forEach(msg => {
      const isU1 = msg.sender === 'u1' || msg.sender === u1Name;
      const senderDisplayName = isU1 ? u1Name : u2Name;

      const wrapEl = document.createElement('div');
      wrapEl.className = `chat-bubble-wrap ${isU1 ? 'u1-msg' : 'u2-msg'}`;

      wrapEl.innerHTML = `
        <div class="chat-meta">
          <span>${escapeHtml(senderDisplayName)}</span>
          <span class="chat-time">• ${escapeHtml(msg.time || '')}</span>
        </div>
        <div class="chat-bubble">
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

    dom.chatInput.value = '';

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

    dom.encSenderDp.src = senderDp;
    dom.encTitle.textContent = `${senderName} sent you a boost!`;
    dom.encMessage.textContent = `"${nudge.text}"`;

    dom.encouragementPopup.classList.remove('hidden');

    dom.encDismissBtn.onclick = () => {
      state.readNudges.push(nudge.id);
      saveReadNudges();
      dom.encouragementPopup.classList.add('hidden');
      showToast(`❤️ Boost acknowledged!`);
    };
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
      timestamp: Date.now()
    };

    entry.nudge = nudgeObj;

    saveLocalHistory();
    await syncRowToSupabase(todayStr);

    showToast(`❤️ Boost sent to ${senderKey === 'u1' ? u2Name : u1Name}!`);
  }

  function renderIndividualMatrices() {
    const u1Name = state.settings.u1Name || 'Adarsh';
    const u2Name = state.settings.u2Name || 'Sanjana';

    dom.u1MatrixName.textContent = `${u1Name}'s 75 Days`;
    dom.u2MatrixName.textContent = `${u2Name}'s 75 Days`;

    let u1CompleteCount = 0;
    let u2CompleteCount = 0;

    const todayStr = formatDateToYYYYMMDD(new Date());

    dom.u1MatrixGrid.innerHTML = '';
    dom.u2MatrixGrid.innerHTML = '';

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
      dom.u1MatrixGrid.appendChild(u1Cell);

      const u2Cell = createMatrixCell(day, dateStr, u2Done, isPastOrToday, isSelected);
      dom.u2MatrixGrid.appendChild(u2Cell);
    }

    dom.u1CompletedCount.textContent = `${u1CompleteCount} / 75 Days Green`;
    dom.u2CompletedCount.textContent = `${u2CompleteCount} / 75 Days Green`;
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
    dom.prevDayBtn.addEventListener('click', () => {
      const current = parseYYYYMMDD(state.activeDateStr);
      current.setDate(current.getDate() - 1);
      state.activeDateStr = formatDateToYYYYMMDD(current);
      renderUI();
    });

    dom.nextDayBtn.addEventListener('click', () => {
      const current = parseYYYYMMDD(state.activeDateStr);
      current.setDate(current.getDate() + 1);
      state.activeDateStr = formatDateToYYYYMMDD(current);
      renderUI();
    });

    dom.dateInput.addEventListener('change', (e) => {
      if (e.target.value) {
        state.activeDateStr = e.target.value;
        renderUI();
      }
    });

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

    // Device Owner Identity Switchers
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
    dom.themeToggleBtn.addEventListener('click', () => {
      const nextTheme = state.settings.theme === 'dark' ? 'light' : 'dark';
      applyTheme(nextTheme);
      saveLocalSettings();
      showToast(`Switched to ${nextTheme === 'dark' ? 'Dark' : 'Light'} Mode`);
    });

    dom.themeDarkOpt.addEventListener('click', () => {
      applyTheme('dark');
      saveLocalSettings();
    });

    dom.themeLightOpt.addEventListener('click', () => {
      applyTheme('light');
      saveLocalSettings();
    });

    // FLOATING ACTION BUTTON (FAB) CHAT HANDLER
    dom.floatingChatBtn.addEventListener('click', () => {
      state.isChatOpen = true;
      state.unreadChatCount = 0;
      updateUnreadChatBadge();
      dom.chatModal.classList.remove('hidden');
      renderBanterChat();
    });

    dom.closeChatModalBtn.addEventListener('click', () => {
      state.isChatOpen = false;
      dom.chatModal.classList.add('hidden');
    });

    // Encouragement Nudge button opens Send Nudge Modal
    dom.nudgeBtn.addEventListener('click', () => {
      dom.sendNudgeModal.classList.remove('hidden');
    });

    dom.closeNudgeModalBtn.addEventListener('click', () => {
      dom.sendNudgeModal.classList.add('hidden');
    });

    document.querySelectorAll('.preset-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const text = btn.getAttribute('data-text');
        dom.customNudgeText.value = text;
      });
    });

    dom.submitNudgeBtn.addEventListener('click', async () => {
      const text = dom.customNudgeText.value.trim() || 'Wake up! Finish today\'s 5 habits! ⏰';
      await sendEncouragementBoost(text);
      dom.sendNudgeModal.classList.add('hidden');
      dom.customNudgeText.value = '';
    });

    // Banter Chat form submit
    dom.chatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      postBanterMessage(dom.chatInput.value);
    });

    document.querySelectorAll('.emoji-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const text = chip.getAttribute('data-msg');
        postBanterMessage(text);
      });
    });

    dom.openSettingsBtn.addEventListener('click', openSettingsModal);
    dom.syncStatus.addEventListener('click', openSettingsModal);
    dom.closeModalBtn.addEventListener('click', closeSettingsModal);
    dom.settingsModal.addEventListener('click', (e) => {
      if (e.target === dom.settingsModal) closeSettingsModal();
    });

    dom.saveSettingsBtn.addEventListener('click', saveSettingsFromModal);
    dom.resetDefaultsBtn.addEventListener('click', resetDefaultSettings);
    if (dom.resetSupabaseBtn) {
      dom.resetSupabaseBtn.addEventListener('click', openSecurityModal);
    }

    // Security Reset Verification Handlers (Clean modal switching)
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

    if (cleanDigits === MASTER_SECURITY_PHONE) {
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
    dom.toastMsg.textContent = message;
    dom.toast.classList.remove('hidden');

    setTimeout(() => {
      dom.toast.classList.add('hidden');
    }, 3500);
  }

  function openSettingsModal() {
    dom.u1NameInput.value = state.settings.u1Name || 'Adarsh';
    dom.u2NameInput.value = state.settings.u2Name || 'Sanjana';

    const u1Habits = state.settings.u1Habits || DEFAULT_U1_HABITS;
    dom.u1HabitInputs.forEach((inputEl, idx) => {
      inputEl.value = u1Habits[idx] || '';
    });

    const u2Habits = state.settings.u2Habits || DEFAULT_U2_HABITS;
    dom.u2HabitInputs.forEach((inputEl, idx) => {
      inputEl.value = u2Habits[idx] || '';
    });

    dom.startDateInput.value = state.settings.startDate || formatDateToYYYYMMDD(new Date());

    applyTheme(state.settings.theme || 'dark');
    applyIdentity(state.settings.myUser || 'u1');

    dom.settingsModal.classList.remove('hidden');
  }

  function closeSettingsModal() {
    dom.settingsModal.classList.add('hidden');
  }

  async function saveSettingsFromModal() {
    state.settings.u1Name = dom.u1NameInput.value.trim() || 'Adarsh';
    state.settings.u2Name = dom.u2NameInput.value.trim() || 'Sanjana';

    state.settings.u1Habits = dom.u1HabitInputs.map((inputEl, i) => {
      return inputEl.value.trim() || DEFAULT_U1_HABITS[i];
    });

    state.settings.u2Habits = dom.u2HabitInputs.map((inputEl, i) => {
      return inputEl.value.trim() || DEFAULT_U2_HABITS[i];
    });

    if (dom.startDateInput.value) {
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
    closeSettingsModal();

    await initSupabase();
    renderUI();
    showToast('Settings saved!');
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
