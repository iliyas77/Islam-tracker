/* ============================================================
   Nur Prayer — Dashboard Feature Module
   Path: features/dashboard/dashboard.js
   Matches the Reference UI Layout & Styling Pixel-Perfect
   ============================================================ */

function dashLiveHeaderTime() {
    var now = new Date();
    var h = now.getHours();
    var ap = h >= 12 ? 'PM' : 'AM';
    var hh = h % 12;
    if (hh === 0) hh = 12;
    return pad2(hh) + ':' + pad2(now.getMinutes()) + ' ' + ap;
}

function dashBigTimeHtml() {
    var now = new Date();
    var h = now.getHours();
    var ap = h >= 12 ? 'PM' : 'AM';
    var hh = h % 12;
    if (hh === 0) hh = 12;
    return '<span class="dash-clock-digits">' + pad2(hh) + ':' + pad2(now.getMinutes()) + ':' + pad2(now.getSeconds()) + '</span>' +
        '<span class="dash-clock-ampm">' + ap + '</span>';
}

function parseTimeToMin(timeStr) {
    if (!timeStr) return -1;
    var clean = timeStr.trim().split(' ');
    if (!clean[0]) return -1;
    var parts = clean[0].split(':');
    var h = parseInt(parts[0], 10);
    var m = parseInt(parts[1], 10);
    if (isNaN(h) || isNaN(m)) return -1;
    var ap = clean[1] || 'AM';
    if (ap === 'PM' && h < 12) h += 12;
    if (ap === 'AM' && h === 12) h = 0;
    return h * 60 + m;
}

var dashCurrentActivePrayer = null;
var dashLastCheckedDate = typeof td === 'function' ? td() : null;

/* ---------- Dashboard Clock ---------- */
function dashTick() {
    var curDate = typeof td === 'function' ? td() : null;
    if (curDate && dashLastCheckedDate && curDate !== dashLastCheckedDate) {
        dashLastCheckedDate = curDate;
        if (typeof ensureCurrentDateInitialized === 'function') {
            ensureCurrentDateInitialized();
        }
        if (typeof refreshPrayerTimesUI === 'function') {
            refreshPrayerTimesUI(curDate);
        }
    } else if (curDate && !dashLastCheckedDate) {
        dashLastCheckedDate = curDate;
    }

    var timeEl = $('dashTime');
    if (timeEl) {
        timeEl.innerHTML = dashBigTimeHtml();
    }

    var liveTimeEl = $('dashLiveTime');
    if (liveTimeEl) {
        liveTimeEl.textContent = dashLiveHeaderTime();
    }

    if (typeof getActivePrayerInfo === 'function') {
        var curActive = getActivePrayerInfo();
        if (dashCurrentActivePrayer && curActive && curActive.name !== dashCurrentActivePrayer) {
            rDashboard();
            return;
        }
    }
}

function startDashClock() {
    if (dashTimer) clearInterval(dashTimer);
    dashTick();
    dashTimer = setInterval(dashTick, 1000);
}

/* ---------- Timeline Prayer Statuses ---------- */
function getTimelinePrayerStatuses() {
    var now = new Date();
    var nowMin = now.getHours() * 60 + now.getMinutes();

    var fajrMin = parseTimeToMin(T.Fajr);
    var dhuhrMin = parseTimeToMin(T.Dhuhr);
    var asrMin = parseTimeToMin(T.Asr);
    var maghribMin = parseTimeToMin(T.Maghrib);
    var ishaMin = parseTimeToMin(T.Isha);

    var statuses = {};

    if (nowMin >= ishaMin || nowMin < fajrMin) {
        statuses.Fajr = nowMin >= ishaMin ? 'passed' : 'upcoming';
        statuses.Dhuhr = nowMin >= ishaMin ? 'passed' : 'upcoming';
        statuses.Asr = nowMin >= ishaMin ? 'passed' : 'upcoming';
        statuses.Maghrib = nowMin >= ishaMin ? 'passed' : 'upcoming';
        statuses.Isha = 'active';
    } else if (nowMin >= maghribMin && nowMin < ishaMin) {
        statuses.Fajr = 'passed';
        statuses.Dhuhr = 'passed';
        statuses.Asr = 'passed';
        statuses.Maghrib = 'active';
        statuses.Isha = 'next';
    } else if (nowMin >= asrMin && nowMin < maghribMin) {
        statuses.Fajr = 'passed';
        statuses.Dhuhr = 'passed';
        statuses.Asr = 'active';
        statuses.Maghrib = 'next';
        statuses.Isha = 'upcoming';
    } else if (nowMin >= dhuhrMin && nowMin < asrMin) {
        statuses.Fajr = 'passed';
        statuses.Dhuhr = 'active';
        statuses.Asr = 'next';
        statuses.Maghrib = 'upcoming';
        statuses.Isha = 'upcoming';
    } else {
        statuses.Fajr = 'active';
        statuses.Dhuhr = 'next';
        statuses.Asr = 'upcoming';
        statuses.Maghrib = 'upcoming';
        statuses.Isha = 'upcoming';
    }

    return statuses;
}

