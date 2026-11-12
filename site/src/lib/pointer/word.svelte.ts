/**
 * THE WORD AT THE POINTER
 *
 * Over some things the pointer is hidden and a word takes its place,
 * following it: the word says what a click does there (Open, Close,
 * Previous, Next). Mouse only: a finger has no pointer to replace.
 *
 *   <button use:word={'Open'}>          the word over this element
 *   <button use:word={shown ? 'Close' : ''}>   '' = the ordinary pointer
 *   <PointerWord />                     once on the page: it draws the word
 */
export const pointer = $state({word: '', x: 0, y: 0});

export function word(node: HTMLElement, name: string) {
  let over = false;
  const set = () => {
    node.style.cursor = name ? 'none' : '';
    if (over) pointer.word = name;
  };
  const follow = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse') return;
    over = true;
    pointer.x = e.clientX;
    pointer.y = e.clientY;
    pointer.word = name;
  };
  const leave = () => {
    if (over) pointer.word = '';
    over = false;
  };
  set();
  node.addEventListener('pointerenter', follow);
  node.addEventListener('pointermove', follow);
  node.addEventListener('pointerleave', leave);
  return {
    update(next: string) {
      name = next;
      set();
    },
    destroy() {
      leave();
      node.removeEventListener('pointerenter', follow);
      node.removeEventListener('pointermove', follow);
      node.removeEventListener('pointerleave', leave);
    }
  };
}
