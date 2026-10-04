const fs = require('fs');
let c = fs.readFileSync('app/(public)/page.tsx', 'utf8');

c = c.replace(
  'id="como-funciona"\n        className="mx-auto max-w-7xl px-6 py-24 md:py-32"',
  'id="como-funciona"\n        className="scroll-mt-24 mx-auto max-w-7xl px-6 py-24 md:py-32"'
);

c = c.replace(
  'id="servicios"\n        className="relative overflow-hidden border-t border-[#1C1D24] bg-[#0E0E13] py-24 md:py-32"',
  'id="servicios"\n        className="scroll-mt-24 relative overflow-hidden border-t border-[#1C1D24] bg-[#0E0E13] py-24 md:py-32"'
);

c = c.replace(
  'id="calendario"\n        className="mx-auto max-w-7xl px-6 py-24 md:py-32"',
  'id="calendario"\n        className="scroll-mt-24 mx-auto max-w-7xl px-6 py-24 md:py-32"'
);

c = c.replace(
  'id="bajo-el-capo"\n        className="relative border-t border-[#1C1D24] bg-[#0E0E13] py-24 md:py-32"',
  'id="bajo-el-capo"\n        className="scroll-mt-24 relative border-t border-[#1C1D24] bg-[#0E0E13] py-24 md:py-32"'
);

fs.writeFileSync('app/(public)/page.tsx', c);
console.log('Fixed scroll offsets');

