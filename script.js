/**
 * ====================================================================
 * SCRIPT.JS - MEDIA PEMBELAJARAN INTERAKTIF EXCEL DASAR & RUMUS
 * Informatika SMP/MTs Kelas VIII
 * Vanilla JavaScript (Bekerja offline, tanpa database, tanpa framework)
 * ====================================================================
 */

// ====================================================================
// 1. STATE & STORAGE MANAJEMEN PROGRESS BELAJAR
// ====================================================================
const STORAGE_KEY = 'excel_smp_progress_v1';

let userProgress = {
  visitedSections: ['beranda'],
  materiTabsRead: ['tab-antarmuka'],
  formulasViewed: [],
  activitiesDone: {
    matching: false,
    dragDrop: false,
    scenario: false,
    simulasi: false
  },
  quizCompleted: false,
  quizScore: 0
};

// Muat progres tersimpan dari localStorage saat pertama kali dimuat
function loadProgress() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      userProgress = Object.assign(userProgress, JSON.parse(saved));
    }
  } catch (e) {
    console.warn('localStorage tidak dapat diakses:', e);
  }
  updateProgressUI();
}

// Simpan progres ke localStorage
function saveProgress() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userProgress));
  } catch (e) {
    console.warn('Gagal menyimpan ke localStorage:', e);
  }
  updateProgressUI();
}

// Hitung persentase progres belajar (0 - 100%)
function calculateProgressPercentage() {
  let score = 0;
  // Kunjungan menu (bobot maks 20%)
  const menuWeight = (userProgress.visitedSections.length / 6) * 20;
  score += Math.min(20, menuWeight);

  // Tab materi dibaca (bobot maks 20%)
  const materiWeight = (userProgress.materiTabsRead.length / 5) * 20;
  score += Math.min(20, materiWeight);

  // Rumus dibuka (bobot maks 20%)
  const formulaWeight = (userProgress.formulasViewed.length / 10) * 20;
  score += Math.min(20, formulaWeight);

  // Aktivitas selesai (bobot maks 20% - 5% per aktivitas)
  let actCount = 0;
  if (userProgress.activitiesDone.matching) actCount++;
  if (userProgress.activitiesDone.dragDrop) actCount++;
  if (userProgress.activitiesDone.scenario) actCount++;
  if (userProgress.activitiesDone.simulasi) actCount++;
  score += (actCount / 4) * 20;

  // Kuis selesai (bobot maks 20%)
  if (userProgress.quizCompleted) {
    score += 20;
  }

  return Math.min(100, Math.round(score));
}

// Update tampilan Progress Bar di Header & Banner Beranda
function updateProgressUI() {
  const percent = calculateProgressPercentage();

  // 1. Update di Header
  const textEl = document.getElementById('globalProgressText');
  const barEl = document.getElementById('globalProgressBar');
  if (textEl) textEl.textContent = `${percent}%`;
  if (barEl) barEl.style.width = `${percent}%`;

  // 2. Update di Banner Beranda
  const bPercentEl = document.getElementById('berandaProgressPercent');
  const bBarEl = document.getElementById('berandaProgressBar');
  if (bPercentEl) bPercentEl.textContent = `${percent}%`;
  if (bBarEl) bBarEl.style.width = `${percent}%`;

  // Update Rincian Indikator
  const statMateri = document.getElementById('statMateriCount');
  const statRumus = document.getElementById('statRumusCount');
  const statAkt = document.getElementById('statAktCount');
  const statKuis = document.getElementById('statKuisStatus');

  if (statMateri) statMateri.textContent = `${userProgress.materiTabsRead.length}/5`;
  if (statRumus) statRumus.textContent = `${userProgress.formulasViewed.length}/10`;

  let actCount = 0;
  if (userProgress.activitiesDone.matching) actCount++;
  if (userProgress.activitiesDone.dragDrop) actCount++;
  if (userProgress.activitiesDone.scenario) actCount++;
  if (userProgress.activitiesDone.simulasi) actCount++;
  if (statAkt) statAkt.textContent = `${actCount}/4 Selesai`;

  if (statKuis) {
    if (userProgress.quizCompleted) {
      statKuis.textContent = `Selesai (Skor: ${userProgress.quizScore})`;
      statKuis.style.color = '#166534';
    } else {
      statKuis.textContent = 'Belum Dikerjakan';
      statKuis.style.color = '#ea580c';
    }
  }
}

// Reset progres belajar ke 0% dan kembalikan seluruh aktivitas ke kondisi awal
function resetAllProgress() {
  const konfirmasi = confirm(
    "⚠️ KONFIRMASI RESET PROGRES BELAJAR:\n\n" +
    "Apakah kamu yakin ingin mereset seluruh progres belajarmu kembali ke 0%?\n" +
    "Seluruh riwayat materi, rumus, aktivitas, dan nilai kuis akan diulang dari awal."
  );

  if (konfirmasi) {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn('Gagal menghapus localStorage:', e);
    }

    userProgress = {
      visitedSections: ['beranda'],
      materiTabsRead: ['tab-antarmuka'],
      formulasViewed: [],
      activitiesDone: {
        matching: false,
        dragDrop: false,
        scenario: false,
        simulasi: false
      },
      quizCompleted: false,
      quizScore: 0
    };

    // Reset seluruh aktivitas & simulasi
    if (typeof resetMatchingActivity === 'function') resetMatchingActivity();
    if (typeof loadDragPuzzle === 'function') loadDragPuzzle(0);
    if (typeof restartScenarioActivity === 'function') restartScenarioActivity();
    if (typeof runSpreadsheetSimulation === 'function') runSpreadsheetSimulation('SUM');
    if (typeof restartQuiz === 'function') restartQuiz();
    if (typeof resetSimSheetTabsState === 'function') resetSimSheetTabsState();
    if (typeof selectInterfacePart === 'function') selectInterfacePart('quick_access');

    // Perbarui UI ke 0%
    updateProgressUI();

    alert("✅ Progres belajarmu telah berhasil direset kembali ke 0%.\nSelamat belajar dan berpetualang kembali di dunia Excel!");
    navigateTo('beranda');
  }
}

// ====================================================================
// 2. NAVIGASI SINGLE PAGE APPLICATION (6 MENU UTAMA)
// ====================================================================
function navigateTo(sectionId) {
  // Sembunyikan semua section
  const sections = document.querySelectorAll('.content-section');
  sections.forEach(sec => sec.classList.remove('active'));

  // Tampilkan section target
  const targetSec = document.getElementById(sectionId);
  if (targetSec) {
    targetSec.classList.add('active');
  }

  // Update indikator aktif pada navbar
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    if (link.getAttribute('data-target') === sectionId) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  // Tutup menu mobile jika sedang terbuka
  const mainNavbar = document.getElementById('mainNavbar');
  if (mainNavbar) {
    mainNavbar.classList.remove('show-mobile');
  }

  // Gulir ke atas halaman dengan halus
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Catat progres kunjungan section
  if (!userProgress.visitedSections.includes(sectionId)) {
    userProgress.visitedSections.push(sectionId);
    saveProgress();
  }
}

// Toggle menu navigasi mobile
function toggleMobileNav() {
  const nav = document.getElementById('mainNavbar');
  if (nav) {
    nav.classList.toggle('show-mobile');
  }
}

