/* ============================================================
   Nur Prayer — Current Tasbeeh Form Component
   Path: tasbeeh/tasbeeh-current/tasbeeh-current-form/tasbeeh-current-form.js
   ============================================================ */

import {
    saveDhikrItem,
    deleteDhikrItem,
    confirmAction
} from '../../tasbeeh-service.js';

var _win = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : {});

export const CurrentFormTemplate = {
    element: 'tasbeeh-current-form-template',
    file: 'tasbeeh/tasbeeh-current/tasbeeh-current-form/tasbeeh-current-form.html'
};

export function CurrentFormViewModel(params) {
    if (params instanceof CurrentFormViewModel) return params;
    if (!(this instanceof CurrentFormViewModel)) return new CurrentFormViewModel(params);

    var p = (params && typeof params === 'function') ? params() : (params || {});
    var k = typeof ko !== 'undefined' ? ko : (_win.ko || null);
    var self = this;

    function obs(val) {
        return (k && k.observable) ? k.observable(val) : function () { return val; };
    }
    function comp(fn) {
        return (k && k.pureComputed) ? k.pureComputed(fn) : fn;
    }

    self.isOpen = (p.isOpen && k && k.isObservable(p.isOpen)) ? p.isOpen : obs(false);
    self.editingId = obs(null);
    self.title = obs('');
    self.targetCount = obs(33);
    self.isInfinite = obs(false);

    self.isEditMode = comp(function () {
        return !!self.editingId();
    });

    self.selectChip = function (val) {
        if (val === 'infinite' || val === '∞') {
            self.isInfinite(true);
        } else {
            self.isInfinite(false);
            self.targetCount(Number(val) || 33);
        }
    };

    self.setItem = function (item) {
        if (!item) {
            self.editingId(null);
            self.title('');
            self.targetCount(33);
            self.isInfinite(false);
            return;
        }
        var raw = (typeof item === 'function') ? item() : item;
        self.editingId(raw.id || null);
        self.title(raw.title || '');
        var inf = raw.targetCount === 'infinite' || raw.targetCount === '∞';
        self.isInfinite(inf);
        self.targetCount(inf ? '' : (parseInt(raw.targetCount, 10) || 33));
    };

    if (p.item) {
        if (k && k.isObservable(p.item)) {
            p.item.subscribe(function (newVal) {
                self.setItem(newVal);
            });
            self.setItem(p.item());
        } else {
            self.setItem(p.item);
        }
    }

    self.save = function () {
        var t = (self.title() || '').trim();
        if (!t) {
            if (_win.alert) _win.alert('Please enter a Dhikr title.');
            return;
        }

        var tCount = self.isInfinite()
            ? 'infinite'
            : Math.min(Math.max(parseInt(self.targetCount(), 10) || 33, 1), 9999);

        var data = {
            id: self.editingId(),
            title: t,
            targetCount: tCount
        };

        if (typeof p.onSave === 'function') {
            p.onSave(data);
        } else {
            saveDhikrItem(data);
        }

        self.close();
    };

    self.deleteItem = function () {
        var id = self.editingId();
        if (!id) return;

        confirmAction({
            title: 'Delete Dhikr',
            message: 'Are you sure you want to delete this Dhikr and its tracking history?',
            btnText: 'Delete',
            isSuccess: false
        }, function () {
            if (typeof p.onDelete === 'function') {
                p.onDelete(id);
            } else {
                deleteDhikrItem(id);
            }
            self.close();
        });
    };

    self.close = function () {
        if (typeof self.isOpen === 'function') {
            self.isOpen(false);
        }
        if (typeof p.onClose === 'function') {
            p.onClose();
        }
    };

    self.handleBackdropClick = function (d, e) {
        if (e && e.target && e.target.id === 'tasbeehModal') {
            self.close();
        }
    };
}

if (typeof window !== 'undefined') {
    window.CurrentFormViewModel = CurrentFormViewModel;
}

export default CurrentFormViewModel;

