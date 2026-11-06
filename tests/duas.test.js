// tests/duas.test.js
import assert from 'assert';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.join(__dirname, '..');

export async function runDuasTests() {
    console.log('▶ Running DuasStore & Filter Tests...');

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

    const { DuasStore } = await import(path.join(ROOT, 'services', 'duas-store.js'));

    const testDuas = [
        { id: 1, number: 1, title: 'Dua for Guidance', uchcharana: 'Rabbana atina fid-dunya hasanatan', ardham: 'మా ప్రభువా మాకు ఇహలోకంలో మేలు ప్రసాదించు' },
        { id: 2, number: 2, title: 'Dua for Forgiveness', uchcharana: 'Rabbanagfir lana dhunubana', ardham: 'మా పాపాలను క్షమించు' },
        { id: 3, number: 3, title: 'Dua for Parents', uchcharana: 'Rabbir hamhuma kama rabbayani sagheera', ardham: 'నా తల్లిదండ్రులపై దయ చూపించు' }
    ];

    DuasStore.allDuas(testDuas);
    DuasStore.pins([0]);
    DuasStore.favourites([1]);

    // 1. Initial State Checks
    assert.strictEqual(DuasStore.allDuas().length, 3);
    assert.strictEqual(DuasStore.pinnedDuas().length, 1);
    assert.strictEqual(DuasStore.favouriteDuas().length, 1);

    // 2. Search by Transliteration
    DuasStore.searchQuery('hasanatan');
    let results = DuasStore.filteredDuas();
    assert.strictEqual(results.length, 1);
    assert.strictEqual(results[0].id, 1);

    // 3. Search by Telugu Meaning
    DuasStore.searchQuery('తల్లిదండ్రులపై');
    results = DuasStore.filteredDuas();
    assert.strictEqual(results.length, 1);
    assert.strictEqual(results[0].id, 3);

    // 4. Reset Search Query
    DuasStore.searchQuery('');
    results = DuasStore.filteredDuas();
    assert.strictEqual(results.length, 3);

    // 5. Pin Limit Check (max 2 pinned)
    assert.strictEqual(DuasStore.pins().length, 1);
    DuasStore.pins([0, 1]);
    assert.strictEqual(DuasStore.pins().length, 2);
    assert.strictEqual(DuasStore.pinnedDuas().length, 2);

    console.log('  ✔ DuasStore: Transliteration search, Telugu filter, and pin limits passed');
}
