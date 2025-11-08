import { useState } from "react";
import Header from "./components/Header";
import UploadPanel from "./components/UploadPanel";
import FeatureVisualizer from "./components/FeatureVisualizer";
import PredictionPanel from "./components/PredictionPanel";

// Minimal, in-browser feature extraction using Web Audio API
async function extractFeaturesFromFile(file) {
  const arrayBuffer = await file.arrayBuffer();
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

  const channelData = audioBuffer.getChannelData(0);
  const sampleRate = audioBuffer.sampleRate;
  const duration = audioBuffer.duration;

  // Basic time-domain features
  let sumSquares = 0;
  let zeroCrossings = 0;
  for (let i = 1; i < channelData.length; i++) {
    const x = channelData[i];
    sumSquares += x * x;
    if ((channelData[i - 1] >= 0 && x < 0) || (channelData[i - 1] < 0 && x >= 0)) zeroCrossings++;
  }
  const rms = Math.sqrt(sumSquares / channelData.length);
  const zcr = zeroCrossings / channelData.length;

  // Frequency-domain features via simple FFT (power of 2 window)
  const fftSize = 2048;
  const analyser = audioCtx.createAnalyser();
  analyser.fftSize = fftSize * 2; // for frequencyBinCount = fftSize
  const source = audioCtx.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(analyser);
  analyser.connect(audioCtx.destination);
  // Render one block without playing through speakers
  // Create an offline context to avoid audible playback
  const offlineCtx = new OfflineAudioContext(1, fftSize, sampleRate);
  const offBuffer = offlineCtx.createBuffer(1, fftSize, sampleRate);
  offBuffer.copyToChannel(channelData.slice(0, fftSize), 0);
  const offSource = offlineCtx.createBufferSource();
  offSource.buffer = offBuffer;
  const offAnalyser = offlineCtx.createAnalyser();
  offAnalyser.fftSize = fftSize * 2;
  offSource.connect(offAnalyser);
  offAnalyser.connect(offlineCtx.destination);
  offSource.start();
  await offlineCtx.startRendering();

  const spectrum = new Float32Array(offAnalyser.frequencyBinCount);
  offAnalyser.getFloatFrequencyData(spectrum);
  const mags = Array.from(spectrum, (v) => Math.pow(10, v / 20)); // convert dB to linear

  // Spectral centroid and rolloff approximations
  let num = 0;
  let den = 0;
  mags.forEach((m, k) => {
    const freq = (k * sampleRate) / (2 * mags.length);
    num += freq * m;
    den += m;
  });
  const spectral_centroid = den > 0 ? num / den : 0;

  const totalEnergy = mags.reduce((a, b) => a + b, 0);
  let cumulative = 0;
  let rolloffFreq = 0;
  for (let k = 0; k < mags.length; k++) {
    cumulative += mags[k];
    if (cumulative >= 0.85 * totalEnergy) {
      rolloffFreq = (k * sampleRate) / (2 * mags.length);
      break;
    }
  }
  const spectral_rolloff = rolloffFreq;

  // Crude tempo estimate using autocorrelation of energy envelope
  const hop = 512;
  const frame = 1024;
  const frames = Math.floor((channelData.length - frame) / hop);
  const energies = new Float32Array(frames);
  for (let i = 0; i < frames; i++) {
    let e = 0;
    for (let j = 0; j < frame; j++) {
      const s = channelData[i * hop + j];
      e += s * s;
    }
    energies[i] = e;
  }
  // Normalize energies
  const meanE = energies.reduce((a, b) => a + b, 0) / Math.max(1, energies.length);
  for (let i = 0; i < energies.length; i++) energies[i] -= meanE;
  // Autocorrelation
  let bestLag = 0;
  let bestVal = -Infinity;
  const minBPM = 60;
  const maxBPM = 180;
  const minLag = Math.floor((60 / maxBPM) * (sampleRate / hop));
  const maxLag = Math.floor((60 / minBPM) * (sampleRate / hop));
  for (let lag = minLag; lag <= maxLag; lag++) {
    let acc = 0;
    for (let i = 0; i + lag < energies.length; i++) acc += energies[i] * energies[i + lag];
    if (acc > bestVal) {
      bestVal = acc;
      bestLag = lag;
    }
  }
  const tempo_bpm = bestLag > 0 ? (60 * (sampleRate / hop)) / bestLag : 0;

  return {
    duration,
    rms,
    zcr,
    spectral_centroid,
    spectral_rolloff,
    tempo_bpm,
  };
}

export default function App() {
  const [features, setFeatures] = useState(null);

  const handleFileSelected = async (file) => {
    const feats = await extractFeaturesFromFile(file);
    setFeatures(feats);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <Header />
      <UploadPanel onFileSelected={handleFileSelected} />
      <FeatureVisualizer features={features} />
      <PredictionPanel features={features} />
      <footer className="max-w-6xl mx-auto px-6 mt-10 mb-12 text-xs text-gray-500">
        This is an interactive front-end demo showcasing signal processing-inspired features and a simple genre prediction approximation. For a production classifier, pair it with a backend that computes MFCCs/STFT and trains a proper model.
      </footer>
    </div>
  );
}
