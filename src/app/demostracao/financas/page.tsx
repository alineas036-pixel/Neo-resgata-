"use client";

import DemoMenu from "@/components/DemoMenu";
import { useState } from "react";
import Link from "next/link";

type DemoTab = "visao" | "contas" | "dividas";

const demoData = {
  saldo: 2915.07,
  receitas: 4200,
  despesas: 1284.93,
  dividas: 3500,
  pago: 1200,
  pendente: 2300,
};

const demoAccounts = [
  {
    name: "Conta de energia",
    category: "Casa",
    date: "05/11/2026",
    amount: 185.9,
    status: "Pendente",
  },
  {
    name: "Internet",
    category: "Serviços",
    date: "10/11/2026",
    amount: 99.9,
    status: "Pendente",
  },
  {
    name: "Cartão de crédito",
    category: "Cartão",
    date: "15/11/2026",
    amount: 420,
    status: "Pago",
  },
];

const demoDebts = [
  {
    name: "Empréstimo pessoal",
    category: "Empréstimo",
    amount: 2000,
    paid: 800,
  },
  {
    name: "Dívida de cartão",
    category: "Cartão",
    amount: 1500,
    paid: 400,
  },
];

const features = [
  {
    number: "01",
    icon: "📋",
    title: "Organize suas contas",
    description:
      "Cadastre despesas, valores e datas de vencimento para saber exatamente quais compromissos precisam da sua atenção.",
  },
  {
    number: "02",
    icon: "🎯",
    title: "Tenha clareza sobre suas dívidas",
    description:
      "Visualize valores, pagamentos realizados e quanto ainda falta quitar.",
  },
  {
    number: "03",
    icon: "📅",
    title: "Acompanhe seus vencimentos",
    description:
      "Identifique contas pendentes e atrasadas para planejar seus próximos passos.",
  },
  {
    number: "04",
    icon: "📊",
    title: "Entenda sua vida financeira",
    description:
      "Consulte resumos e acompanhe sua evolução financeira com mais organização.",
  },
];

