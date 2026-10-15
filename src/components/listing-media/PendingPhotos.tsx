import type { PendingPhoto } from "../hooks/useListingMedia";

/** Photos still uploading, shown after the ones that are done. */
const PendingPhotos = ({ pending }: { pending: PendingPhoto[] }) =>
  pending.map((photo) => (
    <div
      key={photo.id}
      className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-sm"
    >
      <img
        src={photo.preview}
        alt="Uploading"
        className="aspect-4/3 w-full object-cover opacity-60"
      />
      <div className="absolute inset-x-4 bottom-4">
        <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-white drop-shadow">
          Uploading {Math.round(photo.progress * 100)}%
        </p>
        <div className="h-1.5 overflow-hidden rounded-full bg-white/40">
          <div
            className="h-full rounded-full bg-white transition-[width] duration-300"
            style={{ width: `${Math.round(photo.progress * 100)}%` }}
          />
        </div>
      </div>
    </div>
  ));

export default PendingPhotos;
