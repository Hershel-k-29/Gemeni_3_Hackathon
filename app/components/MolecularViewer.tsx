'use client';

import { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    $3Dmol?: {
      createViewer: (element: HTMLElement | string, opts?: Record<string, unknown>) => {
        addModel: (data: string, format: string) => unknown;
        setStyle: (sel: object, style: object) => unknown;
        zoomTo: (sel?: object) => unknown;
        render: () => void;
        clear: () => void;
        removeAllModels: () => void;
      };
    };
  }
}

const PDB_URLS: Record<string, string> = {
  normal: 'https://files.rcsb.org/view/1HHO.pdb',
  sickle: 'https://files.rcsb.org/view/2HBS.pdb',
};

interface MolecularViewerProps {
  pdbId?: string;
  variant?: 'normal' | 'sickle';
  stressRegions?: string[];
  className?: string;
}

export default function MolecularViewer({ pdbId, variant = 'normal', stressRegions, className = '' }: MolecularViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<ReturnType<typeof window.$3Dmol.createViewer> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const pdbSource = pdbId
    ? `https://files.rcsb.org/view/${pdbId}.pdb`
    : PDB_URLS[variant] || PDB_URLS.normal;

  useEffect(() => {
    if (!containerRef.current) return;

    const initViewer = async () => {
      if (typeof window === 'undefined') return;

      if (!window.$3Dmol) {
        const script = document.createElement('script');
        script.src = 'https://3Dmol.csb.pitt.edu/build/3Dmol-min.js';
        script.async = true;
        script.onload = () => loadStructure();
        script.onerror = () => setError('Failed to load 3Dmol.js');
        document.head.appendChild(script);
        return;
      }

      loadStructure();
    };

    const loadStructure = async () => {
      if (!window.$3Dmol || !containerRef.current) return;

      setLoading(true);
      setError(null);

      try {
        const res = await fetch(pdbSource);
        if (!res.ok) throw new Error(`Failed to fetch PDB: ${res.status}`);
        const pdbData = await res.text();

        if (viewerRef.current) {
          viewerRef.current.removeAllModels();
        } else {
          viewerRef.current = window.$3Dmol.createViewer(containerRef.current, {
            backgroundColor: '0x0d1117',
          });
        }

        viewerRef.current.addModel(pdbData, 'pdb');
        viewerRef.current.setStyle(
          {},
          {
            cartoon: {
              color: 'spectrum',
              thickness: 0.6,
            },
          }
        );
        viewerRef.current.zoomTo();
        viewerRef.current.render();
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load structure');
      } finally {
        setLoading(false);
      }
    };

    initViewer();

    return () => {
      if (viewerRef.current) {
        viewerRef.current.removeAllModels?.();
      }
    };
  }, [pdbSource]);

  return (
    <div className={`relative w-full h-full min-h-[320px] rounded-xl overflow-hidden bg-[#0d1117] ${className}`}>
      <div ref={containerRef} className="absolute inset-0 w-full h-full" style={{ minHeight: 320 }} />
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#0d1117]/90">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-emerald-400">Loading structure...</span>
          </div>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#0d1117]/90">
          <p className="text-amber-400 text-sm">{error}</p>
        </div>
      )}
    </div>
  );
}
