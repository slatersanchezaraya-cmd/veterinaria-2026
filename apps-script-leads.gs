// Mini-CRM: guarda cada envío del formulario de contacto en esta misma
// Google Sheet, además de abrirse WhatsApp como ya hacía el sitio.
//
// INSTALACIÓN
// 1. Creá una Google Sheet nueva. En la primera fila poné los encabezados:
//    Fecha | Nombre | Teléfono | Motivo | Mensaje
// 2. Extensiones > Apps Script.
// 3. Borrá el contenido de Code.gs y pegá este archivo completo.
// 4. Guardá (ícono de disquete).
// 5. Implementar > Nueva implementación > tipo "Aplicación web".
//    - Ejecutar como: Yo (tu cuenta)
//    - Quién tiene acceso: Cualquier usuario
// 6. Autorizá los permisos que pida Google (es tu propia hoja, es normal).
// 7. Copiá la URL que termina en /exec.
// 8. Pegá esa URL en js/analytics.js, en la constante LEADS_WEBAPP_URL.
//
// Cada vez que alguien complete el formulario de contacto del sitio,
// aparece como una fila nueva acá, con fecha y hora.

function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = JSON.parse(e.postData.contents);

  sheet.appendRow([
    new Date(),
    data.nombre || "",
    data.telefono || "",
    data.motivo || "",
    data.mensaje || "",
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({ status: "ok" }))
    .setMimeType(ContentService.MimeType.JSON);
}
