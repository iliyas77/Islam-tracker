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
    isMonthFullyCompleted
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
    init as initTasbeehCurrent
} from './current/current.js';

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
    switchOldTab,
    init as initTasbeehOld
} from './old/old.js';

import {
    TasbeehHistoryApp,
    renderHistoryTab,
    applyPreset as applyHistoryPreset,
    saveHistoryPeriod,
    resetHistoryPeriod,
    init as initTasbeehHistory
} from './history/history.js';

var _win = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : {});

// Wire cross-module bridges
if (_win.TasbeehApp) {
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
    TASBEEH_CONSTANTS,
    ELEMENT_IDS,
    STORAGE_KEYS,
    STORAGE_KEY,
    DAY_KEY,
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
    switchOldTab,
    renderHistoryTab,
    applyHistoryPreset,
    saveHistoryPeriod,
    resetHistoryPeriod
};

export default (typeof window !== 'undefined' ? window.TasbeehApp : null);
