/**
 * Image processing utilities for transparent background extraction
 */

export function removeWhiteBackground(dataUrl: string, threshold = 225): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const cvs = document.createElement('canvas');
      cvs.width = img.naturalWidth;
      cvs.height = img.naturalHeight;
      const ctx = cvs.getContext('2d');
      if (!ctx) return resolve(dataUrl);

      ctx.drawImage(img, 0, 0);
      const imgData = ctx.getImageData(0, 0, cvs.width, cvs.height);
      const d = imgData.data;

      for (let i = 0; i < d.length; i += 4) {
        const r = d[i];
        const g = d[i + 1];
        const b = d[i + 2];
        const a = d[i + 3];

        if (a === 0) continue;

        const avg = (r + g + b) / 3;
        const diff = Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(r - b));

        // Detect light/white pixels even with JPEG artifacts or slight tints
        if ((r >= threshold && g >= threshold && b >= threshold) || (avg >= threshold && diff < 30)) {
          d[i + 3] = 0; // Make 100% transparent
        }
      }

      ctx.putImageData(imgData, 0, 0);
      resolve(cvs.toDataURL('image/png'));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}
