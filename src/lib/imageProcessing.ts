import type { ImportImage } from "@/types/photo-import"

function isHeicFile(file: File): boolean {
  return (
    ["image/heic", "image/heif"].includes(file.type) ||
    /\.heic$/i.test(file.name)
  )
}

/** HEIC -> JPEG Blob conversion using libheif-js + Canvas */
export async function normalizeFile(file: File): Promise<Blob> {
  if (!isHeicFile(file)) return file

  const { default: libheifFactory } = await import("libheif-js")
  const libheif = libheifFactory()
  const decoder = new libheif.HeifDecoder()
  const buffer = await file.arrayBuffer()
  const images = decoder.decode(new Uint8Array(buffer))

  if (!images || images.length === 0) {
    throw new Error("HEIC 이미지를 디코딩할 수 없습니다.")
  }

  const image = images[0]
  const width = image.get_width()
  const height = image.get_height()

  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext("2d")!

  const imageData = ctx.createImageData(width, height)
  await new Promise<void>((resolve, reject) => {
    image.display(imageData, (displayData: unknown) => {
      if (!displayData) {
        return reject(new Error("HEIC display failed"))
      }
      resolve()
    })
  })
  ctx.putImageData(imageData, 0, 0)

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Canvas toBlob failed"))),
      "image/jpeg",
      0.8
    )
  })
}

/** Image -> Canvas JPEG conversion + resize, returns base64 data URL */
export function compressImage(blob: Blob, maxDim = 1600, quality = 0.8): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      let { width, height } = img
      if (width > maxDim || height > maxDim) {
        const ratio = Math.min(maxDim / width, maxDim / height)
        width = Math.round(width * ratio)
        height = Math.round(height * ratio)
      }
      const canvas = document.createElement("canvas")
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext("2d")!
      ctx.drawImage(img, 0, 0, width, height)
      resolve(canvas.toDataURL("image/jpeg", quality))
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error("이미지를 읽을 수 없습니다."))
    }
    img.src = url
  })
}

/** Create thumbnail URL - HEIC files are converted first */
export async function createThumbnailUrl(file: File): Promise<string> {
  if (isHeicFile(file)) {
    const normalized = await normalizeFile(file)
    return URL.createObjectURL(normalized)
  }
  return URL.createObjectURL(file)
}

/** Revoke all Object URLs to prevent memory leaks */
export function revokeThumbnailUrls(images: ImportImage[]): void {
  images.forEach((img) => URL.revokeObjectURL(img.thumbnailUrl))
}
