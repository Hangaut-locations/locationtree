import { Info } from "lucide-react";

/** Matches KEEP_UNSAVED_HOURS in the API's media cleanup. */
const UploadsNote = () => (
  <p className="flex items-start gap-2 rounded-2xl bg-muted/60 px-4 py-3 text-xs leading-5 text-muted-foreground">
    <Info className="mt-0.5 h-4 w-4 shrink-0" />
    <span>
      Tap <span className="font-semibold text-foreground">Save & Exit</span>{" "}
      anytime to keep your progress. Photos and videos that aren't saved on
      a listing within 7 days get deleted.
    </span>
  </p>
);

export default UploadsNote;
