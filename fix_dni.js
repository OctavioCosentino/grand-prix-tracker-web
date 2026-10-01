const fs = require('fs');
let content = fs.readFileSync('app/(private)/profile/DatosView.tsx', 'utf8');

content = content.replace(
  'const [telefono, setTelefono] = React.useState("");',
  'const [telefono, setTelefono] = React.useState("");\n  const [documento, setDocumento] = React.useState("");'
);

content = content.replace(
  '.select("telefono")',
  '.select("telefono, documento")'
);

content = content.replace(
  /if \(cliente\?\.telefono\) \{\s*setTelefono\(cliente\.telefono\);\s*\} else if \(user\) \{/m,
  'if (cliente) {\n      if (cliente.telefono) setTelefono(cliente.telefono);\n      if (cliente.documento) setDocumento(cliente.documento);\n    } else if (user) {'
);

content = content.replace(
  '.upsert({ id_cliente: user.id, telefono });',
  '.upsert({ id_cliente: user.id, telefono, documento });'
);

content = content.replace(
  /<input\s+type="text"\s+placeholder="Número de documento"\s+disabled\s+className="w-full rounded-sm border border-\[#1C1D24\] bg-\[#0B0B10\] px-4 py-3\.5 text-sm text-\[#5C5D66\] outline-none opacity-70 cursor-not-allowed"\s+\/>/m,
  '<input type="text" value={documento} onChange={(e) => setDocumento(e.target.value)} disabled={isPending} placeholder="Número de documento" className="w-full rounded-sm border border-[#33343D] bg-[#131318] px-4 py-3.5 text-sm text-[#F3F1EA] outline-none focus:border-[#E10600] disabled:opacity-50" />'
);

fs.writeFileSync('app/(private)/profile/DatosView.tsx', content);
console.log("Done");
