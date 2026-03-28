import QRCode from "qrcode";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://neo-id.com";

export function getProfileUrl(slug: string): string {
  return `${BASE_URL}/p/${slug}`;
}

export async function generateQRCodeSvg(slug: string): Promise<string> {
  const url = getProfileUrl(slug);
  return QRCode.toString(url, {
    type: "svg",
    errorCorrectionLevel: "M",
    margin: 1,
    color: {
      dark: "#000000",
      light: "#00000000", // transparent background
    },
  });
}

export async function generateQRCodePng(
  slug: string,
  size = 400,
): Promise<Buffer> {
  const url = getProfileUrl(slug);
  return QRCode.toBuffer(url, {
    type: "png",
    errorCorrectionLevel: "M",
    width: size,
    margin: 1,
  });
}
