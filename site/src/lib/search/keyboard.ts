/**
 * SEARCH — the keyboard, on phones
 *
 * The search field is ready to type in on arriving (search/+page.svelte).
 * An iPhone lets a page put the caret in a field — and bring its keyboard
 * up — only straight from a tap; by the time the search page is there,
 * the tap on "Search" in the menu is over. But once a keyboard is up,
 * the caret may go from one field to another.
 *
 * So: `ready()` in the tap itself puts the caret in a field nobody sees
 * (the keyboard comes up); `take(field)`, once the search field is there,
 * moves it there. If the search page never comes, the unseen field goes
 * away by itself, and the keyboard with it.
 *
 * Only where fingers do the pointing: with a mouse the search page
 * simply focuses its field.
 */
let stand: HTMLInputElement | undefined;
let giveUp: ReturnType<typeof setTimeout>;

const away = () => {
  clearTimeout(giveUp);
  stand?.remove();
  stand = undefined;
};

/** In the tap that leads to the search */
export function ready() {
  if (!matchMedia('(pointer: coarse)').matches || stand) return;
  stand = document.createElement('input');
  stand.type = 'text';
  stand.inputMode = 'search'; // the same keyboard as the search field's
  stand.enterKeyHint = 'search';
  stand.tabIndex = -1;
  stand.setAttribute('aria-hidden', 'true');
  // On the screen (a field out of it is not given the caret), unseen;
  // 16px: smaller, and the iPhone zooms in on it
  stand.style.cssText =
    'position:fixed;top:0;left:0;width:1px;height:1px;padding:0;border:0;opacity:0;font-size:16px;pointer-events:none';
  document.body.append(stand);
  stand.focus({preventScroll: true});
  giveUp = setTimeout(away, 3000);
}

/** The search field is there: the caret goes to it */
export function take(field: HTMLElement | undefined) {
  field?.focus({preventScroll: true});
  away();
}
