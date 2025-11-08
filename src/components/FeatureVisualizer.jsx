import { useMemo } from "react";

function Stat({ label, value }) {
  return (
    <div className="p-4 rounded-xl bg-white shadow-sm border border-gray-100">
      <div className="text-xs uppercase tracking-wide text-gray-500">{label}</div>
      <div className="mt-1 text-xl font-semibold">{Number.isFinite(value) ? value.toFixed(3) : "-"}</div>
    </div>
  );
}

export default function FeatureVisualizer({ features }) {
  const bars = useMemo(() => {
    if (!features) return [];
    const keys = Object.keys(features);
    return keys.map((k) => ({ key: k, value: Number(features[k]) || 0 }));
  }, [features]);

  if (!features) {
    return (
      <section className="max-w-6xl mx-auto px-6 mt-8">
        <div className="p-6 rounded-2xl border border-dashed border-gray-200 text-gray-600 bg-white">
          Drop an audio file to extract features like spectral centroid, rolloff, energy, and zero-crossing rate.
        </div>
      </section>
    );
  }

  const { duration, rms, zcr, spectral_centroid, spectral_rolloff, tempo_bpm } = features;

  return (
    <section className="max-w-6xl mx-auto px-6 mt-8">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Stat label="Duration (s)" value={duration} />
        <Stat label="RMS Energy" value={rms} />
        <Stat label="Zero-Crossing" value={zcr} />
        <Stat label="Centroid (Hz)" value={spectral_centroid} />
        <Stat label="Rolloff (Hz)" value={spectral_rolloff} />
        <Stat label="Tempo (BPM)" value={tempo_bpm} />
      </div>

      <div className="mt-8 p-6 rounded-2xl bg-white shadow-sm border border-gray-100">
        <h3 className="font-semibold">Feature Magnitudes</h3>
        <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {bars.map((b) => {
            const height = Math.min(100, Math.max(5, Math.abs(b.value)))
              .toString();
            return (
              <div key={b.key} className="flex flex-col">
                <div className="h-28 w-full bg-indigo-100 rounded-lg overflow-hidden flex items-end">
                  <div
                    className="w-full bg-indigo-500"
                    style={{ height: `${height}%` }}
                    title={`${b.key}: ${b.value}`}
                  />
                </div>
                <span className="mt-1 text-xs text-gray-600 truncate" title={b.key}>
                  {b.key.replaceAll("_", " ")}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