// ====================================================================
// 3. MENU MATERI: SUB-TABS & CELL INSPECTOR INTERAKTIF
// ====================================================================
function switchMateriTab(tabId) {
  // Switch tab buttons
  const buttons = document.querySelectorAll('.materi-tab-btn');
  buttons.forEach(btn => {
    if (btn.getAttribute('onclick').includes(tabId)) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Switch panels
  const panels = document.querySelectorAll('.materi-panel');
  panels.forEach(panel => {
    if (panel.id === tabId) {
      panel.classList.add('active');
    } else {
      panel.classList.remove('active');
    }
  });

  // Catat progres membaca tab materi
  if (!userProgress.materiTabsRead.includes(tabId)) {
    userProgress.materiTabsRead.push(tabId);
    saveProgress();
  }
}

// Inisialisasi Deteksi Klik Cell Excel Interaktif di Materi Tab B
function initCellInspector() {
  const table = document.getElementById('interactiveCellTable');
  if (!table) return;

  const cells = table.querySelectorAll('.cell-item');
  cells.forEach(cell => {
    cell.addEventListener('click', function() {
      // Hapus status terpilih sebelumnya
      cells.forEach(c => c.classList.remove('selected-cell'));
      this.classList.add('selected-cell');

      const cellCoord = this.getAttribute('data-cell') || '';
      const cellVal = this.getAttribute('data-val') || '';
      const cellDesc = this.getAttribute('data-desc') || '';

      // Update Toolbar Status
      const inspName = document.getElementById('inspectorCellName');
      const inspVal = document.getElementById('inspectorCellValue');
      if (inspName) inspName.textContent = cellCoord;
      if (inspVal) inspVal.textContent = cellVal;

      // Update Panel Inspektur
      const infoName = document.getElementById('infoCellName');
      const infoVal = document.getElementById('infoCellValue');
      const infoDesc = document.getElementById('infoCellDesc');

      if (infoName) infoName.textContent = cellCoord;
      if (infoVal) infoVal.textContent = cellVal;
      if (infoDesc) infoDesc.textContent = cellDesc;

      // Highlight Column & Row Header
      const colLetter = cellCoord.charAt(0);
      const rowNumber = cellCoord.substring(1);

      document.querySelectorAll('.th-col').forEach(th => {
        if (th.getAttribute('data-col') === colLetter) {
          th.classList.add('col-selected');
        } else {
          th.classList.remove('col-selected');
        }
      });

      document.querySelectorAll('tr[data-row]').forEach(tr => {
        const thRow = tr.querySelector('.th-row');
        if (thRow) {
          if (tr.getAttribute('data-row') === rowNumber) {
            thRow.classList.add('row-selected');
          } else {
            thRow.classList.remove('row-selected');
          }
        }
      });
    });
  });
}

// ====================================================================
// SIMULATOR PETA ANTARMUKA EXCEL (INTERACTIVE UI EXPLORER)
// ====================================================================
const INTERFACE_PARTS_DATA = {
  quick_access: {
    badge: "POJOK KIRI ATAS",
    title: "Quick Access Toolbar",
    desc: "Bilah tombol pintas di pojok kiri atas jendela Excel yang menampung tombol aksi cepat paling sering digunakan: Simpan (Save / Ctrl+S), Batalkan (Undo / Ctrl+Z), dan Ulangi (Redo / Ctrl+Y).",
    use: "Memudahkan siswa menyimpan file hasil latihan praktikum di lab komputer hanya dengan 1 kali klik agar data tidak hilang jika listrik padam atau aplikasi tertutup tiba-tiba.",
    tip: "Gunakan tombol keyboard Ctrl + S secara berkala saat mengerjakan tugas Excel untuk menyimpan perubahan data secara instan!"
  },
  menu_bar: {
    badge: "PITA MENU UTAMA",
    title: "Menu Bar / Ribbon Tabs",
    desc: "Pusat seluruh alat kerja Excel yang dikelompokkan ke dalam tab-tab tematik: File, Home (Beranda), Insert (Sisipkan), Page Layout (Tata Letak), Formulas (Rumus), Data, dan View (Tampilan).",
    use: "Mengatur jenis huruf, border garis tabel, warna cell, menyisipkan grafik/diagram batang, mengatur margin cetak, dan mengakses fungsi perhitungan.",
    tip: "Tab Home (Beranda) adalah menu yang paling sering dipakai (90% waktu) untuk mengedit teks, format angka, dan merapikan tabel."
  },
  name_box: {
    badge: "KIRI FORMULA BAR",
    title: "Name Box (Kotak Nama)",
    desc: "Kotak kecil yang menampilkan alamat sel aktif yang sedang dipilih (misalnya B3) atau nama rentang (range) cell.",
    use: "Mengetahui posisi kursor sel di lembar kerja, dan dapat digunakan sebagai jalan pintas untuk melompat langsung ke cell tertentu.",
    tip: "Ketik alamat cell mana saja di dalam Name Box (misal Z100) lalu tekan Enter, kursor akan langsung berpindah ke cell tersebut dalam sekejap!"
  },
  formula_bar: {
    badge: "BILAH RUMUS",
    title: "Formula Bar (Bilah Rumus)",
    desc: "Bilah panjang tempat mengetik, mengedit, dan menampilkan isi rumus asli atau teks panjang di balik sebuah sel. Dilengkapi tombol fx untuk membuka asisten rumus.",
    use: "Memeriksa rumus asli yang menghitung data. Kotak cell di tabel hanya menampilkan hasil akhir angka, sedangkan rumus aslinya selalu ada di Formula Bar.",
    tip: "Jika rumusmu panjang dan kompleks, selalu periksa dan edit di Formula Bar agar tidak salah meletakkan tanda kurung atau titik koma (;)."
  },
  headers: {
    badge: "PENANDA KOORDINAT",
    title: "Header Kolom (Huruf) & Baris (Angka)",
    desc: "Header Kolom ditandai dengan Huruf (A, B, C... hingga XFD / 16.384 kolom), sedangkan Header Baris ditandai dengan Angka (1, 2, 3... hingga 1.048.576 baris).",
    use: "Menentukan alamat cell (Kolom + Baris). Klik huruf kolom untuk memblok 1 kolom penuh ke bawah, atau klik angka baris untuk memblok 1 baris penuh ke samping.",
    tip: "Arahkan kursor ke garis batas antar-huruf kolom lalu tarik (drag) untuk melebarkan atau menyempitkan kolom jika tulisan nama siswa terpotong!"
  },
  cell_grid: {
    badge: "LEMBAR KERJA",
    title: "Worksheet Grid & Cell Aktif",
    desc: "Hamparan kisi kotak-kotak sel tempat memasukkan data tabel. Cell yang aktif ditandai dengan kotak border hijau tebal dan titik kecil bernama Fill Handle di pojok kanan bawahnya.",
    use: "Menyimpan data berupa teks (nama siswa), angka (nilai ujian), maupun hasil komputasi rumus otomatis.",
    tip: "Tarik titik kotak kecil (Fill Handle) di sudut kanan bawah cell aktif untuk membuat urutan nomor otomatis 1, 2, 3... atau menyalin rumus ke ratusan siswa dalam 1 detik!"
  },
  sheet_tabs: {
    badge: "LEMBAR HALAMAN KERJA",
    title: "Sheet Tabs (Tab Lembar Kerja)",
    desc: "Tab di bagian bawah layar yang menunjukkan lembar kerja aktif. Satu file buku kerja (Workbook) dapat menampung banyak lembar kerja (Worksheet) terpisah.",
    use: "Memisahkan data per kategori (misalnya: Sheet Kelas 8A, Sheet Kelas 8B, Sheet Kas Kelas) tanpa perlu membuat file baru yang berbeda.",
    tip: "Klik ganda (double-click) pada nama sheet untuk mengganti nama (Rename), atau klik kanan lalu pilih Tab Color untuk memberi warna label yang menarik!"
  },
  status_bar: {
    badge: "BAGIAN PALING BAWAH",
    title: "Status Bar & Zoom Control",
    desc: "Bilah informasi di paling bawah jendela kerja. Saat kamu memblok deretan angka, Status Bar otomatis menampilkan Rata-rata (Average), Banyak data (Count), dan Jumlah total (Sum) secara instan tanpa perlu rumus!",
    use: "Mengecek cepat total nilai ulangan atau rata-rata sekilas tanpa harus mengetik rumus =SUM atau =AVERAGE terlebih dahulu.",
    tip: "Gunakan slider penggeser Zoom di pojok kanan bawah (100%) untuk memperbesar tampilan tabel saat diproyeksikan di depan kelas!"
  }
};

function selectInterfacePart(partKey, btnElement) {
  const data = INTERFACE_PARTS_DATA[partKey];
  if (!data) return;

  // Update tombol aktif
  if (btnElement) {
    document.querySelectorAll('.hotspot-btn').forEach(b => b.classList.remove('active'));
    btnElement.classList.add('active');
  }

  // Update kartu penjelasan
  const badgeEl = document.getElementById('infoPartBadge');
  const titleEl = document.getElementById('infoPartTitle');
  const descEl = document.getElementById('infoPartDesc');
  const useEl = document.getElementById('infoPartUse');
  const tipEl = document.getElementById('infoPartTip');

  if (badgeEl) badgeEl.textContent = data.badge;
  if (titleEl) titleEl.textContent = data.title;
  if (descEl) descEl.textContent = data.desc;
  if (useEl) useEl.textContent = data.use;
  if (tipEl) tipEl.textContent = data.tip;

  // Highlight zona visual di mockup
  const allZones = ['quick_access', 'menu_bar', 'name_box', 'formula_bar', 'headers', 'cell_grid', 'sheet_tabs', 'status_bar'];
  allZones.forEach(z => {
    const el = document.getElementById(`zone-${z}`);
    if (el) {
      if (z === partKey) {
        el.classList.add('zone-highlight');
      } else {
        el.classList.remove('zone-highlight');
      }
    }
  });
}

// ====================================================================
// SIMULATOR MANAJEMEN SHEET (INTERACTIVE SHEET MANAGER)
// ====================================================================
let simSheetTabs = [
  { id: 'sheet-1', name: 'Data_Kelas_8A', color: '#107c41' },
  { id: 'sheet-2', name: 'Jadwal_Piket', color: '#0078d4' },
  { id: 'sheet-3', name: 'Kas_Kelas', color: '#ea580c' }
];
let activeSimSheetId = 'sheet-1';

function renderSimSheetTabs() {
  const container = document.getElementById('simSheetTabsContainer');
  if (!container) return;
  container.innerHTML = '';

  simSheetTabs.forEach(sheet => {
    const tab = document.createElement('div');
    tab.className = `sheet-tab-real ${sheet.id === activeSimSheetId ? 'active' : ''}`;
    tab.style.borderBottomColor = sheet.color;
    tab.innerHTML = `<span>${sheet.name}</span>`;
    tab.onclick = () => selectSimSheetTab(sheet.id);
    container.appendChild(tab);
  });

  const activeSheet = simSheetTabs.find(s => s.id === activeSimSheetId);
  const inputRename = document.getElementById('inputSheetRename');
  if (inputRename && activeSheet) {
    inputRename.value = activeSheet.name;
  }
}

function selectSimSheetTab(id) {
  activeSimSheetId = id;
  renderSimSheetTabs();
  const hint = document.getElementById('sheetSimulatorHint');
  const activeSheet = simSheetTabs.find(s => s.id === id);
  if (hint && activeSheet) {
    hint.innerHTML = `👉 Sheet aktif saat ini: <strong>${activeSheet.name}</strong>. Kamu dapat mengganti namanya pada kotak di atas atau memilih warna tab!`;
  }
}

function handleSheetNameInput(newName) {
  const activeSheet = simSheetTabs.find(s => s.id === activeSimSheetId);
  if (activeSheet) {
    activeSheet.name = newName || 'Sheet';
    renderSimSheetTabs();
  }
}

function setSimSheetColor(colorHex) {
  const activeSheet = simSheetTabs.find(s => s.id === activeSimSheetId);
  if (activeSheet) {
    activeSheet.color = colorHex;
    renderSimSheetTabs();
    const hint = document.getElementById('sheetSimulatorHint');
    if (hint) {
      hint.innerHTML = `🎨 Warna tab <strong>${activeSheet.name}</strong> berhasil diubah!`;
    }
  }
}

function addSimSheetTab() {
  const newNum = simSheetTabs.length + 1;
  const newId = `sheet-${Date.now()}`;
  const colors = ['#107c41', '#0078d4', '#ea580c', '#7c3aed', '#dc2626'];
  const assignedColor = colors[simSheetTabs.length % colors.length];

  simSheetTabs.push({
    id: newId,
    name: `Sheet${newNum}`,
    color: assignedColor
  });

  activeSimSheetId = newId;
  renderSimSheetTabs();

  const hint = document.getElementById('sheetSimulatorHint');
  if (hint) {
    hint.innerHTML = `✨ Berhasil menambahkan <strong>Sheet${newNum}</strong>! Kamu bisa mengganti namanya atau memilih warna tab.`;
  }
}

function deleteActiveSimSheet() {
  if (simSheetTabs.length <= 1) {
    alert('Workbook harus memiliki minimal 1 lembar kerja (worksheet). Sheet ini tidak dapat dihapus!');
    return;
  }

  const idx = simSheetTabs.findIndex(s => s.id === activeSimSheetId);
  const deletedName = simSheetTabs[idx].name;
  simSheetTabs.splice(idx, 1);
  activeSimSheetId = simSheetTabs[0].id;
  renderSimSheetTabs();

  const hint = document.getElementById('sheetSimulatorHint');
  if (hint) {
    hint.innerHTML = `🗑️ Sheet <strong>${deletedName}</strong> telah dihapus. Lembar aktif sekarang adalah <strong>${simSheetTabs[0].name}</strong>.`;
  }
}

function resetSimSheetTabsState() {
  simSheetTabs = [
    { id: 'sheet-1', name: 'Data_Kelas_8A', color: '#107c41' },
    { id: 'sheet-2', name: 'Jadwal_Piket', color: '#0078d4' },
    { id: 'sheet-3', name: 'Kas_Kelas', color: '#ea580c' }
  ];
  activeSimSheetId = 'sheet-1';
  renderSimSheetTabs();
}

// ====================================================================
// 4. MENU RUMUS EXCEL: 10 FORMULA LENGKAP & MODAL INTERAKTIF
// ====================================================================
const FORMULAS_DATA = {
  SUM: {
    name: "=SUM",
    title: "Rumus SUM (Penjumlahan Otomatis)",
    category: "Statistik",
    badgeClass: "bg-green-pill",
    desc: "Menjumlahkan seluruh data angka dalam suatu rentang (range) cell secara cepat tanpa harus menambahkan tanda tambah (+) satu per satu.",
    syntax: "=SUM(range)",
    exampleData: `
      <table class="mini-grid-table">
        <tr><th>Cell</th><th>Nilai</th></tr>
        <tr><td>B2</td><td>80</td></tr>
        <tr><td>B3</td><td>75</td></tr>
        <tr><td>B4</td><td>90</td></tr>
        <tr><td>B5</td><td>70</td></tr>
        <tr><td>B6</td><td>85</td></tr>
      </table>`,
    exampleFormula: "=SUM(B2:B6)",
    result: "400",
    whenToUse: "Digunakan saat kamu ingin mengetahui total nilai ulangan, total uang kas kelas, atau jumlah seluruh barang di inventaris.",
    commonMistake: "Menuliskan tanda titik koma pada rentang berurutan, misal <code>=SUM(B2;B6)</code> yang hanya menjumlahkan 2 angka saja, bukan seluruh deret! Gunakan titik dua (<code>:</code>) untuk rentang berjejer.",
    interactiveDemo: {
      type: "sum",
      inputs: [80, 75, 90, 70, 85]
    }
  },
  AVERAGE: {
    name: "=AVERAGE",
    title: "Rumus AVERAGE (Rata-rata Nilai)",
    category: "Statistik",
    badgeClass: "bg-green-pill",
    desc: "Menghitung nilai rata-rata dari kumpulan angka dalam suatu range dengan membagi total jumlah nilai terhadap banyaknya data secara otomatis.",
    syntax: "=AVERAGE(range)",
    exampleData: `
      <table class="mini-grid-table">
        <tr><th>Cell</th><th>Nilai Tugas</th></tr>
        <tr><td>B2</td><td>80</td></tr>
        <tr><td>B3</td><td>75</td></tr>
        <tr><td>B4</td><td>90</td></tr>
        <tr><td>B5</td><td>70</td></tr>
        <tr><td>B6</td><td>85</td></tr>
      </table>`,
    exampleFormula: "=AVERAGE(B2:B6)",
    result: "80",
    whenToUse: "Digunakan untuk menghitung rata-rata nilai rapor siswa, rata-rata suhu harian, atau rata-rata uang saku per minggu.",
    commonMistake: "Mengira AVERAGE menjumlahkan nilai seperti SUM. Ingat: AVERAGE menjumlahkan lalu membaginya dengan jumlah banyaknya data!",
    interactiveDemo: {
      type: "average",
      inputs: [80, 75, 90, 70, 85]
    }
  },
  MAX: {
    name: "=MAX",
    title: "Rumus MAX (Nilai Tertinggi)",
    category: "Statistik",
    badgeClass: "bg-green-pill",
    desc: "Mencari dan menampilkan angka terbesar (maksimum) dari sekelompok nilai yang dipilih.",
    syntax: "=MAX(range)",
    exampleData: `
      <table class="mini-grid-table">
        <tr><th>Siswa</th><th>Nilai UAS</th></tr>
        <tr><td>Andi</td><td>80</td></tr>
        <tr><td>Budi</td><td>75</td></tr>
        <tr><td>Citra</td><td>90</td></tr>
        <tr><td>Deni</td><td>70</td></tr>
        <tr><td>Eka</td><td>85</td></tr>
      </table>`,
    exampleFormula: "=MAX(B2:B6)",
    result: "90",
    whenToUse: "Digunakan ketika guru ingin mengetahui siapa yang meraih nilai tertinggi di kelas, atau mencari suhu terpanas dalam sebulan.",
    commonMistake: "Memasukkan teks ke dalam rumus tanpa tanda petik, atau salah memilih range data.",
    interactiveDemo: {
      type: "max",
      inputs: [80, 75, 90, 70, 85]
    }
  },
  MIN: {
    name: "=MIN",
    title: "Rumus MIN (Nilai Terendah)",
    category: "Statistik",
    badgeClass: "bg-green-pill",
    desc: "Mencari dan menampilkan angka terkecil (minimum) dari sekelompok nilai dalam rentang tertentu.",
    syntax: "=MIN(range)",
    exampleData: `
      <table class="mini-grid-table">
        <tr><th>Siswa</th><th>Nilai Ujian</th></tr>
        <tr><td>Andi</td><td>80</td></tr>
        <tr><td>Budi</td><td>75</td></tr>
        <tr><td>Citra</td><td>90</td></tr>
        <tr><td>Deni</td><td>70</td></tr>
        <tr><td>Eka</td><td>85</td></tr>
      </table>`,
    exampleFormula: "=MIN(B2:B6)",
    result: "70",
    whenToUse: "Digunakan untuk mendata siswa yang memperoleh nilai terendah agar bisa diberikan program bimbingan belajar atau remedial.",
    commonMistake: "Tertukar antara MIN (terkecil) dan MAX (terbesar).",
    interactiveDemo: {
      type: "min",
      inputs: [80, 75, 90, 70, 85]
    }
  },
  SUMIF: {
    name: "=SUMIF",
    title: "Rumus SUMIF (Jumlah Bersyarat)",
    category: "Logika & Hitung",
    badgeClass: "bg-blue-pill",
    desc: "Menjumlahkan angka hanya jika data tersebut memenuhi kriteria atau syarat tertentu yang kita tentukan.",
    syntax: "=SUMIF(range; kriteria; [sum_range])",
    exampleData: `
      <table class="mini-grid-table">
        <tr><th>Barang</th><th>Kategori</th><th>Penjualan</th></tr>
        <tr><td>Buku</td><td>Alat Tulis</td><td>10000</td></tr>
        <tr><td>Pensil</td><td>Alat Tulis</td><td>5000</td></tr>
        <tr><td>Baju</td><td>Pakaian</td><td>50000</td></tr>
        <tr><td>Pulpen</td><td>Alat Tulis</td><td>7000</td></tr>
      </table>`,
    exampleFormula: '=SUMIF(B2:B5; "Alat Tulis"; C2:C5)',
    result: "22000 (10000 + 5000 + 7000)",
    whenToUse: "Digunakan saat kasir ingin menghitung omzet penjualan khusus kategori 'Alat Tulis' saja tanpa memasukkan produk lain.",
    commonMistake: "Lupa memberi tanda petik ganda pada kriteria teks, misalnya menulis <code>Alat Tulis</code> tanpa tanda petik dua (<code>\"Alat Tulis\"</code>).",
    interactiveDemo: {
      type: "sumif",
      category: "Alat Tulis"
    }
  },
  IF: {
    name: "=IF",
    title: "Rumus IF (Keputusan Logika)",
    category: "Logika",
    badgeClass: "bg-blue-pill",
    desc: "Membuat keputusan otomatis: menghasilkan satu nilai jika kondisi bernilai BENAR (TRUE), dan menghasilkan nilai lain jika SALAH (FALSE).",
    syntax: "=IF(kondisi; nilai_jika_benar; nilai_jika_salah)",
    exampleData: `
      <table class="mini-grid-table">
        <tr><th>Nama Siswa</th><th>Nilai</th><th>Status Kelulusan</th></tr>
        <tr><td>Andi</td><td>80</td><td>Lulus</td></tr>
        <tr><td>Budi</td><td>65</td><td>Belum Lulus</td></tr>
      </table>`,
    exampleFormula: '=IF(B2>=75; "Lulus"; "Belum Lulus")',
    result: 'Untuk nilai 80 hasilnya "Lulus", untuk nilai 65 hasilnya "Belum Lulus"',
    whenToUse: "Menentukan status kelulusan siswa berdasarkan KKM (misal >= 75 Lulus), atau menentukan diskon belanja.",
    commonMistake: "Lupa tanda petik dua (\") pada kata hasil teks, atau salah menggunakan tanda pembanding (>=, <=, =).",
    interactiveDemo: {
      type: "if",
      kkm: 75
    }
  },
  COUNT: {
    name: "=COUNT",
    title: "Rumus COUNT (Hitung Banyak Angka)",
    category: "Statistik",
    badgeClass: "bg-green-pill",
    desc: "Menghitung berapa banyak cell yang berisi data ANGKA saja di dalam suatu rentang (cell kosong atau berisi teks akan diabaikan).",
    syntax: "=COUNT(range)",
    exampleData: `
      <table class="mini-grid-table">
        <tr><th>Nama</th><th>Nilai Tugas</th></tr>
        <tr><td>Andi</td><td>85</td></tr>
        <tr><td>Budi</td><td>Belum Kumpul (Teks)</td></tr>
        <tr><td>Citra</td><td>90</td></tr>
      </table>`,
    exampleFormula: "=COUNT(B2:B4)",
    result: "2 (Cell B2 dan B4 yang berisi angka)",
    whenToUse: "Menghitung berapa siswa yang sudah memiliki nilai ujian berupa angka, bukan menjumlahkan angka-angkanya.",
    commonMistake: "Terkecoh antara SUM dan COUNT. SUM = menjumlahkan nilai (85+90=175), sedangkan COUNT = menghitung ada berapa kotak angka (hasil: 2).",
    interactiveDemo: {
      type: "count"
    }
  },
  COUNTIF: {
    name: "=COUNTIF",
    title: "Rumus COUNTIF (Hitung Banyak Data Bersyarat)",
    category: "Logika & Hitung",
    badgeClass: "bg-blue-pill",
    desc: "Menghitung berapa banyak cell yang sesuai dengan satu syarat/kriteria tertentu yang ditentukan.",
    syntax: "=COUNTIF(range; kriteria)",
    exampleData: `
      <table class="mini-grid-table">
        <tr><th>Nama</th><th>Nilai</th></tr>
        <tr><td>Andi</td><td>80</td></tr>
        <tr><td>Budi</td><td>70</td></tr>
        <tr><td>Citra</td><td>90</td></tr>
        <tr><td>Deni</td><td>75</td></tr>
        <tr><td>Eka</td><td>85</td></tr>
      </table>`,
    exampleFormula: '=COUNTIF(B2:B6; ">=75")',
    result: "4 (Siswa yang bernilai >= 75 adalah Andi, Citra, Deni, Eka)",
    whenToUse: "Menghitung berapa banyak siswa yang tuntas KKM, atau menghitung berapa orang yang hadir ('H') dalam daftar presensi kelas.",
    commonMistake: "Lupa meletakkan tanda kutip pada kriteria perbandingan, misalnya menulis <code>>=75</code> tanpa petik dua (seharusnya <code>\">=75\"</code>).",
    interactiveDemo: {
      type: "countif"
    }
  },
  RANK: {
    name: "=RANK.EQ",
    title: "Rumus RANK / RANK.EQ (Peringkat Siswa)",
    category: "Peringkat",
    badgeClass: "bg-purple-pill",
    desc: "Menentukan posisi peringkat atau ranking sebuah angka dibandingkan dengan seluruh kumpulan angka lainnya di dalam kelas.",
    syntax: "=RANK.EQ(nilai; seluruh_rentang; [urutan])",
    exampleData: `
      <table class="mini-grid-table">
        <tr><th>Nama Siswa</th><th>Nilai</th><th>Peringkat</th></tr>
        <tr><td>Citra</td><td>90</td><td>Juara 1</td></tr>
        <tr><td>Eka</td><td>85</td><td>Juara 2</td></tr>
        <tr><td>Andi</td><td>80</td><td>Juara 3</td></tr>
        <tr><td>Budi</td><td>75</td><td>Juara 4</td></tr>
        <tr><td>Deni</td><td>70</td><td>Juara 5</td></tr>
      </table>`,
    exampleFormula: "=RANK.EQ(B2; $B$2:$B$6; 0)",
    result: "Nilai 90 meraih Peringkat 1, nilai 85 meraih Peringkat 2, dst.",
    whenToUse: "Menentukan peringkat juara kelas 1, 2, 3 atau mengurutkan pemenang perlombaan lari dari skor terbaik.",
    commonMistake: "Tidak menggunakan tanda dolar (<code>$B$2:$B$6</code>) saat menyalin rumus ke bawah, sehingga rentang acuannya bergeser dan peringkat menjadi salah!",
    interactiveDemo: {
      type: "rank"
    }
  },
  VLOOKUP: {
    name: "=VLOOKUP",
    title: "Rumus VLOOKUP (Pencarian Vertikal)",
    category: "Pencarian",
    badgeClass: "bg-purple-pill",
    desc: "Mencari suatu data pada kolom pertama sebuah tabel referensi secara vertikal, lalu mengambil data dari kolom lain pada baris yang sama.",
    syntax: "=VLOOKUP(nilai_kunci; rentang_tabel; nomor_kolom; FALSE)",
    exampleData: `
      <table class="mini-grid-table">
        <tr><th>Kode (Kol 1)</th><th>Nama Barang (Kol 2)</th><th>Harga (Kol 3)</th></tr>
        <tr><td>B01</td><td>Buku</td><td>5000</td></tr>
        <tr><td>B02</td><td>Pensil</td><td>3000</td></tr>
        <tr><td>B03</td><td>Penghapus</td><td>2000</td></tr>
      </table>`,
    exampleFormula: '=VLOOKUP("B02"; A2:C4; 2; FALSE)',
    result: "Pensil",
    whenToUse: "Kasir toko mencari nama dan harga barang hanya dengan mengetik kode barang atau barcode secara otomatis.",
    commonMistake: "Lupa mencantumkan parameter <code>FALSE</code> di akhir rumus, yang dapat menyebabkan Excel menampilkan data yang salah jika tabel tidak berurutan.",
    interactiveDemo: {
      type: "vlookup"
    }
  }
};

// Filter Kartu Rumus berdasarkan Kategori
function filterFormulas(category, btnElement) {
  // Update tombol aktif
  const buttons = document.querySelectorAll('.filter-btn');
  buttons.forEach(b => b.classList.remove('active'));
  if (btnElement) btnElement.classList.add('active');

  const cards = document.querySelectorAll('.formula-card');
  cards.forEach(card => {
    const cardCat = card.getAttribute('data-category');
    if (category === 'all' || cardCat === category) {
      card.style.display = 'flex';
    } else {
      card.style.display = 'none';
    }
  });
}

// Buka Modal Detail Rumus
function openFormulaModal(key) {
  const data = FORMULAS_DATA[key];
  if (!data) return;

  // Catat progres rumus yang dibuka
  if (!userProgress.formulasViewed.includes(key)) {
    userProgress.formulasViewed.push(key);
    saveProgress();
  }

  const modal = document.getElementById('formulaModal');
  const modalBadge = document.getElementById('modalBadge');
  const modalBody = document.getElementById('modalBodyContent');

  if (modalBadge) modalBadge.textContent = data.category.toUpperCase();

  let htmlContent = `
    <h2 class="modal-formula-title">${data.name}</h2>
    <p class="modal-formula-desc"><strong>${data.title}:</strong> ${data.desc}</p>

    <div class="modal-section-block">
      <div class="modal-block-title">📐 Bentuk Sintaks Rumus:</div>
      <div class="modal-syntax-box">
        <code>${data.syntax}</code>
      </div>
    </div>

    <div class="modal-section-block">
      <div class="modal-block-title">📊 Contoh Kasus Data di Kelas:</div>
      <div class="modal-example-card">
        ${data.exampleData}
        <div style="margin-top: 12px; font-size: 0.95rem;">
          <strong>Contoh Rumus:</strong> <code>${data.exampleFormula}</code><br>
          <strong>Hasil Komputasi Excel:</strong> <span style="color: var(--excel-green); font-weight: 800;">${data.result}</span>
        </div>
      </div>
    </div>

    <div class="modal-section-block">
      <div class="modal-block-title">💡 Kapan Harus Digunakan?</div>
      <p style="font-size: 0.92rem; color: var(--text-normal);">${data.whenToUse}</p>
    </div>

    <div class="modal-section-block">
      <div class="modal-common-mistake">
        <div class="mistake-title">⚠️ Hindari Kesalahan Umum Ini:</div>
        <p class="mistake-desc">${data.commonMistake}</p>
      </div>
    </div>
  `;

  if (modalBody) modalBody.innerHTML = htmlContent;
  if (modal) modal.classList.add('active');
}

// Tutup Modal
function closeFormulaModal() {
  const modal = document.getElementById('formulaModal');
  if (modal) modal.classList.remove('active');
}

function closeFormulaModalOnOutside(event) {
  if (event.target.id === 'formulaModal') {
    closeFormulaModal();
  }
}

// ====================================================================
// SIMULASI VLOOKUP INTERAKTIF (DI DALAM MENU RUMUS)
// ====================================================================
const VLOOKUP_DATABASE = {
  B01: { nama: 'Buku Tulis', harga: 'Rp 5.000', rawHarga: 5000 },
  B02: { nama: 'Pensil', harga: 'Rp 3.000', rawHarga: 3000 },
  B03: { nama: 'Penghapus', harga: 'Rp 2.000', rawHarga: 2000 }
};

function runVlookupSimulation() {
  const select = document.getElementById('vlookupSelect');
  if (!select) return;
  const kode = select.value;
  const item = VLOOKUP_DATABASE[kode];
  if (!item) return;

  // Update rumus yang ditampilkan
  const vfNama = document.getElementById('vfNama');
  const vfHarga = document.getElementById('vfHarga');
  if (vfNama) vfNama.textContent = `=VLOOKUP("${kode}"; A2:C4; 2; FALSE)`;
  if (vfHarga) vfHarga.textContent = `=VLOOKUP("${kode}"; A2:C4; 3; FALSE)`;

  // Update hasil
  const resNama = document.getElementById('vlookupResNama');
  const resHarga = document.getElementById('vlookupResHarga');
  if (resNama) resNama.textContent = item.nama;
  if (resHarga) resHarga.textContent = item.harga;

  // Highlight baris di tabel referensi
  ['B01', 'B02', 'B03'].forEach(k => {
    const row = document.getElementById(`vrow-${k}`);
    if (row) {
      if (k === kode) {
        row.classList.add('highlight-vrow');
      } else {
        row.classList.remove('highlight-vrow');
      }
    }
  });
}

// ====================================================================
// 5. MENU AKTIVITAS
// ====================================================================

// Switch Sub-Panel Aktivitas
function switchAktivitas(aktId, btnElement) {
  const buttons = document.querySelectorAll('.sub-tab-btn');
  buttons.forEach(b => b.classList.remove('active'));
  if (btnElement) btnElement.classList.add('active');

  const panels = document.querySelectorAll('.aktivitas-panel');
  panels.forEach(p => {
    if (p.id === aktId) {
      p.classList.add('active');
    } else {
      p.classList.remove('active');
    }
  });
}

// --------------------------------------------------------------------
// AKTIVITAS 1: COCOKKAN RUMUS (MENJODOHKAN)
// --------------------------------------------------------------------
let matchingState = {
  selectedLeftKey: null,
  selectedLeftElement: null,
  userPairs: {} // { SUM: 'SUM', AVERAGE: 'AVERAGE', ... }
};

function selectMatchLeft(key, element) {
  // Reset border seleksi sebelumnya di daftar rumus
  document.querySelectorAll('.match-item-btn').forEach(btn => {
    btn.classList.remove('selected');
  });

  matchingState.selectedLeftKey = key;
  matchingState.selectedLeftElement = element;
  element.classList.add('selected');

  const feedback = document.getElementById('matchingFeedback');
  if (feedback) {
    feedback.innerHTML = `👉 Rumus <strong>${key}</strong> dipilih. Sekarang tentukan fungsi yang cocok pada daftar fungsi!`;
    feedback.style.color = 'var(--accent-blue)';
  }
}

function selectMatchRight(targetKey, element) {
  if (!matchingState.selectedLeftKey) {
    alert('Silakan pilih salah satu nama rumus terlebih dahulu!');
    return;
  }

  const leftKey = matchingState.selectedLeftKey;

  // Jika rumus ini sebelumnya sudah punya pasangan, bersihkan elemen fungsi lama
  const prevTarget = matchingState.userPairs[leftKey];
  if (prevTarget) {
    const prevRightEl = document.querySelector(`.match-desc-btn[data-target="${prevTarget}"]`);
    if (prevRightEl) {
      prevRightEl.classList.remove('paired');
    }
  }

  // Jika fungsi ini sudah pernah dipilih oleh rumus lain, bersihkan rumus lain tersebut
  for (const k in matchingState.userPairs) {
    if (matchingState.userPairs[k] === targetKey && k !== leftKey) {
      delete matchingState.userPairs[k];
      const otherLeftEl = document.querySelector(`.match-item-btn[data-key="${k}"]`);
      if (otherLeftEl) {
        otherLeftEl.classList.remove('paired');
      }
    }
  }

  // Simpan pasangan siswa
  matchingState.userPairs[leftKey] = targetKey;

  // Visual feedback: beri tanda warna bahwa sudah terpasang
  if (matchingState.selectedLeftElement) {
    matchingState.selectedLeftElement.classList.remove('selected');
    matchingState.selectedLeftElement.classList.add('paired');
  }
  element.classList.add('paired');

  const feedback = document.getElementById('matchingFeedback');
  if (feedback) {
    const pairedCount = Object.keys(matchingState.userPairs).length;
    feedback.innerHTML = `✅ Rumus <strong>${leftKey}</strong> dipasangkan (${pairedCount}/10). Lanjutkan atau klik <strong>Periksa</strong> jika sudah selesai!`;
    feedback.style.color = 'var(--excel-green-dark)';
  }

  // Reset pilihan kiri
  matchingState.selectedLeftKey = null;
  matchingState.selectedLeftElement = null;
}

function checkMatchingAnswers() {
  const keys = ['SUM', 'AVERAGE', 'MAX', 'MIN', 'IF', 'COUNT', 'COUNTIF', 'SUMIF', 'RANK', 'VLOOKUP'];
  let correctCount = 0;

  keys.forEach(key => {
    const matchedWith = matchingState.userPairs[key];
    const leftEl = document.querySelector(`.match-item-btn[data-key="${key}"]`);
    const rightEl = document.querySelector(`.match-desc-btn[data-target="${matchedWith}"]`);

    if (matchedWith && matchedWith === key) {
      correctCount++;
      if (leftEl) {
        leftEl.classList.add('correct');
        leftEl.classList.remove('wrong', 'paired');
      }
      if (rightEl) {
        rightEl.classList.add('correct');
        rightEl.classList.remove('wrong', 'paired');
      }
    } else if (matchedWith) {
      if (leftEl) {
        leftEl.classList.add('wrong');
        leftEl.classList.remove('correct', 'paired');
      }
      if (rightEl) {
        rightEl.classList.add('wrong');
        rightEl.classList.remove('correct', 'paired');
      }
    }
  });

  // Tampilkan Skor
  const scoreText = document.getElementById('matchingScoreText');
  if (scoreText) scoreText.textContent = `${correctCount} / 10`;

  const feedback = document.getElementById('matchingFeedback');
  if (feedback) {
    if (correctCount === 10) {
      feedback.innerHTML = `🎉 <strong>Luar Biasa Sempurna!</strong> Semua 10 rumus berhasil kamu cocokkan dengan benar! (Skor: 10/10)`;
      feedback.style.color = '#15803d';
      userProgress.activitiesDone.matching = true;
      saveProgress();
    } else {
      feedback.innerHTML = `Kamu berhasil mencocokkan <strong>${correctCount} dari 10</strong> pasangan. Kotak merah menandakan pasangan yang masih keliru. Klik tombol <strong>Ulangi Aktivitas</strong> untuk mencoba kembali!`;
      feedback.style.color = '#b91c1c';
    }
  }
}

function resetMatchingActivity() {
  matchingState = {
    selectedLeftKey: null,
    selectedLeftElement: null,
    userPairs: {}
  };

  document.querySelectorAll('.match-item-btn, .match-desc-btn').forEach(btn => {
    btn.classList.remove('selected', 'correct', 'wrong', 'paired');
    btn.style.borderColor = '';
  });

  const scoreText = document.getElementById('matchingScoreText');
  if (scoreText) scoreText.textContent = '0 / 10';

  const feedback = document.getElementById('matchingFeedback');
  if (feedback) feedback.textContent = '';
}

// --------------------------------------------------------------------
// AKTIVITAS 2: SUSUN RUMUS (DRAG AND DROP)
// --------------------------------------------------------------------
const DRAG_PUZZLES = [
  {
    id: 1,
    desc: "Menjumlahkan seluruh nilai dari cell B2 sampai B6",
    targetFormula: "=SUM(B2:B6)",
    parts: ["=SUM(", "B2:B6", ")"]
  },
  {
    id: 2,
    desc: "Menghitung rata-rata nilai UTS dari cell C2 sampai C6",
    targetFormula: "=AVERAGE(C2:C6)",
    parts: ["=AVERAGE(", "C2:C6", ")"]
  },
  {
    id: 3,
    desc: "Mencari nilai UAS tertinggi dari cell D2 sampai D6",
    targetFormula: "=MAX(D2:D6)",
    parts: ["=MAX(", "D2:D6", ")"]
  },
  {
    id: 4,
    desc: "Mencari nilai UAS terendah dari cell D2 sampai D6",
    targetFormula: "=MIN(D2:D6)",
    parts: ["=MIN(", "D2:D6", ")"]
  },
  {
    id: 5,
    desc: "Menghitung jumlah cell yang berisi angka dari cell E2 sampai E10",
    targetFormula: "=COUNT(E2:E10)",
    parts: ["=COUNT(", "E2:E10", ")"]
  }
];

let currentPuzzleIdx = 0;
let draggedElement = null;

function loadDragPuzzle(index) {
  if (index >= DRAG_PUZZLES.length) {
    // Selesai seluruh soal
    const container = document.querySelector('.drag-question-box');
    if (container) {
      container.innerHTML = `
        <div style="text-align:center; padding: 30px;">
          <div style="font-size: 3.5rem;">🎉</div>
          <h3>Hebat! Kamu Berhasil Menyusun Seluruh 5 Rumus!</h3>
          <p style="margin: 12px 0 20px 0; color: var(--text-normal);">Logika dan pemahamanmu tentang urutan sintaks rumus Excel sudah sangat baik.</p>
          <button class="btn btn-primary" onclick="restartDragActivity()">🔄 Ulangi Dari Soal 1</button>
        </div>
      `;
    }
    userProgress.activitiesDone.dragDrop = true;
    saveProgress();
    return;
  }

  currentPuzzleIdx = index;
  const p = DRAG_PUZZLES[index];

  // Update teks deskripsi
  const targetTag = document.getElementById('puzzleTargetFormula');
  const goalDesc = document.getElementById('puzzleGoalDesc');
  const progressText = document.getElementById('dragProgressText');

  if (targetTag) targetTag.textContent = `Tantangan #${index + 1}`;
  if (goalDesc) goalDesc.innerHTML = `Susun rumus untuk: <strong>${p.desc}</strong>`;
  if (progressText) progressText.textContent = `Soal ${index + 1} dari ${DRAG_PUZZLES.length}`;

  // Bersihkan target slots
  const dropSlots = document.getElementById('dropSlotsRow');
  if (dropSlots) dropSlots.innerHTML = '';

  // Acak potongan chip
  const shuffled = [...p.parts].sort(() => Math.random() - 0.5);
  const pool = document.getElementById('chipPool');
  if (pool) {
    pool.innerHTML = '';
    shuffled.forEach((text, i) => {
      const chip = document.createElement('div');
      chip.className = 'formula-chip';
      chip.draggable = true;
      chip.textContent = text;
      chip.setAttribute('data-val', text);
      chip.id = `chip-${index}-${i}`;

      // Drag events
      chip.addEventListener('dragstart', handleDragStart);
      chip.addEventListener('dragend', handleDragEnd);

      // Click to move (untuk layar sentuh / kemudahan siswa)
      chip.addEventListener('click', function() {
        toggleChipPlacement(this);
      });

      pool.appendChild(chip);
    });
  }

  // Sembunyikan tombol next & bersihkan feedback
  const nextBtn = document.getElementById('btnNextPuzzle');
  if (nextBtn) nextBtn.style.display = 'none';

  const feedback = document.getElementById('dragFeedback');
  if (feedback) feedback.textContent = '';
}

function handleDragStart(e) {
  draggedElement = this;
  e.dataTransfer.setData('text/plain', this.id);
  setTimeout(() => this.style.opacity = '0.5', 0);
}

function handleDragEnd() {
  this.style.opacity = '1';
  draggedElement = null;
  const dropSlots = document.getElementById('dropSlotsRow');
  if (dropSlots) dropSlots.classList.remove('drag-over');
}

function handleDragOver(e) {
  e.preventDefault();
  const dropSlots = document.getElementById('dropSlotsRow');
  if (dropSlots) dropSlots.classList.add('drag-over');
}

function handleDropToTarget(e) {
  e.preventDefault();
  const dropSlots = document.getElementById('dropSlotsRow');
  if (dropSlots && draggedElement) {
    dropSlots.appendChild(draggedElement);
    draggedElement.classList.add('in-slot');
  }
}

function handleDropToPool(e) {
  e.preventDefault();
  const pool = document.getElementById('chipPool');
  if (pool && draggedElement) {
    pool.appendChild(draggedElement);
    draggedElement.classList.remove('in-slot');
  }
}

// Fallback klik chip untuk berpindah tempat (mobile/tablet friendly)
function toggleChipPlacement(chip) {
  const dropSlots = document.getElementById('dropSlotsRow');
  const pool = document.getElementById('chipPool');

  if (chip.parentElement === dropSlots) {
    pool.appendChild(chip);
    chip.classList.remove('in-slot');
  } else {
    dropSlots.appendChild(chip);
    chip.classList.add('in-slot');
  }
}

function checkDragPuzzle() {
  const dropSlots = document.getElementById('dropSlotsRow');
  if (!dropSlots) return;

  const placedChips = dropSlots.querySelectorAll('.formula-chip');
  const assembled = Array.from(placedChips).map(c => c.getAttribute('data-val')).join('');

  const current = DRAG_PUZZLES[currentPuzzleIdx];
  const feedback = document.getElementById('dragFeedback');
  const nextBtn = document.getElementById('btnNextPuzzle');

  if (placedChips.length === 0) {
    if (feedback) {
      feedback.innerHTML = '⚠️ Kamu belum menyusun potongan rumus ke dalam kotak atas!';
      feedback.style.color = '#ea580c';
    }
    return;
  }

  if (assembled === current.targetFormula) {
    if (feedback) {
      feedback.innerHTML = `✅ <strong>BENAR!</strong> Rumus <code>${assembled}</code> tersusun dengan tepat!`;
      feedback.style.color = '#15803d';
    }
    if (nextBtn) nextBtn.style.display = 'inline-flex';
  } else {
    if (feedback) {
      feedback.innerHTML = `❌ Susunan <code>${assembled}</code> masih belum tepat. Coba ubah urutannya kembali!`;
      feedback.style.color = '#b91c1c';
    }
  }
}

function resetCurrentPuzzle() {
  loadDragPuzzle(currentPuzzleIdx);
}

function nextDragPuzzle() {
  loadDragPuzzle(currentPuzzleIdx + 1);
}

function restartDragActivity() {
  location.reload(); // atau loadDragPuzzle(0)
}

// --------------------------------------------------------------------
// AKTIVITAS 3: PILIH RUMUS YANG TEPAT (8 STUDI KASUS)
// --------------------------------------------------------------------
const SCENARIO_QUESTIONS = [
  {
    q: "Rumus apa yang paling tepat digunakan untuk mencari angka nilai ulangan matematika tertinggi di antara siswa?",
    options: ["SUM", "MAX", "COUNT", "IF"],
    answer: 1, // MAX
    explanation: "Rumus MAX digunakan untuk mencari angka terbesar atau tertinggi dari sekelompok data dalam suatu range."
  },
  {
    q: "Rumus apa yang digunakan untuk menjumlahkan seluruh total nilai Matematika dari Andi sampai Eka?",
    options: ["SUM", "AVERAGE", "MIN", "COUNTIF"],
    answer: 0, // SUM
    explanation: "Rumus SUM digunakan untuk menjumlahkan angka secara keseluruhan dalam suatu rentang (range)."
  },
  {
    q: "Rumus apa yang digunakan untuk menghitung nilai rata-rata Matematika kelas?",
    options: ["MAX", "COUNT", "AVERAGE", "RANK"],
    answer: 2, // AVERAGE
    explanation: "Rumus AVERAGE membagi jumlah total nilai dengan banyaknya siswa untuk menghasilkan nilai rata-rata."
  },
  {
    q: "Guru ingin mencari nilai terendah di kelas untuk diberikan bimbingan khusus. Rumus apa yang digunakan?",
    options: ["MIN", "MAX", "SUMIF", "VLOOKUP"],
    answer: 0, // MIN
    explanation: "Rumus MIN digunakan untuk mencari nilai angka terkecil (minimum) dalam suatu rentang cell."
  },
  {
    q: "Jika KKM Matematika adalah 75, rumus apa yang digunakan untuk menentukan siswa 'Lulus' atau 'Remedial'?",
    options: ["COUNT", "IF", "SUM", "AVERAGE"],
    answer: 1, // IF
    explanation: "Rumus IF digunakan untuk membuat keputusan logika berdasarkan kondisi: jika >= 75 'Lulus', jika tidak 'Remedial'."
  },
  {
    q: "Jika kamu ingin menghitung berapa banyak siswa yang memiliki data nilai angka (bukan menjumlahkannya), rumus apa yang kamu pilih?",
    options: ["SUM", "COUNT", "MAX", "IF"],
    answer: 1, // COUNT
    explanation: "Rumus COUNT menghitung berapa banyak cell yang terisi angka numerik."
  },
  {
    q: "Rumus apa yang digunakan untuk menghitung berapa banyak siswa yang nilainya tuntas atau lebih besar dari 75 (>=75)?",
    options: ["COUNTIF", "SUMIF", "RANK", "MIN"],
    answer: 0, // COUNTIF
    explanation: "Rumus COUNTIF digunakan untuk menghitung banyaknya cell yang memenuhi satu syarat/kriteria tertentu."
  },
  {
    q: "Rumus apa yang digunakan untuk menentukan peringkat ranking siswa dari nilai tertinggi ke terendah?",
    options: ["RANK / RANK.EQ", "VLOOKUP", "AVERAGE", "COUNT"],
    answer: 0, // RANK
    explanation: "Rumus RANK.EQ digunakan untuk menentukan posisi peringkat suatu nilai di antara kumpulan nilai siswa lainnya."
  }
];

let scenarioIdx = 0;
let scenarioScore = 0;

function loadScenarioQuestion(idx) {
  if (idx >= SCENARIO_QUESTIONS.length) {
    const container = document.getElementById('scenarioQuizContainer');
    if (container) {
      container.innerHTML = `
        <div style="text-align: center; padding: 24px;">
          <div style="font-size: 3.5rem;">🏆</div>
          <h3>Luar Biasa! Kamu Telah Menyelesaikan Seluruh Studi Kasus!</h3>
          <p style="font-size: 1.1rem; margin: 12px 0 20px 0;">Skor Akhir Studi Kasus: <strong>${scenarioScore} dari 8 Benar</strong></p>
          <button class="btn btn-primary" onclick="restartScenarioActivity()">🔄 Ulangi Latihan Kasus</button>
        </div>
      `;
    }
    userProgress.activitiesDone.scenario = true;
    saveProgress();
    return;
  }

  scenarioIdx = idx;
  const item = SCENARIO_QUESTIONS[idx];

  const badge = document.getElementById('scQuestionBadge');
  const questionText = document.getElementById('scQuestionText');
  const grid = document.getElementById('scOptionsGrid');
  const feedbackBox = document.getElementById('scFeedbackBox');
  const nextBtn = document.getElementById('btnNextScenario');

  if (badge) badge.textContent = `Kasus ${idx + 1} dari ${SCENARIO_QUESTIONS.length}`;
  if (questionText) questionText.textContent = item.q;
  if (feedbackBox) {
    feedbackBox.style.display = 'none';
    feedbackBox.className = 'sc-feedback-box';
  }
  if (nextBtn) nextBtn.style.display = 'none';

  if (grid) {
    grid.innerHTML = '';
    const letters = ['A', 'B', 'C', 'D'];
    item.options.forEach((opt, optIndex) => {
      const btn = document.createElement('button');
      btn.className = 'sc-opt-btn';
      btn.innerHTML = `<span class="opt-prefix">${letters[optIndex]}</span> <span>${opt}</span>`;
      btn.onclick = function() {
        handleScenarioChoice(optIndex, btn);
      };
      grid.appendChild(btn);
    });
  }
}

function handleScenarioChoice(selectedOpt, btnElement) {
  const item = SCENARIO_QUESTIONS[scenarioIdx];
  const allBtns = document.querySelectorAll('.sc-opt-btn');
  allBtns.forEach(b => b.classList.add('disabled'));

  const feedbackBox = document.getElementById('scFeedbackBox');
  const nextBtn = document.getElementById('btnNextScenario');

  if (selectedOpt === item.answer) {
    btnElement.classList.add('correct');
    scenarioScore++;
    const scoreText = document.getElementById('caseScoreText');
    if (scoreText) scoreText.textContent = `${scenarioScore} / 8`;

    if (feedbackBox) {
      feedbackBox.className = 'sc-feedback-box correct';
      feedbackBox.innerHTML = `✅ <strong>Jawaban Tepat Sekali!</strong> ${item.explanation}`;
      feedbackBox.style.display = 'block';
    }
  } else {
    btnElement.classList.add('wrong');
    // Tunjukkan jawaban yang benar
    if (allBtns[item.answer]) {
      allBtns[item.answer].classList.add('correct');
    }

    if (feedbackBox) {
      feedbackBox.className = 'sc-feedback-box wrong';
      feedbackBox.innerHTML = `❌ <strong>Kurang Tepat.</strong> Jawaban yang benar adalah <strong>${item.options[item.answer]}</strong>. ${item.explanation}`;
      feedbackBox.style.display = 'block';
    }
  }

  if (nextBtn) nextBtn.style.display = 'inline-flex';
}

function nextScenarioQuestion() {
  loadScenarioQuestion(scenarioIdx + 1);
}

function restartScenarioActivity() {
  scenarioIdx = 0;
  scenarioScore = 0;
  const scoreText = document.getElementById('caseScoreText');
  if (scoreText) scoreText.textContent = '0 / 8';
  loadScenarioQuestion(0);
}

// --------------------------------------------------------------------
// AKTIVITAS 4: SIMULASI EXCEL INTERAKTIF (MINI SPREADSHEET)
// --------------------------------------------------------------------
const SIM_STUDENT_DATA = [
  { nama: 'Andi', tugas: 80, uts: 75, uas: 85 },
  { nama: 'Budi', tugas: 70, uts: 80, uas: 75 },
  { nama: 'Citra', tugas: 90, uts: 85, uas: 95 },
  { nama: 'Deni', tugas: 75, uts: 70, uas: 80 },
  { nama: 'Eka', tugas: 85, uts: 90, uas: 88 }
];

function runSpreadsheetSimulation(formulaName, btnElement) {
  // Update state tombol aktif
  const buttons = document.querySelectorAll('.btn-sim-rumus');
  buttons.forEach(b => b.classList.remove('active'));
  if (btnElement) btnElement.classList.add('active');

  // Bersihkan highlight lama
  document.querySelectorAll('.cell-cell').forEach(c => c.classList.remove('range-highlight'));

  // Reset Kolom Keterangan ke default dash
  for (let i = 2; i <= 6; i++) {
    const elKet = document.querySelector(`td[data-coord="E${i}"]`);
    if (elKet) elKet.textContent = '-';
  }

  const nameBox = document.getElementById('simNameBox');
  const fInput = document.getElementById('simFormulaInput');
  const resLabel = document.getElementById('simResultLabel');
  const resB = document.getElementById('simResultB');
  const resC = document.getElementById('simResultC');
  const resD = document.getElementById('simResultD');
  const resE = document.getElementById('simResultE');
  const expBadge = document.getElementById('simExpBadge');
  const expResult = document.getElementById('simExpResult');
  const expDesc = document.getElementById('simExpDesc');

  // Ambil deret angka
  const tugasArr = SIM_STUDENT_DATA.map(d => d.tugas); // [80, 70, 90, 75, 85]
  const utsArr = SIM_STUDENT_DATA.map(d => d.uts);       // [75, 80, 85, 70, 90]
  const uasArr = SIM_STUDENT_DATA.map(d => d.uas);       // [85, 75, 95, 80, 88]

  // Highlight kolom B, C, D
  const highlightColumn = (colLetter) => {
    for (let r = 2; r <= 6; r++) {
      const cell = document.querySelector(`td[data-coord="${colLetter}${r}"]`);
      if (cell) cell.classList.add('range-highlight');
    }
  };

  switch(formulaName) {
    case 'SUM':
      highlightColumn('B');
      if (nameBox) nameBox.textContent = 'B2:B6';
      if (fInput) fInput.textContent = '=SUM(B2:B6)';
      if (resLabel) resLabel.textContent = 'TOTAL NILAI (SUM):';
      if (resB) resB.textContent = '400';
      if (resC) resC.textContent = '400';
      if (resD) resD.textContent = '423';
      if (resE) resE.textContent = '-';

      if (expBadge) expBadge.textContent = 'Rumus: =SUM(B2:B6)';
      if (expResult) expResult.textContent = 'Hasil: 400';
      if (expDesc) expDesc.innerHTML = 'Rumus <code>=SUM(B2:B6)</code> menjumlahkan seluruh angka tugas siswa: <strong>80 + 70 + 90 + 75 + 85 = 400</strong>.';
      break;

    case 'AVERAGE':
      highlightColumn('B');
      if (nameBox) nameBox.textContent = 'B2:B6';
      if (fInput) fInput.textContent = '=AVERAGE(B2:B6)';
      if (resLabel) resLabel.textContent = 'RATA-RATA (AVERAGE):';
      if (resB) resB.textContent = '80';
      if (resC) resC.textContent = '80';
      if (resD) resD.textContent = '84.6';
      if (resE) resE.textContent = '-';

      if (expBadge) expBadge.textContent = 'Rumus: =AVERAGE(B2:B6)';
      if (expResult) expResult.textContent = 'Hasil: 80';
      if (expDesc) expDesc.innerHTML = 'Rumus <code>=AVERAGE(B2:B6)</code> membagi total nilai (400) dengan jumlah siswa (5 orang) sehingga menghasilkan rata-rata <strong>80</strong>.';
      break;

    case 'MAX':
      highlightColumn('D');
      if (nameBox) nameBox.textContent = 'D2:D6';
      if (fInput) fInput.textContent = '=MAX(D2:D6)';
      if (resLabel) resLabel.textContent = 'NILAI MAKSIMUM (MAX):';
      if (resB) resB.textContent = '90';
      if (resC) resC.textContent = '90';
      if (resD) resD.textContent = '95';
      if (resE) resE.textContent = '-';

      if (expBadge) expBadge.textContent = 'Rumus: =MAX(D2:D6)';
      if (expResult) expResult.textContent = 'Hasil: 95';
      if (expDesc) expDesc.innerHTML = 'Rumus <code>=MAX(D2:D6)</code> mencari angka UAS terbesar di antara siswa. Nilai tertinggi diraih oleh <strong>Citra (95)</strong>.';
      break;

    case 'MIN':
      highlightColumn('C');
      if (nameBox) nameBox.textContent = 'C2:C6';
      if (fInput) fInput.textContent = '=MIN(C2:C6)';
      if (resLabel) resLabel.textContent = 'NILAI MINIMUM (MIN):';
      if (resB) resB.textContent = '70';
      if (resC) resC.textContent = '70';
      if (resD) resD.textContent = '75';
      if (resE) resE.textContent = '-';

      if (expBadge) expBadge.textContent = 'Rumus: =MIN(C2:C6)';
      if (expResult) expResult.textContent = 'Hasil: 70';
      if (expDesc) expDesc.innerHTML = 'Rumus <code>=MIN(C2:C6)</code> menemukan nilai UTS terendah di kelas, yaitu <strong>70 (Milik Deni)</strong>.';
      break;

    case 'COUNT':
      highlightColumn('B');
      if (nameBox) nameBox.textContent = 'B2:B6';
      if (fInput) fInput.textContent = '=COUNT(B2:B6)';
      if (resLabel) resLabel.textContent = 'BANYAK DATA ANGKA (COUNT):';
      if (resB) resB.textContent = '5';
      if (resC) resC.textContent = '5';
      if (resD) resD.textContent = '5';
      if (resE) resE.textContent = '-';

      if (expBadge) expBadge.textContent = 'Rumus: =COUNT(B2:B6)';
      if (expResult) expResult.textContent = 'Hasil: 5 Siswa';
      if (expDesc) expDesc.innerHTML = 'Rumus <code>=COUNT(B2:B6)</code> menghitung ada berapa cell yang berisi angka. Hasilnya <strong>5 cell</strong> (kelima siswa sudah mengumpulkan nilai).';
      break;

    case 'COUNTIF':
      highlightColumn('B');
      if (nameBox) nameBox.textContent = 'B2:B6';
      if (fInput) fInput.textContent = '=COUNTIF(B2:B6; ">=80")';
      if (resLabel) resLabel.textContent = 'JUMLAH NILAI >= 80:';
      if (resB) resB.textContent = '3 Siswa';
      if (resC) resC.textContent = '3 Siswa';
      if (resD) resD.textContent = '4 Siswa';
      if (resE) resE.textContent = '-';

      if (expBadge) expBadge.textContent = 'Rumus: =COUNTIF(B2:B6; ">=80")';
      if (expResult) expResult.textContent = 'Hasil: 3 Siswa';
      if (expDesc) expDesc.innerHTML = 'Rumus <code>=COUNTIF(B2:B6; ">=80")</code> menghitung siswa dengan nilai tugas &ge; 80, yaitu <strong>Andi (80), Citra (90), dan Eka (85)</strong>.';
      break;

    case 'IF':
      highlightColumn('B');
      if (nameBox) nameBox.textContent = 'E2:E6';
      if (fInput) fInput.textContent = '=IF(B2>=75; "Lulus"; "Remedial")';
      if (resLabel) resLabel.textContent = 'STATUS KELULUSAN (KKM 75):';
      if (resB) resB.textContent = '-';
      if (resC) resC.textContent = '-';
      if (resD) resD.textContent = '-';
      if (resE) resE.textContent = 'Selesai';

      // Update kolom keterangan langsung di tabel!
      const statusMap = ['Lulus', 'Remedial', 'Lulus', 'Lulus', 'Lulus'];
      statusMap.forEach((st, i) => {
        const cell = document.querySelector(`td[data-coord="E${i + 2}"]`);
        if (cell) {
          cell.textContent = st;
          cell.style.color = st === 'Lulus' ? '#15803d' : '#b91c1c';
          cell.style.fontWeight = '800';
        }
      });

      if (expBadge) expBadge.textContent = 'Rumus: =IF(B2>=75; "Lulus"; "Remedial")';
      if (expResult) expResult.textContent = 'Kolom E Terisi Otomatis!';
      if (expDesc) expDesc.innerHTML = 'Rumus IF mengecek nilai tugas: Andi (80) &rarr; <strong>Lulus</strong>, Budi (70) &rarr; <strong>Remedial</strong>, Citra (90) &rarr; <strong>Lulus</strong>, Deni (75) &rarr; <strong>Lulus</strong>, Eka (85) &rarr; <strong>Lulus</strong>.';
      break;

    case 'RANK':
      highlightColumn('D');
      if (nameBox) nameBox.textContent = 'E2:E6';
      if (fInput) fInput.textContent = '=RANK.EQ(D2; $D$2:$D$6; 0)';
      if (resLabel) resLabel.textContent = 'PERINGKAT UAS (RANK):';
      if (resB) resB.textContent = '-';
      if (resC) resC.textContent = '-';
      if (resD) resD.textContent = '-';
      if (resE) resE.textContent = 'Urutan 1 - 5';

      // Urutan peringkat UAS: Citra(95)=1, Eka(88)=2, Andi(85)=3, Deni(80)=4, Budi(75)=5
      const rankMap = ['Peringkat 3', 'Peringkat 5', 'Juara 1 🏆', 'Peringkat 4', 'Peringkat 2 🥈'];
      rankMap.forEach((rk, i) => {
        const cell = document.querySelector(`td[data-coord="E${i + 2}"]`);
        if (cell) {
          cell.textContent = rk;
          cell.style.color = '#7c3aed';
          cell.style.fontWeight = '800';
        }
      });

      if (expBadge) expBadge.textContent = 'Rumus: =RANK.EQ(D2; $D$2:$D$6; 0)';
      if (expResult) expResult.textContent = 'Peringkat Ditentukan!';
      if (expDesc) expDesc.innerHTML = 'Excel membandingkan nilai UAS seluruh siswa dan menyusun peringkat: <strong>Citra meraih Juara 1</strong> dengan nilai 95.';
      break;
  }

  // Catat progress aktivitas simulasi
  userProgress.activitiesDone.simulasi = true;
  saveProgress();
}

// ====================================================================

// 6. MENU KUIS INTERAKTIF (BANK SOAL 200 SOAL DENGAN LEVEL LOW, MOTS, & HOTS)
// ====================================================================
// Bank Soal lengkap 200 butir mencakup seluruh materi Informatika Kelas VIII:
// Antarmuka, Fitur Penting, Cell, Fill Handle, Format Data, Sheet Manager,
// Formula Bar, Name Box, 10 Rumus Utama, dan Diagnosa Error Excel.
// ====================================================================
const QUIZ_BANK_200 = [
  {
    "id": 1,
    "category": "Antarmuka & Fitur Excel",
    "level": "LOW",
    "question": "Perangkat lunak Microsoft Excel termasuk ke dalam kategori program aplikasi...",
    "options": [
      "Pengolah kata (Word Processor)",
      "Pengolah angka / lembar kerja (Spreadsheet)",
      "Presentasi multimedia",
      "Basis data relasional (DBMS)"
    ],
    "answer": 1,
    "explanation": "Microsoft Excel adalah program spreadsheet (pengolah angka) yang dirancang untuk mengolah data, perhitungan, tabel, dan grafik."
  },
  {
    "id": 2,
    "category": "Antarmuka & Fitur Excel",
    "level": "LOW",
    "question": "Pita menu di bagian atas Excel yang memuat berbagai tab perintah seperti Home, Insert, dan Page Layout disebut...",
    "options": [
      "Status Bar",
      "Formula Bar",
      "Ribbon",
      "Quick Access Toolbar"
    ],
    "answer": 2,
    "explanation": "Ribbon adalah area pita menu horizontal di bagian atas jendela Excel yang menampung tab perintah dan grup ikon fungsi."
  },
  {
    "id": 3,
    "category": "Antarmuka & Fitur Excel",
    "level": "LOW",
    "question": "Bilah kecil di pojok kiri paling atas yang berisi jalan pintas tombol cepat seperti Save, Undo, dan Redo adalah...",
    "options": [
      "Quick Access Toolbar",
      "Formula Bar",
      "Status Bar",
      "Title Bar"
    ],
    "answer": 0,
    "explanation": "Quick Access Toolbar terletak di pojok kiri atas dan berisi ikon jalan pintas yang sering digunakan (Save, Undo, Redo)."
  },
  {
    "id": 4,
    "category": "Antarmuka & Fitur Excel",
    "level": "LOW",
    "question": "Bagian paling bawah jendela Excel yang menampilkan informasi status lembar kerja dan pengatur Zoom Slider disebut...",
    "options": [
      "Formula Bar",
      "Status Bar",
      "Title Bar",
      "Scroll Bar"
    ],
    "answer": 1,
    "explanation": "Status Bar berada di bagian dasar jendela Excel, menampilkan status dokumen, ringkasan cepat rata-rata/jumlah, serta slider perbesaran (Zoom)."
  },
  {
    "id": 5,
    "category": "Antarmuka & Fitur Excel",
    "level": "LOW",
    "question": "Garis-garis abu-abu tipis pembatas antarsel pada lembar kerja Excel disebut...",
    "options": [
      "Border Tabel",
      "Gridlines",
      "Header Line",
      "Ruler Guide"
    ],
    "answer": 1,
    "explanation": "Gridlines adalah garis bantu abu-abu pemisah kolom dan baris di Excel yang secara default tampak di layar namun tidak otomatis tercetak."
  },
  {
    "id": 6,
    "category": "Antarmuka & Fitur Excel",
    "level": "LOW",
    "question": "Kombinasi tombol keyboard (shortcut) yang digunakan untuk menyimpan (Save) dokumen Excel adalah...",
    "options": [
      "Ctrl + P",
      "Ctrl + C",
      "Ctrl + S",
      "Ctrl + Z"
    ],
    "answer": 2,
    "explanation": "Tombol pintas Ctrl + S berfungsi untuk menyimpan (Save) lembar kerja yang sedang aktif."
  },
  {
    "id": 7,
    "category": "Antarmuka & Fitur Excel",
    "level": "LOW",
    "question": "Ekstensi file standar untuk dokumen buku kerja Microsoft Excel versi modern (2007 ke atas) adalah...",
    "options": [
      ".docx",
      ".pptx",
      ".xlsx",
      ".pdf"
    ],
    "answer": 2,
    "explanation": "Ekstensi default untuk file Microsoft Excel modern adalah .xlsx (OpenXML Spreadsheet)."
  },
  {
    "id": 8,
    "category": "Antarmuka & Fitur Excel",
    "level": "MOTS",
    "question": "Rani ingin menyisipkan grafik lingkaran (Pie Chart) untuk memvisualisasikan data OSIS. Tab Ribbon yang harus dipilih Rani adalah...",
    "options": [
      "Tab Home",
      "Tab Insert",
      "Tab Formulas",
      "Tab View"
    ],
    "answer": 1,
    "explanation": "Tab Insert digunakan untuk menyisipkan objek tambahan ke dalam lembar kerja, seperti bagan/grafik (Charts), gambar, dan tabel."
  },
  {
    "id": 9,
    "category": "Antarmuka & Fitur Excel",
    "level": "MOTS",
    "question": "Jika lembar kerja Excel terlihat terlalu kecil sehingga angka sulit dibaca siswa, fitur yang paling cepat digunakan tanpa mengubah ukuran font adalah...",
    "options": [
      "Mengubah orientasi halaman menjadi Landscape",
      "Menggeser Zoom Slider di Status Bar",
      "Menambah lebar kolom satu per satu",
      "Mengaktifkan mode Formula Auditing"
    ],
    "answer": 1,
    "explanation": "Zoom Slider di Status Bar kanan bawah berguna memperbesar (zoom in) atau memperkecil (zoom out) tampilan visual lembar kerja tanpa memodifikasi ukuran font dokumen."
  },
  {
    "id": 10,
    "category": "Antarmuka & Fitur Excel",
    "level": "MOTS",
    "question": "Untuk menyembunyikan atau menampilkan kembali garis kisi-kisi (Gridlines) pada lembar kerja, tab Ribbon dan opsi yang digunakan adalah...",
    "options": [
      "Tab Home -> Format -> Gridlines",
      "Tab Insert -> Shapes -> Gridlines",
      "Tab View -> centang opsi Gridlines",
      "Tab Data -> Data Validation"
    ],
    "answer": 2,
    "explanation": "Di Tab View pada grup Show, terdapat kotak centang Gridlines untuk mengatur apakah garis bantu kisi sel ingin ditampilkan atau disembunyikan."
  },
  {
    "id": 11,
    "category": "Antarmuka & Fitur Excel",
    "level": "MOTS",
    "question": "Perintah Undo di Quick Access Toolbar atau pintasan tombol Ctrl + Z berfungsi untuk...",
    "options": [
      "Membatalkan tindakan atau perintah terakhir yang baru saja dilakukan",
      "Mengulang kembali tindakan yang telah dibatalkan",
      "Menyimpan file ke folder baru",
      "Menutup lembar kerja seketika"
    ],
    "answer": 0,
    "explanation": "Undo (Ctrl + Z) membatalkan langkah perubahan terakhir yang dilakukan pengguna pada lembar kerja."
  },
  {
    "id": 12,
    "category": "Antarmuka & Fitur Excel",
    "level": "MOTS",
    "question": "Pak Guru ingin mencetak lembar data nilai agar pas di satu lembar kertas A4 tanpa terpotong. Pengaturan ukuran dan margin kertas terdapat pada Tab...",
    "options": [
      "Tab Home",
      "Tab Insert",
      "Tab Page Layout",
      "Tab Review"
    ],
    "answer": 2,
    "explanation": "Tab Page Layout berisi pengaturan tata letak cetak, seperti Margins, Orientation (Portrait/Landscape), Size kertas, dan Print Area."
  },
  {
    "id": 13,
    "category": "Antarmuka & Fitur Excel",
    "level": "MOTS",
    "question": "Ketika sedang mengetik angka di Excel, tombol keyboard apa yang dapat ditekan untuk menyelesaikan pengetikan dan otomatis berpindah ke sel di bawahnya?",
    "options": [
      "Tombol Shift",
      "Tombol Tab",
      "Tombol Enter",
      "Tombol Esc"
    ],
    "answer": 2,
    "explanation": "Menekan tombol Enter akan mengonfirmasi isi sel dan memindahkan kursor sel aktif satu tingkat ke baris bawahnya."
  },
  {
    "id": 14,
    "category": "Antarmuka & Fitur Excel",
    "level": "HOTS",
    "question": "Seorang siswa tidak sengaja menekan kombinasi tombol keyboard dan tiba-tiba seluruh Ribbon di atas menghilang, hanya menyisakan nama-nama Tab. Masalah ini terjadi karena...",
    "options": [
      "Excel mengalami kerusakan sistem (corrupt)",
      "Ribbon diminimalkan (Collapse the Ribbon) dengan tombol pintas Ctrl + F1",
      "Seluruh baris lembar kerja terhapus",
      "Fitur Freeze Panes sedang aktif"
    ],
    "answer": 1,
    "explanation": "Shortcut Ctrl + F1 digunakan untuk menyembunyikan/meminimalkan (Collapse) Ribbon dan membukanya kembali agar area kerja spreadsheet lebih luas."
  },
  {
    "id": 15,
    "category": "Antarmuka & Fitur Excel",
    "level": "HOTS",
    "question": "Dalam suatu ujian praktik, komputer sekolah menampilkan Excel dengan rumus dalam sel tidak menghasilkan angka melainkan selalu menampilkan teks rumusnya saja (misal tertulis =A1+B1). Fitur apa yang sedang aktif dan bagaimana menormalkannya?",
    "options": [
      "Fitur Protect Sheet; matikan proteksi dengan password",
      "Fitur Show Formulas di Tab Formulas sedang aktif; klik sekali lagi untuk menonaktifkannya",
      "Tipe data kolom diubah menjadi Date",
      "Monitor mengalami gangguan display driver"
    ],
    "answer": 1,
    "explanation": "Fitur 'Show Formulas' (Ctrl + `) di tab Formulas membuat Excel menampilkan teks rumus di semua sel. Menonaktifkannya akan mengembalikan hasil kalkulasi angka."
  },
  {
    "id": 16,
    "category": "Antarmuka & Fitur Excel",
    "level": "HOTS",
    "question": "Budi ingin melihat ringkasan instan jumlah (Sum) dan rata-rata (Average) dari 5 angka yang dipilih tanpa mengetik rumus sama sekali. Langkah tercepat yang bisa dilakukan Budi adalah...",
    "options": [
      "Menekan tombol Print Preview di File",
      "Memblok kelima sel tersebut dan melihat informasi otomatis di Status Bar bagian bawah",
      "Membuka kalkulator bawaan Windows",
      "Menghapus data lalu mengetiknya ulang"
    ],
    "answer": 1,
    "explanation": "Status Bar Excel secara cerdas langsung menampilkan kalkulasi instan (Average, Count, Sum) dari sel-sel numerik yang sedang diblok."
  },
  {
    "id": 17,
    "category": "Antarmuka & Fitur Excel",
    "level": "HOTS",
    "question": "Mengapa menyimpan dokumen secara berkala dengan tombol Save atau mengaktifkan fitur AutoSave sangat penting saat mengolah data spreadsheet besar di laboratorium sekolah?",
    "options": [
      "Agar ukuran file otomatis berkurang menjadi 0 KB",
      "Untuk mencegah kehilangan data jika komputer tiba-tiba mati lampu atau mengalami kendala teknis",
      "Agar rumus VLOOKUP dapat bekerja secara otomatis",
      "Agar data di sel otomatis terkunci dari guru"
    ],
    "answer": 1,
    "explanation": "Penyimpanan berkala mencegah risiko hilangnya hasil analisis dan perhitungan jika terjadi kendala listrik padam atau sistem crash tak terduga."
  },
  {
    "id": 18,
    "category": "Antarmuka & Fitur Excel",
    "level": "HOTS",
    "question": "Andi mengklik salah satu tab ribbon tetapi perintah di dalamnya berwarna abu-abu redup (disabled) dan tidak bisa diklik. Kemungkinan penyebab utama fenomena ini adalah...",
    "options": [
      "Andi masih dalam mode mengedit isi sel (kursor berkedip di dalam sel)",
      "Ukuran RAM komputer terlalu kecil",
      "Mouse Andi kehabisan baterai",
      "Excel memerlukan koneksi internet untuk tombol tersebut"
    ],
    "answer": 0,
    "explanation": "Saat pengguna masih aktif mengedit teks di dalam sel (kursor berkedip), sebagian besar menu perintah di Ribbon otomatis berstatus disabled sampai pengguna menekan Enter atau Tab."
  },
  {
    "id": 19,
    "category": "Antarmuka & Fitur Excel",
    "level": "HOTS",
    "question": "Pada tampilan jendela Excel terdapat tombol Minimize, Maximize/Restore Down, dan Close di sudut kanan paling atas. Perbedaan mendasar tombol Close jendela program dengan opsi 'Close' pada menu File adalah...",
    "options": [
      "Tombol Close sudut kanan atas menutup seluruh aplikasi Excel, sedangkan File -> Close hanya menutup workbook yang aktif tanpa keluar dari Excel",
      "Keduanya memiliki fungsi yang sama persis tanpa perbedaan",
      "File -> Close akan menghapus file dari harddisk secara permanen",
      "Tombol sudut kanan atas hanya berfungsi pada laptop"
    ],
    "answer": 0,
    "explanation": "Tombol Close (X) di pojok jendela menutup keseluruhan program Excel, sedangkan menu File -> Close hanya menutup berkas buku kerja yang sedang dibuka."
  },
  {
    "id": 20,
    "category": "Antarmuka & Fitur Excel",
    "level": "HOTS",
    "question": "Dina ingin menambahkan tombol 'Print Preview' ke Quick Access Toolbar agar dapat mengecek tampilan cetak tabel dalam satu kali klik. Langkah yang tepat adalah...",
    "options": [
      "Menghapus instalasi Microsoft Office lalu install ulang",
      "Mengklik tanda panah kecil di ujung Quick Access Toolbar lalu mencentang opsi 'Print Preview and Print'",
      "Mengklik kanan sembarang sel lalu pilih Format Cells",
      "Mengetik rumus =PRINT() pada Formula Bar"
    ],
    "answer": 1,
    "explanation": "Menu drop-down tanda panah di Quick Access Toolbar memungkinkan pengguna mencentang tombol-tombol favorit seperti Print Preview, New, dan Quick Print."
  },
  {
    "id": 21,
    "category": "Cell, Alamat Sel, & Range",
    "level": "LOW",
    "question": "Pertemuan antara kolom vertikal dan baris horizontal pada lembar kerja Excel disebut...",
    "options": [
      "Range",
      "Cell (Sel)",
      "Worksheet",
      "Ribbon"
    ],
    "answer": 1,
    "explanation": "Cell (Sel) adalah kotak satuan dasar hasil perpotongan antara satu kolom dan satu baris di Excel."
  },
  {
    "id": 22,
    "category": "Cell, Alamat Sel, & Range",
    "level": "LOW",
    "question": "Bagian vertikal dari atas ke bawah pada spreadsheet Excel dinamai dengan huruf (A, B, C, ...) dan disebut...",
    "options": [
      "Row (Baris)",
      "Column (Kolom)",
      "Range",
      "Cell Address"
    ],
    "answer": 1,
    "explanation": "Column (Kolom) membentang secara vertikal dan diberi tanda pengenal alfabet (A, B, C, ..., Z, AA, dst.)."
  },
  {
    "id": 23,
    "category": "Cell, Alamat Sel, & Range",
    "level": "LOW",
    "question": "Bagian horizontal dari kiri ke kanan pada lembar kerja Excel yang dinamai dengan angka (1, 2, 3, ...) disebut...",
    "options": [
      "Column (Kolom)",
      "Row (Baris)",
      "Grid",
      "Border"
    ],
    "answer": 1,
    "explanation": "Row (Baris) membentang secara horizontal dari kiri ke kanan dan ditandai dengan urutan angka (1, 2, 3, dst.)."
  },
  {
    "id": 24,
    "category": "Cell, Alamat Sel, & Range",
    "level": "LOW",
    "question": "Alamat sel yang berada pada pertemuan kolom D dan baris ke-7 ditulis dengan notasi...",
    "options": [
      "7D",
      "D-7",
      "D7",
      "D.7"
    ],
    "answer": 2,
    "explanation": "Penulisan alamat sel di Excel selalu mendahulukan huruf kolom kemudian diikuti nomor baris, yaitu D7."
  },
  {
    "id": 25,
    "category": "Cell, Alamat Sel, & Range",
    "level": "LOW",
    "question": "Sel yang sedang dipilih dan ditandai dengan kotak garis batas hijau tebal di sekelilingnya disebut...",
    "options": [
      "Inactive Cell",
      "Active Cell (Sel Aktif)",
      "Hidden Cell",
      "Merged Cell"
    ],
    "answer": 1,
    "explanation": "Active Cell adalah sel yang sedang terpilih dan siap menerima input data atau formula dari pengguna."
  },
  {
    "id": 26,
    "category": "Cell, Alamat Sel, & Range",
    "level": "LOW",
    "question": "Kumpulan dari dua atau lebih sel yang saling berhubungan pada lembar kerja Excel disebut...",
    "options": [
      "Workbook",
      "Range (Rentang)",
      "File",
      "Sheet"
    ],
    "answer": 1,
    "explanation": "Range adalah sekumpulan sel yang dipilih secara bersamaan, misalnya range A1:C5."
  },
  {
    "id": 27,
    "category": "Cell, Alamat Sel, & Range",
    "level": "LOW",
    "question": "Tanda baca yang digunakan untuk menyatakan rentang sel dari satu sel awal hingga sel akhir (misal dari A1 sampai A10) adalah...",
    "options": [
      "Tanda titik (.)",
      "Tanda titik dua (:)",
      "Tanda koma (,)",
      "Tanda strip (-)"
    ],
    "answer": 1,
    "explanation": "Tanda titik dua (:) dalam Excel merepresentasikan rentang (range), contohnya A1:A10 berarti seluruh sel dari A1 hingga A10."
  },
  {
    "id": 28,
    "category": "Cell, Alamat Sel, & Range",
    "level": "MOTS",
    "question": "Jika kita memilih sel dari koordinat B2 sampai D5, maka notasi penulisan rentang sel tersebut di Excel adalah...",
    "options": [
      "B2;D5",
      "B2:D5",
      "B2-D5",
      "B2_D5"
    ],
    "answer": 1,
    "explanation": "Rentang dari B2 di sudut kiri atas sampai D5 di sudut kanan bawah ditulis B2:D5."
  },
  {
    "id": 29,
    "category": "Cell, Alamat Sel, & Range",
    "level": "MOTS",
    "question": "Berapa jumlah total sel yang tercakup di dalam rentang A1:B4?",
    "options": [
      "4 sel",
      "6 sel",
      "8 sel",
      "10 sel"
    ],
    "answer": 2,
    "explanation": "Rentang A1:B4 terdiri dari 2 kolom (A dan B) dan 4 baris (1, 2, 3, 4). Total sel = 2 x 4 = 8 sel."
  },
  {
    "id": 30,
    "category": "Cell, Alamat Sel, & Range",
    "level": "MOTS",
    "question": "Siswa ingin memilih sel A1, C3, dan E5 sekaligus yang letaknya tidak berurutan. Tombol keyboard yang harus ditekan sambil mengklik sel-sel tersebut adalah...",
    "options": [
      "Tombol Shift",
      "Tombol Ctrl",
      "Tombol Alt",
      "Tombol Tab"
    ],
    "answer": 1,
    "explanation": "Menekan dan menahan tombol Ctrl memungkinkan pengguna memilih beberapa sel atau range yang tidak berdampingan (non-adjacent cells)."
  },
  {
    "id": 31,
    "category": "Cell, Alamat Sel, & Range",
    "level": "MOTS",
    "question": "Jika ingin memilih seluruh sel dalam satu baris ke-5 secara utuh dari kolom paling kiri hingga paling kanan, langkah tercepat adalah...",
    "options": [
      "Mengetik =ROW(5) di Formula Bar",
      "Mengklik nomor header baris 5 di sebelah kiri",
      "Menekan panah bawah 5 kali",
      "Menggeser scrollbar horizontal"
    ],
    "answer": 1,
    "explanation": "Mengklik langsung pada nomor header baris (misal angka 5) akan menyeleksi seluruh baris tersebut secara utuh."
  },
  {
    "id": 32,
    "category": "Cell, Alamat Sel, & Range",
    "level": "MOTS",
    "question": "Kombinasi tombol keyboard untuk langsung melompat memilih sel A1 (sudut kiri paling atas lembar kerja) dari posisi mana pun adalah...",
    "options": [
      "Ctrl + Home",
      "Ctrl + End",
      "Shift + Home",
      "Alt + Home"
    ],
    "answer": 0,
    "explanation": "Pintasan Ctrl + Home langsung memindahkan sel aktif kembali ke sel A1 pada lembar kerja."
  },
  {
    "id": 33,
    "category": "Cell, Alamat Sel, & Range",
    "level": "MOTS",
    "question": "Kombinasi tombol keyboard untuk memilih seluruh sel pada lembar kerja (Select All) sekaligus adalah...",
    "options": [
      "Ctrl + C",
      "Ctrl + V",
      "Ctrl + A",
      "Ctrl + S"
    ],
    "answer": 2,
    "explanation": "Shortcut Ctrl + A (Select All) digunakan untuk memilih seluruh isi lembar kerja atau seluruh tabel data aktif."
  },
  {
    "id": 34,
    "category": "Cell, Alamat Sel, & Range",
    "level": "HOTS",
    "question": "Diberikan rentang B3:E8. Seorang siswa ingin menghitung berapa banyak sel numerik di dalam range tersebut. Berapa jumlah sel yang ada pada rentang B3:E8?",
    "options": [
      "12 sel",
      "20 sel",
      "24 sel",
      "28 sel"
    ],
    "answer": 2,
    "explanation": "Kolom B, C, D, E berjumlah 4 kolom. Baris 3, 4, 5, 6, 7, 8 berjumlah 6 baris. Total sel = 4 x 6 = 24 sel."
  },
  {
    "id": 35,
    "category": "Cell, Alamat Sel, & Range",
    "level": "HOTS",
    "question": "Sari ingin menyalin nilai di sel B2 ke sel B3 menggunakan tombol keyboard. Kombinasi tombol pintas berturut-turut yang paling efisien adalah...",
    "options": [
      "Ctrl + X lalu Ctrl + Z",
      "Ctrl + C di sel B2, pindah ke B3, lalu Ctrl + V",
      "Ctrl + P lalu Ctrl + S",
      "Ctrl + A lalu Delete"
    ],
    "answer": 1,
    "explanation": "Ctrl + C berfungsi menyalin (Copy) data sel, dan Ctrl + V berfungsi menempelkan (Paste) data tersebut ke sel tujuan."
  },
  {
    "id": 36,
    "category": "Cell, Alamat Sel, & Range",
    "level": "HOTS",
    "question": "Jika sel aktif berada pada sel C10 dan pengguna menekan tombol 'Tab' pada keyboard, ke sel manakah kursor sel aktif akan berpindah?",
    "options": [
      "Sel C11 (turun ke bawah)",
      "Sel C9 (naik ke atas)",
      "Sel D10 (pindah ke kanan)",
      "Sel B10 (pindah ke kiri)"
    ],
    "answer": 2,
    "explanation": "Menekan tombol Tab memindahkan sel aktif satu sel ke arah kanan (dari C10 menjadi D10), sedangkan Enter memindahkan ke bawah."
  },
  {
    "id": 37,
    "category": "Cell, Alamat Sel, & Range",
    "level": "HOTS",
    "question": "Apakah notasi 'A1:C3' dan 'C3:A1' merujuk pada rentang sel yang sama di Excel?",
    "options": [
      "Berbeda, karena arah pemilihan sel menentukan hasil rumus",
      "Sama persis, keduanya mencakup persegi sel dari A1 hingga C3",
      "Notasi C3:A1 akan menyebabkan error sintaks",
      "Hanya A1:C3 yang diizinkan oleh Excel"
    ],
    "answer": 1,
    "explanation": "Excel membaca titik dua (:) sebagai batas dua koordinat diagonal, sehingga A1:C3 dan C3:A1 mencakup blok sel yang sama persis."
  },
  {
    "id": 38,
    "category": "Cell, Alamat Sel, & Range",
    "level": "HOTS",
    "question": "Ketika kita menuliskan rumus =SUM(A1, A5), apa perbedaan maknanya dibandingkan dengan =SUM(A1:A5)?",
    "options": [
      "Keduanya memiliki hasil yang sama persis",
      "=SUM(A1, A5) hanya menjumlahkan dua sel yaitu A1 dan A5 saja, sedangkan =SUM(A1:A5) menjumlahkan seluruh sel dari A1 sampai A5 (A1, A2, A3, A4, A5)",
      "=SUM(A1, A5) menghasilkan nilai rata-rata",
      "=SUM(A1:A5) menghasilkan pesan error"
    ],
    "answer": 1,
    "explanation": "Tanda koma/titik koma memisahkan argumen sel individual (hanya A1 dan A5), sedangkan tanda titik dua mendefinisikan seluruh rentang sel berurutan."
  },
  {
    "id": 39,
    "category": "Cell, Alamat Sel, & Range",
    "level": "HOTS",
    "question": "Dalam suatu laporan tertulis rentang A1:B2, C3:D4. Simbol koma di antara kedua rentang tersebut berarti...",
    "options": [
      "Gabungan (Union) dari dua rentang sel yang terpisah",
      "Perkalian antara rentang pertama dan kedua",
      "Pembagian rentang",
      "Pengurangan sel"
    ],
    "answer": 0,
    "explanation": "Tanda koma (operator union) menggabungkan beberapa referensi sel atau range yang tidak bersebelahan ke dalam satu fungsi."
  },
  {
    "id": 40,
    "category": "Cell, Alamat Sel, & Range",
    "level": "HOTS",
    "question": "Seorang siswa ingin memilih sel A1 sampai A100. Daripada menggeser mouse ke bawah yang memakan waktu, cara tercepat adalah...",
    "options": [
      "Mengklik A1, lalu menekan Shift + Down Arrow 100 kali",
      "Mengklik A1, lalu menahan tombol Shift dan mengklik sel A100",
      "Mengetik =A1+A100 di sel B1",
      "Membuat 10 sheet baru"
    ],
    "answer": 1,
    "explanation": "Mengklik sel awal, menahan tombol Shift, lalu mengklik sel akhir adalah teknik pemilihan rentang panjang tercepat dan paling presisi."
  },
  {
    "id": 41,
    "category": "Fill Handle & AutoFill",
    "level": "LOW",
    "question": "Titik kotak kecil berwarna hijau/hitam di sudut kanan bawah sel aktif disebut...",
    "options": [
      "Scroll handle",
      "Fill Handle",
      "Formula tag",
      "Address marker"
    ],
    "answer": 1,
    "explanation": "Fill Handle adalah titik kotak kecil di pojok kanan bawah sel aktif yang berguna untuk operasi AutoFill."
  },
  {
    "id": 42,
    "category": "Fill Handle & AutoFill",
    "level": "LOW",
    "question": "Bentuk kursor mouse ketika diarahkan tepat di atas titik Fill Handle akan berubah menjadi...",
    "options": [
      "Tanda panah empat arah",
      "Tanda tambah hitam tebal (+)",
      "Tanda kursor teks I-beam",
      "Tanda lingkaran merah"
    ],
    "answer": 1,
    "explanation": "Saat mouse diarahkan ke Fill Handle, pointer berubah menjadi tanda tambah hitam ramping (+) yang siap ditarik."
  },
  {
    "id": 43,
    "category": "Fill Handle & AutoFill",
    "level": "LOW",
    "question": "Fitur di Excel yang secara cerdas mendeteksi pola data dan mengisinya ke sel berikutnya secara otomatis disebut...",
    "options": [
      "AutoFit",
      "AutoFill",
      "AutoCorrect",
      "AutoSave"
    ],
    "answer": 1,
    "explanation": "AutoFill adalah fitur cerdas Excel yang mengisi deret angka, tanggal, nama hari, atau menyalin formula secara otomatis."
  },
  {
    "id": 44,
    "category": "Fill Handle & AutoFill",
    "level": "LOW",
    "question": "Jika kita mengetik kata 'Januari' di sel A1 lalu menarik Fill Handle ke sel A2 dan A3, isi sel A2 dan A3 adalah...",
    "options": [
      "Januari, Januari",
      "Februari, Maret",
      "Januari 1, Januari 2",
      "Error #VALUE!"
    ],
    "answer": 1,
    "explanation": "Excel mengenali deret nama bulan secara bawaan, sehingga setelah Januari otomatis berlanjut ke Februari dan Maret."
  },
  {
    "id": 45,
    "category": "Fill Handle & AutoFill",
    "level": "LOW",
    "question": "Jika kita mengetik kata 'Senin' di sel B1 lalu menarik Fill Handle ke kanan sampai B3, maka sel B2 dan B3 berturut-turut berisi...",
    "options": [
      "Selasa dan Rabu",
      "Senin dan Senin",
      "Minggu dan Sabtu",
      "Januari dan Februari"
    ],
    "answer": 0,
    "explanation": "Nama-nama hari adalah daftar deret bawaan (Custom List) di Excel sehingga otomatis diteruskan menjadi Selasa dan Rabu."
  },
  {
    "id": 46,
    "category": "Fill Handle & AutoFill",
    "level": "MOTS",
    "question": "Budi mengetik angka 1 di sel A1 dan angka 2 di sel A2. Budi memblok sel A1:A2 lalu menarik Fill Handle ke bawah sampai sel A5. Isi sel A3, A4, dan A5 adalah...",
    "options": [
      "1, 1, 1",
      "2, 2, 2",
      "3, 4, 5",
      "1, 2, 3"
    ],
    "answer": 2,
    "explanation": "Dengan memilih A1 (1) dan A2 (2), Excel membaca pola kenaikan (+1), sehingga sel berikutnya menjadi 3, 4, dan 5."
  },
  {
    "id": 47,
    "category": "Fill Handle & AutoFill",
    "level": "MOTS",
    "question": "Rina mengetik angka 5 di sel C1 dan angka 10 di sel C2. Rina memblok C1:C2 lalu menarik Fill Handle hingga C4. Nilai pada sel C3 dan C4 adalah...",
    "options": [
      "11 dan 12",
      "15 dan 20",
      "10 dan 10",
      "5 dan 10"
    ],
    "answer": 1,
    "explanation": "Pola loncat 5 (5, 10) dideteksi oleh AutoFill, sehingga dua sel selanjutnya adalah 15 dan 20."
  },
  {
    "id": 48,
    "category": "Fill Handle & AutoFill",
    "level": "MOTS",
    "question": "Jika hanya sel A1 yang berisi angka 1 yang dipilih lalu langsung ditarik ke bawah tanpa menekan tombol tambahan apa pun, Excel secara default akan...",
    "options": [
      "Membuat angka 2, 3, 4...",
      "Menyalin (Copy) angka 1 ke semua sel bawahnya",
      "Menghapus nilai sel",
      "Menghasilkan pesan error"
    ],
    "answer": 1,
    "explanation": "Jika hanya satu angka tunggal ditarik tanpa pola pembanding, secara default Excel akan menyalin (Copy Cells) angka yang sama."
  },
  {
    "id": 49,
    "category": "Fill Handle & AutoFill",
    "level": "MOTS",
    "question": "Cara cepat mengisi rumus di sel D2 ke bawah sepanjang 50 baris data tanpa perlu menarik mouse secara manual adalah...",
    "options": [
      "Menekan tombol Esc",
      "Mengklik ganda (double-click) pada titik Fill Handle di sel D2",
      "Menghapus kolom D",
      "Mengetik ulang rumus 50 kali"
    ],
    "answer": 1,
    "explanation": "Mengklik ganda (double-click) pada titik Fill Handle akan otomatis menjalankan AutoFill ke bawah sejajar dengan baris data di kolom sebelahnya."
  },
  {
    "id": 50,
    "category": "Fill Handle & AutoFill",
    "level": "MOTS",
    "question": "Dedi mengetik teks 'Siswa 1' di sel A1 lalu menarik Fill Handle ke bawah sampai A4. Apa yang akan muncul di sel A2, A3, dan A4?",
    "options": [
      "Siswa 1, Siswa 1, Siswa 1",
      "Siswa 2, Siswa 3, Siswa 4",
      "Error",
      "Kosong"
    ],
    "answer": 1,
    "explanation": "Teks yang diakhiri dengan angka akan otomatis diperlakukan sebagai deret berurutan oleh Excel (Siswa 2, Siswa 3, Siswa 4)."
  },
  {
    "id": 51,
    "category": "Fill Handle & AutoFill",
    "level": "HOTS",
    "question": "Di sel C2 terdapat rumus =A2*B2. Ketika rumus tersebut disalin ke sel C3 menggunakan Fill Handle, rumus di sel C3 otomatis berubah menjadi...",
    "options": [
      "=A2*B2 (tetap)",
      "=A3*B3",
      "=B2*C2",
      "=A2*C3"
    ],
    "answer": 1,
    "explanation": "Referensi relatif di Excel menyesuaikan alamat baris saat rumus ditarik ke bawah, sehingga baris 2 berubah menjadi baris 3 (=A3*B3)."
  },
  {
    "id": 52,
    "category": "Fill Handle & AutoFill",
    "level": "HOTS",
    "question": "Jika Anda ingin menarik satu sel berisi angka '1' ke bawah tetapi ingin hasilnya berurutan 1, 2, 3, 4..., tombol keyboard apa yang harus ditahan sambil menarik Fill Handle?",
    "options": [
      "Tombol Shift",
      "Tombol Ctrl",
      "Tombol Alt",
      "Tombol Tab"
    ],
    "answer": 1,
    "explanation": "Menahan tombol Ctrl saat menarik Fill Handle pada satu angka akan mengubah aksi Copy menjadi penambahan deret urut (Series +1)."
  },
  {
    "id": 53,
    "category": "Fill Handle & AutoFill",
    "level": "HOTS",
    "question": "Seorang siswa mengisi sel A1 dengan '2026-01-31' (Format Tanggal). Ketika ditarik satu sel ke bawah dengan Fill Handle, apa isi sel A2?",
    "options": [
      "2026-01-31",
      "2026-02-01",
      "2026-01-32",
      "#VALUE!"
    ],
    "answer": 1,
    "explanation": "Excel memahami kalender penanggalan; tanggal setelah 31 Januari adalah 1 Februari (2026-02-01)."
  },
  {
    "id": 54,
    "category": "Fill Handle & AutoFill",
    "level": "HOTS",
    "question": "Mengapa fitur Fill Handle sangat penting dalam pengolahan tabel nilai 40 siswa kelas VIII?",
    "options": [
      "Karena rumus penghitungan nilai akhir hanya perlu diketik satu kali di baris pertama lalu disalin otomatis ke seluruh siswa",
      "Karena tanpa Fill Handle nilai siswa tidak bisa dihitung",
      "Karena Fill Handle otomatis mencetak dokumen ke printer",
      "Karena Fill Handle menambah nilai siswa secara otomatis"
    ],
    "answer": 0,
    "explanation": "Fill Handle menghemat waktu luar biasa karena guru cukup mengetik formula satu kali dan menyalinnya ke seluruh siswa dalam hitungan detik."
  },
  {
    "id": 55,
    "category": "Fill Handle & AutoFill",
    "level": "HOTS",
    "question": "Di sel E2 terdapat rumus =$A$1*B2. Rumus ini ditarik ke sel E3 menggunakan Fill Handle. Bagaimanakah bentuk rumus di sel E3?",
    "options": [
      "=$A$2*B3",
      "=$A$1*B3",
      "=A1*B2",
      "=$A$1*$B$2"
    ],
    "answer": 1,
    "explanation": "Tanda dolar ($) mengunci referensi sel A1 secara mutlak (absolut), sehingga ketika ditarik ke bawah $A$1 tetap tidak berubah sedangkan B2 relatif menjadi B3."
  },
  {
    "id": 56,
    "category": "Format Data & Penataan Tabel",
    "level": "LOW",
    "question": "Secara default, data teks di dalam sel Excel akan otomatis diratakan ke sisi...",
    "options": [
      "Kanan",
      "Kiri",
      "Tengah (Center)",
      "Atas"
    ],
    "answer": 1,
    "explanation": "Secara default, Excel meratakan data teks ke sebelah kiri dan data angka/numerik ke sebelah kanan sel."
  },
  {
    "id": 57,
    "category": "Format Data & Penataan Tabel",
    "level": "LOW",
    "question": "Secara default, data berupa angka murni (numerik) di dalam sel Excel akan otomatis diratakan ke sisi...",
    "options": [
      "Kanan",
      "Kiri",
      "Tengah (Center)",
      "Bawah"
    ],
    "answer": 0,
    "explanation": "Excel secara otomatis meratakan data angka (numerik) ke sisi kanan sel agar nilai tempat desimal dan satuan sejajar."
  },
  {
    "id": 58,
    "category": "Format Data & Penataan Tabel",
    "level": "LOW",
    "question": "Perintah yang digunakan untuk menggabungkan beberapa sel yang dipilih menjadi satu sel tunggal sekaligus meletakkan teks di tengah adalah...",
    "options": [
      "Wrap Text",
      "Merge & Center",
      "Orientation",
      "AutoSum"
    ],
    "answer": 1,
    "explanation": "Merge & Center menggabungkan beberapa sel bersebelahan menjadi satu sel besar dan memposisikan teks di tengah horizontal."
  },
  {
    "id": 59,
    "category": "Format Data & Penataan Tabel",
    "level": "LOW",
    "question": "Fitur yang digunakan agar teks yang panjang terlipat ke baris baru di dalam sel yang sama tanpa memperlebar kolom disebut...",
    "options": [
      "Merge Cells",
      "Wrap Text",
      "Shrink to Fit",
      "Split Cells"
    ],
    "answer": 1,
    "explanation": "Wrap Text mengatur teks panjang agar terbagi menjadi beberapa baris ke bawah di dalam sel yang sama sesuai lebar kolom."
  },
  {
    "id": 60,
    "category": "Format Data & Penataan Tabel",
    "level": "LOW",
    "question": "Format angka yang digunakan untuk menambahkan simbol mata uang seperti 'Rp' atau '$' pada nilai nominal uang adalah...",
    "options": [
      "Percentage",
      "Currency / Accounting",
      "Scientific",
      "Fraction"
    ],
    "answer": 1,
    "explanation": "Format Currency dan Accounting menambahkan simbol mata uang (seperti Rp) serta pemisah ribuan pada nilai numerik."
  },
  {
    "id": 61,
    "category": "Format Data & Penataan Tabel",
    "level": "MOTS",
    "question": "Jika di sel A1 tertulis angka 0.25 dan diubah formatnya menjadi 'Percentage (%)', maka angka yang tampil di layar adalah...",
    "options": [
      "0.25%",
      "2.5%",
      "25%",
      "250%"
    ],
    "answer": 2,
    "explanation": "Format Percentage mengalikan nilai sel dengan 100 dan menambahkan simbol persen (0.25 x 100 = 25%)."
  },
  {
    "id": 62,
    "category": "Format Data & Penataan Tabel",
    "level": "MOTS",
    "question": "Tomy mengetik nomor induk kependudukan '0812345678'. Namun angka '0' di depan tiba-tiba hilang dan berubah menjadi 812345678. Agar angka nol di awal tetap muncul, Tomy harus...",
    "options": [
      "Mengetik tanda petik satu (') sebelum angka atau mengubah format sel menjadi Text",
      "Mengetik rumus =ZERO()",
      "Mengubah font menjadi tebal",
      "Memperlebar kolom"
    ],
    "answer": 0,
    "explanation": "Mengawali pengetikan dengan tanda petik tunggal (') atau memilih format sel 'Text' memaksa Excel memperlakukan nomor berawalan nol sebagai teks."
  },
  {
    "id": 63,
    "category": "Format Data & Penataan Tabel",
    "level": "MOTS",
    "question": "Untuk menambahkan garis batas tabel yang tegas pada sel agar tercetak jelas di printer, siswa harus menggunakan ikon...",
    "options": [
      "Font Color",
      "Fill Color",
      "All Borders",
      "Underline"
    ],
    "answer": 2,
    "explanation": "Garis bantu kisi (gridlines) tidak tercetak di kertas, sehingga tombol Borders (All Borders) di tab Home wajib digunakan untuk memberi bingkai tabel."
  },
  {
    "id": 64,
    "category": "Format Data & Penataan Tabel",
    "level": "MOTS",
    "question": "Ikon perintah 'Increase Decimal' pada grup Number di Tab Home berfungsi untuk...",
    "options": [
      "Menghapus semua angka desimal",
      "Menambah jumlah digit angka di belakang koma",
      "Mengubah angka menjadi pecahan",
      "Mengalikan angka dengan sepuluh"
    ],
    "answer": 1,
    "explanation": "Increase Decimal menambah tampilan jumlah angka pecahan di belakang tanda koma desimal."
  },
  {
    "id": 65,
    "category": "Format Data & Penataan Tabel",
    "level": "MOTS",
    "question": "Ikon perintah 'Decrease Decimal' pada Tab Home grup Number berfungsi untuk...",
    "options": [
      "Menambah angka desimal",
      "Mengurangi / membulatkan jumlah digit tampilan angka di belakang koma",
      "Mengubah angka menjadi negatif",
      "Menghapus sel"
    ],
    "answer": 1,
    "explanation": "Decrease Decimal mengurangi jumlah digit di belakang tanda koma dan membulatkan tampilannya secara matematis."
  },
  {
    "id": 66,
    "category": "Format Data & Penataan Tabel",
    "level": "HOTS",
    "question": "Di sel B2 tertulis angka 1250000. Setelah diformat dengan Accounting/Currency bergaya Indonesia, tampilan sel menjadi 'Rp 1.250.000'. Apakah nilai asli di balik sel tersebut berubah?",
    "options": [
      "Ya, nilai aslinya berubah menjadi teks huruf",
      "Tidak, nilai aslinya tetap angka 1250000 dan tetap dapat dihitung dengan rumus matematika",
      "Nilai sel berkurang menjadi 0",
      "Rumus perkalian tidak bisa lagi digunakan pada sel tersebut"
    ],
    "answer": 1,
    "explanation": "Format sel hanya memodifikasi visual tampilan di layar tanpa mengubah nilai numerik asli yang tersimpan di memori Excel."
  },
  {
    "id": 67,
    "category": "Format Data & Penataan Tabel",
    "level": "HOTS",
    "question": "Jika di sel tertulis simbol pagar penuh seperti '#######', apa arti dari tampilan tersebut dan bagaimana mengatasinya?",
    "options": [
      "Terjadi kesalahan rumus pembagian nol; perbaiki rumus",
      "Lebar kolom terlalu sempit untuk menampilkan angka atau tanggal; perlebar kolom tersebut",
      "Data terhapus oleh virus komputer",
      "File terkunci oleh kata sandi"
    ],
    "answer": 1,
    "explanation": "Simbol pagar (######) menandakan lebar kolom tidak mencukupi untuk menampilkan digit angka atau tanggal secara utuh. Solusinya cukup geser/perlebar kolom."
  },
  {
    "id": 68,
    "category": "Format Data & Penataan Tabel",
    "level": "HOTS",
    "question": "Perbedaan mendasar antara perintah 'Merge Cells' dan 'Wrap Text' ketika menata judul kolom tabel yang panjang adalah...",
    "options": [
      "Merge Cells menggabungkan beberapa sel menjadi satu kotak besar, sedangkan Wrap Text melipat teks menjadi beberapa baris di dalam sel yang sama tanpa menggabungkan sel lain",
      "Keduanya memiliki fungsi yang sama persis",
      "Wrap Text menghapus teks yang terlalu panjang",
      "Merge Cells hanya bisa digunakan untuk angka"
    ],
    "answer": 0,
    "explanation": "Merge Cells menyatukan sel-sel berbeda, sementara Wrap Text mempertahankan struktur kolom sel tunggal dengan melipat kalimat ke bawah."
  },
  {
    "id": 69,
    "category": "Format Data & Penataan Tabel",
    "level": "HOTS",
    "question": "Mengapa pengetikan angka 1000000 di Excel TIDAK boleh diketik manual menggunakan titik (misalnya diketik '1.000.000') jika komputer menggunakan setting region bahasa Inggris?",
    "options": [
      "Karena titik pada setting bahasa Inggris dibaca sebagai tanda koma desimal sehingga nilainya menjadi satu, bukan satu juta",
      "Karena Excel akan otomatis menutup sendiri",
      "Karena angka akan berubah menjadi warna merah",
      "Karena baris tabel akan terhapus"
    ],
    "answer": 0,
    "explanation": "Pada format standar internasional/Inggris, tanda titik adalah pemisah desimal, sehingga mengetik 1.000.000 akan dibaca sebagai 1 bukan sejuta. Ketiklah 1000000 lalu terapkan Number Formatting."
  },
  {
    "id": 70,
    "category": "Format Data & Penataan Tabel",
    "level": "HOTS",
    "question": "Seorang siswa ingin menyalin gaya format sel (warna latar, jenis font, garis border) dari sel A1 ke sel D1 tanpa menyalin isi teksnya. Fitur yang paling tepat digunakan adalah...",
    "options": [
      "AutoCorrect",
      "Format Painter",
      "Conditional Formatting",
      "Freeze Panes"
    ],
    "answer": 1,
    "explanation": "Ikon sapu kuas Format Painter di Tab Home berguna menduplikasi dan menerapkan format tampilan sel ke sel lain tanpa mengubah isi datanya."
  },
  {
    "id": 71,
    "category": "Manajemen Sheet & Workbook",
    "level": "LOW",
    "question": "Satu file buku kerja utuh di Microsoft Excel diibaratkan sebagai sebuah buku dan disebut...",
    "options": [
      "Worksheet",
      "Workbook",
      "Cell",
      "Table"
    ],
    "answer": 1,
    "explanation": "Workbook adalah buku kerja utuh (berkas file .xlsx) yang di dalamnya dapat menampung satu atau banyak lembar kerja (Worksheet)."
  },
  {
    "id": 72,
    "category": "Manajemen Sheet & Workbook",
    "level": "LOW",
    "question": "Satu halaman lembar kerja tempat kita memasukkan data tabel di dalam Workbook disebut...",
    "options": [
      "Worksheet (Sheet)",
      "Document",
      "Slide",
      "Database"
    ],
    "answer": 0,
    "explanation": "Worksheet (sering disebut Sheet) adalah lembaran kerja individual yang terdiri dari baris dan kolom di dalam satu workbook."
  },
  {
    "id": 73,
    "category": "Manajemen Sheet & Workbook",
    "level": "LOW",
    "question": "Ikon yang digunakan untuk menambah lembar kerja (Worksheet) baru di samping tab sheet yang sudah ada adalah tombol...",
    "options": [
      "Tanda silang (X)",
      "Tanda tambah (+)",
      "Tanda tanya (?)",
      "Tanda titik (...)"
    ],
    "answer": 1,
    "explanation": "Tombol lingkaran bertanda tambah (+) di samping deretan tab sheet di bagian bawah digunakan untuk membuat sheet baru."
  },
  {
    "id": 74,
    "category": "Manajemen Sheet & Workbook",
    "level": "LOW",
    "question": "Nama default untuk lembar kerja pertama saat membuka dokumen Excel baru biasanya adalah...",
    "options": [
      "Document 1",
      "Sheet1",
      "Page 1",
      "Table 1"
    ],
    "answer": 1,
    "explanation": "Lembar kerja baru secara otomatis diberi nama awal Sheet1, Sheet2, dan seterusnya."
  },
  {
    "id": 75,
    "category": "Manajemen Sheet & Workbook",
    "level": "LOW",
    "question": "Perintah klik kanan pada tab sheet yang digunakan untuk mengubah nama lembar kerja adalah...",
    "options": [
      "Delete",
      "Rename",
      "Move or Copy",
      "Tab Color"
    ],
    "answer": 1,
    "explanation": "Rename (Ganti Nama) digunakan untuk mengubah nama sheet sesuai topik data yang dikelola."
  },
  {
    "id": 76,
    "category": "Manajemen Sheet & Workbook",
    "level": "MOTS",
    "question": "Siswa ingin memberi warna merah pada tab 'Sheet Nilai' agar mudah dikenali. Perintah yang dipilih saat mengklik kanan tab sheet tersebut adalah...",
    "options": [
      "View Code",
      "Tab Color -> pilih warna merah",
      "Protect Sheet",
      "Hide"
    ],
    "answer": 1,
    "explanation": "Opsi Tab Color memungkinkan pengguna memilih palet warna khusus untuk menandai tab sheet penting."
  },
  {
    "id": 77,
    "category": "Manajemen Sheet & Workbook",
    "level": "MOTS",
    "question": "Untuk menghapus sebuah lembar kerja yang sudah tidak digunakan lagi, langkah yang tepat adalah...",
    "options": [
      "Menekan tombol Backspace di sel A1",
      "Klik kanan pada tab sheet yang ingin dihapus lalu pilih opsi 'Delete'",
      "Mengklik tombol Minimize",
      "Menutup laptop"
    ],
    "answer": 1,
    "explanation": "Mengklik kanan tab sheet lalu memilih 'Delete' akan menghapus lembar kerja tersebut beserta seluruh data di dalamnya."
  },
  {
    "id": 78,
    "category": "Manajemen Sheet & Workbook",
    "level": "MOTS",
    "question": "Bagaimana cara tercepat mengubah urutan posisi Sheet2 agar berada di sebelah kiri Sheet1?",
    "options": [
      "Klik dan tahan (drag) tab Sheet2 lalu geser ke sebelah kiri tab Sheet1",
      "Menghapus Sheet1 lalu buat baru",
      "Mengetik rumus =MOVE(Sheet2)",
      "Mengganti nama Sheet2 menjadi Sheet0"
    ],
    "answer": 0,
    "explanation": "Tab sheet dapat dipindahkan urutannya dengan teknik drag and drop (klik, tahan, dan geser) ke posisi yang diinginkan."
  },
  {
    "id": 79,
    "category": "Manajemen Sheet & Workbook",
    "level": "MOTS",
    "question": "Siti ingin membuat salinan persis (duplikat) dari lembar kerja 'Data Siswa'. Menu klik kanan yang harus dipilih adalah...",
    "options": [
      "Insert",
      "Move or Copy... lalu centang 'Create a copy'",
      "Rename",
      "Hide"
    ],
    "answer": 1,
    "explanation": "Menu 'Move or Copy...' dengan mencentang kotak 'Create a copy' akan membuat duplikat identik dari lembar kerja tersebut."
  },
  {
    "id": 80,
    "category": "Manajemen Sheet & Workbook",
    "level": "MOTS",
    "question": "Apakah nama sebuah lembar kerja di Excel boleh dikosongkan (tanpa karakter nama sama sekali)?",
    "options": [
      "Boleh",
      "Tidak boleh, setiap sheet wajib memiliki nama unik minimal satu karakter",
      "Boleh asalkan tidak ada angka",
      "Tergantung kapasitas harddisk"
    ],
    "answer": 1,
    "explanation": "Excel mewajibkan setiap sheet memiliki nama minimal 1 karakter dan nama tersebut tidak boleh duplikat dengan sheet lain dalam workbook yang sama."
  },
  {
    "id": 81,
    "category": "Manajemen Sheet & Workbook",
    "level": "HOTS",
    "question": "Jika kita menulis rumus di Sheet2 yang menjumlahkan sel A1 dan A2 yang berada di Sheet1, penulisan rumus lintas-sheet yang benar adalah...",
    "options": [
      "=Sheet1(A1+A2)",
      "=Sheet1!A1 + Sheet1!A2",
      "=A1!Sheet1 + A2!Sheet1",
      "=[Sheet1]A1+A2"
    ],
    "answer": 1,
    "explanation": "Excel menggunakan tanda seru (!) untuk memisahkan nama sheet dengan alamat sel pada rumus lintas lembar kerja (contoh: Sheet1!A1)."
  },
  {
    "id": 82,
    "category": "Manajemen Sheet & Workbook",
    "level": "HOTS",
    "question": "Budi tidak sengaja menghapus sebuah sheet penting menggunakan perintah klik kanan -> Delete. Ketika ia menekan tombol Ctrl + Z (Undo), sheet tersebut tidak kembali. Mengapa hal ini terjadi?",
    "options": [
      "Karena keyboard Budi rusak",
      "Karena tindakan penghapusan sheet di Excel bersifat permanen dan tidak dapat dibatalkan dengan fitur Undo",
      "Karena file harus di-restart dulu",
      "Karena Budi belum login akun Microsoft"
    ],
    "answer": 1,
    "explanation": "Di Microsoft Excel, tindakan menghapus lembar kerja (Delete Sheet) tidak disimpan dalam riwayat undo, sehingga tidak bisa dikembalikan dengan Ctrl + Z."
  },
  {
    "id": 83,
    "category": "Manajemen Sheet & Workbook",
    "level": "HOTS",
    "question": "Seorang bendahara kelas ingin menyembunyikan sheet berisi catatan keuangan rahasia dari layar tanpa menghapusnya. Opsi klik kanan yang tepat adalah...",
    "options": [
      "Delete",
      "Hide",
      "Rename",
      "Insert"
    ],
    "answer": 1,
    "explanation": "Perintah 'Hide' akan menyembunyikan tab sheet dari pandangan layar tanpa menghapus datanya, dan dapat dimunculkan kembali dengan 'Unhide'."
  },
  {
    "id": 84,
    "category": "Manajemen Sheet & Workbook",
    "level": "HOTS",
    "question": "Karakter manakah di bawah ini yang DILARANG digunakan saat memberi nama lembar kerja (Worksheet) di Excel?",
    "options": [
      "Tanda spasi",
      "Huruf kapital",
      "Tanda garis miring (/) atau tanda tanya (?)",
      "Angka numerik"
    ],
    "answer": 2,
    "explanation": "Excel melarang penggunaan karakter khusus tertentu seperti /, \\, ?, *, [, ], dan : pada penamaan sheet karena bentrok dengan sintaks sistem."
  },
  {
    "id": 85,
    "category": "Manajemen Sheet & Workbook",
    "level": "HOTS",
    "question": "Mengapa membagi data siswa ke dalam beberapa sheet berbeda (misal Sheet Kelas 8A, Sheet Kelas 8B, Sheet Kelas 8C) lebih dianjurkan daripada menumpuknya dalam satu sheet panjang?",
    "options": [
      "Agar data lebih terstruktur, mudah dicari, ukuran tampilan rapi, dan mengurangi risiko salah edit antar kelas",
      "Agar ukuran file menjadi lebih besar",
      "Karena Excel hanya mampu menampung 10 siswa per sheet",
      "Agar rumus SUM tidak error"
    ],
    "answer": 0,
    "explanation": "Pemisahan sheet per kategori mempermudah manajemen informasi, pencarian arsip, dan menjaga integritas data masing-masing kelompok."
  },
  {
    "id": 86,
    "category": "Formula Bar & Name Box",
    "level": "LOW",
    "question": "Setiap penulisan rumus atau formula perhitungan di Excel WAJIB selalu diawali dengan tanda...",
    "options": [
      "Tanda petik (\")",
      "Tanda tambah (+)",
      "Tanda sama dengan (=)",
      "Tanda tanya (?)"
    ],
    "answer": 2,
    "explanation": "Tanda sama dengan (=) adalah pemicu wajib bagi Excel untuk mengenali bahwa sel tersebut berisi rumus komputasi, bukan teks biasa."
  },
  {
    "id": 87,
    "category": "Formula Bar & Name Box",
    "level": "LOW",
    "question": "Bagian kotak di sebelah kiri Formula Bar yang menampilkan alamat atau koordinat sel yang sedang aktif disebut...",
    "options": [
      "Status Bar",
      "Name Box (Kotak Nama)",
      "Title Bar",
      "Sheet Tab"
    ],
    "answer": 1,
    "explanation": "Name Box menampilkan alamat sel yang sedang aktif (misalnya B3) atau nama rentang sel yang telah didefinisikan."
  },
  {
    "id": 88,
    "category": "Formula Bar & Name Box",
    "level": "LOW",
    "question": "Bilah panjang di bagian atas yang memiliki simbol 'fx' dan digunakan untuk mengetik serta melihat rumus di balik sel adalah...",
    "options": [
      "Formula Bar",
      "Quick Access Toolbar",
      "Ribbon",
      "Scrollbar"
    ],
    "answer": 0,
    "explanation": "Formula Bar (Bilah Rumus) menampilkan isi rumus asli di balik sel aktif dan digunakan untuk menyunting kalkulasi."
  },
  {
    "id": 89,
    "category": "Formula Bar & Name Box",
    "level": "LOW",
    "question": "Simbol operator matematika yang digunakan untuk operasi perkalian di Excel adalah...",
    "options": [
      "Tanda silang (x)",
      "Tanda bintang (*)",
      "Tanda titik (.)",
      "Tanda persen (%)"
    ],
    "answer": 1,
    "explanation": "Di komputer dan Excel, operasi perkalian menggunakan simbol tanda bintang (*), misalnya =A1*B1."
  },
  {
    "id": 90,
    "category": "Formula Bar & Name Box",
    "level": "LOW",
    "question": "Simbol operator matematika yang digunakan untuk operasi pembagian di Excel adalah...",
    "options": [
      "Tanda titik dua (:)",
      "Tanda garis miring (/)",
      "Tanda strip (-)",
      "Tanda koma (,)"
    ],
    "answer": 1,
    "explanation": "Operasi pembagian di Excel menggunakan simbol garis miring forward slash (/), misalnya =A1/B1."
  },
  {
    "id": 91,
    "category": "Formula Bar & Name Box",
    "level": "LOW",
    "question": "Simbol operator matematika yang digunakan untuk operasi perpangkatan (eksponen) di Excel adalah...",
    "options": [
      "Tanda panah ke atas / caret (^)",
      "Tanda bintang dua (**)",
      "Tanda seru (!)",
      "Tanda dolar ($)"
    ],
    "answer": 0,
    "explanation": "Operasi pangkat di Excel ditulis dengan simbol sisipan atau caret (^), contohnya =2^3 menghasilkan angka 8."
  },
  {
    "id": 92,
    "category": "Formula Bar & Name Box",
    "level": "LOW",
    "question": "Ikon bersimbol 'fx' di dekat Formula Bar berfungsi untuk...",
    "options": [
      "Menghapus seluruh rumus",
      "Membuka kotak dialog Insert Function (Penyisipan Fungsi)",
      "Menutup aplikasi Excel",
      "Mencetak tabel"
    ],
    "answer": 1,
    "explanation": "Ikon fx membuka jendela bantuan Insert Function untuk memilih rumus bawaan Excel beserta panduan argumennya."
  },
  {
    "id": 93,
    "category": "Formula Bar & Name Box",
    "level": "MOTS",
    "question": "Jika di sel A1 kita mengetik '10 + 5' (tanpa tanda sama dengan di depannya), maka yang tampil di sel setelah ditekan Enter adalah...",
    "options": [
      "15",
      "10 + 5 (teks biasa)",
      "#VALUE!",
      "0"
    ],
    "answer": 1,
    "explanation": "Tanpa diawali tanda sama dengan (=), Excel memperlakukan masukan tersebut sebagai teks alfanumerik biasa sehingga tetap tampil '10 + 5'."
  },
  {
    "id": 94,
    "category": "Formula Bar & Name Box",
    "level": "MOTS",
    "question": "Berapa hasil dari rumus matematika Excel: =10 + 2 * 5 ?",
    "options": [
      "60",
      "20",
      "25",
      "100"
    ],
    "answer": 1,
    "explanation": "Excel mengikuti hukum prioritas hitung (KABATAKU); perkalian 2 * 5 dihitung terlebih dahulu (= 10), baru ditambah 10, hasilnya 20."
  },
  {
    "id": 95,
    "category": "Formula Bar & Name Box",
    "level": "MOTS",
    "question": "Berapa hasil dari rumus matematika Excel: =(10 + 2) * 5 ?",
    "options": [
      "60",
      "20",
      "25",
      "100"
    ],
    "answer": 0,
    "explanation": "Tanda kurung memiliki prioritas tertinggi; 10 + 2 dihitung pertama kali (= 12), lalu dikalikan 5, menghasilkan 60."
  },
  {
    "id": 96,
    "category": "Formula Bar & Name Box",
    "level": "MOTS",
    "question": "Untuk melompat langsung ke sel Z500 tanpa menggeser mouse secara manual, cara tercepat adalah...",
    "options": [
      "Mengetik Z500 di dalam kotak Name Box lalu menekan Enter",
      "Menekan tombol Page Down 100 kali",
      "Mengubah nama file",
      "Menghapus kolom A sampai Y"
    ],
    "answer": 0,
    "explanation": "Mengetik koordinat tujuan (misal Z500) pada Name Box dan menekan Enter langsung memindahkan fokus sel aktif ke sel tersebut secara instan."
  },
  {
    "id": 97,
    "category": "Formula Bar & Name Box",
    "level": "MOTS",
    "question": "Hasil dari rumus Excel: =20 - 8 / 2 adalah...",
    "options": [
      "6",
      "16",
      "14",
      "10"
    ],
    "answer": 1,
    "explanation": "Pembagian 8 / 2 dihitung terlebih dahulu (= 4), kemudian 20 - 4 = 16."
  },
  {
    "id": 98,
    "category": "Formula Bar & Name Box",
    "level": "MOTS",
    "question": "Hasil dari rumus Excel: =3^2 + 4 adalah...",
    "options": [
      "10",
      "13",
      "14",
      "24"
    ],
    "answer": 1,
    "explanation": "Pangkat 3^2 dihitung lebih dulu (= 9), kemudian 9 + 4 = 13."
  },
  {
    "id": 99,
    "category": "Formula Bar & Name Box",
    "level": "HOTS",
    "question": "Di sel A1 terdapat angka 10, dan di sel B1 terdapat angka 0. Jika di sel C1 kita ketik rumus =A1/B1, maka Excel akan menampilkan pesan error...",
    "options": [
      "#NAME?",
      "#VALUE!",
      "#DIV/0!",
      "#REF!"
    ],
    "answer": 2,
    "explanation": "Error #DIV/0! muncul saat rumus membagi sebuah angka dengan nol (0) atau sel kosong, yang secara matematis tidak terdefinisi."
  },
  {
    "id": 100,
    "category": "Formula Bar & Name Box",
    "level": "HOTS",
    "question": "Perhatikan rumus: =A1 + B1 * C1 - D1 / E1. Urutan operasi matematika yang dieksekusi pertama kali oleh Excel adalah...",
    "options": [
      "A1 + B1",
      "B1 * C1 dan D1 / E1 (kali dan bagi dieksekusi sebelum tambah dan kurang)",
      "C1 - D1",
      "Semua dieksekusi dari kiri ke kanan tanpa aturan"
    ],
    "answer": 1,
    "explanation": "Operator perkalian (*) dan pembagian (/) memiliki derajat prioritas lebih tinggi daripada penjumlahan (+) dan pengurangan (-)."
  },
  {
    "id": 101,
    "category": "Formula Bar & Name Box",
    "level": "HOTS",
    "question": "Di sel A1 tertulis teks 'Buku' dan di sel A2 tertulis angka 5000. Jika di sel A3 diketik rumus =A1*A2, pesan error yang akan muncul adalah...",
    "options": [
      "#DIV/0!",
      "#VALUE!",
      "#NAME?",
      "######"
    ],
    "answer": 1,
    "explanation": "Error #VALUE! muncul karena operasi matematika (*) mencoba mengalikan teks alfabetis ('Buku') dengan angka numerik (5000)."
  },
  {
    "id": 102,
    "category": "Formula Bar & Name Box",
    "level": "HOTS",
    "question": "Siswa mengetik rumus =SOM(A1:A5) di mana ia salah mengeja rumus SUM menjadi SOM. Pesan kesalahan yang akan dimunculkan oleh Excel adalah...",
    "options": [
      "#DIV/0!",
      "#NAME?",
      "#REF!",
      "#NULL!"
    ],
    "answer": 1,
    "explanation": "Error #NAME? muncul ketika Excel tidak mengenali nama fungsi atau teks formula yang diketik pengguna (misal salah ketik SOM)."
  },
  {
    "id": 103,
    "category": "Formula Bar & Name Box",
    "level": "HOTS",
    "question": "Perbedaan mendasar antara 'Rumus Manual' (Formula) seperti =A1+A2+A3+A4+A5 dengan 'Fungsi Bawaan' (Function) seperti =SUM(A1:A5) adalah...",
    "options": [
      "Rumus manual lebih cepat",
      "Fungsi bawaan lebih ringkas, efisien, dinamis, dan tidak rentan salah ketik terutama untuk rentang puluhan hingga ribuan sel",
      "Rumus manual menghasilkan angka lebih akurat",
      "Fungsi bawaan tidak bisa digunakan pada angka desimal"
    ],
    "answer": 1,
    "explanation": "Fungsi bawaan seperti SUM menyederhanakan penulisan rentang panjang dan secara otomatis menyesuaikan jika ada baris data baru yang disisipkan."
  },
  {
    "id": 104,
    "category": "Formula Bar & Name Box",
    "level": "HOTS",
    "question": "Sebuah sel menampilkan angka 50. Namun ketika sel tersebut diklik, pada Formula Bar di atas tertulis =25*2. Mengapa angka di sel dan di Formula Bar berbeda?",
    "options": [
      "Karena sel menampilkan hasil kalkulasi akhir dari rumus, sedangkan Formula Bar memperlihatkan formula asli di balik sel tersebut",
      "Karena sistem komputer mengalami gangguan",
      "Karena sel A1 otomatis dikunci",
      "Karena format sel diubah menjadi teks"
    ],
    "answer": 0,
    "explanation": "Sel pada lembar kerja menampilkan 'Display Value' (hasil akhir), sedangkan Formula Bar menampilkan 'Underlying Value/Formula' (rumus aslinya)."
  },
  {
    "id": 105,
    "category": "Formula Bar & Name Box",
    "level": "HOTS",
    "question": "Jika di sel A1 terdapat angka 5, dan kita mengetik rumus =A1^3 - A1, berapakah hasil yang akan ditampilkan oleh Excel?",
    "options": [
      "120",
      "15",
      "10",
      "20"
    ],
    "answer": 0,
    "explanation": "Perhitungan: 5^3 = 125. Kemudian 125 - 5 = 120."
  },
  {
    "id": 106,
    "category": "Rumus SUM & AVERAGE",
    "level": "LOW",
    "question": "Fungsi rumus =SUM(...) pada Microsoft Excel digunakan untuk...",
    "options": [
      "Mencari nilai rata-rata dari sekelompok data",
      "Menjumlahkan sekumpulan nilai atau angka pada rentang sel",
      "Mencari angka tertinggi",
      "Menghitung banyaknya sel berisi teks"
    ],
    "answer": 1,
    "explanation": "Fungsi SUM digunakan untuk menjumlahkan semua angka dalam rentang sel yang ditentukan."
  },
  {
    "id": 107,
    "category": "Rumus SUM & AVERAGE",
    "level": "LOW",
    "question": "Fungsi rumus =AVERAGE(...) pada Microsoft Excel digunakan untuk...",
    "options": [
      "Menghitung nilai rata-rata hitung (mean) dari sekumpulan angka",
      "Menjumlahkan nilai dengan kriteria tertentu",
      "Mencari nilai tengah median",
      "Menghitung sel kosong"
    ],
    "answer": 0,
    "explanation": "Fungsi AVERAGE digunakan untuk menghitung nilai rata-rata aritmatika dari argumen numerik yang diberikan."
  },
  {
    "id": 108,
    "category": "Rumus SUM & AVERAGE",
    "level": "LOW",
    "question": "Sintaks penulisan rumus SUM yang benar untuk menjumlahkan sel B2 sampai B6 adalah...",
    "options": [
      "=SUM(B2:B6)",
      "=SUM(B2;B6;TOTAL)",
      "=SUM=B2:B6",
      "=TOTAL(B2:B6)"
    ],
    "answer": 0,
    "explanation": "Penulisan fungsi SUM yang standar menggunakan nama fungsi diikuti tanda kurung buka, rentang sel (B2:B6), dan kurung tutup."
  },
  {
    "id": 109,
    "category": "Rumus SUM & AVERAGE",
    "level": "LOW",
    "question": "Sintaks penulisan rumus AVERAGE yang benar untuk mencari rata-rata nilai di sel C2 sampai C10 adalah...",
    "options": [
      "=RATA-RATA(C2:C10)",
      "=AVERAGE(C2:C10)",
      "=AVG(C2:C10)",
      "=MEAN(C2:C10)"
    ],
    "answer": 1,
    "explanation": "Excel menggunakan istilah bahasa Inggris baku '=AVERAGE(rentang)' untuk menghitung rata-rata."
  },
  {
    "id": 110,
    "category": "Rumus SUM & AVERAGE",
    "level": "LOW",
    "question": "Tanda pemisah antar argumen rumus di Excel untuk setting bahasa Indonesia secara umum adalah...",
    "options": [
      "Tanda titik koma (;)",
      "Tanda titik (.)",
      "Tanda strip (-)",
      "Tanda pagar (#)"
    ],
    "answer": 0,
    "explanation": "Pada komputer dengan regional setting Indonesia, pemisah argumen formula menggunakan tanda titik koma (;)."
  },
  {
    "id": 111,
    "category": "Rumus SUM & AVERAGE",
    "level": "MOTS",
    "question": "Di sel A1 terdapat angka 10, sel A2 angka 20, dan sel A3 angka 30. Berapakah hasil dari rumus =SUM(A1:A3)?",
    "options": [
      "50",
      "60",
      "20",
      "30"
    ],
    "answer": 1,
    "explanation": "Perhitungan: 10 + 20 + 30 = 60."
  },
  {
    "id": 112,
    "category": "Rumus SUM & AVERAGE",
    "level": "MOTS",
    "question": "Di sel B1 terdapat angka 80, sel B2 angka 90, dan sel B3 angka 70. Berapakah hasil dari rumus =AVERAGE(B1:B3)?",
    "options": [
      "75",
      "80",
      "85",
      "240"
    ],
    "answer": 1,
    "explanation": "Perhitungan rata-rata: (80 + 90 + 70) / 3 = 240 / 3 = 80."
  },
  {
    "id": 113,
    "category": "Rumus SUM & AVERAGE",
    "level": "MOTS",
    "question": "Berapa hasil dari rumus Excel: =SUM(5; 15; 20)?",
    "options": [
      "20",
      "35",
      "40",
      "45"
    ],
    "answer": 2,
    "explanation": "Penjumlahan langsung argumen angka: 5 + 15 + 20 = 40."
  },
  {
    "id": 114,
    "category": "Rumus SUM & AVERAGE",
    "level": "MOTS",
    "question": "Berapa hasil dari rumus Excel: =AVERAGE(10; 20; 30; 40)?",
    "options": [
      "20",
      "25",
      "30",
      "100"
    ],
    "answer": 1,
    "explanation": "Rata-rata dari keempat angka: (10 + 20 + 30 + 40) / 4 = 100 / 4 = 25."
  },
  {
    "id": 115,
    "category": "Rumus SUM & AVERAGE",
    "level": "MOTS",
    "question": "Di sel A1=2, A2=3, B1=4, B2=5. Berapakah hasil dari rumus =SUM(A1:B2)?",
    "options": [
      "10",
      "12",
      "14",
      "9"
    ],
    "answer": 2,
    "explanation": "Rentang A1:B2 mencakup 4 sel: 2 + 3 + 4 + 5 = 14."
  },
  {
    "id": 116,
    "category": "Rumus SUM & AVERAGE",
    "level": "HOTS",
    "question": "Di sel A1 terdapat angka 80, sel A2 kosong (blank), dan sel A3 angka 100. Berapakah hasil rumus =AVERAGE(A1:A3) di Excel?",
    "options": [
      "60",
      "90",
      "180",
      "#DIV/0!"
    ],
    "answer": 1,
    "explanation": "Excel mengabaikan sel kosong (blank cell) dalam penghitungan AVERAGE. Sehingga pembaginya hanya 2 sel: (80 + 100) / 2 = 90."
  },
  {
    "id": 117,
    "category": "Rumus SUM & AVERAGE",
    "level": "HOTS",
    "question": "Di sel B1 terdapat angka 80, sel B2 angka 0 (nol), dan sel B3 angka 100. Berapakah hasil rumus =AVERAGE(B1:B3)?",
    "options": [
      "60",
      "90",
      "180",
      "#VALUE!"
    ],
    "answer": 0,
    "explanation": "Angka 0 (nol) dianggap sebagai nilai numerik yang sah. Sehingga pembaginya adalah 3 sel: (80 + 0 + 100) / 3 = 180 / 3 = 60."
  },
  {
    "id": 118,
    "category": "Rumus SUM & AVERAGE",
    "level": "HOTS",
    "question": "Di sel C1 terdapat angka 50, sel C2 teks 'Sakit', dan sel C3 angka 70. Jika kita menulis rumus =SUM(C1:C3), apa hasil yang ditampilkan Excel?",
    "options": [
      "#VALUE!",
      "120",
      "60",
      "0"
    ],
    "answer": 1,
    "explanation": "Fungsi SUM secara otomatis mengabaikan sel yang berisi data teks, sehingga hanya menjumlahkan angka numerik: 50 + 70 = 120."
  },
  {
    "id": 119,
    "category": "Rumus SUM & AVERAGE",
    "level": "HOTS",
    "question": "Seorang siswa menuliskan rumus =SUM(A1:A5)/5. Rumus tersebut secara fungsional setara dengan rumus bawaan...",
    "options": [
      "=MAX(A1:A5)",
      "=COUNT(A1:A5)",
      "=AVERAGE(A1:A5)",
      "=RANK(A1:A5)"
    ],
    "answer": 2,
    "explanation": "Rata-rata pada dasarnya adalah total penjumlahan dibagi banyaknya data, sehingga identik dengan fungsi AVERAGE(A1:A5)."
  },
  {
    "id": 120,
    "category": "Rumus SUM & AVERAGE",
    "level": "HOTS",
    "question": "Budi menulis rumus =SUM(A1+A2+A3+A4). Mengapa penulisan rumus tersebut dianggap kurang efisien oleh guru Informatika?",
    "options": [
      "Karena operator tambah (+) di dalam fungsi SUM adalah mubazir (berlebihan); cukup tulis =SUM(A1:A4) atau =A1+A2+A3+A4",
      "Karena rumus tersebut akan menghasilkan nilai 0",
      "Karena tanda kurung tidak boleh digunakan",
      "Karena Excel akan error"
    ],
    "answer": 0,
    "explanation": "Menggunakan tanda tambah di dalam fungsi SUM adalah pemborosan sintaks; fungsi SUM dirancang untuk menerima rentang berurutan dengan titik dua (:)."
  },
  {
    "id": 121,
    "category": "Rumus MAX & MIN",
    "level": "LOW",
    "question": "Fungsi rumus =MAX(...) pada Microsoft Excel digunakan untuk...",
    "options": [
      "Menghitung jumlah total data",
      "Mencari dan menampilkan nilai angka tertinggi (terbesar) dari sekumpulan data",
      "Mencari nilai rata-rata",
      "Mencari angka terendah"
    ],
    "answer": 1,
    "explanation": "Fungsi MAX (Maximum) digunakan untuk mencari nilai angka paling besar dalam sekumpulan argumen."
  },
  {
    "id": 122,
    "category": "Rumus MAX & MIN",
    "level": "LOW",
    "question": "Fungsi rumus =MIN(...) pada Microsoft Excel digunakan untuk...",
    "options": [
      "Mencari dan menampilkan nilai angka terendah (terkecil) dari sekumpulan data",
      "Menghitung rata-rata nilai",
      "Mengurangi dua angka",
      "Mencari nama siswa"
    ],
    "answer": 0,
    "explanation": "Fungsi MIN (Minimum) digunakan untuk mencari nilai angka paling kecil dalam kumpulan data."
  },
  {
    "id": 123,
    "category": "Rumus MAX & MIN",
    "level": "LOW",
    "question": "Sintaks penulisan rumus MAX yang benar untuk mencari nilai ujian tertinggi siswa pada sel D2 sampai D35 adalah...",
    "options": [
      "=MAX(D2:D35)",
      "=MAXIMUM(D2:D35)",
      "=BIGGEST(D2:D35)",
      "=TOP(D2:D35)"
    ],
    "answer": 0,
    "explanation": "Fungsi bawaan Excel menggunakan singkatan baku '=MAX(rentang)'."
  },
  {
    "id": 124,
    "category": "Rumus MAX & MIN",
    "level": "LOW",
    "question": "Sintaks penulisan rumus MIN yang benar untuk mencari nilai ujian terendah pada sel D2 sampai D35 adalah...",
    "options": [
      "=LEAST(D2:D35)",
      "=MIN(D2:D35)",
      "=MINIMUM(D2:D35)",
      "=BOTTOM(D2:D35)"
    ],
    "answer": 1,
    "explanation": "Fungsi bawaan Excel menggunakan singkatan baku '=MIN(rentang)'."
  },
  {
    "id": 125,
    "category": "Rumus MAX & MIN",
    "level": "LOW",
    "question": "Fungsi MAX dan MIN di dalam Excel dikelompokkan ke dalam kategori fungsi...",
    "options": [
      "Fungsi Finansial",
      "Fungsi Teks",
      "Fungsi Statistik (Statistical)",
      "Fungsi Logika"
    ],
    "answer": 2,
    "explanation": "Fungsi MAX, MIN, AVERAGE, dan COUNT tergolong dalam kelompok fungsi statistik."
  },
  {
    "id": 126,
    "category": "Rumus MAX & MIN",
    "level": "MOTS",
    "question": "Diberikan sekumpulan data nilai siswa: 75, 88, 95, 60, 82. Berapakah hasil dari rumus =MAX pada data tersebut?",
    "options": [
      "88",
      "95",
      "60",
      "75"
    ],
    "answer": 1,
    "explanation": "Nilai paling tinggi di antara angka 75, 88, 95, 60, dan 82 adalah 95."
  },
  {
    "id": 127,
    "category": "Rumus MAX & MIN",
    "level": "MOTS",
    "question": "Diberikan sekumpulan data nilai siswa: 75, 88, 95, 60, 82. Berapakah hasil dari rumus =MIN pada data tersebut?",
    "options": [
      "60",
      "75",
      "82",
      "95"
    ],
    "answer": 0,
    "explanation": "Nilai paling kecil di antara angka 75, 88, 95, 60, dan 82 adalah 60."
  },
  {
    "id": 128,
    "category": "Rumus MAX & MIN",
    "level": "MOTS",
    "question": "Berapa hasil dari rumus Excel: =MAX(150; 275; 80; 320; 110)?",
    "options": [
      "80",
      "150",
      "275",
      "320"
    ],
    "answer": 3,
    "explanation": "Nilai terbesar dari kumpulan angka tersebut adalah 320."
  },
  {
    "id": 129,
    "category": "Rumus MAX & MIN",
    "level": "MOTS",
    "question": "Berapa hasil dari rumus Excel: =MIN(50; 12; 99; -5; 30)?",
    "options": [
      "-5",
      "12",
      "0",
      "99"
    ],
    "answer": 0,
    "explanation": "Nilai terkecil adalah bilangan negatif -5."
  },
  {
    "id": 130,
    "category": "Rumus MAX & MIN",
    "level": "MOTS",
    "question": "Di sel A1 terdapat angka -10, di sel A2 angka -25, dan di sel A3 angka -5. Berapakah hasil dari =MAX(A1:A3)?",
    "options": [
      "-25",
      "-10",
      "-5",
      "0"
    ],
    "answer": 2,
    "explanation": "Pada bilangan negatif, angka yang mendekati nol memiliki nilai lebih besar. Jadi nilai terbesarnya adalah -5."
  },
  {
    "id": 131,
    "category": "Rumus MAX & MIN",
    "level": "HOTS",
    "question": "Untuk menghitung rentang jangkauan data (selisih antara nilai tertinggi dan terendah) pada sel C2:C30, rumus formula yang tepat adalah...",
    "options": [
      "=MAX(C2:C30) + MIN(C2:C30)",
      "=MAX(C2:C30) - MIN(C2:C30)",
      "=MAX(C2:C30) * MIN(C2:C30)",
      "=AVERAGE(C2:C30) - MIN(C2:C30)"
    ],
    "answer": 1,
    "explanation": "Jangkauan data (range) secara statistik dihitung dengan mengurangkan nilai maksimum dengan nilai minimum: =MAX(...) - MIN(...)."
  },
  {
    "id": 132,
    "category": "Rumus MAX & MIN",
    "level": "HOTS",
    "question": "Jika seluruh sel di rentang A1:A5 berupa sel kosong (blank), apa hasil yang dikembalikan oleh fungsi =MAX(A1:A5)?",
    "options": [
      "#N/A",
      "0",
      "#VALUE!",
      "Error"
    ],
    "answer": 1,
    "explanation": "Jika seluruh sel dalam rentang kosong tanpa angka sama sekali, fungsi MAX dan MIN di Excel akan mengembalikan nilai 0."
  },
  {
    "id": 133,
    "category": "Rumus MAX & MIN",
    "level": "HOTS",
    "question": "Jika nilai di sel B4 diubah dari 85 menjadi 99, apa yang terjadi pada sel yang memuat rumus =MAX(B2:B20)?",
    "options": [
      "Nilai di sel rumus otomatis terbarui menjadi 99 secara real-time",
      "Nilai di sel rumus tetap 85 sampai komputer dimatikan",
      "Rumus harus diketik ulang dari awal",
      "Sel B4 akan berwarna merah"
    ],
    "answer": 0,
    "explanation": "Excel memiliki mesin kalkulasi dinamis; perubahan data input otomatis memperbarui hasil kalkulasi fungsi seketika."
  },
  {
    "id": 134,
    "category": "Rumus MAX & MIN",
    "level": "HOTS",
    "question": "Di sel A1=100, A2=teks 'Seratus', A3=50. Berapakah hasil dari rumus =MAX(A1:A3)?",
    "options": [
      "#VALUE!",
      "100",
      "50",
      "Seratus"
    ],
    "answer": 1,
    "explanation": "Fungsi MAX mengabaikan data berformat teks dan hanya membandingkan data numerik (100 dan 50), sehingga hasilnya 100."
  },
  {
    "id": 135,
    "category": "Rumus MAX & MIN",
    "level": "HOTS",
    "question": "Koperasi sekolah ingin mengetahui laba penjualan harian tertinggi di bulan Januari (sel D1:D31). Namun ada hari libur di mana sel tertulis teks 'Libur'. Apakah fungsi =MAX(D1:D31) tetap dapat bekerja?",
    "options": [
      "Tidak bisa, rumus akan error #VALUE!",
      "Bisa, fungsi MAX otomatis mengabaikan sel bertuliskan 'Libur' dan tetap mencari angka tertinggi",
      "Bisa, asalkan komputer terhubung internet",
      "Tidak bisa, sel teks harus dihapus manual"
    ],
    "answer": 1,
    "explanation": "Fungsi MAX secara otomatis menyaring dan mengabaikan nilai teks dalam rentang tanpa menimbulkan error."
  },
  {
    "id": 136,
    "category": "Rumus COUNT, COUNTA, & COUNTIF",
    "level": "LOW",
    "question": "Fungsi rumus =COUNT(...) pada Microsoft Excel digunakan untuk...",
    "options": [
      "Menghitung jumlah sel yang hanya berisi data ANGKA (numerik)",
      "Menjumlahkan nilai angka",
      "Mencari rata-rata",
      "Menghitung sel yang berisi teks"
    ],
    "answer": 0,
    "explanation": "Fungsi COUNT hanya menghitung sel-sel yang memuat data numerik (angka, tanggal, atau nilai logika)."
  },
  {
    "id": 137,
    "category": "Rumus COUNT, COUNTA, & COUNTIF",
    "level": "LOW",
    "question": "Fungsi rumus =COUNTA(...) pada Microsoft Excel digunakan untuk...",
    "options": [
      "Menghitung seluruh sel yang TIDAK KOSONG (berisi angka maupun teks)",
      "Hanya menghitung sel berisi teks",
      "Menghitung sel kosong saja",
      "Menghitung huruf A saja"
    ],
    "answer": 0,
    "explanation": "COUNTA (Count All) menghitung semua sel yang tidak kosong, baik berisi teks, angka, maupun simbol."
  },
  {
    "id": 138,
    "category": "Rumus COUNT, COUNTA, & COUNTIF",
    "level": "LOW",
    "question": "Fungsi rumus =COUNTBLANK(...) pada Microsoft Excel digunakan untuk...",
    "options": [
      "Menghitung jumlah sel yang KOSONG pada suatu rentang",
      "Menghapus sel kosong",
      "Mengisi sel kosong dengan angka 0",
      "Menghitung teks putih"
    ],
    "answer": 0,
    "explanation": "COUNTBLANK menghitung berapa banyak sel yang benar-benar kosong di dalam rentang yang dipilih."
  },
  {
    "id": 139,
    "category": "Rumus COUNT, COUNTA, & COUNTIF",
    "level": "LOW",
    "question": "Fungsi rumus =COUNTIF(...) pada Microsoft Excel digunakan untuk...",
    "options": [
      "Menghitung jumlah sel yang memenuhi suatu KRITERIA atau SYARAT tertentu",
      "Menjumlahkan angka bersyarat",
      "Mencari nilai terbesar bersyarat",
      "Mengurutkan data A ke Z"
    ],
    "answer": 0,
    "explanation": "COUNTIF menghitung frekuensi atau banyaknya data yang memenuhi kondisi/kriteria tertentu."
  },
  {
    "id": 140,
    "category": "Rumus COUNT, COUNTA, & COUNTIF",
    "level": "LOW",
    "question": "Berapa jumlah argumen yang wajib diisi pada rumus =COUNTIF(range; criteria)?",
    "options": [
      "1 argumen",
      "2 argumen",
      "3 argumen",
      "4 argumen"
    ],
    "answer": 1,
    "explanation": "COUNTIF membutuhkan 2 argumen: 'range' (rentang sel yang diuji) dan 'criteria' (kondisi yang dicari)."
  },
  {
    "id": 141,
    "category": "Rumus COUNT, COUNTA, & COUNTIF",
    "level": "LOW",
    "question": "Tanda baca yang digunakan untuk mengapit kriteria teks pada rumus COUNTIF (misalnya kata Lulus) adalah...",
    "options": [
      "Tanda petik tunggal (')",
      "Tanda petik ganda (\")",
      "Tanda kurung siku ([])",
      "Tanda bintang (*)"
    ],
    "answer": 1,
    "explanation": "Kriteria teks maupun operator pembanding dalam rumus Excel wajib diapit tanda petik ganda (\"), contoh: \"Lulus\"."
  },
  {
    "id": 142,
    "category": "Rumus COUNT, COUNTA, & COUNTIF",
    "level": "LOW",
    "question": "Simbol operator pembanding yang berarti 'lebih besar dari' pada kriteria rumus Excel adalah...",
    "options": [
      "<",
      ">",
      "<=",
      ">="
    ],
    "answer": 1,
    "explanation": "Simbol '>' melambangkan kondisi lebih besar dari (greater than)."
  },
  {
    "id": 143,
    "category": "Rumus COUNT, COUNTA, & COUNTIF",
    "level": "MOTS",
    "question": "Di sel A1=10, A2=20, A3=teks 'Budi', A4=sel kosong, A5=30. Berapakah hasil dari rumus =COUNT(A1:A5)?",
    "options": [
      "2",
      "3",
      "4",
      "5"
    ],
    "answer": 1,
    "explanation": "Sel yang berisi angka hanya ada 3 sel (A1=10, A2=20, A5=30). Teks 'Budi' dan sel kosong tidak dihitung oleh COUNT."
  },
  {
    "id": 144,
    "category": "Rumus COUNT, COUNTA, & COUNTIF",
    "level": "MOTS",
    "question": "Dari data yang sama (A1=10, A2=20, A3='Budi', A4=kosong, A5=30), berapakah hasil dari rumus =COUNTA(A1:A5)?",
    "options": [
      "3",
      "4",
      "5",
      "2"
    ],
    "answer": 1,
    "explanation": "COUNTA menghitung semua sel yang tidak kosong. Dari 5 sel, hanya 1 sel yang kosong, sehingga hasilnya adalah 4."
  },
  {
    "id": 145,
    "category": "Rumus COUNT, COUNTA, & COUNTIF",
    "level": "MOTS",
    "question": "Rumus yang tepat untuk menghitung berapa banyak siswa yang mendapat status 'Lulus' pada kolom E2 sampai E30 adalah...",
    "options": [
      "=COUNTIF(E2:E30; \"Lulus\")",
      "=COUNT(E2:E30; \"Lulus\")",
      "=SUMIF(E2:E30; \"Lulus\")",
      "=IF(E2:E30 = \"Lulus\")"
    ],
    "answer": 0,
    "explanation": "Sintaks yang benar untuk menghitung kemunculan kata 'Lulus' adalah =COUNTIF(E2:E30; \"Lulus\")."
  },
  {
    "id": 146,
    "category": "Rumus COUNT, COUNTA, & COUNTIF",
    "level": "MOTS",
    "question": "Diberikan data nilai di sel C2:C11. Rumus untuk menghitung berapa banyak siswa yang nilainya di atas 75 adalah...",
    "options": [
      "=COUNTIF(C2:C11; \">75\")",
      "=COUNTIF(C2:C11; >75)",
      "=COUNT(C2:C11 > 75)",
      "=SUMIF(C2:C11; \">75\")"
    ],
    "answer": 0,
    "explanation": "Kriteria numerik dengan operator pembanding wajib ditulis dalam tanda petik dua: \">75\"."
  },
  {
    "id": 147,
    "category": "Rumus COUNT, COUNTA, & COUNTIF",
    "level": "MOTS",
    "question": "Di sel B1:B5 terdapat kode jenis kelamin: L, P, L, L, P. Berapakah hasil dari rumus =COUNTIF(B1:B5; \"L\")?",
    "options": [
      "2",
      "3",
      "5",
      "0"
    ],
    "answer": 1,
    "explanation": "Huruf 'L' muncul sebanyak 3 kali pada rentang tersebut."
  },
  {
    "id": 148,
    "category": "Rumus COUNT, COUNTA, & COUNTIF",
    "level": "MOTS",
    "question": "Berapa hasil dari rumus Excel: =COUNT(10; \"Apel\"; 25; \"Jeruk\"; 40)?",
    "options": [
      "5",
      "2",
      "3",
      "0"
    ],
    "answer": 2,
    "explanation": "Data numerik berjumlah 3 (angka 10, 25, dan 40), sehingga fungsi COUNT menghasilkan 3."
  },
  {
    "id": 149,
    "category": "Rumus COUNT, COUNTA, & COUNTIF",
    "level": "MOTS",
    "question": "Pada rentang A1:A10 terdapat 10 sel. Jika 7 sel terisi data dan 3 sel lainnya kosong, hasil rumus =COUNTBLANK(A1:A10) adalah...",
    "options": [
      "7",
      "3",
      "10",
      "0"
    ],
    "answer": 1,
    "explanation": "Fungsi COUNTBLANK menghitung jumlah sel yang kosong, yaitu 3."
  },
  {
    "id": 150,
    "category": "Rumus COUNT, COUNTA, & COUNTIF",
    "level": "HOTS",
    "question": "Guru ingin mengecek berapa siswa yang belum mengumpulkan tugas (sel nilai masih kosong) pada rentang D2:D41. Rumus paling tepat adalah...",
    "options": [
      "=COUNT(D2:D41)",
      "=COUNTBLANK(D2:D41)",
      "=COUNTA(D2:D41)",
      "=SUM(D2:D41)"
    ],
    "answer": 1,
    "explanation": "Fungsi COUNTBLANK dirancang khusus untuk mendeteksi dan menghitung sel-sel yang belum terisi data."
  },
  {
    "id": 151,
    "category": "Rumus COUNT, COUNTA, & COUNTIF",
    "level": "HOTS",
    "question": "Siswa mengetik rumus =COUNTIF(B2:B20; >75) tanpa tanda petik ganda pada kriteria >75. Apa yang terjadi pada Excel?",
    "options": [
      "Rumus tetap berjalan normal",
      "Excel memunculkan pesan kesalahan rumus (formula error)",
      "Hasilnya otomatis 0",
      "Angka berubah menjadi teks"
    ],
    "answer": 1,
    "explanation": "Kriteria yang memuat operator logika seperti > atau < wajib berada di dalam tanda petik dua (misal \">75\"), jika tidak maka Excel memunculkan sintaks error."
  },
  {
    "id": 152,
    "category": "Rumus COUNT, COUNTA, & COUNTIF",
    "level": "HOTS",
    "question": "Di sel A1 terdapat angka 0 (nol). Bagaimanakah fungsi COUNT, COUNTA, dan COUNTBLANK memperlakukan sel A1 tersebut?",
    "options": [
      "Dihitung oleh COUNTBLANK saja",
      "Dihitung oleh COUNT dan COUNTA, tetapi TIDAK dihitung oleh COUNTBLANK",
      "Tidak dihitung oleh fungsi mana pun",
      "Hanya dihitung oleh COUNTA"
    ],
    "answer": 1,
    "explanation": "Angka 0 adalah data numerik yang sah. Oleh karena itu sel A1 dianggap terisi (dihitung oleh COUNT dan COUNTA) dan bukan sel kosong."
  },
  {
    "id": 153,
    "category": "Rumus COUNT, COUNTA, & COUNTIF",
    "level": "HOTS",
    "question": "Untuk menghitung berapa banyak siswa yang nilainya BUKAN 100 pada rentang C2:C30, penulisan kriteria yang tepat pada COUNTIF adalah...",
    "options": [
      "=COUNTIF(C2:C30; \"<>100\")",
      "=COUNTIF(C2:C30; \"!=100\")",
      "=COUNTIF(C2:C30; \"NOT 100\")",
      "=COUNTIF(C2:C30; \"-100\")"
    ],
    "answer": 0,
    "explanation": "Operator 'tidak sama dengan' di Excel dilambangkan dengan simbol '<>', sehingga kriteria ditulis \"<>100\"."
  },
  {
    "id": 154,
    "category": "Rumus COUNT, COUNTA, & COUNTIF",
    "level": "HOTS",
    "question": "Dalam rekap absensi 30 hari, seorang siswa memiliki catatan: Hadir 25 kali, Sakit 3 kali, dan Izin 2 kali. Rumus untuk menghitung persentase kehadiran siswa tersebut adalah...",
    "options": [
      "=COUNTIF(B2:B31; \"Hadir\") / 30",
      "=SUM(B2:B31) / 30",
      "=COUNT(B2:B31) * 30",
      "=AVERAGE(B2:B31)"
    ],
    "answer": 0,
    "explanation": "Jumlah hari hadir dihitung dengan COUNTIF, lalu dibagi total 30 hari untuk mendapatkan rasio/persentase kehadiran."
  },
  {
    "id": 155,
    "category": "Rumus COUNT, COUNTA, & COUNTIF",
    "level": "HOTS",
    "question": "Perbedaan mendasar antara fungsi COUNT dan COUNTA saat memeriksa lembar daftar nama dan nomor induk siswa adalah...",
    "options": [
      "COUNT hanya menghitung sel yang berisi nomor induk (angka), sedangkan COUNTA dapat menghitung nama siswa (teks) maupun nomor induk (angka)",
      "Keduanya sama persis",
      "COUNTA hanya menghitung huruf kapital",
      "COUNT menghitung sel kosong"
    ],
    "answer": 0,
    "explanation": "COUNT terbatas pada nilai numerik, sedangkan COUNTA menghitung segala macam data alfanumerik yang tidak kosong."
  },
  {
    "id": 156,
    "category": "Rumus SUMIF",
    "level": "LOW",
    "question": "Fungsi rumus =SUMIF(...) pada Microsoft Excel digunakan untuk...",
    "options": [
      "Menjumlahkan nilai-nilai pada suatu rentang sel yang MEMENUHI SYARAT/KRITERIA tertentu",
      "Menghitung jumlah transaksi",
      "Mencari rata-rata bersyarat",
      "Mengalikan angka"
    ],
    "answer": 0,
    "explanation": "Fungsi SUMIF menjumlahkan nilai numerik hanya jika sel terkait memenuhi kriteria yang telah ditentukan."
  },
  {
    "id": 157,
    "category": "Rumus SUMIF",
    "level": "LOW",
    "question": "Sintaks urutan argumen yang benar pada rumus SUMIF adalah...",
    "options": [
      "=SUMIF(sum_range; criteria; range)",
      "=SUMIF(range; criteria; [sum_range])",
      "=SUMIF(criteria; range; sum_range)",
      "=SUMIF(total; kriteria)"
    ],
    "answer": 1,
    "explanation": "Struktur resmi SUMIF adalah: =SUMIF(range; criteria; [sum_range])."
  },
  {
    "id": 158,
    "category": "Rumus SUMIF",
    "level": "LOW",
    "question": "Pada rumus =SUMIF(range; criteria; [sum_range]), argumen pertama 'range' berfungsi sebagai...",
    "options": [
      "Rentang sel yang akan dievaluasi berdasarkan kriteria",
      "Rentang angka yang akan dijumlahkan",
      "Hasil akhir perhitungan",
      "Nama file"
    ],
    "answer": 0,
    "explanation": "'range' adalah rentang sel acuan yang diuji apakah cocok dengan kriteria yang diminta."
  },
  {
    "id": 159,
    "category": "Rumus SUMIF",
    "level": "LOW",
    "question": "Pada rumus =SUMIF(range; criteria; [sum_range]), argumen ketiga '[sum_range]' berfungsi sebagai...",
    "options": [
      "Rentang sel numerik yang nilainya akan dijumlahkan jika kriterianya terpenuhi",
      "Kriteria teks",
      "Nomor urut",
      "Format tanggal"
    ],
    "answer": 0,
    "explanation": "'sum_range' adalah sel-sel angka aktual yang akan dihitung totalnya ketika baris sel pada rentang pertama cocok."
  },
  {
    "id": 160,
    "category": "Rumus SUMIF",
    "level": "LOW",
    "question": "Jika argumen ketiga '[sum_range]' pada fungsi SUMIF dikosongkan/diabaikan, maka Excel akan...",
    "options": [
      "Menampilkan pesan error",
      "Menjumlahkan sel-sel pada rentang pertama (range) itu sendiri yang memenuhi kriteria",
      "Menghasilkan nilai nol",
      "Menghapus data"
    ],
    "answer": 1,
    "explanation": "Jika sum_range diabaikan, Excel menggunakan rentang pertama (range) sebagai rentang penjumlahan."
  },
  {
    "id": 161,
    "category": "Rumus SUMIF",
    "level": "MOTS",
    "question": "Di kolom A terdapat nama barang (Buku, Pensil, Penggaris) dan di kolom B terdapat harga. Rumus untuk menjumlahkan total harga khusus barang 'Buku' adalah...",
    "options": [
      "=SUMIF(A2:A10; \"Buku\"; B2:B10)",
      "=SUMIF(B2:B10; \"Buku\"; A2:A10)",
      "=COUNTIF(A2:A10; \"Buku\")",
      "=SUM(A2:A10; \"Buku\")"
    ],
    "answer": 0,
    "explanation": "Rentang kriteria adalah nama barang (A2:A10), kriterianya \"Buku\", dan rentang yang dijumlahkan adalah harga (B2:B10)."
  },
  {
    "id": 162,
    "category": "Rumus SUMIF",
    "level": "MOTS",
    "question": "Di sel A1:A5 terdapat angka: 5, 15, 8, 25, 10. Berapakah hasil dari rumus =SUMIF(A1:A5; \">10\")?",
    "options": [
      "13",
      "40",
      "50",
      "63"
    ],
    "answer": 1,
    "explanation": "Angka yang lebih besar dari 10 adalah 15 dan 25. Penjumlahan: 15 + 25 = 40."
  },
  {
    "id": 163,
    "category": "Rumus SUMIF",
    "level": "MOTS",
    "question": "Di kolom B terdapat jenis kelamin ('L' dan 'P') dan di kolom C terdapat nominal uang kas. Rumus untuk menjumlahkan kas dari siswa laki-laki ('L') adalah...",
    "options": [
      "=SUMIF(B2:B30; \"L\"; C2:C30)",
      "=SUMIF(C2:C30; \"L\"; B2:B30)",
      "=COUNTIF(B2:B30; \"L\")",
      "=SUM(B2:B30 = \"L\")"
    ],
    "answer": 0,
    "explanation": "Sintaks yang tepat: =SUMIF(rentang_gender; \"L\"; rentang_nominal)."
  },
  {
    "id": 164,
    "category": "Rumus SUMIF",
    "level": "MOTS",
    "question": "Di sel B1:B4 terdapat angka penjualan: 50, 100, 30, 80. Berapakah hasil dari rumus =SUMIF(B1:B4; \">=80\")?",
    "options": [
      "180",
      "100",
      "80",
      "260"
    ],
    "answer": 0,
    "explanation": "Angka yang memenuhi kriteria >=80 adalah 100 dan 80. Penjumlahan: 100 + 80 = 180."
  },
  {
    "id": 165,
    "category": "Rumus SUMIF",
    "level": "MOTS",
    "question": "Tabel toko memuat kolom A (Kategori: 'Makanan', 'Minuman') dan kolom B (Pendapatan). Rumus menghitung total pendapatan kategori 'Minuman' adalah...",
    "options": [
      "=SUMIF(A2:A20; \"Minuman\"; B2:B20)",
      "=SUMIF(B2:B20; \"Minuman\"; A2:A20)",
      "=SUM(A2:A20 = \"Minuman\")",
      "=COUNTIF(A2:A20; \"Minuman\")"
    ],
    "answer": 0,
    "explanation": "Kategori di kolom A dievaluasi terhadap teks \"Minuman\", dan angka di kolom B dijumlahkan."
  },
  {
    "id": 166,
    "category": "Rumus SUMIF",
    "level": "HOTS",
    "question": "Perbedaan mendasar antara fungsi SUM, COUNTIF, dan SUMIF dalam pelaporan keuangan iuran kelas adalah...",
    "options": [
      "SUM menjumlahkan seluruh angka tanpa syarat; COUNTIF menghitung banyaknya siswa pembayar; SUMIF menjumlahkan total nominal uang dari kelompok tertentu",
      "Ketiganya memiliki rumus dan hasil yang sama",
      "SUMIF hanya bisa digunakan untuk menghitung hari",
      "COUNTIF menghasilkan uang, SUMIF menghasilkan teks"
    ],
    "answer": 0,
    "explanation": "SUM mengakumulasi total global, COUNTIF menghitung frekuensi kejadian data, dan SUMIF menjumlahkan nilai uang berdasarkan filter kategori."
  },
  {
    "id": 167,
    "category": "Rumus SUMIF",
    "level": "HOTS",
    "question": "Bendahara kelas menulis rumus =SUMIF(A2:A10; \"Lunas\"; B2:B5). Terdapat ketidaksamaan jumlah baris antara kriteria (A2:A10 = 9 baris) dan rentang jumlah (B2:B5 = 4 baris). Apa akibatnya?",
    "options": [
      "Excel akan otomatis menambah baris",
      "Hasil kalkulasi berisiko salah atau tidak konsisten karena ukuran dimensi rentang tidak seimbang",
      "Komputer akan mati",
      "Nilai sel berubah menjadi teks"
    ],
    "answer": 1,
    "explanation": "Ukuran dimensi antara rentang penguji (range) dan rentang penjumlahan (sum_range) sebaiknya selalu simetris (sama panjang) agar perhitungan akurat."
  },
  {
    "id": 168,
    "category": "Rumus SUMIF",
    "level": "HOTS",
    "question": "Untuk menjumlahkan seluruh nilai pada rentang D2:D20 yang bernilai selain 0 (tidak sama dengan nol), kriteria yang digunakan pada SUMIF adalah...",
    "options": [
      "\"<>0\"",
      "\"!=0\"",
      "\"NOT 0\"",
      "\"-0\""
    ],
    "answer": 0,
    "explanation": "Kriteria tidak sama dengan nol ditulis dengan tanda petik dan simbol perbandingan: \"<>0\"."
  },
  {
    "id": 169,
    "category": "Rumus SUMIF",
    "level": "HOTS",
    "question": "Sebuah toko ingin menjumlahkan penjualan seluruh barang yang nama produknya diawali kata 'Buku' (misal 'Buku Tulis', 'Buku Gambar'). Kriteria pencarian yang dapat digunakan dengan karakter wildcard adalah...",
    "options": [
      "\"Buku*\"",
      "\"Buku?\"",
      "\"Buku+\"",
      "\"Buku#\""
    ],
    "answer": 0,
    "explanation": "Tanda bintang (*) adalah karakter wildcard di Excel yang mewakili deretan karakter sembarang setelah kata 'Buku'."
  },
  {
    "id": 170,
    "category": "Rumus SUMIF",
    "level": "HOTS",
    "question": "Di sel B2:B10 terdapat nama kota pemesan dan C2:C10 nominal transaksi. Jika kita ingin menghitung total transaksi dari kota 'Bandung' yang bernilai di atas 100.000, apakah fungsi SUMIF tunggal cukup?",
    "options": [
      "Cukup dengan SUMIF biasa",
      "Tidak cukup, karena membutuhkan dua kriteria sekaligus sehingga memerlukan fungsi =SUMIFS(...)",
      "Cukup dengan fungsi COUNT",
      "Tidak bisa dihitung di Excel"
    ],
    "answer": 1,
    "explanation": "Fungsi SUMIF standar hanya mendukung 1 kriteria tunggal. Jika membutuhkan multi-kriteria (Kota Bandung DAN > 100.000), Excel menyediakan fungsi SUMIFS."
  },
  {
    "id": 171,
    "category": "Rumus IF",
    "level": "LOW",
    "question": "Fungsi rumus =IF(...) pada Microsoft Excel digunakan untuk...",
    "options": [
      "Membuat keputusan logis berdasarkan suatu kondisi (jika benar menghasilkan nilai A, jika salah menghasilkan nilai B)",
      "Menjumlahkan angka",
      "Mencari nilai rata-rata",
      "Menghitung jumlah sel"
    ],
    "answer": 0,
    "explanation": "Fungsi IF adalah fungsi logika yang menguji apakah suatu syarat terpenuhi dan menghasilkan dua kemungkinan keluaran (TRUE atau FALSE)."
  },
  {
    "id": 172,
    "category": "Rumus IF",
    "level": "LOW",
    "question": "Sintaks resmi penulisan fungsi IF standar di Excel adalah...",
    "options": [
      "=IF(logical_test; value_if_true; value_if_false)",
      "=IF(condition; then; else; end)",
      "=IF(true; false; test)",
      "=IF(range; criteria)"
    ],
    "answer": 0,
    "explanation": "Struktur baku fungsi IF: =IF(kondisi_pengujian; hasil_jika_benar; hasil_jika_salah)."
  },
  {
    "id": 173,
    "category": "Rumus IF",
    "level": "LOW",
    "question": "Simbol operator logika pembanding yang berarti 'kurang dari atau sama dengan' adalah...",
    "options": [
      "<=",
      "=<",
      "<>",
      "!="
    ],
    "answer": 0,
    "explanation": "Simbol kurang dari atau sama dengan ditulis berturut-turut: '<='."
  },
  {
    "id": 174,
    "category": "Rumus IF",
    "level": "LOW",
    "question": "Simbol operator pembanding yang berarti 'tidak sama dengan' pada penulisan rumus IF adalah...",
    "options": [
      "<>",
      "!=",
      "==",
      "><"
    ],
    "answer": 0,
    "explanation": "Di Excel, operator 'tidak sama dengan' menggunakan kombinasi kurung sudut berlawanan arah '<>'."
  },
  {
    "id": 175,
    "category": "Rumus IF",
    "level": "LOW",
    "question": "Teks keluaran (seperti kata Lulus atau Gagal) di dalam argumen rumus IF WAJIB diapit dengan tanda...",
    "options": [
      "Tanda petik ganda (\")",
      "Tanda petik tunggal (')",
      "Tanda kurung siku ([])",
      "Tanda titik (.)"
    ],
    "answer": 0,
    "explanation": "Setiap teks string konstanta di dalam formula Excel harus dibungkus oleh tanda petik ganda (\")."
  },
  {
    "id": 176,
    "category": "Rumus IF",
    "level": "MOTS",
    "question": "Berapa hasil dari rumus Excel: =IF(80 >= 75; \"Lulus\"; \"Remedial\")?",
    "options": [
      "Lulus",
      "Remedial",
      "TRUE",
      "75"
    ],
    "answer": 0,
    "explanation": "Karena 80 lebih besar dari atau sama dengan 75 (bernilai Benar/TRUE), maka keluaran yang dipilih adalah 'Lulus'."
  },
  {
    "id": 177,
    "category": "Rumus IF",
    "level": "MOTS",
    "question": "Berapa hasil dari rumus Excel: =IF(65 >= 75; \"Tuntas\"; \"Belum Tuntas\")?",
    "options": [
      "Tuntas",
      "Belum Tuntas",
      "65",
      "FALSE"
    ],
    "answer": 1,
    "explanation": "Karena 65 tidak memenuhi syarat >= 75 (bernilai Salah/FALSE), maka keluaran yang dipilih adalah argumen ketiga, yaitu 'Belum Tuntas'."
  },
  {
    "id": 178,
    "category": "Rumus IF",
    "level": "MOTS",
    "question": "Berapa hasil dari rumus Excel: =IF(10 > 5; 100; 50)?",
    "options": [
      "50",
      "100",
      "10",
      "5"
    ],
    "answer": 1,
    "explanation": "Kondisi 10 > 5 adalah Benar, sehingga nilai numerik yang dihasilkan adalah 100."
  },
  {
    "id": 179,
    "category": "Rumus IF",
    "level": "MOTS",
    "question": "Rumus untuk menentukan keterangan kelulusan siswa di sel B2 dengan KKM 70 (jika nilai >= 70 Lulus, jika tidak Remedial) adalah...",
    "options": [
      "=IF(B2>=70; \"Lulus\"; \"Remedial\")",
      "=IF(B2>70; \"Lulus\"; \"Remedial\")",
      "=IF(B2=70; \"Lulus\"; \"Remedial\")",
      "=IF(B2<70; \"Lulus\"; \"Remedial\")"
    ],
    "answer": 0,
    "explanation": "Syarat KKM kelulusan mencapai 70 menggunakan operator lebih besar sama dengan: B2>=70."
  },
  {
    "id": 180,
    "category": "Rumus IF",
    "level": "MOTS",
    "question": "Jika di sel C2 terdapat total belanjaan dan toko memberikan diskon 10000 jika belanja >= 100000, selain itu 0, rumus yang tepat adalah...",
    "options": [
      "=IF(C2>=100000; 10000; 0)",
      "=IF(C2>100000; 0; 10000)",
      "=IF(C2=100000; 10000)",
      "=IF(C2<=100000; 10000; 0)"
    ],
    "answer": 0,
    "explanation": "Rumus yang tepat: jika C2>=100000 menghasilkan angka 10000, jika tidak menghasilkan 0."
  },
  {
    "id": 181,
    "category": "Rumus IF",
    "level": "HOTS",
    "question": "Siswa bernama Doni memiliki nilai ujian 75 tepat. Guru menggunakan rumus =IF(B2>75; \"Lulus\"; \"Remedial\"). Apakah status Doni?",
    "options": [
      "Lulus",
      "Remedial",
      "#VALUE!",
      "Kosong"
    ],
    "answer": 1,
    "explanation": "Operator '>' mensyaratkan nilai harus lebih dari 75 (minimal 76). Karena nilai Doni tepat 75, kondisinya bernilai FALSE sehingga Doni berstatus Remedial."
  },
  {
    "id": 182,
    "category": "Rumus IF",
    "level": "HOTS",
    "question": "Perhatikan rumus IF bertingkat (Nested IF): =IF(A1>=90; \"A\"; IF(A1>=80; \"B\"; \"C\")). Jika sel A1 bernilai 85, apa hasil yang tampil?",
    "options": [
      "A",
      "B",
      "C",
      "Error"
    ],
    "answer": 1,
    "explanation": "Pengujian pertama (85 >= 90) bernilai FALSE. Dilanjutkan ke pengujian kedua: (85 >= 80) bernilai TRUE, sehingga menghasilkan predikat 'B'."
  },
  {
    "id": 183,
    "category": "Rumus IF",
    "level": "HOTS",
    "question": "Seorang siswa mengetik rumus =IF(B2>=75; Lulus; Remedial) tanpa tanda petik ganda pada kata Lulus dan Remedial. Apa pesan error yang akan muncul?",
    "options": [
      "#DIV/0!",
      "#NAME?",
      "#VALUE!",
      "######"
    ],
    "answer": 1,
    "explanation": "Error #NAME? muncul karena Excel mengira kata 'Lulus' dan 'Remedial' adalah nama fungsi atau rentang yang tidak terdefinisi."
  },
  {
    "id": 184,
    "category": "Rumus IF",
    "level": "HOTS",
    "question": "Apakah rumus =IF(A1=\"ya\"; \"Setuju\"; \"Batal\") membedakan huruf besar dan huruf kecil jika di sel A1 diketik huruf kapital \"YA\"?",
    "options": [
      "Ya, rumus akan menghasilkan Batal",
      "Tidak, operator pembanding teks standar di Excel tidak membedakan huruf besar/kecil (case-insensitive) sehingga tetap menghasilkan Setuju",
      "Rumus akan error #VALUE!",
      "Komputer akan membunyikan alarm"
    ],
    "answer": 1,
    "explanation": "Perbandingan logika teks standar di Excel bersifat case-insensitive, sehingga \"ya\", \"YA\", dan \"Ya\" dianggap sama persis."
  },
  {
    "id": 185,
    "category": "Rumus IF",
    "level": "HOTS",
    "question": "Dalam penilaian sikap siswa, predikat 'Sangat Baik' diberikan untuk nilai >=90, 'Baik' untuk nilai >=75, dan selain itu 'Cukup'. Rumus Nested IF yang benar adalah...",
    "options": [
      "=IF(A2>=90; \"Sangat Baik\"; IF(A2>=75; \"Baik\"; \"Cukup\"))",
      "=IF(A2>=75; \"Baik\"; IF(A2>=90; \"Sangat Baik\"; \"Cukup\"))",
      "=IF(A2<90; \"Baik\"; \"Sangat Baik\")",
      "=IF(A2=90; \"Sangat Baik\"; \"Baik\")"
    ],
    "answer": 0,
    "explanation": "Pada rumus IF bertingkat, evaluasi harus diurutkan dari kriteria batas tertinggi ke batas bawah (>=90 lebih dulu baru >=75)."
  },
  {
    "id": 186,
    "category": "Rumus RANK, VLOOKUP, & Diagnosa Error",
    "level": "LOW",
    "question": "Fungsi rumus =RANK(...) pada Microsoft Excel digunakan untuk...",
    "options": [
      "Menentukan peringkat / ranking posisi suatu nilai di dalam sekumpulan data",
      "Menjumlahkan nilai",
      "Mencari rata-rata peringkat",
      "Menghitung sel ranking"
    ],
    "answer": 0,
    "explanation": "Fungsi RANK digunakan untuk menentukan urutan peringkat (ranking) suatu nilai numerik dalam rentang data tertentu."
  },
  {
    "id": 187,
    "category": "Rumus RANK, VLOOKUP, & Diagnosa Error",
    "level": "LOW",
    "question": "Huruf 'V' pada nama fungsi VLOOKUP merupakan singkatan dari kata...",
    "options": [
      "Variable",
      "Vertical",
      "Validation",
      "Vector"
    ],
    "answer": 1,
    "explanation": "VLOOKUP adalah singkatan dari Vertical Lookup, yaitu fungsi pencarian data berdasarkan kolom vertikal dari kiri ke kanan."
  },
  {
    "id": 188,
    "category": "Rumus RANK, VLOOKUP, & Diagnosa Error",
    "level": "LOW",
    "question": "Simbol tanda dolar ($) pada penulisan rumus Excel seperti $B$2:$B$30 berfungsi untuk...",
    "options": [
      "Mengubah angka menjadi mata uang Dolar Amerika",
      "Mengunci alamat baris dan kolom agar tidak bergeser saat rumus disalin (Referensi Absolut)",
      "Mempercepat proses perhitungan",
      "Menghapus sel"
    ],
    "answer": 1,
    "explanation": "Tanda $ mengunci referensi sel agar bersifat mutlak (absolut) sehingga koordinat tidak bergeser saat disalin dengan Fill Handle."
  },
  {
    "id": 189,
    "category": "Rumus RANK, VLOOKUP, & Diagnosa Error",
    "level": "LOW",
    "question": "Nilai argumen terakhir (range_lookup) pada rumus VLOOKUP yang digunakan untuk mencari data yang SAMA PERSIS (Exact Match) adalah...",
    "options": [
      "TRUE atau 1",
      "FALSE atau 0",
      "NULL",
      "EXACT"
    ],
    "answer": 1,
    "explanation": "Argumen FALSE (atau angka 0) memerintahkan VLOOKUP untuk mencari kecocokan persis (Exact Match)."
  },
  {
    "id": 190,
    "category": "Rumus RANK, VLOOKUP, & Diagnosa Error",
    "level": "LOW",
    "question": "Pesan error di Excel yang berbunyi '#DIV/0!' menandakan bahwa...",
    "options": [
      "Terjadi kesalahan pengetikan nama rumus",
      "Sebuah angka dibagi dengan angka nol (0) atau sel kosong",
      "Lebar kolom terlalu sempit",
      "Data pencarian tidak ditemukan"
    ],
    "answer": 1,
    "explanation": "Error #DIV/0! (Division by Zero) terjadi saat formula membagi bilangan dengan nol atau sel kosong."
  },
  {
    "id": 191,
    "category": "Rumus RANK, VLOOKUP, & Diagnosa Error",
    "level": "MOTS",
    "question": "Rumus yang benar untuk menentukan peringkat nilai siswa di sel B2 terhadap seluruh nilai kelas di rentang B2:B31 adalah...",
    "options": [
      "=RANK(B2; $B$2:$B$31)",
      "=RANK(B2:B31; B2)",
      "=RANK(B2; 31)",
      "=RANK($B$2:$B$31)"
    ],
    "answer": 0,
    "explanation": "Sintaks baku: =RANK(sel_nilai; $rentang_absolut$). Rentang wajib dikunci dengan $ agar tidak bergeser saat dicopy ke bawah."
  },
  {
    "id": 192,
    "category": "Rumus RANK, VLOOKUP, & Diagnosa Error",
    "level": "MOTS",
    "question": "Perhatikan rumus: =VLOOKUP(A2; D2:F10; 3; FALSE). Angka 3 pada rumus tersebut menunjukkan...",
    "options": [
      "Nilai yang dicari berjumlah 3",
      "Nomor indeks kolom ke-3 pada tabel referensi D2:F10 yang nilainya ingin diambil",
      "Tabel diulang 3 kali",
      "Kriteria ranking ke-3"
    ],
    "answer": 1,
    "explanation": "Argumen 'col_index_num' bernilai 3 artinya Excel akan mengambil nilai dari kolom ke-3 pada tabel acuan (yaitu kolom F)."
  },
  {
    "id": 193,
    "category": "Rumus RANK, VLOOKUP, & Diagnosa Error",
    "level": "MOTS",
    "question": "Jika fungsi VLOOKUP tidak berhasil menemukan kode kunci yang dicari pada kolom pertama tabel referensi, pesan error yang tampil adalah...",
    "options": [
      "#N/A",
      "#VALUE!",
      "#DIV/0!",
      "#NAME?"
    ],
    "answer": 0,
    "explanation": "Error #N/A (Not Available) menandakan nilai kunci yang dicari tidak tersedia di dalam tabel acuan."
  },
  {
    "id": 194,
    "category": "Rumus RANK, VLOOKUP, & Diagnosa Error",
    "level": "MOTS",
    "question": "Pesan kesalahan '#REF!' pada lembar kerja Excel muncul ketika...",
    "options": [
      "Nama fungsi salah ketik",
      "Sel atau baris yang menjadi rujukan dalam rumus telah terhapus secara permanen",
      "Angka terlalu besar",
      "Tinta printer habis"
    ],
    "answer": 1,
    "explanation": "Error #REF! (Invalid Cell Reference) muncul karena sel rujukan yang dipakai rumus sudah tidak ada lagi (terhapus)."
  },
  {
    "id": 195,
    "category": "Rumus RANK, VLOOKUP, & Diagnosa Error",
    "level": "MOTS",
    "question": "Pada rumus =RANK(B2; $B$2:$B$20; 0), argumen 0 di akhir rumus mengatur agar peringkat ditentukan dengan metode...",
    "options": [
      "Descending (Nilai terbesar menjadi Peringkat 1)",
      "Ascending (Nilai terkecil menjadi Peringkat 1)",
      "Acak tanpa aturan",
      "Peringkat ganda dihilangkan"
    ],
    "answer": 0,
    "explanation": "Argumen order 0 (atau dikosongkan) mengurutkan ranking secara descending: nilai tertinggi mendapat ranking 1."
  },
  {
    "id": 196,
    "category": "Rumus RANK, VLOOKUP, & Diagnosa Error",
    "level": "HOTS",
    "question": "Mengapa rentang referensi pada rumus RANK wajib dikunci dengan tanda dolar (misalnya $B$2:$B$40) sebelum ditarik ke bawah dengan Fill Handle?",
    "options": [
      "Agar warna sel berubah menjadi hijau",
      "Agar rentang pembanding tidak bergeser turun (misal menjadi B3:B41) sehingga pembandingan peringkat tetap adil terhadap seluruh siswa",
      "Karena tanda dolar adalah syarat wajib semua rumus Excel",
      "Agar ranking otomatis dimulai dari angka 10"
    ],
    "answer": 1,
    "explanation": "Tanpa tanda dolar ($), rentang referensi akan bergeser ke bawah saat ditarik, menyebabkan siswa di bawah hanya dibandingkan dengan sisa teman di bawahnya saja."
  },
  {
    "id": 197,
    "category": "Rumus RANK, VLOOKUP, & Diagnosa Error",
    "level": "HOTS",
    "question": "Aturan mutlak yang harus dipenuhi mengenai posisi kolom kunci pencarian (lookup_value) pada tabel referensi fungsi VLOOKUP adalah...",
    "options": [
      "Kolom kunci wajib berada di kolom pertama paling kiri dari tabel referensi",
      "Kolom kunci wajib berada di kolom paling kanan",
      "Kolom kunci bebas di mana saja",
      "Kolom kunci harus di baris pertama"
    ],
    "answer": 0,
    "explanation": "VLOOKUP hanya dapat memindai kata kunci pada kolom pertama (paling kiri) dari tabel array yang didefinisikan."
  },
  {
    "id": 198,
    "category": "Rumus RANK, VLOOKUP, & Diagnosa Error",
    "level": "HOTS",
    "question": "Di sel E2 tertulis rumus =VLOOKUP(A2; G2:I10; 4; FALSE). Mengapa rumus tersebut menghasilkan pesan kesalahan #REF!?",
    "options": [
      "Karena tabel acuan G2:I10 hanya memiliki 3 kolom (G, H, I), sedangkan rumus meminta mengambil data dari kolom ke-4",
      "Karena kode di sel A2 belum diketik",
      "Karena teks FALSE harus ditulis huruf kecil",
      "Karena baris tabel kurang banyak"
    ],
    "answer": 0,
    "explanation": "Indeks kolom yang diminta (4) melebihi jumlah kolom fisik tabel acuan G:I (hanya 3 kolom), sehingga menimbulkan rujukan tidak valid (#REF!)."
  },
  {
    "id": 199,
    "category": "Rumus RANK, VLOOKUP, & Diagnosa Error",
    "level": "HOTS",
    "question": "Siswa ingin menampilkan predikat 'Lulus' jika rata-rata (sel D2) >= 75 dan 'Remedial' jika di bawah 75, sekaligus menampilkan peringkatnya di sel F2. Pasangan rumus yang paling tepat berturut-turut untuk kolom Keterangan dan Peringkat adalah...",
    "options": [
      "=IF(D2>=75; \"Lulus\"; \"Remedial\") dan =RANK(D2; $D$2:$D$30)",
      "=SUM(D2:D30) dan =AVERAGE(D2)",
      "=COUNTIF(D2; \"Lulus\") dan =VLOOKUP(D2)",
      "=MAX(D2:D30) dan =MIN(D2:D30)"
    ],
    "answer": 0,
    "explanation": "Kolom kelulusan menggunakan fungsi logika IF bersyarat, dan kolom peringkat kelas menggunakan fungsi RANK dengan penguncian absolut $."
  },
  {
    "id": 200,
    "category": "Rumus RANK, VLOOKUP, & Diagnosa Error",
    "level": "HOTS",
    "question": "Dalam buku rapor digital kelas VIII, tabel nilai memanfaatkan rumus SUM (menghitung total), AVERAGE (menghitung rata-rata), IF (menentukan ketuntasan), RANK (menentukan juara kelas), dan VLOOKUP (mengambil nama siswa berdasarkan NIS). Mengapa integrasi rumus-rumus ini sangat efektif bagi guru?",
    "options": [
      "Karena seluruh pengolahan nilai berjalan otomatis, akurat, cepat, minim kesalahan manusia, dan siap dicetak secara rapi",
      "Agar guru tidak perlu masuk ke kelas mengajar",
      "Karena kurikulum mewajibkan guru menggunakan semua rumus Excel",
      "Agar komputer sekolah bekerja maksimal"
    ],
    "answer": 0,
    "explanation": "Kombinasi rumus dasar spreadsheet mengotomatiskan seluruh alur komputasi akademis secara presisi, hemat waktu, dan terstandarisasi."
  }
];

// State Kuis Aktif
let currentQuizQuestions = [];
let quizIndex = 0;
let quizScore = 0;
let answered = false;

// Fungsi Pengacak Array (Fisher-Yates Shuffle)
function shuffleArray(arr) {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Fungsi Mengambil 10 Soal Acak yang Seimbang (4 LOW, 3 MOTS, 3 HOTS)
function generateRandomQuizSet(totalCount = 10) {
  const lowList = QUIZ_BANK_200.filter(q => q.level === 'LOW');
  const motsList = QUIZ_BANK_200.filter(q => q.level === 'MOTS');
  const hotsList = QUIZ_BANK_200.filter(q => q.level === 'HOTS');

  // Pilih secara acak dari masing-masing tingkat kesulitan
  const pickedLow = shuffleArray(lowList).slice(0, 4);
  const pickedMots = shuffleArray(motsList).slice(0, 3);
  const pickedHots = shuffleArray(hotsList).slice(0, 3);

  // Gabungkan dan acak ulang urutan soal agar variatif
  const combined = [...pickedLow, ...pickedMots, ...pickedHots];
  return shuffleArray(combined);
}

// Inisialisasi Sesi Kuis Baru (Dipanggil saat halaman dibuka, refresh, dan restart)
function initQuizSession() {
  currentQuizQuestions = generateRandomQuizSet(10);
  quizIndex = 0;
  quizScore = 0;
  answered = false;

  const activeView = document.getElementById('quizActiveView');
  const resultView = document.getElementById('quizResultView');
  if (activeView) activeView.style.display = 'block';
  if (resultView) resultView.style.display = 'none';

  loadQuizQuestion(0);
}

function loadQuizQuestion(index) {
  if (!currentQuizQuestions || currentQuizQuestions.length === 0) {
    currentQuizQuestions = generateRandomQuizSet(10);
  }

  if (index >= currentQuizQuestions.length) {
    showQuizResults();
    return;
  }

  quizIndex = index;
  answered = false;
  const q = currentQuizQuestions[index];

  // Update Top Bar & Progress
  const currentStepEl = document.getElementById('quizCurrentStep');
  const runningScoreEl = document.getElementById('quizRunningScore');
  const progressFillEl = document.getElementById('quizProgressFill');
  const catBadgeEl = document.getElementById('quizCategoryBadge');
  const levelBadgeEl = document.getElementById('quizLevelBadge');
  const qTitleEl = document.getElementById('quizQuestionTitle');
  const optionsListEl = document.getElementById('quizOptionsList');
  const feedbackBoxEl = document.getElementById('quizFeedbackBox');
  const nextBtnEl = document.getElementById('btnQuizNext');

  if (currentStepEl) currentStepEl.textContent = `SOAL ${index + 1} / ${currentQuizQuestions.length}`;
  if (runningScoreEl) runningScoreEl.textContent = `${quizScore} Poin`;
  if (progressFillEl) progressFillEl.style.width = `${((index + 1) / currentQuizQuestions.length) * 100}%`;
  
  if (catBadgeEl) catBadgeEl.textContent = `📂 ${q.category}`;

  // Render Badge Tingkat Kesulitan (LOW, MOTS, HOTS)
  if (levelBadgeEl) {
    let levelLabel = '';
    let levelClass = '';
    if (q.level === 'LOW') {
      levelLabel = '🟢 Level: LOW (LOTS)';
      levelClass = 'level-low';
    } else if (q.level === 'MOTS') {
      levelLabel = '🔵 Level: MOTS';
      levelClass = 'level-mots';
    } else if (q.level === 'HOTS') {
      levelLabel = '🔴 Level: HOTS';
      levelClass = 'level-hots';
    }
    levelBadgeEl.textContent = levelLabel;
    levelBadgeEl.className = `q-badge-level ${levelClass}`;
  }

  if (qTitleEl) qTitleEl.textContent = q.question;

  if (feedbackBoxEl) {
    feedbackBoxEl.style.display = 'none';
    feedbackBoxEl.className = 'quiz-feedback-box';
  }
  if (nextBtnEl) nextBtnEl.style.display = 'none';

  // Render pilihan A, B, C, D
  if (optionsListEl) {
    optionsListEl.innerHTML = '';
    const letters = ['A', 'B', 'C', 'D'];
    q.options.forEach((optText, optIdx) => {
      const optItem = document.createElement('div');
      optItem.className = 'quiz-opt-item';
      optItem.innerHTML = `
        <div class="opt-prefix">${letters[optIdx]}</div>
        <div class="opt-text">${optText}</div>
      `;
      optItem.onclick = function() {
        if (!answered) {
          selectQuizAnswer(optIdx, this);
        }
      };
      optionsListEl.appendChild(optItem);
    });
  }
}

function selectQuizAnswer(selectedIdx, element) {
  answered = true;
  const q = currentQuizQuestions[quizIndex];
  const allItems = document.querySelectorAll('.quiz-opt-item');
  allItems.forEach(item => item.classList.add('disabled'));

  const feedbackBox = document.getElementById('quizFeedbackBox');
  const nextBtn = document.getElementById('btnQuizNext');
  const runningScoreEl = document.getElementById('quizRunningScore');

  if (selectedIdx === q.answer) {
    element.classList.add('correct');
    quizScore += 10;
    if (runningScoreEl) runningScoreEl.textContent = `${quizScore} Poin`;

    if (feedbackBox) {
      feedbackBox.className = 'quiz-feedback-box correct';
      feedbackBox.innerHTML = `🎉 <strong>Jawaban Kamu Benar! (+10 Poin)</strong><br>${q.explanation}`;
      feedbackBox.style.display = 'block';
    }
  } else {
    element.classList.add('wrong');
    // Highlight jawaban yang benar
    if (allItems[q.answer]) {
      allItems[q.answer].classList.add('correct');
    }

    if (feedbackBox) {
      feedbackBox.className = 'quiz-feedback-box wrong';
      feedbackBox.innerHTML = `❌ <strong>Jawaban Masih Kurang Tepat.</strong><br>Jawaban yang benar adalah <strong>Pilihan ${['A', 'B', 'C', 'D'][q.answer]}: ${q.options[q.answer]}</strong>.<br>${q.explanation}`;
      feedbackBox.style.display = 'block';
    }
  }

  if (nextBtn) nextBtn.style.display = 'inline-flex';
}

function nextQuizQuestion() {
  loadQuizQuestion(quizIndex + 1);
}

function showQuizResults() {
  const activeView = document.getElementById('quizActiveView');
  const resultView = document.getElementById('quizResultView');
  if (activeView) activeView.style.display = 'none';
  if (resultView) resultView.style.display = 'block';

  const finalScoreEl = document.getElementById('finalScoreVal');
  const trophyEl = document.getElementById('resTrophy');
  const badgeEl = document.getElementById('resCategoryBadge');
  const msgEl = document.getElementById('resFeedbackMsg');

  if (finalScoreEl) finalScoreEl.textContent = quizScore;

  // Evaluasi Kategori Nilai Siswa SMP
  let catClass = '';
  let catText = '';
  let feedbackMsg = '';
  let trophy = '🏆';

  if (quizScore >= 90) {
    catClass = 'cat-sangat-baik';
    catText = 'Sangat Baik 🏆';
    trophy = '🏆';
    feedbackMsg = 'Luar biasa! Kamu berhasil menaklukkan soal-soal HOTS dan menguasai seluruh konsep Excel serta rumusnya dengan sangat baik!';
  } else if (quizScore >= 80) {
    catClass = 'cat-baik';
    catText = 'Baik 👍';
    trophy = '🌟';
    feedbackMsg = 'Bagus sekali! Pemahamanmu mengenai rumus dan antarmuka Excel sudah baik dan siap diterapkan dalam tugas praktikum.';
  } else if (quizScore >= 70) {
    catClass = 'cat-cukup';
    catText = 'Cukup 🙂';
    trophy = '👍';
    feedbackMsg = 'Capaianmu sudah memenuhi standar KKM. Pelajari kembali materi SUMIF, COUNTIF, dan VLOOKUP agar pemahamanmu semakin matang!';
  } else {
    catClass = 'cat-belajar';
    catText = 'Perlu Belajar Lagi 📚';
    trophy = '📚';
    feedbackMsg = 'Jangan patah semangat! Buka kembali menu Materi dan coba latihan kalkulator rumus, lalu kerjakan kuis ini lagi untuk mendapatkan soal-soal baru!';
  }

  if (trophyEl) trophyEl.textContent = trophy;
  if (badgeEl) {
    badgeEl.className = `result-category-badge ${catClass}`;
    badgeEl.textContent = catText;
  }
  if (msgEl) msgEl.textContent = feedbackMsg;

  // Catat kuis selesai di progress
  userProgress.quizCompleted = true;
  userProgress.quizScore = quizScore;
  saveProgress();
}

function restartQuiz() {
  // Setiap klik restart, buat sesi kuis baru dengan 10 soal acak yang berbeda
  initQuizSession();
}

// ====================================================================
// 7. INISIALISASI SAAT HALAMAN SELESAI DIMUAT
// ====================================================================
document.addEventListener('DOMContentLoaded', () => {
  // 1. Muat progres belajar
  loadProgress();

  // 2. Inisialisasi Peta Antarmuka & Sheet Manager
  selectInterfacePart('quick_access');
  renderSimSheetTabs();

  // 3. Inisialisasi Cell Inspector di Tab B Materi
  initCellInspector();

  // 4. Inisialisasi Simulasi VLOOKUP
  runVlookupSimulation();

  // 5. Inisialisasi Aktivitas 2 (Drag Puzzle)
  loadDragPuzzle(0);

  // 6. Inisialisasi Aktivitas 3 (Scenario)
  loadScenarioQuestion(0);

  // 7. Inisialisasi Aktivitas 4 (Simulasi Excel)
  runSpreadsheetSimulation('SUM');

  // 8. Inisialisasi Sesi Kuis Acak dari Bank 200 Soal
  initQuizSession();

  console.log('Media Pembelajaran Excel Dasar & Rumus siap digunakan! Bank Soal: 200 soal aktif.');
});
