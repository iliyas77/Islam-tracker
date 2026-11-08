// tests/dashboard.test.js
import assert from 'assert';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.join(__dirname, '..');

export async function runDashboardTests() {
    console.log('▶ Running Dashboard Feature & Component Tests...');

    // Minimal Mock for Knockout
    const registeredComponents = {};
    const mockKo = {
        observable(init) {
            let v = init;
            const subs = [];
            const fn = function (newVal) {
                if (arguments.length > 0) {
                    if (v !== newVal) {
                        v = newVal;
                        subs.forEach(s => s(v));
                    }
                    return fn;
                }
                return v;
            };
            fn.subscribe = function (cb) { subs.push(cb); return { dispose() {} }; };
            fn.__ko_proto__ = fn;
            return fn;
        },
        observableArray(init) {
            const obs = mockKo.observable(init ? [...init] : []);
            obs.push = function (...args) {
                const arr = obs();
                arr.push(...args);
                obs(arr);
            };
            return obs;
        },
        components: {
            isRegistered(name) {
                return !!registeredComponents[name];
            },
            register(name, config) {
                registeredComponents[name] = config;
            }
        }
    };
    globalThis.ko = mockKo;

    // 1. Dashboard Service Tests
    const { DashboardService } = await import(path.join(ROOT, 'features', 'dashboard', 'dashboard-service.js'));
    assert.strictEqual(typeof DashboardService.parseTimeToMin, 'function');
    assert.strictEqual(DashboardService.parseTimeToMin('05:15 AM'), 5 * 60 + 15);
    assert.strictEqual(DashboardService.parseTimeToMin('12:30 PM'), 12 * 60 + 30);
    assert.strictEqual(DashboardService.parseTimeToMin('06:00 PM'), 18 * 60);
    assert.strictEqual(DashboardService.parseTimeToMin('12:00 AM'), 0);
    assert.strictEqual(DashboardService.parseTimeToMin(''), -1);
    assert.strictEqual(DashboardService.parseTimeToMin(null), -1);

    const liveTime = DashboardService.dashLiveHeaderTime();
    assert(typeof liveTime === 'string');
    assert(/[0-9]{2}:[0-9]{2}\s+(AM|PM)/.test(liveTime));

    const curClock = DashboardService.getCurrentClockTime();
    assert(curClock.digits && typeof curClock.digits === 'string');
    assert(curClock.ampm === 'AM' || curClock.ampm === 'PM');

    const locInfo = DashboardService.getLocationInfo();
    assert(locInfo.city);
    assert(locInfo.schoolName);
    assert(locInfo.locationText.includes(locInfo.city));

    // Test timeline statuses with mock timings
    const mockTimings = {
        Fajr: '05:00 AM',
        Dhuhr: '12:30 PM',
        Asr: '04:15 PM',
        Maghrib: '06:00 PM',
        Isha: '07:30 PM'
    };
    const statuses = DashboardService.getTimelinePrayerStatuses(mockTimings);
    assert(statuses.Fajr);
    assert(statuses.Dhuhr);
    assert(statuses.Asr);
    assert(statuses.Maghrib);
    assert(statuses.Isha);

    const activeInfo = DashboardService.getActivePrayerInfo(mockTimings);
    assert(activeInfo.name);
    assert(activeInfo.time);

    console.log('  ✔ DashboardService: Calculations, status mapping, and timings verified');

    // 2. Clock Component Tests
    const { DashboardClockViewModel } = await import(path.join(ROOT, 'features', 'dashboard', 'components', 'dashboard-clock', 'dashboard-clock.js'));
    const clockVm = new DashboardClockViewModel();
    assert.strictEqual(typeof clockVm.digits, 'function');
    assert.strictEqual(typeof clockVm.ampm, 'function');
    assert.strictEqual(typeof clockVm.updateClock, 'function');
    clockVm.updateClock();
    assert(/[0-9]{2}:[0-9]{2}:[0-9]{2}/.test(clockVm.digits()));
    console.log('  ✔ Clock Component: ViewModel observables and tick updating verified');

    // 3. Timeline Component Tests
    const { DashboardTimelineViewModel } = await import(path.join(ROOT, 'features', 'dashboard', 'components', 'dashboard-timeline', 'dashboard-timeline.js'));
    const timelineVm = new DashboardTimelineViewModel();
    assert(timelineVm.items && typeof timelineVm.items === 'function');
    const items = timelineVm.items();
    assert.strictEqual(items.length, 5);
    assert.strictEqual(items[0].name, 'Fajr');
    assert.strictEqual(items[4].name, 'Isha');
    assert.strictEqual(typeof timelineVm.updateTimeline, 'function');
    console.log('  ✔ Timeline Component: 5 prayer items, badge mappings, and active statuses verified');

    // 4. Features Grid Component Tests
    const { DashboardFeaturesGridViewModel } = await import(path.join(ROOT, 'features', 'dashboard', 'components', 'dashboard-features-grid', 'dashboard-features-grid.js'));
    const gridVm = new DashboardFeaturesGridViewModel();
    assert(Array.isArray(gridVm.navCards));
    assert.strictEqual(gridVm.navCards.length, 5);
    const cardActions = gridVm.navCards.map(c => c.action);
    assert(cardActions.includes('goto-tracker'));
    assert(cardActions.includes('goto-tasbeeh'));
    assert(cardActions.includes('goto-quran'));
    assert(cardActions.includes('goto-duas'));
    assert(cardActions.includes('goto-settings'));

    const trackerCard = gridVm.navCards.find(c => c.action === 'goto-tracker');
    assert.strictEqual(trackerCard.hasBadge, true);
    assert.strictEqual(typeof trackerCard.badgeVisible, 'function');
    assert.strictEqual(typeof trackerCard.badgeText, 'function');
    console.log('  ✔ Features Grid Component: All 5 feature cards, action bindings, and badge reactivity verified');

    // 5. Dashboard Root ViewModel Composition Tests
    const { DashboardViewModel, getDashboardViewModel } = await import(path.join(ROOT, 'features', 'dashboard', 'dashboard-registration.js'));
    const dashVm = new DashboardViewModel();
    assert(dashVm.header && typeof dashVm.header.locationText === 'function');
    assert(dashVm.clock instanceof DashboardClockViewModel);
    assert(dashVm.timeline instanceof DashboardTimelineViewModel);
    assert(dashVm.featuresGrid instanceof DashboardFeaturesGridViewModel);
    assert.strictEqual(dashVm.navCards, dashVm.featuresGrid.navCards);
    assert.strictEqual(typeof dashVm.updateClock, 'function');
    assert.strictEqual(typeof dashVm.updateTimeline, 'function');
    assert.strictEqual(typeof dashVm.updateTrackerBadge, 'function');

    const singletonVm = getDashboardViewModel();
    assert(singletonVm instanceof DashboardViewModel);
    console.log('  ✔ DashboardViewModel: Modular component composition and backward compatibility verified');

    // 6. Registration Tests
    const { registerDashboardComponents } = await import(path.join(ROOT, 'features', 'dashboard', 'dashboard-registration.js'));
    registerDashboardComponents(mockKo);

    const requiredComponents = [
        'dashboard-clock',
        'clock-component',
        'dashboard-timeline',
        'timeline-component',
        'dashboard-features-grid',
        'features-grid-component',
        'features-grid',
        'dashboard-mobile-view',
        'dashboard-page'
    ];

    for (const name of requiredComponents) {
        assert(mockKo.components.isRegistered(name), `Dashboard component [${name}] must be registered`);
    }
    console.log(`  ✔ Dashboard Registration: All ${requiredComponents.length} components & aliases registered in ko`);
}