function getActivePrayerInfo() {
    var now = new Date();
    var nowMin = now.getHours() * 60 + now.getMinutes();
    var fajrMin = parseTimeToMin(T.Fajr);
    var statuses = getTimelinePrayerStatuses();
    var activeName = 'Fajr';
    for (var i = 0; i < P.length; i++) {
        if (statuses[P[i]] === 'active') {
            activeName = P[i];
            break;
        }
    }
    return {
        name: activeName,
        time: T[activeName] || '--:--',
        isYesterday: (activeName === 'Isha' && nowMin < fajrMin)
    };
}

/* ---------- Dedicated SVG Graphics matching Reference UI ---------- */
var DASH_SVG_MOSQUE_CLOCK =
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">' +
    '  <title>the-prophets-mosque</title>' +
    '  <g fill="none" stroke="#123D2E" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5">' +
    '    <path d="M3 22v-2.5c0-2.068.345-2.5 2-2.5h12c1.655 0 2 .432 2 2.5V22zm-1 0h20M17.513 6C15.97 4 18.339 3 19 2c.661 1 3.03 2 1.488 4z"/>' +
    '    <path d="M17.5 6L17 17m0 5h4l-.5-16M11 8c1.984 2.25 6 3 6 9H5c0-6 4.015-6.75 5.999-9"/>' +
    '  </g>' +
    '</svg>';

var DASH_SVG_MOSQUE_HEADER = DASH_SVG_MOSQUE_CLOCK;

var DASH_SVG_RUB_EL_HIZB =
    '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9bb8a9" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<rect x="4.2" y="4.2" width="15.6" height="15.6" rx="1.5"/>' +
    '<rect x="4.2" y="4.2" width="15.6" height="15.6" rx="1.5" transform="rotate(45 12 12)"/>' +
    '<circle cx="12" cy="12" r="3.2"/>' +
    '</svg>';

var DASH_SVG_TRACKER =
    '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48" aria-hidden="true">' +
    '  <title>prayer-times</title>' +
    '  <path fill="none" stroke="#123D2E" stroke-linecap="round" stroke-linejoin="round" d="M38.5 5.5h-29c-2.2 0-4 1.8-4 4v29c0 2.2 1.8 4 4 4h29c2.2 0 4-1.8 4-4v-29c0-2.2-1.8-4-4-4"/>' +
    '  <path fill="none" stroke="#123D2E" stroke-linecap="round" stroke-linejoin="round" d="M15.333 37C12.95 37 11 36.056 11 33.673V14c0-1.65 1.35-3 3-3h20c1.65 0 3 1.35 3 3v18.667A4.346 4.346 0 0 1 32.667 37v-1.526c-1.214-1.005-1.693-1.21-1.693-1.21s1.524-1.23 1.898-1.756c.816-1.15 2.863-6.045-1.469-9.095c-1.552-1.093-6.31-3.317-6.31-3.317c-1.036-2.482-1.128-3.545-1.093-6.172c.035 2.627-.057 3.69-1.094 6.172c0 0-4.756 2.224-6.309 3.317c-4.332 3.05-2.285 7.945-1.469 9.095c.374.527 1.898 1.756 1.898 1.756s-.479.205-1.692 1.21z"/>' +
    '</svg>';

