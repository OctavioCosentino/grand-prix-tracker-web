const fs = require('fs');
let c = fs.readFileSync('utils/events.ts', 'utf8');

const original = 'circuit_svg_url: circuit?.circuit_svg_url ?? (event as any).circuit_svg_url ?? circuit?.mapaSvgUrl ?? "",';

const replacement = `circuit_svg_url: (() => {
      let rawUrl = circuit?.circuit_svg_url ?? (event as any).circuit_svg_url ?? circuit?.mapaSvgUrl ?? "";
      if (rawUrl) {
        rawUrl = rawUrl.replace(/\\\\/g, "/");
        if (rawUrl.toLowerCase().startsWith("public/")) {
          rawUrl = rawUrl.substring(6);
        }
        if (!rawUrl.startsWith("/")) {
          rawUrl = "/" + rawUrl;
        }
      }
      return rawUrl;
    })(),`;

c = c.replace(original, replacement);
fs.writeFileSync('utils/events.ts', c);
console.log('Done!');
