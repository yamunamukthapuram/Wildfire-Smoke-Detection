export function classifyPixels(pixelData) {
  const total = pixelData.length / 3;
  let warmPixels = 0;
  let smokePixels = 0;

  for (let i = 0; i < pixelData.length; i += 3) {
    const r = pixelData[i];
    const g = pixelData[i + 1];
    const b = pixelData[i + 2];

    const brightness = (r + g + b) / 3;
    const saturation = Math.max(r, g, b) - Math.min(r, g, b);

    const isWarm =
      (r > 160 && g < r * 0.85 && b < r * 0.85) ||
      (r > 170 && g > 120 && b < 140);

    const isSmoke = saturation < 40 && brightness > 130;

    if (isWarm) warmPixels += 1;
    if (isSmoke) smokePixels += 1;
  }

  const warmRatio = warmPixels / total;
  const smokeRatio = smokePixels / total;

  let label = 'No wildfire detected';
  let confidence = 0.62;

  if (warmRatio > 0.1) {
    label = 'Wildfire likely';
    confidence = Math.min(0.96, 0.7 + warmRatio);
  } else if (smokeRatio > 0.12) {
    label = 'Smoke or haze detected';
    confidence = Math.min(0.92, 0.65 + smokeRatio);
  }

  return { label, confidence, warmRatio, smokeRatio };
}
