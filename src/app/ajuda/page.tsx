"use client";

import Link from "next/link";
// Mantenha aqui os outros imports que já existem



const questions = [
  {
    category: "Primeiros passos",
    color: "blue",
    icon: "01",
    question: "Como começo a usar o Resgata+?",
    answer:
      "Crie sua conta ou entre com seus dados de acesso. Depois, explore as áreas disponíveis para registrar suas dívidas, organizar contas, acompanhar despesas e planejar seus objetivos. Você pode começar aos poucos, preenchendo primeiro as informações que já conhece.",
  },
  {
    category: "Demonstração",
    color: "purple",
    icon: "02",
    question: "Os dados da demonstração são reais?",
    answer:
      "Não. A demonstração utiliza informações fictícias para apresentar os recursos e a experiência do Resgata+. Os valores demonstrativos são separados dos seus registros financeiros pessoais e não devem ser usados como informações da sua situação financeira real.",
  },
  {
    category: "Planos e pagamentos",
    color: "yellow",
    icon: "03",
    question: "Como funcionam os planos e pagamentos?",
    answer:
      "Você pode consultar os planos e os valores apresentados na página de pagamentos. A contratação e a cobrança só devem ser realizadas quando o processo de pagamento estiver oficialmente habilitado. Se a opção de pagamento ainda não estiver disponível, você poderá voltar a consultar essa página futuramente.",
  },
  {
    category: "Atendimento",
    color: "green",
    icon: "04",
    question: "Como posso pedir ajuda?",
    answer:
      "Se você tiver uma conta, acesse a página de suporte para registrar sua dúvida ou dificuldade. Depois de enviar o chamado, poderá acompanhar o histórico e consultar uma eventual resposta da equipe diretamente pelo aplicativo.",
  },
  {
    category: "Organização financeira",
    color: "orange",
    icon: "05",
    question: "Posso receber orientação para cadastrar minhas finanças?",
    answer:
      "Você pode solicitar orientação para organizar o cadastro de dívidas, contas e despesas. Se precisar de ajuda para inserir informações em seu nome, qualquer ação deverá ser explicada e autorizada por você. Confira os dados antes de confirmar qualquer cadastro.",
  },
  {
    category: "Privacidade e segurança",
    color: "red",
    icon: "06",
    question: "Como devo proteger meus dados financeiros?",
    answer:
      "Use uma senha segura e não compartilhe seus dados de acesso. Nunca envie senhas, códigos de autenticação, dados completos de cartão ou credenciais bancárias por chamados ou WhatsApp. Compartilhe apenas as informações necessárias para explicar sua dúvida.",
  },
  {
    category: "Conta",
    color: "blue",
    icon: "07",
    question: "O que faço se não conseguir entrar na minha conta?",
    answer:
      "Confira se o e-mail e a senha foram digitados corretamente. Se continuar sem conseguir acessar, utilize a opção de recuperação de senha, caso esteja disponível, ou entre em contato com o suporte para receber orientação.",
  },
  {
    category: "Uso do aplicativo",
    color: "purple",
    icon: "08",
    question: "Preciso preencher tudo de uma vez?",
    answer:
      "Não. Você pode organizar suas informações gradualmente. Comece pelos dados mais importantes para sua rotina e atualize os registros conforme sua situação financeira mudar.",
  },
];

