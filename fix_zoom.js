const fs = require('fs');
let c = fs.readFileSync('app/(public)/page.tsx', 'utf8');
c = c.replace(
  'className="absolute inset-0 z-0 h-full w-full object-cover opacity-15"',
  'className="absolute inset-0 z-0 h-full w-full object-cover opacity-15 scale-[1.35] origin-center"'
);
fs.writeFileSync('app/(public)/page.tsx', c);
console.log('Zoomed in!');

