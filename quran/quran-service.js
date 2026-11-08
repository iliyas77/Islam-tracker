/* ============================================================
   Nur Prayer — Quran Service & Utility Layer
   Path: quran/quran-service.js
   Responsibilities:
     - Centralizes all Quran metadata, Arabic names, and remote JSON data fetching
     - In-memory cache for surah ayahs and network error handling
     - Bookmarks storage, state management, and persistence (localStorage)
     - Footnotes processing and anchor linking for Telugu translations
     - Audio playback management for individual ayahs
     - Reactive state helpers, reading history, and search filtering
   ============================================================ */
'use strict';

var _win = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : {});
var _ko = typeof ko !== 'undefined' ? ko : (_win.ko || null);

export const RAW_BASE = 'https://raw.githubusercontent.com/iliyas77/data.github.io/main/telugu_quran/';
export const BOOKMARKS_STORAGE_KEY = 'nurQuranBookmarks';
export const LAST_READ_STORAGE_KEY = 'nurQuranLastRead';

/* ---------- 114 Surah Metadata ---------- */
export const SURAH_META = [
    { n: 1,   name: 'అల్-ఫాతిహా',           meaning: 'ప్రారంభం',                     revelation: 'Makkah',  ayahs: 7   },
    { n: 2,   name: 'అల్-బఖరా',             meaning: 'గోవు',                         revelation: 'Madinah', ayahs: 286 },
    { n: 3,   name: 'ఆల్-ఇమ్రాన్',           meaning: 'ఇమ్రాన్ కుటుంబం',               revelation: 'Madinah', ayahs: 200 },
    { n: 4,   name: 'అన్-నిసా',              meaning: 'మహిళలు',                       revelation: 'Madinah', ayahs: 176 },
    { n: 5,   name: 'అల్-మాయిదా',            meaning: 'విందు',                        revelation: 'Madinah', ayahs: 120 },
    { n: 6,   name: 'అల్-అన్ఆమ్',            meaning: 'పశువులు',                       revelation: 'Makkah',  ayahs: 165 },
    { n: 7,   name: 'అల్-అఆరాఫ్',            meaning: 'ఎత్తైన ప్రదేశాలు',              revelation: 'Makkah',  ayahs: 206 },
    { n: 8,   name: 'అల్-అన్ఫాల్',           meaning: 'యుద్ధ విజయాలు',                 revelation: 'Madinah', ayahs: 75  },
    { n: 9,   name: 'అత్-తౌబా',              meaning: 'పశ్చాత్తాపం',                   revelation: 'Madinah', ayahs: 129 },
    { n: 10,  name: 'యూనుస్',                meaning: 'యూనుస్',                       revelation: 'Makkah',  ayahs: 109 },
    { n: 11,  name: 'హూద్',                  meaning: 'హూద్',                         revelation: 'Makkah',  ayahs: 123 },
    { n: 12,  name: 'యూసుఫ్',                meaning: 'యూసుఫ్',                       revelation: 'Makkah',  ayahs: 111 },
    { n: 13,  name: 'అర్-రఅద్',              meaning: 'ఉరుము',                        revelation: 'Madinah', ayahs: 43  },
    { n: 14,  name: 'ఇబ్రాహీమ్',            meaning: 'ఇబ్రాహీమ్',                    revelation: 'Makkah',  ayahs: 52  },
    { n: 15,  name: 'అల్-హిజ్ర్',            meaning: 'రాతి భూమి',                    revelation: 'Makkah',  ayahs: 99  },
    { n: 16,  name: 'అన్-నహల్',              meaning: 'తేనెటీగ',                       revelation: 'Makkah',  ayahs: 128 },
    { n: 17,  name: 'అల్-ఇస్రా',             meaning: 'రాత్రి ప్రయాణం',                revelation: 'Makkah',  ayahs: 111 },
    { n: 18,  name: 'అల్-కహ్ఫ్',             meaning: 'గుహ',                          revelation: 'Makkah',  ayahs: 110 },
    { n: 19,  name: 'మర్యమ్',                meaning: 'మర్యమ్',                       revelation: 'Makkah',  ayahs: 98  },
    { n: 20,  name: 'తా-హా',                 meaning: 'తా-హా',                        revelation: 'Makkah',  ayahs: 135 },
    { n: 21,  name: 'అల్-అంబియా',            meaning: 'ప్రవక్తలు',                     revelation: 'Makkah',  ayahs: 112 },
    { n: 22,  name: 'అల్-హజ్',               meaning: 'హజ్ యాత్ర',                     revelation: 'Madinah', ayahs: 78  },
    { n: 23,  name: 'అల్-ముమినూన్',          meaning: 'విశ్వాసులు',                    revelation: 'Makkah',  ayahs: 118 },
    { n: 24,  name: 'అన్-నూర్',              meaning: 'కాంతి',                        revelation: 'Madinah', ayahs: 64  },
    { n: 25,  name: 'అల్-ఫుర్ఖాన్',          meaning: 'సత్య-అసత్య వివేచన',            revelation: 'Makkah',  ayahs: 77  },
    { n: 26,  name: 'అష్-షుఅరా',             meaning: 'కవులు',                        revelation: 'Makkah',  ayahs: 227 },
    { n: 27,  name: 'అన్-నమ్ల్',             meaning: 'చీమలు',                        revelation: 'Makkah',  ayahs: 93  },
    { n: 28,  name: 'అల్-ఖసస్',              meaning: 'కథలు',                         revelation: 'Makkah',  ayahs: 88  },
    { n: 29,  name: 'అల్-అన్కబూత్',          meaning: 'సాలెపురుగు',                   revelation: 'Makkah',  ayahs: 69  },
    { n: 30,  name: 'అర్-రూమ్',              meaning: 'రోమ్ సామ్రాజ్యం',               revelation: 'Makkah',  ayahs: 60  },
    { n: 31,  name: 'లుఖ్మాన్',              meaning: 'లుఖ్మాన్',                     revelation: 'Makkah',  ayahs: 34  },
    { n: 32,  name: 'అస్-సజ్దా',             meaning: 'సాష్టాంగ ప్రణామం',             revelation: 'Makkah',  ayahs: 30  },
    { n: 33,  name: 'అల్-అహ్జాబ్',           meaning: 'సైన్యాలు',                     revelation: 'Madinah', ayahs: 73  },
    { n: 34,  name: 'సబా',                   meaning: 'సబా రాజ్యం',                   revelation: 'Makkah',  ayahs: 54  },
    { n: 35,  name: 'ఫాతిర్',                meaning: 'సృష్టికర్త',                   revelation: 'Makkah',  ayahs: 45  },
    { n: 36,  name: 'యా-సీన్',               meaning: 'యా-సీన్',                      revelation: 'Makkah',  ayahs: 83  },
    { n: 37,  name: 'అస్-సాఫ్ఫాత్',          meaning: 'వరుసలు కట్టినవారు',             revelation: 'Makkah',  ayahs: 182 },
    { n: 38,  name: 'సాద్',                  meaning: 'సాద్',                         revelation: 'Makkah',  ayahs: 88  },
    { n: 39,  name: 'అజ్-జుమర్',             meaning: 'గుంపులు',                      revelation: 'Makkah',  ayahs: 75  },
    { n: 40,  name: 'గాఫిర్',                meaning: 'క్షమించేవాడు',                 revelation: 'Makkah',  ayahs: 85  },
    { n: 41,  name: 'ఫుస్సిలత్',             meaning: 'వివరించబడినవి',                revelation: 'Makkah',  ayahs: 54  },
    { n: 42,  name: 'అష్-షూరా',              meaning: 'సలహా',                         revelation: 'Makkah',  ayahs: 53  },
    { n: 43,  name: 'అజ్-జుఖ్రుఫ్',          meaning: 'బంగారు అలంకారాలు',              revelation: 'Makkah',  ayahs: 89  },
    { n: 44,  name: 'అద్-దుఖాన్',            meaning: 'పొగ',                          revelation: 'Makkah',  ayahs: 59  },
    { n: 45,  name: 'అల్-జాసియా',            meaning: 'మోకాళ్లపై కూర్చున్నది',         revelation: 'Makkah',  ayahs: 37  },
    { n: 46,  name: 'అల్-అహ్కాఫ్',           meaning: 'ఇసుక దిబ్బలు',                 revelation: 'Makkah',  ayahs: 35  },
    { n: 47,  name: 'ముహమ్మద్',              meaning: 'ముహమ్మద్',                     revelation: 'Madinah', ayahs: 38  },
    { n: 48,  name: 'అల్-ఫత్హ్',             meaning: 'విజయం',                        revelation: 'Madinah', ayahs: 29  },
    { n: 49,  name: 'అల్-హుజురాత్',          meaning: 'గదులు',                        revelation: 'Madinah', ayahs: 18  },
    { n: 50,  name: 'ఖాఫ్',                  meaning: 'ఖాఫ్',                         revelation: 'Makkah',  ayahs: 45  },
    { n: 51,  name: 'అజ్-జారియాత్',          meaning: 'చెదరగొట్టే గాలులు',             revelation: 'Makkah',  ayahs: 60  },
    { n: 52,  name: 'అత్-తూర్',              meaning: 'పర్వతం',                       revelation: 'Makkah',  ayahs: 49  },
    { n: 53,  name: 'అన్-నజ్మ్',             meaning: 'నక్షత్రం',                     revelation: 'Makkah',  ayahs: 62  },
    { n: 54,  name: 'అల్-ఖమర్',              meaning: 'చంద్రుడు',                     revelation: 'Makkah',  ayahs: 55  },
    { n: 55,  name: 'అర్-రహ్మాన్',           meaning: 'అనంత కరుణామయుడు',              revelation: 'Madinah', ayahs: 78  },
    { n: 56,  name: 'అల్-వాఖిఆ',             meaning: 'తప్పనిసరి సంఘటన',              revelation: 'Makkah',  ayahs: 96  },
    { n: 57,  name: 'అల్-హదీద్',             meaning: 'ఇనుము',                        revelation: 'Madinah', ayahs: 29  },
    { n: 58,  name: 'అల్-ముజాదిలా',          meaning: 'వాదించే స్త్రీ',                revelation: 'Madinah', ayahs: 22  },
    { n: 59,  name: 'అల్-హష్ర్',             meaning: 'బహిష్కరణ',                     revelation: 'Madinah', ayahs: 24  },
    { n: 60,  name: 'అల్-ముంతహినా',          meaning: 'పరీక్షించబడిన స్త్రీ',          revelation: 'Madinah', ayahs: 13  },
    { n: 61,  name: 'అస్-సఫ్',               meaning: 'వరుస',                         revelation: 'Madinah', ayahs: 14  },
    { n: 62,  name: 'అల్-జుముఆ',             meaning: 'శుక్రవారం',                    revelation: 'Madinah', ayahs: 11  },
    { n: 63,  name: 'అల్-మునాఫికూన్',        meaning: 'కపటులు',                       revelation: 'Madinah', ayahs: 11  },
    { n: 64,  name: 'అత్-తగాబున్',           meaning: 'పరస్పర మోసం',                  revelation: 'Madinah', ayahs: 18  },
    { n: 65,  name: 'అత్-తలాఖ్',             meaning: 'విడాకులు',                      revelation: 'Madinah', ayahs: 12  },
    { n: 66,  name: 'అత్-తహ్రీమ్',           meaning: 'నిషేధం',                       revelation: 'Madinah', ayahs: 12  },
    { n: 67,  name: 'అల్-ముల్క్',            meaning: 'సార్వభౌమత్వం',                 revelation: 'Makkah',  ayahs: 30  },
    { n: 68,  name: 'అల్-ఖలమ్',              meaning: 'లేఖిని',                       revelation: 'Makkah',  ayahs: 52  },
    { n: 69,  name: 'అల్-హాఖ్ఖా',            meaning: 'నిశ్చయమైనది',                   revelation: 'Makkah',  ayahs: 52  },
    { n: 70,  name: 'అల్-మఆరిజ్',            meaning: 'ఆరోహణ మార్గాలు',               revelation: 'Makkah',  ayahs: 44  },
    { n: 71,  name: 'నూహ్',                  meaning: 'నూహ్',                         revelation: 'Makkah',  ayahs: 28  },
    { n: 72,  name: 'అల్-జిన్న్',            meaning: 'జిన్నులు',                      revelation: 'Makkah',  ayahs: 28  },
    { n: 73,  name: 'అల్-ముజ్జమ్మిల్',       meaning: 'కప్పుకున్నవాడు',               revelation: 'Makkah',  ayahs: 20  },
    { n: 74,  name: 'అల్-ముద్దస్సిర్',       meaning: 'దుస్తులు ధరించినవాడు',          revelation: 'Makkah',  ayahs: 56  },
    { n: 75,  name: 'అల్-ఖియామా',            meaning: 'పునరుత్థానం',                  revelation: 'Makkah',  ayahs: 40  },
    { n: 76,  name: 'అల్-ఇన్సాన్',           meaning: 'మానవుడు',                      revelation: 'Madinah', ayahs: 31  },
    { n: 77,  name: 'అల్-ముర్సలాత్',         meaning: 'పంపబడినవారు',                  revelation: 'Makkah',  ayahs: 50  },
    { n: 78,  name: 'అన్-నబా',               meaning: 'మహా వార్త',                    revelation: 'Makkah',  ayahs: 40  },
    { n: 79,  name: 'అన్-నాజిఆత్',           meaning: 'ఆత్మలను తీసుకునేవారు',          revelation: 'Makkah',  ayahs: 46  },
    { n: 80,  name: 'అబసా',                  meaning: 'ముఖం చిట్లించాడు',              revelation: 'Makkah',  ayahs: 42  },
    { n: 81,  name: 'అత్-తక్వీర్',           meaning: 'చుట్టబడినది',                   revelation: 'Makkah',  ayahs: 29  },
    { n: 82,  name: 'అల్-ఇన్ఫితార్',         meaning: 'పగిలినది',                     revelation: 'Makkah',  ayahs: 19  },
    { n: 83,  name: 'అల్-ముతఫ్ఫిఫీన్',       meaning: 'కొలతలో మోసం చేసేవారు',           revelation: 'Makkah',  ayahs: 36  },
    { n: 84,  name: 'అల్-ఇన్షికాఖ్',         meaning: 'చీలినది',                      revelation: 'Makkah',  ayahs: 25  },
    { n: 85,  name: 'అల్-బురూజ్',            meaning: 'నక్షత్ర మండలాలు',               revelation: 'Makkah',  ayahs: 22  },
    { n: 86,  name: 'అత్-తారిఖ్',            meaning: 'రాత్రి నక్షత్రం',               revelation: 'Makkah',  ayahs: 17  },
    { n: 87,  name: 'అల్-అఅలా',              meaning: 'మహోన్నతుడు',                    revelation: 'Makkah',  ayahs: 19  },
    { n: 88,  name: 'అల్-గాషియా',            meaning: 'ఆవరించేది',                    revelation: 'Makkah',  ayahs: 26  },
    { n: 89,  name: 'అల్-ఫజ్ర్',             meaning: 'ఉదయం',                         revelation: 'Makkah',  ayahs: 30  },
    { n: 90,  name: 'అల్-బలద్',              meaning: 'నగరం',                         revelation: 'Makkah',  ayahs: 20  },
    { n: 91,  name: 'అష్-షమ్స్',             meaning: 'సూర్యుడు',                     revelation: 'Makkah',  ayahs: 15  },
    { n: 92,  name: 'అల్-లైల్',              meaning: 'రాత్రి',                       revelation: 'Makkah',  ayahs: 21  },
    { n: 93,  name: 'అద్-దుహా',              meaning: 'పూర్వాహ్నం',                   revelation: 'Makkah',  ayahs: 11  },
    { n: 94,  name: 'అల్-ఇన్షిరాహ్',         meaning: 'విశాలీకరణ',                    revelation: 'Makkah',  ayahs: 8   },
    { n: 95,  name: 'అత్-తీన్',              meaning: 'అంజూరం',                       revelation: 'Makkah',  ayahs: 8   },
    { n: 96,  name: 'అల్-అలఖ్',              meaning: 'రక్తపు గడ్డ',                   revelation: 'Makkah',  ayahs: 19  },
    { n: 97,  name: 'అల్-ఖద్ర్',             meaning: 'గౌరవం',                         revelation: 'Makkah',  ayahs: 5   },
    { n: 98,  name: 'అల్-బయ్యినా',           meaning: 'స్పష్టమైన రుజువు',               revelation: 'Madinah', ayahs: 8   },
    { n: 99,  name: 'అజ్-జిల్జాల్',          meaning: 'భూకంపం',                      revelation: 'Madinah', ayahs: 8   },
    { n: 100, name: 'అల్-ఆదియాత్',           meaning: 'పరుగెత్తే గుర్రాలు',            revelation: 'Makkah',  ayahs: 11  },
    { n: 101, name: 'అల్-ఖారిఆ',             meaning: 'మహా విపత్తు',                   revelation: 'Makkah',  ayahs: 11  },
    { n: 102, name: 'అత్-తకాసుర్',           meaning: 'పోటీ',                         revelation: 'Makkah',  ayahs: 8   },
    { n: 103, name: 'అల్-అస్ర్',             meaning: 'కాలం',                         revelation: 'Makkah',  ayahs: 3   },
    { n: 104, name: 'అల్-హుమజా',            meaning: 'నిందించేవాడు',                 revelation: 'Makkah',  ayahs: 9   },
    { n: 105, name: 'అల్-ఫీల్',              meaning: 'ఏనుగు',                        revelation: 'Makkah',  ayahs: 5   },
    { n: 106, name: 'ఖురైష్',               meaning: 'ఖురైష్',                       revelation: 'Makkah',  ayahs: 4   },
    { n: 107, name: 'అల్-మాఊన్',            meaning: 'సహాయం',                        revelation: 'Makkah',  ayahs: 7   },
    { n: 108, name: 'అల్-కౌసర్',             meaning: 'సమృద్ధి',                       revelation: 'Makkah',  ayahs: 3   },
    { n: 109, name: 'అల్-కాఫిరూన్',          meaning: 'అవిశ్వాసులు',                   revelation: 'Makkah',  ayahs: 6   },
    { n: 110, name: 'అన్-నస్ర్',             meaning: 'సహాయం',                        revelation: 'Madinah', ayahs: 3   },
    { n: 111, name: 'అల్-లహబ్',              meaning: 'అగ్ని జ్వాల',                   revelation: 'Makkah',  ayahs: 5   },
    { n: 112, name: 'అల్-ఇఖ్లాస్',           meaning: 'నిష్కపటమైన విశ్వాసం',           revelation: 'Makkah',  ayahs: 4   },
    { n: 113, name: 'అల్-ఫలక్',              meaning: 'ఉదయం',                         revelation: 'Makkah',  ayahs: 5   },
    { n: 114, name: 'అన్-నాస్',              meaning: 'మానవులు',                      revelation: 'Makkah',  ayahs: 6   }
];

