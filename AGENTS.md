<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Architecture
- Audio separation runs fully in the browser (HT-Demucs ONNX via onnxruntime-web 1.22 WASM in a Web Worker, ffmpeg.wasm for video remux/MP3) — the user requires a free app with no paid servers or APIs.
- Keep ORT `graphOptimizationLevel: "disabled"` for the Demucs model — "basic"/"all" crash with out-of-memory in WASM.
