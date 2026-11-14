-- =============================================================================
-- MySanad: Malaysia Digital Sanad Directory & Management System
-- Migration 003: Official Malaysian States (13 States + 3 Federal Territories),
-- Districts, and Authentic Qiraat / Riwayat / Tariq Reference Data
-- =============================================================================

-- 13 States + 3 Federal Territories (16 Total)
INSERT INTO public.malaysian_states (code, name, slug, is_federal_territory, region, display_order) VALUES
('JHR', 'Johor', 'johor', FALSE, 'Semenanjung', 1),
('KDH', 'Kedah', 'kedah', FALSE, 'Semenanjung', 2),
('KTN', 'Kelantan', 'kelantan', FALSE, 'Semenanjung', 3),
('MLK', 'Melaka', 'melaka', FALSE, 'Semenanjung', 4),
('NSN', 'Negeri Sembilan', 'negeri-sembilan', FALSE, 'Semenanjung', 5),
('PHG', 'Pahang', 'pahang', FALSE, 'Semenanjung', 6),
('PRK', 'Perak', 'perak', FALSE, 'Semenanjung', 7),
('PLS', 'Perlis', 'perlis', FALSE, 'Semenanjung', 8),
('PNG', 'Pulau Pinang', 'pulau-pinang', FALSE, 'Semenanjung', 9),
('SBH', 'Sabah', 'sabah', FALSE, 'Borneo', 10),
('SWK', 'Sarawak', 'sarawak', FALSE, 'Borneo', 11),
('SGR', 'Selangor', 'selangor', FALSE, 'Semenanjung', 12),
('TRG', 'Terengganu', 'terengganu', FALSE, 'Semenanjung', 13),
('KUL', 'Wilayah Persekutuan Kuala Lumpur', 'wilayah-persekutuan-kuala-lumpur', TRUE, 'Semenanjung', 14),
('PJY', 'Wilayah Persekutuan Putrajaya', 'wilayah-persekutuan-putrajaya', TRUE, 'Semenanjung', 15),
('LBN', 'Wilayah Persekutuan Labuan', 'wilayah-persekutuan-labuan', TRUE, 'Borneo', 16)
ON CONFLICT (slug) DO NOTHING;

