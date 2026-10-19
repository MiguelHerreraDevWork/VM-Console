type NavigatorFn = (href: string) => void;

let navigateFn: NavigatorFn | null = null;

export function registerDraftNavigator(fn: NavigatorFn) {
  navigateFn = fn;
  return () => {
    if (navigateFn === fn) {
      navigateFn = null;
    }
  };
}

/** Navegación cliente para no destruir el borrador en memoria. */
export function navigatePreservingDraft(href: string) {
  if (navigateFn) {
    navigateFn(href);
    return;
  }
  window.location.assign(href);
}
