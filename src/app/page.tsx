"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import styles from "./page.module.css";
import ServiceLanding from "../components/ServiceLanding";

const menu = [
  { label: "Início", href: "/", icon: "⌂", color: "#5BD8C0" },
  { label: "Finanças", href: "/servicos/financeiro", icon: "◫", color: "#60A5FA" },
  { label: "Dívidas", href: "/servicos/dividas", icon: "▤", color: "#FBBF24" },
  { label: "Hábitos & Controle", href: "/servicos/habitos-controle", icon: "✳", color: "#F472B6" },
  { label: "Planejamento", href: "/planejamento", icon: "◈", color: "#C084FC" },
  { label: "Lembretes", href: "/lembretes", icon: "◷", color: "#FB923C" },
  { label: "Planos", href: "/pagamentos", icon: "◇", color: "#FACC15" },
  { label: "Aplicativo", href: "/aplicativo", icon: "▣", color: "#5BD8C0" },
  { label: "Suporte", href: "/suporte", icon: "?", color: "#FDA4AF" },
];


const extraPanels: Record<string, { eyebrow: string; title: string; description: string; items: string[]; details?: string[][] }> = {
  "/planejamento": {
    eyebrow: "ORGANIZE SEUS PRÓXIMOS PASSOS",
    title: "Planejamento financeiro",
    description:
      "Tire seus objetivos do papel. Organize sua renda, antecipe seus gastos, acompanhe suas prioridades e defina metas realistas para construir uma vida financeira mais tranquila.",
    items: [
      "Defina seus objetivos e metas financeiras",
      "Organize sua renda e suas prioridades",
      "Acompanhe sua evolução financeira",
    ],
    details: [
      [
        "Escolha o que deseja conquistar.",
        "Planeje como quitar uma dívida.",
        "Monte uma reserva de emergência.",
        "Guarde dinheiro para um projeto.",
      ],
      [
        "Conheça o total da sua renda mensal.",
        "Organize seus gastos e compromissos.",
        "Identifique despesas essenciais e gastos que podem ser reduzidos.",
        "Defina prioridades para usar melhor seu dinheiro.",
      ],
      [
        "Acompanhe o progresso das suas metas.",
        "Veja o que já conseguiu realizar.",
        "Identifique o que ainda precisa melhorar.",
        "Ajuste seu planejamento sempre que necessário.",
      ],
    ],
  },
  "/lembretes": {
    eyebrow: "NÃO PERCA DE VISTA SEUS VENCIMENTOS",
    title: "Seus compromissos financeiros em ordem.",
    description:
      "Tenha uma visão clara das contas e dívidas que precisam da sua atenção. Acompanhe os vencimentos, identifique atrasos e organize seus próximos pagamentos em um só lugar.",
    items: [
      "Identifique contas e dívidas vencidas.",
      "Veja o que vence hoje e nos próximos 7 dias.",
      "Acompanhe os valores pendentes e organize suas prioridades.",
    ],
  },
  "/demonstracao": {
    eyebrow: "CONHEÇA O RESGATA+",
    title: "Demonstração",
    description: "Conheça as áreas do Resgata+ e veja como elas podem ajudar na organização da sua vida financeira.",
    items: ["Finanças e organização", "Acompanhamento de dívidas", "Hábitos e progresso"],
  },
  "/pagamentos": {
    eyebrow: "CONHEÇA AS OPÇÕES",
    title: "Planos",
    description: "Consulte as opções e os recursos oferecidos pelo Resgata+.",
    items: ["Confira os recursos disponíveis", "Compare as opções apresentadas", "Veja os detalhes na página de planos"],
  },
  "/aplicativo": {
    eyebrow: "RESGATA+ NO SEU DIA A DIA",
    title: "Sua organização financeira em um só lugar.",
    description:
      "Conheça a proposta do Resgata+ e descubra como os recursos da plataforma podem ajudar você a organizar sua vida financeira, acompanhar seus objetivos e avançar com mais clareza.",
    items: [
      "Conheça os recursos disponíveis na plataforma",
      "Descubra ferramentas para sua organização financeira",
      "Explore as possibilidades do Resgata+",
    ],
  },
  "/suporte": {
    eyebrow: "ATENDIMENTO E RELACIONAMENTO",
    title: "Conte com o Resgata+.",
    description:
      "Estamos aqui para ajudar você a aproveitar melhor sua experiência. Encontre orientação, esclareça suas dúvidas e acesse nossos canais de atendimento.",
    items: [
      "Acesse sua área de atendimento com segurança",
      "Encontre respostas e orientações na Central de Ajuda",
      "Consulte informações para utilizar melhor a plataforma",
    ],
  },
};

