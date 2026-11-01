import Link from "next/link";
import styles from "./page.module.css";

const plans = [
  {
    name: "Mensal",
    launchPrice: "R$ 9,90",
    regularPrice: "R$ 19,90",
    period: "por mês",
    description: "Para começar a organizar sua vida financeira.",
    features: [
      "Organização financeira",
      "Acompanhamento de dívidas",
      "Controle dos seus hábitos",
    ],
    label: "FLEXIBILIDADE",
  },
  {
    name: "Trimestral",
    launchPrice: "R$ 39,90",
    regularPrice: "R$ 49,90",
    period: "a cada 3 meses",
    description: "Para manter o foco e acompanhar sua evolução.",
    features: [
      "Tudo do plano mensal",
      "Acesso durante 3 meses",
      "Mais tempo para acompanhar seu progresso",
    ],
    label: "MAIS TEMPO",
    featured: true,
  },
  {
    name: "Anual",
    launchPrice: "R$ 99,90",
    regularPrice: "R$ 149,90",
    period: "por ano",
    description: "Para planejar sua jornada no longo prazo.",
    features: [
      "Tudo do plano mensal",
      "Acesso durante 12 meses",
      "Acompanhamento ao longo do ano",
    ],
    label: "LONGO PRAZO",
  },
];

export default function PaymentsPage() {
  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <Link href="/" className={styles.backLink}>← Voltar ao início</Link>

        <header className={styles.hero}>
          <span className={styles.eyebrow}>RESGATA+ · PLANOS</span>
          <h1>Escolha o plano para sua jornada.</h1>
          <p>
            Um passo de cada vez. Conheça as opções pensadas para apoiar
            sua organização financeira e acompanhar seu progresso.
          </p>
          <div className={styles.heroNote}>
            <span aria-hidden="true">✦</span>
            Mais clareza para organizar seus próximos passos.
          </div>
        </header>

        <section className={styles.plansGrid} aria-label="Opções de planos">
          {plans.map((plan) => (
            <article
              key={plan.name}
              className={`${styles.planCard} ${plan.featured ? styles.featured : ""}`}
            >
              {plan.featured && (
                <span className={styles.featuredBadge}>OPÇÃO EM DESTAQUE</span>
              )}
              <span className={styles.planLabel}>{plan.label}</span>
              <h2>{plan.name}</h2>
              <p className={styles.planDescription}>{plan.description}</p>

              <div className={styles.priceBlock}>
                <span className={styles.priceCaption}>Preço de lançamento proposto</span>
                <strong className={styles.price}>{plan.launchPrice}</strong>
                <span className={styles.period}>{plan.period}</span>
              </div>

              <ul className={styles.features}>
                {plan.features.map((feature) => (
                  <li key={feature}>
                    <span aria-hidden="true">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>

              <div className={styles.regularPrice}>
                <span>Preço previsto após o lançamento</span>
                <strong>{plan.regularPrice}</strong>
                <small>{plan.period}</small>
              </div>

              <Link
                href={`/pagamentos/${plan.name.toLowerCase()}`}
                className={styles.detailLink}
              >
                Ver detalhes deste plano <span aria-hidden="true">→</span>
              </Link>
            </article>
          ))}
        </section>

        <section className={styles.infoPanel}>
          <div className={styles.infoIcon} aria-hidden="true">i</div>
          <div className={styles.infoContent}>
            <span className={styles.infoEyebrow}>INFORMAÇÕES IMPORTANTES</span>
            <h2>Transparência em cada etapa.</h2>
            <p>
              Os valores apresentados são propostas de lançamento e preços
              previstos para depois desse período. A contratação e a cobrança
              ainda não estão habilitadas nesta página. Não informe dados
              de cartão aqui.
            </p>
            <p>
              <strong>VIP vitalício:</strong> está em desenvolvimento e
              indisponível para compra neste momento.
            </p>
          </div>
        </section>

        <section className={styles.nextStep}>
          <div>
            <span className={styles.nextStepEyebrow}>COMECE QUANDO QUISER</span>
            <h2>Seu próximo passo começa com organização.</h2>
            <p>Crie sua conta ou entre para continuar sua experiência no Resgata+.</p>
          </div>
          <div className={styles.actions}>
            <Link href="/register" className={styles.primaryButton}>Criar minha conta ↗</Link>
            <Link href="/login" className={styles.secondaryButton}>Já tenho conta</Link>
          </div>
        </section>

        <footer className={styles.footer}>
          <span>Resgata+ © 2026</span>
          <span>Dúvidas? Consulte a <Link href="/ajuda">página de ajuda</Link> ou acesse o <Link href="/suporte">suporte</Link>.</span>
        </footer>
      </div>
    </main>
  );
}
