import Link from "next/dist/client/link";
import React from "react";

interface LinkItem {
  label: string;
  href: string;
}

interface FooterColumnProps {
  title: string;
  links: LinkItem[];
}

export default function FooterColumn({ title, links }: FooterColumnProps) {
  return (
    <div>
      <p className="font-mono text-[10px] tracking-[0.25em] text-[#5C5D66]">
        {title}
      </p>
      <ul className="mt-4 space-y-2 text-sm text-[#93949F]">
        {links.map((link, index) => (
          <li key={index}>
            <Link
              href={link.href}
              className="hover:text-[#F3F1EA] transition-colors"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
