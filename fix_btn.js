const fs = require('fs');
let c = fs.readFileSync('components/BookingReviewStep.tsx', 'utf8');

c = c.replace('import ButtonChecker from "./ButtonChecker";', 'import ButtonChecker from "./ButtonChecker";\nimport ButtonProgress from "./ButtonProgress";');

const regex = /<ButtonChecker[\s\S]*?<\/ButtonChecker>/;

const replacement = \`{isSubmitting ? (
          <ButtonProgress className="mt-8 w-full py-4 h-[52px]" />
        ) : (
          <ButtonChecker
            className="mt-8 w-full py-4 font-mono text-[11px] uppercase tracking-widest"
            showArrow
            disabled={issues.length > 0}
            onClick={onConfirm}
          >
            Confirmar y pagar
          </ButtonChecker>
        )}\`;

// since there's only one ButtonChecker in BookingReviewStep.tsx, this simple regex works
c = c.replace(regex, replacement);
fs.writeFileSync('components/BookingReviewStep.tsx', c);
console.log("Done");
