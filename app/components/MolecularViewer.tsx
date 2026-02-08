'use client';

import { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    $3Dmol?: {
      createViewer: (
        element: HTMLElement,
        opts?: { backgroundColor?: string }
      ) => {
        addModel: (data: string, format: string) => unknown;
        setStyle: (sel: object, style: object) => void;
        zoomTo: (sel?: object) => void;
        render: () => void;
        clear: () => void;
      };
    };
  }
}

interface MolecularViewerProps {
  pdbId?: string;
  variant?: 'normal' | 'sickle';
  className?: string;
}

function getPdbId(pdbId?: string, variant?: 'normal' | 'sickle'): string {
  if (pdbId) return pdbId;
  return variant === 'sickle' ? '2HBS' : '1HHO';
}

function waitFor3Dmol(): Promise<typeof window.$3Dmol> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('window undefined'));
      return;
    }
    if (window.$3Dmol) {
      resolve(window.$3Dmol);
      return;
    }
    let resolved = false;
    const check = setInterval(() => {
      if (window.$3Dmol && !resolved) {
        resolved = true;
        clearInterval(check);
        clearTimeout(timeout);
        resolve(window.$3Dmol!);
      }
    }, 100);
    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        clearInterval(check);
        reject(new Error('3Dmol.js failed to load'));
      }
    }, 15000);
  });
}

export default function MolecularViewer({
  pdbId,
  variant = 'normal',
  className = '',
}: MolecularViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<ReturnType<typeof window.$3Dmol.createViewer> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const targetPdb = getPdbId(pdbId, variant);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let cancelled = false;

    const run = async () => {
      setLoading(true);
      setError(null);

      try {
        const mol = await waitFor3Dmol();
        if (cancelled) return;

        const pdbRes = await fetch(`/api/pdb/${targetPdb}`);
        if (!pdbRes.ok) throw new Error(`Failed to load PDB: ${pdbRes.status}`);
        const pdbData = await pdbRes.text();
        if (cancelled) return;

        if (viewerRef.current) {
          try {
            viewerRef.current.clear();
          } catch {
            viewerRef.current = null;
          }
        }

        if (!viewerRef.current) {
          viewerRef.current = mol.createViewer(container, {
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
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Failed to load structure');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [targetPdb]);

  return (
    <div
      className={`relative w-full rounded-xl overflow-hidden bg-[#0d1117] ${className}`}
      style={{ minHeight: 320 }}
    >
      <div
        ref={containerRef}
        className="w-full h-full"
        style={{ width: '100%', height: 400, minHeight: 400, position: 'relative' }}
      />
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#0d1117]/95">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-emerald-400">Loading structure...</span>
          </div>
        </div>
      )}
      {error && !loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#0d1117]/95">
          <div className="text-center px-4">
            <p className="text-amber-400 text-sm">{error}</p>
            <p className="text-zinc-500 text-xs mt-2">PDB ID: {targetPdb}</p>
          </div>
        </div>
      )}
    </div>
  );
}