/* ---------- Arabic Names Map (Keyed by Surah Number 1..114) ---------- */
export const ARABIC_NAMES = {
    1:'الفاتحة', 2:'البقرة', 3:'آل عمران', 4:'النساء', 5:'المائدة', 6:'الأنعام',
    7:'الأعراف', 8:'الأنفال', 9:'التوبة', 10:'يونس', 11:'هود', 12:'يوسف',
    13:'الرعد', 14:'إبراهيم', 15:'الحجر', 16:'النحل', 17:'الإسراء', 18:'الكهف',
    19:'مريم', 20:'طه', 21:'الأنبياء', 22:'الحج', 23:'المؤمنون', 24:'النور',
    25:'الفرقان', 26:'الشعراء', 27:'النمل', 28:'القصص', 29:'العنكبوت', 30:'الروم',
    31:'لقمان', 32:'السجدة', 33:'الأحزاب', 34:'سبأ', 35:'فاطر', 36:'يس',
    37:'الصافات', 38:'ص', 39:'الزمر', 40:'غافر', 41:'فصلت', 42:'الشورى',
    43:'الزخرف', 44:'الدخان', 45:'الجاثية', 46:'الأحقاف', 47:'محمد', 48:'الفتح',
    49:'الحجرات', 50:'ق', 51:'الذاريات', 52:'الطور', 53:'النجم', 54:'القمر',
    55:'الرحمن', 56:'الواقعة', 57:'الحديد', 58:'المجادلة', 59:'الحشر', 60:'الممتحنة',
    61:'الصف', 62:'الجمعة', 63:'المنافقون', 64:'التغابن', 65:'الطلاق', 66:'التحريم',
    67:'الملك', 68:'القلم', 69:'الحاقة', 70:'المعارج', 71:'نوح', 72:'الجن',
    73:'المزمل', 74:'المدثر', 75:'القيامة', 76:'الإنسان', 77:'المرسلات', 78:'النبأ',
    79:'النازعات', 80:'عبس', 81:'التكوير', 82:'الانفطار', 83:'المطففين', 84:'الانشقاق',
    85:'البروج', 86:'الطارق', 87:'الأعلى', 88:'الغاشية', 89:'الفجر', 90:'البلد',
    91:'الشمس', 92:'الليل', 93:'الضحى', 94:'الشرح', 95:'التين', 96:'العلق',
    97:'القدر', 98:'البينة', 99:'الزلزلة', 100:'العاديات', 101:'القارعة', 102:'التكاثر',
    103:'العصر', 104:'الهمزة', 105:'الفيل', 106:'قريش', 107:'الماعون', 108:'الكوثر',
    109:'الكافرون', 110:'النصر', 111:'اللهب', 112:'الإخلاص', 113:'الفلق', 114:'الناس'
};

