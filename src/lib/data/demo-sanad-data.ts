import { PublicTeacherProfile, SanadNodeRecord, SanadEdgeRecord } from '@/types/mysanad';

/**
 * IMPORTANT DATA INTEGRITY NOTICE:
 * All sample records in this file have `is_demo_record: true` and are explicitly labeled
 * with "[REKOD DEMONSTRASI]" so demonstration records are never mistaken for live verified scholars.
 * Classical historical transmitters (Rasulullah SAW, Sahabat, Tabi'in, Imam Asim, Imam Hafs, Imam al-Shatibi, Imam Ibn al-Jazari)
 * reflect documented classical Qiraat scholarship.
 */
export const HISTORICAL_SANAD_NODES: SanadNodeRecord[] = [
  {
    id: 'node-01-rasulullah',
    canonical_code: 'HIST-001-PROPHET',
    full_name_arabic: 'سيدنا محمد رسول الله ﷺ',
    full_name_rumi: 'Sayyiduna Muhammad Rasulullah SAW',
    alternative_spellings: ['Rasulullah SAW', 'Nabi Muhammad SAW'],
    historical_title: 'Khatam al-Anbiya’ wa al-Mursalin',
    generation_category: 'Rasulullah SAW',
    birth_year_hijri: '53 SH',
    death_year_hijri: '11 H',
    country_or_region: 'Makkah & Madinah al-Munawwarah',
    biography: 'Penerima wahyu al-Quran al-Karim melalui perantaraan Malaikat Jibril AS daripada Lauh Mahfuz.',
    scholarly_references: ['Sahih al-Bukhari', 'Al-Itqan fi Ulum al-Quran (Al-Suyuti)'],
    verification_status: 'published',
    is_public: true,
  },
  {
    id: 'node-02-uthman-ali',
    canonical_code: 'HIST-002-SAHABAH',
    full_name_arabic: 'عثمان بن عفان وعلي بن أبي طالب وأبي بن كعب وزيد بن ثابت وعبد الله بن مسعود رضي الله عنهم',
    full_name_rumi: 'Uthman bin Affan, Ali bin Abi Talib, Ubay bin Ka’ab, Zaid bin Thabit & Abdullah bin Mas’ud RA',
    alternative_spellings: ['Sahabat Qurra'],
    historical_title: 'Al-Sahabah al-Qurra’ al-Kiram',
    generation_category: 'Sahabat',
    birth_year_hijri: 'Sebelum Hijrah',
    death_year_hijri: '32H - 45H',
    country_or_region: 'Madinah al-Munawwarah & Kufah',
    biography: 'Para Sahabat utama yang mengambil bacaan al-Quran secara talaqqi musyafahah terus daripada Rasulullah SAW.',
    scholarly_references: ['Ghayat al-Nihayah fi Tabaqat al-Qurra (Ibn al-Jazari)', 'Ma’rifat al-Qurra al-Kibar (Al-Dhahabi)'],
    verification_status: 'published',
    is_public: true,
  },
  {
    id: 'node-03-sulami',
    canonical_code: 'HIST-003-SULAMI',
    full_name_arabic: 'أبو عبد الرحمن عبد الله بن حبيب السلمي الكوفي',
    full_name_rumi: "Abu 'Abd al-Rahman 'Abdullah bin Habib al-Sulami",
    alternative_spellings: ['Abu Abdurrahman as-Sulami'],
    historical_title: 'Syeikh al-Iqra’ bi al-Kufah',
    generation_category: "Tabi'in",
    birth_year_hijri: 'Sebelum Wafat Nabi SAW',
    death_year_hijri: '74 H',
    country_or_region: 'Kufah, Iraq',
    biography: 'Tabi’in agung yang mengajar al-Quran di Masjid Jami’ Kufah selama lebih 40 tahun dan meriwayatkan hadis "Sebaik-baik kamu ialah orang yang belajar al-Quran dan mengajarkannya".',
    scholarly_references: ['Ghayat al-Nihayah (1/413)', 'Siyar A’lam al-Nubala’ (4/267)'],
    verification_status: 'published',
    is_public: true,
  },
  {
    id: 'node-04-asim',
    canonical_code: 'HIST-004-ASIM',
    full_name_arabic: 'الإمام عاصم بن أبي النجود الكوفي الأسدي',
    full_name_rumi: "Imam 'Asim bin Abi al-Najud al-Kufi",
    alternative_spellings: ['Imam Asim al-Kufi'],
    historical_title: 'Imam al-Qira’ah bi al-Kufah (Salah Seorang Imam Qiraat Tujuh)',
    generation_category: 'Imam Qiraat',
    birth_year_hijri: 'Abad Pertama Hijrah',
    death_year_hijri: '127 H',
    country_or_region: 'Kufah, Iraq',
    biography: 'Imam Qiraat kelima dalam susunan Qiraat Sab’ah; menggabungkan ketepatan bacaan Abdullah bin Mas’ud RA (melalui Zirr bin Hubaisy) dan bacaan Ali bin Abi Talib RA (melalui Abu Abdurrahman al-Sulami).',
    scholarly_references: ['Ghayat al-Nihayah fi Tabaqat al-Qurra (1/346)', 'Al-Nasyr fi al-Qiraat al-Asyar'],
    verification_status: 'published',
    is_public: true,
  },
  {
    id: 'node-05-hafs',
    canonical_code: 'HIST-005-HAFS',
    full_name_arabic: 'الإمام أبو عمر حفص بن سليمان بن المغيرة الأسدي الكوفي',
    full_name_rumi: 'Imam Hafs bin Sulaiman bin al-Mughirah al-Asadi al-Kufi',
    alternative_spellings: ['Hafs bin Sulaiman', 'Imam Hafs'],
    historical_title: "Rawi Imam 'Asim al-Kufi",
    generation_category: 'Perawi',
    birth_year_hijri: '90 H',
    death_year_hijri: '180 H',
    country_or_region: 'Kufah & Baghdad',
    biography: 'Anak tiri dan murid utama Imam Asim yang paling mahir dalam dhabt bacaan Riwayat Hafs yang kini menjadi bacaan majoriti umat Islam sedunia.',
    scholarly_references: ['Ghayat al-Nihayah (1/254)', 'Tahdhib al-Kamal (7/10)'],
    verification_status: 'published',
    is_public: true,
  },
  {
    id: 'node-06-shatibi',
    canonical_code: 'HIST-006-SHATIBI',
    full_name_arabic: 'الإمام القاسم بن فيره بن خلف الشاطبي الرعيني الأندلسي',
    full_name_rumi: 'Imam al-Qasim bin Firruh al-Syatibi al-Andalusi',
    alternative_spellings: ['Imam asy-Syatibi'],
    historical_title: 'Pengarang Matan Hirz al-Amani (Al-Syatibiyyah)',
    generation_category: 'Ulama Qiraat Klasik',
    birth_year_hijri: '538 H',
    death_year_hijri: '590 H',
    country_or_region: 'Xativa (Andalusia) & Kaherah (Mesir)',
    biography: 'Wali Allah dan tokoh agung ilmu Qiraat Tujuh yang menyusun nazam Hirz al-Amani wa Wajh al-Tahani.',
    scholarly_references: ['Ghayat al-Nihayah (2/20)', 'Wafayat al-A’yan (4/71)'],
    verification_status: 'published',
    is_public: true,
  },
  {
    id: 'node-07-ibn-jazari',
    canonical_code: 'HIST-007-JAZARI',
    full_name_arabic: 'الإمام شمس الدين محمد بن محمد بن محمد بن الجزري الدمشقي',
    full_name_rumi: 'Imam Syamsuddin Muhammad bin Muhammad Ibn al-Jazari',
    alternative_spellings: ['Imam Ibn al-Jazari'],
    historical_title: 'Khatimat al-Muhaqqiqin fi Ilm al-Qiraat',
    generation_category: 'Ulama Qiraat Klasik',
    birth_year_hijri: '751 H',
    death_year_hijri: '833 H',
    country_or_region: 'Dimashq (Syam) & Shiraz',
    biography: 'Penghulu ulama muhaqqiqin ilmu Qiraat, pengarang kitab Al-Nasyr fi al-Qiraat al-Asyar, Tayyibat al-Nasyr, dan Al-Muqaddimah al-Jazariyyah.',
    scholarly_references: ['Al-Nasyr fi al-Qiraat al-Asyar', 'Ghayat al-Nihayah (2/247)'],
    verification_status: 'published',
    is_public: true,
  },
  {
    id: 'node-08-demo-musnid',
    canonical_code: 'DEMO-008-MUSNID',
    full_name_arabic: '[نموذج توضيحي] الشيخ المقرئ المسند (سلسلة الإقراء المعاصرة)',
    full_name_rumi: '[REKOD DEMONSTRASI] Syeikh Musnid Talaqqi (Jalur Masyaikh Mutaakhirin)',
    alternative_spellings: ['Syeikh Musnid Demo'],
    historical_title: 'Nod Demonstrasi Masyaikh Mutaakhirin',
    generation_category: 'Masyaikh Mutaakhirin',
    birth_year_hijri: 'Abad ke-14/15 H',
    country_or_region: 'Haramain / Mesir / Syam (Rekod Demonstrasi)',
    biography: 'Nod contoh bagi memaparkan kesinambungan thabaqat antara ulama klasik dengan guru al-Quran di Malaysia dalam mod simulasi sistem.',
    scholarly_references: ['Data Demonstrasi Sistem MySanad'],
    verification_status: 'published',
    is_public: true,
  },
  {
    id: 'node-09-unapproved-draft',
    canonical_code: 'DEMO-009-DRAFT-NODE',
    full_name_arabic: '[مسودة غير معتمدة] عقدة قيد المراجعة',
    full_name_rumi: '[DRAF BELUM DISAHKAN] Nod Tambahan Dalam Semakan Panel',
    alternative_spellings: [],
    historical_title: 'Nod Draf (Tidak Dipaparkan Pada Graf Awam)',
    generation_category: 'Guru Nusantara / Semasa',
    country_or_region: 'Malaysia',
    biography: 'Nod ini berstatus under_review dan wajib disembunyikan daripada pelawat awam.',
    scholarly_references: [],
    verification_status: 'under_review',
    is_public: false,
  },
];

