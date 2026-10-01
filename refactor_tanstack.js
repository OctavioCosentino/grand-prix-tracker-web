const fs = require('fs');
let content = fs.readFileSync('app/(private)/profile/DatosView.tsx', 'utf8');

// 1. Add useQueryClient and useMutation to imports if missing
content = content.replace(
  'import { useQuery } from "@tanstack/react-query";',
  'import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";'
);

// 2. Remove manual isSaving state and add queryClient / mutation
content = content.replace(
  'const [isSaving, setIsSaving] = React.useState(false);',
  `const queryClient = useQueryClient();
  
  const updateMutation = useMutation({
    mutationFn: updateUserProfile,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["cliente", user?.id] });
      setMessage({ type: "success", text: "¡Perfil actualizado con éxito!" });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    },
    onError: (error) => {
      console.error("Error saving profile:", error);
      setMessage({ type: "error", text: "Hubo un error al guardar los datos." });
    }
  });`
);

// 3. Update handleSubmit
const oldSubmit = /const handleSubmit = async \(e: React\.FormEvent\) => \{[\s\S]*?setTimeout\(\(\) => setMessage\(\{ type: "", text: "" \}\), 3000\);\n    \}\n  \};/;

const newSubmit = `const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setMessage({ type: "", text: "" });

    const parts = nombreCompleto.trim().split(" ");
    const nombre = parts[0] || "";
    const apellido = parts.slice(1).join(" ") || "";

    updateMutation.mutate({
      nombre,
      apellido,
      telefono: telefono || null,
      dni: dni ? Number(dni) : null
    });
  };`;

content = content.replace(oldSubmit, newSubmit);

// 4. Update the button disabled state
content = content.replace(
  'disabled={isSaving || isPending}',
  'disabled={updateMutation.isPending || isPending}'
);

content = content.replace(
  '{isSaving ? "Actualizando..." : "Actualizar Setup"}',
  '{updateMutation.isPending ? "Actualizando..." : "Actualizar Setup"}'
);

fs.writeFileSync('app/(private)/profile/DatosView.tsx', content);
console.log("Migrated to useMutation");