export default function HomePage() {
  const [activePanel, setActivePanel] = useState("home");
  const [menuOpen, setMenuOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <main className={`${styles.dashboardHome} ${menuOpen ? styles.menuExpanded : styles.menuCollapsed}`}>
      <aside className={styles.sidePanel} aria-label="Menu principal">
        <Link href="/" className={styles.sideBrand} aria-label="Resgata+ início">
          <span className={styles.brandMark}>R+</span>
          {menuOpen && <span className={styles.sideBrandName}>resgata<span>+</span></span>}
        </Link>

        <button
          type="button"
          className={styles.menuToggle}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "Recolher menu" : "Expandir menu"}
          aria-expanded={menuOpen}
          title={menuOpen ? "Recolher menu" : "Expandir menu"}
        >
          <span>{menuOpen ? "‹" : "›"}</span>
          {menuOpen && <span>Recolher menu</span>}
        </button>

        <div className={styles.sideCaption}>
          {menuOpen ? "SEU ESPAÇO" : "MENU"}
        </div>

        <nav className={styles.sideNav} aria-label="Navegação principal">
          {menu.map((item) => {
            const isPanel = item.href === "/" ||
              item.href.startsWith("/servicos/") ||
              Boolean(extraPanels[item.href]);
            const panelKey = item.href === "/" ? "home" : item.href;
            const isActive = isPanel
              ? activePanel === panelKey
              : pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.sideNavLink} ${isActive ? styles.sideNavActive : ""}`}
                title={item.label}
                aria-current={isActive ? "page" : undefined}
                onClick={(event) => {
                  if (isPanel) {
                    event.preventDefault();
                    setActivePanel(panelKey);
                  }
                }}
              >
                <span className={styles.sideNavIcon} style={{ color: item.color }} aria-hidden="true">{item.icon}</span>
                {menuOpen && <span className={styles.sideNavLabel}>{item.label}</span>}
                {menuOpen && isActive && <span className={styles.activeDot} />}
              </Link>
            );
          })}
        </nav>

      </aside>

      <div className={styles.homeMain}>
        <header className={styles.homeTopbar}>
          <span className={styles.topbarLabel}>RESGATA+ <span>/</span> INÍCIO</span>
          <div className={styles.topbarActions}>
            <Link href="/login" className={styles.topbarLogin}>Entrar</Link>
            <Link href="/register" className={styles.topbarCta}>Começar agora <span>↗</span></Link>
          </div>
        </header>

        <div className={styles.mobileMenuWrap}>
          <button
            type="button"
            className={styles.mobileMenuToggle}
            onClick={() => setMobileMenuOpen((open) => !open)}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-home-nav"
            aria-label={mobileMenuOpen ? "Fechar menu" : "Abrir menu"}
          >
            <span aria-hidden="true">{mobileMenuOpen ? "✕" : "☰"}</span>
            <span>{mobileMenuOpen ? "Fechar menu" : "Menu"}</span>
            <span className={styles.mobileMenuChevron} aria-hidden="true">
              {mobileMenuOpen ? "⌃" : "⌄"}
            </span>
          </button>

          <nav
            id="mobile-home-nav"
            className={styles.mobileNav}
            aria-label="Navegação principal para celular"
            hidden={!mobileMenuOpen}
          >
            {menu.map((item) => {
              const isPanel =
                item.href === "/" ||
                item.href.startsWith("/servicos/") ||
                Boolean(extraPanels[item.href]);

              const panelKey = item.href === "/" ? "home" : item.href;
              const isActive = isPanel
                ? activePanel === panelKey
                : pathname === item.href ||
                  pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`${styles.mobileNavLink} ${
                    isActive ? styles.mobileNavActive : ""
                  }`}
                  aria-current={isActive ? "page" : undefined}
                  onClick={(event) => {
                    if (isPanel) {
                      event.preventDefault();
                      setActivePanel(panelKey);
                    }
                    setMobileMenuOpen(false);
                  }}
                >
                  <span
                    className={styles.mobileNavIcon}
                    style={{ color: item.color }}
                    aria-hidden="true"
                  >
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {activePanel === "home" ? (
          <>
        <section className={styles.centerStage}>
          <div className={styles.centerGlow} aria-hidden="true" />
          <div className={styles.centerContent}>
            <h1>
              Sua Vida Pode
              <br /> Avançar...
                 <br />
              <span> Um Passo de Cada Vez.</span>
            </h1>
            <p className={styles.centerDescription}>
              Cuide das suas finanças, acompanhe suas dívidas e desenvolva
              hábitos melhores. Tenha mais clareza para tomar decisões e
              avançar no seu ritmo.
            </p>

            <div className={styles.homeHeroActions}>
              <Link href="/register" className={styles.homeHeroPrimary}>
                Começar agora <span aria-hidden="true">↗</span>
              </Link>
              <Link href="/demonstracao" className={styles.homeHeroSecondary}>
                Conhecer o Resgata+
              </Link>
            </div>

            <div className={styles.centerFootnote}>
              <span>✳</span> Finanças, Hábitos e Progresso — No seu ritmo.
            </div>
          </div>
          <div className={styles.centerBottomMark} aria-hidden="true">R+</div>
        </section>

        <section className={styles.homeInfoSection} aria-label="Como o Resgata+ pode ajudar">
          <div className={styles.homeInfoHeading}>
            <span>SEU PRÓXIMO PASSO</span>
            <h2>Mais clareza para cuidar do que importa.</h2>
            <p>Escolha por onde começar. Cada pequena mudança conta.</p>
          </div>

          <div className={styles.homeInfoGrid}>
            <article className={`${styles.homeInfoCard} ${styles.financeInfoCard}`}>
              <div className={styles.homeInfoIcon} aria-hidden="true">↗</div>
              <div className={styles.homeInfoCardContent}>
                <span className={styles.homeInfoLabel}>VIDA FINANCEIRA</span>
                <h3>Seu dinheiro, mais organizado.</h3>
                <p>
                  Visualize suas contas, acompanhe seus gastos e planeje seus
                  próximos objetivos — com dívidas ou sem elas.
                </p>
                <div className={styles.homeInfoAction}>
                  Mais clareza no dia a dia <span aria-hidden="true">↗</span>
                </div>
              </div>
            </article>

            <article className={`${styles.homeInfoCard} ${styles.habitsInfoCard}`}>
              <div className={styles.homeInfoIcon} aria-hidden="true">✳</div>
              <div className={styles.homeInfoCardContent}>
                <span className={styles.homeInfoLabel}>HÁBITOS E PROGRESSO</span>
                <h3>Pequenos passos. Novos hábitos.</h3>
                <p>
                  Acompanhe sua rotina, reconheça seus avanços e desenvolva
                  hábitos mais conscientes, um dia de cada vez.
                </p>
                <div className={styles.homeInfoAction}>
                  Seu progresso importa <span aria-hidden="true">↗</span>
                </div>
              </div>
            </article>
          </div>
        </section>
          </>
        ) : activePanel.startsWith("/servicos/") ? (
          <ServiceLanding
            service={
              activePanel === "/servicos/financeiro" ? "financeiro" :
              activePanel === "/servicos/dividas" ? "dividas" :
              activePanel === "/servicos/habitos-controle" ? "habitos" : "documentos"
            }
            embedded
          />
        ) : (
          <section className={styles.serviceStage}>
            <div className={styles.serviceHero}>
              <div className={styles.serviceEyebrow}>
                {extraPanels[activePanel]?.eyebrow}
              </div>
              <h1>{extraPanels[activePanel]?.title}</h1>
              <p className={styles.serviceDescription}>
                {extraPanels[activePanel]?.description}
              </p>
            </div>
            <div className={styles.serviceGrid}>
              {extraPanels[activePanel]?.items.map((item, index) => (
                <article className={styles.serviceCard} key={item}>
                  <h3>{item}</h3>
                  {extraPanels[activePanel]?.details?.[index] && (
                    <ul>
                      {extraPanels[activePanel].details[index].map((detail) => (
                        <li key={detail}>{detail}</li>
                      ))}
                    </ul>
                  )}
                </article>
              ))}
            </div>

            {activePanel === "/lembretes" && (
              <div className={styles.remindersPanelAction}>
                <div>
                  <strong>Organize seus próximos vencimentos</strong>
                  <p>Consulte sua agenda e veja quais contas precisam da sua atenção.</p>
                </div>
                <Link href="/lembretes">
                  Acessar minha agenda <span aria-hidden="true">↗</span>
                </Link>
              </div>
            )}

            {activePanel === "/planejamento" && (
              <div style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 14,
                marginTop: 28,
                alignItems: "center",
              }}>
                <Link
                  href="/login"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "13px 24px",
                    borderRadius: 12,
                    background: "#2563eb",
                    color: "#ffffff",
                    fontWeight: 700,
                    textDecoration: "none",
                  }}
                >
                  Entrar e planejar ↗
                </Link>

                <Link
                  href="/demostracao/planejamento"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "13px 24px",
                    borderRadius: 12,
                    border: "1px solid #93c5fd",
                    background: "#ffffff",
                    color: "#1d4ed8",
                    fontWeight: 700,
                    textDecoration: "none",
                  }}
                >
                  Conhecer demonstração
                </Link>
              </div>
            )}
            {activePanel === "/suporte" && (
              <div className={styles.supportPanel}>
                <div className={styles.supportPanelHeading}>
                  <span className={styles.supportPanelIcon} aria-hidden="true">✦</span>
                  <div>
                    <span className={styles.supportPanelLabel}>CANAIS DE ATENDIMENTO</span>
                    <h2>Como podemos ajudar?</h2>
                    <p>
                      Escolha o caminho mais adequado para encontrar o suporte
                      que você precisa.
                    </p>
                  </div>
                </div>

                <div className={styles.supportBenefits}>
                  <div className={styles.supportBenefit}>
                    <span aria-hidden="true">01</span>
                    <div>
                      <strong>Atendimento ao usuário</strong>
                      <p>Acesse sua conta para abrir e acompanhar suas solicitações.</p>
                    </div>
                  </div>

                  <div className={styles.supportBenefit}>
                    <span aria-hidden="true">02</span>
                    <div>
                      <strong>Orientações e dúvidas</strong>
                      <p>Consulte informações úteis sobre o funcionamento da plataforma.</p>
                    </div>
                  </div>

                  <div className={styles.supportBenefit}>
                    <span aria-hidden="true">03</span>
                    <div>
                      <strong>Mais clareza em cada etapa</strong>
                      <p>Encontre o caminho certo para utilizar os recursos do Resgata+.</p>
                    </div>
                  </div>
                </div>

                <div className={styles.supportActions}>
                  <Link href="/login" className={styles.supportLoginButton}>
                    Acessar suporte <span aria-hidden="true">↗</span>
                  </Link>

                  <Link href="/ajuda" className={styles.supportHelpButton}>
                    Central de ajuda <span aria-hidden="true">↗</span>
                  </Link>
                </div>

                <p className={styles.supportFootnote}>
                  Para acessar e acompanhar seus chamados, entre na sua conta.
                </p>
              </div>
            )}
            {activePanel === "/aplicativo" && (
              <div className={styles.appExperiencePanel}>
                <div className={styles.appExperienceHeading}>
                  <span className={styles.appExperienceIcon} aria-hidden="true">▣</span>
                  <div>
                    <span className={styles.appExperienceLabel}>EXPERIÊNCIA RESGATA+</span>
                    <h2>Mais organização para sua rotina.</h2>
                    <p>
                      Explore as ferramentas e conheça maneiras de acompanhar
                      suas finanças e seus próximos passos.
                    </p>
                  </div>
                </div>

                <div className={styles.appExperienceGrid}>
                  <article className={styles.appExperienceCard}>
                    <span className={styles.appExperienceNumber}>01</span>
                    <div className={styles.appExperienceCardIcon} aria-hidden="true">◫</div>
                    <h3>Ferramentas para você</h3>
                    <p>
                      Conheça as áreas e os recursos criados para apoiar sua
                      organização financeira.
                    </p>
                  </article>

                  <article className={styles.appExperienceCard}>
                    <span className={styles.appExperienceNumber}>02</span>
                    <div className={styles.appExperienceCardIcon} aria-hidden="true">◈</div>
                    <h3>Planejamento e controle</h3>
                    <p>
                      Descubra formas de organizar compromissos, acompanhar
                      objetivos e visualizar suas prioridades.
                    </p>
                  </article>

                  <article className={styles.appExperienceCard}>
                    <span className={styles.appExperienceNumber}>03</span>
                    <div className={styles.appExperienceCardIcon} aria-hidden="true">✳</div>
                    <h3>Evolução no seu ritmo</h3>
                    <p>
                      Explore uma experiência pensada para ajudar você a dar
                      um passo de cada vez.
                    </p>
                  </article>
                </div>

                <div className={styles.appExperienceActions}>
                  <Link href="/demonstracao" className={styles.appExperiencePrimary}>
                    Conhecer demonstração <span aria-hidden="true">↗</span>
                  </Link>

                  <Link href="/ajuda" className={styles.appExperienceSecondary}>
                    Acessar central de ajuda <span aria-hidden="true">↗</span>
                  </Link>
                </div>

                <section className={styles.appDeviceSection} aria-labelledby="app-device-title">
                  <div className={styles.appDeviceHeading}>
                    <span className={styles.appExperienceLabel}>ACESSO EM DIFERENTES DISPOSITIVOS</span>
                    <h3 id="app-device-title">Leve o Resgata+ com você.</h3>
                    <p>
                      Acesse pelo dispositivo que fizer mais sentido para sua rotina.
                    </p>
                  </div>

                  <div className={styles.appDeviceGrid}>
                    <article className={`${styles.appDeviceCard} ${styles.appDeviceMobile}`}>
                      <div className={styles.appDeviceCardTop}>
                        <span className={styles.appDeviceIcon} aria-hidden="true">▣</span>
                        <span className={styles.appDeviceStatus}>EM DESENVOLVIMENTO</span>
                      </div>
                      <h4>Android</h4>
                      <p>
                        Estamos preparando a experiência do Resgata+ para dispositivos
                        Android. Quando estiver disponível, o acesso para download será
                        divulgado nesta página.
                      </p>
                      <div className={styles.appDeviceStore}>
                        <span aria-hidden="true">↗</span>
                        <span>Futura publicação na Google Play</span>
                      </div>
                    </article>

                    <article className={`${styles.appDeviceCard} ${styles.appDeviceMobile}`}>
                      <div className={styles.appDeviceCardTop}>
                        <span className={styles.appDeviceIcon} aria-hidden="true">◉</span>
                        <span className={styles.appDeviceStatus}>EM DESENVOLVIMENTO</span>
                      </div>
                      <h4>iPhone</h4>
                      <p>
                        A versão para iPhone está nos planos do Resgata+. Os detalhes
                        de disponibilidade serão publicados quando o aplicativo estiver
                        pronto.
                      </p>
                      <div className={styles.appDeviceStore}>
                        <span aria-hidden="true">↗</span>
                        <span>Futura publicação na App Store</span>
                      </div>
                    </article>

                    <article className={`${styles.appDeviceCard} ${styles.appDeviceDesktop}`}>
                      <div className={styles.appDeviceCardTop}>
                        <span className={styles.appDeviceIcon} aria-hidden="true">▤</span>
                        <span className={styles.appDeviceAvailable}>ACESSO PELO NAVEGADOR</span>
                      </div>
                      <h4>PC e notebook</h4>
                      <p>
                        Utilize o Resgata+ pelo navegador do seu computador. Acesse
                        o site e entre na sua conta para continuar sua organização
                        financeira.
                      </p>
                      <div className={styles.appDeviceStore}>
                        <span aria-hidden="true">✓</span>
                        <span>Não é necessário instalar</span>
                      </div>
                    </article>
                  </div>

                  <p className={styles.appDeviceFootnote}>
                    Os links oficiais para baixar os aplicativos serão adicionados
                    nesta página assim que as versões móveis forem publicadas.
                  </p>
                </section>

                <p className={styles.appExperienceNote}>
                  Explore as informações disponíveis e conheça os recursos do Resgata+.
                </p>
              </div>
            )}

            {activePanel === "/pagamentos" && (
              <div className={styles.homePlansPanel}>
                <div className={styles.homePlansIntro}>
                  <span className={styles.homePlansIcon} aria-hidden="true">◇</span>
                  <div>
                    <span className={styles.homePlansEyebrow}>ESCOLHA SUA JORNADA</span>
                    <h2>Um plano para cada etapa.</h2>
                    <p>
                      Conheça as opções pensadas para acompanhar sua organização
                      financeira no seu ritmo.
                    </p>
                  </div>
                </div>

                <div className={styles.homePlansCards}>
                  <article className={styles.homePlanCard}>
                    <span className={styles.homePlanTag}>FLEXIBILIDADE</span>
                    <h3>Mensal</h3>
                    <p>Para começar a organizar sua vida financeira.</p>
                    <Link href="/pagamentos/mensal">Conhecer opção mensal ↗</Link>
                  </article>
                  <article className={`${styles.homePlanCard} ${styles.homePlanFeatured}`}>
                    <span className={styles.homePlanTag}>MAIS TEMPO</span>
                    <h3>Trimestral</h3>
                    <p>Para manter o foco e acompanhar sua evolução.</p>
                    <Link href="/pagamentos/trimestral">Conhecer opção trimestral ↗</Link>
                  </article>
                  <article className={styles.homePlanCard}>
                    <span className={styles.homePlanTag}>LONGO PRAZO</span>
                    <h3>Anual</h3>
                    <p>Para planejar sua jornada ao longo do ano.</p>
                    <Link href="/pagamentos/anual">Conhecer opção anual ↗</Link>
                  </article>
                </div>

                <div className={styles.homePlansBottom}>
                  <span>Consulte valores, condições e disponibilidade.</span>
                  <Link href="/pagamentos">Ver detalhes dos planos <span aria-hidden="true">↗</span></Link>
                </div>
              </div>
            )}
          </section>
        )}

        <footer className={styles.homeFooter}>
          <span>Resgata+ © 2026</span>
          <span>Organize suas dívidas. Recupere seu controle.</span>
          <nav aria-label="Links úteis" style={{ display: "flex", flexWrap: "wrap", gap: 14 }}>
            <Link href="/ajuda">Ajuda</Link>
            <Link href="/suporte">Suporte</Link>
            <Link href="/seguranca">Segurança</Link>
            <Link href="/pagamentos">Planos</Link>
          </nav>
        </footer>
      </div>
    </main>
  );
}
