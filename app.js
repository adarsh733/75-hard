/* ==========================================
   75 HARD DUO - ADARSH & SANJANA LOGIC ENGINE
   SUPABASE LIVE SYNC INTEGRATION
   ========================================== */

(function () {
  'use strict';

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

  // Hardcoded Supabase credentials for seamless silent sync
  const DEFAULT_SUPABASE_URL = 'https://jamsrlijvqypdxucvhox.supabase.co';
  const DEFAULT_SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImphbXNybGlqdnF5cGR4dWN2aG94Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY1MDczOTksImV4cCI6MjEwMjA4MzM5OX0.iInG76ebAetpdWrOefmqSlvpTeBqxt0z_RW_OUx6Ah4';

  const STORAGE_KEY_SETTINGS = '75hard_duo_settings';
  const STORAGE_KEY_DATA = '75hard_duo_history_data';

  let state = {
    settings: {
      u1Name: 'Adarsh',
      u2Name: 'Sanjana',
      u1Habits: [...DEFAULT_U1_HABITS],
      u2Habits: [...DEFAULT_U2_HABITS],
      startDate: formatDateToYYYYMMDD(new Date())
    },
    history: {}, // Keyed by YYYY-MM-DD: { u1: [bool...], u2: [bool...] }
    activeDateStr: formatDateToYYYYMMDD(new Date()),
    supabaseClient: null,
    isOnline: false
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

    setupEventListeners();
    await initSupabase();

    renderUI();
  }

  function loadLocalSettings() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (saved) {
        const parsed = JSON.parse(saved);
        state.settings = Object.assign({}, state.settings, parsed);
        if (!state.settings.u1Habits) state.settings.u1Habits = [...DEFAULT_U1_HABITS];
        if (!state.settings.u2Habits) state.settings.u2Habits = [...DEFAULT_U2_HABITS];
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

  // SUPABASE REALTIME INITIALIZATION & SYNC
  async function initSupabase() {
    if (window.supabase) {
      try {
        state.supabaseClient = window.supabase.createClient(DEFAULT_SUPABASE_URL, DEFAULT_SUPABASE_KEY);
        state.isOnline = true;
        updateSyncStatusBadge(true);

        // Initial fetch from Supabase
        const { data, error } = await state.supabaseClient.from('habit_history').select('*');
        if (data && Array.isArray(data)) {
          data.forEach(row => {
            if (row.date) {
              state.history[row.date] = {
                u1: row.u1_ticks || [false, false, false, false, false],
                u2: row.u2_ticks || [false, false, false, false, false]
              };
            }
          });
          saveLocalHistory();
          renderUI();
        }

        // Subscribe to live Postgres changes across devices
        state.supabaseClient
          .channel('realtime:habit_history')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'habit_history' }, (payload) => {
            if (payload.new && payload.new.date) {
              state.history[payload.new.date] = {
                u1: payload.new.u1_ticks || [false, false, false, false, false],
                u2: payload.new.u2_ticks || [false, false, false, false, false]
              };
              saveLocalHistory();
              renderUI();
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
        u2: [false, false, false, false, false]
      };
    }
    return state.history[dateStr];
  }

  function renderUI() {
    renderHeaderAndNav();
    renderUserCards();
    renderBanterBanner();
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
        // Keep streak if today isn't over yet
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

    if (state.supabaseClient) {
      try {
        await state.supabaseClient.from('habit_history').upsert({
          date: state.activeDateStr,
          u1_ticks: entry.u1,
          u2_ticks: entry.u2,
          updated_at: new Date().toISOString()
        });
      } catch (e) {
        console.error('Supabase Upsert Error:', e);
      }
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

    dom.nudgeBtn.addEventListener('click', sendNudge);

    dom.openSettingsBtn.addEventListener('click', openSettingsModal);
    dom.syncStatus.addEventListener('click', openSettingsModal);
    dom.closeModalBtn.addEventListener('click', closeSettingsModal);
    dom.settingsModal.addEventListener('click', (e) => {
      if (e.target === dom.settingsModal) closeSettingsModal();
    });

    dom.saveSettingsBtn.addEventListener('click', saveSettingsFromModal);
    dom.resetDefaultsBtn.addEventListener('click', resetDefaultSettings);
    if (dom.resetSupabaseBtn) {
      dom.resetSupabaseBtn.addEventListener('click', resetSupabaseTableData);
    }
  }

  function sendNudge() {
    const sender = state.settings.u1Name || 'Partner';
    showToast(`❤️ Encouragement sent to your partner!`);

    if (navigator.vibrate) {
      navigator.vibrate([80, 40, 80]);
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
      saveLocalSettings();
      openSettingsModal();
      renderUI();
    }
  }

  // RESET ALL SUPABASE TABLE DATA FOR A CLEAN DAY 1 START
  async function resetSupabaseTableData() {
    if (confirm("Are you sure you want to RESET all 75 Hard table data in Supabase? This will clear all test entries so you and Sanjana can start Day 1 clean!")) {
      try {
        state.history = {};
        saveLocalHistory();
        if (state.supabaseClient) {
          await state.supabaseClient.from('habit_history').delete().neq('date', '1970-01-01');
        }
        renderUI();
        showToast("🗑️ Supabase table reset! Ready for Day 1!");
      } catch (err) {
        console.error('Reset Supabase Error:', err);
        showToast("Error resetting Supabase table");
      }
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
