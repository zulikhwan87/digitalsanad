import React from 'react';
import Link from 'next/link';
import { MALAYSIAN_STATES, QIRAAT_LIST, RIWAYAT_LIST } from '@/lib/constants/malaysia-data';

export default function Page({
  params,
}: {
  params?: Record<string, string>;
}) {
  return (
    <main className="min-h-screen bg-[#FAF8FF] text-[#1F2937]">
      <header className="islamic-pattern-bg border-b border-[#A855F7]/30 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#A855F7] font-bold text-[#3B0764]">
              MS
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight">MySanad</span>
              <span className="block text-xs text-purple-100">
                Malaysia Digital Sanad Directory & Management System
              </span>
            </div>
          </Link>
          <nav className="flex items-center gap-4 text-sm font-medium">
            <Link href="/directory" className="hover:text-[#A855F7]">Direktori Guru</Link>
            <Link href="/states" className="hover:text-[#A855F7]">16 Negeri & WP</Link>
            <Link href="/sanad" className="hover:text-[#A855F7]">Graf Sanad</Link>
            <Link href="/teacher/dashboard" className="hover:text-[#A855F7]">Portal Guru</Link>
            <Link href="/admin/dashboard" className="rounded-lg bg-[#A855F7] px-3 py-1.5 text-xs font-bold text-[#3B0764]">
              Portal Admin
            </Link>
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          <span className="inline-flex items-center rounded-full bg-[#7C3AED]/10 px-3 py-1 text-xs font-semibold text-[#7C3AED]">
            MySanad Production Route
          </span>
          <h1 className="mt-3 text-2xl font-bold text-[#3B0764] sm:text-3xl">
            Semakan Terperinci Profil Guru
          </h1>
          <p className="mt-2 text-sm text-gray-600">Audit Profil, Pendidikan, Sijil Ijazah & Lencana Pengesahan</p>
          {params && Object.keys(params).length > 0 && (
            <div className="mt-4 rounded-xl bg-[#FAF8FF] p-3 text-xs font-mono text-[#7C3AED]">
              Parameter Laluan: {JSON.stringify(params)}
            </div>
          )}

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {MALAYSIAN_STATES.slice(0, 4).map((st) => (
              <Link
                key={st.code}
                href={`/states/${st.slug}`}
                className="rounded-xl border border-gray-200 p-4 transition hover:border-[#7C3AED] hover:shadow-sm"
              >
                <p className="font-semibold text-[#3B0764]">{st.name}</p>
                <p className="mt-1 text-xs text-gray-500">
                  {st.districts.length} Daerah / Jajahan • Rantau {st.region}
                </p>
              </Link>
            ))}
          </div>

          <div className="mt-6 border-t border-gray-100 pt-6 text-xs text-gray-500">
            Merangkumi {MALAYSIAN_STATES.length} Negeri & Wilayah Persekutuan • {QIRAAT_LIST.length} Qiraat • {RIWAYAT_LIST.length} Riwayat.
          </div>
        </div>
      </section>
    </main>
  );
}