var DASH_SVG_TASBEEH =
    '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">' +
    '  <title>prayer-beads</title>' +
    '  <path fill="#123D2E" d="M16.726 45.719a.963.963 0 0 0 1.304-.304a.9.9 0 0 0-.311-1.262a.97.97 0 0 0-1.305.3a.903.903 0 0 0 .312 1.266m44.799-25.408a2.4 2.4 0 0 0-.651-.581a.903.903 0 0 0 .646-1.358a.94.94 0 0 0-.471-.374c.25-.274.438-.597.533-.962c.158-.6.066-1.225-.256-1.76c-.404-.668-1.158-1.071-1.936-1.124a2.68 2.68 0 0 0-.307-3.531c-.936-.908-2.354-1.032-3.443-.411c.09-.158.154-.332.154-.526c0-.604-.49-1.094-1.094-1.094c-.082 0-.155.03-.232.047a2.2 2.2 0 0 0-.055-.938a2.34 2.34 0 0 0-1.164-1.404c-.797-.418-1.779-.311-2.504.17a.9.9 0 0 0 .047-.292c-.021-.507-.463-.898-.985-.878a.96.96 0 0 0-.567.23A2.375 2.375 0 0 0 47.008 4l-.108.002a2.4 2.4 0 0 0-1.679.768a2.3 2.3 0 0 0-.612 1.663c.017.355.12.684.279.979a.96.96 0 0 0-.629.135a.9.9 0 0 0-.363.48c-.789-.593-1.944-.696-2.803-.148a2.32 2.32 0 0 0-1.035 1.494c-.062.3-.061.602-.004.894a.96.96 0 0 0-1.008.375a.88.88 0 0 0-.145.574c-.963-.249-2.067.094-2.641.916a2.27 2.27 0 0 0-.368 1.741c.034.176.094.344.166.504a2.9 2.9 0 0 0-2.614.739a2.686 2.686 0 0 0 0 3.895l.01.008a1.084 1.084 0 0 0-.989 1.072c0 .105.032.201.061.297c-.968-.204-2.041.179-2.576 1.021a2.26 2.26 0 0 0-.297 1.753c.088.368.27.695.513.974a.93.93 0 0 0-.479.364a.88.88 0 0 0-.121.579c-.975-.212-2.06.173-2.599 1.021a2.27 2.27 0 0 0-.296 1.754c.088.367.27.694.514.973a.92.92 0 0 0-.48.366a.87.87 0 0 0-.12.578c-.976-.215-2.064.174-2.597 1.021a2.26 2.26 0 0 0-.299 1.757c.088.365.27.691.514.971a.9.9 0 0 0-.479.363a.9.9 0 0 0-.12.58c-.975-.215-2.063.174-2.598 1.021a2.26 2.26 0 0 0-.298 1.755c.088.367.27.693.513.973a.92.92 0 0 0-.479.365a.9.9 0 0 0 .309 1.262a.97.97 0 0 0 1.308-.302a.87.87 0 0 0 .119-.571a2.4 2.4 0 0 0 .561.076c.338 0 .656-.084.954-.209a2.3 2.3 0 0 0-.169.363a2.25 2.25 0 0 0-.093 1.068a.95.95 0 0 0-.611.058a.903.903 0 0 0-.438 1.227a.96.96 0 0 0 1.268.424a.93.93 0 0 0 .419-.422a2.4 2.4 0 0 0 1.724.722a2.4 2.4 0 0 0 1.044-.234a2.33 2.33 0 0 0 1.226-1.352c.121-.35.145-.713.094-1.068a.95.95 0 0 0 .611-.057a.9.9 0 0 0 .422-.424a2.44 2.44 0 0 0 1.723.725c.363 0 .715-.078 1.041-.234a2.34 2.34 0 0 0 1.229-1.354c.121-.349.145-.711.094-1.064c.2.041.413.035.613-.059a.93.93 0 0 0 .418-.422a2.44 2.44 0 0 0 2.767.49a2.34 2.34 0 0 0 1.226-1.351c.121-.35.145-.715.094-1.071c.16.033.327.042.495-.011a.93.93 0 0 0 .471-.359a2.41 2.41 0 0 0 1.937.96c.251 0 .502-.038.744-.115a2.36 2.36 0 0 0 1.402-1.187a2.25 2.25 0 0 0 .239-1.008c1.118.98 2.839.959 3.918-.086c.59-.57.856-1.33.819-2.079c.192.245.477.413.813.413c.413 0 .762-.244.933-.592a2.4 2.4 0 0 0 1.792.795q.453 0 .879-.163a2.35 2.35 0 0 0 1.326-1.267c.198-.461.23-.959.113-1.438a.96.96 0 0 0 .654-.181a.9.9 0 0 0 .322-.499a2.42 2.42 0 0 0 2.805-.057c.514-.382.841-.937.922-1.561c.046-.353 0-.702-.112-1.028c.492.03.934-.299 1.001-.783a.87.87 0 0 0-.124-.558c.996-.181 1.796-.97 1.938-1.977a2.3 2.3 0 0 0-.457-1.706M24.238 37.407c-.393.614-1.293.824-1.938.441a1.33 1.33 0 0 1-.625-.839a1.28 1.28 0 0 1 .17-.995a1.4 1.4 0 0 1 1.197-.645c.26 0 .516.07.737.202c.319.19.542.489.626.841c.083.343.022.696-.167.995m33.666-21.274c.092-.35.321-.645.645-.829c.216-.122.461-.186.71-.186c.5 0 .966.257 1.216.669c.184.304.235.658.146.998a1.34 1.34 0 0 1-.645.828c-.651.366-1.551.136-1.926-.482a1.34 1.34 0 0 1-.146-.998m-7.025-8.417a1.42 1.42 0 0 1 1.238-.708c.232 0 .465.057.669.164c.331.175.571.463.674.811c.101.336.06.692-.113 1.001c-.353.63-1.243.887-1.905.54a1.34 1.34 0 0 1-.675-.808a1.28 1.28 0 0 1 .112-1m-4.926-2.274c.254-.274.604-.434 1.055-.451c.75 0 1.361.563 1.395 1.282a1.3 1.3 0 0 1-.349.944a1.48 1.48 0 0 1-1.021.453c-.752 0-1.397-.563-1.431-1.281c-.014-.349.11-.685.351-.947m-4.92 4.13c.072-.354.285-.659.597-.858c.23-.147.498-.225.774-.225c.476 0 .916.227 1.176.607c.201.294.272.646.201.991a1.33 1.33 0 0 1-.596.856c-.631.4-1.543.219-1.951-.378c-.201-.295-.272-.648-.201-.993m-3.954 3.124a1.42 1.42 0 0 1 1.17-.598c.279 0 .551.079.783.229c.312.203.521.508.591.862c.068.346-.007.698-.211.99c-.416.596-1.33.771-1.953.367a1.34 1.34 0 0 1-.59-.865a1.3 1.3 0 0 1 .21-.985m-6.288 9.244a1.4 1.4 0 0 1 1.195-.645c.26 0 .516.07.74.205c.321.189.543.488.627.84c.081.341.021.692-.17.991c-.392.618-1.29.828-1.937.442a1.34 1.34 0 0 1-.626-.841a1.28 1.28 0 0 1 .171-.992m-2.984 4.692a1.41 1.41 0 0 1 1.2-.645c.26 0 .516.069.736.2c.319.191.542.49.626.842c.081.342.021.696-.17.995c-.391.615-1.292.824-1.933.442a1.34 1.34 0 0 1-.629-.841a1.3 1.3 0 0 1 .17-.993m-2.979 4.689a1.4 1.4 0 0 1 1.195-.643c.261 0 .516.07.738.203c.32.189.543.488.626.84a1.28 1.28 0 0 1-.17.994c-.39.615-1.286.826-1.933.441a1.33 1.33 0 0 1-.629-.838c-.08-.34-.02-.694.173-.997m2.593 9.041a1.34 1.34 0 0 1-.711.779c-.688.325-1.551.035-1.881-.621a1.27 1.27 0 0 1-.067-1a1.34 1.34 0 0 1 .714-.779q.293-.139.617-.14c.533 0 1.029.298 1.261.759c.158.315.183.671.067 1.002m5.12-2.412a1.35 1.35 0 0 1-.715.782c-.678.319-1.552.026-1.877-.62a1.28 1.28 0 0 1-.067-1.003c.118-.344.37-.621.71-.78c.195-.092.404-.14.619-.14c.543 0 1.027.292 1.264.759c.157.315.181.67.066 1.002m5.117-2.406c-.12.344-.372.619-.71.777c-.681.32-1.556.027-1.88-.62a1.27 1.27 0 0 1-.067-1.003c.119-.344.371-.619.712-.779a1.44 1.44 0 0 1 .619-.139c.533 0 1.027.297 1.26.758c.158.316.181.673.066 1.006m5.196-1.906c-.166.33-.457.574-.818.689c-.729.229-1.54-.168-1.773-.857a1.28 1.28 0 0 1 .072-1.001c.166-.327.457-.569.82-.685a1.5 1.5 0 0 1 .441-.068c.607 0 1.143.371 1.33.923c.112.331.087.686-.072.999m10.691-3.93a1.36 1.36 0 0 1-.77.732c-.713.272-1.549-.078-1.828-.754a1.28 1.28 0 0 1 .008-1.002c.146-.336.418-.596.771-.73a1.5 1.5 0 0 1 .523-.098c.58 0 1.091.333 1.303.848c.135.324.132.682-.007 1.004m4.215-2.577c-.596.444-1.516.327-1.973-.248a1.3 1.3 0 0 1-.276-.976c.046-.355.233-.672.528-.892a1.43 1.43 0 0 1 .862-.284c.44 0 .846.191 1.112.527c.225.281.322.628.277.978a1.32 1.32 0 0 1-.53.895m.558-2.917c-.834-.582-2.035-.617-2.875.009a2.3 2.3 0 0 0-.919 1.559c-.047.368.005.729.13 1.068a.96.96 0 0 0-.588.177a.9.9 0 0 0-.291.401c-.656-.524-1.582-.716-2.407-.398a2.34 2.34 0 0 0-1.325 1.263a2.2 2.2 0 0 0-.17 1.008a1 1 0 0 0-.344-.069c-.492 0-.887.348-.998.806a2.7 2.7 0 0 0-.634-.938a2.91 2.91 0 0 0-4.026 0c-.6.58-.863 1.354-.816 2.113a2.42 2.42 0 0 0-2.202-.372a2.35 2.35 0 0 0-1.405 1.181c-.168.33-.24.687-.239 1.044a.95.95 0 0 0-.614-.024a.95.95 0 0 0-.553.461a2.4 2.4 0 0 0-1.709-.713c-.365 0-.717.08-1.043.236a2.32 2.32 0 0 0-1.228 1.35a2.25 2.25 0 0 0-.095 1.068a.95.95 0 0 0-.612.057a.92.92 0 0 0-.425.432c-.701-.695-1.826-.938-2.762-.498a2.33 2.33 0 0 0-1.227 1.354a2.24 2.24 0 0 0-.092 1.066a.96.96 0 0 0-.611.058a.92.92 0 0 0-.422.423a2.4 2.4 0 0 0-1.723-.723c-.332 0-.652.074-.953.204a2.26 2.26 0 0 0 .232-1.632a2.3 2.3 0 0 0-.512-.973a.93.93 0 0 0 .478-.364a.86.86 0 0 0 .12-.57c.184.044.371.075.561.075c.836 0 1.599-.412 2.038-1.104c.336-.527.442-1.15.298-1.755a2.3 2.3 0 0 0-.514-.974a.93.93 0 0 0 .479-.365a.86.86 0 0 0 .121-.57c.184.045.37.076.561.076c.837 0 1.598-.413 2.037-1.104c.335-.527.44-1.15.297-1.755a2.3 2.3 0 0 0-.511-.974a.9.9 0 0 0 .477-.364a.88.88 0 0 0 .121-.57c.184.043.371.076.563.076c.836 0 1.598-.414 2.038-1.106c.336-.525.44-1.147.297-1.751a2.3 2.3 0 0 0-.516-.976l.002-.001c.481-.114.848-.527.848-1.044q-.002-.226-.086-.423c.988.314 2.114.104 2.901-.656a2.685 2.685 0 0 0 .462-3.288c.104.014.205.045.313.045c.795 0 1.537-.383 1.985-1.024A2.27 2.27 0 0 0 40.599 13a2.3 2.3 0 0 0-.472-.989a.93.93 0 0 0 .495-.343c.045-.065.063-.138.089-.208c.445.438 1.047.7 1.696.7c.466 0 .921-.131 1.313-.38c.54-.345.907-.875 1.035-1.493a2.26 2.26 0 0 0-.049-1.073a.95.95 0 0 0 .598-.133a.9.9 0 0 0 .409-.785c.372.231.814.366 1.29.366l.102-.002a2.4 2.4 0 0 0 1.68-.773c.252-.272.42-.596.518-.94a.96.96 0 0 0 .582.183c.087-.004.163-.034.241-.058c-.037.055-.081.103-.114.161a2.26 2.26 0 0 0-.197 1.766c.18.605.594 1.104 1.164 1.402c.348.183.739.28 1.133.28c.595 0 1.146-.226 1.576-.597c.16.406.551.695 1.014.695c.097 0 .184-.031.272-.055a2.68 2.68 0 0 0 .085 3.791a2.88 2.88 0 0 0 2.131.797a2.3 2.3 0 0 0-.246.572a2.26 2.26 0 0 0 .256 1.759a2.42 2.42 0 0 0 2.065 1.148c.173 0 .343-.03.51-.065a.88.88 0 0 0 .108.575c.025.043.066.069.099.106c-.02-.003-.037-.011-.056-.013c-1.325-.173-2.518.744-2.691 1.995a2.27 2.27 0 0 0 .447 1.701c.234.309.541.54.886.701a.9.9 0 0 0-.25.423m1.1-1.183a1.4 1.4 0 0 1-.943-.54a1.28 1.28 0 0 1-.256-.966c.092-.662.688-1.162 1.385-1.162q.096 0 .193.013c.379.05.712.24.938.536c.215.28.306.625.258.97c-.1.722-.813 1.251-1.575 1.149"/>' +
    '  <path fill="#123D2E" d="M17.954 40.452a2.685 2.685 0 0 0-.001 3.893a2.915 2.915 0 0 0 4.025.001a2.69 2.69 0 0 0 0-3.894a2.91 2.91 0 0 0-4.024 0m-1.645 5.367c-.165-.159.218-1.088-.393-1.678c-.601-.582-1.647-.438-2.23.357c-.206.283-.495.912-.603 1.23c-.19.57-.368 1.722-.333 2.528c-.146-.035-.29-.073-.458-.073c-.841 0-1.85.438-2.265.845l-.358.353l.377.372c-1.676 1.12-5.625 3.842-7.937 6.117a.36.36 0 0 0 0 .518c.145.142.38.142.525 0c1.585-1.56 4.021-3.378 5.898-4.7c-2.243 1.885-5.218 4.399-5.711 4.883a.363.363 0 0 0 0 .518c.145.145.38.145.525 0c.411-.403 2.71-2.354 4.774-4.091c-1.824 1.758-3.871 3.703-4.558 4.247a.366.366 0 0 0-.056.518c.009.008.017.02.026.027c.133.13.347.145.496.027c.65-.518 2.419-2.189 4.115-3.818c-1.707 1.85-3.343 3.568-3.856 3.938a.362.362 0 0 0-.042.554a.374.374 0 0 0 .482.035c.576-.417 2.31-2.242 3.961-4.033c-1.565 1.914-3.097 3.701-3.695 4.15a.36.36 0 0 0-.069.512q.015.02.032.037c.13.127.338.145.488.031c.915-.688 3.572-3.937 5.353-6.168c-1.26 1.855-3.215 4.437-5.128 6.32a.36.36 0 0 0 0 .517c.145.144.38.144.525 0c2.445-2.406 5.059-6.045 6.152-7.872l.273.27l.35-.345c.416-.411.861-1.407.861-2.239c0-.164-.039-.303-.073-.443c.834.039 2.048-.135 2.643-.32c.328-.105.981-.387 1.27-.584c.823-.565.967-1.581.368-2.162c-.527-.512-1.576-.229-1.729-.378m-3.692 4.806c-.018-.006-.036-.004-.055-.009a.37.37 0 0 0-.137-.225a.34.34 0 0 0-.153-.064a.32.32 0 0 0-.117-.205a.36.36 0 0 0-.177-.078c-.014-.072-.041-.137-.095-.191s-.124-.082-.194-.095a.34.34 0 0 0-.075-.169a.35.35 0 0 0-.209-.117c-.006-.032-.023-.063-.039-.093c.507-.185 1.172-.27 1.357-.088c.074.073.115.22.115.415c-.001.295-.101.627-.221.919"/>' +
    '</svg>';

