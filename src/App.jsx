import { useState, useEffect, useMemo, useCallback, useRef, useLayoutEffect } from "react";
import {
  Plus, Trash2, X, GitBranch,
  Home, Search, Loader2, Pencil, ArrowLeft, Check, User, Palette, Printer, ListOrdered, MapPin, RotateCcw
} from "lucide-react";

/* ---------------------------------------------------------
   DATA JENIS
   perawi : { id, nama_arab, nama_rumi, gelaran, tabaqat, wafat, catatan }
   sanad  : { id, guru_id, murid_id, riwayat, catatan }
--------------------------------------------------------- */

const TABAQAT = [
  "Rasulullah ﷺ",
  "Malaikat",
  "Sahabat",
  "Tabi'in",
  "Tabi' Tabi'in",
  "Imam Qiraat",
  "Turuq (Syatibiyyah/Tayyibah)",
  "Ulama Kemudian",
  "Ulama",
  "Ulama Semasa",
];

const NEGERI = [
  "Johor", "Kedah", "Kelantan", "Melaka", "Negeri Sembilan", "Pahang",
  "Perak", "Perlis", "Pulau Pinang", "Sabah", "Sarawak", "Selangor",
  "Terengganu", "Wilayah Persekutuan",
];

const uid = (p) => `${p}_${Math.random().toString(36).slice(2, 9)}`;

/* Warna konsisten dijana daripada nama kategori/kumpulan (cth. negara/mazhab),
   supaya kategori yang sama sentiasa dapat warna yang sama tanpa perlu disimpan. */
