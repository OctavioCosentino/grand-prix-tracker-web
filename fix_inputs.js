const fs = require('fs');
let content = fs.readFileSync('app/(private)/profile/DatosView.tsx', 'utf8');

// Fix upsert
content = content.replace(
  '.upsert({ id_cliente: user.id, telefono, dni });',
  '.upsert({ id_cliente: user.id, telefono: telefono || null, dni: dni ? Number(dni) : null });'
);

// Fix error message
content = content.replace(
  'Hubo un error al guardar el teléfono.',
  'Hubo un error al guardar los datos.'
);

// Fix success message
content = content.replace(
  '¡¡Perfil actualizado con ééxito!',
  '¡Perfil actualizado con éxito!'
);

// Fix Name input
content = content.replace(
  '<input\n            type="text"\n            defaultValue={user ? getDisplayName(user) : ""}\n            className="w-full rounded-sm border border-[#33343D] bg-[#131318] px-4 py-3.5 text-sm text-[#F3F1EA] outline-none focus:border-[#E10600]"\n          />',
  '<input\n            type="text"\n            defaultValue={user ? getDisplayName(user) : ""}\n            disabled={isPending}\n            placeholder={isPending ? "Cargando..." : "Ingresar nombre completo"}\n            className="w-full rounded-sm border border-[#33343D] bg-[#131318] px-4 py-3.5 text-sm text-[#F3F1EA] outline-none focus:border-[#E10600] disabled:opacity-50"\n          />'
);

// Fix Email input
content = content.replace(
  '<input\n            type="email"\n            defaultValue={user?.email ?? ""}\n            disabled\n            className="w-full rounded-sm border border-[#1C1D24] bg-[#0B0B10] px-4 py-3.5 text-sm text-[#5C5D66] outline-none opacity-70 cursor-not-allowed"\n          />',
  '<input\n            type="email"\n            defaultValue={user?.email ?? ""}\n            disabled\n            placeholder={isPending ? "Cargando..." : "Ingresar correo electrónico"}\n            className="w-full rounded-sm border border-[#1C1D24] bg-[#0B0B10] px-4 py-3.5 text-sm text-[#5C5D66] outline-none opacity-70 cursor-not-allowed"\n          />'
);

// Fix DNI input
content = content.replace(
  '<input type="text" value={dni} onChange={(e) => setDni(e.target.value)} disabled={isPending} placeholder={isPending ? "Cargando..." : "Ingresar DNI"} className="w-full rounded-sm border border-[#33343D] bg-[#131318] px-4 py-3.5 text-sm text-[#F3F1EA] outline-none focus:border-[#E10600] disabled:opacity-50" />',
  '<input\n            type="number"\n            value={dni}\n            onChange={(e) => setDni(e.target.value)}\n            disabled={isPending}\n            placeholder={isPending ? "Cargando..." : "Ingresar DNI"}\n            className="w-full rounded-sm border border-[#33343D] bg-[#131318] px-4 py-3.5 text-sm text-[#F3F1EA] outline-none focus:border-[#E10600] disabled:opacity-50"\n          />'
);

// Fix Teléfono label just in case
content = content.replace(
  '>\n            teléfono\n          </label>',
  '>\n            Teléfono\n          </label>'
);

fs.writeFileSync('app/(private)/profile/DatosView.tsx', content);
console.log("Updated");
