
"use client";

import AppHeader from "@/components/AppHeader";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import {
  useCallback,
  useEffect,
  useState,
  type FormEvent,
} from "react";
import { useRouter } from "next/navigation";

type Ticket = {
  id: string;
  subject: string;
  message: string;
  status: string;
  admin_response: string | null;
  created_at: string;
  updated_at: string;
  replied_at: string | null;
};

const statusLabels: Record<string, string> = {
  open: "Aberto",
  in_progress: "Em atendimento",
  answered: "Respondido",
  closed: "Encerrado",
};

const statusColors: Record<string, string> = {
  open: "open",
  in_progress: "progress",
  answered: "answered",
  closed: "closed",
};

function dateLabel(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Data indisponível";
  }

  return date.toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

export default function SupportPage() {
  const router = useRouter();

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const whatsappNumber =
    process.env.NEXT_PUBLIC_RESGATA_SUPPORT_WHATSAPP?.replace(
      /\D/g,
      ""
    ) ?? "";

  const whatsappMessage = encodeURIComponent(
    "Olá! Preciso de ajuda com o aplicativo Resgata+."
  );

  const whatsappUrl = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`
    : "";

  const openTickets = tickets.filter(
    (ticket) =>
      ticket.status === "open" ||
      ticket.status === "in_progress"
  ).length;

  const answeredTickets = tickets.filter(
    (ticket) => ticket.status === "answered"
  ).length;

  const loadTickets = useCallback(async () => {
    const supabase = getSupabaseBrowserClient();

    const { data: auth, error: authError } =
      await supabase.auth.getUser();

    if (authError) throw authError;

    if (!auth.user) {
      router.replace("/login");
      return;
    }

    const { data, error: queryError } = await supabase
      .from("support_tickets")
      .select(
        "id,subject,message,status,admin_response,created_at,updated_at,replied_at"
      )
      .eq("user_id", auth.user.id)
      .order("created_at", { ascending: false });

    if (queryError) throw queryError;

    setTickets((data ?? []) as Ticket[]);
  }, [router]);

  useEffect(() => {
    let active = true;

    async function initialize() {
      try {
        await loadTickets();
      } catch (e) {
        if (active) {
          setError(
            e instanceof Error
              ? e.message
              : "Não foi possível carregar seus chamados."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void initialize();

    return () => {
      active = false;
    };
  }, [loadTickets]);

  async function refreshTickets() {
    setError("");
    setRefreshing(true);

    try {
      await loadTickets();
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Não foi possível atualizar os chamados."
      );
    } finally {
      setRefreshing(false);
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setNotice("");

    const cleanSubject = subject.trim();
    const cleanMessage = message.trim();

    if (cleanSubject.length < 4) {
      setError("O assunto precisa ter pelo menos 4 caracteres.");
      return;
    }

    if (cleanMessage.length < 10) {
      setError("Descreva sua dificuldade com pelo menos 10 caracteres.");
      return;
    }

    if (saving) return;

    setSaving(true);

    try {
      const supabase = getSupabaseBrowserClient();

      const { data: auth, error: authError } =
        await supabase.auth.getUser();

      if (authError) throw authError;

      if (!auth.user) {
        router.replace("/login");
        return;
      }

      const { error: insertError } = await supabase
        .from("support_tickets")
        .insert({
          user_id: auth.user.id,
          subject: cleanSubject,
          message: cleanMessage,
          status: "open",
        });

      if (insertError) throw insertError;

      setSubject("");
      setMessage("");

      await loadTickets();

      setNotice(
        "Seu chamado foi enviado! Agora você pode acompanhar o atendimento nesta página."
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Não foi possível enviar seu chamado. Tente novamente."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="support-page">
      <AppHeader />

      <div className="support-container">
        {/* APRESENTAÇÃO */}
        <section className="support-hero">
          <div className="hero-content">
            <span className="hero-label">
              <span className="hero-label-dot" />
              CENTRAL DE ATENDIMENTO RESGATA+
            </span>

            <h1>
              Estamos aqui para
              <br />
              <span>ajudar você.</span>
            </h1>

            <p>
              Conte com a nossa equipe para esclarecer dúvidas,
              resolver dificuldades e ajudar você a aproveitar
              melhor o Resgata+.
            </p>

            <div className="hero-trust">
              <span>✓ Atendimento organizado</span>
              <span>✓ Histórico de solicitações</span>
              <span>✓ Acompanhamento pelo aplicativo</span>
            </div>
          </div>

          <div className="hero-decoration" aria-hidden="true">
            <div className="hero-icon-circle">
              <span>✦</span>
            </div>
            <div className="hero-floating-card">
              <span className="floating-check">✓</span>
              <div>
                <strong>Conte com a gente</strong>
                <small>Um passo de cada vez.</small>
              </div>
            </div>
          </div>
        </section>

        {/* MENSAGENS */}
        {error && (
          <div className="feedback feedback-error" role="alert">
            <span className="feedback-icon">!</span>
            <span>{error}</span>
            <button
              type="button"
              onClick={() => setError("")}
              aria-label="Fechar mensagem"
            >
              ×
            </button>
          </div>
        )}

        {notice && (
          <div className="feedback feedback-success" role="status">
            <span className="feedback-icon">✓</span>
            <span>{notice}</span>
            <button
              type="button"
              onClick={() => setNotice("")}
              aria-label="Fechar mensagem"
            >
              ×
            </button>
          </div>
        )}

        {/* RESUMO */}
        <section className="support-stats">
          <article className="stat-card stat-blue">
            <div className="stat-icon">◷</div>
            <div>
              <span>Chamados em andamento</span>
              <strong>{loading ? "—" : openTickets}</strong>
            </div>
          </article>

          <article className="stat-card stat-green">
            <div className="stat-icon">✓</div>
            <div>
              <span>Chamados respondidos</span>
              <strong>{loading ? "—" : answeredTickets}</strong>
            </div>
          </article>

          <article className="stat-card stat-purple">
            <div className="stat-icon">▤</div>
            <div>
              <span>Total de solicitações</span>
              <strong>{loading ? "—" : tickets.length}</strong>
            </div>
          </article>
        </section>

        {/* CANAIS DE ATENDIMENTO */}
        <section className="section-heading">
          <div>
            <span className="section-eyebrow">COMO PODEMOS AJUDAR?</span>
            <h2>Escolha como falar com a gente</h2>
            <p>
              Utilize o canal que for mais conveniente para você.
            </p>
          </div>
        </section>

        <section className="contact-grid">
          <article className="contact-card contact-ticket">
            <div className="contact-icon">✉</div>

            <span className="contact-tag">RECOMENDADO</span>

            <h3>Abra um chamado</h3>

            <p>
              Descreva sua dúvida ou dificuldade e acompanhe
              a resposta da nossa equipe diretamente pelo aplicativo.
            </p>

            <a href="#novo-chamado" className="contact-link">
              Abrir chamado <span>→</span>
            </a>
          </article>

          <article className="contact-card contact-whatsapp">
            <div className="contact-icon">◉</div>

            <span className="contact-tag">CONTATO DIRETO</span>

            <h3>Converse pelo WhatsApp</h3>

            <p>
              Prefere conversar? Entre em contato pelo WhatsApp
              para receber orientações sobre o aplicativo.
            </p>

            {whatsappUrl ? (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="contact-link"
              >
                Iniciar conversa <span>↗</span>
              </a>
            ) : (
              <span className="contact-unavailable">
                Disponível em breve
              </span>
            )}
          </article>
        </section>

        {/* FORMULÁRIO */}
        <section
          id="novo-chamado"
          className="support-panel form-panel"
        >
          <div className="panel-heading">
            <div className="panel-heading-icon">✎</div>
            <div>
              <span className="section-eyebrow">PRECISA DE AJUDA?</span>
              <h2>Abra um chamado</h2>
              <p>
                Explique o que aconteceu. Nossa equipe poderá
                analisar sua solicitação.
              </p>
            </div>
          </div>

          <form onSubmit={submit} className="support-form">
            <div className="form-field">
              <label htmlFor="support-subject">
                Assunto <span>*</span>
              </label>

              <input
                id="support-subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                maxLength={120}
                required
                minLength={4}
                placeholder="Ex.: Não consigo atualizar uma conta"
              />

              <small>
                Seja breve e objetivo para facilitar o atendimento.
              </small>
            </div>

            <div className="form-field">
              <div className="label-row">
                <label htmlFor="support-message">
                  Descreva sua dificuldade <span>*</span>
                </label>

                <small>{message.length}/5000</small>
              </div>

              <textarea
                id="support-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={5000}
                required
                minLength={10}
                rows={6}
                placeholder="Conte para nós o que aconteceu e em qual parte do aplicativo você precisa de ajuda..."
              />

              <small>
                Não precisa compartilhar informações bancárias ou
                dados pessoais sensíveis.
              </small>
            </div>

            <div className="form-footer">
              <p>
                <span>🔒</span>
                Sua solicitação será registrada na sua conta.
              </p>

              <button
                className="submit-button"
                type="submit"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <span className="button-spinner" />
                    Enviando...
                  </>
                ) : (
                  <>
                    Enviar chamado <span>→</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </section>

        {/* HISTÓRICO */}
        <section className="support-panel history-panel">
          <div className="history-heading">
            <div className="panel-heading">
              <div className="panel-heading-icon history-icon">▤</div>
              <div>
                <span className="section-eyebrow">ACOMPANHAMENTO</span>
                <h2>Meus chamados</h2>
                <p>
                  Consulte suas solicitações e as respostas da equipe.
                </p>
              </div>
            </div>

            <button
              type="button"
              className="refresh-button"
              onClick={refreshTickets}
              disabled={refreshing || loading}
            >
              <span className={refreshing ? "refresh-spinning" : ""}>
                ↻
              </span>
              {refreshing ? "Atualizando..." : "Atualizar"}
            </button>
          </div>

          {loading ? (
            <div className="empty-state">
              <div className="loading-spinner" />
              <strong>Carregando seu histórico</strong>
              <p>Aguarde enquanto buscamos suas solicitações.</p>
            </div>
          ) : tickets.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">✉</div>
              <strong>Você ainda não abriu chamados</strong>
              <p>
                Quando precisar de ajuda, envie sua primeira
                solicitação. Seu histórico ficará disponível aqui.
              </p>
              <a href="#novo-chamado" className="empty-link">
                Criar meu primeiro chamado <span>→</span>
              </a>
            </div>
          ) : (
            <div className="ticket-list">
              {tickets.map((ticket) => {
                const statusClass =
                  statusColors[ticket.status] ?? "open";

                return (
                  <article className="ticket-card" key={ticket.id}>
                    <div className="ticket-top">
                      <div className="ticket-title">
                        <h3>{ticket.subject}</h3>
                        <span>
                          Enviado em {dateLabel(ticket.created_at)}
                        </span>
                      </div>

                      <span className={`ticket-status ${statusClass}`}>
                        <span className="status-dot" />
                        {statusLabels[ticket.status] ?? ticket.status}
                      </span>
                    </div>

                    <div className="ticket-message">
                      <span className="message-label">SUA MENSAGEM</span>
                      <p>{ticket.message}</p>
                    </div>

                    {ticket.admin_response && (
                      <div className="admin-response">
                        <div className="response-heading">
                          <span className="response-icon">✓</span>
                          <strong>Resposta da equipe Resgata+</strong>
                        </div>

                        <p>{ticket.admin_response}</p>

                        {ticket.replied_at && (
                          <small>
                            Respondido em {dateLabel(ticket.replied_at)}
                          </small>
                        )}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* SEGURANÇA */}
        <section className="security-notice">
          <div className="security-icon">🔐</div>
          <div>
            <strong>Cuide da sua segurança</strong>
            <p>
              Nunca envie senhas, códigos de autenticação, CPF completo,
              números de cartão ou credenciais bancárias pelo chamado
              ou WhatsApp. Nossa equipe não precisa dessas informações
              para orientar você.
            </p>
          </div>
        </section>

        <footer className="support-footer">
          <span>RESGATA+</span>
          <p>
            Estamos aqui para ajudar você a dar o próximo passo.
          </p>
        </footer>
      </div>

      <style jsx>{`
        .support-page {
          min-height: 100vh;
          padding: 0 20px 50px;
          background:
            radial-gradient(
              circle at 10% 5%,
              rgba(55, 115, 220, 0.07),
              transparent 28%
            ),
            var(--background, #f5f7fb);
          color: var(--foreground, #17243a);
        }

        .support-container {
          width: 100%;
          max-width: 1080px;
          margin: 0 auto;
        }

        .support-hero {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 30px;
          min-height: 280px;
          margin: 30px 0 24px;
          padding: 38px 42px;
          overflow: hidden;
          border-radius: 24px;
          color: white;
          background: linear-gradient(120deg, #123c82, #2563c7 58%, #694bd0);
          box-shadow: 0 16px 40px rgba(27, 73, 145, 0.19);
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
          margin-bottom: 17px;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 1.5px;
          color: #d9e8ff;
        }

        .hero-label-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #71e2b0;
          box-shadow: 0 0 0 5px rgba(113, 226, 176, 0.14);
        }

        .support-hero h1 {
          margin: 0;
          font-size: clamp(32px, 5vw, 46px);
          line-height: 1.12;
          letter-spacing: -1.6px;
          font-weight: 850;
        }

        .support-hero h1 span {
          color: #b9d5ff;
        }

        .support-hero p {
          max-width: 580px;
          margin: 15px 0 20px;
          color: #e2edff;
          font-size: 14px;
          line-height: 1.8;
        }

        .hero-trust {
          display: flex;
          flex-wrap: wrap;
          gap: 10px 18px;
          color: #e5f0ff;
          font-size: 11px;
          font-weight: 600;
        }

        .hero-decoration {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          flex: 0 0 210px;
          height: 190px;
        }

        .hero-icon-circle {
          display: grid;
          place-items: center;
          width: 145px;
          height: 145px;
          border: 1px solid rgba(255, 255, 255, 0.25);
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.12);
          box-shadow:
            0 0 0 18px rgba(255, 255, 255, 0.05),
            0 0 0 38px rgba(255, 255, 255, 0.035);
        }

        .hero-icon-circle span {
          font-size: 70px;
          color: #fff;
        }

        .hero-floating-card {
          position: absolute;
          right: -5px;
          bottom: 4px;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 13px 16px;
          border: 1px solid rgba(255, 255, 255, 0.35);
          border-radius: 13px;
          background: rgba(255, 255, 255, 0.96);
          color: #17315d;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
        }

        .floating-check {
          display: grid;
          place-items: center;
          width: 30px;
          height: 30px;
          border-radius: 9px;
          color: #137b48;
          background: #dff7e9;
          font-weight: 900;
        }

        .hero-floating-card strong,
        .hero-floating-card small {
          display: block;
        }

        .hero-floating-card strong {
          font-size: 11px;
        }

        .hero-floating-card small {
          margin-top: 3px;
          font-size: 10px;
          color: #68768c;
        }

        .feedback {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 18px;
          padding: 14px 16px;
          border: 1px solid transparent;
          border-radius: 12px;
          font-size: 13px;
          line-height: 1.5;
        }

        .feedback button {
          margin-left: auto;
          border: 0;
          background: transparent;
          color: inherit;
          font-size: 21px;
          cursor: pointer;
        }

        .feedback-icon {
          display: grid;
          place-items: center;
          flex: 0 0 25px;
          height: 25px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.65);
          font-weight: 900;
        }

        .feedback-error {
          color: #a32323;
          background: #fff0ef;
          border-color: #ffd8d4;
        }

        .feedback-success {
          color: #17683b;
          background: #eaf8ef;
          border-color: #c9efd7;
        }

        .support-stats {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 15px;
          margin-bottom: 36px;
        }

        .stat-card {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 19px;
          border: 1px solid var(--border, #e4e9f1);
          border-radius: 15px;
          background: var(--card, #fff);
          box-shadow: 0 4px 15px rgba(20, 45, 85, 0.035);
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .stat-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 24px rgba(20, 45, 85, 0.08);
        }

        .stat-icon {
          display: grid;
          place-items: center;
          flex: 0 0 45px;
          height: 45px;
          border-radius: 13px;
          font-size: 21px;
          font-weight: 800;
        }

        .stat-card span {
          display: block;
          margin-bottom: 5px;
          color: var(--muted, #68758a);
          font-size: 11px;
          font-weight: 600;
        }

        .stat-card strong {
          font-size: 25px;
          line-height: 1;
        }

        .stat-blue .stat-icon {
          color: #2865c4;
          background: #e8f1ff;
        }

        .stat-green .stat-icon {
          color: #16834b;
          background: #e4f7ec;
        }

        .stat-purple .stat-icon {
          color: #7048bf;
          background: #f0eaff;
        }

        .section-heading {
          margin-bottom: 17px;
        }

        .section-eyebrow {
          display: block;
          margin-bottom: 6px;
          color: #3671c8;
          font-size: 10px;
          font-weight: 850;
          letter-spacing: 1.3px;
        }

        .section-heading h2,
        .panel-heading h2 {
          margin: 0;
          font-size: 21px;
          letter-spacing: -0.5px;
        }

        .section-heading p,
        .panel-heading p {
          margin: 6px 0 0;
          color: var(--muted, #718096);
          font-size: 13px;
          line-height: 1.6;
        }

        .contact-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
          margin-bottom: 30px;
        }

        .contact-card {
          position: relative;
          padding: 23px;
          border: 1px solid var(--border, #e4e9f1);
          border-radius: 17px;
          background: var(--card, #fff);
          overflow: hidden;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .contact-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 26px rgba(20, 45, 85, 0.08);
        }

        .contact-ticket {
          border-top: 3px solid #3477d4;
        }

        .contact-whatsapp {
          border-top: 3px solid #1b9b5b;
        }

        .contact-icon {
          display: grid;
          place-items: center;
          width: 45px;
          height: 45px;
          margin-bottom: 15px;
          border-radius: 13px;
          color: #2867c2;
          background: #eaf2ff;
          font-size: 22px;
          font-weight: 800;
        }

        .contact-whatsapp .contact-icon {
          color: #16834b;
          background: #e4f7ec;
        }

        .contact-tag {
          position: absolute;
          top: 24px;
          right: 20px;
          padding: 6px 9px;
          border-radius: 999px;
          color: #2867c2;
          background: #edf4ff;
          font-size: 9px;
          font-weight: 850;
          letter-spacing: 0.5px;
        }

        .contact-whatsapp .contact-tag {
          color: #16834b;
          background: #e9f8ef;
        }

        .contact-card h3 {
          margin: 0;
          font-size: 17px;
        }

        .contact-card p {
          min-height: 61px;
          margin: 9px 0 15px;
          color: var(--muted, #718096);
          font-size: 13px;
          line-height: 1.7;
        }

        .contact-link {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          min-height: 44px;
          padding: 0 17px;
          border: 1px solid #2867c2;
          border-radius: 11px;
          background: linear-gradient(110deg, #2459ad, #397bd4);
          color: #fff;
          font-size: 12px;
          font-weight: 800;
          text-decoration: none;
          box-shadow: 0 5px 13px rgba(39, 98, 183, 0.16);
          transition: transform 0.2s, box-shadow 0.2s, filter 0.2s;
        }

        .contact-link:hover {
          transform: translateY(-2px);
          filter: brightness(1.06);
          box-shadow: 0 9px 19px rgba(39, 98, 183, 0.23);
        }

        .contact-link:focus-visible,
        .submit-button:focus-visible,
        .refresh-button:focus-visible,
        .empty-link:focus-visible {
          outline: 3px solid rgba(55, 115, 205, 0.35);
          outline-offset: 3px;
        }

        .contact-link span,
        .empty-link span {
          transition: transform 0.2s;
        }

        .contact-link:hover span,
        .empty-link:hover span {
          transform: translateX(4px);
        }

        .contact-whatsapp .contact-link {
          border-color: #16834b;
          background: linear-gradient(110deg, #128447, #20a663);
          color: #fff;
          box-shadow: 0 5px 13px rgba(22, 131, 75, 0.16);
        }

        .contact-whatsapp .contact-link:hover {
          box-shadow: 0 9px 19px rgba(22, 131, 75, 0.23);
        }

        .contact-unavailable {
          color: var(--muted, #718096);
          font-size: 12px;
          font-weight: 700;
        }

        .support-panel {
          padding: 26px;
          margin-bottom: 24px;
          border: 1px solid var(--border, #e4e9f1);
          border-radius: 18px;
          background: var(--card, #fff);
          box-shadow: 0 5px 20px rgba(20, 45, 85, 0.035);
        }

        .panel-heading {
          display: flex;
          align-items: flex-start;
          gap: 14px;
        }

        .panel-heading-icon {
          display: grid;
          place-items: center;
          flex: 0 0 44px;
          height: 44px;
          border-radius: 13px;
          color: #2867c2;
          background: #eaf2ff;
          font-size: 21px;
        }

        .history-icon {
          color: #7048bf;
          background: #f0eaff;
        }

        .support-form {
          display: grid;
          gap: 20px;
          margin-top: 26px;
        }

        .form-field {
          display: grid;
          gap: 8px;
        }

        .form-field label {
          color: var(--foreground, #25344c);
          font-size: 13px;
          font-weight: 750;
        }

        .form-field label span {
          color: #df4b4b;
        }

        .form-field input,
        .form-field textarea {
          box-sizing: border-box;
          width: 100%;
          padding: 13px 14px;
          border: 1px solid var(--border, #dfe5ee);
          border-radius: 11px;
          outline: none;
          background: var(--background, #fff);
          color: inherit;
          font: inherit;
          font-size: 13px;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .form-field input {
          min-height: 48px;
        }

        .form-field textarea {
          min-height: 145px;
          resize: vertical;
          line-height: 1.7;
        }

        .form-field input:focus,
        .form-field textarea:focus {
          border-color: #4a82d4;
          box-shadow: 0 0 0 3px rgba(55, 115, 205, 0.12);
        }

        .form-field input::placeholder,
        .form-field textarea::placeholder {
          color: #9aa6b7;
        }

        .form-field > small,
        .label-row small {
          color: var(--muted, #8190a4);
          font-size: 11px;
          line-height: 1.5;
        }

        .label-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
        }

        .form-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding-top: 17px;
          border-top: 1px solid var(--border, #e8edf3);
        }

        .form-footer p {
          margin: 0;
          color: var(--muted, #718096);
          font-size: 11px;
          line-height: 1.5;
        }

        .form-footer p span {
          margin-right: 5px;
        }

        .submit-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          min-height: 46px;
          padding: 0 21px;
          border: 0;
          border-radius: 11px;
          background: linear-gradient(110deg, #2459ad, #397bd4);
          color: white;
          font-size: 12px;
          font-weight: 800;
          cursor: pointer;
          box-shadow: 0 6px 15px rgba(39, 98, 183, 0.2);
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .submit-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 9px 20px rgba(39, 98, 183, 0.27);
        }

        .submit-button:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        .button-spinner,
        .loading-spinner {
          width: 17px;
          height: 17px;
          border: 2px solid currentColor;
          border-right-color: transparent;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        .history-heading {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
          margin-bottom: 22px;
        }

        .refresh-button {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          min-height: 39px;
          padding: 0 13px;
          border: 1px solid var(--border, #dfe5ee);
          border-radius: 10px;
          background: var(--card, #fff);
          color: var(--foreground, #25344c);
          font-size: 11px;
          font-weight: 750;
          cursor: pointer;
        }

        .refresh-button:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        .refresh-button > span {
          font-size: 18px;
        }

        .refresh-spinning {
          animation: spin 0.8s linear infinite;
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 230px;
          padding: 25px;
          border: 1px dashed var(--border, #dfe5ee);
          border-radius: 14px;
          text-align: center;
          background: var(--background, #f9fbfe);
        }

        .empty-icon {
          display: grid;
          place-items: center;
          width: 55px;
          height: 55px;
          margin-bottom: 13px;
          border-radius: 17px;
          background: #eaf2ff;
          color: #2867c2;
          font-size: 25px;
        }

        .empty-state strong {
          font-size: 14px;
        }

        .empty-state p {
          max-width: 380px;
          margin: 8px 0 15px;
          color: var(--muted, #718096);
          font-size: 12px;
          line-height: 1.7;
        }

        .empty-link {
          display: inline-flex;
          gap: 8px;
          color: #2867c2;
          font-size: 12px;
          font-weight: 800;
          text-decoration: none;
        }

        .loading-spinner {
          width: 25px;
          height: 25px;
          margin-bottom: 14px;
          color: #3477d4;
          border-width: 3px;
        }

        .ticket-list {
          display: grid;
          gap: 14px;
        }

        .ticket-card {
          min-width: 0;
          padding: 19px;
          border: 1px solid var(--border, #e4e9f1);
          border-radius: 14px;
          background: var(--card, #fff);
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .ticket-card:hover {
          border-color: #c5d7f1;
          box-shadow: 0 5px 16px rgba(30, 70, 125, 0.055);
        }

        .ticket-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
        }

        .ticket-title {
          min-width: 0;
        }

        .ticket-title h3 {
          margin: 0 0 6px;
          overflow-wrap: anywhere;
          font-size: 15px;
        }

        .ticket-title > span {
          color: var(--muted, #8190a4);
          font-size: 10px;
        }

        .ticket-status {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          flex-shrink: 0;
          padding: 7px 10px;
          border-radius: 999px;
          font-size: 10px;
          font-weight: 800;
          white-space: nowrap;
        }

        .status-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: currentColor;
        }

        .ticket-status.open {
          color: #946200;
          background: #fff5d9;
        }

        .ticket-status.progress {
          color: #2457a6;
          background: #e8f1ff;
        }

        .ticket-status.answered {
          color: #18743b;
          background: #e7f8ed;
        }

        .ticket-status.closed {
          color: #555;
          background: #f0f0f0;
        }

        .ticket-message {
          margin-top: 17px;
          padding: 13px 14px;
          border-radius: 10px;
          background: var(--background, #f7f9fc);
        }

        .message-label {
          color: #8491a4;
          font-size: 9px;
          font-weight: 850;
          letter-spacing: 0.8px;
        }

        .ticket-message p,
        .admin-response p {
          margin: 7px 0 0;
          color: var(--foreground, #334155);
          font-size: 12px;
          line-height: 1.75;
          white-space: pre-wrap;
          overflow-wrap: anywhere;
        }

        .admin-response {
          margin-top: 13px;
          padding: 15px;
          border: 1px solid #ccebd8;
          border-radius: 11px;
          background: #f0fbf4;
        }

        .response-heading {
          display: flex;
          align-items: center;
          gap: 9px;
          color: #17683b;
          font-size: 12px;
        }

        .response-icon {
          display: grid;
          place-items: center;
          width: 25px;
          height: 25px;
          border-radius: 8px;
          background: #d9f3e3;
          font-weight: 900;
        }

        .admin-response p {
          color: #28543b;
        }

        .admin-response small {
          display: block;
          margin-top: 10px;
          color: #64836f;
          font-size: 10px;
        }

        .security-notice {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          padding: 18px 20px;
          border: 1px solid #f0dfb2;
          border-radius: 14px;
          background: #fffaf0;
        }

        .security-icon {
          font-size: 22px;
        }

        .security-notice strong {
          color: #785719;
          font-size: 12px;
        }

        .security-notice p {
          margin: 5px 0 0;
          color: #806d49;
          font-size: 11px;
          line-height: 1.7;
        }

        .support-footer {
          padding: 28px 10px 0;
          text-align: center;
        }

        .support-footer span {
          color: #3471c5;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 2px;
        }

        .support-footer p {
          margin: 6px 0 0;
          color: var(--muted, #8190a4);
          font-size: 11px;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 700px) {
          .support-page {
            padding: 0 13px 35px;
          }

          .support-hero {
            min-height: auto;
            margin-top: 20px;
            padding: 28px 23px;
            border-radius: 19px;
          }

          .hero-decoration {
            display: none;
          }

          .support-hero h1 {
            font-size: clamp(30px, 8vw, 39px);
          }

          .hero-trust {
            display: grid;
            gap: 9px;
          }

          .support-stats {
            grid-template-columns: 1fr;
            gap: 10px;
            margin-bottom: 28px;
          }

          .stat-card {
            padding: 14px 16px;
          }

          .stat-icon {
            flex-basis: 40px;
            height: 40px;
          }

          .stat-card strong {
            font-size: 22px;
          }

          .contact-grid {
            grid-template-columns: 1fr;
            gap: 12px;
          }

          .contact-card {
            padding: 19px;
          }

          .contact-card p {
            min-height: 0;
          }

          .support-panel {
            padding: 19px 15px;
            border-radius: 15px;
          }

          .panel-heading {
            gap: 10px;
          }

          .panel-heading-icon {
            flex-basis: 38px;
            height: 38px;
          }

          .section-heading h2,
          .panel-heading h2 {
            font-size: 18px;
          }

          .form-footer {
            align-items: stretch;
            flex-direction: column;
          }

          .submit-button {
            width: 100%;
          }

          .history-heading {
            align-items: flex-start;
            flex-direction: column;
          }

          .refresh-button {
            align-self: flex-end;
          }

          .ticket-card {
            padding: 15px;
          }

          .ticket-top {
            flex-direction: column;
          }

          .ticket-status {
            align-self: flex-start;
          }

          .security-notice {
            padding: 15px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .support-page *,
          .support-page *::before,
          .support-page *::after {
            scroll-behavior: auto !important;
            animation-duration: 0.01ms !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </main>
  );
}
