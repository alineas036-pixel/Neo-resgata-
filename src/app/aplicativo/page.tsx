import Link from "next/link";
import styles from "./page.module.css";

const features = [
  {
    icon: "◈",
    title: "Sua vida financeira",
    description:
      "Consulte suas informações financeiras e acompanhe sua evolução em um só lugar.",
  },
  {
    icon: "✓",
    title: "Organização no dia a dia",
    description:
      "Tenha seus planejamentos, hábitos e lembretes organizados para facilitar sua rotina.",
  },
  {
    icon: "↗",
    title: "Acompanhe seu progresso",
    description:
      "Visualize seus objetivos e acompanhe seus próximos passos para cuidar melhor do dinheiro.",
  },
];

export default function AplicativoPage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link href="/" className={styles.brand} aria-label="Resgata+ início">
          <span className={styles.brandMark}>R+</span>
          <span>resgata<span className={styles.brandPlus}>+</span></span>
        </Link>
        <Link href="/" className={styles.backLink}>← Voltar ao início</Link>
      </header>

      <section className={styles.hero}>
        <div className={styles.phoneArt} aria-hidden="true">
          <div className={styles.phone}>
            <div className={styles.phoneNotch} />
            <div className={styles.phoneBrand}>resgata<span>+</span></div>
            <div className={styles.phoneGreeting}>Sua vida financeira</div>
            <div className={styles.phoneCard}>
              <span>Organização começa aqui</span>
              <div className={styles.phoneLine} />
              <div className={styles.phoneLineShort} />
            </div>
            <div className={styles.phoneTiles}>
              <span>◈</span><span>◷</span><span>✓</span>
            </div>
          </div>
          <div className={styles.orb} />
        </div>

        <div className={styles.heroText}>
          <span className={styles.eyebrow}>
            <span className={styles.statusDot} />
            EM DESENVOLVIMENTO
          </span>
          <h1>O Resgata+ está se preparando para caber no seu bolso.</h1>
          <p className={styles.subtitle}>
            Estamos preparando a experiência do aplicativo Resgata+ para
            ajudar você a organizar suas finanças e acompanhar seus objetivos
            com mais praticidade.
          </p>
          <div className={styles.notice}>
            <span className={styles.noticeIcon} aria-hidden="true">⌁</span>
            <div>
              <strong>O aplicativo ainda não está disponível.</strong>
              <p>
                A disponibilidade será anunciada quando o lançamento estiver
                confirmado. Ainda não há uma data oficial.
              </p>
            </div>
          </div>
          <div className={styles.actions}>
            <Link href="/planejamento" className={styles.primaryButton}>
              Conhecer o planejamento <span aria-hidden="true">↗</span>
            </Link>
            <Link href="/suporte" className={styles.secondaryButton}>
              Falar com o suporte
            </Link>
          </div>
        </div>
      </section>

      <section className={styles.features}>
        <div className={styles.sectionHeading}>
          <span>O QUE ESTAMOS PREPARANDO</span>
          <h2>Mais organização, onde você estiver.</h2>
          <p>
            A proposta do futuro aplicativo é tornar as ferramentas do
            Resgata+ mais práticas para acompanhar no dia a dia.
          </p>
        </div>

        <div className={styles.featureGrid}>
          {features.map((feature) => (
            <article className={styles.featureCard} key={feature.title}>
              <span className={styles.featureIcon} aria-hidden="true">
                {feature.icon}
              </span>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </article>
          ))}
        </div>
      </section>

      <footer className={styles.footer}>
        <Link href="/" className={styles.footerBrand}>Resgata+</Link>
        <span>Aplicativo em desenvolvimento. Disponibilidade futura.</span>
      </footer>
    </main>
  );
}
