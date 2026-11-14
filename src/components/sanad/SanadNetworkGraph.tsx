'use client';

import React, { useState } from 'react';

interface SanadDocumentViewerProps {
  teacherCode: string;
  teacherName: string;
  riwayat: string;
  documentUrl?: string;
  fileType?: 'image' | 'pdf';
}

export function SanadDocumentViewer({
  teacherCode,
  teacherName,
  riwayat,
  documentUrl,
  fileType = 'image',
}: SanadDocumentViewerProps) {
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(documentUrl);
  const [currentType, setCurrentType] = useState<'image' | 'pdf'>(fileType);
  const [zoom, setZoom] = useState(1);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    setCurrentType(isPdf ? 'pdf' : 'image');
    setPreviewUrl(URL.createObjectURL(file));
  };

  return (
    <div className="space-y-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#7C3AED]">
            Paparan Gambar / PDF Sanad Guru
          </span>
          <h3 className="text-lg font-extrabold text-[#3B0764]">
            Papar Sanad: {teacherName} ({teacherCode})
          </h3>
          <p className="text-xs text-gray-500">
            Riwayat: {riwayat} • Memaparkan gambar atau PDF sanad yang diberikan terus oleh guru.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(1.4, Number((z + 0.1).toFixed(2))))}
            className="rounded-lg border border-gray-300 px-2.5 py-1 text-xs font-bold"
          >
            +
          </button>
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(0.7, Number((z - 0.1).toFixed(2))))}
            className="rounded-lg border border-gray-300 px-2.5 py-1 text-xs font-bold"
          >
            −
          </button>
          <label className="cursor-pointer rounded-xl bg-[#7C3AED] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#3B0764]">
            <span>Muat Naik Gambar / PDF Sanad</span>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,application/pdf"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {previewUrl ? (
        currentType === 'pdf' ? (
          <iframe
            src={previewUrl}
            className="h-[540px] w-full rounded-xl border border-gray-200"
            title={`PDF Sanad ${teacherName}`}
          />
        ) : (
          <div className="overflow-auto rounded-xl border border-gray-200 bg-[#FAF8FF] p-4 text-center">
            <img
              src={previewUrl}
              alt={`Gambar Sanad ${teacherName}`}
              style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}
              className="mx-auto max-w-full rounded-xl shadow transition-transform"
            />
          </div>
        )
      ) : (
        <div className="rounded-xl border border-dashed border-[#7C3AED]/40 bg-[#FAF8FF] p-8 text-center text-xs text-gray-600">
          Fail gambar (JPG/PNG) atau PDF sanad guru akan dipaparkan secara langsung di ruangan ini.
        </div>
      )}
    </div>
  );
}
