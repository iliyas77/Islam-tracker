// tests/router.test.js
import assert from 'assert';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.join(__dirname, '..');

export async function runRouterTests() {
    console.log('▶ Running Router & Navigation Tests...');

    globalThis.location = { hash: '#/dashboard' };
    globalThis.history = {
        replaceState(state, title, url) {
            globalThis.location.hash = url;
        }
    };

    // Minimal Mock for Knockout
    globalThis.ko = {
        observable(init) {
            let v = init;
            const subs = [];
            const fn = function(newVal) {
                if (arguments.length > 0) {
                    if (v !== newVal) {
                        v = newVal;
                        subs.forEach(s => s(v));
                    }
                    return fn;
                }
                return v;
            };
            fn.subscribe = function(cb) { subs.push(cb); return { dispose() {} }; };
            fn.__ko_proto__ = fn;
            return fn;
        },
        pureComputed(readOrOpts) {
            const read = typeof readOrOpts === 'function' ? readOrOpts : (readOrOpts && readOrOpts.read);
            const write = (readOrOpts && typeof readOrOpts.write === 'function') ? readOrOpts.write : function() {};
            const fn = function(val) {
                if (arguments.length > 0) {
                    write(val);
                    return fn;
                }
                return read ? read() : undefined;
            };
            fn.__ko_proto__ = fn;
            return fn;
        },
        computed(read) { return globalThis.ko.pureComputed(read); },
        isObservable(fn) { return typeof fn === 'function' && !!fn.__ko_proto__; }
    };

    const { Router } = await import(path.join(ROOT, 'services', 'router.js'));
    const router = new Router();
    router.init();

    // 1. Initial State
    assert.strictEqual(router.activePage(), 'dashboard');
    assert.strictEqual(router.currentPath(), '#/dashboard');

    // 2. Navigation Actions
    router.navigate('#/tracker/current');
    assert.strictEqual(router.activePage(), 'tracker');
    assert.strictEqual(router.trackerSubTab(), 'current');
    assert.strictEqual(router.currentPath(), '#/tracker/current');
    assert.strictEqual(globalThis.location.hash, '#/tracker/current');

    router.navigate('#/tasbeeh/history');
    assert.strictEqual(router.activePage(), 'tasbeeh');
    assert.strictEqual(router.tasbeehSubTab(), 'history');

    router.navigate('#/duas/pinned');
    assert.strictEqual(router.activePage(), 'duas');
    assert.strictEqual(router.duasSubTab(), 'pinned');

    router.navigate('#/settings');
    assert.strictEqual(router.activePage(), 'settings');

    // 3. Legacy normalizations
    router.navigate('#/history');
    assert.strictEqual(router.activePage(), 'tracker');
    assert.strictEqual(router.trackerSubTab(), 'history');

    // 4. isRoute helper
    assert.strictEqual(router.isRoute('tracker', 'history'), true);
    assert.strictEqual(router.isRoute('tracker', 'current'), false);

    // 5. AppViewModel Integration & Lifecycle
    const { AppViewModel, getAppViewModel } = await import(path.join(ROOT, 'services', 'app-view-model.js'));
    const appVm = new AppViewModel();
    assert.strictEqual(typeof appVm.getDashboard, 'function');
    assert.strictEqual(typeof appVm.getTracker, 'function');
    assert.strictEqual(typeof appVm.getSettings, 'function');
    assert.strictEqual(typeof appVm.getTasbeeh, 'function');
    assert.strictEqual(typeof appVm.getDuas, 'function');

    // Verify currentRoute evaluates without throwing
    const route = appVm.currentRoute();
    assert(route && typeof route.name === 'string');
    assert.strictEqual(typeof getAppViewModel, 'function');

    // 6. Navigation re-entrancy and loop prevention
    globalThis.$ = function (id) { return null; };
    globalThis.document = globalThis.document || { getElementById: () => null };
    await import(path.join(ROOT, 'navigation.js'));
    assert.strictEqual(typeof globalThis.showPage, 'function');
    assert.strictEqual(typeof globalThis.switchTrackerSubTab, 'function');

    // Simulate navigation to tracker and tracker subtabs without stack overflow
    globalThis.showPage('tracker');
    assert.strictEqual(globalThis.trackerSubTab, 'current');

    globalThis.switchTrackerSubTab('history');
    assert.strictEqual(globalThis.trackerSubTab, 'history');

    globalThis.showPage('tracker');
    assert.strictEqual(globalThis.trackerSubTab, 'history');

    // Simulate direct hash changes triggering handleHashChange
    globalThis.location.hash = '#/tracker/current';
    router.handleHashChange();
    assert.strictEqual(router.activePage(), 'tracker');
    assert.strictEqual(router.trackerSubTab(), 'current');

    console.log('  ✔ Router & AppViewModel: Hash routing, lifecycle getters, and currentRoute passed');
}

