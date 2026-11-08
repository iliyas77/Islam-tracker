/* ============================================================
   Nur Prayer — Dua All Form Component
   Path: features/dua/dua-all/dua-all-form/dua-all-form.js
   Responsibilities:
     - Add / Edit New Dua modal form
     - Validates number, surah, Telugu pronunciation, and meaning
     - Dispatches onSave and onClose callbacks
   ============================================================ */
'use strict';

import { unwrap } from '../../dua-service.js';

var _win = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : {});
var _ko = typeof ko !== 'undefined' ? ko : (_win.ko || null);

export const DuaAllFormTemplate = {
    element: 'dua-all-form-template',
    file: 'features/dua/dua-all/dua-all-form/dua-all-form.html'
};

export function DuaAllFormViewModel(params) {
    if (params instanceof DuaAllFormViewModel) return params;
    if (!(this instanceof DuaAllFormViewModel)) return new DuaAllFormViewModel(params);

    var p = (params && typeof params === 'function') ? params() : (params || {});
    var k = _ko;
    var self = this;

    function obs(val) {
        return (k && k.observable) ? k.observable(val) : function () { return val; };
    }

    self.isOpen = (p.isOpen && k && k.isObservable(p.isOpen)) ? p.isOpen : obs(unwrap(p.isOpen, false));

    self.number = obs(unwrap(p.nextNumber, 1));
    self.surah = obs('');
    self.uchcharana = obs('');
    self.ardham = obs('');
    self.errorMessage = obs('');

    self.reset = function () {
        self.surah('');
        self.uchcharana('');
        self.ardham('');
        self.errorMessage('');
    };

    self.handleSave = function (d, e) {
        if (e && e.stopPropagation) e.stopPropagation();
        var num = parseInt(self.number(), 10);
        var s = (self.surah() || '').trim();
        var u = (self.uchcharana() || '').trim();
        var a = (self.ardham() || '').trim();

        if (!num || isNaN(num)) {
            self.errorMessage('Please enter a valid Dua number.');
            return;
        }
        if (!s || !u || !a) {
            self.errorMessage('Please fill in all fields (Surah, Pronunciation, Meaning).');
            return;
        }

        var newDua = {
            number: num,
            surah_name: s,
            ayat_number: '',
            telugu_uchcharana: u,
            telugu_ardham: a,
            surah: s,
            uchcharana: u,
            ardham: a
        };

        var cb = p.onSave || p.onSaveDua;
        if (typeof cb === 'function') {
            cb(newDua);
        }

        self.reset();
        if (typeof self.isOpen === 'function') self.isOpen(false);
    };

    self.handleClose = function (d, e) {
        if (e && e.stopPropagation) e.stopPropagation();
        self.reset();
        if (typeof self.isOpen === 'function') self.isOpen(false);
        var cb = p.onClose;
        if (typeof cb === 'function') {
            cb();
        }
    };
}

if (typeof window !== 'undefined') {
    window.DuaAllFormViewModel = DuaAllFormViewModel;
}

export default {
    template: DuaAllFormTemplate,
    viewModel: DuaAllFormViewModel
};
