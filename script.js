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

// Highlight the visible section in the sticky navigation.
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navigation.querySelectorAll('a').forEach((link) => {
        if (link.getAttribute('href') === `#${entry.target.id}`) {
          link.setAttribute('aria-current', 'location');
        } else {
          link.removeAttribute('aria-current');
        }
      });
    });
  }, { rootMargin: '-15% 0px -60% 0px', threshold: 0 });
  document.querySelectorAll('main section[id]').forEach((section) => observer.observe(section));
}

document.querySelector('#year').textContent = new Date().getFullYear();
