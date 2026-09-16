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
// 6. MENU KUIS INTERAKTIF (10 SOAL LENGKAP PILIHAN GANDA)
// ====================================================================
const QUIZ_QUESTIONS = [
  {
    category: "Menu Bar / Ribbon",
    question: "Tab menu pada Ribbon Excel yang paling sering digunakan untuk mengatur jenis huruf (Font), garis tabel (Border), dan menggabungkan sel (Merge & Center) adalah...",
    options: [
      "Tab Sisipkan (Insert)",
      "Tab Beranda (Home)",
      "Tab Tata Letak (Page Layout)",
      "Tab Tinjau (Review)"
    ],
    answer: 1, // B
    explanation: "Tab Home (Beranda) adalah pusat penyuntingan teks, format font, garis tabel, alignment (Merge & Center), dan format angka."
  },
  {
    category: "Cell & Fill Handle",
    question: "Titik kotak kecil di sudut kanan bawah cell aktif yang digunakan untuk membuat nomor urut otomatis (1, 2, 3...) dan menyalin rumus secara instan disebut...",
    options: [
      "Scrollbar",
      "Fill Handle",
      "Formula Bar",
      "Name Box"
    ],
    answer: 1, // B
    explanation: "Fill Handle adalah titik kotak kecil di pojok kanan bawah sel aktif untuk melakukan AutoFill deret angka, hari, bulan, atau menyalin rumus."
  },
  {
    category: "Formula Bar & Name Box",
    question: "Bagian antarmuka Excel yang menampilkan alamat sel yang sedang aktif (misalnya C4) atau digunakan melompat cepat ke sel tertentu adalah...",
    options: [
      "Status Bar",
      "Formula Bar",
      "Name Box (Kotak Nama)",
      "Title Bar"
    ],
    answer: 2, // C
    explanation: "Name Box (Kotak Nama) menampilkan koordinat sel aktif dan dapat diketik untuk melompat langsung ke sel tujuan."
  },
  {
    category: "Manajemen Sheet",
    question: "Perbedaan antara Workbook dan Worksheet di Microsoft Excel yang paling tepat adalah...",
    options: [
      "Workbook adalah file buku kerja utuh (.xlsx), sedangkan Worksheet adalah satu lembar halaman kerja di dalamnya",
      "Worksheet adalah file utuh, Workbook adalah nama kolom",
      "Workbook hanya menampung angka, Worksheet hanya menampung teks",
      "Workbook dan Worksheet adalah istilah yang sama persis tanpa perbedaan"
    ],
    answer: 0, // A
    explanation: "Workbook diibaratkan satu buku kerja utuh, sedangkan Worksheet adalah lembaran-lembaran halaman kerja di dalam buku tersebut."
  },
  {
    category: "Aturan Dasar Rumus",
    question: "Setiap penulisan rumus atau fungsi di dalam Microsoft Excel selalu WAJIB diawali dengan tanda...",
    options: [
      "Tanda titik dua (:)",
      'Tanda petik ganda (")',
      "Tanda sama dengan (=)",
      "Tanda tambah (+)"
    ],
    answer: 2, // C
    explanation: "Aturan emas Excel: semua formula dan fungsi wajib diawali tanda sama dengan (=) agar dikenali sebagai perhitungan matematis."
  },
  {
    category: "Rumus SUM",
    question: "Rumus Excel yang digunakan untuk menjumlahkan seluruh data angka dalam suatu range, misalnya dari cell B2 sampai B6, adalah...",
    options: [
      "=SUM(B2:B6)",
      "=COUNT(B2:B6)",
      "=MAX(B2:B6)",
      "=AVERAGE(B2:B6)"
    ],
    answer: 0, // A
    explanation: "Rumus =SUM(B2:B6) menjumlahkan seluruh nilai angka dalam rentang sel B2 hingga B6."
  },
  {
    category: "Rumus AVERAGE",
    question: "Jika ingin mencari nilai rata-rata ulangan siswa dari cell C2 sampai C6, rumus yang tepat digunakan adalah...",
    options: [
      "=SUM(C2:C6)",
      "=AVERAGE(C2:C6)",
      "=COUNTIF(C2:C6)",
      "=MIN(C2:C6)"
    ],
    answer: 1, // B
    explanation: "=AVERAGE(C2:C6) membagi total nilai dengan jumlah siswa untuk menghasilkan nilai rata-rata kelas."
  },
  {
    category: "Rumus MAX & MIN",
    question: "Rumus yang digunakan untuk mencari nilai angka tertinggi dan terendah pada tabel nilai siswa secara berurutan adalah...",
    options: [
      "SUM dan COUNT",
      "MAX dan MIN",
      "IF dan SUMIF",
      "AVERAGE dan RANK"
    ],
    answer: 1, // B
    explanation: "MAX digunakan untuk mencari angka tertinggi, sedangkan MIN untuk mencari angka terendah."
  },
  {
    category: "Rumus IF",
    question: 'Rumus =IF(B2>=75; "Lulus"; "Belum Lulus") akan menghasilkan kata "Belum Lulus" apabila cell B2 bernilai...',
    options: [
      "80",
      "75",
      "90",
      "68"
    ],
    answer: 3, // D
    explanation: "Karena nilai 68 lebih kecil dari syarat 75, maka kondisi bernilai SALAH dan menghasilkan nilai_jika_salah ('Belum Lulus')."
  },
  {
    category: "Rumus VLOOKUP",
    question: "Rumus yang digunakan untuk mencari dan mengambil data harga atau nama barang secara vertikal berdasarkan kode barang pada tabel lain adalah...",
    options: [
      "=RANK.EQ",
      "=VLOOKUP",
      "=SUMIF",
      "=COUNT"
    ],
    answer: 1, // B
    explanation: "VLOOKUP (Vertical Lookup) mencari data secara vertikal dari kolom pertama tabel referensi berdasarkan kunci pencarian."
  }
];

