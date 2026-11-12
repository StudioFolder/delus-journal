/**
 * STEPS — one scroll gesture = one step, however long the trackpad keeps
 * sending movement: a new step needs a pause first. For what moves by
 * whole steps under the wheel: the highlights of the home page, the
 * gallery of an issue.
 *
 *   const stepper = steps((dir) => go(dir));   // dir: 1 forwards, -1 back
 *   <… onwheel={stepper.wheel}>                // or call it from a handler
 *   onDestroy(stepper.stop);
 */

/** How far a gesture must travel to count as a step (px): the wheel, a swipe */
export const STEP = 40;
/** How long without movement ends a gesture (ms) */
const PAUSE = 150;

export function steps(go: (dir: 1 | -1) => void) {
  let travelled = 0;
  let used = false;
  let pause: ReturnType<typeof setTimeout>;
  return {
    wheel(e: WheelEvent) {
      clearTimeout(pause);
      pause = setTimeout(() => {
        travelled = 0;
        used = false;
      }, PAUSE);
      if (used) return;
      travelled += e.deltaY;
      if (Math.abs(travelled) < STEP) return;
      used = true;
      go(travelled > 0 ? 1 : -1);
    },
    stop: () => clearTimeout(pause)
  };
}