/* In-memory surah text cache: { [surahNum]: [ayahObjects] } */
export const surahCache = {};

/* ---------- Helper Utilities ---------- */
export function pad3(n) {
    return String(n).padStart(3, '0');
}

export function surahUrl(n) {
    return RAW_BASE + 'telugu_surah_' + pad3(n) + '.json';
}

export function unwrap(val, def) {
    var v = (typeof val === 'function') ? val() : val;
    return (v !== undefined && v !== null) ? v : def;
}

export function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

export function getSurahMeta(n) {
    var num = Number(n);
    for (var i = 0; i < SURAH_META.length; i++) {
        if (SURAH_META[i].n === num) return SURAH_META[i];
    }
    return null;
}

export function getArabicName(n) {
    return ARABIC_NAMES[Number(n)] || '';
}

/**
 * Fetch a single surah JSON and return its result array.
 * Uses in-memory cache so re-opening is instant.
 */
export async function loadSurah(n) {
    var num = Number(n);
    if (surahCache[num]) return surahCache[num];

    var fetchFn = typeof fetch === 'function' ? fetch : (_win.fetch || null);
    if (!fetchFn) {
        throw new Error('Fetch API is not available');
    }

    var res = await fetchFn(surahUrl(num));
    if (!res.ok) {
        throw new Error('HTTP ' + res.status + ' for surah ' + num);
    }

    var json = await res.json();
    var ayahs = Array.isArray(json.result) ? json.result : [];
    surahCache[num] = ayahs;
    return ayahs;
}