let quizIndex = 0;
let quizScore = 0;
let answered = false;

function loadQuizQuestion(index) {
  if (index >= QUIZ_QUESTIONS.length) {
    showQuizResults();
    return;
  }

  quizIndex = index;
  answered = false;
  const q = QUIZ_QUESTIONS[index];

  // Update Top Bar
  const currentStepEl = document.getElementById('quizCurrentStep');
  const runningScoreEl = document.getElementById('quizRunningScore');
  const progressFillEl = document.getElementById('quizProgressFill');
  const catBadgeEl = document.getElementById('quizCategoryBadge');
  const qTitleEl = document.getElementById('quizQuestionTitle');
  const optionsListEl = document.getElementById('quizOptionsList');
  const feedbackBoxEl = document.getElementById('quizFeedbackBox');
  const nextBtnEl = document.getElementById('btnQuizNext');

  if (currentStepEl) currentStepEl.textContent = `SOAL ${index + 1} / ${QUIZ_QUESTIONS.length}`;
  if (runningScoreEl) runningScoreEl.textContent = `${quizScore} Poin`;
  if (progressFillEl) progressFillEl.style.width = `${((index + 1) / QUIZ_QUESTIONS.length) * 100}%`;
  if (catBadgeEl) catBadgeEl.textContent = `Kategori: ${q.category}`;
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
  const q = QUIZ_QUESTIONS[quizIndex];
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

  // Evaluasi Kategori Nilai SMP
  let catClass = '';
  let catText = '';
  let feedbackMsg = '';
  let trophy = '🏆';

  if (quizScore >= 90) {
    catClass = 'cat-sangat-baik';
    catText = 'Sangat Baik 🏆';
    trophy = '🏆';
    feedbackMsg = 'Luar biasa! Kamu sudah sangat mahir menguasai antarmuka lembar kerja Excel dan seluruh 10 rumus pentingnya!';
  } else if (quizScore >= 80) {
    catClass = 'cat-baik';
    catText = 'Baik 👍';
    trophy = '🌟';
    feedbackMsg = 'Bagus sekali! Pemahamanmu mengenai rumus Excel dasar sudah baik dan siap diterapkan dalam tugas sekolah.';
  } else if (quizScore >= 70) {
    catClass = 'cat-cukup';
    catText = 'Cukup 🙂';
    trophy = '👍';
    feedbackMsg = 'Capaianmu sudah cukup baik. Pelajari kembali beberapa rumus seperti SUMIF, COUNTIF, dan VLOOKUP agar semakin lancar!';
  } else {
    catClass = 'cat-belajar';
    catText = 'Perlu Belajar Lagi 📚';
    trophy = '📚';
    feedbackMsg = 'Jangan berkecil hati! Buka kembali menu Materi dan pelajari fungsi rumus satu per satu, lalu coba kuis ini kembali!';
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
  quizIndex = 0;
  quizScore = 0;
  answered = false;

  const activeView = document.getElementById('quizActiveView');
  const resultView = document.getElementById('quizResultView');
  if (activeView) activeView.style.display = 'block';
  if (resultView) resultView.style.display = 'none';

  loadQuizQuestion(0);
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

  // 3. Inisialisasi Simulasi VLOOKUP
  runVlookupSimulation();

  // 4. Inisialisasi Aktivitas 2 (Drag Puzzle)
  loadDragPuzzle(0);

  // 5. Inisialisasi Aktivitas 3 (Scenario)
  loadScenarioQuestion(0);

  // 6. Inisialisasi Aktivitas 4 (Simulasi Excel)
  runSpreadsheetSimulation('SUM');

  // 7. Inisialisasi Kuis Soal 1
  loadQuizQuestion(0);

  console.log('Media Pembelajaran Excel Dasar & Rumus siap digunakan!');
});
