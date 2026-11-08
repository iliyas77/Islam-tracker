/* ============================================================
   Nur Prayer — Digital Tasbeeh Master Coordinator
   Path: features/tasbeeh/tasbeeh.js
   Consolidated Module coordinating submodules:
     - features/tasbeeh/tasbeeh-view-model.js
     - features/tasbeeh/tasbeeh-model.js
     - features/tasbeeh/tasbeeh-calendar.js
     - features/tasbeeh/tasbeeh-modal.js
     - features/tasbeeh/tasbeeh-period.js
     - features/tasbeeh/tasbeeh-current/tasbeeh-current.js
     - features/tasbeeh/tasbeeh-old/tasbeeh-old.js
     - features/tasbeeh/tasbeeh-history/tasbeeh-history.js
   ============================================================ */

import {
    TasbeehPageTemplate,
    TasbeehHeaderTemplate,
    TasbeehCounterCardTemplate,
    TasbeehCounterCardViewModel,
    TasbeehProgressCircleTemplate,
    TasbeehNavTabTemplate,
    TasbeehPageViewModel,
    getTasbeehViewModel,
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
} from './tasbeeh-current/tasbeeh-current.js';

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
} from './tasbeeh-old/tasbeeh-old.js';

import {
    TasbeehHistoryApp,
    renderHistoryTab,
    applyPreset as applyHistoryPreset,
    saveHistoryPeriod,
    resetHistoryPeriod,
    init as initTasbeehHistory
} from './tasbeeh-history/tasbeeh-history.js';

import {
    TasbeehService,
    unwrap,
    pad2,
    uid,
    clamp,
    todayKey,
    td,
    formatMonthLabel,
    formatDate,
    formatMonthYear,
    getPrevMonthKey,
    getNextMonthKey,
    getPreviousMonthsList,
    renderIcon,
    showToast,
    getDhikrById,
    saveDhikrItem,
    deleteDhikrItem,
    calculateHistoryStats,
    calculatePeriodPreset,
    classifyCurrentItems,
    classifyOldItems,
    buildCalendarCells
} from './tasbeeh-service.js';

// Re-export modular Knockout components
export * from './tasbeeh-current/tasbeeh-current-card/tasbeeh-current-card.js';
export * from './tasbeeh-current/tasbeeh-current-feed/tasbeeh-current-feed.js';
export * from './tasbeeh-current/tasbeeh-current-form/tasbeeh-current-form.js';
export * from './tasbeeh-current/tasbeeh-current-page/tasbeeh-current-page.js';

export * from './tasbeeh-old/tasbeeh-old-card/tasbeeh-old-card.js';
export * from './tasbeeh-old/tasbeeh-old-feed/tasbeeh-old-feed.js';
export * from './tasbeeh-old/tasbeeh-old-form/tasbeeh-old-form.js';
export * from './tasbeeh-old/tasbeeh-old-page/tasbeeh-old-page.js';

export * from './tasbeeh-history/tasbeeh-history-card/tasbeeh-history-card.js';
export * from './tasbeeh-history/tasbeeh-history-feed/tasbeeh-history-feed.js';
export * from './tasbeeh-history/tasbeeh-history-form/tasbeeh-history-form.js';
export * from './tasbeeh-history/tasbeeh-history-page/tasbeeh-history-page.js';

// Re-export Tasbeeh centralized registration
import { registerTasbeehComponents } from './tasbeeh-registration.js';
export * from './tasbeeh-registration.js';
try { registerTasbeehComponents(); } catch (_) {}

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
    window.escHtml = escHtml;
    window.TasbeehCurrentApp = TasbeehCurrentApp;
    window.TasbeehApp = TasbeehCurrentApp;
    window.TasbeehOldApp = TasbeehOldApp;
    window.TasbeehHistoryApp = TasbeehHistoryApp;
    window.TasbeehService = TasbeehService;
}

export {
    TasbeehPageTemplate,
    TasbeehHeaderTemplate,
    TasbeehCounterCardTemplate,
    TasbeehCounterCardViewModel,
    TasbeehProgressCircleTemplate,
    TasbeehNavTabTemplate,
    TasbeehPageViewModel,
    getTasbeehViewModel,
    initTasbeeh,
    registerTasbeehComponents,
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
    resetHistoryPeriod,
    TasbeehService,
    unwrap,
    pad2,
    uid,
    clamp,
    todayKey,
    td,
    formatMonthLabel,
    formatDate,
    formatMonthYear,
    getPrevMonthKey,
    getNextMonthKey,
    getPreviousMonthsList,
    renderIcon,
    showToast,
    getDhikrById,
    saveDhikrItem,
    deleteDhikrItem,
    calculateHistoryStats,
    calculatePeriodPreset,
    classifyCurrentItems,
    classifyOldItems,
    buildCalendarCells
};

export default (typeof window !== 'undefined' ? window.TasbeehApp : null);
