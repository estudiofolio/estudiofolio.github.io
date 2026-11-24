/*
 * Folio · Hoja a página
 * El dueño cambia el menú o los precios en una hoja de Google y la página se actualiza sola.
 * La hoja se publica como CSV (Archivo → Compartir → Publicar en la Web → la pestaña → Valores separados por comas).
 * Uso:  leerHojaFolio(URL_CSV).then(filas => ...)   // filas = [{columna: valor, ...}, ...]
 * La primera fila de la hoja son los nombres de las columnas (en minúscula). Las filas vacías se ignoran.
 * Google tarda hasta 5 minutos en mostrar un cambio. Si la hoja no responde, la página usa lo que trae escrito.
 */
function leerHojaFolio(url) {
  return fetch(url, { cache: "no-store" })
    .then(function (r) { if (!r.ok) throw new Error("La hoja respondió " + r.status); return r.text(); })
    .then(csvAObjetosFolio);
}

function csvAObjetosFolio(texto) {
  var filas = [], fila = [], campo = "", comillas = false;
  for (var i = 0; i < texto.length; i++) {
    var c = texto[i];
    if (comillas) {
      if (c === '"') { if (texto[i + 1] === '"') { campo += '"'; i++; } else comillas = false; }
      else campo += c;
    } else if (c === '"') comillas = true;
    else if (c === ",") { fila.push(campo); campo = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && texto[i + 1] === "\n") i++;
      fila.push(campo); filas.push(fila); fila = []; campo = "";
    } else campo += c;
  }
  if (campo || fila.length) { fila.push(campo); filas.push(fila); }
  var enc = (filas.shift() || []).map(function (h) { return h.trim().toLowerCase(); });
  return filas
    .filter(function (f) { return f.some(function (x) { return x.trim(); }); })
    .map(function (f) {
      var o = {};
      enc.forEach(function (h, j) { if (h) o[h] = (f[j] || "").trim(); });
      return o;
    });
}

if (typeof module !== "undefined") module.exports = { csvAObjetosFolio: csvAObjetosFolio };
