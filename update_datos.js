const fs = require('fs');
let content = fs.readFileSync('app/(private)/profile/DatosView.tsx', 'utf8');

// 1. Add the import
content = content.replace(
  'import { createClient } from "@/lib/supabase/client";',
  'import { createClient } from "@/lib/supabase/client";\nimport { updateUserProfile } from "@/services/users";'
);

// 2. Add nombreCompleto state
content = content.replace(
  'const [message, setMessage] = React.useState({ type: "", text: "" });',
  'const [message, setMessage] = React.useState({ type: "", text: "" });\n  const [nombreCompleto, setNombreCompleto] = React.useState("");'
);

// 3. Update useEffect to set nombreCompleto
content = content.replace(
  'setTelefono(cliente?.telefono || user?.user_metadata?.telefono || user?.phone || "");',
  'setTelefono(cliente?.telefono || user?.user_metadata?.telefono || user?.phone || "");\n    if (user) {\n      setNombreCompleto(getDisplayName(user));\n    }'
);

// 4. Update handleSubmit logic
const newSubmitLogic = `  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsSaving(true);
    setMessage({ type: "", text: "" });

    try {
      // 1. Dividir el nombre completo en nombre y apellido
      const parts = nombreCompleto.trim().split(" ");
      const nombre = parts[0] || "";
      const apellido = parts.slice(1).join(" ") || "";

      // 2. Enviar los datos al backend
      await updateUserProfile({
        nombre,
        apellido,
        telefono: telefono || null,
        dni: dni ? Number(dni) : null
      });

      // 3. (Opcional) Si quieres mantener sincronizada la BD de supabase directo, puedes dejar el upsert
      // o confiar en que el backend lo hace. Aquí enviamos todo al backend de forma unificada.
      // await supabase.from("clientes").upsert({ id_cliente: user.id, telefono: telefono || null, dni: dni ? Number(dni) : null });

      // 4. Actualizar metadata de auth para que la UI principal se refleje rápido (nombre)
      await supabase.auth.updateUser({
        data: { full_name: nombreCompleto } // o first_name: nombre, last_name: apellido
      });

      setMessage({ type: "success", text: "¡Perfil actualizado con éxito!" });
    } catch (error) {
      console.error("Error saving profile:", error);
      setMessage({ type: "error", text: "Hubo un error al guardar los datos." });
    } finally {
      setIsSaving(false);
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    }
  };`;

content = content.replace(
  /const handleSubmit = async \(e: React\.FormEvent\) => \{[\s\S]*?setTimeout\(\(\) => setMessage\(\{ type: "", text: "" \}\), 3000\);\n    \}\n  \};/,
  newSubmitLogic
);

// 5. Update the "Nombre Completo" input
content = content.replace(
  /<input\n\s*type="text"\n\s*defaultValue=\{user \? getDisplayName\(user\) : ""\}\n\s*disabled=\{isPending\}\n\s*placeholder=\{isPending \? "Cargando..." : "Ingresar nombre completo"\}/m,
  '<input\n            type="text"\n            value={nombreCompleto}\n            onChange={(e) => setNombreCompleto(e.target.value)}\n            disabled={isPending}\n            placeholder={isPending ? "Cargando..." : "Ingresar nombre completo"}'
);

fs.writeFileSync('app/(private)/profile/DatosView.tsx', content);
console.log("Updated DatosView.tsx for backend API logic.");
