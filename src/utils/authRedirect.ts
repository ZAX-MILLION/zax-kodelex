export function openAuthModal() {
  window.dispatchEvent(new CustomEvent('open-auth-modal'));
}

export function redirectToLogin() {
  openAuthModal();
  if (window.location.pathname !== '/') {
    window.location.href = '/';
  }
}
