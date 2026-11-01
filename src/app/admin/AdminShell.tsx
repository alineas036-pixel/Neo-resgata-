"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./admin.module.css";

const menuItems = [
  { id: "overview", label: "Visão geral", icon: "▦", href: "/admin" },
  { id: "users", label: "Usuários", icon: "♙", href: "/admin/usuarios" },
  { id: "finance", label: "Financeiro", icon: "◈", href: "/admin/financeiro" },
  { id: "debts", label: "Dívidas e pagamentos", icon: "▤", href: "/admin/dividas" },
  { id: "subscriptions", label: "Assinaturas", icon: "▣", href: "/admin/assinaturas" },
  { id: "reports", label: "Relatórios", icon: "▥", href: "/admin/relatorios" },
  { id: "security", label: "Segurança e acessos", icon: "◇", href: "/admin/seguranca" },
  { id: "settings", label: "Configurações", icon: "⚙", href: "/admin/configuracoes" },
];

export default function AdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [manualActive, setManualActive] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(false);

  const routeActive = pathname.startsWith("/admin/usuarios")
    ? "users"
    : pathname.startsWith("/admin/financeiro")
      ? "finance"
      : pathname.startsWith("/admin/assinaturas")
        ? "subscriptions"
        : pathname.startsWith("/admin/dividas")
          ? "debts"
          : pathname.startsWith("/admin/relatorios")
            ? "reports"
            : pathname.startsWith("/admin/seguranca")
              ? "security"
              : pathname.startsWith("/admin/configuracoes")
                ? "settings"
                : "overview";

  const active = manualActive ?? routeActive;
  const selected = menuItems.find((item) => item.id === active);

  function menuClass(itemId: string) {
    return `${styles.menuItem} ${
      active === itemId ? styles.menuItemActive : ""
    }`;
  }

  return (
    <div className={styles.adminLayout}>
      <aside
        className={`${styles.sidebar} ${
          collapsed ? styles.sidebarCollapsed : ""
        }`}
      >
        <div className={styles.brand}>
          <div className={styles.brandIcon}>R+</div>
          {!collapsed && (
            <div>
              <strong>RESGATA+</strong>
              <small>ADMINISTRAÇÃO</small>
            </div>
          )}
        </div>

        <button
          type="button"
          className={styles.collapseButton}
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
        >
          {collapsed ? "→" : "←"}
        </button>

        <nav className={styles.sidebarNav} aria-label="Menu administrativo">
          {!collapsed && (
            <span className={styles.menuLabel}>MENU PRINCIPAL</span>
          )}

          {menuItems.map((item) =>
            item.href ? (
              <Link
                key={item.id}
                href={item.href}
                title={collapsed ? item.label : undefined}
                className={menuClass(item.id)}
                onClick={() => setManualActive(null)}
              >
                <span className={styles.menuIcon}>{item.icon}</span>
                {!collapsed && <span>{item.label}</span>}
              </Link>
            ) : (
              <button
                type="button"
                key={item.id}
                title={collapsed ? item.label : undefined}
                className={menuClass(item.id)}
                onClick={() => setManualActive(item.id)}
              >
                <span className={styles.menuIcon}>{item.icon}</span>
                {!collapsed && <span>{item.label}</span>}
              </button>
            )
          )}
        </nav>

        <a
          href="/dashboard"
          className={styles.sidebarBack}
          title={collapsed ? "Voltar ao aplicativo" : undefined}
        >
          <span>↗</span>
          {!collapsed && <span>Voltar ao aplicativo</span>}
        </a>
      </aside>

      <main className={styles.adminMain}>
        <header className={styles.adminTopbar}>
          <div>
            <span className={styles.topbarLabel}>RESGATA+ / ADMIN</span>
            <h1>{selected?.label}</h1>
          </div>
          <span className={styles.adminBadge}>Administrador</span>
        </header>

        <section className={styles.adminContent}>
          {active === "overview" || active === "users" || active === "finance" || active === "subscriptions" || active === "debts" || active === "reports" || active === "security" || active === "settings" ? (
            children
          ) : (
            <div className={styles.modulePlaceholder}>
              <span className={styles.placeholderIcon}>
                {selected?.icon}
              </span>
              <h2>{selected?.label}</h2>
              <p>
                Este módulo será conectado aos dados reais do Supabase
                na próxima etapa.
              </p>
              <span className={styles.comingSoon}>Em preparação</span>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