function categoryColor(name) {
  if (!name) return null;
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 52%, 42%)`;
}

const DEFAULT_LINE_COLOR = "#B9A66E";

/* Warna anak panah ikut riwayat/jalur sanad — "Umum" (sambungan generik,
   belum bercabang ikut riwayat) sentiasa guna warna neutral. */
function riwayatColor(riwayat) {
  if (!riwayat || riwayat === "Umum") return DEFAULT_LINE_COLOR;
  return categoryColor(riwayat);
}

function slugId(s) {
  return String(s || "umum").replace(/[^a-zA-Z0-9]/g, "_");
}

const SEED_PERAWI = [
  { id: "p_jibril", nama_arab: "جِبْرِيل عَلَيْهِ السَّلَام", nama_rumi: "Jibril a.s.", gelaran: "", tabaqat: "Malaikat", wafat: "", catatan: "Menyampaikan wahyu al-Quran kepada Nabi Muhammad ﷺ." },
  { id: "p_nabi", nama_arab: "مُحَمَّد رَسُوْل اللّٰه ﷺ", nama_rumi: "Nabi Muhammad ﷺ", gelaran: "", tabaqat: "Rasulullah ﷺ", wafat: "11", catatan: "Menerima al-Quran daripada Malaikat Jibril a.s." },
  { id: "p_uthman", nama_arab: "عُثْمَان بْن عَفَّان", nama_rumi: "Uthman bin Affan", gelaran: "Khalifah ke-3", tabaqat: "Sahabat", wafat: "35", catatan: "" },
  { id: "p_ali", nama_arab: "عَلِيّ بْن أَبِي طَالِب", nama_rumi: "Ali bin Abi Talib", gelaran: "Khalifah ke-4", tabaqat: "Sahabat", wafat: "40", catatan: "" },
  { id: "p_zaid", nama_arab: "زَيْد بْن ثَابِت", nama_rumi: "Zaid bin Thabit", gelaran: "", tabaqat: "Sahabat", wafat: "45", catatan: "Ketua penulis wahyu." },
  { id: "p_ubay", nama_arab: "أُبَيّ بْن كَعْب", nama_rumi: "Ubay bin Ka'b", gelaran: "", tabaqat: "Sahabat", wafat: "30?", catatan: "Tahun wafat berbeza mengikut riwayat." },
  { id: "p_sulami", nama_arab: "أَبُو عَبْدِ الرَّحْمَن السُّلَمِي", nama_rumi: "Abu Abd al-Rahman al-Sulami", gelaran: "", tabaqat: "Tabi'in", wafat: "74", catatan: "" },
  { id: "p_asim", nama_arab: "عَاصِم بْن أَبِي النَّجُود", nama_rumi: "'Asim bin Abi al-Najud", gelaran: "Imam Kufah", tabaqat: "Imam Qiraat", wafat: "127", kategori: "Iraq", catatan: "" },
  { id: "p_hafs", nama_arab: "حَفْص بْن سُلَيْمَان", nama_rumi: "Hafs bin Sulaiman", gelaran: "", tabaqat: "Imam Qiraat", wafat: "180", kategori: "Iraq", catatan: "Riwayat yang paling meluas digunakan hari ini." },
  { id: "p_nafi", nama_arab: "نَافِع بْن عَبْد الرَّحْمَن", nama_rumi: "Nafi' bin Abd al-Rahman", gelaran: "Imam Madinah", tabaqat: "Imam Qiraat", wafat: "169", kategori: "Madinah", catatan: "" },
  { id: "p_warsh", nama_arab: "عُثْمَان بْن سَعِيد الوَرْش", nama_rumi: "Warsh (Uthman bin Sa'id)", gelaran: "", tabaqat: "Imam Qiraat", wafat: "197", kategori: "Mesir", catatan: "" },
  { id: "p_syatibiyyah", nama_arab: "طَرِيق الشَّاطِبِيَّة", nama_rumi: "Tariq al-Syatibiyyah", gelaran: "", tabaqat: "Turuq (Syatibiyyah/Tayyibah)", wafat: "", catatan: "Jalur sanad merujuk kepada nazam Hirz al-Amani (asy-Syatibiyyah) oleh Imam asy-Syatibi — meliputi Qiraat Tujuh." },
  { id: "p_tayyibah", nama_arab: "طَرِيق الطَّيِّبَة", nama_rumi: "Tariq al-Tayyibah", gelaran: "", tabaqat: "Turuq (Syatibiyyah/Tayyibah)", wafat: "", catatan: "Jalur sanad merujuk kepada Tayyibat al-Nasyr oleh Imam Ibn al-Jazari — meliputi Qiraat Sepuluh." },
  { id: "p_qari_mesir", nama_arab: "قَارِئ مِصْرِيّ (مِثَال)", nama_rumi: "Contoh Qari Mesir", gelaran: "", tabaqat: "Ulama Kemudian", wafat: "", kategori: "Mesir", catatan: "Placeholder — gantikan dengan nama qari sebenar." },
  { id: "p_qari_syam", nama_arab: "قَارِئ شَامِيّ (مِثَال)", nama_rumi: "Contoh Qari Syam", gelaran: "", tabaqat: "Ulama Kemudian", wafat: "", kategori: "Syam", catatan: "Placeholder — gantikan dengan nama qari sebenar." },
  { id: "p_qari_kuwait", nama_arab: "قَارِئ كُوَيْتِيّ (مِثَال)", nama_rumi: "Contoh Qari Kuwait", gelaran: "", tabaqat: "Ulama Kemudian", wafat: "", kategori: "Kuwait", catatan: "Placeholder — gantikan dengan nama qari sebenar." },
  { id: "p_guru_selangor", nama_arab: "قَارِئ سلاڠور (مِثَال)", nama_rumi: "Contoh Guru Selangor", gelaran: "", tabaqat: "Ulama Semasa", wafat: "", kategori: "Selangor", catatan: "Placeholder — gantikan dengan nama guru sebenar." },
  { id: "p_guru_kelantan", nama_arab: "قَارِئ كلنتن (مِثَال)", nama_rumi: "Contoh Guru Kelantan", gelaran: "", tabaqat: "Ulama Semasa", wafat: "", kategori: "Kelantan", catatan: "Placeholder — gantikan dengan nama guru sebenar." },
  { id: "p_guru_penang", nama_arab: "قَارِئ ڤيناڠ (مِثَال)", nama_rumi: "Contoh Guru Pulau Pinang", gelaran: "", tabaqat: "Ulama Semasa", wafat: "", kategori: "Pulau Pinang", catatan: "Placeholder — gantikan dengan nama guru sebenar." },
];

const SEED_SANAD = [
  { id: uid("s"), guru_id: "p_jibril", murid_id: "p_nabi", riwayat: "Umum", catatan: "" },
  { id: uid("s"), guru_id: "p_nabi", murid_id: "p_uthman", riwayat: "Umum", catatan: "" },
  { id: uid("s"), guru_id: "p_nabi", murid_id: "p_ali", riwayat: "Umum", catatan: "" },
  { id: uid("s"), guru_id: "p_nabi", murid_id: "p_zaid", riwayat: "Umum", catatan: "" },
  { id: uid("s"), guru_id: "p_nabi", murid_id: "p_ubay", riwayat: "Umum", catatan: "" },
  { id: uid("s"), guru_id: "p_uthman", murid_id: "p_sulami", riwayat: "Umum", catatan: "" },
  { id: uid("s"), guru_id: "p_ali", murid_id: "p_sulami", riwayat: "Umum", catatan: "" },
  { id: uid("s"), guru_id: "p_zaid", murid_id: "p_sulami", riwayat: "Umum", catatan: "" },
  { id: uid("s"), guru_id: "p_ubay", murid_id: "p_sulami", riwayat: "Umum", catatan: "" },
  { id: uid("s"), guru_id: "p_sulami", murid_id: "p_asim", riwayat: "Hafs 'an 'Asim", catatan: "" },
  { id: uid("s"), guru_id: "p_asim", murid_id: "p_hafs", riwayat: "Hafs 'an 'Asim", catatan: "" },
  { id: uid("s"), guru_id: "p_sulami", murid_id: "p_nafi", riwayat: "Warsh 'an Nafi'", catatan: "" },
  { id: uid("s"), guru_id: "p_nafi", murid_id: "p_warsh", riwayat: "Warsh 'an Nafi'", catatan: "" },
  { id: uid("s"), guru_id: "p_hafs", murid_id: "p_syatibiyyah", riwayat: "Hafs 'an 'Asim", catatan: "" },
  { id: uid("s"), guru_id: "p_warsh", murid_id: "p_syatibiyyah", riwayat: "Warsh 'an Nafi'", catatan: "" },
  { id: uid("s"), guru_id: "p_hafs", murid_id: "p_tayyibah", riwayat: "Hafs 'an 'Asim", catatan: "" },
  { id: uid("s"), guru_id: "p_syatibiyyah", murid_id: "p_qari_mesir", riwayat: "Warsh 'an Nafi'", catatan: "" },
  { id: uid("s"), guru_id: "p_syatibiyyah", murid_id: "p_qari_syam", riwayat: "Hafs 'an 'Asim", catatan: "" },
  { id: uid("s"), guru_id: "p_tayyibah", murid_id: "p_qari_kuwait", riwayat: "Hafs 'an 'Asim", catatan: "" },
  { id: uid("s"), guru_id: "p_hafs", murid_id: "p_guru_selangor", riwayat: "Hafs 'an 'Asim", catatan: "" },
  { id: uid("s"), guru_id: "p_hafs", murid_id: "p_guru_kelantan", riwayat: "Hafs 'an 'Asim", catatan: "" },
  { id: uid("s"), guru_id: "p_warsh", murid_id: "p_guru_penang", riwayat: "Warsh 'an Nafi'", catatan: "" },
];

const STORAGE_KEY = "pokok-sanad-data-v1";

export default function PokokSanadApp() {
  const [perawi, setPerawi] = useState([]);
  const [sanad, setSanad] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saveState, setSaveState] = useState("idle"); // idle | saving | saved | error

  const [rootId, setRootId] = useState(null);
  const [rootHistory, setRootHistory] = useState([]);
  const [riwayatFilter, setRiwayatFilter] = useState("Semua");
  const [direction, setDirection] = useState("turun"); // "turun" = ke murid, "naik" = ke guru
  const [addingSelf, setAddingSelf] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [search, setSearch] = useState("");

  const [showAddPerawi, setShowAddPerawi] = useState(false);
  const [editingPerawi, setEditingPerawi] = useState(null);
  const [showAddSanad, setShowAddSanad] = useState(false);
  const [sanadPrefill, setSanadPrefill] = useState(null);
  const [showLegend, setShowLegend] = useState(false);
  const [showRanking, setShowRanking] = useState(false);
  const [rankingTabaqat, setRankingTabaqat] = useState("Semua");
  const [showDirectory, setShowDirectory] = useState(false);
  const [nodePositionOverrides, setNodePositionOverrides] = useState({});

  /* ---------- load (localStorage) ---------- */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        setPerawi(data.perawi || []);
        setSanad(data.sanad || []);
        setRootId(data.rootId || (data.perawi && data.perawi[0]?.id) || null);
        setNodePositionOverrides(data.nodePositionOverrides || {});
      } else {
        setPerawi(SEED_PERAWI);
        setSanad(SEED_SANAD);
        setRootId("p_nabi");
      }
    } catch {
      setPerawi(SEED_PERAWI);
      setSanad(SEED_SANAD);
      setRootId("p_nabi");
    } finally {
      setLoading(false);
    }
  }, []);

  /* ---------- save (debounced, localStorage) ---------- */
  useEffect(() => {
    if (loading) return;
    setSaveState("saving");
    const t = setTimeout(() => {
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ perawi, sanad, rootId, nodePositionOverrides })
        );
        setSaveState("saved");
      } catch {
        setSaveState("error");
      }
    }, 500);
    return () => clearTimeout(t);
  }, [perawi, sanad, rootId, nodePositionOverrides, loading]);

  const perawiMap = useMemo(
    () => Object.fromEntries(perawi.map((p) => [p.id, p])),
    [perawi]
  );

  const riwayatOptions = useMemo(() => {
    const s = new Set(sanad.map((e) => e.riwayat).filter(Boolean));
    return ["Semua", ...Array.from(s).sort()];
  }, [sanad]);

  /* Peringkat sanad = bilangan langkah terpendek dari Rasulullah ﷺ ke setiap
     perawi, dikira merentasi SEMUA riwayat (bukan ikut penapis semasa),
     supaya ia mencerminkan struktur data sebenar, bukan paparan semasa. */
  const distanceMap = useMemo(() => {
    const map = {};
    const childrenOf = {};
    sanad.forEach((e) => {
      if (!childrenOf[e.guru_id]) childrenOf[e.guru_id] = [];
      childrenOf[e.guru_id].push(e.murid_id);
    });
    const roots = perawi.filter((p) => p.tabaqat === "Rasulullah ﷺ").map((p) => p.id);
    const queue = [];
    roots.forEach((id) => {
      map[id] = 0;
      queue.push(id);
    });
    let qi = 0;
    while (qi < queue.length) {
      const cur = queue[qi++];
      (childrenOf[cur] || []).forEach((next) => {
        if (!(next in map)) {
          map[next] = map[cur] + 1;
          queue.push(next);
        }
      });
    }
    return map;
  }, [perawi, sanad]);

  /* Petunjuk warna kategori (cth. negara/kumpulan qiraat), seperti legend
     dalam poster asal — dijana automatik daripada data sebenar. */
  const categories = useMemo(() => {
    const map = new Map();
    perawi.forEach((p) => {
      if (p.kategori) {
        if (!map.has(p.kategori)) map.set(p.kategori, { color: categoryColor(p.kategori), count: 0 });
        map.get(p.kategori).count += 1;
      }
    });
    return Array.from(map.entries());
  }, [perawi]);

  /* Petunjuk warna anak panah ikut riwayat/jalur sanad */
  const riwayatLegend = useMemo(() => {
    const map = new Map();
    sanad.forEach((e) => {
      if (e.riwayat && e.riwayat !== "Umum") {
        if (!map.has(e.riwayat)) map.set(e.riwayat, categoryColor(e.riwayat));
      }
    });
    return Array.from(map.entries());
  }, [sanad]);

  /* Senarai kedudukan sanad — semua perawi yang bersambung ke Rasulullah ﷺ,
     disusun daripada peringkat terendah (sanad tertinggi/terdekat) ke tertinggi
     (sanad terpanjang), supaya mudah dibandingkan. */
  const rankingList = useMemo(() => {
    return perawi
      .filter((p) => p.id in distanceMap)
      .filter((p) => rankingTabaqat === "Semua" || p.tabaqat === rankingTabaqat)
      .map((p) => ({ ...p, peringkat: distanceMap[p.id] }))
      .sort((a, b) => a.peringkat - b.peringkat || a.nama_rumi.localeCompare(b.nama_rumi));
  }, [perawi, distanceMap, rankingTabaqat]);

  /* Direktori guru al-Quran Malaysia — dikumpul ikut negeri (medan kategori
     yang sepadan dengan salah satu daripada 14 negeri/wilayah persekutuan). */
  const directoryGroups = useMemo(() => {
    const map = {};
    perawi.forEach((p) => {
      if (p.kategori && NEGERI.includes(p.kategori)) {
        if (!map[p.kategori]) map[p.kategori] = [];
        map[p.kategori].push(p);
      }
    });
    return NEGERI.filter((n) => map[n] && map[n].length > 0).map((n) => ({
      negeri: n,
      list: map[n].sort((a, b) => a.nama_rumi.localeCompare(b.nama_rumi)),
    }));
  }, [perawi]);

  const viewSanadOf = (id) => {
    /* Auto-tapis ikut riwayat sanad guru ini (kalau semuanya satu riwayat
       yang sama), supaya jalur yang dipaparkan bersih & khusus — bukan
       bercampur dengan riwayat lain yang tak berkaitan. */
    const guruEdges = sanad.filter((e) => e.murid_id === id);
    const riwayatSet = new Set(guruEdges.map((e) => e.riwayat).filter((r) => r && r !== "Umum"));
    setRiwayatFilter(riwayatSet.size === 1 ? Array.from(riwayatSet)[0] : "Semua");
    setDirection("naik");
    setRootHistory([]);
    setRootId(id);
    setSelectedId(id);
    setShowDirectory(false);
  };

  const drillInto = (id) => {
    if (id === rootId) return;
    setRootHistory((h) => [...h, rootId]);
    setRootId(id);
  };
  const goBack = () => {
    setRootHistory((h) => {
      if (h.length === 0) return h;
      const next = [...h];
      const prev = next.pop();
      setRootId(prev);
      return next;
    });
  };
  const goHome = () => {
    const home = perawi.find((p) => p.tabaqat === "Rasulullah ﷺ") || perawi[0];
    if (home) {
      setRootHistory([]);
      setRootId(home.id);
    }
  };

  const deletePerawi = (id) => {
    if (!window.confirm("Padam perawi ini? Semua sanad yang berkaitan turut dipadam.")) return;
    setPerawi((p) => p.filter((x) => x.id !== id));
    setSanad((s) => s.filter((e) => e.guru_id !== id && e.murid_id !== id));
    if (selectedId === id) setSelectedId(null);
    if (rootId === id) goHome();
  };
  const deleteSanad = (id) => setSanad((s) => s.filter((e) => e.id !== id));

  const savePerawi = (form) => {
    if (form.id) {
      setPerawi((p) => p.map((x) => (x.id === form.id ? { ...form } : x)));
    } else {
      const id = uid("p");
      setPerawi((p) => [...p, { ...form, id }]);
      setSelectedId(id);
      if (addingSelf) {
        setDirection("naik");
        setRootHistory((h) => [...h, rootId]);
        setRootId(id);
        setSanadPrefill({ murid_id: id });
        setAddingSelf(false);
      }
    }
    setShowAddPerawi(false);
    setEditingPerawi(null);
  };

  const handleAddSelf = () => {
    setAddingSelf(true);
    setEditingPerawi({ tabaqat: "Ulama Kemudian" });
  };

  const saveSanad = (form) => {
    setSanad((s) => [...s, { ...form, id: uid("s") }]);
    setShowAddSanad(false);
    setSanadPrefill(null);
  };

  const searchResults = useMemo(() => {
    if (!search.trim()) return [];
    const q = search.trim().toLowerCase();
    return perawi
      .filter(
        (p) =>
          p.nama_rumi.toLowerCase().includes(q) ||
          p.nama_arab.includes(search.trim()) ||
          (p.gelaran || "").toLowerCase().includes(q)
      )
      .slice(0, 8);
  }, [search, perawi]);

  const selected = selectedId ? perawiMap[selectedId] : null;
  const incoming = selectedId ? sanad.filter((e) => e.murid_id === selectedId) : [];
  const outgoing = selectedId ? sanad.filter((e) => e.guru_id === selectedId) : [];

  if (loading) {
    return (
      <Shell>
        <div className="loading-screen">
          <Loader2 className="spin" size={28} />
          <span>Memuatkan pokok sanad…</span>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <header className="topbar">
        <div className="brand">
          <GitBranch size={20} />
          <div>
            <h1>Digitalisasi Sanad Guru al-Quran Malaysia</h1>
            <p>Rangkaian periwayatan qiraat al-Quran</p>
          </div>
        </div>
        <div className={`save-pill save-${saveState}`}>
          {saveState === "saving" ? "Menyimpan…" : saveState === "error" ? "Ralat simpan" : "Tersimpan"}
        </div>
      </header>

      <div className="quote-block">
        <p className="quote-ayat">
          «ثُمَّ أَوْرَثْنَا الْكِتَابَ الَّذِينَ اصْطَفَيْنَا مِنْ عِبَادِنَا» — سورة فاطر: ٣٢
        </p>
        <p className="quote-hadith">
          «الإسناد من الدين، ولولا الإسناد لقال من شاء ما شاء»
        </p>
      </div>

      <div className="disclaimer">
        Data contoh dalam aplikasi ini adalah untuk demonstrasi antara muka sahaja. Sila semak &amp; gantikan
        dengan sumber sanad yang muktabar (cth. <em>Ghayah al-Nihayah</em>, <em>al-Nashr fi al-Qiraat al-'Ashr</em>)
        sebelum digunakan secara rasmi.
      </div>

      <div className="toolbar">
        <div className="tool-group search-group">
          <Search size={15} />
          <input
            placeholder="Cari nama perawi…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {searchResults.length > 0 && (
            <div className="search-dropdown">
              {searchResults.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setSelectedId(p.id);
                    setSearch("");
                  }}
                >
                  <span className="sr-arab">{p.nama_arab}</span>
                  <span className="sr-rumi">{p.nama_rumi}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="tool-group">
          <label>Riwayat</label>
          <select value={riwayatFilter} onChange={(e) => setRiwayatFilter(e.target.value)}>
            {riwayatOptions.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        <div className="tool-group nav-group">
          <button disabled={rootHistory.length === 0} onClick={goBack} title="Kembali">
            <ArrowLeft size={15} />
          </button>
          <button onClick={goHome} title="Ke Rasulullah ﷺ">
            <Home size={15} />
          </button>
        </div>

        <div className="tool-group direction-group">
          <button
            className={direction === "turun" ? "dir-active" : ""}
            onClick={() => setDirection("turun")}
            title="Papar ke arah murid"
          >
            Murid ↓
          </button>
          <button
            className={direction === "naik" ? "dir-active" : ""}
            onClick={() => setDirection("naik")}
            title="Papar ke arah guru, sehingga Rasulullah ﷺ"
          >
            Guru ↑
          </button>
        </div>

        <div className="tool-group actions-group">
          <button
            className={`btn-secondary${showLegend ? " active" : ""}`}
            onClick={() => setShowLegend((v) => !v)}
            title="Papar/sembunyi petunjuk warna kategori"
          >
            <Palette size={15} /> Petunjuk
          </button>
          <button className="btn-secondary" onClick={() => setShowRanking(true)} title="Bandingkan kedudukan sanad semua perawi">
            <ListOrdered size={15} /> Kedudukan Sanad
          </button>
          <button className="btn-secondary" onClick={() => setShowDirectory(true)} title="Senarai guru al-Quran Malaysia ikut negeri">
            <MapPin size={15} /> Guru Malaysia
          </button>

          <a
            href="/sanadhafs.html"
            className="btn-secondary"
            style={{
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px"
            }}
          >
            Sanad Hafs
          </a>
          
          <button
            className="btn-secondary"
            onClick={() => setNodePositionOverrides({})}
            title="Kembalikan semua kad ke susunan automatik (buang seretan manual)"
          >
            <RotateCcw size={15} /> Reset Susunan
          </button>
          <button className="btn-secondary" onClick={() => window.print()} title="Jana PDF / cetak keseluruhan sanad">
            <Printer size={15} /> Jana PDF
          </button>
          <button className="btn-secondary" onClick={handleAddSelf} title="Tambah nama anda dan sambungkan ke guru anda">
            <User size={15} /> Diri Anda
          </button>
          <button className="btn-primary" onClick={() => setShowAddPerawi({})}>
            <Plus size={15} /> Perawi
          </button>
          <button className="btn-secondary" onClick={() => setShowAddSanad({})}>
            <Plus size={15} /> Sanad
          </button>
        </div>
      </div>

      {(showLegend || categories.length > 0 || riwayatLegend.length > 0) && (
        <div className={`legend-bar${showLegend ? "" : " legend-hidden"}`}>
          <span className="legend-label">Kategori:</span>
          {categories.length === 0 ? (
            <span className="muted">
              Belum ada kategori ditambah. Isi medan "Kategori" bila tambah/sunting perawi
              (cth. nama negeri, negara, atau kumpulan qiraat) untuk ia dipaparkan di sini dengan warna automatik.
            </span>
          ) : (
            categories.map(([name, info]) => (
              <span className="legend-chip" key={name}>
                <span className="legend-dot" style={{ background: info.color }} />
                {name} ({info.count})
              </span>
            ))
          )}
          {riwayatLegend.length > 0 && (
            <>
              <span className="legend-label legend-label-sep">Riwayat:</span>
              {riwayatLegend.map(([name, color]) => (
                <span className="legend-chip" key={name}>
                  <span className="legend-dot" style={{ background: color }} />
                  {name}
                </span>
              ))}
            </>
          )}
        </div>
      )}

      <div className="main-area">
        <SanadGraph
          rootId={rootId}
          perawiMap={perawiMap}
          sanad={sanad}
          riwayatFilter={riwayatFilter}
          direction={direction}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onDrill={drillInto}
          distanceMap={distanceMap}
          nodePositionOverrides={nodePositionOverrides}
          setNodePositionOverrides={setNodePositionOverrides}
        />

        {selected && (
          <aside className="detail-panel">
            <div className="detail-head">
              <h3>{selected.nama_arab}</h3>
              <button onClick={() => setSelectedId(null)}><X size={16} /></button>
            </div>
            <p className="detail-rumi">{selected.nama_rumi}{selected.gelaran ? ` · ${selected.gelaran}` : ""}</p>
            <div className="detail-badges">
              <span className="badge">{selected.tabaqat}</span>
              {selected.wafat && <span className="wafat">w. {selected.wafat}H</span>}
            </div>

            <div className="depth-box">
              {selected.id in distanceMap ? (
                <>
                  <span className="depth-number">{distanceMap[selected.id]}</span>
                  <span className="depth-label">
                    peringkat sanad daripada Rasulullah ﷺ
                    {distanceMap[selected.id] === 0 ? " (ini Rasulullah ﷺ)" : ""}
                  </span>
                </>
              ) : (
                <span className="depth-label depth-missing">
                  Belum bersambung ke Rasulullah ﷺ — masih ada jurang rekod guru.
                </span>
              )}
            </div>

            {selected.catatan && <p className="detail-note">{selected.catatan}</p>}

            <div className="detail-actions">
              <button onClick={() => drillInto(selected.id)}><GitBranch size={13} /> Jadikan Punca</button>
              <button onClick={() => setEditingPerawi(selected)}><Pencil size={13} /> Sunting</button>
              <button className="danger" onClick={() => deletePerawi(selected.id)}><Trash2 size={13} /> Padam</button>
            </div>

            <div className="detail-section">
              <div className="detail-section-head">
                <span>Guru ({incoming.length})</span>
                <button
                  className="mini-add"
                  onClick={() => setSanadPrefill({ murid_id: selected.id })}
                  title="Tambah guru"
                >
                  <Plus size={12} />
                </button>
              </div>
              {incoming.length === 0 && <p className="muted">Tiada rekod guru.</p>}
              {incoming.map((e) => (
                <div className="link-row" key={e.id}>
                  <span>{perawiMap[e.guru_id]?.nama_rumi || "?"}</span>
                  <span className="riwayat-tag">{e.riwayat}</span>
                  <button onClick={() => deleteSanad(e.id)}><X size={12} /></button>
                </div>
              ))}
            </div>

            <div className="detail-section">
              <div className="detail-section-head">
                <span>Murid ({outgoing.length})</span>
                <button
                  className="mini-add"
                  onClick={() => setSanadPrefill({ guru_id: selected.id })}
                  title="Tambah murid"
                >
                  <Plus size={12} />
                </button>
              </div>
              {outgoing.length === 0 && <p className="muted">Tiada rekod murid.</p>}
              {outgoing.map((e) => (
                <div className="link-row" key={e.id}>
                  <span>{perawiMap[e.murid_id]?.nama_rumi || "?"}</span>
                  <span className="riwayat-tag">{e.riwayat}</span>
                  <button onClick={() => deleteSanad(e.id)}><X size={12} /></button>
                </div>
              ))}
            </div>
          </aside>
        )}
      </div>

      {(showAddPerawi || editingPerawi) && (
        <PerawiModal
          initial={editingPerawi}
          onClose={() => { setShowAddPerawi(false); setEditingPerawi(null); }}
          onSave={savePerawi}
        />
      )}

      {(showAddSanad || sanadPrefill) && (
        <SanadModal
          perawi={perawi}
          prefill={sanadPrefill}
          onClose={() => { setShowAddSanad(false); setSanadPrefill(null); }}
          onSave={saveSanad}
        />
      )}

      {showRanking && (
        <RankingModal
          rankingList={rankingList}
          rankingTabaqat={rankingTabaqat}
          setRankingTabaqat={setRankingTabaqat}
          onClose={() => setShowRanking(false)}
          onSelect={(id) => { setSelectedId(id); setShowRanking(false); }}
        />
      )}

      {showDirectory && (
        <DirectoryModal
          groups={directoryGroups}
          onClose={() => setShowDirectory(false)}
          onSelect={viewSanadOf}
        />
      )}

      <footer className="app-footer">
        <span>Disediakan oleh: <em>— isi nama/institusi anda —</em></span>
        <span>Sumber: <em>— isi rujukan sumber anda —</em></span>
        <span>Hak cipta terpelihara</span>
      </footer>

      <style>{CSS}</style>
    </Shell>
  );
}

/* ---------------------------------------------------------
   SANAD GRAPH — susunan berperingkat (generasi demi generasi)
   dengan panah SVG sebenar. Setiap perawi dipaparkan SEKALI
   sahaja walaupun ada banyak guru/murid berhubung dengannya;
   semua sambungan dilukis sebagai anak panah berasingan ke/dari
   nod yang sama (bukan kad diulang seperti sebelum ini).
--------------------------------------------------------- */
function SanadGraph({ rootId, perawiMap, sanad, riwayatFilter, direction, selectedId, onSelect, onDrill, distanceMap, nodePositionOverrides, setNodePositionOverrides }) {
  const canvasRef = useRef(null);
  const nodeRefs = useRef({});
  const [positions, setPositions] = useState({});
  const dragStateRef = useRef(null);
  const dragMovedRef = useRef(false);

  const handlePointerDown = (e, id) => {
    e.stopPropagation();
    const existing = nodePositionOverrides[id] || { dx: 0, dy: 0 };
    dragStateRef.current = { id, startX: e.clientX, startY: e.clientY, startDx: existing.dx, startDy: existing.dy };
    dragMovedRef.current = false;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    const ds = dragStateRef.current;
    if (!ds) return;
    const dx = e.clientX - ds.startX;
    const dy = e.clientY - ds.startY;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) dragMovedRef.current = true;
    if (!dragMovedRef.current) return;
    setNodePositionOverrides((prev) => ({ ...prev, [ds.id]: { dx: ds.startDx + dx, dy: ds.startDy + dy } }));
  };

  const handlePointerUp = () => {
    dragStateRef.current = null;
  };

  const handleNodeClick = (id) => {
    if (dragMovedRef.current) {
      dragMovedRef.current = false;
      return;
    }
    onSelect(id);
  };

  const adjacency = useMemo(() => {
    const fwd = {};
    const bwd = {};
    sanad.forEach((e) => {
      if (riwayatFilter !== "Semua" && e.riwayat !== riwayatFilter) return;
      if (!perawiMap[e.guru_id] || !perawiMap[e.murid_id]) return;
      if (!fwd[e.guru_id]) fwd[e.guru_id] = [];
      fwd[e.guru_id].push(e);
      if (!bwd[e.murid_id]) bwd[e.murid_id] = [];
      bwd[e.murid_id].push(e);
    });
    return { fwd, bwd };
  }, [sanad, perawiMap, riwayatFilter]);

  const { levelOf, order } = useMemo(() => {
    const levelOf = {};
    const order = [];
    if (!rootId || !perawiMap[rootId]) return { levelOf, order };
    levelOf[rootId] = 0;
    order[0] = [rootId];
    const adj = direction === "turun" ? adjacency.fwd : adjacency.bwd;
    const nextKey = direction === "turun" ? "murid_id" : "guru_id";
    const queue = [rootId];
    let qi = 0;
    while (qi < queue.length) {
      const cur = queue[qi++];
      (adj[cur] || []).forEach((e) => {
        const nid = e[nextKey];
        if (!(nid in levelOf)) {
          levelOf[nid] = levelOf[cur] + 1;
          if (!order[levelOf[nid]]) order[levelOf[nid]] = [];
          order[levelOf[nid]].push(nid);
          queue.push(nid);
        }
      });
    }
    return { levelOf, order };
  }, [rootId, perawiMap, adjacency, direction]);

  const edgesToDraw = useMemo(
    () =>
      sanad.filter(
        (e) =>
          (riwayatFilter === "Semua" || e.riwayat === riwayatFilter) &&
          e.guru_id in levelOf &&
          e.murid_id in levelOf
      ),
    [sanad, riwayatFilter, levelOf]
  );

  useLayoutEffect(() => {
    const measure = () => {
      const canvasEl = canvasRef.current;
      if (!canvasEl) return;
      const canvasRect = canvasEl.getBoundingClientRect();
      const pos = {};
      Object.entries(nodeRefs.current).forEach(([id, el]) => {
        if (!el) return;
        const r = el.getBoundingClientRect();
        pos[id] = { x: r.left - canvasRect.left, y: r.top - canvasRect.top, w: r.width, h: r.height };
      });
      setPositions(pos);
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (canvasRef.current) ro.observe(canvasRef.current);
    window.addEventListener("resize", measure);
    const t = setTimeout(measure, 150);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
      clearTimeout(t);
    };
  }, [order, edgesToDraw.length, nodePositionOverrides]);

  const edgePaths = useMemo(() => {
    return edgesToDraw
      .map((e) => {
        const g = positions[e.guru_id];
        const m = positions[e.murid_id];
        if (!g || !m) return null;
        const gx = g.x + g.w / 2;
        const mx = m.x + m.w / 2;
        let y1, y2;
        if (g.y <= m.y) {
          y1 = g.y + g.h;
          y2 = m.y;
        } else {
          y1 = g.y;
          y2 = m.y + m.h;
        }
        const midY = (y1 + y2) / 2;
        return {
          id: e.id,
          d: `M ${gx} ${y1} C ${gx} ${midY}, ${mx} ${midY}, ${mx} ${y2}`,
          labelX: (gx + mx) / 2,
          labelY: midY,
          riwayat: e.riwayat,
        };
      })
      .filter(Boolean);
  }, [edgesToDraw, positions]);

  if (!rootId || !perawiMap[rootId]) {
    return <div className="empty-state">Tiada perawi lagi. Tambah perawi pertama untuk mula.</div>;
  }

  return (
    <div className="graph-scroll">
      <div className="graph-content" ref={canvasRef}>
        <svg className="graph-svg">
          <defs>
            {Array.from(new Set(edgePaths.map((p) => p.riwayat || "Umum"))).map((r) => (
              <marker
                key={r}
                id={`sanad-arrow-${slugId(r)}`}
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M0,0 L10,5 L0,10 z" style={{ fill: riwayatColor(r) }} />
              </marker>
            ))}
          </defs>
          {edgePaths.map((p) => (
            <path
              key={p.id}
              d={p.d}
              className="graph-edge"
              style={{ stroke: riwayatColor(p.riwayat) }}
              markerEnd={`url(#sanad-arrow-${slugId(p.riwayat || "Umum")})`}
            />
          ))}
        </svg>

        {edgePaths.map(
          (p) =>
            p.riwayat &&
            p.riwayat !== "Umum" && (
              <div key={`lbl-${p.id}`} className="edge-chip graph-edge-label" style={{ left: p.labelX, top: p.labelY }}>
                {p.riwayat}
              </div>
            )
        )}

        {order.map((ids, lvl) => (
          <div className="graph-level" key={lvl}>
            {ids.map((id) => {
              const p = perawiMap[id];
              if (!p) return null;
              const isSelected = selectedId === id;
              const isProphet = p.tabaqat === "Rasulullah ﷺ";
              const catColor = categoryColor(p.kategori);
              const hasNext = (direction === "turun" ? adjacency.fwd[id] : adjacency.bwd[id]) || [];
              const isChainEnd = direction === "naik" && hasNext.length === 0;
              const override = nodePositionOverrides[id];
              const cardStyle = {
                ...(catColor ? { borderLeftColor: catColor, borderLeftWidth: "5px" } : {}),
                ...(override ? { transform: `translate(${override.dx}px, ${override.dy}px)`, zIndex: 5 } : {}),
              };
              return (
                <div className="graph-node-slot" key={id} ref={(el) => (nodeRefs.current[id] = el)}>
                  <div
                    className={`node-card${isSelected ? " selected" : ""}${isProphet ? " node-prophet" : ""}${override ? " node-dragged" : ""}`}
                    style={cardStyle}
                    onPointerDown={(e) => handlePointerDown(e, id)}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onClick={() => handleNodeClick(id)}
                    onDoubleClick={() => onDrill(id)}
                  >
                    <div className="node-arab">{p.nama_arab}</div>
                    <div className="node-rumi">{p.nama_rumi}</div>
                    <div className="node-meta">
                      <span className="badge">{p.tabaqat}</span>
                      {p.wafat && <span className="wafat">w. {p.wafat}H</span>}
                      {id in distanceMap && (
                        <span className="peringkat-chip" title="Peringkat sanad daripada Rasulullah ﷺ">
                          #{distanceMap[id]}
                        </span>
                      )}
                    </div>
                    {p.kategori && <div className="kategori-chip" style={{ background: catColor }}>{p.kategori}</div>}
                  </div>
                  {isChainEnd && (
                    <div className={`chain-end${isProphet ? " chain-end-success" : ""}`}>
                      {isProphet ? "✓ Sampai kepada Rasulullah ﷺ" : "— tiada rekod guru selanjutnya —"}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   GURU AL-QURAN MALAYSIA — direktori ikut 14 negeri. Klik nama
   terus papar jalur sanad guru itu (arah "Guru ↑") sehingga
   Nabi Muhammad ﷺ.
--------------------------------------------------------- */
function DirectoryModal({ groups, onClose, onSelect }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal-wide" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>Guru Al-Quran Malaysia</h3>
          <button onClick={onClose}><X size={16} /></button>
        </div>
        <p className="ranking-note">
          Disusun ikut negeri (isi medan "Kategori" dengan nama negeri bila tambah perawi bertabaqat
          "Ulama Semasa"). Klik nama untuk terus papar jalur sanad guru tersebut sehingga Nabi Muhammad ﷺ.
        </p>
        <div className="directory-list">
          {groups.length === 0 ? (
            <p className="muted">
              Belum ada guru direkodkan ikut negeri lagi. Tambah perawi baharu, tetapkan Tabaqat kepada
              "Ulama Semasa" dan Kategori kepada nama negeri (cth. "Selangor", "Kelantan").
            </p>
          ) : (
            groups.map((g) => (
              <div className="directory-group" key={g.negeri}>
                <div className="directory-state">
                  {g.negeri} <span className="directory-count">({g.list.length})</span>
                </div>
                {g.list.map((p) => (
                  <button className="directory-row" key={p.id} onClick={() => onSelect(p.id)}>
                    <span className="ranking-arab">{p.nama_arab}</span>
                    <span className="ranking-rumi">{p.nama_rumi}{p.gelaran ? ` · ${p.gelaran}` : ""}</span>
                  </button>
                ))}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   KEDUDUKAN SANAD — senarai perbandingan peringkat sanad
   (nombor lebih kecil = sanad lebih tinggi/hampir Rasulullah ﷺ)
--------------------------------------------------------- */
function RankingModal({ rankingList, rankingTabaqat, setRankingTabaqat, onClose, onSelect }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal-wide" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>Kedudukan Sanad</h3>
          <button onClick={onClose}><X size={16} /></button>
        </div>
        <p className="ranking-note">
          Nombor lebih kecil = peringkat lebih tinggi (lebih hampir kepada Rasulullah ﷺ, dianggap "sanad tinggi").
          Nombor lebih besar = "sanad rendah" (lebih banyak peringkat perantaraan).
        </p>
        <label>Tapis ikut tabaqat
          <select value={rankingTabaqat} onChange={(e) => setRankingTabaqat(e.target.value)}>
            <option value="Semua">Semua</option>
            {TABAQAT.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </label>
        <div className="ranking-list">
          {rankingList.length === 0 ? (
            <p className="muted">Tiada perawi sepadan (atau belum bersambung ke Rasulullah ﷺ).</p>
          ) : (
            rankingList.map((p, i) => (
              <button className="ranking-row" key={p.id} onClick={() => onSelect(p.id)}>
                <span className="ranking-index">{i + 1}</span>
                <span className="ranking-name">
                  <span className="ranking-arab">{p.nama_arab}</span>
                  <span className="ranking-rumi">{p.nama_rumi}{p.kategori ? ` · ${p.kategori}` : ""}</span>
                </span>
                <span className="ranking-peringkat">#{p.peringkat}</span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   MODALS
--------------------------------------------------------- */
function PerawiModal({ initial, onClose, onSave }) {
  const [form, setForm] = useState({
    nama_arab: "",
    nama_rumi: "",
    gelaran: "",
    tabaqat: TABAQAT[2],
    wafat: "",
    kategori: "",
    catatan: "",
    ...(initial || {}),
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const valid = form.nama_rumi.trim().length > 0;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>{form.id ? "Sunting Perawi" : "Tambah Perawi"}</h3>
          <button onClick={onClose}><X size={16} /></button>
        </div>
        <label>Nama (Arab)
          <input value={form.nama_arab} onChange={(e) => set("nama_arab", e.target.value)} dir="rtl" placeholder="مثال" />
        </label>
        <label>Nama (Rumi) *
          <input value={form.nama_rumi} onChange={(e) => set("nama_rumi", e.target.value)} placeholder="Contoh: Hafs bin Sulaiman" />
        </label>
        <label>Gelaran
          <input value={form.gelaran} onChange={(e) => set("gelaran", e.target.value)} placeholder="Contoh: Imam Kufah" />
        </label>
        <label>Kategori (negeri Malaysia / negara / kumpulan qiraat)
          <input
            value={form.kategori}
            onChange={(e) => set("kategori", e.target.value)}
            placeholder="Contoh: Selangor, Kelantan, atau Mesir, Syam"
            list="negeri-suggest"
          />
          <datalist id="negeri-suggest">
            {NEGERI.map((n) => <option key={n} value={n} />)}
          </datalist>
        </label>
        <div className="modal-row">
          <label>Tabaqat
            <select value={form.tabaqat} onChange={(e) => set("tabaqat", e.target.value)}>
              {TABAQAT.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </label>
          <label>Tahun wafat (H)
            <input value={form.wafat} onChange={(e) => set("wafat", e.target.value)} placeholder="180" />
          </label>
        </div>
        <label>Catatan
          <textarea rows={2} value={form.catatan} onChange={(e) => set("catatan", e.target.value)} />
        </label>
        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose}>Batal</button>
          <button className="btn-primary" disabled={!valid} onClick={() => onSave(form)}>
            <Check size={14} /> Simpan
          </button>
        </div>
      </div>
    </div>
  );
}

function SanadModal({ perawi, prefill, onClose, onSave }) {
  const [form, setForm] = useState({
    guru_id: prefill?.guru_id || "",
    murid_id: prefill?.murid_id || "",
    riwayat: "",
    catatan: "",
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const valid = form.guru_id && form.murid_id && form.guru_id !== form.murid_id;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>Tambah Sanad</h3>
          <button onClick={onClose}><X size={16} /></button>
        </div>
        <label>Guru
          <select value={form.guru_id} onChange={(e) => set("guru_id", e.target.value)}>
            <option value="">— pilih guru —</option>
            {perawi.map((p) => <option key={p.id} value={p.id}>{p.nama_rumi}</option>)}
          </select>
        </label>
        <label>Murid
          <select value={form.murid_id} onChange={(e) => set("murid_id", e.target.value)}>
            <option value="">— pilih murid —</option>
            {perawi.map((p) => <option key={p.id} value={p.id}>{p.nama_rumi}</option>)}
          </select>
        </label>
        <label>Riwayat / Qiraat
          <input
            value={form.riwayat}
            onChange={(e) => set("riwayat", e.target.value)}
            placeholder="Contoh: Hafs 'an 'Asim"
            list="riwayat-list"
          />
        </label>
        <label>Catatan
          <textarea rows={2} value={form.catatan} onChange={(e) => set("catatan", e.target.value)} />
        </label>
        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose}>Batal</button>
          <button className="btn-primary" disabled={!valid} onClick={() => onSave(form)}>
            <Check size={14} /> Simpan
          </button>
        </div>
      </div>
    </div>
  );
}

function Shell({ children }) {
  return <div className="pokok-sanad-shell">{children}</div>;
}

/* ---------------------------------------------------------
   STYLE — manuscript / illumination inspired
--------------------------------------------------------- */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Work+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');

.pokok-sanad-shell {
  --parchment: #EFE6CC;
  --parchment-deep: #E4D8B4;
  --ink: #2A2119;
  --ink-soft: #5B4E3D;
  --teal: #1F4B43;
  --teal-light: #2C6358;
  --gold: #A87A2E;
  --gold-light: #D4AF6A;
  --maroon: #7A2E2E;
  --line: #B9A66E;
  font-family: 'Work Sans', sans-serif;
  color: var(--ink);
  background: var(--parchment);
  background-image:
    radial-gradient(circle at 0% 0%, rgba(31,75,67,0.05), transparent 40%),
    radial-gradient(circle at 100% 0%, rgba(122,46,46,0.05), transparent 40%);
  min-height: 100%;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.pokok-sanad-shell * { box-sizing: border-box; }

.loading-screen { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:10px; padding: 80px 20px; color: var(--ink-soft); }
.spin { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.topbar { display:flex; align-items:center; justify-content:space-between; padding: 18px 22px 10px; border-bottom: 1px solid var(--line); }
.brand { display:flex; align-items:center; gap:12px; color: var(--teal); }
.brand h1 { font-family:'Amiri', serif; font-size: 22px; margin:0; color: var(--ink); font-weight:700; }
.brand p { margin:2px 0 0; font-size:12px; color: var(--ink-soft); }
.save-pill { font-size: 11px; padding: 4px 10px; border-radius: 20px; background: rgba(31,75,67,0.1); color: var(--teal); font-family:'IBM Plex Mono', monospace; height:fit-content; }
.save-error { background: rgba(122,46,46,0.12); color: var(--maroon); }

.disclaimer { margin: 10px 22px 0; padding: 8px 12px; border: 1px dashed var(--gold); background: rgba(212,175,106,0.15); border-radius: 8px; font-size: 11.5px; color: var(--ink-soft); }
.disclaimer em { color: var(--maroon); font-style: normal; font-weight: 600; }

.toolbar { display:flex; flex-wrap:wrap; align-items:center; gap: 10px; padding: 12px 22px; }
.tool-group { display:flex; align-items:center; gap:6px; background: var(--parchment-deep); border: 1px solid var(--line); border-radius: 8px; padding: 6px 10px; position:relative; }
.tool-group label { font-size: 11px; color: var(--ink-soft); }
.tool-group select, .tool-group input { border:none; background:transparent; font-family:'Work Sans',sans-serif; font-size:13px; color:var(--ink); outline:none; }
.search-group { flex:1; min-width: 180px; }
.search-group input { flex:1; }
.nav-group button { border:none; background:transparent; color: var(--teal); cursor:pointer; padding:2px 4px; display:flex; }
.nav-group button:disabled { color: #b9b09a; cursor: not-allowed; }
.actions-group { margin-left:auto; gap:8px; background:none; border:none; padding:0; }
.btn-secondary.active { background: var(--teal); color:#fff; }
.legend-bar { display:flex; flex-wrap:wrap; align-items:center; gap:8px; padding: 0 22px 12px; }
.legend-label { font-size:10.5px; font-weight:700; color: var(--ink-soft); text-transform:uppercase; letter-spacing:0.4px; }
.legend-label-sep { margin-left:10px; }
.legend-chip { display:flex; align-items:center; gap:6px; font-size:11px; background:#fff; border:1px solid var(--line); padding:4px 10px; border-radius:20px; }
.legend-dot { width:9px; height:9px; border-radius:50%; display:inline-block; flex-shrink:0; }
.quote-block { margin: 4px 22px 0; background: var(--teal); color:#fff; border-radius:8px; padding:10px 16px; text-align:center; }
.quote-ayat { font-family:'Amiri',serif; font-size:15px; margin:0; }
.quote-hadith { font-family:'Amiri',serif; font-size:12.5px; margin:4px 0 0; color: var(--gold-light); }
.app-footer { display:flex; flex-wrap:wrap; gap:16px; justify-content:center; padding:12px 22px; border-top:1px solid var(--line); font-size:10.5px; color: var(--ink-soft); }
.app-footer em { color: var(--teal); font-style:normal; }
.direction-group { gap:0; padding:3px; }
.direction-group button { border:none; background:transparent; color: var(--ink-soft); font-size:12px; font-weight:600; padding:5px 10px; border-radius:6px; cursor:pointer; }
.direction-group button.dir-active { background: var(--teal); color:#fff; }

.btn-primary, .btn-secondary { display:flex; align-items:center; gap:6px; border:none; border-radius:8px; padding:8px 12px; font-size:13px; font-weight:600; cursor:pointer; font-family:'Work Sans',sans-serif; }
.btn-primary { background: var(--teal); color: #fff; }
.btn-primary:disabled { background:#9fb3ae; cursor:not-allowed; }
.btn-secondary { background: transparent; color: var(--teal); border: 1px solid var(--teal); }

.search-dropdown { position:absolute; top: 100%; left:0; right:0; margin-top:4px; background:#fff; border:1px solid var(--line); border-radius:8px; box-shadow: 0 8px 20px rgba(0,0,0,0.12); z-index:20; overflow:hidden; }
.search-dropdown button { display:flex; flex-direction:column; align-items:flex-start; width:100%; padding:8px 12px; border:none; background:none; cursor:pointer; text-align:left; }
.search-dropdown button:hover { background: var(--parchment); }
.sr-arab { font-family:'Amiri',serif; font-size:14px; }
.sr-rumi { font-size:11px; color: var(--ink-soft); }

.main-area { flex:1; display:flex; overflow:auto; }
.empty-state { color: var(--ink-soft); padding: 60px; flex:1; }

.graph-scroll { flex:1; overflow:auto; }
.graph-content { position:relative; min-width:100%; width:max-content; padding: 50px 60px 70px; }
.graph-svg { position:absolute; inset:0; width:100%; height:100%; overflow:visible; pointer-events:none; }
.graph-edge { fill:none; stroke: var(--line); stroke-width:1.6; }
.arrow-head { fill: var(--line); }
.graph-level { display:flex; justify-content:center; gap:36px; margin-bottom:60px; position:relative; z-index:1; }
.graph-node-slot { display:flex; flex-direction:column; align-items:center; position:relative; }
.graph-node-slot .node-card { cursor: grab; touch-action: none; }
.graph-node-slot .node-card:active { cursor: grabbing; }
.node-card.node-dragged { box-shadow: 0 6px 16px rgba(42,33,25,0.25); }
.graph-edge-label { position:absolute; transform:translate(-50%,-50%); z-index:2; pointer-events:none; }

.tree-node-wrap { display:flex; flex-direction:column; align-items:center; }
.node-card { position:relative; background: #fff; border: 1.5px solid var(--teal); border-radius: 10px; padding: 10px 16px 8px; min-width: 150px; max-width: 190px; text-align:center; cursor:pointer; box-shadow: 0 2px 0 var(--gold-light); }
.node-card::before { content:''; position:absolute; inset: 3px; border: 1px solid var(--gold-light); border-radius: 7px; pointer-events:none; }
.node-card.selected { border-color: var(--maroon); box-shadow: 0 0 0 3px rgba(122,46,46,0.15); }
.node-card.node-prophet { border-color: var(--gold); box-shadow: 0 0 0 3px rgba(212,175,106,0.25); }
.kategori-chip { margin-top:5px; font-size:8.5px; color:#fff; padding:2px 7px; border-radius:20px; display:inline-block; font-weight:600; letter-spacing:0.2px; }
.connector-arrow { position:absolute; top:14px; left:50%; transform:translateX(-50%); width:0; height:0; border-left:4px solid transparent; border-right:4px solid transparent; z-index:1; }
.connector-arrow.arrow-down { border-top:6px solid var(--line); }
.connector-arrow.arrow-up { border-bottom:6px solid var(--line); top:2px; }
.node-card.node-ref { border-style: dashed; background: var(--parchment-deep); opacity: 0.85; box-shadow: none; padding-bottom: 8px; }
.node-card.node-ref::before { border-style: dashed; }
.ref-caption { font-size: 9px; color: var(--teal); font-style: italic; margin-top: 3px; }
.chain-end { margin-top:8px; font-size:10.5px; color: var(--ink-soft); background: rgba(0,0,0,0.04); padding:4px 10px; border-radius:20px; }
.chain-end-success { color: var(--teal); background: rgba(31,75,67,0.12); font-weight:600; }
.collapse-btn { position:absolute; bottom:-11px; left:50%; transform:translateX(-50%); background:var(--teal); color:#fff; border:none; border-radius:50%; width:20px; height:20px; display:flex; align-items:center; justify-content:center; cursor:pointer; }
.node-arab { font-family:'Amiri', serif; font-size: 16px; line-height:1.4; }
.node-rumi { font-size: 11px; color: var(--ink-soft); margin-top:2px; }
.node-meta { margin-top:5px; display:flex; gap:6px; justify-content:center; flex-wrap:wrap; }
.badge { font-size: 9.5px; background: rgba(31,75,67,0.12); color: var(--teal); padding:2px 6px; border-radius: 20px; }
.wafat { font-size: 9.5px; font-family:'IBM Plex Mono',monospace; color: var(--ink-soft); }
.peringkat-chip { font-size: 9px; font-family:'IBM Plex Mono',monospace; background: var(--gold); color:#fff; padding:2px 6px; border-radius: 20px; font-weight:600; }

.connector-stub { width:1px; height:22px; background: var(--line); }
.children-row { display:flex; }
.child-branch { flex:1; position:relative; padding-top: 22px; display:flex; flex-direction:column; align-items:center; margin: 0 14px; }
.child-branch::before { content:''; position:absolute; top:0; left:0; right:0; height:1px; background: var(--line); }
.child-branch:first-child::before { left:50%; }
.child-branch:last-child::before { right:50%; }
.child-branch:only-child::before { display:none; }
.child-branch::after { content:''; position:absolute; top:0; left:50%; width:1px; height:22px; background: var(--line); }
.edge-chip { font-size: 9.5px; background: var(--maroon); color:#fff; padding:2px 8px; border-radius: 20px; margin-bottom:6px; white-space:nowrap; }

.detail-panel { width: 270px; border-left: 1px solid var(--line); padding: 18px; background: var(--parchment-deep); overflow-y:auto; }
.detail-head { display:flex; justify-content:space-between; align-items:flex-start; }
.detail-head h3 { font-family:'Amiri',serif; font-size:18px; margin:0; }
.detail-head button { border:none; background:none; cursor:pointer; color: var(--ink-soft); }
.detail-rumi { font-size:12px; color: var(--ink-soft); margin:4px 0 8px; }
.detail-badges { display:flex; gap:6px; margin-bottom:10px; }
.depth-box { display:flex; align-items:center; gap:10px; background:#fff; border:1px solid var(--gold); border-radius:8px; padding:8px 10px; margin-bottom:10px; }
.depth-number { font-family:'IBM Plex Mono',monospace; font-size:22px; font-weight:700; color: var(--gold); line-height:1; }
.depth-label { font-size:11px; color: var(--ink-soft); line-height:1.3; }
.depth-missing { color: var(--maroon); }
.detail-note { font-size:12px; background:#fff; padding:8px; border-radius:6px; border:1px solid var(--line); }
.detail-actions { display:flex; flex-direction:column; gap:6px; margin: 12px 0; }
.detail-actions button { display:flex; align-items:center; gap:6px; border:1px solid var(--teal); color:var(--teal); background:#fff; border-radius:6px; padding:7px 10px; font-size:12px; cursor:pointer; }
.detail-actions button.danger { border-color: var(--maroon); color: var(--maroon); }
.detail-section { margin-top: 14px; border-top:1px dashed var(--line); padding-top:10px; }
.detail-section-head { display:flex; justify-content:space-between; align-items:center; font-size:12px; font-weight:600; color: var(--teal); margin-bottom:6px; }
.mini-add { border:none; background:var(--teal); color:#fff; border-radius:50%; width:18px; height:18px; display:flex; align-items:center; justify-content:center; cursor:pointer; }
.muted { font-size:11px; color: var(--ink-soft); }
.link-row { display:flex; align-items:center; gap:6px; font-size:11.5px; background:#fff; border-radius:6px; padding:5px 8px; margin-bottom:5px; }
.link-row span:first-child { flex:1; }
.riwayat-tag { font-size:9.5px; color: var(--maroon); }
.link-row button { border:none; background:none; cursor:pointer; color: var(--ink-soft); }

.modal-backdrop { position:fixed; inset:0; background: rgba(42,33,25,0.45); display:flex; align-items:center; justify-content:center; z-index:50; }
.modal { background:#fff; border-radius:12px; padding:20px; width: 340px; max-height: 85vh; overflow-y:auto; display:flex; flex-direction:column; gap:10px; }
.modal-head { display:flex; justify-content:space-between; align-items:center; }
.modal-head h3 { font-family:'Amiri',serif; margin:0; font-size:17px; }
.modal-head button { border:none; background:none; cursor:pointer; }
.modal label { display:flex; flex-direction:column; gap:4px; font-size:12px; color: var(--ink-soft); }
.modal input, .modal select, .modal textarea { font-family:'Work Sans',sans-serif; font-size:13px; border:1px solid var(--line); border-radius:6px; padding:7px 9px; color: var(--ink); background: var(--parchment); }
.modal-row { display:flex; gap:10px; }
.modal-row label { flex:1; }
.modal-actions { display:flex; justify-content:flex-end; gap:8px; margin-top:6px; }

.modal-wide { width: 460px; }
.directory-list { max-height: 420px; overflow-y:auto; display:flex; flex-direction:column; gap:14px; margin-top:4px; }
.directory-state { font-family:'Amiri',serif; font-size:14px; color: var(--teal); font-weight:700; border-bottom:1px solid var(--line); padding-bottom:4px; margin-bottom:6px; }
.directory-count { font-family:'IBM Plex Mono',monospace; font-size:10px; color: var(--ink-soft); font-weight:400; }
.directory-row { display:flex; flex-direction:column; align-items:flex-start; width:100%; text-align:left; border:1px solid var(--line); background:#fff; border-radius:6px; padding:6px 10px; margin-bottom:5px; cursor:pointer; font-family:'Work Sans',sans-serif; }
.directory-row:hover { border-color: var(--teal); }
.ranking-note { font-size:11px; color: var(--ink-soft); background: rgba(184,134,46,0.12); border:1px solid var(--gold-light); border-radius:6px; padding:8px 10px; margin:0; }
.ranking-list { display:flex; flex-direction:column; gap:6px; max-height: 360px; overflow-y:auto; margin-top:4px; }
.ranking-row { display:flex; align-items:center; gap:10px; border:1px solid var(--line); background:#fff; border-radius:8px; padding:8px 10px; cursor:pointer; text-align:left; font-family:'Work Sans',sans-serif; }
.ranking-row:hover { border-color: var(--teal); }
.ranking-index { font-family:'IBM Plex Mono',monospace; font-size:11px; color: var(--ink-soft); width:20px; flex-shrink:0; }
.ranking-name { flex:1; display:flex; flex-direction:column; min-width:0; }
.ranking-arab { font-family:'Amiri',serif; font-size:13.5px; }
.ranking-rumi { font-size:10.5px; color: var(--ink-soft); }
.ranking-peringkat { font-family:'IBM Plex Mono',monospace; font-size:12px; font-weight:700; background: var(--gold); color:#fff; padding:2px 8px; border-radius:20px; flex-shrink:0; }

.legend-hidden { display:none; }

@media print {
  @page { size: A3 landscape; margin: 10mm; }
  body { background:#fff; }
  .pokok-sanad-shell { overflow: visible !important; border-radius:0 !important; min-height:auto !important; }
  .toolbar, .save-pill, .disclaimer, .detail-panel, .modal-backdrop { display:none !important; }
  .legend-bar { display:flex !important; }
  .main-area { display:block !important; height:auto !important; overflow:visible !important; }
  .graph-scroll { overflow:visible !important; height:auto !important; flex:none !important; }
  .graph-content { width:auto !important; min-width:0 !important; }
  .node-card, .quote-block, .kategori-chip, .peringkat-chip, .badge { -webkit-print-color-adjust:exact; print-color-adjust:exact; }
}
`;
