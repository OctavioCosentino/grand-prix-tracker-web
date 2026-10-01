const fs = require('fs');
let content = fs.readFileSync('app/(public)/page.tsx', 'utf8');

const original = `{/* ================= SERVICIOS ================= */}
      <section
        id="servicios"
        className="relative overflow-hidden border-t border-[#1C1D24] bg-[#0E0E13] py-24 md:py-32"
      >
        {/* VIDEO BACKGROUND */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 z-0 h-full w-full object-cover opacity-15"
        >
          <source src="/franco_overtake.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#0E0E13] via-transparent to-[#0E0E13]" />

        <div className="relative z-10 mx-auto max-w-7xl px-6">`;

const replacement = `{/* ================= SERVICIOS ================= */}
      <section
        id="servicios"
        className="relative border-t border-[#1C1D24] bg-[#0E0E13] py-24 md:py-32"
      >
        {/* VIDEO BACKGROUND WRAPPER */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 h-full w-full object-cover opacity-15"
          >
            <source src="/franco_overtake.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-[#0E0E13] via-transparent to-[#0E0E13]" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-6">`;

content = content.replace(original, replacement);
fs.writeFileSync('app/(public)/page.tsx', content);
console.log("Updated!");
