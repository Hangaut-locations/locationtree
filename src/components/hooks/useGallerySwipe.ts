import { useRef, type TouchEvent } from "react";

const SWIPE_PX = 40;

/** Left/right finger swipe to change photos. Tap still opens full screen. */
const useGallerySwipe = (
  enabled: boolean,
  goToImage: (direction: number) => void,
) => {
  const startX = useRef<number | null>(null);
  const swiped = useRef(false);

  const onTouchStart = (event: TouchEvent) => {
    if (!enabled) return;
    startX.current = event.touches[0]?.clientX ?? null;
    swiped.current = false;
  };

  const onTouchMove = (event: TouchEvent) => {
    if (startX.current == null || !enabled) return;
    const x = event.touches[0]?.clientX;
    if (x == null) return;
    if (Math.abs(x - startX.current) > 10) {
      swiped.current = true;
      event.stopPropagation();
    }
  };

  const onTouchEnd = (event: TouchEvent) => {
    if (startX.current == null || !enabled) return;
    const endX = event.changedTouches[0]?.clientX;
    const dx = endX == null ? 0 : endX - startX.current;
    startX.current = null;
    if (Math.abs(dx) < SWIPE_PX) return;
    swiped.current = true;
    event.stopPropagation();
    goToImage(dx < 0 ? 1 : -1);
  };

  const onTouchCancel = () => {
    startX.current = null;
  };

  /** Call at the start of the photo tap handler so a swipe does not open the viewer. */
  const consumeSwipe = () => {
    if (!swiped.current) return false;
    swiped.current = false;
    return true;
  };

  return {
    swipeProps: {
      onTouchStart,
      onTouchMove,
      onTouchEnd,
      onTouchCancel,
      style: enabled ? ({ touchAction: "pan-y" } as const) : undefined,
    },
    consumeSwipe,
  };
};

export default useGallerySwipe;
