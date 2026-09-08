// Gestisce il canvas (misura, densità di pixel) e delega il disegno alla scena.
export class Renderer {
  constructor(canvas, colonne, righe) {
    this.canvas = canvas; this.ctx = canvas.getContext('2d'); this.colonne = colonne; this.righe = righe; this.T = 48;
    this.ridimensiona(); new ResizeObserver(() => this.ridimensiona()).observe(canvas);
  }
  ridimensiona() {
    const dpr = Math.min(3, window.devicePixelRatio || 1);
    const w = this.canvas.clientWidth || 390, h = this.canvas.clientHeight || Math.round(w * this.righe / this.colonne);
    this.canvas.width = Math.round(w * dpr); this.canvas.height = Math.round(h * dpr);
    this.T = this.canvas.width / this.colonne;                 // lato del tassello in pixel reali
    this.ctx.imageSmoothingEnabled = true; this.ctx.imageSmoothingQuality = 'high';
  }
  disegna(scena) {
    const { ctx, canvas } = this;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    scena.disegna(ctx, this.T);
  }
}
