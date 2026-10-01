const fs = require('fs');
let content = fs.readFileSync('app/layout.tsx', 'utf8');

const replacement = `<Toaster 
            position="bottom-right" 
            toastOptions={{
              success: {
                style: {
                  background: "#dcfce7",
                  color: "#14532d",
                },
              },
              error: {
                style: {
                  background: "#fee2e2",
                  color: "#7f1d1d",
                },
              },
            }}
          />`;

content = content.replace(/<Toaster position="bottom-right" \/>/, replacement);
fs.writeFileSync('app/layout.tsx', content);
console.log("Toaster updated");
