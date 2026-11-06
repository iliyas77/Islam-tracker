// tests/settings.test.js
import assert from 'assert';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.join(__dirname, '..');

export async function runSettingsTests() {
    console.log('▶ Running SettingsStore & Configuration Tests...');

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
        observableArray(init) {
            const obs = globalThis.ko.observable(init || []);
            obs.push = function(...args) {
                const arr = obs();
                arr.push(...args);
                obs(arr);
            };
            return obs;
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
            fn.subscribe = function() { return { dispose() {} }; };
            return fn;
        },
        computed(read) { return globalThis.ko.pureComputed(read); },
        isObservable(fn) { return typeof fn === 'function' && !!fn.__ko_proto__; }
    };

    const { SettingsStore } = await import(path.join(ROOT, 'services', 'settings-store.js'));

    // 1. City selection & computed effective city
    SettingsStore.selectedCity('Hyderabad');
    assert.strictEqual(SettingsStore.selectedCity(), 'Hyderabad');
    assert.strictEqual(SettingsStore.effectiveCity(), 'Hyderabad');

    // Custom city mode
    SettingsStore.selectedCity('__custom__');
    SettingsStore.customCity('Warangal');
    assert.strictEqual(SettingsStore.effectiveCity(), 'Warangal');

    // 2. Font scaling
    SettingsStore.fontScale(1.15);
    assert.strictEqual(SettingsStore.fontScale(), 1.15);

    SettingsStore.fontScale(0.9);
    assert.strictEqual(SettingsStore.fontScale(), 0.9);

    // 3. Settings persistence
    const savedConfig = JSON.parse(localStorage.getItem(SettingsStore.CONFIG_KEY) || '{}');
    assert.strictEqual(savedConfig.city, 'Warangal');

    console.log('  ✔ SettingsStore: Location, font scaling, and auto-persistence passed');
}