/* ---------- Footnotes & Translation Formatting ---------- */
export function renderFootnotes(raw, surahNum) {
    if (!raw || !raw.trim()) return '';

    var parts = raw.split(/(?=\[\d+\])/g).filter(function (p) {
        return p.trim().length > 0;
    });

    var items = parts.map(function (part) {
        var m = part.match(/^\[(\d+)\]\s*([\s\S]*)$/);
        if (!m) {
            return '<p class="mt-1">' + escapeHtml(part.trim()) + '</p>';
        }
        var num = m[1];
        var text = escapeHtml(m[2].trim()).replace(/\n/g, '<br>');
        return (
            '<p class="mt-1">' +
                '<span id="fn-' + surahNum + '-' + num + '" class="font-bold text-gray-900">[' + num + ']</span> ' +
                text +
            '</p>'
        );
    }).join('');

    return (
        '<div class="mt-5 bg-gray-50 p-4 rounded-xl border border-gray-100">' +
            '<div class="flex gap-3 items-start">' +
                '<i class="fa-solid fa-circle-info mt-1.5 text-sm shrink-0 text-gray-400" aria-hidden="true"></i>' +
                '<div lang="te" class="font-telugu text-[17px] leading-[1.7] text-gray-700">' +
                    items +
                '</div>' +
            '</div>' +
        '</div>'
    );
}

