import Link from "next/link";
import styles from "./detalhe.module.css";

type PlanKey = "mensal" | "trimestral" | "anual";

const plans = {
  mensal: {
    name: "Mensal",
    label: "FLEXIBILIDADE",
    duration: "1 mês",
    launchPrice: "R$ 9,90",
    regularPrice: "R$ 19,90",
    period: "por mês",
    description: "Para começar a organizar sua vida financeira com flexibilidade e dar os primeiros passos no seu planejamento.",
    features: [
      "Organização financeira",
      "Acompanhamento de dívidas",
      "Controle dos seus hábitos",
    ],
    accent: "blue",
    previous: null,
    next: "trimestral",
  },
  trimestral: {
    name: "Trimestral",
    label: "MAIS TEMPO",
    duration: "3 meses",
    launchPrice: "R$ 39,90",
    regularPrice: "R$ 49,90",
    period: "a cada 3 meses",
    description: "Mais tempo para desenvolver sua organização financeira, acompanhar compromissos e observar seu progresso.",
    features: [
      "Tudo do plano mensal",
      "Acesso durante 3 meses",
      "Mais tempo para acompanhar seu progresso",
    ],
    accent: "teal",
    previous: "mensal",
    next: "anual",
  },
  anual: {
    name: "Anual",
    label: "LONGO PRAZO",
    duration: "12 meses",
    launchPrice: "R$ 99,90",
    regularPrice: "R$ 149,90",
    period: "por ano",
    description: "Uma opção para quem deseja planejar sua jornada financeira e acompanhar sua evolução ao longo do ano.",
    features: [
      "Tudo do plano mensal",
      "Acesso durante 12 meses",
      "Acompanhamento ao longo do ano",
    ],
    accent: "gold",
    previous: "trimestral",
    next: null,
  },
} as const;

const routes: Record<PlanKey, string> = {
  mensal: "/pagamentos/mensal",
  trimestral: "/pagamentos/trimestral",
  anual: "/pagamentos/anual",
};

export default function PlanDetail({ planKey }: { planKey: PlanKey }) {
  const plan = plans[planKey];

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <nav className={styles.nav} aria-label="Navegação">
          <Link href="/pagamentos">← Comparar planos</Link>
          <Link href="/" className={styles.brand}>RESGATA<span>+</span></Link>
        </nav>

        <header className={`${styles.hero} ${styles[plan.accent]}`}>
          <span className={styles.eyebrow}>RESGATA+ · PLANO {plan.name.toUpperCase()}</span>
          <span className={styles.label}>{plan.label}</span>
          <h1>Seu próximo passo, no seu ritmo.</h1>
          <p>{plan.description}</p>
        </header>

        <section className={styles.content}>
          <article className={styles.priceCard}>
            <span className={styles.cardEyebrow}>PLANO {plan.name.toUpperCase()}</span>
            <h2>{plan.name}</h2>
            <p className={styles.duration}>Duração apresentada: {plan.duration}</p>

            <div className={styles.priceArea}>
              <span>Preço de lançamento proposto</span>
              <strong>{plan.launchPrice}</strong>
              <small>{plan.period}</small>
            </div>

            <div className={styles.regular}>
              <span>Preço previsto após o lançamento</span>
              <strong>{plan.regularPrice}</strong>
              <small>{plan.period}</small>
            </div>

            <span className={styles.unavailable}>
              Contratação ainda não habilitada
            </span>
            <p className={styles.disclaimer}>
              Os valores são propostas informativas. Não há cobrança ou contratação nesta página.
            </p>
          </article>

          <article className={styles.featuresCard}>
            <span className={styles.cardEyebrow}>O QUE ESTÁ PREVISTO</span>
            <h2>Recursos do plano</h2>
            <p>Conheça os recursos apresentados para esta opção:</p>
            <ul>
              {plan.features.map((feature) => (
                <li key={feature}><span aria-hidden="true">✓</span>{feature}</li>
              ))}
            </ul>
            <div className={styles.notice}>
              <strong>Transparência em primeiro lugar</strong>
              <p>Consulte novamente esta página para acompanhar futuras atualizações sobre disponibilidade e condições.</p>
            </div>
          </article>
        </section>

        <section className={styles.bottom}>
          <div>
            <span className={styles.cardEyebrow}>CONTINUE EXPLORANDO</span>
            <h2>Compare as opções do Resgata+.</h2>
            <p>Veja os outros períodos e escolha com calma quando a contratação estiver disponível.</p>
          </div>
          <div className={styles.actions}>
            <Link href="/pagamentos" className={styles.primary}>Comparar todos os planos</Link>
            <Link href="/ajuda" className={styles.secondary}>Central de ajuda</Link>
          </div>
        </section>

        <footer className={styles.footer}>
          <Link href="/">Início</Link>
          <Link href="/pagamentos">Planos</Link>
          <Link href="/suporte">Suporte</Link>
          <span>Resgata+ © 2026</span>
        </footer>
      </div>
    </main>
  );
}