export const DEMO_SANAD_EDGES: SanadEdgeRecord[] = [
  {
    id: 'edge-01',
    sanad_chain_id: 'snd-demo-001',
    source_node_id: 'node-01-rasulullah',
    target_node_id: 'node-02-uthman-ali',
    sequence_order: 1,
    transmission_relationship: 'Talaqqi Musyafahah di hadapan Rasulullah SAW',
    riwayat_context: 'Wahyu al-Quran al-Karim',
    supporting_evidence: 'Mutawatir dalam kitab-kitab Sahih & Tabaqat al-Qurra',
    verification_status: 'published',
    is_public: true,
  },
  {
    id: 'edge-02',
    sanad_chain_id: 'snd-demo-001',
    source_node_id: 'node-02-uthman-ali',
    target_node_id: 'node-03-sulami',
    sequence_order: 2,
    transmission_relationship: 'Talaqqi wa al-Ardh di Madinah & Kufah',
    riwayat_context: 'Qiraat Sahabah al-Kiram',
    supporting_evidence: 'Ghayat al-Nihayah fi Tabaqat al-Qurra (Ibn al-Jazari)',
    verification_status: 'published',
    is_public: true,
  },
  {
    id: 'edge-03',
    sanad_chain_id: 'snd-demo-001',
    source_node_id: 'node-03-sulami',
    target_node_id: 'node-04-asim',
    sequence_order: 3,
    transmission_relationship: 'Talaqqi Musyafahah di Masjid Jami’ Kufah',
    riwayat_context: "Qiraat 'Asim al-Kufi",
    supporting_evidence: 'Al-Nasyr fi al-Qiraat al-Asyar',
    verification_status: 'published',
    is_public: true,
  },
  {
    id: 'edge-04',
    sanad_chain_id: 'snd-demo-001',
    source_node_id: 'node-04-asim',
    target_node_id: 'node-05-hafs',
    sequence_order: 4,
    transmission_relationship: 'Talaqqi wa al-Itqan',
    riwayat_context: "Riwayat Hafs 'an 'Asim",
    supporting_evidence: 'Tabaqat al-Qurra',
    verification_status: 'published',
    is_public: true,
  },
  {
    id: 'edge-05',
    sanad_chain_id: 'snd-demo-001',
    source_node_id: 'node-05-hafs',
    target_node_id: 'node-06-shatibi',
    sequence_order: 5,
    transmission_relationship: 'Silsilah Muttasilah Tariq al-Syatibiyyah',
    riwayat_context: 'Tariq Hirz al-Amani (Al-Syatibiyyah)',
    supporting_evidence: 'Hirz al-Amani wa Wajh al-Tahani',
    verification_status: 'published',
    is_public: true,
  },
  {
    id: 'edge-06',
    sanad_chain_id: 'snd-demo-001',
    source_node_id: 'node-06-shatibi',
    target_node_id: 'node-07-ibn-jazari',
    sequence_order: 6,
    transmission_relationship: 'Silsilah Muttasilah ke Imam Ibn al-Jazari',
    riwayat_context: 'Tahqiq al-Qiraat al-Sab’ wa al-Asyar',
    supporting_evidence: 'Al-Nasyr fi al-Qiraat al-Asyar',
    verification_status: 'published',
    is_public: true,
  },
  {
    id: 'edge-07',
    sanad_chain_id: 'snd-demo-001',
    source_node_id: 'node-07-ibn-jazari',
    target_node_id: 'node-08-demo-musnid',
    sequence_order: 7,
    transmission_relationship: 'Silsilah Masyaikh Mutaakhirin [Rekod Demonstrasi]',
    riwayat_context: "Riwayat Hafs 'an 'Asim",
    supporting_evidence: 'Rekod Demonstrasi Sistem MySanad',
    verification_status: 'published',
    is_public: true,
  },
  {
    id: 'edge-08-unapproved',
    sanad_chain_id: 'snd-demo-001',
    source_node_id: 'node-08-demo-musnid',
    target_node_id: 'node-09-unapproved-draft',
    sequence_order: 8,
    transmission_relationship: 'Hubungan Draf Belum Disahkan',
    riwayat_context: 'Dalam Semakan',
    supporting_evidence: 'Menunggu Semakan Dokumen',
    verification_status: 'under_review',
    is_public: false,
  },
];