export function linkFootnoteMarkers(translation, surahNum) {
    if (!translation) return '';
    var safe = escapeHtml(translation);
    return safe.replace(/\[(\d+)\]/g, function (_, num) {
        return (
            '<a href="#fn-' + surahNum + '-' + num + '" ' +
            'class="text-darkGreen font-bold no-underline hover:underline">[' + num + ']</a>'
        );
    });
}

/* ---------- Bookmarks Storage & Operations ---------- */
export function loadBookmarks() {
    try {
        if (typeof localStorage !== 'undefined') {
            var raw = localStorage.getItem(BOOKMARKS_STORAGE_KEY);
            if (raw) {
                var parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) return parsed;
            }
        }
    } catch (_) {}
    return [];
}

export function persistBookmarks(bookmarks) {
    try {
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(bookmarks || []));
        }
    } catch (_) {}
}

export function isAyahBookmarked(surahNum, ayahNum) {
    var bms = loadBookmarks();
    var s = Number(surahNum), a = Number(ayahNum);
    return bms.some(function (b) { return b.surahNumber === s && b.ayahNumber === a; });
}

export function toggleBookmark(surahNum, ayahNum, ayahData, surahMeta) {
    var s = Number(surahNum), a = Number(ayahNum);
    var bms = loadBookmarks();
    var idx = bms.findIndex(function (b) { return b.surahNumber === s && b.ayahNumber === a; });
    var isNowBookmarked = false;

    if (idx !== -1) {
        bms.splice(idx, 1);
        isNowBookmarked = false;
    } else {
        var meta = surahMeta || getSurahMeta(s) || {};
        var arabicName = getArabicName(s);
        var item = {
            id: s + ':' + a,
            surahNumber: s,
            ayahNumber: a,
            surahName: meta.name || ('Surah ' + s),
            arabicName: arabicName,
            revelation: meta.revelation || 'Makkah',
            arabicText: (ayahData && ayahData.arabic_text) || '',
            translation: (ayahData && ayahData.translation) || '',
            createdAt: Date.now()
        };
        bms.unshift(item);
        isNowBookmarked = true;
    }

    persistBookmarks(bms);
    return isNowBookmarked;
}

