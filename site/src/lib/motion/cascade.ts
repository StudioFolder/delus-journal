/**
 * CASCADE
 *
 * Put `use:cascade` on a container: each child gets an index (--i: 0, 1, 2…)
 * in reading order. Children with the `fade` class then appear one after
 * another (see .fade in styles.css), left to right, once the band has
 * finished moving. Works for any group: menus, lists, rows of credits…
 */
export function cascade(node: HTMLElement) {
  const number = () => {
    Array.from(node.children).forEach((child, i) => {
      (child as HTMLElement).style.setProperty('--i', String(i));
    });
  };
  number();
  const observer = new MutationObserver(number);
  observer.observe(node, {childList: true});
  return {destroy: () => observer.disconnect()};
}