-- Representative Malaysian Districts per State (Configurable by Administrators)
WITH state_lookup AS (SELECT id, slug FROM public.malaysian_states)
INSERT INTO public.malaysian_districts (state_id, name, slug)
SELECT s.id, d.name, d.slug
FROM state_lookup s
JOIN (VALUES
    -- Kelantan (All 10 Jajahan)
    ('kelantan', 'Kota Bharu', 'kota-bharu'),
    ('kelantan', 'Pasir Mas', 'pasir-mas'),
    ('kelantan', 'Tumpat', 'tumpat'),
    ('kelantan', 'Bachok', 'bachok'),
    ('kelantan', 'Pasir Puteh', 'pasir-puteh'),
    ('kelantan', 'Machang', 'machang'),
    ('kelantan', 'Tanah Merah', 'tanah-merah'),
    ('kelantan', 'Kuala Krai', 'kuala-krai'),
    ('kelantan', 'Jeli', 'jeli'),
    ('kelantan', 'Gua Musang', 'gua-musang'),
    -- Terengganu (All 8 Daerah)
    ('terengganu', 'Kuala Terengganu', 'kuala-terengganu'),
    ('terengganu', 'Kuala Nerus', 'kuala-nerus'),
    ('terengganu', 'Besut', 'besut'),
    ('terengganu', 'Setiu', 'setiu'),
    ('terengganu', 'Dungun', 'dungun'),
    ('terengganu', 'Kemaman', 'kemaman'),
    ('terengganu', 'Marang', 'marang'),
    ('terengganu', 'Hulu Terengganu', 'hulu-terengganu'),
    -- Selangor
    ('selangor', 'Petaling', 'petaling'),
    ('selangor', 'Hulu Langat', 'hulu-langat'),
    ('selangor', 'Gombak', 'gombak'),
    ('selangor', 'Klang', 'klang'),
    ('selangor', 'Sepang', 'sepang'),
    ('selangor', 'Kuala Selangor', 'kuala-selangor'),
    -- Johor
    ('johor', 'Johor Bahru', 'johor-bahru'),
    ('johor', 'Batu Pahat', 'batu-pahat'),
    ('johor', 'Muar', 'muar'),
    ('johor', 'Kluang', 'kluang'),
    -- Kedah
    ('kedah', 'Kota Setar', 'kota-setar'),
    ('kedah', 'Kubang Pasu', 'kubang-pasu'),
    ('kedah', 'Kuala Muda', 'kuala-muda'),
    ('kedah', 'Baling', 'baling'),
    -- Perak
    ('perak', 'Kinta', 'kinta'),
    ('perak', 'Kuala Kangsar', 'kuala-kangsar'),
    ('perak', 'Larut, Matang dan Selama', 'larut-matang-selama'),
    -- Pahang
    ('pahang', 'Kuantan', 'kuantan'),
    ('pahang', 'Temerloh', 'temerloh'),
    ('pahang', 'Pekan', 'pekan'),
    -- Pulau Pinang
    ('pulau-pinang', 'Timur Laut', 'timur-laut'),
    ('pulau-pinang', 'Barat Daya', 'barat-daya'),
    ('pulau-pinang', 'Seberang Perai Utara', 'seberang-perai-utara'),
    -- Melaka
    ('melaka', 'Melaka Tengah', 'melaka-tengah'),
    ('melaka', 'Alor Gajah', 'alor-gajah'),
    ('melaka', 'Jasin', 'jasin'),
    -- Negeri Sembilan
    ('negeri-sembilan', 'Seremban', 'seremban'),
    ('negeri-sembilan', 'Port Dickson', 'port-dickson'),
    ('negeri-sembilan', 'Rembau', 'rembau'),
    -- Perlis
    ('perlis', 'Kangar', 'kangar'),
    ('perlis', 'Arau', 'arau'),
    -- Sabah
    ('sabah', 'Kota Kinabalu', 'kota-kinabalu'),
    ('sabah', 'Sandakan', 'sandakan'),
    ('sabah', 'Tawau', 'tawau'),
    -- Sarawak
    ('sarawak', 'Kuching', 'kuching'),
    ('sarawak', 'Miri', 'miri'),
    ('sarawak', 'Sibu', 'sibu'),
    -- Federal Territories
    ('wilayah-persekutuan-kuala-lumpur', 'Bukit Bintang / Lembah Pantai / Titiwangsa', 'kuala-lumpur-pusat'),
    ('wilayah-persekutuan-putrajaya', 'Presint Pentadbiran & Komuniti Putrajaya', 'putrajaya-presint'),
    ('wilayah-persekutuan-labuan', 'Bandar Victoria / Labuan', 'victoria-labuan')
) AS d(state_slug, name, slug) ON s.slug = d.state_slug
ON CONFLICT (state_id, slug) DO NOTHING;

-- Authentic Qiraat Mutawatirah Reference Data
INSERT INTO public.qiraat_types (code, imam_name_rumi, imam_name_arabic, title_rumi, title_arabic, era_hijri, region_origin, display_order) VALUES
('Q01-NAFI', 'Imam Nafi'' al-Madani', 'الإمام نافع المدني', 'Qiraat Nafi'' al-Madani', 'قراءة نافع المدني', '70H - 169H', 'Madinah al-Munawwarah', 1),
('Q02-IBNKATHIR', 'Imam Ibn Kathir al-Makki', 'الإمام ابن كثير المكي', 'Qiraat Ibn Kathir al-Makki', 'قراءة ابن كثير المكي', '45H - 120H', 'Makkah al-Mukarramah', 2),
('Q03-ABUAMR', 'Imam Abu ''Amr al-Basri', 'الإمام أبو عمرو البصري', 'Qiraat Abu ''Amr al-Basri', 'قراءة أبي عمرو البصري', '68H - 154H', 'Basrah', 3),
('Q04-IBNAMIR', 'Imam Ibn ''Amir al-Dimashqi', 'الإمام ابن عامر الدمشقي', 'Qiraat Ibn ''Amir al-Dimashqi', 'قراءة ابن عامر الدمشقي', '21H - 118H', 'Dimashq (Syam)', 4),
('Q05-ASIM', 'Imam ''Asim al-Kufi', 'الإمام عاصم الكوفي', 'Qiraat ''Asim al-Kufi', 'قراءة عاصم الكوفي', 'Wafat 127H', 'Kufah', 5),
('Q06-HAMZAH', 'Imam Hamzah al-Kufi', 'الإمام حمزة الكوفي', 'Qiraat Hamzah al-Kufi', 'قراءة حمزة الكوفي', '80H - 156H', 'Kufah', 6),
('Q07-KISAI', 'Imam al-Kisa''i al-Kufi', 'الإمام الكسائي الكوفي', 'Qiraat al-Kisa''i al-Kufi', 'قراءة الكسائي الكوفي', '119H - 189H', 'Kufah', 7),
('Q10-ASHARAH', 'Qiraat ''Asyarah Sughra & Kubra', 'القراءات العشر الصغرى والكبرى', 'Qiraat Sepuluh Mutawatirah', 'القراءات العشر المتواترة', 'Mutawatirah', 'Haramain, Iraq & Syam', 8)
ON CONFLICT (code) DO NOTHING;

