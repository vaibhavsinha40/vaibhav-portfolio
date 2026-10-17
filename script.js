/* VAIBHAV PORTFOLIO
   Menu, independent filter groups, accessible dialogs, and active navigation.
   All content stays in index.html so you can edit it directly in VS Code. */
const menuButton = document.querySelector('.menu');
const navigation = document.querySelector('#navigation');

function closeMenu() {
  navigation.classList.remove('open');
  menuButton.setAttribute('aria-expanded', 'false');
}

menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(open));
  navigation.classList.toggle('open', open);
});
navigation.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', closeMenu);
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeMenu();
});

// Project and writing filters are independent: one never changes the other.
document.querySelectorAll('[data-filter-group]').forEach((button) => {
  button.addEventListener('click', () => {
    const group = button.dataset.filterGroup;
    document.querySelectorAll(`[data-filter-group="${group}"]`).forEach((item) => {
      item.setAttribute('aria-pressed', String(item === button));
    });
    document.querySelectorAll(`[data-card-group="${group}"] > article`).forEach((card) => {
      card.hidden = button.dataset.filter !== 'all' && card.dataset.category !== button.dataset.filter;
    });
  });
});

// Native <dialog> provides modal focus containment and Escape-to-close.
// Store the opener and restore its focus so keyboard navigation is predictable.
const dialogOpeners = new WeakMap();
function openReader(dialog, opener) {
  dialogOpeners.set(dialog, opener);
  dialog.showModal();
  dialog.scrollTop = 0;
  document.body.classList.add('modal-open');
}
document.querySelectorAll('[data-open]').forEach((button) => {
  button.addEventListener('click', () => {
    const dialog = document.querySelector(`#dialog-${button.dataset.open}`);
    if (dialog) openReader(dialog, button);
  });
});

// All three supplied travel photographs can be enlarged.
const photoViewer = document.querySelector('#photo-viewer');
const largePhoto = document.querySelector('#large-photo');
document.querySelectorAll('[data-photo]').forEach((button) => {
  button.addEventListener('click', () => {
    largePhoto.src = button.dataset.photo;
    largePhoto.alt = button.querySelector('img').alt;
    document.querySelector('#photo-caption').textContent = button.dataset.caption;
    openReader(photoViewer, button);
  });
});

document.querySelectorAll('dialog').forEach((dialog) => {
  dialog.querySelector('.close-dialog').addEventListener('click', () => dialog.close());
  // Only a press and release outside the dialog counts as a backdrop click.
  let pressedOutside = false;
  const isOutside = (event) => {
    const box = dialog.getBoundingClientRect();
    return event.clientX < box.left || event.clientX > box.right ||
      event.clientY < box.top || event.clientY > box.bottom;
  };
  dialog.addEventListener('pointerdown', (event) => {
    pressedOutside = isOutside(event);
  });
  dialog.addEventListener('click', (event) => {
    if (pressedOutside && isOutside(event)) dialog.close();
    pressedOutside = false;
  });
  dialog.addEventListener('close', () => {
    document.body.classList.remove('modal-open');
    const opener = dialogOpeners.get(dialog);
    if (opener) opener.focus({ preventScroll: true });
  });
});

// Highlight the last menu section that has reached the sticky header.
// Home remains active throughout the opening area, including the approach cards.
const sectionLinks = Array.from(navigation.querySelectorAll('a[href^="#"]'));
const menuSections = sectionLinks.map((link) => ({
  link,
  section: document.querySelector(link.getAttribute('href'))
})).filter((item) => item.section);
const siteHeader = document.querySelector('header');
function updateActiveNavigation() {
  const activationLine = siteHeader.getBoundingClientRect().bottom + 20;
  let current = menuSections[0];
  for (const item of menuSections) {
    if (item.section.getBoundingClientRect().top <= activationLine) current = item;
  }
  for (const item of menuSections) {
    if (item === current) item.link.setAttribute('aria-current', 'location');
    else item.link.removeAttribute('aria-current');
  }
}
let navigationFramePending = false;
function scheduleNavigationUpdate() {
  if (navigationFramePending) return;
  navigationFramePending = true;
  requestAnimationFrame(() => {
    navigationFramePending = false;
    updateActiveNavigation();
  });
}
window.addEventListener('scroll', scheduleNavigationUpdate, { passive: true });
window.addEventListener('resize', scheduleNavigationUpdate);
window.addEventListener('load', scheduleNavigationUpdate);
window.addEventListener('hashchange', scheduleNavigationUpdate);
updateActiveNavigation();

document.querySelector('#year').textContent = new Date().getFullYear();