var DASH_SVG_DUAS =
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">' +
    '  <title>places-praying-room</title>' +
    '  <path fill="none" stroke="#123D2E" d="m17 9l-4.25 4.5h-.25l-1.5-6h-.5a3 3 0 0 0-3 3V17c5.5 0 9 2.5 9 3.5H7m6-10.882L15 7.5m-15 16h24m-12.445-18s1.81-.557 2.135-1.776a1.77 1.77 0 0 0-1.242-2.163a1.75 1.75 0 0 0-2.145 1.25c-.325 1.219.961 2.61.961 2.61z"/>' +
    '</svg>';

var DASH_SVG_SETTINGS =
    '<svg width="26" height="26" viewBox="0 0 24 24" fill="#123D2E" aria-hidden="true">' +
    '<path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.49.49 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54A.48.48 0 0 0 14 2.3h-4a.48.48 0 0 0-.48.41l-.38 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.62 8.77c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.07.63-.07.94s.02.64.07.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h4c.24 0 .44-.17.48-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>' +
    '</svg>';

var DASH_SVG_CHEVRON =
    '<svg class="dash-nav-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9bb8a9" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="m9 18 6-6-6-6"/>' +
    '</svg>';

var TIMELINE_ICONS = (window.CONSTANTS && window.CONSTANTS.DASHBOARD && window.CONSTANTS.DASHBOARD.TIMELINE_ICONS) || window.TIMELINE_ICONS || {};

