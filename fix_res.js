const fs = require('fs');
let c = fs.readFileSync('components/ReservationCard.tsx', 'utf8');

// Replace items array to use SVGs instead of image paths
const newItems = `const items = [
    {
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M21 16V14L13 9V3.5C13 2.67 12.33 2 11.5 2C10.67 2 10 2.67 10 3.5V9L2 14V16L10 13.5V19L8 20.5V22L11.5 21L15 22V20.5L13 19V13.5L21 16Z" />
        </svg>
      ),
      label: "Vuelo",
      active: reserva.incluyeVuelo,
      detail: describeFlights(reserva),
    },
    {
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 2H5C3.9 2 3 2.9 3 4V22H21V4C21 2.9 20.1 2 19 2ZM11 18H7V14H11V18ZM11 10H7V6H11V10ZM17 18H13V14H17V18ZM17 10H13V6H17V10Z" />
        </svg>
      ),
      label: "Hotel",
      active: reserva.incluyeHotel,
      detail: firstRoom ? \`\${firstRoom.cantidadNoches} noches\` : undefined,
    },
    {
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M22 10V6C22 4.9 21.1 4 20 4H4C2.9 4 2.01 4.9 2.01 6V10C3.11 10 4 10.9 4 12C4 13.1 3.11 14 2 14V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V14C20.9 14 20 13.1 20 12C20 10.9 22 10 22 10ZM11 15H5V13H11V15ZM11 11H5V9H11V11ZM19 15H13V13H19V15ZM19 11H13V9H19V11Z" />
        </svg>
      ),
      label: "Entrada",
      active: reserva.incluyeEntrada,
      detail: reserva.entradas.length
        ? \`\${reserva.entradas[0].nombreTribuna}\${tickets > 1 ? \` ×\${tickets}\` : ""}\`
        : undefined,
    },
  ];`;

// Replacing items array
c = c.replace(/const items = \[[\s\S]*?\}\,\n  \]\;/, newItems);

// Replace Estado badge and title
const oldHeader = `<span className="font-mono text-[10px] tracking-[0.2em]" style={{ color: estado.color }}>
            {estado.label}
          </span>
          <h4 className="font-display mt-2 text-xl font-900 uppercase tracking-tight text-[#F3F1EA]">
            {name}
          </h4>`;

const newHeader = `<span 
            className="inline-block self-start font-mono text-[10px] uppercase tracking-[0.2em] px-2 py-0.5 rounded-sm border"
            style={{ color: estado.color, backgroundColor: \`\${estado.color}1A\`, borderColor: \`\${estado.color}33\` }}
          >
            {estado.label}
          </span>
          <h4 className="font-display mt-3 text-2xl font-900 uppercase tracking-tight text-[#F3F1EA]">
            {name}
          </h4>`;

c = c.replace(oldHeader, newHeader);

// Replace Total Price formatting
// old: <span className="font-mono text-xs text-[#D8D7CE]">{formatUsd(reserva.totalUsd)}</span>
// new: <span className="font-mono tabular-nums text-lg font-bold text-[#F3F1EA]">{formatUsd(reserva.totalUsd)}</span>
c = c.replace(/<span className="[^"]*text-\[\#D8D7CE\]">\{formatUsd\(reserva\.totalUsd\)\}<\/span>/g, '<span className="font-mono tabular-nums text-lg font-bold text-[#F3F1EA]">{formatUsd(reserva.totalUsd)}</span>');
c = c.replace(/<span className="font-mono tabular-nums text-xs font-900 text-\[\#E10600\]">\{formatUsd\(reserva\.totalUsd\)\}<\/span>/g, '<span className="font-mono tabular-nums text-lg font-bold text-[#F3F1EA]">{formatUsd(reserva.totalUsd)}</span>');

// Replace code formatting just to be sure it's correct
c = c.replace(/<span className="mt-3 font-mono text-\[11px\] tracking-widest text-\[\#5C5D66\]">/g, '<span className="mt-3 font-mono tabular-nums text-[11px] tracking-widest text-[#5C5D66]">');

fs.writeFileSync('components/ReservationCard.tsx', c);
console.log('Fixed ReservationCard.tsx');
