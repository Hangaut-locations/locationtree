declare module "qrcode" {
  const QRCode: {
    toDataURL: (
      text: string,
      options?: {
        margin?: number;
        width?: number;
        errorCorrectionLevel?: "L" | "M" | "Q" | "H";
      },
    ) => Promise<string>;
  };
  export default QRCode;
}