export function removeBookmark(bookmarkId) {
    var bms = loadBookmarks();
    var filtered = bms.filter(function (b) {
        return b.id !== bookmarkId && (b.surahNumber + ':' + b.ayahNumber) !== bookmarkId;
    });
    persistBookmarks(filtered);
    return filtered;
}

/* ---------- Audio Playback Operations ---------- */
var currentAudio = null;
var activeAudioAyah = null;
var audioStateListeners = [];

export function getAyahAudioUrl(surahNum, ayahNum) {
    // Standard high-quality Mishary Rashid Alafasy ayah recitation from EveryAyah
    return 'https://everyayah.com/data/Alafasy_128kbps/' + pad3(surahNum) + pad3(ayahNum) + '.mp3';
}

export function subscribeAudioState(fn) {
    if (typeof fn === 'function') {
        audioStateListeners.push(fn);
        fn(activeAudioAyah);
    }
}

function notifyAudioChange(key) {
    activeAudioAyah = key;
    audioStateListeners.forEach(function (listener) {
        try { listener(key); } catch (_) {}
    });
}

export function stopAyahAudio() {
    if (currentAudio) {
        try {
            currentAudio.pause();
            currentAudio.currentTime = 0;
        } catch (_) {}
        currentAudio = null;
    }
    notifyAudioChange(null);
}

