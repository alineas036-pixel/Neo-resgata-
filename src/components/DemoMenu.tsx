"use client";

import Link from "next/link";
import { useState } from "react";

const links = [
  { label: "Finanças", href: "/demostracao/financas" },
  { label: "Dívidas", href: "/demostracao/dividas" },
  { label: "Hábitos & Controle", href: "/demostracao/habitos" },
  { label: "Planejamento", href: "/demostracao/planejamento" },
];

export default function DemoMenu() {
  const [open, setOpen] = useState(false);

  return (
    <header className="demo-menu">
      <div className="demo-menu-top">
        <Link href="/" className="demo-menu-brand">R+ Resgata+</Link>

        {open && (
          <nav className="demo-menu-links">
            {links.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setOpen(false)}>
                {link.label}
              </Link>
            ))}
            <Link href="/login" className="demo-menu-login">Entrar</Link>
          </nav>
        )}

        <button
          type="button"
          className="demo-menu-toggle"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
        >
          {open ? " X " : " Menu ☰ "}
        </button>
      </div>
    </header>
  );
}
