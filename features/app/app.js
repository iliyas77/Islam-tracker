/* ============================================================
   Nur Prayer — Application Logic
   ============================================================ */

/* ---------- Constants ---------- */
var P = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
var K = 'namazTrackerData';
var OCK = 'namazOldData';
var FK = 'namazFontSize';
var SK = 'namazStartDate';
var OK = 'namazOldPeriod';

var T = {
    Fajr: '05:18 AM', Dhuhr: '12:24 PM', Asr: '04:37 PM',
    Maghrib: '06:15 PM', Isha: '07:28 PM'
};

var I = {
    Fajr: '<i class="fa-solid fa-sun" style="color:#f5b400"></i>',
    Dhuhr: '<i class="fa-solid fa-sun" style="color:#f5b400"></i>',
    Asr: '<i class="fa-solid fa-cloud-sun" style="color:#f5b400"></i>',
    Maghrib: '<i class="fa-solid fa-mountain-sun" style="color:#f5b400"></i>',
    Isha: '<i class="fa-solid fa-moon" style="color:#2563eb"></i>'
};

/* ---------- State ---------- */
var sd = td();
var sheet2BS;
var dashTimer = null;

/* ---------- Init ---------- */
document.addEventListener('DOMContentLoaded', function () {
    sheet2BS = new bootstrap.Offcanvas($('sheet2'));

    apFS(rdFS());
    en(td());
    sd = td();

    showPage('dashboard');

    /* Date picker */
    $('dp').onchange = function (e) { if (e.target.value) go(e.target.value); };

    /* Action buttons */
    $('currentActionBtn').onclick = openCal;
    $('oldActionBtn').onclick = rOldInfo;
});