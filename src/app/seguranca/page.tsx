import Link from "next/link";

export default function SecurityPage() {
  return (
    <main style={{ maxWidth: 820, margin: "0 auto", padding: "36px 20px 56px", color: "var(--foreground, #17352e)" }}>
      <Link href="/" style={{ color: "var(--primary, #126b58)", textDecoration: "none", fontWeight: 700 }}>← Início</Link>
      <header style={{ margin: "34px 0" }}>
        <p style={{ color: "var(--primary, #126b58)", fontWeight: 800, letterSpacing: 1.3, fontSize: 12 }}>RESGATA+ · SEGURANÇA</p>
        <h1 style={{ fontSize: "clamp(30px, 5vw, 42px)", margin: "8px 0" }}>Cuide dos seus dados</h1>
        <p style={{ color: "var(--muted, #64748b)", lineHeight: 1.7 }}>Algumas práticas importantes para proteger sua conta e suas informações financeiras.</p>
      </header>
      <section style={{ display: "grid", gap: 14 }}>
        {[
          ["Proteja sua senha", "Use uma senha exclusiva e não a compartilhe com outras pessoas."],
          ["Não envie dados secretos ao suporte", "Nunca inclua senha, código de autenticação, número completo de cartão ou credenciais bancárias em chamados."],
          ["Confira antes de pagar", "Só efetue pagamentos quando o checkout oficial estiver disponível e confirme as informações apresentadas antes de concluir a compra."],
          ["Saia da conta em dispositivos compartilhados", "Ao usar um computador público ou compartilhado, encerre sua sessão ao terminar."],
        ].map(([title, description]) => (
          <article key={title} style={{ border: "1px solid var(--border, #dce7e2)", borderRadius: 14, padding: 20, background: "var(--card, #fff)" }}>
            <h2 style={{ fontSize: 19, marginTop: 0 }}>{title}</h2>
            <p style={{ lineHeight: 1.75, color: "var(--muted, #64748b)", marginBottom: 0 }}>{description}</p>
          </article>
        ))}
      </section>
      <p style={{ marginTop: 26, color: "var(--muted, #64748b)", lineHeight: 1.7 }}>Esta página reúne orientações gerais; não substitui a política de privacidade nem uma auditoria técnica de segurança.</p>
      <p>Precisa de ajuda? <Link href="/ajuda">Consulte a central de ajuda</Link>.</p>
    </main>
  );
}
