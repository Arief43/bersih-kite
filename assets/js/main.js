/* Bersih Kite: interaksi halaman. Semua nilai datang dari assets/js/config.js */
(function () {
  'use strict';
  window.BK_SIAP = true; // isyarat kepada skrip sandaran dalam <head>

  var C = window.BK_CONFIG || {};
  var kurangGerak = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  var waAsas = 'https://wa.me/' + String(C.NO_WHATSAPP || '').replace(/\D/g, '');

  /* ---------- Isi nilai config ke dalam HTML ---------- */
  function formatNoWa(n) {
    // 60123456789 -> +60 12-345 6789 (anggaran format paparan)
    var d = String(n).replace(/\D/g, '');
    if (d.indexOf('60') !== 0) return '+' + d;
    var t = d.slice(2);
    return '+60 ' + t.slice(0, 2) + '-' + t.slice(2, 5) + ' ' + t.slice(5);
  }

  $$('[data-harga]').forEach(function (el) { if (C.HARGA) el.textContent = C.HARGA; });
  $$('[data-waktu]').forEach(function (el) { if (C.WAKTU) el.textContent = C.WAKTU; });
  $$('[data-had-beg]').forEach(function (el) { if (C.HAD_BEG) el.textContent = C.HAD_BEG; });
  $$('[data-waktu-operasi]').forEach(function (el) { if (C.WAKTU_OPERASI) el.textContent = C.WAKTU_OPERASI; });
  $$('[data-tahun]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
  $$('[data-wa]').forEach(function (el) {
    var teks = 'Assalamualaikum Bersih Kite, saya nak tanya tentang servis kutipan sampah.';
    el.href = waAsas + '?text=' + encodeURIComponent(teks);
    if (el.hasAttribute('data-wa-teks')) el.textContent = formatNoWa(C.NO_WHATSAPP);
  });
  // Harga sehari: guna HARGA_SEHARI jika diisi, jika tidak kira daripada HARGA / 30
  var sehari = Number(C.HARGA_SEHARI) || (Number(C.HARGA) / 30);
  if (sehari) {
    $$('[data-kira]').forEach(function (el) {
      el.setAttribute('data-kira', sehari.toFixed(2));
      el.textContent = sehari.toFixed(2);
    });
  }

  /* ---------- Papan jadual: hari kutipan & hari ini ---------- */
  var NAMA_HARI = ['Ahad', 'Isnin', 'Selasa', 'Rabu', 'Khamis', 'Jumaat', 'Sabtu'];
  var PENDEK_HARI = ['Ahd', 'Isn', 'Sel', 'Rab', 'Kha', 'Jum', 'Sab'];
  var hariIndeks = (C.HARI_INDEKS || [1, 4]).slice();
  var hariKutip = hariIndeks.map(String);
  var hariIni = String(new Date().getDay());
  $$('.papan__hari li').forEach(function (li) {
    var h = li.getAttribute('data-hari');
    var aktif = hariKutip.indexOf(h) !== -1;
    li.classList.toggle('aktif', aktif);
    var s = $('.papan__s', li);
    if (s) s.textContent = aktif ? 'KUTIP' : '–';
    var sr = $('.sr', li);
    if (sr) sr.textContent = NAMA_HARI[+h] + (aktif ? ': hari kutipan' : ': tiada kutipan');
    if (h === hariIni) {
      li.classList.add('hari-ini');
      li.setAttribute('aria-current', 'date');
      if (sr) sr.textContent += ' (hari ini)';
    }
  });
  // Teks hari di tempat lain (cip hero, senarai harga, nota jadual, bar melekat)
  var namaKutip = (C.HARI && C.HARI.length) ? C.HARI : hariIndeks.map(function (i) { return NAMA_HARI[i]; });
  $$('[data-hari-teks]').forEach(function (el) {
    var penyambung = el.getAttribute('data-hari-teks') || '&';
    el.textContent = namaKutip.join(' ' + penyambung + ' ');
  });
  $$('[data-hari-pendek]').forEach(function (el) {
    el.textContent = hariIndeks.map(function (i) { return PENDEK_HARI[i]; }).join(' & ');
  });

  /* ---------- Reveal berperingkat semasa skrol ---------- */
  var revealEls = $$('[data-reveal]');
  // Beri kelewatan berperingkat kepada adik-beradik dalam induk yang sama
  revealEls.forEach(function (el) {
    var adik = $$('[data-reveal]', el.parentElement).filter(function (x) { return x.parentElement === el.parentElement; });
    var i = adik.indexOf(el);
    if (i > 0) el.style.transitionDelay = Math.min(i, 5) * 90 + 'ms';
  });

  if (kurangGerak || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entri) {
      entri.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Kiraan "RM2.30 sehari" ---------- */
  $$('[data-kira]').forEach(function (el) {
    var sasaran = parseFloat(el.getAttribute('data-kira')) || 0;
    if (kurangGerak || !('IntersectionObserver' in window)) { el.textContent = sasaran.toFixed(2); return; }
    el.textContent = '0.00';
    var obs = new IntersectionObserver(function (entri) {
      if (!entri[0].isIntersecting) return;
      obs.disconnect();
      var mula = null, tempoh = 1100;
      function langkah(t) {
        if (mula === null) mula = t;
        var p = Math.min((t - mula) / tempoh, 1);
        var ease = 1 - Math.pow(1 - p, 3);
        el.textContent = (sasaran * ease).toFixed(2);
        if (p < 1) requestAnimationFrame(langkah);
      }
      requestAnimationFrame(langkah);
    }, { threshold: 0.6 });
    obs.observe(el);
  });

  /* ---------- Accordion soalan lazim (papan kekunci) ---------- */
  var faq = $('[data-faq]');
  if (faq) {
    var butang = $$('.faq__item button', faq);
    butang.forEach(function (b, i) {
      var panel = document.getElementById(b.getAttribute('aria-controls'));
      b.addEventListener('click', function () {
        var buka = b.getAttribute('aria-expanded') === 'true';
        b.setAttribute('aria-expanded', String(!buka));
        panel.hidden = buka;
      });
      b.addEventListener('keydown', function (e) {
        var sasaran = null;
        if (e.key === 'ArrowDown') sasaran = butang[(i + 1) % butang.length];
        else if (e.key === 'ArrowUp') sasaran = butang[(i - 1 + butang.length) % butang.length];
        else if (e.key === 'Home') sasaran = butang[0];
        else if (e.key === 'End') sasaran = butang[butang.length - 1];
        if (sasaran) { e.preventDefault(); sasaran.focus(); }
      });
    });
  }

  /* ---------- Penyemak poskod ---------- */
  function semakPoskod(raw) {
    var p = String(raw || '').replace(/\s/g, '');
    if (!/^\d{5}$/.test(p)) {
      return { jenis: 'ralat', teks: 'Poskod mesti 5 digit nombor, contohnya 20000.' };
    }
    if ((C.POSKOD_DILIPUTI || []).indexOf(p) !== -1) {
      return { jenis: 'ya', teks: 'Poskod <strong>' + p + '</strong> diliputi. <a href="#daftar">Daftar sekarang</a>.' };
    }
    var waLink = '<a href="' + waAsas + '" target="_blank" rel="noopener">WhatsApp<span class="sr"> (buka tab baharu)</span></a>';
    if ((C.POSKOD_KUALA_NERUS || []).indexOf(p) !== -1) {
      return { jenis: 'belum', teks: 'Poskod <strong>' + p + '</strong> dalam daerah Kuala Nerus. Kawasan ini belum diliputi buat masa ini. Mesej kami di ' + waLink + ' dan kami beritahu bila servis sampai ke sana.' };
    }
    if ((C.POSKOD_SEMAK || []).indexOf(p) !== -1) {
      var khas = (C.MESEJ_KHAS || {})[p];
      return { jenis: 'semak', teks: khas
        ? 'Poskod <strong>' + p + '</strong> ' + khas + ' Mesej kami di ' + waLink + ' untuk sahkan alamat anda.'
        : 'Poskod <strong>' + p + '</strong> mungkin diliputi. Hubungi kami di ' + waLink + ' untuk sahkan alamat anda.' };
    }
    var n = parseInt(p, 10), j = C.JULAT_TERENGGANU || [20000, 24300];
    if (n >= j[0] && n <= j[1]) {
      return { jenis: 'luar', teks: 'Poskod <strong>' + p + '</strong> di luar kawasan servis kami buat masa ini. Kami mula di daerah Kuala Terengganu dahulu.' };
    }
    return { jenis: 'luar', teks: 'Poskod <strong>' + p + '</strong> di luar kawasan. Bersih Kite hanya beroperasi di Kuala Terengganu buat masa ini.' };
  }
  window.BK_semakPoskod = semakPoskod; // untuk ujian di konsol

  var bp = $('#borang-poskod');
  if (bp) {
    var inPoskod = $('#poskod-semak'), hasil = $('#poskod-hasil');
    bp.addEventListener('submit', function (e) {
      e.preventDefault();
      var r = semakPoskod(inPoskod.value);
      hasil.setAttribute('data-jenis', r.jenis);
      hasil.innerHTML = r.teks;
      inPoskod.setAttribute('aria-invalid', r.jenis === 'ralat' ? 'true' : 'false');
      if (r.jenis === 'ralat') inPoskod.focus();
    });
    inPoskod.addEventListener('input', function () { inPoskod.value = inPoskod.value.replace(/\D/g, '').slice(0, 5); });
  }

  /* ---------- Borang daftar → WhatsApp (+ Sheets jika ada) ---------- */
  function normalTelefon(raw) {
    // Terima: 012-3456789, 011-23456789, +6012 345 6789, 6012..., 12...
    var d = String(raw || '').replace(/[\s\-().]/g, '');
    if (d.charAt(0) === '+') d = d.slice(1);
    if (!/^\d+$/.test(d)) return null;
    if (d.indexOf('60') === 0) d = d.slice(2);
    else if (d.charAt(0) === '0') d = d.slice(1);
    // Kini mesti 1x + 7 atau 8 digit (mudah alih Malaysia). 011 sentiasa 8 digit.
    if (!/^1\d{8,9}$/.test(d)) return null;
    if (/^11/.test(d) && d.length !== 10) return null;
    return '60' + d;
  }
  window.BK_normalTelefon = normalTelefon;

  var borang = $('#borang-daftar');
  if (borang) {
    var status = $('#borang-status');
    var medan = {
      nama: $('#f-nama'), telefon: $('#f-telefon'), alamat: $('#f-alamat'), poskod: $('#f-poskod'),
      taman: $('#f-taman'), jenis: $('#f-jenis'), mula: $('#f-mula'), nota: $('#f-nota')
    };
    // tarikh mula tidak boleh sebelum hari ini (tarikh tempatan, bukan UTC)
    try {
      var t = new Date();
      t.setMinutes(t.getMinutes() - t.getTimezoneOffset());
      medan.mula.min = t.toISOString().slice(0, 10);
    } catch (e) {}

    var LABEL_LIPUTAN = { ya: 'Diliputi', semak: 'Perlu sahkan', belum: 'Kuala Nerus (senarai menunggu)', luar: 'Luar kawasan' };
    var AMARAN_LUAR = 'Poskod ini belum dalam kawasan servis. Anda masih boleh hantar untuk masuk senarai menunggu.';
    function amaranLiputan() {
      var p = medan.poskod.value.trim();
      if (!/^\d{5}$/.test(p)) return '';
      var j = semakPoskod(p).jenis;
      return (j === 'belum' || j === 'luar') ? AMARAN_LUAR : '';
    }

    medan.poskod.addEventListener('input', function () {
      medan.poskod.value = medan.poskod.value.replace(/\D/g, '').slice(0, 5);
      var a = amaranLiputan();
      if (a) status.textContent = a;
      else if (status.textContent === AMARAN_LUAR) status.textContent = '';
    });

    // Kosongkan mesej status ralat bila semua medan wajib sudah betul
    borang.addEventListener('input', function (e) {
      if (e.target === medan.poskod) return;
      if (status.textContent && status.textContent !== AMARAN_LUAR && /medan yang perlu dibetulkan/.test(status.textContent)) {
        var adaRalat = $$('[aria-invalid="true"]', borang).some(function (el) {
          return el !== e.target;
        });
        if (!adaRalat) status.textContent = amaranLiputan();
      }
    });

    function setRalat(el, mesej) {
      var r = document.getElementById(el.getAttribute('aria-describedby'));
      el.setAttribute('aria-invalid', mesej ? 'true' : 'false');
      if (r) r.textContent = mesej || '';
    }

    function sahkan() {
      var ralat = [];
      var v = function (k) { return medan[k].value.trim(); };

      if (v('nama').length < 2) { setRalat(medan.nama, 'Sila isi nama anda.'); ralat.push(medan.nama); } else setRalat(medan.nama);

      var tel = normalTelefon(v('telefon'));
      if (!v('telefon')) { setRalat(medan.telefon, 'Sila isi nombor telefon.'); ralat.push(medan.telefon); }
      else if (!tel) { setRalat(medan.telefon, 'Nombor tak sah. Guna format 012-3456789 atau +6012 345 6789.'); ralat.push(medan.telefon); }
      else setRalat(medan.telefon);

      if (v('alamat').length < 5) { setRalat(medan.alamat, 'Sila isi alamat rumah (no. rumah dan jalan).'); ralat.push(medan.alamat); } else setRalat(medan.alamat);

      if (!/^\d{5}$/.test(v('poskod'))) { setRalat(medan.poskod, 'Poskod mesti 5 digit.'); ralat.push(medan.poskod); } else setRalat(medan.poskod);

      return { ralat: ralat, telefon: tel };
    }

    borang.addEventListener('submit', function (e) {
      e.preventDefault();
      var s = sahkan();
      if (s.ralat.length) {
        status.textContent = 'Ada ' + s.ralat.length + ' medan yang perlu dibetulkan.';
        s.ralat[0].focus();
        return;
      }

      var d = {};
      Object.keys(medan).forEach(function (k) { d[k] = medan[k].value.trim(); });
      d.telefon = s.telefon;
      var liputan = semakPoskod(d.poskod).jenis;

      var baris = [
        'Assalamualaikum Bersih Kite, saya nak daftar langganan kutipan sampah (RM' + (C.HARGA || 69) + '/bulan).',
        '',
        'Nama: ' + d.nama,
        'Telefon: ' + d.telefon,
        'Alamat: ' + d.alamat,
        'Poskod: ' + d.poskod
      ];
      if (d.taman) baris.push('Taman/Kampung: ' + d.taman);
      if (d.jenis) baris.push('Jenis rumah: ' + d.jenis);
      if (d.mula) baris.push('Tarikh mula: ' + d.mula.split('-').reverse().join('/'));
      if (d.nota) baris.push('Nota: ' + d.nota);
      baris.push('Liputan: ' + (LABEL_LIPUTAN[liputan] || liputan));
      var url = waAsas + '?text=' + encodeURIComponent(baris.join('\n'));

      // Pilihan: hantar salinan ke Google Sheets
      if (C.SHEETS_URL) {
        d.liputan = liputan;
        d.dihantar = new Date().toISOString();
        try {
          fetch(C.SHEETS_URL, {
            method: 'POST', mode: 'no-cors', keepalive: true,
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify(d)
          }).catch(function () {});
        } catch (err) {}
      }

      status.textContent = ((liputan === 'belum' || liputan === 'luar') ? AMARAN_LUAR + ' ' : '') +
        'WhatsApp sedang dibuka. Tekan hantar dalam WhatsApp untuk lengkapkan pendaftaran.';
      var w = window.open(url, '_blank');
      if (w) { try { w.opener = null; } catch (err) {} }
      else window.location.href = url;
    });
  }

  /* ---------- Bar CTA melekat ---------- */
  var melekat = $('#melekat'), hero = $('.hero'), daftar = $('#daftar');
  if (melekat && hero && daftar) {
    var tick = false;
    function kemaskini() {
      tick = false;
      var lepasHero = hero.getBoundingClientRect().bottom < 0;
      var daftarNampak = daftar.getBoundingClientRect().top < window.innerHeight;
      var tunjuk = lepasHero && !daftarNampak;
      melekat.classList.toggle('tampak', tunjuk);
      if (tunjuk) { melekat.removeAttribute('inert'); melekat.removeAttribute('aria-hidden'); }
      else { melekat.setAttribute('inert', ''); melekat.setAttribute('aria-hidden', 'true'); }
    }
    window.addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(kemaskini); } }, { passive: true });
    window.addEventListener('resize', kemaskini);
    kemaskini();
  }
})();
