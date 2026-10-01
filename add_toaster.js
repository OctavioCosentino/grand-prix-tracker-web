const fs = require('fs');
let content = fs.readFileSync('app/layout.tsx', 'utf8');

if (!content.includes('import { Toaster }')) {
  content = content.replace(
    'import AuthProvider from "@/components/providers/AuthProvider";',
    'import AuthProvider from "@/components/providers/AuthProvider";\nimport { Toaster } from "react-hot-toast";'
  );
  
  content = content.replace(
    '<AuthProvider>{children}</AuthProvider>',
    '<AuthProvider>{children}</AuthProvider>\n          <Toaster position="bottom-right" />'
  );
  
  fs.writeFileSync('app/layout.tsx', content);
  console.log("Layout updated");
}