export function playAyahAudio(surahNum, ayahNum) {
    var key = Number(surahNum) + ':' + Number(ayahNum);
    if (activeAudioAyah === key && currentAudio && !currentAudio.paused) {
        stopAyahAudio();
        return false;
    }

    stopAyahAudio();

    if (typeof Audio === 'undefined') {
        notifyAudioChange(null);
        return false;
    }

    var url = getAyahAudioUrl(surahNum, ayahNum);
    var audio = new Audio(url);
    currentAudio = audio;
    notifyAudioChange(key);

    audio.onended = function () {
        if (activeAudioAyah === key) {
            stopAyahAudio();
        }
    };
    audio.onerror = function () {
        if (activeAudioAyah === key) {
            stopAyahAudio();
        }
    };

    var playPromise = audio.play();
    if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
            stopAyahAudio();
        });
    }
    return true;
}

export function getActiveAudioAyah() {
    return activeAudioAyah;
}

/* ---------- Search Filtering ---------- */
export function filterSurahs(query, list) {
    var source = list || SURAH_META;
    var q = (query || '').trim().toLowerCase();
    if (!q) return source;

    return source.filter(function (s) {
        var numStr = String(s.n);
        var nameLower = (s.name || '').toLowerCase();
        var meaningLower = (s.meaning || '').toLowerCase();
        var arabic = (ARABIC_NAMES[s.n] || '').toLowerCase();

        return numStr === q ||
            numStr.indexOf(q) !== -1 ||
            nameLower.indexOf(q) !== -1 ||
            meaningLower.indexOf(q) !== -1 ||
            arabic.indexOf(q) !== -1;
    });
}

/* ---------- Centralized Service Bundle ---------- */
export const QuranService = {
    SURAH_META,
    ARABIC_NAMES,
    RAW_BASE,
    loadSurah,
    getSurahMeta,
    getArabicName,
    pad3,
    escapeHtml,
    renderFootnotes,
    linkFootnoteMarkers,
    loadBookmarks,
    persistBookmarks,
    isAyahBookmarked,
    toggleBookmark,
    removeBookmark,
    playAyahAudio,
    stopAyahAudio,
    getActiveAudioAyah,
    subscribeAudioState,
    getAyahAudioUrl,
    filterSurahs,
    unwrap
};

if (typeof window !== 'undefined') {
    window.QuranService = QuranService;
}

export default QuranService;