export default function HelpPage() {
  const whatsappNumber =
    process.env.NEXT_PUBLIC_RESGATA_SUPPORT_WHATSAPP?.replace(
      /\D/g,
      ""
    ) ?? "";

  const whatsappUrl = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
        "Olá! Preciso de orientação sobre o Resgata+."
      )}`
    : "";

  return (
    <main className="help-page">
      <div className="help-container">
        {/* NAVEGAÇÃO */}
        <nav className="help-nav" aria-label="Navegação">
          <Link href="/" className="back-link">
            <span>←</span> Voltar ao início
          </Link>

          <span className="nav-brand">
            RESGATA<span>+</span>
          </span>
        </nav>

        {/* HERO */}
        <header className="help-hero">
          <div className="hero-content">
            <span className="hero-label">
              <span className="hero-dot" />
              CENTRAL DE AJUDA
            </span>

            <h1>
              Informação clara.
              <br />
              <span>Ajuda para seguir em frente.</span>
            </h1>

            <p>
              Encontre orientações sobre o Resgata+, tire suas dúvidas
              e descubra como utilizar os recursos disponíveis para
              organizar sua vida financeira.
            </p>

            <a href="#perguntas" className="hero-button">
              Encontrar uma resposta <span>↓</span>
            </a>
          </div>

          <div className="hero-art" aria-hidden="true">
            <div className="art-circle">
              <div className="art-inner">
                <span>?</span>
              </div>
            </div>
            <div className="art-card">
              <span className="art-check">✓</span>
              <div>
                <strong>Um passo de cada vez</strong>
                <small>Estamos aqui para orientar.</small>
              </div>
            </div>
          </div>
        </header>

        {/* INTRODUÇÃO */}
        <section className="intro-section">
          <div>
            <span className="section-eyebrow">COMO PODEMOS AJUDAR?</span>
            <h2>Escolha o caminho que funciona para você.</h2>
            <p>
              Consulte as respostas mais comuns ou fale com nossa
              equipe pelos canais disponíveis.
            </p>
          </div>
        </section>

        {/* CANAIS */}
        <section className="contact-grid">
          <article className="contact-card support-card">
            <div className="contact-card-top">
              <div className="contact-icon support-icon">✉</div>
              <span className="contact-label">ATENDIMENTO PELO APP</span>
            </div>

            <h3>Precisa de ajuda com sua conta?</h3>

            <p>
              Registre sua dúvida, explique sua dificuldade e acompanhe
              as respostas da equipe pelo histórico de chamados.
            </p>

            <Link href="/login" className="contact-button support-button">
              Acessar suporte <span>→</span>
            </Link>
          </article>

          <article className="contact-card whatsapp-card">
            <div className="contact-card-top">
              <div className="contact-icon whatsapp-icon">◉</div>
              <span className="contact-label">CONTATO EXTERNO</span>
            </div>

            <h3>Prefere conversar pelo WhatsApp?</h3>

            <p>
              Utilize o WhatsApp para entrar em contato e solicitar
              orientações gerais sobre o aplicativo.
            </p>

            {whatsappUrl ? (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="contact-button whatsapp-button"
              >
                Conversar pelo WhatsApp <span>→</span>
              </a>
            ) : (
              <span className="unavailable-label">
                Canal de WhatsApp ainda não configurado.
              </span>
            )}
          </article>
        </section>

        {/* PERGUNTAS */}
        <section id="perguntas" className="faq-section">
          <div className="faq-heading">
            <div>
              <span className="section-eyebrow">DÚVIDAS FREQUENTES</span>
              <h2>Encontre sua resposta</h2>
              <p>
                Reunimos orientações para ajudar você a utilizar
                o Resgata+ com mais tranquilidade.
              </p>
            </div>

            <span className="faq-count">
              {questions.length} perguntas
            </span>
          </div>

          <div className="faq-list">
            {questions.map((item) => (
              <details
                className={`faq-item faq-${item.color}`}
                key={item.question}
              >
                <summary>
                  <span className="faq-number">{item.icon}</span>

                  <span className="faq-question-content">
                    <small>{item.category}</small>
                    <strong>{item.question}</strong>
                  </span>

                  <span className="faq-toggle" aria-hidden="true">
                    +
                  </span>
                </summary>

                <div className="faq-answer">
                  <p>{item.answer}</p>
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* SEGURANÇA */}
        <section className="privacy-card">
          <div className="privacy-icon">🔐</div>

          <div>
            <span className="section-eyebrow">SUA SEGURANÇA IMPORTA</span>
            <h3>Cuide das suas informações.</h3>
            <p>
              O suporte não precisa da sua senha, de códigos de
              autenticação ou de credenciais bancárias para orientar
              você. Não compartilhe essas informações por nenhum canal
              de atendimento.
            </p>
          </div>
        </section>

        {/* CTA FINAL */}
        <section className="help-cta">
          <span className="cta-decoration">✦</span>

          <div>
            <span className="cta-label">AINDA PRECISA DE AJUDA?</span>
            <h2>Você não precisa descobrir tudo sozinho.</h2>
            <p>
              Se não encontrou a resposta que procurava, entre em
              contato com o suporte do Resgata+.
            </p>
          </div>

          <Link href="/suporte" className="cta-button">
            Falar com o suporte <span>→</span>
          </Link>
        </section>

        {/* RODAPÉ */}
        <footer className="help-footer">
          <div>
            <strong>RESGATA<span>+</span></strong>
            <p>
              Organização financeira, um passo de cada vez.
            </p>
          </div>

          <div className="footer-links">
            <Link href="/">Início</Link>
            <Link href="/suporte">Suporte</Link>
            <Link href="/pagamentos">Planos</Link>
          </div>
        </footer>
      </div>

      <style jsx>{`
        .help-page {
          min-height: 100vh;
          padding: 0 20px 45px;
          color: var(--foreground, #17243a);
          background:
            radial-gradient(
              circle at 90% 8%,
              rgba(104, 76, 204, 0.07),
              transparent 25%
            ),
            var(--background, #f5f7fb);
        }

        .help-container {
          width: 100%;
          max-width: 1040px;
          margin: 0 auto;
        }

        .help-nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 22px 0;
        }

        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: var(--muted, #64748b);
          text-decoration: none;
          font-size: 12px;
          font-weight: 700;
          transition: color 0.2s;
        }

        .back-link:hover {
          color: #2867c2;
        }

        .back-link span {
          font-size: 18px;
        }

        .nav-brand {
          color: #2459ad;
          font-size: 15px;
          font-weight: 950;
          letter-spacing: 1.5px;
        }

        .nav-brand span,
        .help-footer strong span {
          color: #7553cb;
        }

        .help-hero {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 30px;
          min-height: 330px;
          padding: 42px;
          margin-bottom: 42px;
          overflow: hidden;
          border-radius: 24px;
          color: white;
          background: linear-gradient(
            115deg,
            #123c82,
            #2869c5 58%,
            #644ac5
          );
          box-shadow: 0 18px 42px rgba(29, 74, 147, 0.18);
        }

        .hero-content {
          position: relative;
          z-index: 2;
          max-width: 650px;
        }

        .hero-label {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          color: #d8e8ff;
          font-size: 10px;
          font-weight: 850;
          letter-spacing: 1.5px;
        }

        .hero-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #72e2ae;
          box-shadow: 0 0 0 5px rgba(114, 226, 174, 0.14);
        }

        .help-hero h1 {
          margin: 20px 0 14px;
          font-size: clamp(32px, 5vw, 46px);
          line-height: 1.13;
          letter-spacing: -1.6px;
          font-weight: 900;
        }

        .help-hero h1 span {
          color: #bcd5ff;
        }

        .help-hero p {
          max-width: 580px;
          color: #e1edff;
          font-size: 13px;
          line-height: 1.8;
        }

        .hero-button {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          margin-top: 13px;
          padding: 12px 17px;
          border: 1px solid rgba(255, 255, 255, 0.28);
          border-radius: 10px;
          color: #fff;
          background: rgba(255, 255, 255, 0.13);
          font-size: 11px;
          font-weight: 800;
          text-decoration: none;
          transition: background 0.2s, transform 0.2s;
        }

        .hero-button:hover {
          transform: translateY(-2px);
          background: rgba(255, 255, 255, 0.23);
        }

        .hero-art {
          position: relative;
          display: grid;
          place-items: center;
          flex: 0 0 215px;
          height: 220px;
        }

        .art-circle {
          display: grid;
          place-items: center;
          width: 170px;
          height: 170px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.09);
          box-shadow:
            0 0 0 20px rgba(255, 255, 255, 0.045),
            0 0 0 40px rgba(255, 255, 255, 0.025);
        }

        .art-inner {
          display: grid;
          place-items: center;
          width: 105px;
          height: 105px;
          border-radius: 30px;
          background: rgba(255, 255, 255, 0.17);
          border: 1px solid rgba(255, 255, 255, 0.28);
        }

        .art-inner span {
          font-size: 70px;
          font-weight: 900;
          color: white;
        }

        .art-card {
          position: absolute;
          right: -5px;
          bottom: 0;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 14px;
          border-radius: 12px;
          background: #fff;
          color: #1d365f;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.16);
        }

        .art-check {
          display: grid;
          place-items: center;
          width: 30px;
          height: 30px;
          border-radius: 9px;
          color: #17834d;
          background: #e3f7eb;
          font-weight: 900;
        }

        .art-card strong,
        .art-card small {
          display: block;
          white-space: nowrap;
        }

        .art-card strong {
          font-size: 10px;
        }

        .art-card small {
          margin-top: 4px;
          color: #758298;
          font-size: 9px;
        }

        .intro-section {
          margin-bottom: 17px;
        }

        .section-eyebrow {
          display: block;
          margin-bottom: 7px;
          color: #3473c9;
          font-size: 10px;
          font-weight: 850;
          letter-spacing: 1.3px;
        }

        .intro-section h2,
        .faq-heading h2 {
          margin: 0;
          font-size: 23px;
          letter-spacing: -0.6px;
        }

        .intro-section p,
        .faq-heading p {
          margin: 8px 0 0;
          color: var(--muted, #718096);
          font-size: 13px;
          line-height: 1.7;
        }

        .contact-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
          margin-bottom: 45px;
        }

        .contact-card {
          padding: 23px;
          border: 1px solid var(--border, #e3e9f1);
          border-radius: 17px;
          background: var(--card, #fff);
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .contact-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 27px rgba(20, 50, 90, 0.08);
        }

        .support-card {
          border-top: 3px solid #3677d1;
        }

        .whatsapp-card {
          border-top: 3px solid #1a9a58;
        }

        .contact-card-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }

        .contact-icon {
          display: grid;
          place-items: center;
          width: 45px;
          height: 45px;
          border-radius: 13px;
          font-size: 21px;
          font-weight: 900;
        }

        .support-icon {
          color: #2867c2;
          background: #eaf2ff;
        }

        .whatsapp-icon {
          color: #16834b;
          background: #e4f7ec;
        }

        .contact-label {
          color: #8290a3;
          font-size: 9px;
          font-weight: 850;
          letter-spacing: 0.8px;
        }

        .contact-card h3 {
          margin: 19px 0 8px;
          font-size: 17px;
        }

        .contact-card p {
          min-height: 62px;
          margin: 0 0 18px;
          color: var(--muted, #718096);
          font-size: 12px;
          line-height: 1.8;
        }

        .contact-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 13px;
          min-height: 41px;
          padding: 0 15px;
          border-radius: 10px;
          color: white;
          font-size: 11px;
          font-weight: 800;
          text-decoration: none;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .contact-button:hover {
          transform: translateY(-2px);
        }

        .support-button {
          background: linear-gradient(110deg, #2459ad, #397bd4);
          box-shadow: 0 5px 13px rgba(39, 98, 183, 0.18);
        }

        .whatsapp-button {
          background: #168447;
          box-shadow: 0 5px 13px rgba(22, 132, 71, 0.17);
        }

        .unavailable-label {
          color: var(--muted, #718096);
          font-size: 11px;
        }

        .faq-section {
          margin-bottom: 38px;
          scroll-margin-top: 25px;
        }

        .faq-heading {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 15px;
          margin-bottom: 18px;
        }

        .faq-count {
          padding: 7px 11px;
          border-radius: 999px;
          color: #526b8c;
          background: #eaf1fb;
          font-size: 10px;
          font-weight: 800;
          white-space: nowrap;
        }

        .faq-list {
          display: grid;
          gap: 11px;
        }

        .faq-item {
          --faq-accent: #3473c9;
          --faq-background: #eaf2ff;
          overflow: hidden;
          border: 1px solid var(--border, #e3e9f1);
          border-left: 3px solid var(--faq-accent);
          border-radius: 13px;
          background: var(--card, #fff);
          transition: box-shadow 0.2s, border-color 0.2s;
        }

        .faq-item:hover,
        .faq-item[open] {
          box-shadow: 0 7px 20px rgba(20, 50, 90, 0.06);
        }

        .faq-purple {
          --faq-accent: #7952c8;
          --faq-background: #f1ebff;
        }

        .faq-yellow {
          --faq-accent: #c58a19;
          --faq-background: #fff5dc;
        }

        .faq-green {
          --faq-accent: #16834b;
          --faq-background: #e6f7ed;
        }

        .faq-orange {
          --faq-accent: #d87524;
          --faq-background: #fff0e4;
        }

        .faq-red {
          --faq-accent: #cb4c4c;
          --faq-background: #ffeded;
        }

        .faq-item summary {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 17px;
          cursor: pointer;
          list-style: none;
        }

        .faq-item summary::-webkit-details-marker {
          display: none;
        }

        .faq-number {
          display: grid;
          place-items: center;
          flex: 0 0 38px;
          height: 38px;
          border-radius: 11px;
          color: var(--faq-accent);
          background: var(--faq-background);
          font-size: 11px;
          font-weight: 900;
        }

        .faq-question-content {
          display: grid;
          gap: 5px;
          flex: 1;
          min-width: 0;
        }

        .faq-question-content small {
          color: var(--faq-accent);
          font-size: 9px;
          font-weight: 850;
          letter-spacing: 0.7px;
          text-transform: uppercase;
        }

        .faq-question-content strong {
          font-size: 13px;
          line-height: 1.5;
        }

        .faq-toggle {
          display: grid;
          place-items: center;
          flex: 0 0 28px;
          height: 28px;
          border-radius: 50%;
          color: var(--faq-accent);
          background: var(--faq-background);
          font-size: 19px;
          transition: transform 0.2s;
        }

        .faq-item[open] .faq-toggle {
          transform: rotate(45deg);
        }

        .faq-answer {
          padding: 0 20px 18px 69px;
          animation: answer-in 0.2s ease-out;
        }

        .faq-answer p {
          margin: 0;
          color: var(--muted, #66758a);
          font-size: 12px;
          line-height: 1.85;
        }

        @keyframes answer-in {
          from {
            opacity: 0;
            transform: translateY(-5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .privacy-card {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          padding: 22px;
          margin-bottom: 25px;
          border: 1px solid #f0dfb2;
          border-radius: 16px;
          background: #fffaf0;
        }

        .privacy-icon {
          font-size: 25px;
        }

        .privacy-card .section-eyebrow {
          color: #a77922;
        }

        .privacy-card h3 {
          margin: 0;
          color: #664c1d;
          font-size: 16px;
        }

        .privacy-card p {
          margin: 8px 0 0;
          color: #806d49;
          font-size: 12px;
          line-height: 1.8;
        }

        .help-cta {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 22px;
          padding: 28px;
          margin-bottom: 32px;
          overflow: hidden;
          border-radius: 18px;
          color: white;
          background: linear-gradient(110deg, #183f80, #326fc7);
        }

        .cta-decoration {
          position: absolute;
          top: -35px;
          right: 25%;
          color: rgba(255, 255, 255, 0.09);
          font-size: 160px;
          pointer-events: none;
        }

        .help-cta > div {
          position: relative;
          z-index: 1;
        }

        .cta-label {
          color: #c7dcff;
          font-size: 9px;
          font-weight: 850;
          letter-spacing: 1.2px;
        }

        .help-cta h2 {
          margin: 9px 0;
          font-size: 21px;
          letter-spacing: -0.4px;
        }

        .help-cta p {
          max-width: 530px;
          margin: 0;
          color: #dceaff;
          font-size: 11px;
          line-height: 1.7;
        }

        .cta-button {
          position: relative;
          z-index: 1;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          flex-shrink: 0;
          min-height: 43px;
          padding: 0 16px;
          border-radius: 10px;
          color: #204d92;
          background: white;
          font-size: 11px;
          font-weight: 850;
          text-decoration: none;
          transition: transform 0.2s;
        }

        .cta-button:hover {
          transform: translateY(-2px);
        }

        .help-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
          padding: 20px 0 0;
          border-top: 1px solid var(--border, #e1e7ef);
        }

        .help-footer strong {
          color: #2459ad;
          font-size: 13px;
          letter-spacing: 1px;
        }

        .help-footer p {
          margin: 5px 0 0;
          color: var(--muted, #8190a4);
          font-size: 10px;
        }

        .footer-links {
          display: flex;
          flex-wrap: wrap;
          gap: 17px;
        }

        .footer-links a {
          color: var(--muted, #718096);
          font-size: 11px;
          font-weight: 700;
          text-decoration: none;
        }

        .footer-links a:hover {
          color: #2867c2;
        }

        @media (max-width: 700px) {
          .help-page {
            padding: 0 13px 30px;
          }

          .help-nav {
            padding: 17px 0;
          }

          .help-hero {
            min-height: auto;
            padding: 29px 23px;
            margin-bottom: 31px;
            border-radius: 19px;
          }

          .hero-art {
            display: none;
          }

          .help-hero h1 {
            font-size: clamp(30px, 8vw, 39px);
            letter-spacing: -1px;
          }

          .help-hero p {
            font-size: 12px;
          }

          .contact-grid {
            grid-template-columns: 1fr;
            gap: 12px;
            margin-bottom: 35px;
          }

          .contact-card {
            padding: 19px;
          }

          .contact-card p {
            min-height: 0;
          }

          .faq-heading {
            align-items: flex-start;
            flex-direction: column;
          }

          .faq-heading h2,
          .intro-section h2 {
            font-size: 20px;
          }

          .faq-item summary {
            gap: 10px;
            padding: 14px 12px;
          }

          .faq-number {
            flex-basis: 33px;
            height: 33px;
          }

          .faq-question-content strong {
            font-size: 12px;
          }

          .faq-answer {
            padding: 0 15px 16px 55px;
          }

          .privacy-card {
            padding: 17px;
            gap: 11px;
          }

          .help-cta {
            align-items: stretch;
            flex-direction: column;
            padding: 23px;
          }

          .help-cta h2 {
            font-size: 19px;
          }

          .cta-button {
            width: 100%;
            box-sizing: border-box;
          }

          .help-footer {
            align-items: flex-start;
            flex-direction: column;
          }

          .footer-links {
            gap: 15px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .help-page *,
          .help-page *::before,
          .help-page *::after {
            animation-duration: 0.01ms !important;
            transition-duration: 0.01ms !important;
            scroll-behavior: auto !important;
          }
        }
      `}</style>
    </main>
  );
}
