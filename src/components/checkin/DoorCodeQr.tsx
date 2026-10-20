import { useEffect, useState } from "react";
import QRCode from "qrcode";

const DoorCodeQr = ({ code }: { code: string }) => {
  const [src, setSrc] = useState("");

  useEffect(() => {
    let cancel = false;
    QRCode.toDataURL(code, {
      margin: 1,
      width: 112,
      errorCorrectionLevel: "M",
    }).then((url) => {
      if (!cancel) setSrc(url);
    });
    return () => {
      cancel = true;
    };
  }, [code]);

  if (!src) return null;
  return (
    <img
      src={src}
      alt={`QR for ${code}`}
      width={56}
      height={56}
      className="rounded bg-white p-0.5"
    />
  );
};

export default DoorCodeQr;
