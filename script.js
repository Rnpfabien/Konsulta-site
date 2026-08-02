/* ============================================================
   KONSULTA — SCRIPT DU SITE
   ------------------------------------------------------------
   Aucune dépendance externe. Chaque bloc gère une seule
   interaction, commentée pour être facilement modifiée.
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ----------------------------------------------------------
     1) MENU MOBILE (hamburger)
     Ouvre/ferme la navigation sur petit écran et se referme
     automatiquement après un clic sur un lien.
  ---------------------------------------------------------- */
  const navToggle = document.getElementById('navToggle');
  const primaryNav = document.getElementById('primaryNav');

  if (navToggle && primaryNav) {
    navToggle.addEventListener('click', () => {
      const isOpen = primaryNav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });

    // Referme le menu une fois qu'on a cliqué sur un lien (mobile)
    primaryNav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        primaryNav.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ----------------------------------------------------------
     2) ACCORDÉON FAQ
     Un seul panneau ouvert à la fois. La hauteur est calculée
     dynamiquement pour permettre une transition en douceur.
  ---------------------------------------------------------- */
  const accordion = document.getElementById('accordion');

  if (accordion) {
    const triggers = accordion.querySelectorAll('.accordion-trigger');

    triggers.forEach((trigger) => {
      trigger.addEventListener('click', () => {
        const panel = trigger.nextElementSibling;
        const isOpen = trigger.getAttribute('aria-expanded') === 'true';

        // Referme tous les autres panneaux (accordéon "un seul à la fois")
        triggers.forEach((otherTrigger) => {
          if (otherTrigger !== trigger) {
            otherTrigger.setAttribute('aria-expanded', 'false');
            otherTrigger.nextElementSibling.style.maxHeight = null;
          }
        });

        // Bascule le panneau cliqué
        trigger.setAttribute('aria-expanded', String(!isOpen));
        panel.style.maxHeight = isOpen ? null : `${panel.scrollHeight}px`;
      });
    });
  }

  /* ----------------------------------------------------------
     3) ANIMATION D'APPARITION AU DÉFILEMENT
     Ajoute la classe .is-visible quand un élément .reveal entre
     dans l'écran. Respecte la préférence "moins d'animations".
  ---------------------------------------------------------- */
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Marque les blocs à animer (titres de section + cartes)
  document.querySelectorAll(
    '.feature-card, .screenshot-card, .tutorial-card, .presentation-grid, .mini-points li'
  ).forEach((el) => el.classList.add('reveal'));

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    // Si l'animation est désactivée (ou non supportée), on affiche tout directement
    document.querySelectorAll('.reveal').forEach((el) => el.classList.add('is-visible'));
  } else {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target); // n'anime qu'une seule fois
          }
        });
      },
      { threshold: 0.15 }
    );

    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
  }

  /* ----------------------------------------------------------
     4) FORMULAIRE DE CONTACT
     Envoi en AJAX vers Formspree (si configuré) pour rester sur
     la page ; repli automatique vers un e-mail pré-rempli si
     Formspree n'a pas encore été configuré (action="...YOUR_FORM_ID").
  ---------------------------------------------------------- */
  const contactForm = document.getElementById('contactForm');
  const formStatus = document.getElementById('formStatus');

  if (contactForm) {
    contactForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      const formAction = contactForm.getAttribute('action') || '';
      const name = contactForm.name.value.trim();
      const email = contactForm.email.value.trim();
      const message = contactForm.message.value.trim();

      // Repli : Formspree n'a pas encore été configuré par l'utilisateur du site
      if (formAction.includes('YOUR_FORM_ID')) {
        const subject = encodeURIComponent(`Contact depuis le site Konsulta — ${name}`);
        const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`);
        window.location.href = `mailto:rnpfabien@gmail.com?subject=${subject}&body=${body}`;
        formStatus.textContent = "Ouverture de votre messagerie… (configurez Formspree pour un envoi direct depuis le site)";
        formStatus.classList.remove('error');
        return;
      }

      // Envoi réel via Formspree
      formStatus.textContent = 'Envoi en cours…';
      formStatus.classList.remove('error');

      try {
        const response = await fetch(formAction, {
          method: 'POST',
          body: new FormData(contactForm),
          headers: { 'Accept': 'application/json' },
        });

        if (response.ok) {
          formStatus.textContent = 'Message envoyé — merci, nous revenons vers vous rapidement !';
          contactForm.reset();
        } else {
          throw new Error('Réponse du serveur non valide');
        }
      } catch (error) {
        formStatus.textContent = "Erreur d'envoi. Écrivez-nous directement à rnpfabien@gmail.com.";
        formStatus.classList.add('error');
      }
    });
  }

  /* ----------------------------------------------------------
     5) ANNÉE COURANTE DANS LE PIED DE PAGE
  ---------------------------------------------------------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

});
