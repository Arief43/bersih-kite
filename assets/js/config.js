/*
 * Bersih Kite: SATU tempat untuk ubah maklumat servis.
 * Ubah nilai di bawah, simpan, muat semula halaman. Tiada build step.
 * Sumber & nota poskod: docs/poskod-kt.md
 */
window.BK_CONFIG = {
  // PLACEHOLDER: nombor WhatsApp sebenar, format antarabangsa tanpa "+" atau sengkang (cth 60123456789)
  NO_WHATSAPP: '60100000000',

  // Pilihan: URL Web App Google Apps Script (lihat apps-script/Code.gs).
  // Biar kosong '' jika tak guna Google Sheets. Borang tetap buka WhatsApp.
  SHEETS_URL: '',

  HARGA: 69,            // RM sebulan
  HARGA_SEHARI: null,   // biar null untuk kira automatik (HARGA / 30); isi nombor jika mahu nilai tetap
  HARI: ['Isnin', 'Khamis'],
  HARI_INDEKS: [1, 4],  // 0 = Ahad, 1 = Isnin ... 6 = Sabtu (ikut Date.getDay())

  // PLACEHOLDER: waktu kutipan anggaran
  WAKTU: '7:00 – 11:00 pagi',
  // PLACEHOLDER: had beg setiap kutipan
  HAD_BEG: 5,
  // PLACEHOLDER: waktu operasi khidmat pelanggan
  WAKTU_OPERASI: 'Isnin – Sabtu, 9:00 pagi – 6:00 petang',

  // Daerah Kuala Terengganu (selatan/barat Sungai Terengganu)
  POSKOD_DILIPUTI: ['20000', '20050', '20100', '20200', '20300', '20400', '21000', '21080', '21100'],

  // Daerah Kuala Nerus (sejak 2014): belum diliputi
  POSKOD_KUALA_NERUS: ['21030', '21060', '21300'],

  // Bertindih / tidak pasti: minta sahkan melalui WhatsApp
  // 21200 = Manir (KT) + Seberang Takir/Tembesu (KN); 21070 = Kepong (KT) + Marang; 21040 = Marang
  POSKOD_SEMAK: ['21200', '21010', '21210', '21070', '21020', '21090', '21220', '21040'],

  // Mesej khas untuk poskod bertindih (dipapar selepas "Poskod XXXXX ")
  MESEJ_KHAS: {
    '21200': 'meliputi Manir (diliputi) dan Seberang Takir (Kuala Nerus, belum).'
  },

  // Julat poskod negeri Terengganu (untuk mesej "di luar kawasan")
  JULAT_TERENGGANU: [20000, 24300]
};
