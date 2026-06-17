/* ===================================================================
   SHRI RAM CHANDRA PARAMEDICAL COLLEGE — SCRIPT
   Handles: mobile nav, admission modals, contact form, and
   the built-in "Edit Mode" that lets anyone update text/images
   directly on the page (saved in this browser via localStorage).
   =================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Mobile nav ---------- */
  const burger = document.getElementById('navBurger');
  const nav = document.getElementById('mainNav');
  if (burger && nav) {
    burger.addEventListener('click', () => nav.classList.toggle('open'));
    nav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => nav.classList.remove('open'));
    });
  }

  /* ---------- Admission modals ---------- */
  const dmltBtn = document.querySelector('[data-open-modal="dmlt"]');
  const bmltBtn = document.querySelector('[data-open-modal="bmlt"]');
  const dmltOverlay = document.getElementById('modalOverlay');
  const bmltOverlay = document.getElementById('modalOverlayBmlt');

  function openOverlay(el){ if(el) el.classList.add('open'); }
  function closeOverlay(el){ if(el) el.classList.remove('open'); }

  if (dmltBtn) dmltBtn.addEventListener('click', () => openOverlay(dmltOverlay));
  if (bmltBtn) bmltBtn.addEventListener('click', () => openOverlay(bmltOverlay));

  document.querySelectorAll('[data-close-modal]').forEach(btn => {
    btn.addEventListener('click', () => {
      closeOverlay(dmltOverlay);
      closeOverlay(bmltOverlay);
    });
  });
  [dmltOverlay, bmltOverlay].forEach(overlay => {
    if (!overlay) return;
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.classList.remove('open');
    });
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { closeOverlay(dmltOverlay); closeOverlay(bmltOverlay); }
  });

  /* ---------- Contact form (demo submit) ---------- */
  const form = document.getElementById('contactForm');
  const formNote = document.getElementById('formNote');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = form.querySelector('[name="name"]').value.trim();
      if (formNote) {
        formNote.textContent = `Thanks${name ? ', ' + name : ''} — your enquiry has been noted. We'll get back to you within 1–2 working days.`;
        formNote.style.color = '#0E5F56';
        formNote.style.fontWeight = '600';
      }
      form.reset();
      // NOTE FOR DEVELOPER: This currently only shows a confirmation message.
      // To actually receive enquiries, connect this form to an email service
      // (e.g. Formspree, EmailJS) or a backend endpoint and POST the form data there.
    });
  }

  /* =================================================================
     EDIT MODE
     Toggle button (bottom-right) turns on contenteditable for every
     element marked data-editable, and click-to-replace for every
     element marked data-editable-img. Changes are saved to this
     browser's localStorage and reloaded automatically next visit.
     This is meant for the site owner to use on their own device.
     For permanent multi-device editing, hand edited HTML to your
     developer or hook this up to a backend.
     ================================================================= */

  const STORAGE_KEY = 'srcpc_site_edits_v1';
  const body = document.body;
  const toggleBtn = document.getElementById('editModeToggle');

  // Give every editable node a stable id based on its position in the DOM
  function assignIds() {
    document.querySelectorAll('[data-editable]').forEach((el, i) => {
      if (!el.dataset.editId) el.dataset.editId = 'txt-' + i;
    });
    document.querySelectorAll('[data-editable-img]').forEach((el, i) => {
      if (!el.dataset.editId) el.dataset.editId = 'img-' + i;
    });
  }
  assignIds();

  function loadEdits() {
    let saved;
    try {
      saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    } catch (err) {
      saved = {};
    }
    Object.entries(saved).forEach(([id, value]) => {
      const el = document.querySelector(`[data-edit-id="${id}"]`);
      if (!el) return;
      if (el.hasAttribute('data-editable-img')) {
        applyImage(el, value);
      } else {
        el.innerHTML = value;
      }
    });
  }

  function applyImage(el, src) {
    el.innerHTML = '';
    const img = document.createElement('img');
    img.src = src;
    img.alt = '';
    el.appendChild(img);
  }

  function saveEdit(id, value) {
    let saved;
    try {
      saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    } catch (err) {
      saved = {};
    }
    saved[id] = value;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
  }

  function setEditMode(on) {
    body.classList.toggle('edit-mode', on);
    document.querySelectorAll('[data-editable]').forEach(el => {
      el.setAttribute('contenteditable', on ? 'true' : 'false');
    });
    if (toggleBtn) {
      toggleBtn.querySelector('.edit-toggle-label').textContent = on ? 'Edit Mode: ON' : 'Edit Mode: OFF';
    }
    localStorage.setItem('srcpc_edit_mode_on', on ? '1' : '0');
  }

  // Save text edits as the user types (debounced via 'blur' + 'input')
  document.querySelectorAll('[data-editable]').forEach(el => {
    el.addEventListener('input', () => {
      saveEdit(el.dataset.editId, el.innerHTML);
    });
  });

  // Click an image placeholder in edit mode to upload a replacement
  document.querySelectorAll('[data-editable-img]').forEach(el => {
    el.addEventListener('click', () => {
      if (!body.classList.contains('edit-mode')) return;
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.addEventListener('change', () => {
        const file = input.files && input.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
          applyImage(el, e.target.result);
          saveEdit(el.dataset.editId, e.target.result);
        };
        reader.readAsDataURL(file);
      });
      input.click();
    });
  });

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      setEditMode(!body.classList.contains('edit-mode'));
    });
  }

  // Restore saved content + last edit-mode state on load
  loadEdits();
  setEditMode(localStorage.getItem('srcpc_edit_mode_on') === '1');

});
