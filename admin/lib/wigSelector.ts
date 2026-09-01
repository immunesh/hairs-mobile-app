export function getAngleIndex(angle: number) {
  const deg = ((angle * 180) / Math.PI + 360) % 360;

  const angles = [
    0,
    45,
    90,
    135,
    180,
    225,
    270,
    315,
  ];

  let closest = 0;
  let smallest = Infinity;

  angles.forEach((a, i) => {
    const diff = Math.abs(a - deg);

    if (diff < smallest) {
      smallest = diff;
      closest = i;
    }
  });

  return closest + 1;
}