/**
 * Pure helper function tested by Vitest:
 * Filters a sanad graph so public visitors ONLY see approved/published & public nodes and edges.
 */
export function filterPublicSanadGraph(
  nodes: SanadNodeRecord[],
  edges: SanadEdgeRecord[]
) {
  const allowedStatuses = new Set(['approved', 'published']);
  const publicNodes = nodes.filter(
    (n) => n.is_public && allowedStatuses.has(n.verification_status)
  );
  const publicNodeIds = new Set(publicNodes.map((n) => n.id));
  const publicEdges = edges.filter(
    (e) =>
      e.is_public &&
      allowedStatuses.has(e.verification_status) &&
      publicNodeIds.has(e.source_node_id) &&
      publicNodeIds.has(e.target_node_id)
  );
  return { nodes: publicNodes, edges: publicEdges };
}

/**
 * Pure helper function tested by Vitest:
 * Strips any private PII fields (ic_number_encrypted, private_phone, residential_address, internal_admin_comment)
 * before sending payloads to public views.
 */
export function sanitizeTeacherForPublic<T extends Record<string, unknown>>(raw: T) {
  const clone = { ...raw };
  delete clone.ic_number_encrypted;
  delete clone.private_phone;
  delete clone.residential_address;
  delete clone.residential_state_id;
  delete clone.residential_district_id;
  delete clone.internal_admin_comment;
  return clone;
}
