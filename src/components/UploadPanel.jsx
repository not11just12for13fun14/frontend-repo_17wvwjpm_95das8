import { useRef, useState } from "react";
import { UploadCloud, Loader2 } from "lucide-react";

export default function UploadPanel({ onFileSelected }) {
  const fileRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSelect = async (file) => {
    if (!file) return;
    setLoading(true);
    try {
      await onFileSelected(file);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="max-w-6xl mx-auto px-6 -mt-8">
      <div
        className={`border-2 border-dashed rounded-2xl p-8 sm:p-10 bg-white shadow-lg transition-colors ${
          dragOver ? "border-indigo-500 bg-indigo-50" : "border-gray-200"
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const file = e.dataTransfer.files?.[0];
          onSelect(file);
        }}
      >
        <div className="flex items-center justify-between gap-6 flex-col sm:flex-row">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-indigo-100 text-indigo-700">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Upload an audio file</h3>
              <p className="text-sm text-gray-600">MP3, WAV, or OGG up to ~10MB</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => fileRef.current?.click()}
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition disabled:opacity-60"
              disabled={loading}
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Processing
                </span>
              ) : (
                "Choose File"
              )}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="audio/*"
              className="hidden"
              onChange={(e) => onSelect(e.target.files?.[0])}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
