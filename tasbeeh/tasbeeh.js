/* ============================================================
   Nur Prayer — Digital Tasbeeh Master Coordinator
   Path: tasbeeh/tasbeeh.js
   Consolidated Module coordinating submodules:
     - tasbeeh/tasbeeh-view-model.js
     - tasbeeh/tasbeeh-model.js
     - tasbeeh/tasbeeh-calendar.js
     - tasbeeh/tasbeeh-modal.js
     - tasbeeh/tasbeeh-current.js
     - tasbeeh/tasbeeh-period.js
     - tasbeeh/tasbeeh-old.js
     - tasbeeh/tasbeeh-history.js
     - tasbeeh/tasbeeh-home.js
   ============================================================ */

import {
    TasbeehPageTemplate,
    TasbeehHeaderTemplate,
    TasbeehCounterCardTemplate,
    TasbeehCounterCardViewModel,
    TasbeehProgressCircleTemplate,
    TasbeehGoalSetterTemplate,
    TasbeehNavTabTemplate,
    TasbeehPageViewModel,
    getTasbeehViewModel,
    registerTasbeehComponents,
    initTasbeeh,
    escHtml
} from './tasbeeh-view-model.js';

import {
    TASBEEH_CONSTANTS,
    ELEMENT_IDS,
    STORAGE_KEYS,
    STORAGE_KEY,
    DAY_KEY,
    BM_CUR_KEY,
    BM_OLD_KEY,
    CURRENT_PERIOD_KEY,
    CAL_COMPLETION_KEY,
    TABS,
    DEFAULT_PRESETS,
    normalizeItem,
    loadItems,
    persistItems,
    checkDailyReset,
    loadCalCompletions,
    persistCalCompletions,
    isDayCompleted,
    setDayCompleted,
    getDaysInMonth,
    getFirstDayOfMonth,
    makeDateStr,
    getCompletedDaysInMonth,
    loadCurrentPeriod,
    saveCurrentPeriod,
    getCurrentTrackingMonth,
    removeMonthTrackingData,
    isMonthFullyCompleted,
    getBookmark,
    setBookmark,
    getBookmarkedChants
} from './tasbeeh-model.js';

import {
    renderCalendar,
    handleCalendarDayClick,
    confirmDayStatusChange,
    animateCell,
    navigateMonth,
    advanceCurrentMonth,
    advanceOldMonth,
    confirmAction
} from './tasbeeh-calendar.js';

import {
    openModal,
    saveModal,
    deleteItem,
    syncChips
} from './tasbeeh-modal.js';

import {
    TasbeehCurrentApp,
    state as tasbeehCurrentState,
    getActiveItem,
    getItems,
    setItems,
    renderCurrentCardHtml,
    renderCurrentTab,
    render,
    switchTab,
    openCounter,
    openCounterOld,
    closeCounter,
    openCounterFromHome,
    init as initTasbeehCurrent
} from './tasbeeh-current.js';

import {
    loadPeriod,
    savePeriod,
    openPeriodModal,
    savePeriodModal,
    resetPeriodModal,
    setPeriodPreset,
    updatePeriodPreview,
    PERIOD_PRESETS,
    PERIOD_KEY
} from './tasbeeh-period.js';

import {
    TasbeehOldApp,
    getCurrentOldMonth,
    checkAndAdvanceMonth,
    markMonthCompleted,
    reopenLastMonth,
    resetAllCompleted,
    renderOldCardHtml,
    renderOldTab,
    init as initTasbeehOld
} from './tasbeeh-old.js';

import {
    TasbeehHistoryApp,
    renderHistoryTab,
    applyPreset as applyHistoryPreset,
    saveHistoryPeriod,
    resetHistoryPeriod,
    init as initTasbeehHistory
} from './tasbeeh-history.js';

import {
    TasbeehHomeApp,
    renderHomeTab,
    init as initTasbeehHome
} from './tasbeeh-home.js';

var _win = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : {});

