import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Plus, Trash2, X, ChevronDown, ChevronRight, GitBranch,
  Home, Search, Loader2, Pencil, ArrowLeft, Check, User
} from "lucide-react";

/* ---------------------------------------------------------
   DATA JENIS
   perawi : { id, nama_arab, nama_rumi, gelaran, tabaqat, wafat, catatan }
   sanad  : { id, guru_id, murid_id, riwayat, catatan }
--------------------------------------------------------- */

const TABAQAT = [
  "Rasulullah ﷺ",
  "Sahabat",
  "Tabi'in",
  "Tabi' Tabi'in",
  "Imam Qiraat",
  "Ulama Kemudian",
];

const uid = (p) => `${p}_${Math.random().toString(36).slice(2, 9)}`;

const SEED_PERAWI = [
  { id: "p_nabi", nama_arab: "مُحَمَّد رَسُوْل اللّٰه ﷺ", nama_rumi: "Nabi Muhammad ﷺ", gelaran: "", tabaqat: "Rasulullah ﷺ", wafat: "11", catatan: "Menerima al-Quran daripada Malaikat Jibril a.s." },
  { id: "p_uthman", nama_arab: "عُثْمَان بْن عَفَّان", nama_rumi: "Uthman bin Affan", gelaran: "Khalifah ke-3", tabaqat: "Sahabat", wafat: "35", catatan: "" },
  { id: "p_ali", nama_arab: "عَلِيّ بْن أَبِي طَالِب", nama_rumi: "Ali bin Abi Talib", gelaran: "Khalifah ke-4", tabaqat: "Sahabat", wafat: "40", catatan: "" },
  { id: "p_zaid", nama_arab: "زَيْد بْن ثَابِت", nama_rumi: "Zaid bin Thabit", gelaran: "", tabaqat: "Sahabat", wafat: "45", catatan: "Ketua penulis wahyu." },
  { id: "p_ubay", nama_arab: "أُبَيّ بْن كَعْب", nama_rumi: "Ubay bin Ka'b", gelaran: "", tabaqat: "Sahabat", wafat: "30?", catatan: "Tahun wafat berbeza mengikut riwayat." },
  { id: "p_sulami", nama_arab: "أَبُو عَبْدِ الرَّحْمَن السُّلَمِي", nama_rumi: "Abu Abd al-Rahman al-Sulami", gelaran: "", tabaqat: "Tabi'in", wafat: "74", catatan: "" },
  { id: "p_asim", nama_arab: "عَاصِم بْن أَبِي النَّجُود", nama_rumi: "'Asim bin Abi al-Najud", gelaran: "Imam Kufah", tabaqat: "Imam Qiraat", wafat: "127", catatan: "" },
  { id: "p_hafs", nama_arab: "حَفْص بْن سُلَيْمَان", nama_rumi: "Hafs bin Sulaiman", gelaran: "", tabaqat: "Imam Qiraat", wafat: "180", catatan: "Riwayat yang paling meluas digunakan hari ini." },
  { id: "p_nafi", nama_arab: "نَافِع بْن عَبْد الرَّحْمَن", nama_rumi: "Nafi' bin Abd al-Rahman", gelaran: "Imam Madinah", tabaqat: "Imam Qiraat", wafat: "169", catatan: "" },
  { id: "p_warsh", nama_arab: "عُثْمَان بْن سَعِيد الوَرْش", nama_rumi: "Warsh (Uthman bin Sa'id)", gelaran: "", tabaqat: "Imam Qiraat", wafat: "197", catatan: "" },
];

const SEED_SANAD = [
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
  const [collapsed, setCollapsed] = useState(new Set());
  const [selectedId, setSelectedId] = useState(null);
  const [search, setSearch] = useState("");

  const [showAddPerawi, setShowAddPerawi] = useState(false);
  const [editingPerawi, setEditingPerawi] = useState(null);
  const [showAddSanad, setShowAddSanad] = useState(false);
  const [sanadPrefill, setSanadPrefill] = useState(null);

  /* ---------- load (localStorage) ---------- */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        setPerawi(data.perawi || []);
        setSanad(data.sanad || []);
        setRootId(data.rootId || (data.perawi && data.perawi[0]?.id) || null);
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
          JSON.stringify({ perawi, sanad, rootId })
        );
        setSaveState("saved");
      } catch {
        setSaveState("error");
      }
    }, 500);
    return () => clearTimeout(t);
  }, [perawi, sanad, rootId, loading]);

  const perawiMap = useMemo(
    () => Object.fromEntries(perawi.map((p) => [p.id, p])),
    [perawi]
  );

  const riwayatOptions = useMemo(() => {
    const s = new Set(sanad.map((e) => e.riwayat).filter(Boolean));
    return ["Semua", ...Array.from(s).sort()];
  }, [sanad]);

  const getChildren = useCallback(
    (id) =>
      sanad
        .filter(
          (e) =>
            e.guru_id === id &&
            (riwayatFilter === "Semua" || e.riwayat === riwayatFilter) &&
            perawiMap[e.murid_id]
        )
        .map((e) => ({ edge: e, child: perawiMap[e.murid_id] })),
    [sanad, riwayatFilter, perawiMap]
  );

  const getParents = useCallback(
    (id) =>
      sanad
        .filter(
          (e) =>
            e.murid_id === id &&
            (riwayatFilter === "Semua" || e.riwayat === riwayatFilter) &&
            perawiMap[e.guru_id]
        )
        .map((e) => ({ edge: e, child: perawiMap[e.guru_id] })),
    [sanad, riwayatFilter, perawiMap]
  );

  const activeGetChildren = direction === "turun" ? getChildren : getParents;

  const toggleCollapse = (id) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
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

      <div className="main-area">
        <div className="tree-canvas">
          {rootId && perawiMap[rootId] ? (
            <TreeNode
              id={rootId}
              perawiMap={perawiMap}
              getChildren={activeGetChildren}
              collapsed={collapsed}
              toggleCollapse={toggleCollapse}
              onSelect={setSelectedId}
              onDrill={drillInto}
              selectedId={selectedId}
              direction={direction}
              visited={new Set()}
            />
          ) : (
            <div className="empty-state">Tiada perawi lagi. Tambah perawi pertama untuk mula.</div>
          )}
        </div>

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

      <style>{CSS}</style>
    </Shell>
  );
}