-- Authentic Riwayat Reference Data
WITH q AS (SELECT id, code FROM public.qiraat_types)
INSERT INTO public.riwayat_types (qiraat_id, code, rawi_name_rumi, rawi_name_arabic, full_label_rumi, full_label_arabic, era_hijri, display_order)
SELECT q.id, r.code, r.rawi_rumi, r.rawi_ar, r.label_rumi, r.label_ar, r.era, r.ord
FROM q
JOIN (VALUES
    ('Q05-ASIM', 'R-HAFS', 'Imam Hafs bin Sulaiman', 'حفص بن سليمان', 'Riwayat Hafs ''an ''Asim', 'رواية حفص عن عاصم', '90H - 180H', 1),
    ('Q05-ASIM', 'R-SHUBAH', 'Imam Syu''bah bin ''Ayyasy', 'شعبة بن عياش', 'Riwayat Syu''bah ''an ''Asim', 'رواية شعبة عن عاصم', '95H - 193H', 2),
    ('Q01-NAFI', 'R-QALUN', 'Imam Qalun', 'قالون', 'Riwayat Qalun ''an Nafi''', 'رواية قالون عن نافع', '120H - 220H', 3),
    ('Q01-NAFI', 'R-WARSH', 'Imam Warsy', 'ورش', 'Riwayat Warsy ''an Nafi''', 'رواية ورش عن نافع', '110H - 197H', 4),
    ('Q02-IBNKATHIR', 'R-BAZZI', 'Imam al-Bazzi', 'البزي', 'Riwayat al-Bazzi ''an Ibn Kathir', 'رواية البزي عن ابن كثير', '170H - 250H', 5),
    ('Q02-IBNKATHIR', 'R-QUNBUL', 'Imam Qunbul', 'قنبل', 'Riwayat Qunbul ''an Ibn Kathir', 'رواية قنبل عن ابن كثير', '195H - 291H', 6),
    ('Q03-ABUAMR', 'R-DURI-ABUAMR', 'Imam al-Duri', 'الدوري', 'Riwayat al-Duri ''an Abi ''Amr', 'رواية الدوري عن أبي عمرو', '150H - 246H', 7),
    ('Q03-ABUAMR', 'R-SUSI', 'Imam al-Susi', 'السوسي', 'Riwayat al-Susi ''an Abi ''Amr', 'رواية السوسي عن أبي عمرو', '170H - 261H', 8),
    ('Q10-ASHARAH', 'R-JAM-ASHARAH', 'Jam''ul Qiraat al-''Asyar', 'جمع القراءات العشر', 'Jam''ul Qiraat al-''Asyar', 'جمع القراءات العشر', 'Mutawatirah', 9)
) AS r(q_code, code, rawi_rumi, rawi_ar, label_rumi, label_ar, era, ord) ON q.code = r.q_code
ON CONFLICT (code) DO NOTHING;

-- Authentic Tariq Reference Data
INSERT INTO public.tariq_types (code, name_rumi, name_arabic, source_book_rumi, source_book_arabic) VALUES
('T-SHATIBIYYAH', 'Tariq al-Syatibiyyah', 'طريق الشاطبية', 'Hirz al-Amani wa Wajh al-Tahani', 'حرز الأماني ووجه التهاني'),
('T-TAYYIBAH', 'Tariq Tayyibat al-Nasyr', 'طريق طيبة النشر', 'Tayyibat al-Nasyr fi al-Qiraat al-''Asyar', 'طيبة النشر في القراءات العشر'),
('T-DURRAH', 'Tariq al-Durrah al-Mudhiyyah', 'طريق الدرة المضية', 'Al-Durrah al-Mudhiyyah fi al-Qiraat al-Thalath', 'الدرة المضية في القراءات الثلاث')
ON CONFLICT (code) DO NOTHING;
