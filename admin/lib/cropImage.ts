export default async function getCroppedImg(
  imageSrc: string,
  pixelCrop: any
) {
  const image = document.createElement("img");

  image.src = imageSrc;

  await new Promise((resolve) => {
    image.onload = resolve;
  });

  const canvas =
    document.createElement("canvas");

  const ctx =
    canvas.getContext("2d");

  if (!ctx) return null;

  canvas.width =
    pixelCrop.width;

  canvas.height =
    pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return canvas.toDataURL(
    "image/jpeg"
  );
}