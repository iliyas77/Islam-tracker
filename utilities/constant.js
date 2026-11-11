/* ============================================================
   Nur Prayer — Centralized Application Constants
   Path: utilities/constant.js
   All application constants across features are maintained here.
   ============================================================ */

(function (globalObj) {
        'use strict';

        const SUNRISE_ICON = 'fa-solid fa-cloud-sun';
        const SUN_ICON = 'fa-solid fa-sun';

        const PRAYER_ICONS = {
                Fajr: SUNRISE_ICON,
                Maghrib: SUNRISE_ICON,
                Dhuhr: SUN_ICON,
                Asr: SUN_ICON,
                Isha: 'fa-solid fa-moon'
        };

        const CONSTANTS = {
                // ==========================================
                // Prayer Tracker & Core Prayer Constants
                // ==========================================
                PRAYER: {
                        NAMES: ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'],
                        DEFAULT_TIMINGS: {
                                Fajr: '04:49 AM',
                                Dhuhr: '11:54 AM',
                                Asr: '04:10 PM',
                                Maghrib: '05:47 PM',
                                Isha: '06:59 PM'
                        },
                        ICONS: PRAYER_ICONS,
                        CARD_ICONS: Object.assign({}, PRAYER_ICONS, {
                                DoneCheck: 'fa-solid fa-circle-check',
                                DoneCheckSm: 'fa-solid fa-circle-check',
                                Warning: 'fa-solid fa-triangle-exclamation',
                                Calendar: 'fa-regular fa-calendar-days'
                        }),
                        DEFAULT_CONFIG: {
                                city: 'Guntur',
                                country: 'India',
                                method: 1, // University of Islamic Sciences, Karachi
                                school: 1  // 1 = Hanafi, 0 = Shafi
                        },
                        API: {
                                TIMINGS_BY_CITY: 'https://api.aladhan.com/v1/timingsByCity/'
                        },
                        SCHOOLS: {
                                HANAFI: 1,
                                SHAFI: 0
                        },
                        SCHOOL_NAMES: {
                                1: 'Hanafi',
                                0: 'Shafi'
                        },
                        STATUS: {
                                LIVE: 'live',
                                CACHED: 'cached',
                                OFFLINE: 'offline'
                        },
                        STATUS_LABELS: {
                                live: 'Live',
                                cached: 'Cached',
                                offline: 'Offline'
                        },
                        SHEETS: {
                                MISSED_PRAYERS: {
                                        iconClass: 'clipboard-list text-gr-accent',
                                        title: 'Missed Prayers',
                                        sub: 'From previous days (today excluded)'
                                },
                                PERIOD_INFO: {
                                        iconClass: 'circle-info text-brand',
                                        title: 'Period Info'
                                },
                                SET_OLD_PERIOD: {
                                        iconClass: 'clock-rotate-left text-warning',
                                        title: 'Set Old Period',
                                        sub: ''
                                }
                        },
                        STORAGE_KEYS: {
                                TRACKER_DATA: 'namazTrackerData',
                                OLD_DATA: 'namazOldData',
                                HISTORY: 'namazPrayerHistory',
                                FONT_SIZE: 'namazFontSize',
                                START_DATE: 'namazStartDate',
                                OLD_PERIOD: 'namazOldPeriod',
                                TIMINGS_CACHE: 'namazPrayerTimingsCache',
                                CONFIG: 'namazPrayerConfig',
                                LAST_INIT_DATE: 'namazLastInitDate',
                                OLD_INIT: 'namazOldPeriodInitialized'
                        },
                        ELEMENT_IDS: {
                                PAGE: 'trackerPage',
                                HEADER_TITLE: 'trackerHeaderTitle',
                                HEADER_ICON: 'trackerHeaderIcon',
                                HEADER_LABEL: 'trackerHeaderLabel',
                                OLD_SUB: 'oldSub',
                                CURRENT_MISSED_BTN: 'currentMissedBtn',
                                CURRENT_MISSED_BADGE: 'currentMissedBadge',
                                OLD_ACTION_BTN: 'oldActionBtn',
                                HISTORY_EMPTY_BTN: 'historyEmptyBtn',
                                CURRENT_BODY: 'currentBody',
                                OLD_BODY: 'oldBody',
                                HISTORY_BODY: 'historyBody',
                                TAB_CURRENT: 'tabTrackCurrent',
                                TAB_OLD: 'tabTrackOld',
                                TAB_HISTORY: 'tabTrackHistory',
                                SHEET2: 'sheet2',
                                SHEET2_ICON: 'sheet2Icon',
                                SHEET2_TITLE: 'sheet2Title',
                                SHEET2_SUB: 'sheet2Sub',
                                SHEET2_BODY: 'sheet2Body',
                                HIST_EMPTY_STATE: 'histEmptyState',
                                HIST_CONTENT: 'histContent',
                                HIST_SUBTITLE_COUNT: 'histSubtitleCount',
                                HIST_LIST: 'histList'
                        }
                },

                // ==========================================
                // Dashboard Constants
                // ==========================================
                DASHBOARD: {
                        POLLING_INTERVAL_MS: 30000,
                        ELEMENT_IDS: {
                                BODY: 'dashBody',
                                SCROLL: 'dashScroll',
                                LOCATION_TEXT: 'dashLocationText',
                                TIME: 'dashTime',
                                CLOCK_DIGITS: 'dashClockDigits',
                                CLOCK_AMPM: 'dashClockAmPm',
                                TIMELINE_NODES: 'dashTimelineNodes',
                                TRACKER_MISSED_BADGE: 'trackerMissedBadge'
                        },
                        STATUSES: {
                                ACTIVE: 'active',
                                PASSED: 'passed',
                                NEXT: 'next',
                                UPCOMING: 'upcoming'
                        },
                        STATUS_BADGES: {
                                active: { className: 'badge-active', text: 'Active' },
                                passed: { className: 'badge-passed', text: 'Passed' },
                                next: { className: 'badge-next', text: 'Next' },
                                upcoming: { className: 'badge-upcoming', text: 'Upcoming' }
                        },
                        CLOCK_INTERVAL_MS: 1000
                },

                // ==========================================
                // Digital Tasbeeh Constants
                // ==========================================
                TASBEEH: {
                        DEFAULT_TARGET: 33,
                        ELEMENT_IDS: {
                                PAGE: 'tasbeehPage',
                                HEADER_ICON: 'tbHeaderIcon',
                                HEADER_LABEL: 'tbHeaderLabel',
                                HEADER_SUB: 'tbHeaderSub',
                                ADD_BTN: 'tbAddBtn',
                                TAB_CURRENT: 'tabTbCurrent',
                                TAB_OLD: 'tabTbOld',
                                TAB_HISTORY: 'tabTbHistory',
                                CURRENT_BODY: 'tbCurrentBody',
                                CURRENT_LIST: 'tbList',
                                CURRENT_EMPTY_STATE: 'tbEmptyState',
                                CURRENT_TODO_GROUP: 'tbCurrentTodoGroup',
                                CURRENT_TODO_LIST: 'tbCurrentTodoList',
                                CURRENT_TODO_GRID: 'tbCurrentTodoGrid',
                                CURRENT_TODO_BADGE: 'tbCurrentTodoBadge',
                                CURRENT_DONE_GROUP: 'tbCurrentDoneGroup',
                                CURRENT_DONE_LIST: 'tbCurrentDoneList',
                                CURRENT_DONE_GRID: 'tbCurrentDoneGrid',
                                CURRENT_DONE_BADGE: 'tbCurrentDoneBadge',
                                CURRENT_DONE_TOGGLE: 'tbCurrentDoneToggle',
                                CURRENT_ADVANCE_BANNER: 'tbCurrentAdvanceBanner',
                                CURRENT_ADVANCE_BANNER_TEXT: 'tbCurrentAdvanceBannerText',
                                OLD_BODY: 'tbOldBody',
                                OLD_EMPTY_RANGE: 'tbOldEmptyRange',
                                OLD_EMPTY_RANGE_START: 'tbOldEmptyRangeStart',
                                OLD_EMPTY_RANGE_CUR: 'tbOldEmptyRangeCur',
                                OLD_ALL_COMPLETED: 'tbOldAllCompleted',
                                OLD_ALL_COMPLETED_START: 'tbOldAllCompletedStart',
                                OLD_CONTENT: 'tbOldContent',
                                OLD_ADVANCE_BANNER: 'tbOldAdvanceBanner',
                                OLD_ADVANCE_BANNER_MSG: 'tbOldAdvanceBannerMsg',
                                OLD_TODO_GRID: 'tbOldTodoGrid',
                                OLD_TODO_BADGE: 'tbOldTodoBadge',
                                OLD_DONE_LIST: 'tbOldDoneList',
                                OLD_DONE_GRID: 'tbOldDoneGrid',
                                OLD_DONE_BADGE: 'tbOldDoneBadge',
                                OLD_DONE_TOGGLE: 'tbOldDoneToggle',
                                HISTORY_BODY: 'tbHistoryBody',
                                HISTORY_CONTENT: 'tbHistoryContent',
                                HIST_PERCENT_BADGE: 'tbHistPercentBadge',
                                HIST_PROGRESS_BAR: 'tbHistProgressBar',
                                HIST_TOTAL_MONTHS: 'tbHistTotalMonths',
                                HIST_CLEARED_MONTHS: 'tbHistClearedMonths',
                                HIST_PENDING_MONTHS: 'tbHistPendingMonths',
                                HIST_PERIOD_START: 'tbHistPeriodStart',
                                HIST_PERIOD_END: 'tbHistPeriodEnd',
                                HIST_RESET_COMPLETED_BTN: 'tbHistResetCompletedBtn',
                                HISTORY_LIST: 'tbHistoryList'
                        },
                        DATA_ACTS: {
                                SWITCH_CURRENT: 'switch-tb-current',
                                SWITCH_OLD: 'switch-tb-old',
                                SWITCH_HISTORY: 'switch-tb-history',
                                CURRENT_ADVANCE: 'tb-current-advance',
                                OLD_ADVANCE: 'tb-old-advance',
                                OLD_REOPEN: 'tb-old-reopen',
                                RESET_ALL_COMPLETED: 'tb-reset-all-completed',
                                OPEN_SETTINGS: 'tb-open-settings',
                                HIST_PRESET: 'tb-hist-preset',
                                HIST_SAVE: 'tb-hist-save',
                                HIST_RESET: 'tb-hist-reset',
                                EDIT_DHIKR: 'tb-edit'
                        },
                        STORAGE_KEYS: {
                                DATA: 'app_tasbeeh_data',
                                DAY: 'app_tasbeeh_day',
                                PERIOD: 'app_tasbeeh_period',
                                CURRENT_PERIOD: 'app_tasbeeh_current_period',
                                CAL_COMPLETIONS: 'app_tasbeeh_cal_completions'
                        },
                        TABS: {
                                CURRENT: 'current',
                                OLD: 'old',
                                HISTORY: 'history'
                        },
                        TAB_HEADERS: {
                                current: {
                                        iconClass: 'fa-regular fa-calendar-days text-brand',
                                        label: 'Digital Tasbeeh'
                                },
                                old: {
                                        iconClass: 'fa-solid fa-clock-rotate-left text-gr-warning',
                                        label: 'Old Tasbeeh'
                                },
                                history: {
                                        iconClass: 'fa-solid fa-gear text-gr-accent',
                                        label: 'Tasbeeh History',
                                        sub: 'Period & Settings'
                                }
                        },
                        PERIOD_PRESETS: {
                                THIS_YEAR: 'this-year',
                                LAST_6_MONTHS: '6-months',
                                LAST_1_YEAR: '1-year'
                        },
                        DEFAULT_PRESETS: [
                                { title: 'SubhanAllah', targetCount: 33, targetCycles: 3 },
                                { title: 'Alhamdulillah', targetCount: 33, targetCycles: 3 },
                                { title: 'Allahu Akbar', targetCount: 34, targetCycles: 3 },
                                { title: 'Astaghfirullah', targetCount: 100, targetCycles: 1 }
                        ]
		},

                // ==========================================
                // Quran Duas Constants
                // ==========================================
                DUA: {
                        ELEMENT_IDS: {
                                PAGE: 'duasPage',
                                HEADER_TITLE: 'duasHeaderTitle',
                                PROGRESS_INDICATOR: 'duaProgressIndicator',
                                BODY: 'duasBody',
                                SUB_HOME: 'duaSubHome',
                                HOME_VIEW: 'duaHomeView',
                                SUB_ALL: 'duaSubAll',
                                SEARCH_INPUT: 'duaSearchInput',
                                SEARCH_CLEAR: 'duaSearchClear',
                                LIST_VIEW: 'duaListView',
                                SUB_FAVS: 'duaSubFavs',
                                FAVOURITES_LIST: 'duaFavouritesList',
                                SUB_DETAIL: 'duaSubDetail',
                                DETAIL_NUMBER: 'duaDetailNumber',
                                DETAIL_SURAH: 'duaDetailSurah',
                                DETAIL_UCHCHARANA: 'duaDetailUchcharana',
                                DETAIL_ARDHAM: 'duaDetailArdham',
                                DETAIL_FAV_BTN: 'duaDetailFavBtn',
                                DETAIL_FAV_ICON: 'duaDetailFavIcon',
                                DETAIL_PIN_BTN: 'duaDetailPinBtn',
                                DETAIL_PIN_ICON: 'duaDetailPinIcon',
                                FAB_BTN: 'duaFabBtn',
                                TAB_PINNED: 'duaTabPinned',
                                TAB_ALL: 'duaTabAll',
                                TAB_FAVS: 'duaTabFavs',
                                ADD_MODAL: 'duaAddModal',
                                ADMIN_MODAL: 'duaAdminModal',
                                HOME_EMPTY_STATE: 'duaHomeEmptyState',
                                HOME_CONTENT: 'duaHomeContent',
                                HOME_TITLE_COUNT: 'duaHomeTitleCount',
                                LIST_EMPTY_STATE: 'duaListEmptyState',
                                FAVS_EMPTY_STATE: 'duaFavsEmptyState',
                                LOADING_STATE: 'duaLoadingState',
                                ERROR_STATE: 'duaErrorState',
                                ERROR_MESSAGE: 'duaErrorMessage',
                                ADMIN_EMPTY_STATE: 'duaAdminEmptyState'
                        },
                        STORAGE_KEYS: {
                                DATA: 'quranDuas_data',
                                FAVS: 'quranDuas_favourites',
                                PINS: 'quranDuas_pins'
                        },
                        TABS: {
                                HOME: 'home',
                                DUAS: 'duas',
                                FAVOURITES: 'favourites'
                        },
                        ICONS: {
				PINNED: '<app-icon params="name: \'thumbtack\'"></app-icon>',
				UNPINNED: '<app-icon params="name: \'thumbtack\'"></app-icon>',
				FAV: '<app-icon params="name: \'heart\', color: \'text-danger\'"></app-icon>',
				UNFAV: '<app-icon params="name: \'heart\', prefix: \'fa-regular\'"></app-icon>',
				// Knockout standard pure data metadata
				NAMES: {
					PINNED: 'thumbtack',
					UNPINNED: 'thumbtack',
					FAV: 'heart',
					UNFAV: 'heart'
				},
				CLASSES: {
					PINNED: 'fa-solid fa-thumbtack',
					UNPINNED: 'fa-solid fa-thumbtack',
					FAV: 'fa-solid fa-heart text-danger',
					UNFAV: 'fa-regular fa-heart'
				}
			},
                        SEARCH_DEBOUNCE_MS: 80,
                        MAX_PINS: 2,
                        API_URL: 'https://raw.githubusercontent.com/iliyas77/data.github.io/main/duas.json',
                        fetchDuas: function () {
                                return fetch('https://raw.githubusercontent.com/iliyas77/data.github.io/main/duas.json')
                                        .then(function (response) {
                                                if (!response.ok) throw new Error('HTTP ' + response.status);
                                                return response.json();
                                        });
                        }
                },

                // ==========================================
                // Settings Constants
                // ==========================================
                SETTINGS: {
                        CUSTOM_CITY_VALUE: '__custom__',
                        BASE_FONT_SIZE_PX: 16,
                        DEFAULT_FONT_SIZE: 1,
                        DEFAULT_CONFIG: {
                                city: 'Guntur',
                                country: 'India',
                                school: 1
                        },
                        ELEMENT_IDS: {
                                LOCATION_SUBTITLE: 'ptLocationSubtitle',
                                STATUS_TEXT: 'ptStatusText',
                                STATUS_BADGE: 'ptStatusBadge',
                                CITY_SELECT: 'ptCitySelect',
                                CUSTOM_CITY_WRAP: 'ptCustomCityWrap',
                                CUSTOM_CITY_INPUT: 'ptCustomCityInput',
                                COUNTRY_INPUT: 'ptCountryInput',
                                SCHOOL_SELECT: 'ptSchoolSelect',
                                START_DATE_INPUT: 'sdInput',
                                FONT_SIZE_BTNS: 'fsBtns'
                        },
                        BUTTON_CLASSES: {
                                FONT_ACTIVE: 'flex-1 py-3 font-bold rounded-xl text-sm bg-brand text-white border border-brand transition-all cursor-pointer',
                                FONT_INACTIVE: 'flex-1 py-3 font-bold rounded-xl text-sm bg-surfaceBg text-brand border border-borderGrey hover:bg-brand-light transition-all cursor-pointer'
                        },
                        SCHOOLS: {
                                HANAFI: 1,
                                SHAFI: 0
                        },
                        STATUS_FALLBACK: 'Offline',
                        INDIAN_CITIES: [
                                { name: 'Guntur', state: 'Andhra Pradesh' },
                                { name: 'Vijayawada', state: 'Andhra Pradesh' },
                                { name: 'Visakhapatnam', state: 'Andhra Pradesh' },
                                { name: 'Tirupati', state: 'Andhra Pradesh' },
                                { name: 'Kurnool', state: 'Andhra Pradesh' },
                                { name: 'Nellore', state: 'Andhra Pradesh' },

                                { name: 'Delhi', state: 'National Capital Region' },
                                { name: 'Hyderabad', state: 'Telangana' },
                                { name: 'Bengaluru', state: 'Karnataka' },
                                { name: 'Mumbai', state: 'Maharashtra' },
                                { name: 'Chennai', state: 'Tamil Nadu' },
                                { name: 'Kolkata', state: 'West Bengal' },

                                { name: 'Ahmedabad', state: 'Gujarat' },
                                { name: 'Lucknow', state: 'Uttar Pradesh' },
                                { name: 'Pune', state: 'Maharashtra' },
                                { name: 'Jaipur', state: 'Rajasthan' },
                                { name: 'Bhopal', state: 'Madhya Pradesh' },
                                { name: 'Patna', state: 'Bihar' },
                                { name: 'Srinagar', state: 'Jammu & Kashmir' },
                                { name: 'Kozhikode', state: 'Kerala' },
                                { name: 'Kochi', state: 'Kerala' },
                                { name: 'Indore', state: 'Madhya Pradesh' },
                                { name: 'Nagpur', state: 'Maharashtra' },
                                { name: 'Kanpur', state: 'Uttar Pradesh' },
                                { name: 'Surat', state: 'Gujarat' },
                                { name: 'Aurangabad', state: 'Maharashtra' },
                                { name: 'Chandigarh', state: 'Punjab/Haryana' }
                        ],
                        FONT_SIZE_OPTIONS: [
                                { v: 0.9, l: 'Small' },
                                { v: 1, l: 'Medium' },
                                { v: 1.15, l: 'Large' }
                        ]
                },

                // ==========================================
                // Navigation Constants
                // ==========================================
                NAVIGATION: {
                        PAGES: ['dashboardPage', 'trackerPage', 'settingsPage', 'tasbeehPage', 'duasPage', 'quranPage'],
                        NAVS: {
                                dashboard: 'navHome',
                                tracker: 'navCur',
                                current: 'navCur',
                                old: 'navCur',
                                settings: 'navSet',
                                tasbeeh: 'navTasbeeh',
                                duas: 'navDuas',
                                quran: 'navQuran'
                        },
                        SUB_TABS: {
                                CURRENT: 'current',
                                OLD: 'old',
                                HISTORY: 'history'
                        },
                        PAGE_MAP: {
                                dashboard: 'dashboardPage',
                                tracker: 'trackerPage',
                                current: 'trackerPage',
                                old: 'trackerPage',
                                history: 'trackerPage',
                                settings: 'settingsPage',
                                tasbeeh: 'tasbeehPage',
                                duas: 'duasPage',
                                quran: 'quranPage'
                        },
                        TRACKER_HEADER: {
                                current: {
                                        iconClass: 'fa-regular fa-calendar-days text-gr-accent',
                                        label: 'Current Prayer'
                                },
                                old: {
                                        iconClass: 'fa-solid fa-clock-rotate-left text-gr-warning',
                                        label: 'Old Tracking'
                                },
                                history: {
                                        iconClass: 'fa-solid fa-list-check text-brand',
                                        label: 'History'
                                }
                        },
                        NAV_CLASSES: {
                                ACTIVE: 'text-brand',
                                INACTIVE: 'text-secondary',
                                BAR: 'bg-brand rounded-pill nav-active-bar'
                        }
                },

                // ==========================================
                // Common / UI / Date Constants
                // ==========================================
                COMMON: {
                        TOAST_DURATION_MS: 2200,
                        RIPPLE_DURATION_MS: 620,
                        MS_PER_DAY: 864e5,
                        MONTH_NAMES: [
                                'January', 'February', 'March', 'April', 'May', 'June',
                                'July', 'August', 'September', 'October', 'November', 'December'
                        ]
                }
        };

        // Alias DUAS to DUA for convenience
        CONSTANTS.DUAS = CONSTANTS.DUA;

        // Alias DATE for convenience
        CONSTANTS.DATE = {
                MONTH_NAMES: CONSTANTS.COMMON.MONTH_NAMES
        };

        // Expose CONSTANTS object globally
        if (globalObj) {
                globalObj.CONSTANTS = CONSTANTS;

                // Feature-specific module aliases
                globalObj.PRAYER_CONSTANTS = CONSTANTS.PRAYER;
                globalObj.DASHBOARD_CONSTANTS = CONSTANTS.DASHBOARD;
                globalObj.TASBEEH_CONSTANTS = CONSTANTS.TASBEEH;
                globalObj.DUA_CONSTANTS = CONSTANTS.DUA;
                globalObj.DUAS_CONSTANTS = CONSTANTS.DUA;
                globalObj.SETTINGS_CONSTANTS = CONSTANTS.SETTINGS;
                globalObj.NAVIGATION_CONSTANTS = CONSTANTS.NAVIGATION;
                globalObj.COMMON_CONSTANTS = CONSTANTS.COMMON;
        }

        if (typeof window !== 'undefined' && window !== globalObj) {
                window.CONSTANTS = CONSTANTS;
                window.PRAYER_CONSTANTS = CONSTANTS.PRAYER;
                window.DASHBOARD_CONSTANTS = CONSTANTS.DASHBOARD;
                window.TASBEEH_CONSTANTS = CONSTANTS.TASBEEH;
                window.DUA_CONSTANTS = CONSTANTS.DUA;
                window.DUAS_CONSTANTS = CONSTANTS.DUA;
                window.SETTINGS_CONSTANTS = CONSTANTS.SETTINGS;
                window.NAVIGATION_CONSTANTS = CONSTANTS.NAVIGATION;
                window.COMMON_CONSTANTS = CONSTANTS.COMMON;
        }

})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : {}));