/* ---------- Dashboard Render ---------- */
function rDashboard() {
    var body = $('dashBody');
    if (!body) return;

    var activeP = typeof getActivePrayerInfo === 'function' ? getActivePrayerInfo() : {
        name: 'Fajr',
        time: T.Fajr,
        isYesterday: false
    };
    dashCurrentActivePrayer = activeP.name;

    var cfg = typeof getPrayerConfig === 'function' ? getPrayerConfig() : { city: 'Guntur', school: 1 };

    var statuses = getTimelinePrayerStatuses();
    var timelineNodesHtml = P.map(function (p) {
        var st = statuses[p] || 'upcoming';
        var isActive = st === 'active';
        var circleClass = isActive ? 'dash-timeline-circle active' : 'dash-timeline-circle';
        var dotHtml = isActive
            ? '<div class="dash-timeline-dot-active" data-ref="page.dashboard.timeline.dot.' + p.toLowerCase() + '"><div class="dash-timeline-dot-active-inner"></div></div>'
            : '<div class="dash-timeline-dot" data-ref="page.dashboard.timeline.dot.' + p.toLowerCase() + '"></div>';

        var badgeClass = st === 'active' ? 'badge-active'
            : (st === 'passed' ? 'badge-passed'
                : (st === 'next' ? 'badge-next' : 'badge-upcoming'));
        var badgeText = st === 'active' ? 'Active'
            : (st === 'passed' ? 'Passed'
                : (st === 'next' ? 'Next' : 'Upcoming'));

        var prayerIcon = TIMELINE_ICONS[p] || '';

        return '<div class="dash-timeline-col" data-ref="page.dashboard.timeline.item.' + p.toLowerCase() + '">' +
            '  <div class="' + circleClass + '" data-ref="page.dashboard.timeline.icon.' + p.toLowerCase() + '">' +
            prayerIcon +
            '  </div>' +
            '  <div class="dash-timeline-dot-wrap" data-ref="page.dashboard.timeline.dot-wrap.' + p.toLowerCase() + '">' +
            dotHtml +
            '  </div>' +
            '  <div class="dash-timeline-name" data-ref="page.dashboard.timeline.name.' + p.toLowerCase() + '">' + p + '</div>' +
            '  <div class="dash-timeline-time" data-ref="page.dashboard.timeline.time.' + p.toLowerCase() + '">' + (T[p] || '--:--') + '</div>' +
            '  <span class="dash-timeline-badge ' + badgeClass + '" data-ref="page.dashboard.timeline.badge.' + p.toLowerCase() + '">' + badgeText + '</span>' +
            '</div>';
    }).join('');

    body.innerHTML =
        '<div class="dash-container" data-ref="page.dashboard.container">' +
        '  <!-- Background Islamic Geometric Watermark -->' +
        '  <div class="dash-bg-pattern-top" aria-hidden="true">' +
        '    <svg class="dash-corner-pattern dash-corner-tl" viewBox="0 0 160 120" fill="none" stroke="#123D2E" stroke-width="1.2">' +
        '      <path d="M 0,0 L 40,0 L 60,20 L 60,60 L 40,80 L 0,80 Z"/>' +
        '      <path d="M 20,0 L 40,20 L 20,40 L 0,20 Z"/>' +
        '      <path d="M 60,20 L 80,0 L 100,20 L 80,40 Z"/>' +
        '      <path d="M 40,40 L 60,60 L 40,80 L 20,60 Z"/>' +
        '      <polygon points="60,35 66,49 80,46 72,58 80,70 66,67 60,81 54,67 40,70 48,58 40,46 54,49"/>' +
        '      <polygon points="120,35 126,49 140,46 132,58 140,70 126,67 120,81 114,67 100,70 108,58 100,46 114,49"/>' +
        '      <circle cx="60" cy="58" r="8"/>' +
        '      <circle cx="120" cy="58" r="8"/>' +
        '      <line x1="0" y1="20" x2="160" y2="20"/>' +
        '      <line x1="0" y1="58" x2="160" y2="58"/>' +
        '      <line x1="0" y1="96" x2="160" y2="96"/>' +
        '      <line x1="60" y1="0" x2="60" y2="120"/>' +
        '      <line x1="120" y1="0" x2="120" y2="120"/>' +
        '    </svg>' +
        '    <svg class="dash-corner-pattern dash-corner-tr" viewBox="0 0 160 120" fill="none" stroke="#123D2E" stroke-width="1.2">' +
        '      <path d="M 0,0 L 40,0 L 60,20 L 60,60 L 40,80 L 0,80 Z"/>' +
        '      <path d="M 20,0 L 40,20 L 20,40 L 0,20 Z"/>' +
        '      <path d="M 60,20 L 80,0 L 100,20 L 80,40 Z"/>' +
        '      <path d="M 40,40 L 60,60 L 40,80 L 20,60 Z"/>' +
        '      <polygon points="60,35 66,49 80,46 72,58 80,70 66,67 60,81 54,67 40,70 48,58 40,46 54,49"/>' +
        '      <polygon points="120,35 126,49 140,46 132,58 140,70 126,67 120,81 114,67 100,70 108,58 100,46 114,49"/>' +
        '      <circle cx="60" cy="58" r="8"/>' +
        '      <circle cx="120" cy="58" r="8"/>' +
        '      <line x1="0" y1="20" x2="160" y2="20"/>' +
        '      <line x1="0" y1="58" x2="160" y2="58"/>' +
        '      <line x1="0" y1="96" x2="160" y2="96"/>' +
        '      <line x1="60" y1="0" x2="60" y2="120"/>' +
        '      <line x1="120" y1="0" x2="120" y2="120"/>' +
        '    </svg>' +
        '  </div>' +
        '' +
        '  <!-- Top Header Bar: Location & Mosque Silhouette -->' +
        '  <header class="dash-top-header" data-ref="page.dashboard.header">' +
        '    <div class="dash-location-text" data-ref="page.dashboard.header.location">' +
        '      <i class="fa-solid fa-location-dot dash-location-icon" data-ref="page.dashboard.header.location-icon"></i>' +
        '      <span data-ref="page.dashboard.header.location-text">' + cfg.city + ' &bull; ' + (cfg.school === 1 ? 'Hanafi' : 'Shafi') + '</span>' +
        '    </div>' +
        '    <div class="dash-header-mosque" data-ref="page.dashboard.header.mosque-icon">' +
        '      ' + DASH_SVG_MOSQUE_HEADER +
        '    </div>' +
        '  </header>' +
        '' +
        '  <!-- 1. Digital Clock Card -->' +
        '  <div class="dash-clock-card" data-ref="page.dashboard.clock-card">' +
        '    <div class="dash-clock-left" data-ref="page.dashboard.clock-card.left-icon">' +
        '      ' + DASH_SVG_MOSQUE_CLOCK +
        '    </div>' +
        '    <div class="dash-clock-wrap" id="dashTime" data-ref="page.dashboard.clock-card.time">' +
        '      ' + dashBigTimeHtml() +
        '    </div>' +
        '    <div class="dash-clock-right" data-ref="page.dashboard.clock-card.right-icon">' +
        '      ' + DASH_SVG_RUB_EL_HIZB +
        '    </div>' +
        '  </div>' +
        '' +
        '  <!-- 2. Daily Prayer Timeline Card -->' +
        '  <div class="dash-timeline-card" data-ref="page.dashboard.timeline-card">' +
        '    <div class="dash-timeline-header" data-ref="page.dashboard.timeline.header">' +
        '      <span class="dash-timeline-title" data-ref="page.dashboard.timeline.title">DAILY PRAYER TIMELINE</span>' +
        '      <div class="dash-timeline-header-line" data-ref="page.dashboard.timeline.line"></div>' +
        '    </div>' +
        '    <div class="dash-timeline-track" data-ref="page.dashboard.timeline.track">' +
        '      <div class="dash-timeline-track-line" data-ref="page.dashboard.timeline.track-line"></div>' +
        '      <div class="dash-timeline-nodes" data-ref="page.dashboard.timeline.nodes">' +
        '        ' + timelineNodesHtml +
        '      </div>' +
        '    </div>' +
        '  </div>' +
        '' +
        '  <!-- 3. 2x2 Quick Navigation Cards Grid -->' +
        '  <div class="dash-grid-2x2" data-ref="page.dashboard.nav-grid">' +
        '    <!-- Tracker -->' +
        '    <div class="dash-nav-card" role="button" tabindex="0" data-act="goto-tracker" data-ref="page.dashboard.card.tracker">' +
        '      <div class="dash-nav-icon-circle" data-ref="page.dashboard.card.tracker-icon">' +
        '        ' + DASH_SVG_TRACKER +
        '      </div>' +
        '      <div class="dash-nav-footer">' +
        '        <span class="dash-nav-title" data-ref="page.dashboard.card.tracker-label">Tracker</span>' +
        '        ' + DASH_SVG_CHEVRON +
        '      </div>' +
        '    </div>' +
        '    <!-- Tasbeeh -->' +
        '    <div class="dash-nav-card" role="button" tabindex="0" data-act="goto-tasbeeh" data-ref="page.dashboard.card.tasbeeh">' +
        '      <div class="dash-nav-icon-circle" data-ref="page.dashboard.card.tasbeeh-icon">' +
        '        ' + DASH_SVG_TASBEEH +
        '      </div>' +
        '      <div class="dash-nav-footer">' +
        '        <span class="dash-nav-title" data-ref="page.dashboard.card.tasbeeh-label">Tasbeeh</span>' +
        '        ' + DASH_SVG_CHEVRON +
        '      </div>' +
        '    </div>' +
        '    <!-- Duas -->' +
        '    <div class="dash-nav-card" role="button" tabindex="0" data-act="goto-duas" data-ref="page.dashboard.card.duas">' +
        '      <div class="dash-nav-icon-circle" data-ref="page.dashboard.card.duas-icon">' +
        '        ' + DASH_SVG_DUAS +
        '      </div>' +
        '      <div class="dash-nav-footer">' +
        '        <span class="dash-nav-title" data-ref="page.dashboard.card.duas-label">Duas</span>' +
        '        ' + DASH_SVG_CHEVRON +
        '      </div>' +
        '    </div>' +
        '    <!-- Settings -->' +
        '    <div class="dash-nav-card" role="button" tabindex="0" data-act="goto-settings" data-ref="page.dashboard.card.settings">' +
        '      <div class="dash-nav-icon-circle" data-ref="page.dashboard.card.settings-icon">' +
        '        ' + DASH_SVG_SETTINGS +
        '      </div>' +
        '      <div class="dash-nav-footer">' +
        '        <span class="dash-nav-title" data-ref="page.dashboard.card.settings-label">Settings</span>' +
        '        ' + DASH_SVG_CHEVRON +
        '      </div>' +
        '    </div>' +
        '  </div>' +
        '' +
        '  <!-- 4. Bottom Decorative Divider -->' +
        '  <div class="dash-bottom-divider" data-ref="page.dashboard.bottom-divider">' +
        '    <div class="dash-bottom-line"></div>' +
        '    <div class="dash-bottom-star">' + DASH_SVG_RUB_EL_HIZB + '</div>' +
        '    <div class="dash-bottom-line"></div>' +
        '  </div>' +
        '</div>';

    startDashClock();
}