// Wire cross-module bridges
if (_win.TasbeehApp) {
    if (_win.TasbeehHomeApp) _win.TasbeehApp.renderHomeTab = _win.TasbeehHomeApp.renderHomeTab;
    if (_win.TasbeehOldApp) {
        _win.TasbeehApp.renderOldTab = _win.TasbeehOldApp.renderOldTab;
        _win.TasbeehApp.getCurrentOldMonth = _win.TasbeehOldApp.getCurrentOldMonth;
        _win.TasbeehApp.openPeriodModal = _win.TasbeehOldApp.openPeriodModal;
    }
    if (_win.TasbeehHistoryApp) {
        _win.TasbeehApp.renderHistoryTab = _win.TasbeehHistoryApp.renderHistoryTab;
    }
}

// Global exports for backwards compatibility
if (typeof window !== 'undefined') {
    window.TasbeehPageViewModel = TasbeehPageViewModel;
    window.getTasbeehViewModel = getTasbeehViewModel;
    window.initTasbeeh = initTasbeeh;
    window.registerTasbeehComponents = registerTasbeehComponents;
    window.escHtml = escHtml;
    window.TasbeehCurrentApp = TasbeehCurrentApp;
    window.TasbeehApp = TasbeehCurrentApp;
    window.TasbeehOldApp = TasbeehOldApp;
    window.TasbeehHistoryApp = TasbeehHistoryApp;
    window.TasbeehHomeApp = TasbeehHomeApp;
}

export {
    TasbeehPageTemplate,
    TasbeehHeaderTemplate,
    TasbeehCounterCardTemplate,
    TasbeehCounterCardViewModel,
    TasbeehProgressCircleTemplate,
    TasbeehGoalSetterTemplate,
    TasbeehNavTabTemplate,
    TasbeehPageViewModel,
    getTasbeehViewModel,
    registerTasbeehComponents,
    initTasbeeh,
    escHtml,
    TasbeehCurrentApp,
    TasbeehOldApp,
    TasbeehHistoryApp,
    TasbeehHomeApp,
    TASBEEH_CONSTANTS,
    ELEMENT_IDS,
    STORAGE_KEYS,
    STORAGE_KEY,
    DAY_KEY,
    BM_CUR_KEY,
    BM_OLD_KEY,
    CURRENT_PERIOD_KEY,
    CAL_COMPLETION_KEY,
    TABS,
    DEFAULT_PRESETS,
    PERIOD_PRESETS,
    PERIOD_KEY,
    normalizeItem,
    loadItems,
    persistItems,
    checkDailyReset,
    loadCalCompletions,
    persistCalCompletions,
    isDayCompleted,
    setDayCompleted,
    getDaysInMonth,
    getFirstDayOfMonth,
    makeDateStr,
    getCompletedDaysInMonth,
    loadCurrentPeriod,
    saveCurrentPeriod,
    getCurrentTrackingMonth,
    removeMonthTrackingData,
    isMonthFullyCompleted,
    getBookmark,
    setBookmark,
    getBookmarkedChants,
    renderCalendar,
    handleCalendarDayClick,
    confirmDayStatusChange,
    animateCell,
    navigateMonth,
    advanceCurrentMonth,
    advanceOldMonth,
    confirmAction,
    openModal,
    saveModal,
    deleteItem,
    syncChips,
    getActiveItem,
    getItems,
    setItems,
    renderCurrentCardHtml,
    renderCurrentTab,
    render,
    switchTab,
    openCounter,
    openCounterOld,
    closeCounter,
    openCounterFromHome,
    loadPeriod,
    savePeriod,
    openPeriodModal,
    savePeriodModal,
    resetPeriodModal,
    setPeriodPreset,
    updatePeriodPreview,
    getCurrentOldMonth,
    checkAndAdvanceMonth,
    markMonthCompleted,
    reopenLastMonth,
    resetAllCompleted,
    renderOldCardHtml,
    renderOldTab,
    renderHistoryTab,
    applyHistoryPreset,
    saveHistoryPeriod,
    resetHistoryPeriod,
    renderHomeTab
};

export default (typeof window !== 'undefined' ? window.TasbeehApp : null);
