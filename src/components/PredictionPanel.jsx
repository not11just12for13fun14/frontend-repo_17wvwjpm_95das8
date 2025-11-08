import { useMemo } from "react";
import { BadgeCheck } from "lucide-react";

const DEMO_GENRES = ["Rock", "Pop", "Hip-Hop", "Jazz", "Classical", "Electronic"];

// Simple demo classifier: softmax over a few engineered combinations
function demoClassifier(f) {
  if (!f) return { genre: "-", confidence: 0, scores: {} };
  const {
    tempo_bpm = 0,
    spectral_centroid = 0,
    spectral_rolloff = 0,
    zcr = 0,
    rms = 0,
  } = f;

  const features = [tempo_bpm / 200, spectral_centroid / 4000, spectral_rolloff / 6000, zcr * 10, rms];

  const weights = [
    [0.6, 0.8, 0.4, 0.7, 0.6], // Rock
    [0.7, 0.7, 0.6, 0.6, 0.5], // Pop
    [0.8, 0.6, 0.7, 0.9, 0.7], // Hip-Hop
    [0.3, 0.4, 0.2, 0.2, 0.3], // Jazz
    [0.1, 0.2, 0.1, 0.05, 0.2], // Classical
    [0.9, 0.9, 0.9, 0.8, 0.6], // Electronic
  ];

  const logits = weights.map((w) => w.reduce((s, wi, i) => s + wi * features[i], 0));
  const max = Math.max(...logits);
  const exps = logits.map((l) => Math.exp(l - max));
  const sum = exps.reduce((a, b) => a + b, 0) || 1;
  const probs = exps.map((e) => e / sum);

  const scores = Object.fromEntries(DEMO_GENRES.map((g, i) => [g, probs[i]]));
  const bestIdx = probs.indexOf(Math.max(...probs));
  return { genre: DEMO_GENRES[bestIdx], confidence: probs[bestIdx], scores };
}

export default function PredictionPanel({ features }) {
  const result = useMemo(() => demoClassifier(features), [features]);

  if (!features) return null;

  return (
    <section className="max-w-6xl mx-auto px-6 mt-8">
      <div className="p-6 rounded-2xl bg-white shadow-sm border border-gray-100">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <BadgeCheck className="w-6 h-6 text-emerald-600" />
            <h3 className="font-semibold">Predicted Genre</h3>
          </div>
          <div className="text-sm text-gray-600">Demo model — for illustration only</div>
        </div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="text-2xl font-bold">{result.genre}</div>
            <div className="text-sm text-gray-600">Confidence: {(result.confidence * 100).toFixed(1)}%</div>
          </div>
          <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-3">
            {Object.entries(result.scores).map(([g, p]) => (
              <div key={g} className="flex flex-col">
                <div className="h-2 w-full rounded bg-gray-100 overflow-hidden">
                  <div className="h-2 bg-indigo-500" style={{ width: `${(p * 100).toFixed(1)}%` }} />
                </div>
                <div className="mt-1 text-xs text-gray-600">
                  {g} • {(p * 100).toFixed(1)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