function money(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export default function DemonstracaoFinancas() {
  const [activeTab, setActiveTab] = useState<DemoTab>("visao");

  const progress = (demoData.pago / demoData.dividas) * 100;

  return (
    <>
      <div className="demo-return-bar">
        <div className="demo-return-inner">
          <Link href="/" className="demo-return-link">
            <span aria-hidden="true">←</span>
            Voltar ao início
          </Link>
        </div>
      </div>

      <DemoMenu />

      <main className="resgata-public">
        <div className="public-container">
          <section className="public-hero">
            <div className="hero-copy">
              <span className="public-eyebrow">
                RESGATA+ · ORGANIZAÇÃO FINANCEIRA
              </span>

              <h1>
                Sua vida financeira merece
                <span> mais clareza e tranquilidade.</span>
              </h1>

              <p>
                Organize suas contas, acompanhe suas dívidas e entenda
                seus compromissos financeiros em um só lugar.
              </p>

              <div className="hero-actions">
                <Link href="/register" className="public-button primary">
                  Começar agora
                  <span>→</span>
                </Link>

                <a href="#demonstracao" className="public-button secondary">
                  Conhecer o sistema
                </a>
              </div>

              <div className="hero-trust">
                <span>✓ Organização financeira</span>
                <span>✓ Acompanhamento de contas</span>
                <span>✓ Planejamento de dívidas</span>
              </div>
            </div>

            <div className="hero-preview">
              <div className="preview-top">
                <div>
                  <span className="preview-label">RESUMO FINANCEIRO</span>
                  <strong>Visão geral</strong>
                </div>
                <span className="preview-icon">R$</span>
              </div>

              <div className="preview-balance">
                <span>Dinheiro disponível</span>
                <strong>{money(demoData.saldo)}</strong>
                <small>Exemplo de demonstração</small>
              </div>

              <div className="preview-stats">
                <div>
                  <span>Despesas</span>
                  <strong>{money(demoData.despesas)}</strong>
                </div>
                <div>
                  <span>Dívidas restantes</span>
                  <strong>{money(demoData.pendente)}</strong>
                </div>
              </div>

              <div className="preview-progress">
                <div>
                  <span>Progresso das dívidas</span>
                  <strong>{Math.round(progress)}%</strong>
                </div>

                <div className="progress-track">
                  <div style={{ width: `${progress}%` }} />
                </div>

                <small>
                  {money(demoData.pago)} pagos de {money(demoData.dividas)}
                </small>
              </div>

              <div className="preview-note">
                <span>✦</span>
                Demonstração com valores fictícios.
              </div>
            </div>
          </section>

          <section className="public-benefits">
            <div>
              <strong>Mais organização</strong>
              <span>Visualize seus compromissos.</span>
            </div>

            <div>
              <strong>Mais clareza</strong>
              <span>Entenda o que precisa de atenção.</span>
            </div>

            <div>
              <strong>Mais planejamento</strong>
              <span>Organize seus próximos passos.</span>
            </div>
          </section>

          <section className="public-section" id="demonstracao">
            <div className="section-heading">
              <span className="public-eyebrow">CONHEÇA POR DENTRO</span>
              <h2>Veja como sua organização pode ficar.</h2>
              <p>
                Explore uma demonstração ilustrativa das principais
                informações que você poderá acompanhar no aplicativo.
              </p>
            </div>

            <div className="demo-panel">
              <div className="demo-panel-heading">
                <div>
                  <span className="demo-tag">
                    AMBIENTE DE DEMONSTRAÇÃO
                  </span>
                  <h3>Meu financeiro</h3>
                  <p>Exemplo de organização financeira.</p>
                </div>

                <span className="demo-badge">Dados fictícios</span>
              </div>

              <div
                className="demo-tabs"
                role="tablist"
                aria-label="Demonstração"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === "visao"}
                  className={activeTab === "visao" ? "active" : ""}
                  onClick={() => setActiveTab("visao")}
                >
                  Visão geral
                </button>

                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === "contas"}
                  className={activeTab === "contas" ? "active" : ""}
                  onClick={() => setActiveTab("contas")}
                >
                  Contas
                </button>

                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === "dividas"}
                  className={activeTab === "dividas" ? "active" : ""}
                  onClick={() => setActiveTab("dividas")}
                >
                  Dívidas
                </button>
              </div>

              {activeTab === "visao" && (
                <div className="demo-content">
                  <div className="demo-metrics">
                    <article>
                      <span>Dinheiro disponível</span>
                      <strong>{money(demoData.saldo)}</strong>
                      <small>Exemplo ilustrativo</small>
                    </article>

                    <article>
                      <span>Despesas registradas</span>
                      <strong>{money(demoData.despesas)}</strong>
                      <small>Exemplo ilustrativo</small>
                    </article>

                    <article>
                      <span>Dívidas cadastradas</span>
                      <strong>{money(demoData.dividas)}</strong>
                      <small>Valor original</small>
                    </article>

                    <article>
                      <span>Já pago</span>
                      <strong className="green">
                        {money(demoData.pago)}
                      </strong>
                      <small>Pagamentos ilustrativos</small>
                    </article>
                  </div>

                  <div className="demo-info-box">
                    <div className="demo-info-icon">📈</div>
                    <div>
                      <strong>Acompanhe sua evolução</strong>
                      <p>
                        Visualize o que já foi pago e o que ainda precisa
                        ser organizado.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "contas" && (
                <div className="demo-content">
                  <div className="demo-list-heading">
                    <div>
                      <strong>Contas e despesas</strong>
                      <span>
                        Exemplos de compromissos cadastrados.
                      </span>
                    </div>

                    <span className="demo-count">
                      {demoAccounts.length} exemplos
                    </span>
                  </div>

                  <div className="demo-list">
                    {demoAccounts.map((account) => (
                      <article className="demo-row" key={account.name}>
                        <div className="demo-row-icon">📄</div>

                        <div className="demo-row-info">
                          <strong>{account.name}</strong>
                          <span>
                            {account.category} · Vencimento: {account.date}
                          </span>
                        </div>

                        <div className="demo-row-value">
                          <strong>{money(account.amount)}</strong>

                          <span
                            className={
                              account.status === "Pago"
                                ? "status paid"
                                : "status pending"
                            }
                          >
                            {account.status}
                          </span>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "dividas" && (
                <div className="demo-content">
                  <div className="demo-list-heading">
                    <div>
                      <strong>Organização das dívidas</strong>
                      <span>
                        Veja o acompanhamento de pagamentos.
                      </span>
                    </div>

                    <span className="demo-count">
                      {demoDebts.length} exemplos
                    </span>
                  </div>

                  <div className="demo-list">
                    {demoDebts.map((debt) => {
                      const percentage = (debt.paid / debt.amount) * 100;

                      return (
                        <article className="demo-debt" key={debt.name}>
                          <div className="demo-debt-top">
                            <div>
                              <strong>{debt.name}</strong>
                              <span>{debt.category}</span>
                            </div>

                            <strong>{money(debt.amount)}</strong>
                          </div>

                          <div className="progress-track">
                            <div style={{ width: `${percentage}%` }} />
                          </div>

                          <div className="demo-debt-bottom">
                            <span>{Math.round(percentage)}% quitado</span>
                            <span>
                              Falta {money(debt.amount - debt.paid)}
                            </span>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="demo-disclaimer">
                Esta demonstração é ilustrativa. Os valores não representam
                uma conta real e não são enviados ou salvos como dados
                financeiros do usuário.
              </div>
            </div>
          </section>
                    <section className="decision-section">
            <div className="decision-copy">
              <span className="public-eyebrow">
                MENOS CONFUSÃO, MAIS DIREÇÃO
              </span>

              <h2>
                Quando tudo fica espalhado, até o próximo passo parece difícil.
              </h2>

              <p>
                Contas em vários lugares, vencimentos esquecidos e dívidas
                sem um acompanhamento claro podem deixar a rotina pesada.
                O Resgata+ reúne essas informações para você olhar sua
                situação com mais calma.
              </p>

              <ul>
                <li>
                  <span>✓</span>
                  Saiba quais contas estão pendentes e quais já foram pagas.
                </li>
                <li>
                  <span>✓</span>
                  Acompanhe o total das dívidas e o que falta quitar.
                </li>
                <li>
                  <span>✓</span>
                  Tenha uma visão mais organizada para decidir o que fazer
                  primeiro.
                </li>
              </ul>

              <Link href="/register" className="public-button primary">
                Quero organizar minhas finanças
                <span>→</span>
              </Link>
            </div>

            <div className="decision-card">
              <div className="decision-card-top">
                <span>SEU PLANEJAMENTO</span>
                <span className="decision-dot">●</span>
              </div>

              <div className="decision-highlight">
                <small>Compromissos em acompanhamento</small>
                <strong>Contas + dívidas</strong>
                <p>
                  Uma visão para entender o que merece sua atenção.
                </p>
              </div>

              <div className="decision-line">
                <span className="decision-symbol">⌁</span>
                <div>
                  <strong>Organize</strong>
                  <small>Registre suas informações</small>
                </div>
                <b>01</b>
              </div>

              <div className="decision-line">
                <span className="decision-symbol">◷</span>
                <div>
                  <strong>Acompanhe</strong>
                  <small>Veja datas, valores e pagamentos</small>
                </div>
                <b>02</b>
              </div>

              <div className="decision-line">
                <span className="decision-symbol">↗</span>
                <div>
                  <strong>Planeje</strong>
                  <small>Escolha seu próximo passo</small>
                </div>
                <b>03</b>
              </div>

              <small className="decision-footnote">
                O Resgata+ é uma ferramenta de organização, não substitui
                orientação financeira profissional.
              </small>
            </div>
          </section>

          <section className="public-section features-section">
            <div className="section-heading">
              <span className="public-eyebrow">O QUE VOCÊ ENCONTRA</span>
              <h2>Ferramentas para organizar sua vida financeira.</h2>
              <p>
                O Resgata+ foi pensado para ajudar você a entender sua
                situação e tomar decisões com mais organização.
              </p>
            </div>

            <div className="feature-grid">
              {features.map((feature) => (
                <article className="feature-card" key={feature.number}>
                  <div className="feature-top">
                    <span className="feature-icon">{feature.icon}</span>
                    <span className="feature-number">
                      {feature.number}
                    </span>
                  </div>

                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="public-how">
            <div className="section-heading">
              <span className="public-eyebrow">SIMPLES PARA COMEÇAR</span>
              <h2>Como funciona?</h2>
            </div>

            <div className="how-grid">
              <article>
                <span>1</span>
                <h3>Crie sua conta</h3>
                <p>
                  Faça seu cadastro para acessar sua área pessoal.
                </p>
              </article>

              <article>
                <span>2</span>
                <h3>Cadastre suas informações</h3>
                <p>
                  Registre suas contas, despesas e dívidas nas áreas
                  correspondentes.
                </p>
              </article>

              <article>
                <span>3</span>
                <h3>Acompanhe seu planejamento</h3>
                <p>
                  Consulte seus registros e organize seus próximos
                  compromissos.
                </p>
              </article>
            </div>
          </section>

          <section className="faq-section">
            <div className="section-heading">
              <span className="public-eyebrow">ANTES DE COMEÇAR</span>
              <h2>Dúvidas que você pode ter.</h2>
              <p>
                Informação clara também faz parte de uma boa experiência.
              </p>
            </div>

            <div className="faq-grid">
              <article>
                <h3>O que estou vendo nesta página?</h3>
                <p>
                  Uma demonstração com valores fictícios para você conhecer
                  a organização de contas e dívidas. Nenhum dado exibido
                  pertence a uma pessoa real.
                </p>
              </article>

              <article>
                <h3>Preciso cadastrar meus dados financeiros agora?</h3>
                <p>
                  Não. Você pode explorar esta demonstração primeiro.
                  Para usar sua própria área, comece criando uma conta.
                </p>
              </article>

              <article>
                <h3>O Resgata+ faz pagamentos por mim?</h3>
                <p>
                  O objetivo apresentado aqui é ajudar a organizar e
                  acompanhar informações. Confira as funcionalidades
                  disponíveis dentro do sistema antes de contratar.
                </p>
              </article>

              <article>
                <h3>Como posso pedir ajuda?</h3>
                <p>
                  Se tiver dificuldade ou alguma dúvida, acesse a Central
                  de Ajuda ou entre em contato pelo canal de suporte.
                </p>
                <Link href="/ajuda">Acessar a Central de Ajuda →</Link>
              </article>
            </div>
          </section>

          <section className="public-cta">
            <span className="public-eyebrow">SEU PRÓXIMO PASSO</span>

            <h2>
              Comece a enxergar sua vida financeira com mais clareza.
            </h2>

            <p>
              Você não precisa resolver tudo hoje. Pode começar organizando
              uma informação de cada vez.
            </p>

            <div className="hero-actions">
              <Link href="/register" className="public-button white">
                Criar minha conta
                <span>→</span>
              </Link>

              <Link href="/pagamentos" className="public-button cta-outline">
                Conhecer os planos
              </Link>
            </div>

            <small>
              Conheça o funcionamento do serviço antes de escolher um plano.
            </small>
          </section>

          <footer className="public-footer">
            <strong>Resgata+</strong>

            <p>
              Organização financeira para ajudar você a recuperar o controle
              e conquistar mais tranquilidade.
            </p>

            <div>
              <Link href="/ajuda">Central de ajuda</Link>
              <Link href="/suporte">Suporte</Link>
              <Link href="/login">Entrar</Link>
              <Link href="/pagamentos">Planos</Link>
            </div>

            <small>
              © {new Date().getFullYear()} Resgata+. Todos os direitos
              reservados.
            </small>
          </footer>
        </div>
      </main>

            <style jsx global>{`
        :root {
          color-scheme: light;
        }

        .resgata-public,
        .resgata-public * {
          box-sizing: border-box;
        }

        .resgata-public {
          --navy: #102b4e;
          --blue: #1769aa;
          --blue-2: #2e86cc;
          --blue-soft: #eaf3fc;
          --ink: #172b43;
          --muted: #65778d;
          --line: #dce7f2;

          min-height: 100vh;
          padding: 34px 20px 64px;
          background: linear-gradient(
            180deg,
            #edf4fb 0%,
            #f7faff 42%,
            #eef4fa 100%
          );
          color: var(--ink);
          font-family: inherit;
        }

        .public-container {
          width: min(1160px, 100%);
          margin: 0 auto;
        }

        .public-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: var(--blue);
          font-size: 11px;
          font-weight: 850;
          letter-spacing: 1.5px;
        }

        .public-eyebrow::before {
          content: "";
          width: 22px;
          height: 2px;
          border-radius: 9px;
          background: var(--blue-2);
        }

        .public-hero {
          position: relative;
          display: grid;
          grid-template-columns: minmax(0, 1.05fr) minmax(360px, 0.85fr);
          align-items: center;
          gap: clamp(24px, 3.5vw, 42px);
          padding: clamp(25px, 3.7vw, 46px);
          overflow: hidden;
          border: 1px solid #d7e5f3;
          border-radius: 28px;
          background: radial-gradient(
              circle at 95% 5%,
              #d5e8f8 0,
              transparent 34%
            ),
            linear-gradient(135deg, #e4eff9 0%, #f1f6fc 100%);
          box-shadow: 0 22px 60px rgba(26, 65, 105, 0.09);
        }

        .hero-copy {
          position: relative;
          z-index: 1;
          min-width: 0;
        }

        .hero-copy h1 {
          max-width: 650px;
          margin: 12px 0;
          color: var(--navy);
          font-size: clamp(36px, 5.2vw, 60px);
          line-height: 1.04;
          letter-spacing: -2.5px;
          font-weight: 850;
        }

        .hero-copy h1 span {
          display: block;
          color: var(--blue);
        }

        .hero-copy > p {
          max-width: 570px;
          margin: 0;
          color: var(--muted);
          font-size: 16px;
          line-height: 1.65;
        }

        .hero-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 20px;
        }

        .public-button {
          display: inline-flex;
          justify-content: center;
          align-items: center;
          gap: 12px;
          min-height: 49px;
          padding: 13px 21px;
          border: 1px solid transparent;
          border-radius: 12px;
          text-decoration: none;
          font-size: 13px;
          font-weight: 800;
          transition: transform 0.18s ease, box-shadow 0.18s ease;
        }

        .public-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 9px 20px rgba(16, 55, 95, 0.14);
        }

        .public-button.primary {
          color: #fff;
          background: #1769aa;
          box-shadow: 0 9px 20px rgba(23, 105, 170, 0.2);
        }

        .public-button.primary:hover {
          background: #10558d;
          box-shadow: 0 13px 25px rgba(23, 105, 170, 0.25);
        }

        .public-button.secondary {
          border-color: #cbdced;
          color: #1a4b78;
          background: #fff;
        }

        .public-button.secondary:hover {
          background: #edf5fc;
        }

        .hero-trust {
          display: flex;
          flex-wrap: wrap;
          gap: 11px 18px;
          margin-top: 19px;
          color: #526a83;
          font-size: 11px;
          font-weight: 700;
        }

        .hero-trust span::first-letter {
          color: #16805b;
        }

        .hero-preview {
          width: 100%;
          min-width: 0;
          padding: 20px;
          border: 1px solid #d2e2f1;
          border-radius: 21px;
          background: linear-gradient(155deg, #fff 0%, #f1f7fd 100%);
          box-shadow: 0 14px 34px rgba(20, 55, 90, 0.1);
        }

        .preview-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .preview-top > div {
          display: grid;
          gap: 6px;
        }

        .preview-label {
          color: #7b8da2;
          font-size: 10px;
          font-weight: 850;
          letter-spacing: 1.1px;
        }

        .preview-top strong {
          color: var(--navy);
          font-size: 19px;
        }

        .preview-icon {
          display: grid;
          place-items: center;
          width: 45px;
          height: 45px;
          border-radius: 14px;
          background: var(--blue-soft);
          color: var(--blue);
          font-weight: 900;
        }

        .hero-preview .preview-balance {
          display: grid;
          gap: 9px;
          padding: 17px 19px;
          margin-top: 12px;
          border: 1px solid #d5e7f8;
          border-radius: 16px;
          background: #eaf4ff !important;
          box-shadow: inset 4px 0 0 #2879bd;
        }

        .hero-preview .preview-balance span {
          color: #42617f !important;
          font-size: 12px;
          font-weight: 650;
        }

        .hero-preview .preview-balance strong {
          color: #123f70 !important;
          font-size: clamp(28px, 3vw, 35px);
          line-height: 1.15;
          letter-spacing: -1px;
          overflow-wrap: anywhere;
        }

        .hero-preview .preview-balance small {
          color: #607f9f !important;
          font-size: 10px;
        }

        .preview-stats {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 13px;
          padding: 14px 0;
        }

        .preview-stats div {
          display: grid;
          gap: 7px;
          min-width: 0;
        }

        .preview-stats span {
          color: var(--muted);
          font-size: 12px;
        }

        .preview-stats strong {
          color: var(--ink);
          font-size: 16px;
          overflow-wrap: anywhere;
        }

        .preview-progress {
          padding: 14px;
          border: 1px solid #dce8f3;
          border-radius: 14px;
          background: #eaf2fa;
        }

        .preview-progress > div:first-child {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          color: #526a83;
          font-size: 12px;
          font-weight: 750;
        }

        .preview-progress > div:first-child strong {
          color: var(--blue);
        }

        .progress-track {
          height: 9px;
          margin: 12px 0 8px;
          overflow: hidden;
          border-radius: 20px;
          background: #dce7f2;
        }

        .progress-track > div {
          height: 100%;
          border-radius: inherit;
          background: linear-gradient(90deg, #1769aa, #52a3e0);
        }

        .preview-progress small {
          color: #60758c;
          font-size: 10px;
        }

        .preview-note {
          display: flex;
          gap: 8px;
          margin-top: 15px;
          color: #657a91;
          font-size: 11px;
        }

        .preview-note span {
          color: var(--blue);
        }

        .public-benefits {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
          margin: 16px 0 46px;
        }

        .public-benefits > div {
          display: grid;
          gap: 6px;
          padding: 16px 18px;
          border: 1px solid #d5e3f0;
          border-radius: 15px;
          background: linear-gradient(135deg, #f8fbff, #e8f1fa);
          box-shadow: 0 8px 24px rgba(25, 65, 105, 0.045);
        }

        .public-benefits strong {
          color: var(--navy);
          font-size: 14px;
        }

        .public-benefits span {
          color: var(--muted);
          font-size: 12px;
          line-height: 1.6;
        }

        .public-section {
          margin: 54px 0;
          scroll-margin-top: 25px;
        }

        .section-heading {
          max-width: 710px;
          margin: 0 auto 25px;
          text-align: center;
        }

        .section-heading .public-eyebrow {
          justify-content: center;
        }

        .section-heading h2 {
          margin: 9px 0;
          color: var(--navy);
          font-size: clamp(27px, 4vw, 40px);
          letter-spacing: -1.4px;
          line-height: 1.13;
          font-weight: 850;
        }

        .section-heading p {
          margin: 0;
          color: var(--muted);
          font-size: 14px;
          line-height: 1.85;
        }

        .demo-panel {
          overflow: hidden;
          border: 1px solid #d8e5f1;
          border-radius: 22px;
          background: #f6faff;
          box-shadow: 0 20px 55px rgba(20, 55, 90, 0.09);
        }

        .demo-panel-heading {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
          padding: 21px 24px 18px;
          background: linear-gradient(110deg, #f7fbff, #edf5fd);
        }

        .demo-panel-heading h3 {
          margin: 9px 0 4px;
          color: var(--navy);
          font-size: 23px;
          letter-spacing: -0.5px;
        }

        .demo-panel-heading p {
          margin: 0;
          color: var(--muted);
          font-size: 12px;
        }

        .demo-tag {
          color: var(--blue);
          font-size: 10px;
          font-weight: 850;
          letter-spacing: 1.2px;
        }

        .demo-badge,
        .demo-count {
          padding: 8px 11px;
          border: 1px solid #d5e6f7;
          border-radius: 30px;
          background: #eaf3fc;
          color: #1b6099;
          font-size: 10px;
          font-weight: 850;
          white-space: nowrap;
        }

        .demo-tabs {
          display: flex;
          gap: 7px;
          padding: 0 28px;
          border-bottom: 1px solid #e5edf5;
          background: #eaf2fa;
        }

        .demo-tabs button {
          padding: 15px 16px 13px;
          border: 0;
          border-bottom: 3px solid transparent;
          background: transparent;
          color: #71839a;
          font-size: 12px;
          font-weight: 750;
          cursor: pointer;
        }

        .demo-tabs button.active {
          border-bottom-color: var(--blue);
          border-radius: 9px 9px 0 0;
          background: #dceaf7;
          color: var(--blue);
        }

        .demo-content {
          min-height: 0;
          padding: 21px 23px;
          background: #f5f9fd;
        }

        .demo-metrics {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 13px;
        }

        .demo-metrics article {
          display: grid;
          align-content: start;
          gap: 9px;
          min-width: 0;
          padding: 15px;
          border: 1px solid #d9e6f2;
          border-radius: 14px;
          background: linear-gradient(145deg, #fff, #edf4fb);
        }

        .demo-metrics article:nth-child(2) {
          background: linear-gradient(145deg, #f3f8fd, #e5eff9);
        }

        .demo-metrics article:nth-child(3) {
          background: linear-gradient(145deg, #f5f8fc, #e9f0f8);
        }

        .demo-metrics article:nth-child(4) {
          background: linear-gradient(145deg, #edf6f5, #e1f0ed);
        }

        .demo-metrics article span {
          color: var(--muted);
          font-size: 11px;
          line-height: 1.5;
        }

        .demo-metrics article strong {
          color: var(--navy);
          font-size: clamp(17px, 2vw, 22px);
          letter-spacing: -0.5px;
          overflow-wrap: anywhere;
        }

        .demo-metrics article strong.green {
          color: #16805b;
        }

        .demo-metrics article small {
          color: #8a9aae;
          font-size: 10px;
        }

        .demo-info-box {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-top: 13px;
          padding: 14px 16px;
          border: 1px solid #dceafa;
          border-radius: 14px;
          background: #e5f0fa;
        }

        .demo-info-icon {
          display: grid;
          place-items: center;
          flex: 0 0 44px;
          width: 44px;
          height: 44px;
          border-radius: 13px;
          background: #fff;
          color: var(--blue);
          font-size: 21px;
          box-shadow: 0 4px 12px rgba(25, 75, 120, 0.08);
        }

        .demo-info-box strong {
          color: var(--navy);
          font-size: 13px;
        }

        .demo-info-box p {
          margin: 5px 0 0;
          color: var(--muted);
          font-size: 12px;
          line-height: 1.6;
        }

        .demo-list-heading {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
        }

        .demo-list-heading > div {
          display: grid;
          gap: 5px;
        }

        .demo-list-heading strong {
          color: var(--navy);
          font-size: 14px;
        }

        .demo-list-heading span:not(.demo-count) {
          color: var(--muted);
          font-size: 11px;
        }

        .demo-list {
          display: grid;
          gap: 10px;
        }

        .demo-row {
          display: flex;
          align-items: center;
          gap: 13px;
          padding: 12px 14px;
          border: 1px solid #d9e6f2;
          border-radius: 13px;
          background: linear-gradient(110deg, #fff, #f0f6fc);
        }

        .demo-row-icon {
          display: grid;
          place-items: center;
          flex: 0 0 41px;
          height: 41px;
          border-radius: 12px;
          background: #edf5fc;
        }

        .demo-row-info {
          display: grid;
          gap: 5px;
          flex: 1;
          min-width: 0;
        }

        .demo-row-info strong {
          color: var(--navy);
          font-size: 13px;
        }

        .demo-row-info span {
          color: var(--muted);
          font-size: 11px;
        }

        .demo-row-value {
          display: grid;
          gap: 6px;
          justify-items: end;
        }

        .demo-row-value > strong {
          color: var(--navy);
          font-size: 13px;
        }

        .status {
          padding: 5px 9px;
          border-radius: 20px;
          font-size: 10px;
          font-weight: 850;
        }

        .status.paid {
          background: #e5f5ee;
          color: #16734f;
        }

        .status.pending {
          background: #fff4dc;
          color: #94620b;
        }

        .demo-debt {
          padding: 15px;
          margin-bottom: 9px;
          border: 1px solid #d9e6f2;
          border-radius: 13px;
          background: linear-gradient(110deg, #fff, #f0f6fc);
        }

        .demo-debt-top,
        .demo-debt-bottom {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
        }

        .demo-debt-top > div {
          display: grid;
          gap: 5px;
        }

        .demo-debt-top strong {
          color: var(--navy);
          font-size: 13px;
        }

        .demo-debt-top span,
        .demo-debt-bottom span {
          color: var(--muted);
          font-size: 11px;
        }

        .demo-debt-bottom {
          margin-top: 10px;
        }

        .demo-disclaimer {
          padding: 11px 13px;
          border-top: 1px solid #e5edf5;
          background: #eaf2fa;
          color: #6b7e93;
          font-size: 11px;
          line-height: 1.7;
        }

        .decision-section {
          display: grid;
          grid-template-columns: minmax(0, 1.05fr) minmax(320px, 0.8fr);
          gap: clamp(28px, 6vw, 76px);
          align-items: center;
          margin: 54px 0;
          padding: clamp(22px, 3.5vw, 40px);
          border: 1px solid #d9e6f3;
          border-radius: 26px;
          background: linear-gradient(130deg, #e2eef9, #f1f6fc 75%);
        }

        .decision-copy h2,
        .faq-section .section-heading h2 {
          margin: 15px 0;
          color: #102b4e;
          font-size: clamp(29px, 4vw, 43px);
          line-height: 1.12;
          letter-spacing: -1.5px;
        }

        .decision-copy > p {
          color: #61758b;
          font-size: 15px;
          line-height: 1.85;
        }

        .decision-copy ul {
          display: grid;
          gap: 13px;
          margin: 24px 0 27px;
          padding: 0;
          list-style: none;
        }

        .decision-copy li {
          display: flex;
          gap: 11px;
          color: #344b65;
          font-size: 14px;
          line-height: 1.6;
        }

        .decision-copy li span {
          display: grid;
          place-items: center;
          flex: 0 0 23px;
          height: 23px;
          border-radius: 50%;
          background: #d5e9fb;
          color: #1769aa;
          font-weight: 900;
        }

        .decision-card {
          min-width: 0;
          padding: 20px;
          border: 1px solid #d7e5f2;
          border-radius: 21px;
          background: linear-gradient(155deg, #fff, #edf4fb);
          box-shadow: 0 18px 44px rgba(25, 67, 110, 0.09);
        }

        .decision-card-top {
          display: flex;
          justify-content: space-between;
          color: #6c8197;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 1.3px;
        }

        .decision-dot {
          color: #3a91d1;
        }

        .decision-highlight {
          margin: 13px 0 10px;
          padding: 20px;
          border-radius: 15px;
          background: #12365d;
          color: #fff;
        }

        .decision-highlight small {
          color: #bcd4ec;
          font-size: 11px;
        }

        .decision-highlight strong {
          display: block;
          margin: 8px 0;
          font-size: 25px;
        }

        .decision-highlight p {
          margin: 0;
          color: #d5e5f5;
          font-size: 12px;
          line-height: 1.6;
        }

        .decision-line {
          display: flex;
          align-items: center;
          gap: 13px;
          padding: 14px 0;
          border-bottom: 1px solid #e8eef5;
        }

        .decision-symbol {
          display: grid;
          place-items: center;
          width: 39px;
          height: 39px;
          border-radius: 12px;
          background: #e9f3fc;
          color: #1769aa;
          font-size: 21px;
        }

        .decision-line div {
          display: grid;
          gap: 3px;
          flex: 1;
        }

        .decision-line strong {
          color: #203a56;
          font-size: 13px;
        }

        .decision-line small {
          color: #78899b;
          font-size: 11px;
        }

        .decision-line b {
          color: #9aabba;
          font-size: 11px;
        }

        .decision-footnote {
          display: block;
          margin-top: 17px;
          color: #8292a3;
          font-size: 10px;
          line-height: 1.6;
        }

        .feature-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
        }

        .feature-card {
          min-width: 0;
          padding: 18px;
          border: 1px solid #d7e4f0;
          border-radius: 16px;
          background: linear-gradient(145deg, #fff, #edf4fb);
          box-shadow: 0 8px 25px rgba(25, 65, 105, 0.045);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .feature-card:nth-child(2) {
          background: linear-gradient(145deg, #f7fbff, #e8f1fa);
        }

        .feature-card:nth-child(3) {
          background: linear-gradient(145deg, #f4f9fb, #e5f0f3);
        }

        .feature-card:nth-child(4) {
          background: linear-gradient(145deg, #f8faff, #e9eef8);
        }

        .feature-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 16px 32px rgba(25, 65, 105, 0.09);
        }

        .feature-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .feature-icon {
          display: grid;
          place-items: center;
          width: 45px;
          height: 45px;
          border-radius: 13px;
          background: #eaf3fc;
          font-size: 20px;
        }

        .feature-number {
          color: #a5b7ca;
          font-size: 12px;
          font-weight: 850;
        }

        .feature-card h3 {
          margin: 14px 0 8px;
          color: var(--navy);
          font-size: 15px;
        }

        .feature-card p {
          margin: 0;
          color: var(--muted);
          font-size: 12px;
          line-height: 1.8;
        }

        .public-how {
          margin: 54px 0;
          padding: 34px 28px;
          border: 1px solid #dce7f2;
          border-radius: 22px;
          background: linear-gradient(135deg, #e3eef9, #f1f6fc);
        }

        .how-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
        }

        .how-grid article {
          padding: 18px;
          border: 1px solid #dce7f2;
          border-radius: 15px;
          background: linear-gradient(145deg, #fff, #edf4fb);
        }

        .how-grid article > span {
          display: grid;
          place-items: center;
          width: 37px;
          height: 37px;
          border-radius: 11px;
          background: var(--blue);
          color: #fff;
          font-weight: 850;
          box-shadow: 0 6px 14px rgba(23, 105, 170, 0.2);
        }

        .how-grid h3 {
          margin: 16px 0 7px;
          color: var(--navy);
          font-size: 15px;
        }

        .how-grid p {
          margin: 0;
          color: var(--muted);
          font-size: 12px;
          line-height: 1.75;
        }

        .faq-section {
          margin: 54px 0;
        }

        .faq-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
          margin-top: 27px;
        }

        .faq-grid article {
          min-width: 0;
          padding: 19px;
          border: 1px solid #dce7f2;
          border-radius: 16px;
          background: linear-gradient(145deg, #fff, #edf4fb);
        }

        .faq-grid h3 {
          margin: 0 0 9px;
          color: #183653;
          font-size: 15px;
        }

        .faq-grid p {
          margin: 0;
          color: #687c91;
          font-size: 13px;
          line-height: 1.75;
        }

        .faq-grid a {
          display: inline-block;
          margin-top: 12px;
          color: #1769aa;
          font-size: 12px;
          font-weight: 800;
          text-decoration: none;
        }

        .faq-grid a:hover {
          text-decoration: underline;
        }

        .public-cta {
          position: relative;
          overflow: hidden;
          padding: 42px 25px;
          border: 1px solid #164f80;
          border-radius: 23px;
          background: linear-gradient(120deg, #12365d, #1769aa);
          color: #fff;
          text-align: center;
          box-shadow: 0 20px 45px rgba(23, 83, 137, 0.2);
        }

        .public-cta .public-eyebrow {
          color: #b9dcf7;
        }

        .public-cta h2 {
          max-width: 720px;
          margin: 15px auto 13px;
          color: #fff;
          font-size: clamp(27px, 4vw, 41px);
          letter-spacing: -1.3px;
          line-height: 1.15;
        }

        .public-cta > p {
          max-width: 610px;
          margin: 0 auto;
          color: #d8e9f7;
          font-size: 13px;
          line-height: 1.8;
        }

        .public-cta .hero-actions {
          justify-content: center;
        }

        .public-button.white {
          background: #fff;
          color: #124c7c;
        }

        .public-button.cta-outline {
          border: 1px solid #8bb6d8;
          color: #fff;
          background: rgba(255, 255, 255, 0.06);
        }

        .public-cta > small {
          display: block;
          margin-top: 19px;
          color: #c4dced;
          font-size: 10px;
        }

        .public-footer {
          padding: 30px 10px 0;
          text-align: center;
          color: var(--muted);
        }

        .public-footer > strong {
          color: var(--navy);
          font-size: 24px;
          font-weight: 900;
          letter-spacing: -0.6px;
        }

        .public-footer > p {
          max-width: 500px;
          margin: 10px auto 19px;
          font-size: 12px;
          line-height: 1.8;
        }

        .public-footer > div {
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 20px;
          margin-bottom: 23px;
        }

        .public-footer a {
          color: #34516e;
          text-decoration: none;
          font-size: 12px;
          font-weight: 750;
        }

        .public-footer a:hover {
          color: var(--blue);
        }

        .public-footer > small {
          color: #91a2b5;
          font-size: 10px;
        }

        /* Botão para voltar ao início */
        .demo-return-bar {
          width: 100%;
          padding: 9px 20px 0;
          background: #e8f1fa;
        }

        .demo-return-inner {
          width: min(1160px, 100%);
          margin: 0 auto;
        }

        .demo-return-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          min-height: 36px;
          padding: 7px 12px;
          border: 1px solid #cbdced;
          border-radius: 9px;
          background: #f5f9fd;
          color: #174a7e;
          font-size: 12px;
          font-weight: 800;
          text-decoration: none;
        }

        .demo-return-link:hover {
          background: #dcebf8;
        }

        /* Tablets */
        @media (max-width: 950px) {
          .public-hero {
            grid-template-columns: 1fr;
            gap: 24px;
            padding: 30px;
          }

          .hero-preview {
            width: 100%;
            max-width: 600px;
          }

          .feature-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .demo-metrics {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .decision-section {
            grid-template-columns: 1fr;
            margin: 40px 0;
            padding: 23px 18px;
          }

          .faq-grid {
            grid-template-columns: 1fr;
          }
        }

        /* Celulares */
        @media (max-width: 620px) {
          .demo-return-bar {
            padding: 7px 12px 0;
          }

          .demo-return-link {
            min-height: 34px;
            padding: 6px 10px;
            font-size: 11px;
          }

          .resgata-public {
            padding: 10px 10px 28px;
          }

          .public-container {
            width: 100%;
            min-width: 0;
          }

          .public-hero {
            grid-template-columns: minmax(0, 1fr);
            gap: 18px;
            padding: 20px 15px;
            border-radius: 18px;
          }

          .hero-copy {
            min-width: 0;
          }

          .public-eyebrow {
            font-size: 9px;
            letter-spacing: 1px;
          }

          .hero-copy h1 {
            max-width: 100%;
            margin: 10px 0;
            font-size: clamp(25px, 7.4vw, 34px);
            line-height: 1.12;
            letter-spacing: -0.8px;
            overflow-wrap: anywhere;
          }

          .hero-copy > p {
            font-size: 13px;
            line-height: 1.6;
          }

          .hero-actions {
            display: grid;
            gap: 9px;
            margin-top: 15px;
          }

          .public-button {
            width: 100%;
            min-height: 42px;
            padding: 10px 13px;
            font-size: 12px;
          }

          .hero-trust {
            display: grid;
            gap: 8px;
            margin-top: 14px;
            font-size: 10px;
          }

          .hero-preview {
            width: 100%;
            max-width: none;
            min-width: 0;
            padding: 14px;
            border-radius: 15px;
          }

          .preview-top strong {
            font-size: 16px;
          }

          .preview-icon {
            width: 38px;
            height: 38px;
          }

          .hero-preview .preview-balance {
            gap: 6px;
            padding: 13px 12px;
          }

          .hero-preview .preview-balance strong {
            font-size: clamp(23px, 7vw, 29px);
          }

          .preview-stats {
            gap: 9px;
            padding: 12px 0;
          }

          .preview-stats span {
            font-size: 10px;
          }

          .preview-stats strong {
            font-size: 13px;
          }

          .preview-progress {
            padding: 11px;
          }

          .preview-progress > div:first-child {
            font-size: 10px;
          }

          .public-benefits {
            grid-template-columns: 1fr;
            gap: 8px;
            margin: 12px 0 30px;
          }

          .public-benefits > div {
            padding: 12px 14px;
          }

          .public-benefits strong {
            font-size: 12px;
          }

          .public-benefits span {
            font-size: 11px;
          }

          .public-section,
          .public-how,
          .faq-section {
            margin: 34px 0;
          }

          .section-heading {
            margin-bottom: 18px;
          }

          .section-heading h2,
          .decision-copy h2,
          .faq-section .section-heading h2 {
            font-size: clamp(22px, 6vw, 28px);
            line-height: 1.18;
            letter-spacing: -0.6px;
          }

          .section-heading p {
            font-size: 12px;
            line-height: 1.6;
          }

          .demo-panel {
            border-radius: 15px;
          }

          .demo-panel-heading {
            gap: 9px;
            padding: 15px 14px 12px;
          }

          .demo-panel-heading h3 {
            margin: 5px 0 3px;
            font-size: 18px;
          }

          .demo-panel-heading p {
            font-size: 11px;
          }

          .demo-badge,
          .demo-count {
            padding: 6px 8px;
            font-size: 9px;
          }

          .demo-tabs {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            padding: 0 5px;
          }

          .demo-tabs button {
            min-width: 0;
            padding: 11px 3px 9px;
            font-size: 10px;
            white-space: normal;
          }

          .demo-content {
            padding: 12px 10px;
          }

          .demo-metrics {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 7px;
          }

          .demo-metrics article {
            min-width: 0;
            padding: 10px 8px;
            gap: 6px;
          }

          .demo-metrics article span {
            font-size: 9px;
            line-height: 1.35;
          }

          .demo-metrics article strong {
            font-size: clamp(13px, 3.8vw, 16px);
          }

          .demo-metrics article small {
            font-size: 9px;
          }

          .demo-info-box {
            align-items: flex-start;
            gap: 9px;
            margin-top: 10px;
            padding: 11px;
          }

          .demo-info-icon {
            flex-basis: 34px;
            width: 34px;
            height: 34px;
          }

          .demo-info-box strong {
            font-size: 11px;
          }

          .demo-info-box p {
            font-size: 10px;
          }

          .demo-list-heading {
            align-items: flex-start;
            flex-wrap: wrap;
            gap: 7px;
          }

          .demo-list-heading strong {
            font-size: 12px;
          }

          .demo-list-heading span:not(.demo-count) {
            font-size: 10px;
          }

          .demo-row {
            align-items: flex-start;
            flex-wrap: wrap;
            gap: 9px;
            padding: 10px;
          }

          .demo-row-icon {
            flex-basis: 32px;
            height: 32px;
          }

          .demo-row-info strong,
          .demo-row-value > strong {
            font-size: 11px;
          }

          .demo-row-info span {
            font-size: 9px;
            line-height: 1.4;
          }

          .demo-row-value {
            display: flex;
            justify-content: space-between;
            align-items: center;
            width: 100%;
            gap: 5px;
            padding-left: 41px;
          }

          .status {
            font-size: 9px;
          }

          .demo-debt {
            padding: 12px;
          }

          .demo-debt-top {
            align-items: flex-start;
          }

          .demo-debt-top strong {
            font-size: 11px;
          }

          .demo-debt-top span,
          .demo-debt-bottom span {
            font-size: 9px;
          }

          .demo-debt-bottom {
            align-items: flex-start;
          }

          .demo-disclaimer {
            padding: 11px 13px;
            font-size: 9px;
          }

          .decision-section {
            grid-template-columns: minmax(0, 1fr);
            gap: 17px;
            margin: 34px 0;
            padding: 17px 13px;
            border-radius: 17px;
          }

          .decision-copy > p {
            font-size: 12px;
            line-height: 1.65;
          }

          .decision-copy ul {
            gap: 9px;
            margin: 16px 0 19px;
          }

          .decision-copy li {
            font-size: 11px;
          }

          .decision-card {
            min-width: 0;
            padding: 14px;
            border-radius: 15px;
          }

          .decision-highlight {
            margin: 13px 0 10px;
            padding: 14px;
          }

          .decision-highlight strong {
            font-size: 20px;
          }

          .decision-line {
            gap: 9px;
            padding: 10px 0;
          }

          .decision-symbol {
            width: 33px;
            height: 33px;
            font-size: 17px;
          }

          .decision-line strong {
            font-size: 11px;
          }

          .decision-line small {
            font-size: 9px;
          }

          .feature-grid,
          .how-grid,
          .faq-grid {
            grid-template-columns: minmax(0, 1fr);
            gap: 9px;
          }

          .feature-card,
          .how-grid article,
          .faq-grid article {
            min-width: 0;
            padding: 14px;
          }

          .feature-card h3,
          .how-grid h3,
          .faq-grid h3 {
            font-size: 13px;
          }

          .feature-card p,
          .how-grid p,
          .faq-grid p {
            font-size: 11px;
            line-height: 1.6;
          }

          .public-how {
            padding: 22px 12px;
          }

          .public-cta {
            padding: 28px 15px;
            border-radius: 17px;
          }

          .public-cta h2 {
            font-size: clamp(22px, 6vw, 28px);
          }

          .public-cta > p {
            font-size: 11px;
          }

          .public-footer {
            padding: 23px 5px 0;
          }

          .public-footer > p {
            font-size: 11px;
          }

          .public-footer > div {
            gap: 10px 14px;
          }

          .public-footer a {
            font-size: 10px;
          }
        }

        /* Celulares muito estreitos */
        @media (max-width: 360px) {
          .resgata-public {
            padding-right: 8px;
            padding-left: 8px;
          }

          .public-hero {
            padding: 17px 12px;
          }

          .demo-metrics {
            grid-template-columns: minmax(0, 1fr);
          }

          .preview-stats {
            grid-template-columns: minmax(0, 1fr);
          }

          .demo-row-value {
            padding-left: 0;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .public-button,
          .feature-card {
            transition: none;
          }
        }

        :root {
          --purple: #8b5cf6;
          --blue: #2563eb;
          --yellow: #eab308;

          
          --red: #ef4444;
          --green: #16a34a;
        }

        /* Títulos */
        h2 {
          position: relative;
          padding-bottom: 10px;
        }

        h2::after {
          content: "";
          display: block;
          width: 58px;
          height: 4px;
          margin-top: 9px;
          border-radius: 10px;
          background: linear-gradient(
            90deg,
            var(--purple),
            var(--blue),
            var(--yellow),
            var(--red),
            var(--green)
          );
        }

        /* Cards com cores e efeitos */
        .feature-card,
        .public-benefits > div,
        .how-grid article {
          position: relative;
          overflow: hidden;
          border: 1px solid #e2e8f0;
          border-radius: 18px;
          transition: transform .25s ease, box-shadow .25s ease;
        }

        .feature-card::before,
        .public-benefits > div::before,
        .how-grid article::before {
          content: "";
          position: absolute;
          inset: 0 0 auto;
          height: 5px;
          background: var(--card-color, var(--blue));
        }

        .feature-card:hover,
        .public-benefits > div:hover,
        .how-grid article:hover {
          transform: translateY(-6px);
          box-shadow: 0 16px 35px rgba(30, 64, 175, .13);
        }

        .feature-card:nth-child(5n + 1) { --card-color: var(--purple); }
        .feature-card:nth-child(5n + 2) { --card-color: var(--blue); }
        .feature-card:nth-child(5n + 3) { --card-color: var(--yellow); }
        .feature-card:nth-child(5n + 4) { --card-color: var(--red); }
        .feature-card:nth-child(5n + 5) { --card-color: var(--green); }

        .feature-icon {
          color: var(--card-color, var(--blue));
          background: color-mix(in srgb, var(--card-color, var(--blue)) 13%, white);
          transition: transform .25s ease;
        }

        .feature-card:hover .feature-icon {
          transform: scale(1.08) rotate(-4deg);
        }

        /* Indicadores da demonstração */
        .demo-metrics article {
          border-left: 4px solid var(--blue);
          border-radius: 12px;
          transition: transform .2s ease;
        }

        .demo-metrics article:nth-child(5n + 1) { border-color: var(--purple); }
        .demo-metrics article:nth-child(5n + 2) { border-color: var(--blue); }
        .demo-metrics article:nth-child(5n + 3) { border-color: var(--yellow); }
        .demo-metrics article:nth-child(5n + 4) { border-color: var(--red); }
        .demo-metrics article:nth-child(5n + 5) { border-color: var(--green); }

        .demo-metrics article:hover {
          transform: translateY(-4px);
        }

        .demo-metrics article:nth-child(5n + 1) strong { color: var(--purple); }
        .demo-metrics article:nth-child(5n + 2) strong { color: var(--blue); }
        .demo-metrics article:nth-child(5n + 3) strong { color: #b77900; }
        .demo-metrics article:nth-child(5n + 4) strong { color: var(--red); }
        .demo-metrics article:nth-child(5n + 5) strong { color: var(--green); }

        /* Abas */
        .demo-tabs button {
          transition: background .2s ease, color .2s ease, transform .2s ease;
        }

        .demo-tabs button:hover {
          transform: translateY(-2px);
        }

        .demo-tabs button.active {
          color: white;
          background: linear-gradient(135deg, var(--blue), #1e40af);
          box-shadow: 0 6px 16px rgba(37, 99, 235, .22);
        }

        /* Botão principal */
        .btn-primary,
        a.btn-primary {
          background: linear-gradient(135deg, var(--blue), #1d4ed8);
          box-shadow: 0 8px 20px rgba(37, 99, 235, .2);
          transition: transform .2s ease, box-shadow .2s ease;
        }

        .btn-primary:hover,
        a.btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 25px rgba(37, 99, 235, .3);
        }

        /* Acessibilidade: respeita quem prefere menos animações */
        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            transition-duration: .01ms !important;
            animation-duration: .01ms !important;
          }
        }

      `}</style>
    </>
  );
}




          