/* ---------------------------------------------------------
   TREE NODE (recursive, top-down "family tree")
--------------------------------------------------------- */
function TreeNode({ id, perawiMap, getChildren, collapsed, toggleCollapse, onSelect, onDrill, selectedId, direction, visited }) {
  const p = perawiMap[id];
  if (!p) return null;
  visited.add(id);
  const children = getChildren(id);
  const isCollapsed = collapsed.has(id);
  const isSelected = selectedId === id;
  const isProphet = p.tabaqat === "Rasulullah ﷺ";

  return (
    <div className="tree-node-wrap">
      <div
        className={`node-card${isSelected ? " selected" : ""}${isProphet ? " node-prophet" : ""}`}
        onClick={() => onSelect(id)}
        onDoubleClick={() => onDrill(id)}
      >
        {children.length > 0 && (
          <button
            className="collapse-btn"
            onClick={(e) => { e.stopPropagation(); toggleCollapse(id); }}
          >
            {isCollapsed ? <ChevronRight size={13} /> : <ChevronDown size={13} />}
          </button>
        )}
        <div className="node-arab">{p.nama_arab}</div>
        <div className="node-rumi">{p.nama_rumi}</div>
        <div className="node-meta">
          <span className="badge">{p.tabaqat}</span>
          {p.wafat && <span className="wafat">w. {p.wafat}H</span>}
        </div>
      </div>

      {direction === "naik" && children.length === 0 && (
        <div className={`chain-end${isProphet ? " chain-end-success" : ""}`}>
          {isProphet ? "✓ Sampai kepada Rasulullah ﷺ" : "— tiada rekod guru selanjutnya —"}
        </div>
      )}

      {!isCollapsed && children.length > 0 && (
        <>
          <div className="connector-stub" />
          <div className="children-row">
            {children.map(({ edge, child }) => {
              const alreadyShown = visited.has(child.id);
              return (
                <div className="child-branch" key={edge.id}>
                  {edge.riwayat && edge.riwayat !== "Umum" && (
                    <div className="edge-chip">{edge.riwayat}</div>
                  )}
                  {alreadyShown ? (
                    <div
                      className="node-card node-ref"
                      onClick={() => onSelect(child.id)}
                    >
                      <div className="node-arab">{child.nama_arab}</div>
                      <div className="node-rumi">{child.nama_rumi}</div>
                      <div className="ref-caption">↳ rujuk di atas</div>
                    </div>
                  ) : (
                    <TreeNode
                      id={child.id}
                      perawiMap={perawiMap}
                      getChildren={getChildren}
                      collapsed={collapsed}
                      toggleCollapse={toggleCollapse}
                      onSelect={onSelect}
                      onDrill={onDrill}
                      selectedId={selectedId}
                      direction={direction}
                      visited={visited}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
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
.tree-canvas { flex:1; overflow:auto; padding: 40px 30px 60px; display:flex; justify-content:center; }
.empty-state { color: var(--ink-soft); padding: 60px; }

.tree-node-wrap { display:flex; flex-direction:column; align-items:center; }
.node-card { position:relative; background: #fff; border: 1.5px solid var(--teal); border-radius: 10px; padding: 10px 16px 8px; min-width: 150px; max-width: 190px; text-align:center; cursor:pointer; box-shadow: 0 2px 0 var(--gold-light); }
.node-card::before { content:''; position:absolute; inset: 3px; border: 1px solid var(--gold-light); border-radius: 7px; pointer-events:none; }
.node-card.selected { border-color: var(--maroon); box-shadow: 0 0 0 3px rgba(122,46,46,0.15); }
.node-card.node-prophet { border-color: var(--gold); box-shadow: 0 0 0 3px rgba(212,175,106,0.25); }
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
`;
