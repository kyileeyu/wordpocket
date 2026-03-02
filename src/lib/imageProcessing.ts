import type { ImportImage } from "@/types/photo-import"

/** HEIC -> JPEG Blob conversion (dynamic import) */
export async function normalizeFile(file: File): Promise<Blob> {
  const isHeic =
    ["image/heic", "image/heif"].includes(file.type) ||
    /\.heic$/i.test(file.name)
  if (isHeic) {
    const { default: heic2any } = await import("heic2any")
    const result = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.8 })
    return Array.isArray(result) ? result[0] : result
  }
  return file
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

/** Create Object URL thumbnail for an image file */
export function createThumbnailUrl(file: File): string {
  return URL.createObjectURL(file)
}

/** Revoke all Object URLs to prevent memory leaks */
export function revokeThumbnailUrls(images: ImportImage[]): void {
  images.forEach((img) => URL.revokeObjectURL(img.thumbnailUrl))
}
