/** Encodes planar stereo float samples to a 16‑bit PCM WAV blob. */
export function encodeWav(channels: [Float32Array, Float32Array], sampleRate: number): Blob {
  const n = channels[0].length;
  const buf = new ArrayBuffer(44 + n * 4);
  const view = new DataView(buf);
  const str = (off: number, s: string) => {
    for (let i = 0; i < s.length; i++) view.setUint8(off + i, s.charCodeAt(i));
  };
  str(0, "RIFF");
  view.setUint32(4, 36 + n * 4, true);
  str(8, "WAVE");
  str(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 2, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 4, true);
  view.setUint16(32, 4, true);
  view.setUint16(34, 16, true);
  str(36, "data");
  view.setUint32(40, n * 4, true);
  let off = 44;
  const [l, r] = channels;
  for (let i = 0; i < n; i++) {
    let v = Math.max(-1, Math.min(1, l[i]!));
    view.setInt16(off, v < 0 ? v * 0x8000 : v * 0x7fff, true);
    v = Math.max(-1, Math.min(1, r[i]!));
    view.setInt16(off + 2, v < 0 ? v * 0x8000 : v * 0x7fff, true);
    off += 4;
  }
  return new Blob([buf], { type: "audio/wav" });
}
