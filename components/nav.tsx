"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/projects", label: "Projects" },
  { href: "/boq", label: "BOQ" },
];

export default function Nav() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto">
      {NAV.map((item) => {
        const active = isActive(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className="text-sm whitespace-nowrap px-3 py-1.5 rounded-lg transition-colors"
            style={
              active
                ? {
                    background: "var(--accent-muted)",
                    color: "var(--accent)",
                    fontWeight: 600,
                  }
                : {
                    color: "var(--muted)",
                  }
            }
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}