import { ImagePlus, Plus, Upload, X } from "lucide-react";
import type { ChangeEvent, Dispatch, SetStateAction } from "react";

interface IStepFiveProps {
  photos: string[];
  setPhotos: Dispatch<SetStateAction<string[]>>;
}

const StepSeven: React.FC<IStepFiveProps> = ({ photos, setPhotos }) => {
  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;

    if (!files || files.length === 0) return;

    const imageFiles = Array.from(files).filter((file) =>
      file.type.startsWith("image/"),
    );

    const readers = imageFiles.map(
      (file) =>
        new Promise<string>((resolve, reject) => {
          const reader = new FileReader();

          reader.onload = () => {
            if (typeof reader.result === "string") {
              resolve(reader.result);
            }
          };

          reader.onerror = reject;
          reader.readAsDataURL(file);
        }),
    );

    Promise.all(readers)
      .then((newPhotos) => {
        setPhotos((prev) => [...prev, ...newPhotos]);
      })
      .catch((error) => {
        console.error("Failed to upload images:", error);
      });

    // Allows the user to select the same file again
    event.target.value = "";
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, photoIndex) => photoIndex !== index));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-sm font-bold text-purple-600">Step 6</p>

        <h2 className="mt-1 text-2xl font-bold text-foreground">
          Add some photos of your place
        </h2>

        <p className="mt-2 text-sm text-muted-foreground">
          Showcase the atmosphere, layout, and highlights in a polished gallery.
        </p>
      </div>

      {/* Hidden file input */}
      <input
        id="place-photos"
        type="file"
        accept="image/*"
        multiple
        onChange={handleImageUpload}
        className="hidden"
      />

      {/* Empty State */}
      {photos.length === 0 ? (
        <label
          htmlFor="place-photos"
          className="flex min-h-72 w-full cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-border bg-card px-6 py-10 text-center transition-all hover:border-purple-400 hover:bg-purple-50/50 dark:hover:bg-purple-950/20"
        >
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-100 text-purple-600 dark:bg-purple-900/40">
            <ImagePlus className="h-6 w-6" />
          </div>

          <h3 className="text-sm font-bold text-foreground">
            No photos added yet
          </h3>

          <p className="mt-1 max-w-xs text-xs leading-5 text-muted-foreground">
            Add clear photos of your place to help guests get a feel for the
            atmosphere and space.
          </p>

          <span
            className="
              mt-5
              inline-flex
              items-center
              gap-2
              rounded-full
              bg-purple-950
              px-5
              py-3
              text-xs
              font-bold
              text-white
              shadow-sm
              transition-transform
              hover:scale-[1.02]
              dark:bg-purple-800
            "
          >
            <Upload className="h-4 w-4" />
            Upload photos
          </span>
        </label>
      ) : (
        <>
          {/* Photo Gallery */}
          <div className="grid grid-cols-2 gap-4">
            {photos.map((photo, index) => (
              <div
                key={`${photo}-${index}`}
                className="
                  group
                  relative
                  overflow-hidden
                  rounded-3xl
                  border
                  border-border
                  bg-card
                  shadow-sm
                "
              >
                <img
                  src={photo}
                  alt={`Preview ${index + 1}`}
                  className="
                    aspect-4/3
                    w-full
                    object-cover
                    transition-transform
                    duration-300
                    group-hover:scale-105
                  "
                />

                <div
                  className="
                    absolute
                    inset-0
                    bg-linear-to-t
                    from-black/60
                    via-transparent
                    to-transparent
                  "
                />

                <span
                  className="
                    absolute
                    left-3
                    top-3
                    rounded-full
                    bg-white/90
                    px-3
                    py-1
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-[0.2em]
                    text-foreground
                  "
                >
                  Photo {index + 1}
                </span>

                {/* Remove photo */}
                <button
                  type="button"
                  onClick={() => removePhoto(index)}
                  className="
                    absolute
                    right-3
                    top-3
                    flex
                    h-8
                    w-8
                    items-center
                    justify-center
                    rounded-full
                    bg-black/60
                    text-white
                    opacity-0
                    backdrop-blur-sm
                    transition-all
                    group-hover:opacity-100
                    hover:bg-red-600
                  "
                  aria-label={`Remove photo ${index + 1}`}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Add More */}
          <label
            htmlFor="place-photos"
            className="flex w-fit cursor-pointer items-center justify-center gap-2 rounded-full border border-dashed border-border bg-card px-5 py-3 text-sm font-bold text-foreground transition-colors hover:bg-muted"
          >
            <Plus className="h-4 w-4" />
            Add more photos
          </label>
        </>
      )}
    </div>
  );
};

export default StepSeven;
