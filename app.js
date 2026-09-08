(() => {
  const root = document.documentElement;
  const header = document.querySelector("[data-header]");
  const themeToggle = document.querySelector("[data-theme-toggle]");
  const menuToggle = document.querySelector("[data-menu-toggle]");
  const mobileNav = document.querySelector("[data-mobile-nav]");
  const form = document.querySelector("[data-contact-form]");
  const year = document.querySelector("[data-year]");

  let theme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  root.dataset.theme = theme;

  const themeIcons = {
    light:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>',
    dark:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v2m0 14v2M3 12h2m14 0h2M5.64 5.64l1.42 1.42m9.88 9.88 1.42 1.42m0-12.72-1.42 1.42M7.06 16.94l-1.42 1.42"/><circle cx="12" cy="12" r="4"/></svg>'
  };

  const updateThemeButton = () => {
    if (!themeToggle) return;
    themeToggle.innerHTML = themeIcons[theme];
    themeToggle.setAttribute(
      "aria-label",
      theme === "dark" ? "Włącz jasny motyw" : "Włącz ciemny motyw"
    );
  };

  updateThemeButton();

  themeToggle?.addEventListener("click", () => {
    theme = theme === "dark" ? "light" : "dark";
    root.dataset.theme = theme;
    updateThemeButton();
  });

  window.addEventListener(
    "scroll",
    () => header?.classList.toggle("is-scrolled", window.scrollY > 8),
    { passive: true }
  );

  const closeMenu = () => {
    if (!menuToggle || !mobileNav) return;
    menuToggle.setAttribute("aria-expanded", "false");
    mobileNav.hidden = true;
  };

  menuToggle?.addEventListener("click", () => {
    const open = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!open));
    mobileNav.hidden = open;
  });

  mobileNav?.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));

  const setError = (name, message) => {
    const field = form?.elements.namedItem(name);
    const error = form?.querySelector(`[data-error-for="${name}"]`);
    if (field instanceof HTMLElement) field.setAttribute("aria-invalid", message ? "true" : "false");
    if (error) error.textContent = message;
  };

  form?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const name = String(data.get("name") || "").trim();
    const email = String(data.get("email") || "").trim();
    const business = String(data.get("business") || "").trim();
    const message = String(data.get("message") || "").trim();
    const consent = data.get("consent");
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    setError("name", name ? "" : "Podaj imię i nazwisko.");
    setError("email", emailPattern.test(email) ? "" : "Podaj poprawny adres e-mail.");
    setError("business", business ? "" : "Wybierz rodzaj działalności.");
    setError("message", message ? "" : "Napisz krótko, czego potrzebujesz.");
    setError("consent", consent ? "" : "Zaznacz zgodę, aby wysłać zapytanie.");

    if (!name || !emailPattern.test(email) || !business || !message || !consent) {
      form.querySelector('[aria-invalid="true"]')?.focus();
      return;
    }

    const submitButton = form.querySelector(".form-submit");
    const status = form.querySelector("[data-form-status]");
    if (!(submitButton instanceof HTMLButtonElement) || !status) return;

    submitButton.disabled = true;
    submitButton.textContent = "Wysyłanie…";
    status.className = "form-status";
    status.textContent = "Wysyłam wiadomość…";

    try {
      const response = await fetch(form.action, {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" }
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || result.success === false) throw new Error("Wysyłka nie powiodła się.");

      form.reset();
      status.className = "form-status is-success";
      status.textContent = "Dziękuję. Twoje zapytanie zostało wysłane. Odpowiem najszybciej, jak to możliwe.";
    } catch {
      status.className = "form-status is-error";
      status.innerHTML =
        'Nie udało się wysłać formularza. Napisz na <a href="mailto:ewastoeckwitkowska@gmail.com">ewastoeckwitkowska@gmail.com</a> lub zadzwoń: <a href="tel:+48605450552">605 450 552</a>.';
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = "Wyślij zapytanie";
    }
  });

  if (year) year.textContent = String(new Date().getFullYear());
})();
