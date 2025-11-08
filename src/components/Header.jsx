import { Music, Sliders, Waves } from "lucide-react";

export default function Header() {
  return (
    <header className="w-full py-10 bg-gradient-to-b from-indigo-600 via-indigo-500 to-indigo-400 text-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-white/10 backdrop-blur">
            <Music className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Signal-Aware Music Genre Classifier</h1>
        </div>
        <p className="mt-3 text-white/90 max-w-3xl leading-relaxed">
          Upload an audio track and explore how signal processing transforms raw sound into features like
          spectral centroid, energy, and zero-crossing rate. Then see a demo classifier predict the genre
          from these characteristics.
        </p>
        <div className="mt-6 flex flex-wrap gap-3 text-sm text-indigo-100/90">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10">
            <Waves className="w-4 h-4" /> FFT / STFT concepts
          </span>
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10">
            <Sliders className="w-4 h-4" /> Feature extraction
          </span>
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10">
            <Music className="w-4 h-4" /> Genre prediction (demo)
          </span>
        </div>
      </div>
    </header>
  );
}
