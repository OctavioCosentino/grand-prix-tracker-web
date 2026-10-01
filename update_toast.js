const fs = require('fs');
let content = fs.readFileSync('app/(private)/profile/DatosView.tsx', 'utf8');

if (!content.includes('import toast from "react-hot-toast";')) {
  // Add import
  content = content.replace(
    'import { updateUserProfile } from "@/services/users";',
    'import { updateUserProfile } from "@/services/users";\nimport toast from "react-hot-toast";'
  );

  // Remove local message state
  content = content.replace(/const \[message, setMessage\] = React\.useState\(\{ type: "", text: "" \}\);\n\s*/, '');

  // Update onSuccess
  content = content.replace(
    'setMessage({ type: "success", text: "¡Perfil actualizado con éxito!" });\n      setTimeout(() => setMessage({ type: "", text: "" }), 3000);',
    'toast.success("Perfil actualizado correctamente");'
  );

  // Update onError
  content = content.replace(
    'setMessage({\n        type: "error",\n        text: "Hubo un error al guardar los datos.",\n      });\n      setTimeout(() => setMessage({ type: "", text: "" }), 3000);',
    'toast.error("Error al actualizar el perfil", { icon: "⚠️" });'
  );
  
  content = content.replace(
    'setMessage({\n        type: "error",\n        text: "Hubo un error al guardar los datos.",\n      });',
    'toast.error("Error al actualizar el perfil", { icon: "⚠️" });'
  );

  // In case the multiline replace failed, let's catch standard text
  content = content.replace(/setMessage\(\{.*?"error".*?\}\);(\n\s*setTimeout.*?)?/s, 'toast.error("Error al actualizar el perfil", { icon: "⚠️" });');

  // Remove setMessage({ type: "", text: "" }); from handleSubmit
  content = content.replace(/setMessage\(\{ type: "", text: "" \}\);\n/g, '');

  // Remove inline span
  content = content.replace(
    /\{message\.text && \(\n\s*<span\n\s*className=\{`font-mono text-xs \$\{message\.type === "error" \? "text-\[\#E10600\]" : "text-\[\#4CAF50\]"\}`\}\n\s*>\n\s*\{message\.text\}\n\s*<\/span>\n\s*\)\}/,
    ''
  );
  
  // also try simple replace for span in case formatting is different
  content = content.replace(/\{message\.text && \([\s\S]*?<\/span>\n\s*\)\}/, '');

  fs.writeFileSync('app/(private)/profile/DatosView.tsx', content);
  console.log("DatosView updated");
}
