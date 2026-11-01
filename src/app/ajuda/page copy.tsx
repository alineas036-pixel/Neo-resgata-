import Link from "next/link";

const questions = [
  {
    question: "Como começo a usar o Resgata+?",
    answer: "Crie sua conta ou entre na sua conta existente. Depois, acesse as áreas disponíveis para organizar suas finanças e acompanhar suas informações.",
  },
  {
    question: "A demonstração altera meus dados?",
    answer: "A página de demonstração apresenta exemplos fictícios para você conhecer a experiência. Ela é separada dos seus registros financeiros pessoais.",
  },
  {
    question: "Os pagamentos já estão habilitados?",
    answer: "Ainda não nesta página. Os planos e valores são apresentados para consulta; o checkout será disponibilizado após a validação da integração de pagamento.",
  },
  {
    question: "Como peço ajuda com minha conta?",
    answer: "Entre na sua conta e abra a página de suporte para enviar e acompanhar um chamado. Nunca inclua senhas, códigos de autenticação ou dados completos de cartão.",
  },
];

export default function HelpPage() {
  return (
    <main style={{ maxWidth: 820, margin: "0 auto", padding: "36px 20px 56px", color: "var(--foreground, #17352e)" }}>
      <Link href="/" style={{ color: "var(--primary, #126b58)", textDecoration: "none", fontWeight: 700 }}>← Início</Link>
      <header style={{ margin: "34px 0" }}>
        <p style={{ color: "var(--primary, #126b58)", fontWeight: 800, letterSpacing: 1.3, fontSize: 12 }}>RESGATA+ · CENTRAL DE AJUDA</p>
        <h1 style={{ fontSize: "clamp(30px, 5vw, 42px)", margin: "8px 0" }}>Como podemos ajudar?</h1>
        <p style={{ color: "var(--muted, #64748b)", lineHeight: 1.7 }}>Respostas rápidas para começar a usar o Resgata+ com mais tranquilidade.</p>
      </header>
      <section style={{ display: "grid", gap: 14 }}>
        {questions.map((item) => (
          <article key={item.question} style={{ border: "1px solid var(--border, #dce7e2)", borderRadius: 14, padding: 20, background: "var(--card, #fff)" }}>
            <h2 style={{ fontSize: 19, marginTop: 0 }}>{item.question}</h2>
            <p style={{ lineHeight: 1.75, color: "var(--muted, #64748b)", marginBottom: 0 }}>{item.answer}</p>
          </article>
        ))}
      </section>
      <p style={{ marginTop: 26 }}>Ainda precisa de ajuda? <Link href="/suporte">Acesse o suporte</Link> ou consulte os <Link href="/pagamentos">planos</Link>.</p>
    </main>
  );
}
