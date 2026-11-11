// tests/tabs.test.js
import assert from 'assert';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.join(__dirname, '..');

export async function runTabsTests() {
    console.log('▶ Running Reusable Tabs Component Tests...');

    // Minimal Mock for Knockout
    const registeredComponents = {};
    globalThis.ko = {
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
            fn.subscribe = function (cb) { subs.push(cb); return { dispose() { } }; };
            fn.__ko_proto__ = fn;
            return fn;
        },
        observableArray(init) {
            const obs = globalThis.ko.observable(init || []);
            obs.push = function (...args) {
                const arr = obs();
                arr.push(...args);
                obs(arr);
            };
            return obs;
        },
        pureComputed(readOrOpts) {
            const read = typeof readOrOpts === 'function' ? readOrOpts : (readOrOpts && readOrOpts.read);
            const write = (readOrOpts && typeof readOrOpts.write === 'function') ? readOrOpts.write : function () { };
            const fn = function (val) {
                if (arguments.length > 0) {
                    write(val);
                    return fn;
                }
                return read ? read() : undefined;
            };
            fn.__ko_proto__ = fn;
            fn.subscribe = function () { return { dispose() { } }; };
            return fn;
        },
        computed(read) { return globalThis.ko.pureComputed(read); },
        isObservable(fn) { return typeof fn === 'function' && !!fn.__ko_proto__; },
        unwrap(val) { return typeof val === 'function' ? val() : val; },
        components: {
            register(name, config) {
                registeredComponents[name] = config;
            },
            isRegistered(name) {
                return !!registeredComponents[name];
            }
        }
    };

    const { TabsViewModel, TabsTemplate, registerTabsComponent } = await import(path.join(ROOT, 'components', 'tabs', 'tabs.js'));

    // 1. Template Verification
    assert(TabsTemplate, 'TabsTemplate must be exported');
    assert.strictEqual(TabsTemplate.element, 'app-tabs-template');
    assert.strictEqual(TabsTemplate.file, 'components/tabs/tabs.html');

    // 2. Simple String Tabs (2 tabs)
    let selectedTab = null;
    const simpleVm = new TabsViewModel({
        tabs: ['todo', 'completed'],
        activeTab: globalThis.ko.observable('todo'),
        onTabChange: (id) => { selectedTab = id; }
    });

    const simpleTabs = simpleVm.tabs();
    assert.strictEqual(simpleTabs.length, 2, 'Should create 2 tabs from array of strings');
    assert.strictEqual(simpleTabs[0].id, 'todo');
    assert.strictEqual(simpleTabs[0].label, 'todo');
    assert.strictEqual(simpleVm.isActive(simpleTabs[0]), true, 'todo should be active');
    assert.strictEqual(simpleVm.isActive(simpleTabs[1]), false, 'completed should be inactive');

    // Tab switching
    simpleVm.selectTab(simpleTabs[1]);
    assert.strictEqual(simpleVm.activeTab(), 'completed');
    assert.strictEqual(selectedTab, 'completed', 'onTabChange callback should be invoked');
    assert.strictEqual(simpleVm.isActive(simpleTabs[1]), true);
    assert.strictEqual(simpleVm.isActive(simpleTabs[0]), false);

    // 3. Structured Object Tabs with Badges and Icons (Current / Old status tabs)
    const countObs = globalThis.ko.observable(5);
    let tabActionCalled = false;
    const structuredVm = new TabsViewModel({
        variant: 'underline',
        activeTab: globalThis.ko.observable('todo'),
        tabs: [
            { id: 'todo', label: 'TO DO', badge: countObs, elementId: 'tabTbCurrentTodo', badgeId: 'tbCurrentTodoBadge' },
            { id: 'completed', label: 'COMPLETED', badge: 0, elementId: 'tabTbCurrentDone', badgeId: 'tbCurrentDoneBadge', action: () => { tabActionCalled = true; } }
        ]
    });

    const structTabs = structuredVm.tabs();
    assert.strictEqual(structTabs.length, 2);
    assert.strictEqual(structTabs[0].elementId, 'tabTbCurrentTodo');
    assert.strictEqual(structTabs[0].badgeId, 'tbCurrentTodoBadge');
    assert.strictEqual(structTabs[0].badgeValue(), 5);
    assert.strictEqual(structTabs[0].hasBadge(), true);

    // Verify reactive badge update
    countObs(12);
    assert.strictEqual(structTabs[0].badgeValue(), 12);

    // Style class helpers
    const activeClass = structuredVm.getUnderlineTabClass(structTabs[0]);
    assert(activeClass.includes('border-b-2 border-brand text-brand font-bold'), 'Active underline tab class');
    const inactiveClass = structuredVm.getUnderlineTabClass(structTabs[1]);
    assert(inactiveClass.includes('border-transparent text-gr-textMuted'), 'Inactive underline tab class');

    const activeBadgeClass = structuredVm.getBadgeClass(structTabs[0]);
    assert(activeBadgeClass.includes('bg-brand-light text-brand'), 'Active badge styling');
    const inactiveBadgeClass = structuredVm.getBadgeClass(structTabs[1]);
    assert(inactiveBadgeClass.includes('bg-surfaceBg text-gr-textMuted'), 'Inactive badge styling');

    // Tab-level action execution
    structuredVm.selectTab(structTabs[1]);
    assert.strictEqual(tabActionCalled, true, 'Tab action callback should be called');

    // 4. Bottom-nav Variant with Icons and Aliases (Tasbeeh bottom nav: 3 tabs)
    const navVm = new TabsViewModel({
        variant: 'bottom-nav',
        activeTab: globalThis.ko.observable('current'),
        tabs: [
            { id: 'current', label: 'Current', icon: 'calendar-days', iconPrefix: 'fa-regular', elementId: 'tabTbCurrent' },
            { id: 'old', label: 'Old', icon: 'clock-rotate-left', elementId: 'tabTbOld' },
            { id: 'history', label: 'History', icon: 'gear', elementId: 'tabTbHistory', aliases: ['hist', 'settings'] }
        ]
    });

    const navTabs = navVm.tabs();
    assert.strictEqual(navTabs.length, 3, 'Should have 3 bottom nav tabs');
    assert.strictEqual(navTabs[0].icon, 'calendar-days');
    assert.strictEqual(navTabs[0].iconPrefix, 'fa-regular');
    assert.strictEqual(navVm.isActive(navTabs[0]), true);

    // Nav tab class helper
    const activeNavClass = navVm.getNavTabClass(navTabs[0]);
    assert(activeNavClass.includes('text-brand active'));
    const inactiveNavClass = navVm.getNavTabClass(navTabs[1]);
    assert(inactiveNavClass.includes('text-gr-textMuted'));

    // Alias matching
    navVm.activeTab('hist');
    assert.strictEqual(navVm.isActive(navTabs[2]), true, 'Alias "hist" should match history tab');
    navVm.activeTab('settings');
    assert.strictEqual(navVm.isActive(navTabs[2]), true, 'Alias "settings" should match history tab');

    // 5. Four Tabs support
    const fourTabsVm = new TabsViewModel({
        variant: 'bottom-nav',
        activeTab: globalThis.ko.observable('tab3'),
        tabs: [
            { id: 'tab1', label: 'Tab 1', icon: 'calendar-days' },
            { id: 'tab2', label: 'Tab 2', icon: 'clock' },
            { id: 'tab3', label: 'Tab 3', icon: 'chart-simple' },
            { id: 'tab4', label: 'Tab 4', icon: 'list-check' }
        ]
    });
    assert.strictEqual(fourTabsVm.tabs().length, 4);
    assert.strictEqual(fourTabsVm.isActive(fourTabsVm.tabs()[2]), true);

    // 6. Pill Variant
    const pillVm = new TabsViewModel({
        variant: 'pills',
        activeTab: globalThis.ko.observable('all'),
        tabs: [
            { id: 'all', label: 'All' },
            { id: 'unread', label: 'Unread' }
        ]
    });
    const activePillClass = pillVm.getPillTabClass(pillVm.tabs()[0]);
    assert(activePillClass.includes('bg-white text-brand shadow-sm font-bold'));

    // 7. Component Registration Verification
    registerTabsComponent(globalThis.ko);
    assert(globalThis.ko.components.isRegistered('app-tabs'), 'app-tabs must be registered');

    console.log('  ✔ Reusable Tabs Component: All variants, observables, callbacks, and registrations passed');
}

