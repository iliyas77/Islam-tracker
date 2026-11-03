/* ============================================================
   Nur Prayer — Centralized Application Constants
   Path: utilities/constant.js
   All application constants across features are maintained here.
   ============================================================ */

(function (window) {
        'use strict';

        const SUNRISE_ICON = '<svg class="icon-md" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v3M4.93 6.93l2.12 2.12M19.07 6.93l-2.12 2.12M2 17h20M17 17a5 5 0 0 0-10 0"/></svg>';
        const SUN_ICON = '<svg class="icon-md" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3.8"/><path d="M12 2v2.5M12 19.5V22M4.93 4.93l1.77 1.77M17.3 17.3l1.77 1.77M2 12h2.5M19.5 12H22M6.7 17.3l-1.77 1.77M19.07 4.93l-1.77 1.77"/></svg>';

        const PRAYER_ICONS = {
                Fajr:    SUNRISE_ICON,   // = previous Fajr SVG
                Maghrib: SUNRISE_ICON,
                Dhuhr:   SUN_ICON,       // = previous Dhuhr SVG
                Asr:     SUN_ICON,
                Isha: '<svg class="icon-md" width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.5a9.5 9.5 0 0 0 8.5 13.7 9.5 9.5 0 1 1-8.5-13.7z"/><polygon points="18.8 4 19.5 5.5 21 5.6 19.9 6.7 20.2 8.2 18.8 7.4 17.4 8.2 17.7 6.7 16.6 5.6 18.1 5.5"/></svg>'
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
                                DoneCheck: '<svg class="icon-md" viewBox="0 0 20 20" fill="currentColor">' +
                                        '<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />' +
                                        '</svg>',
                                DoneCheckSm: '<svg class="icon-sm" viewBox="0 0 20 20" fill="currentColor">' +
                                        '<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />' +
                                        '</svg>',
                                Warning: '<svg class="icon-sm" viewBox="0 0 20 20" fill="currentColor">' +
                                        '<path fill-rule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" />' +
                                        '</svg>',
                                Calendar: '<svg class="icon-sm" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.75">' +
                                        '<rect x="3" y="4" width="14" height="13" rx="2" />' +
                                        '<path d="M16 2v4M4 2v4M3 8h14" />' +
                                        '</svg>'
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
                                FONT_SIZE: 'namazFontSize',
                                START_DATE: 'namazStartDate',
                                OLD_PERIOD: 'namazOldPeriod',
                                TIMINGS_CACHE: 'namazPrayerTimingsCache',
                                CONFIG: 'namazPrayerConfig',
                                LAST_INIT_DATE: 'namazLastInitDate',
                                OLD_INIT: 'namazOldPeriodInitialized'
                        }
                },

                // ==========================================
                // Dashboard Constants
                // ==========================================
                DASHBOARD: {
                        TIMELINE_ICONS: PRAYER_ICONS,
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
                        STORAGE_KEYS: {
                                DATA: 'app_tasbeeh_data',
                                DAY: 'app_tasbeeh_day',
                                PERIOD: 'app_tasbeeh_period',
                                CURRENT_PERIOD: 'app_tasbeeh_current_period',
                                BOOKMARK_CURRENT: 'app_tasbeeh_bookmark_current',
                                BOOKMARK_OLD: 'app_tasbeeh_bookmark_old',
                                CAL_COMPLETIONS: 'app_tasbeeh_cal_completions'
                        },
                        TABS: {
                                HOME: 'home',
                                CURRENT: 'current',
                                OLD: 'old',
                                HISTORY: 'history'
                        },
                        TAB_HEADERS: {
                                home: {
                                        iconClass: 'house text-brand',
                                        label: 'Digital Tasbeeh',
                                        sub: 'Home · Bookmarks'
                                },
                                current: {
                                        iconClass: 'calendar text-brand',
                                        label: 'Digital Tasbeeh'
                                },
                                old: {
                                        iconClass: 'clock-rotate-left text-warning',
                                        label: 'Old Tasbeeh'
                                },
                                history: {
                                        iconClass: 'gear text-gr-accent',
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
                        ],
                        INFINITE_LAP: 33,
                        MAX_BEADS: 60,
                        SVG_NS: 'http://www.w3.org/2000/svg',
                        ICONS: {
                                MISBAHA: '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">' +
                                        '  <title>prayer-beads</title>' +
                                        '  <path fill="#123D2E" d="M16.726 45.719a.963.963 0 0 0 1.304-.304a.9.9 0 0 0-.311-1.262a.97.97 0 0 0-1.305.3a.903.903 0 0 0 .312 1.266m44.799-25.408a2.4 2.4 0 0 0-.651-.581a.903.903 0 0 0 .646-1.358a.94.94 0 0 0-.471-.374c.25-.274.438-.597.533-.962c.158-.6.066-1.225-.256-1.76c-.404-.668-1.158-1.071-1.936-1.124a2.68 2.68 0 0 0-.307-3.531c-.936-.908-2.354-1.032-3.443-.411c.09-.158.154-.332.154-.526c0-.604-.49-1.094-1.094-1.094c-.082 0-.155.03-.232.047a2.2 2.2 0 0 0-.055-.938a2.34 2.34 0 0 0-1.164-1.404c-.797-.418-1.779-.311-2.504.17a.9.9 0 0 0 .047-.292c-.021-.507-.463-.898-.985-.878a.96.96 0 0 0-.567.23A2.375 2.375 0 0 0 47.008 4l-.108.002a2.4 2.4 0 0 0-1.679.768a2.3 2.3 0 0 0-.612 1.663c.017.355.12.684.279.979a.96.96 0 0 0-.629.135a.9.9 0 0 0-.363.48c-.789-.593-1.944-.696-2.803-.148a2.32 2.32 0 0 0-1.035 1.494c-.062.3-.061.602-.004.894a.96.96 0 0 0-1.008.375a.88.88 0 0 0-.145.574c-.963-.249-2.067.094-2.641.916a2.27 2.27 0 0 0-.368 1.741c.034.176.094.344.166.504a2.9 2.9 0 0 0-2.614.739a2.686 2.686 0 0 0 0 3.895l.01.008a1.084 1.084 0 0 0-.989 1.072c0 .105.032.201.061.297c-.968-.204-2.041.179-2.576 1.021a2.26 2.26 0 0 0-.297 1.753c.088.368.27.695.513.974a.93.93 0 0 0-.479.364a.88.88 0 0 0-.121.579c-.975-.212-2.06.173-2.599 1.021a2.27 2.27 0 0 0-.296 1.754c.088.367.27.694.514.973a.92.92 0 0 0-.48.366a.87.87 0 0 0-.12.578c-.976-.215-2.064.174-2.597 1.021a2.26 2.26 0 0 0-.299 1.757c.088.365.27.691.514.971a.9.9 0 0 0-.479.363a.9.9 0 0 0-.12.58c-.975-.215-2.063.174-2.598 1.021a2.26 2.26 0 0 0-.298 1.755c.088.367.27.693.513.973a.92.92 0 0 0-.479.365a.9.9 0 0 0 .309 1.262a.97.97 0 0 0 1.308-.302a.87.87 0 0 0 .119-.571a2.4 2.4 0 0 0 .561.076c.338 0 .656-.084.954-.209a2.3 2.3 0 0 0-.169.363a2.25 2.25 0 0 0-.093 1.068a.95.95 0 0 0-.611.058a.903.903 0 0 0-.438 1.227a.96.96 0 0 0 1.268.424a.93.93 0 0 0 .419-.422a2.4 2.4 0 0 0 1.724.722a2.4 2.4 0 0 0 1.044-.234a2.33 2.33 0 0 0 1.226-1.352c.121-.35.145-.713.094-1.068a.95.95 0 0 0 .611-.057a.9.9 0 0 0 .422-.424a2.44 2.44 0 0 0 1.723.725c.363 0 .715-.078 1.041-.234a2.34 2.34 0 0 0 1.229-1.354c.121-.349.145-.711.094-1.064c.2.041.413.035.613-.059a.93.93 0 0 0 .418-.422a2.44 2.44 0 0 0 2.767.49a2.34 2.34 0 0 0 1.226-1.351c.121-.35.145-.715.094-1.071c.16.033.327.042.495-.011a.93.93 0 0 0 .471-.359a2.41 2.41 0 0 0 1.937.96c.251 0 .502-.038.744-.115a2.36 2.36 0 0 0 1.402-1.187a2.25 2.25 0 0 0 .239-1.008c1.118.98 2.839.959 3.918-.086c.59-.57.856-1.33.819-2.079c.192.245.477.413.813.413c.413 0 .762-.244.933-.592a2.4 2.4 0 0 0 1.792.795q.453 0 .879-.163a2.35 2.35 0 0 0 1.326-1.267c.198-.461.23-.959.113-1.438a.96.96 0 0 0 .654-.181a.9.9 0 0 0 .322-.499a2.42 2.42 0 0 0 2.805-.057c.514-.382.841-.937.922-1.561c.046-.353 0-.702-.112-1.028c.492.03.934-.299 1.001-.783a.87.87 0 0 0-.124-.558c.996-.181 1.796-.97 1.938-1.977a2.3 2.3 0 0 0-.457-1.706M24.238 37.407c-.393.614-1.293.824-1.938.441a1.33 1.33 0 0 1-.625-.839a1.28 1.28 0 0 1 .17-.995a1.4 1.4 0 0 1 1.197-.645c.26 0 .516.07.737.202c.319.19.542.489.626.841c.083.343.022.696-.167.995m33.666-21.274c.092-.35.321-.645.645-.829c.216-.122.461-.186.71-.186c.5 0 .966.257 1.216.669c.184.304.235.658.146.998a1.34 1.34 0 0 1-.645.828c-.651.366-1.551.136-1.926-.482a1.34 1.34 0 0 1-.146-.998m-7.025-8.417a1.42 1.42 0 0 1 1.238-.708c.232 0 .465.057.669.164c.331.175.571.463.674.811c.101.336.06.692-.113 1.001c-.353.63-1.243.887-1.905.54a1.34 1.34 0 0 1-.675-.808a1.28 1.28 0 0 1 .112-1m-4.926-2.274c.254-.274.604-.434 1.055-.451c.75 0 1.361.563 1.395 1.282a1.3 1.3 0 0 1-.349.944a1.48 1.48 0 0 1-1.021.453c-.752 0-1.397-.563-1.431-1.281c-.014-.349.11-.685.351-.947m-4.92 4.13c.072-.354.285-.659.597-.858c.23-.147.498-.225.774-.225c.476 0 .916.227 1.176.607c.201.294.272.646.201.991a1.33 1.33 0 0 1-.596.856c-.631.4-1.543.219-1.951-.378c-.201-.295-.272-.648-.201-.993m-3.954 3.124a1.42 1.42 0 0 1 1.17-.598c.279 0 .551.079.783.229c.312.203.521.508.591.862c.068.346-.007.698-.211.99c-.416.596-1.33.771-1.953.367a1.34 1.34 0 0 1-.59-.865a1.3 1.3 0 0 1 .21-.985m-6.288 9.244a1.4 1.4 0 0 1 1.195-.645c.26 0 .516.07.74.205c.321.189.543.488.627.84c.081.341.021.692-.17.991c-.392.618-1.29.828-1.937.442a1.34 1.34 0 0 1-.626-.841a1.28 1.28 0 0 1 .171-.992m-2.984 4.692a1.41 1.41 0 0 1 1.2-.645c.26 0 .516.069.736.2c.319.191.542.49.626.842c.081.342.021.696-.17.995c-.391.615-1.292.824-1.933.442a1.34 1.34 0 0 1-.629-.841a1.3 1.3 0 0 1 .17-.993m-2.979 4.689a1.4 1.4 0 0 1 1.195-.643c.261 0 .516.07.738.203c.32.189.543.488.626.84a1.28 1.28 0 0 1-.17.994c-.39.615-1.286.826-1.933.441a1.33 1.33 0 0 1-.629-.838c-.08-.34-.02-.694.173-.997m2.593 9.041a1.34 1.34 0 0 1-.711.779c-.688.325-1.551.035-1.881-.621a1.27 1.27 0 0 1-.067-1a1.34 1.34 0 0 1 .714-.779q.293-.139.617-.14c.533 0 1.029.298 1.261.759c.158.315.183.671.067 1.002m5.12-2.412a1.35 1.35 0 0 1-.715.782c-.678.319-1.552.026-1.877-.62a1.28 1.28 0 0 1-.067-1.003c.118-.344.37-.621.71-.78c.195-.092.404-.14.619-.14c.543 0 1.027.292 1.264.759c.157.315.181.67.066 1.002m5.117-2.406c-.12.344-.372.619-.71.777c-.681.32-1.556.027-1.88-.62a1.27 1.27 0 0 1-.067-1.003c.119-.344.371-.619.712-.779a1.44 1.44 0 0 1 .619-.139c.533 0 1.027.297 1.26.758c.158.316.181.673.066 1.006m5.196-1.906c-.166.33-.457.574-.818.689c-.729.229-1.54-.168-1.773-.857a1.28 1.28 0 0 1 .072-1.001c.166-.327.457-.569.82-.685a1.5 1.5 0 0 1 .441-.068c.607 0 1.143.371 1.33.923c.112.331.087.686-.072.999m10.691-3.93a1.36 1.36 0 0 1-.77.732c-.713.272-1.549-.078-1.828-.754a1.28 1.28 0 0 1 .008-1.002c.146-.336.418-.596.771-.73a1.5 1.5 0 0 1 .523-.098c.58 0 1.091.333 1.303.848c.135.324.132.682-.007 1.004m4.215-2.577c-.596.444-1.516.327-1.973-.248a1.3 1.3 0 0 1-.276-.976c.046-.355.233-.672.528-.892a1.43 1.43 0 0 1 .862-.284c.44 0 .846.191 1.112.527c.225.281.322.628.277.978a1.32 1.32 0 0 1-.53.895m.558-2.917c-.834-.582-2.035-.617-2.875.009a2.3 2.3 0 0 0-.919 1.559c-.047.368.005.729.13 1.068a.96.96 0 0 0-.588.177a.9.9 0 0 0-.291.401c-.656-.524-1.582-.716-2.407-.398a2.34 2.34 0 0 0-1.325 1.263a2.2 2.2 0 0 0-.17 1.008a1 1 0 0 0-.344-.069c-.492 0-.887.348-.998.806a2.7 2.7 0 0 0-.634-.938a2.91 2.91 0 0 0-4.026 0c-.6.58-.863 1.354-.816 2.113a2.42 2.42 0 0 0-2.202-.372a2.35 2.35 0 0 0-1.405 1.181c-.168.33-.24.687-.239 1.044a.95.95 0 0 0-.614-.024a.95.95 0 0 0-.553.461a2.4 2.4 0 0 0-1.709-.713c-.365 0-.717.08-1.043.236a2.32 2.32 0 0 0-1.228 1.35a2.25 2.25 0 0 0-.095 1.068a.95.95 0 0 0-.612.057a.92.92 0 0 0-.425.432c-.701-.695-1.826-.938-2.762-.498a2.33 2.33 0 0 0-1.227 1.354a2.24 2.24 0 0 0-.092 1.066a.96.96 0 0 0-.611.058a.92.92 0 0 0-.422.423a2.4 2.4 0 0 0-1.723-.723c-.332 0-.652.074-.953.204a2.26 2.26 0 0 0 .232-1.632a2.3 2.3 0 0 0-.512-.973a.93.93 0 0 0 .478-.364a.86.86 0 0 0 .12-.57c.184.044.371.075.561.075c.836 0 1.599-.412 2.038-1.104c.336-.527.442-1.15.298-1.755a2.3 2.3 0 0 0-.514-.974a.93.93 0 0 0 .479-.365a.86.86 0 0 0 .121-.57c.184.045.37.076.561.076c.837 0 1.598-.413 2.037-1.104c.335-.527.44-1.15.297-1.755a2.3 2.3 0 0 0-.511-.974a.9.9 0 0 0 .477-.364a.88.88 0 0 0 .121-.57c.184.043.371.076.563.076c.836 0 1.598-.414 2.038-1.106c.336-.525.44-1.147.297-1.751a2.3 2.3 0 0 0-.516-.976l.002-.001c.481-.114.848-.527.848-1.044q-.002-.226-.086-.423c.988.314 2.114.104 2.901-.656a2.685 2.685 0 0 0 .462-3.288c.104.014.205.045.313.045c.795 0 1.537-.383 1.985-1.024A2.27 2.27 0 0 0 40.599 13a2.3 2.3 0 0 0-.472-.989a.93.93 0 0 0 .495-.343c.045-.065.063-.138.089-.208c.445.438 1.047.7 1.696.7c.466 0 .921-.131 1.313-.38c.54-.345.907-.875 1.035-1.493a2.26 2.26 0 0 0-.049-1.073a.95.95 0 0 0 .598-.133a.9.9 0 0 0 .409-.785c.372.231.814.366 1.29.366l.102-.002a2.4 2.4 0 0 0 1.68-.773c.252-.272.42-.596.518-.94a.96.96 0 0 0 .582.183c.087-.004.163-.034.241-.058c-.037.055-.081.103-.114.161a2.26 2.26 0 0 0-.197 1.766c.18.605.594 1.104 1.164 1.402c.348.183.739.28 1.133.28c.595 0 1.146-.226 1.576-.597c.16.406.551.695 1.014.695c.097 0 .184-.031.272-.055a2.68 2.68 0 0 0 .085 3.791a2.88 2.88 0 0 0 2.131.797a2.3 2.3 0 0 0-.246.572a2.26 2.26 0 0 0 .256 1.759a2.42 2.42 0 0 0 2.065 1.148c.173 0 .343-.03.51-.065a.88.88 0 0 0 .108.575c.025.043.066.069.099.106c-.02-.003-.037-.011-.056-.013c-1.325-.173-2.518.744-2.691 1.995a2.27 2.27 0 0 0 .447 1.701c.234.309.541.54.886.701a.9.9 0 0 0-.25.423m1.1-1.183a1.4 1.4 0 0 1-.943-.54a1.28 1.28 0 0 1-.256-.966c.092-.662.688-1.162 1.385-1.162q.096 0 .193.013c.379.05.712.24.938.536c.215.28.306.625.258.97c-.1.722-.813 1.251-1.575 1.149"/>' +
                                        '  <path fill="#123D2E" d="M17.954 40.452a2.685 2.685 0 0 0-.001 3.893a2.915 2.915 0 0 0 4.025.001a2.69 2.69 0 0 0 0-3.894a2.91 2.91 0 0 0-4.024 0m-1.645 5.367c-.165-.159.218-1.088-.393-1.678c-.601-.582-1.647-.438-2.23.357c-.206.283-.495.912-.603 1.23c-.19.57-.368 1.722-.333 2.528c-.146-.035-.29-.073-.458-.073c-.841 0-1.85.438-2.265.845l-.358.353l.377.372c-1.676 1.12-5.625 3.842-7.937 6.117a.36.36 0 0 0 0 .518c.145.142.38.142.525 0c1.585-1.56 4.021-3.378 5.898-4.7c-2.243 1.885-5.218 4.399-5.711 4.883a.363.363 0 0 0 0 .518c.145.145.38.145.525 0c.411-.403 2.71-2.354 4.774-4.091c-1.824 1.758-3.871 3.703-4.558 4.247a.366.366 0 0 0-.056.518c.009.008.017.02.026.027c.133.13.347.145.496.027c.65-.518 2.419-2.189 4.115-3.818c-1.707 1.85-3.343 3.568-3.856 3.938a.362.362 0 0 0-.042.554a.374.374 0 0 0 .482.035c.576-.417 2.31-2.242 3.961-4.033c-1.565 1.914-3.097 3.701-3.695 4.15a.36.36 0 0 0-.069.512q.015.02.032.037c.13.127.338.145.488.031c.915-.688 3.572-3.937 5.353-6.168c-1.26 1.855-3.215 4.437-5.128 6.32a.36.36 0 0 0 0 .517c.145.144.38.144.525 0c2.445-2.406 5.059-6.045 6.152-7.872l.273.27l.35-.345c.416-.411.861-1.407.861-2.239c0-.164-.039-.303-.073-.443c.834.039 2.048-.135 2.643-.32c.328-.105.981-.387 1.27-.584c.823-.565.967-1.581.368-2.162c-.527-.512-1.576-.229-1.729-.378m-3.692 4.806c-.018-.006-.036-.004-.055-.009a.37.37 0 0 0-.137-.225a.34.34 0 0 0-.153-.064a.32.32 0 0 0-.117-.205a.36.36 0 0 0-.177-.078c-.014-.072-.041-.137-.095-.191s-.124-.082-.194-.095a.34.34 0 0 0-.075-.169a.35.35 0 0 0-.209-.117c-.006-.032-.023-.063-.039-.093c.507-.185 1.172-.27 1.357-.088c.074.073.115.22.115.415c-.001.295-.101.627-.221.919"/>' +
                                        '</svg>',
                                TARGET: '<svg class="tb-meta-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#168a54" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">' +
                                        '<circle cx="12" cy="12" r="9"/>' +
                                        '<circle cx="12" cy="12" r="5"/>' +
                                        '<circle cx="12" cy="12" r="1.5" fill="#168a54"/>' +
                                        '<path d="m4 4 4.5 4.5"/>' +
                                        '<path d="M3 6.5 6.5 3"/>' +
                                        '</svg>',
                                CHECK_CIRCLE: '<svg class="tb-meta-icon" width="16" height="16" viewBox="0 0 20 20" fill="#168a54">' +
                                        '<circle cx="10" cy="10" r="10" fill="#168a54"/>' +
                                        '<path fill="#ffffff" fill-rule="evenodd" d="M14.707 6.707a1 1 0 00-1.414-1.414l-4.293 4.293-1.879-1.879a1 1 0 00-1.414 1.414l2.586 2.586a1 1 0 001.414 0l4.999-4.999z" clip-rule="evenodd"/>' +
                                        '</svg>',
                                PENCIL: '<svg width="18" height="18" viewBox="0 0 24 24" fill="#168a54">' +
                                        '<path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>' +
                                        '</svg>',
                                CHEVRON: '<svg class="tb-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">' +
                                        '<path d="m9 18 6-6-6-6"/>' +
                                        '</svg>'
                        }
                },

                // ==========================================
                // Quran Duas Constants
                // ==========================================
                DUA: {
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
                                PINNED: '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 15 15"><title>drawing-pin</title><path fill="currentColor" d="M9.621 1.136a.5.5 0 0 1 .707 0l3.536 3.535a.5.5 0 0 1-.707.707l-.653-.652l-3.637 4.848l1.108 1.108a.5.5 0 1 1-.707.707L6.793 8.913v.001l-3.27 3.27a.5.5 0 0 1-.708-.706l3.27-3.27v-.002L3.612 5.732a.5.5 0 1 1 .707-.707l1.108 1.108l4.848-3.637l-.653-.653a.5.5 0 0 1 0-.707M6.14 6.847L8.153 8.86l3.637-4.85l-.802-.8z"/></svg>',
                                UNPINNED: '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 15 15"><title>drawing-pin</title><path fill="currentColor" d="M9.621 1.136a.5.5 0 0 1 .707 0l3.536 3.535a.5.5 0 0 1-.707.707l-.653-.652l-3.637 4.848l1.108 1.108a.5.5 0 1 1-.707.707L6.793 8.913v.001l-3.27 3.27a.5.5 0 0 1-.708-.706l3.27-3.27v-.002L3.612 5.732a.5.5 0 1 1 .707-.707l1.108 1.108l4.848-3.637l-.653-.653a.5.5 0 0 1 0-.707M6.14 6.847L8.153 8.86l3.637-4.85l-.802-.8z"/></svg>',
                                FAV: '❤️',
                                UNFAV: '♡'
                        },
                        SEARCH_DEBOUNCE_MS: 80,
                        MAX_PINS: 2,
                        API_URL: 'https://iliyas77.github.io/Islam-tracker/duas.json',
                        fetchDuas: function () {
                                return fetch('https://iliyas77.github.io/Islam-tracker/duas.json')
                                        .then(function (response) {
                                                if (!response.ok) throw new Error('HTTP ' + response.status);
                                                return response.json();
                                        })
                                        .catch(function () {
                                                // Fallback to local / relative path for offline or local testing
                                                return fetch('./duas.json')
                                                        .then(function (response) {
                                                                if (!response.ok) {
                                                                        return fetch('../duas.json').then(function (fallbackRes) {
                                                                                if (!fallbackRes.ok) throw new Error('HTTP ' + fallbackRes.status);
                                                                                return fallbackRes.json();
                                                                        });
                                                                }
                                                                return response.json();
                                                        });
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
                        INDIAN_CITIES: [
                                { name: 'Guntur', state: 'Andhra Pradesh', group: 'Popular Andhra Pradesh Cities' },
                                { name: 'Vijayawada', state: 'Andhra Pradesh', group: 'Popular Andhra Pradesh Cities' },
                                { name: 'Visakhapatnam', state: 'Andhra Pradesh', group: 'Popular Andhra Pradesh Cities' },
                                { name: 'Tirupati', state: 'Andhra Pradesh', group: 'Popular Andhra Pradesh Cities' },
                                { name: 'Kurnool', state: 'Andhra Pradesh', group: 'Popular Andhra Pradesh Cities' },
                                { name: 'Nellore', state: 'Andhra Pradesh', group: 'Popular Andhra Pradesh Cities' },

                                { name: 'Delhi', state: 'National Capital Region', group: 'Major Indian Metros' },
                                { name: 'Hyderabad', state: 'Telangana', group: 'Major Indian Metros' },
                                { name: 'Bengaluru', state: 'Karnataka', group: 'Major Indian Metros' },
                                { name: 'Mumbai', state: 'Maharashtra', group: 'Major Indian Metros' },
                                { name: 'Chennai', state: 'Tamil Nadu', group: 'Major Indian Metros' },
                                { name: 'Kolkata', state: 'West Bengal', group: 'Major Indian Metros' },

                                { name: 'Ahmedabad', state: 'Gujarat', group: 'Other Prominent Cities' },
                                { name: 'Lucknow', state: 'Uttar Pradesh', group: 'Other Prominent Cities' },
                                { name: 'Pune', state: 'Maharashtra', group: 'Other Prominent Cities' },
                                { name: 'Jaipur', state: 'Rajasthan', group: 'Other Prominent Cities' },
                                { name: 'Bhopal', state: 'Madhya Pradesh', group: 'Other Prominent Cities' },
                                { name: 'Patna', state: 'Bihar', group: 'Other Prominent Cities' },
                                { name: 'Srinagar', state: 'Jammu & Kashmir', group: 'Other Prominent Cities' },
                                { name: 'Kozhikode', state: 'Kerala', group: 'Other Prominent Cities' },
                                { name: 'Kochi', state: 'Kerala', group: 'Other Prominent Cities' },
                                { name: 'Indore', state: 'Madhya Pradesh', group: 'Other Prominent Cities' },
                                { name: 'Nagpur', state: 'Maharashtra', group: 'Other Prominent Cities' },
                                { name: 'Kanpur', state: 'Uttar Pradesh', group: 'Other Prominent Cities' },
                                { name: 'Surat', state: 'Gujarat', group: 'Other Prominent Cities' },
                                { name: 'Aurangabad', state: 'Maharashtra', group: 'Other Prominent Cities' },
                                { name: 'Chandigarh', state: 'Punjab/Haryana', group: 'Other Prominent Cities' }
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
                        PAGES: ['dashboardPage', 'trackerPage', 'settingsPage', 'tasbeehPage', 'duasPage'],
                        NAVS: {
                                dashboard: 'navHome',
                                tracker: 'navCur',
                                current: 'navCur',
                                old: 'navCur',
                                settings: 'navSet',
                                tasbeeh: 'navTasbeeh',
                                duas: 'navDuas'
                        },
                        SUB_TABS: {
                                CURRENT: 'current',
                                OLD: 'old'
                        },
                        PAGE_MAP: {
                                dashboard: 'dashboardPage',
                                tracker: 'trackerPage',
                                current: 'trackerPage',
                                old: 'trackerPage',
                                settings: 'settingsPage',
                                tasbeeh: 'tasbeehPage',
                                duas: 'duasPage'
                        },
                        TRACKER_HEADER: {
                                current: {
                                        iconClass: 'calendar text-gr-accent',
                                        label: 'Current Prayer'
                                },
                                old: {
                                        iconClass: 'clock-rotate-left text-warning',
                                        label: 'Old Tracking'
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
        window.CONSTANTS = CONSTANTS;

        // Backward compatibility aliases
        window.P = CONSTANTS.PRAYER.NAMES;
        window.K = CONSTANTS.PRAYER.STORAGE_KEYS.TRACKER_DATA;
        window.OCK = CONSTANTS.PRAYER.STORAGE_KEYS.OLD_DATA;
        window.FK = CONSTANTS.PRAYER.STORAGE_KEYS.FONT_SIZE;
        window.SK = CONSTANTS.PRAYER.STORAGE_KEYS.START_DATE;
        window.OK = CONSTANTS.PRAYER.STORAGE_KEYS.OLD_PERIOD;
        window.PTK_CACHE = CONSTANTS.PRAYER.STORAGE_KEYS.TIMINGS_CACHE;
        window.PTK_CONFIG = CONSTANTS.PRAYER.STORAGE_KEYS.CONFIG;
        window.LIK = CONSTANTS.PRAYER.STORAGE_KEYS.LAST_INIT_DATE;
        window.OIK = CONSTANTS.PRAYER.STORAGE_KEYS.OLD_INIT;
        window.defaultPrayerConfig = CONSTANTS.PRAYER.DEFAULT_CONFIG;
        window.T = CONSTANTS.PRAYER.DEFAULT_TIMINGS;
        window.I = CONSTANTS.PRAYER.ICONS;
        window.PRAYER_ICONS = PRAYER_ICONS;
        window.PRAYER_CARD_ICONS = CONSTANTS.PRAYER.CARD_ICONS;
        window.TIMELINE_ICONS = CONSTANTS.DASHBOARD.TIMELINE_ICONS;
        window.INDIAN_CITIES = CONSTANTS.SETTINGS.INDIAN_CITIES;
        window.PAGES = CONSTANTS.NAVIGATION.PAGES;
        window.NAVS = CONSTANTS.NAVIGATION.NAVS;
        window.MONTH_NAMES = CONSTANTS.COMMON.MONTH_NAMES;

})(window);