var _root = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : {});
var CONSTANTS = _root.CONSTANTS;
var PRAYER_CONSTANTS = _root.PRAYER_CONSTANTS;
var DASHBOARD_CONSTANTS = _root.DASHBOARD_CONSTANTS;
var TASBEEH_CONSTANTS = _root.TASBEEH_CONSTANTS;
var DUA_CONSTANTS = _root.DUA_CONSTANTS;
var DUAS_CONSTANTS = _root.DUAS_CONSTANTS;
var SETTINGS_CONSTANTS = _root.SETTINGS_CONSTANTS;
var NAVIGATION_CONSTANTS = _root.NAVIGATION_CONSTANTS;
var COMMON_CONSTANTS = _root.COMMON_CONSTANTS;

if (typeof module !== 'undefined' && module.exports) {
        module.exports = CONSTANTS;
        module.exports.CONSTANTS = CONSTANTS;
        module.exports.PRAYER_CONSTANTS = PRAYER_CONSTANTS;
        module.exports.DASHBOARD_CONSTANTS = DASHBOARD_CONSTANTS;
        module.exports.TASBEEH_CONSTANTS = TASBEEH_CONSTANTS;
        module.exports.DUA_CONSTANTS = DUA_CONSTANTS;
        module.exports.DUAS_CONSTANTS = DUAS_CONSTANTS;
        module.exports.SETTINGS_CONSTANTS = SETTINGS_CONSTANTS;
        module.exports.NAVIGATION_CONSTANTS = NAVIGATION_CONSTANTS;
        module.exports.COMMON_CONSTANTS = COMMON_CONSTANTS;
}
