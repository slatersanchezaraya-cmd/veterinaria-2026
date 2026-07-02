// Analítica y captura de leads — Clínica Veterinaria Mr. Patitas
//
// Este archivo concentra los ÚNICOS dos valores que hay que editar para
// activar la analítica y el mini-CRM. Mientras queden vacíos ("") no se
// envía nada a ningún lado y el sitio funciona igual que antes.
//
// 1) GA_MEASUREMENT_ID: creá una propiedad gratis en https://analytics.google.com
//    (Admin > Crear propiedad > Flujo de datos web). Te da un ID tipo "G-XXXXXXXXXX".
// 2) LEADS_WEBAPP_URL: URL del Google Apps Script que guarda cada envío del
//    formulario de contacto en una Google Sheet. Ver apps-script-leads.gs
//    en la raíz del proyecto para el código y los pasos de instalación.

const GA_MEASUREMENT_ID = "";
const LEADS_WEBAPP_URL = "";

(function initGoogleAnalytics() {
  if (!GA_MEASUREMENT_ID) return;

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() { window.dataLayer.push(arguments); };
  window.gtag("js", new Date());
  window.gtag("config", GA_MEASUREMENT_ID);
})();

// Envía un evento a Analytics si ya está configurado; si no, no hace nada.
// Así el resto del sitio puede llamar trackEvent() siempre, sin comprobar
// primero si la analítica está activa.
function trackEvent(name, params) {
  if (typeof window.gtag === "function") {
    window.gtag("event", name, params || {});
  }
}

// Envía los datos del formulario a la Google Sheet (fire-and-forget). Usa
// no-cors porque Apps Script no responde con headers CORS: no podemos leer
// la respuesta, pero el envío igual llega y queda guardado en la hoja.
function sendLeadToSheet(data) {
  if (!LEADS_WEBAPP_URL) return;
  fetch(LEADS_WEBAPP_URL, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "text/plain" },
    body: JSON.stringify(data),
  }).catch(() => {});
}
