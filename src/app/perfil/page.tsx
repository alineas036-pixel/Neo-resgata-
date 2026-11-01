"use client";

import AppHeader from "@/components/AppHeader";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase";

type Subscription = {
  status: "trial" | "active" | "past_due" | "canceled" | "expired";
  plan: "mensal_9_90";
  created_at: string;
};

const subscriptionLabels: Record<Subscription["status"], string> = {
  trial: "Período de teste registrado",
  active: "Ativa",
  past_due: "Pagamento pendente",
  canceled: "Cancelada",
  expired: "Expirada",
};

export default function ProfilePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadProfile = useCallback(async () => {
    setError("");
    try {
      const supabase = getSupabaseBrowserClient();
      const { data, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;

      if (!data.user) {
        router.replace("/login");
        return;
      }

      setName(String(data.user.user_metadata?.name ?? ""));
      setEmail(data.user.email ?? "");

      const { data: profile, error: profileError } = await supabase
        .from("users")
        .select("name,email")
        .eq("id", data.user.id)
        .maybeSingle();

      if (profileError) throw profileError;

      if (profile?.name) setName(profile.name);
      if (profile?.email) setEmail(profile.email);

      const { data: subscriptionData, error: subscriptionError } = await supabase
        .from("subscriptions")
        .select("status,plan,created_at")
        .eq("user_id", data.user.id)
        .maybeSingle();

      if (subscriptionError) throw subscriptionError;
      setSubscription(subscriptionData as Subscription | null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível carregar os dados da conta.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    const cleanName = name.trim();
    if (cleanName.length < 2) {
      setError("Informe um nome com pelo menos 2 caracteres.");
      return;
    }

    setSaving(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const { data, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!data.user) throw new Error("Sua sessão expirou. Entre novamente.");

      const { error: updateError } = await supabase.auth.updateUser({
        data: { name: cleanName },
      });
      if (updateError) throw updateError;

      const { error: profileError } = await supabase.from("users").upsert({
        id: data.user.id,
        name: cleanName,
        email: data.user.email ?? email,
      });
      if (profileError) throw profileError;

      setName(cleanName);
      setMessage("Seu perfil foi atualizado com sucesso.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível salvar o perfil.");
    } finally {
      setSaving(false);
    }
  }

  const status = subscription?.status;
  const statusClass = status === "active"
    ? "profile-status profile-status--active"
    : status === "trial"
      ? "profile-status profile-status--trial"
      : status
        ? "profile-status profile-status--other"
        : "profile-status";

  return (
    <main className="container page profile-page">
      <AppHeader />
      <header className="profile-heading">
        <div className="profile-avatar" aria-hidden="true">
          {name.trim().charAt(0).toLocaleUpperCase("pt-BR") || "R"}
        </div>
        <div>
          <h1>Meu Perfil</h1>
          <p className="muted">Gerencie seus dados pessoais e consulte seu plano.</p>
        </div>
      </header>

      {loading ? (
        <section className="panel profile-loading" aria-live="polite">
          <p className="muted">Carregando seus dados...</p>
        </section>
      ) : (
        <div className="profile-grid">
          <section className="panel profile-card">
            <div className="profile-section-heading">
              <div>
                <p className="profile-eyebrow">DADOS PESSOAIS</p>
                <h2>Suas Informações</h2>
              </div>
              <span className="profile-icon" aria-hidden="true">♙</span>
            </div>

            <form className="form profile-form" onSubmit={save}>
              <label className="field">
                Nome Completo
                <input
                  required
                  minLength={2}
                  maxLength={120}
                  autoComplete="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Como podemos chamar você?"
                />
              </label>

              <label className="field">
                E-mail da Conta
                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  disabled
                  aria-describedby="profile-email-help"
                />
                <small id="profile-email-help" className="profile-help">
                  O e-mail é gerenciado pelo serviço de autenticação.
                </small>
              </label>

              {error && <p className="error" role="alert">{error}</p>}
              {message && <p className="success" role="status">{message}</p>}

              <button className="btn primary profile-save" disabled={saving}>
                {saving ? "Salvando alterações…" : "Salvar alterações"}
              </button>
            </form>

          </section>

          <section className="panel profile-card">
            <div className="profile-section-heading">
              <div>
                <h2>Seu Plano</h2>
              </div>
              <span className="profile-icon" aria-hidden="true">◇</span>
            </div>

            <div className="profile-plan">
              <div>
                <p className="profile-plan-name">Plano mensal</p>
                <p className="profile-price">
                  R$ 9,90 <span>/ mês</span>
                </p>
              </div>
              <span className="profile-plan-tag">Plano previsto</span>
            </div>

            {subscription ? (
              <div className="profile-subscription">
                <span className="profile-label">Status registrado</span>
                <span className={statusClass}>{subscriptionLabels[subscription.status]}</span>
                <p className="profile-help">
                  Este é o status salvo no banco. Ele, por si só, não comprova pagamento
                  nem confirma uma cobrança ativa.
                </p>
              </div>
            ) : (
              <div className="profile-subscription">
                <span className="profile-label">Status da assinatura</span>
                <span className="profile-status">Nenhuma assinatura cadastrada</span>
                <p className="profile-help">
                  Ainda não há uma assinatura registrada para sua conta.
                </p>
              </div>
            )}

            <div className="profile-notice">
              <strong>Assinatura ainda não disponível</strong>
              <p>
                A contratação será habilitada quando a integração de pagamentos
                estiver pronta. Nenhuma cobrança é realizada por esta página.
              </p>
            </div>
          </section>
        </div>
      )}

      <style jsx>{`
        .profile-page {
          max-width: 1040px;
          padding: 20px;
          border-radius: 26px;
          background: linear-gradient(140deg, #eaf2ff 0%, #e8faf5 52%, #f3edff 100%);
        }
        .profile-heading {
          display: flex; align-items: center; gap: 18px;
          margin: 28px 0 22px;
        }
        .profile-avatar {
          display: grid; place-items: center; flex: 0 0 64px;
          width: 64px; height: 64px; border-radius: 20px;
          background: linear-gradient(135deg, #0f766e, #14b8a6);
          color: white; font-size: 27px; font-weight: 800;
          box-shadow: 0 8px 22px #0f766e26;
        }
        .profile-heading h1 { margin: 2px 0 5px; font-size: clamp(1.8rem, 4vw, 2.5rem); }
        .profile-heading p { margin-bottom: 0; }
        .profile-eyebrow {
          margin: 0 0 5px; color: #0f766e; font-size: 10px;
          font-weight: 800; letter-spacing: 1.5px;
        }
        .profile-grid {
          display: grid; grid-template-columns: minmax(0, 1.1fr) minmax(0, .9fr);
          gap: 18px; align-items: start;
        }
        .profile-card {
          min-width: 0;
          padding: clamp(18px, 3vw, 28px);
          border: 1px solid #d9e6f8;
          border-radius: 22px;
          background: linear-gradient(160deg, #ffffff 0%, #f8fbff 100%);
          box-shadow: 0 10px 28px #3341550d;
        }
        .profile-section-heading {
          display: flex; align-items: center; justify-content: space-between;
          gap: 12px; margin-bottom: 24px;
        }
        .profile-section-heading h2 { margin: 0; font-size: 1.25rem; }
        .profile-icon {
          display: grid; place-items: center; width: 42px; height: 42px;
          border-radius: 13px; background: linear-gradient(135deg, #dbeafe, #d1fae5); color: #0f766e; font-size: 24px;
        }
        .profile-form { gap: 18px; }
        .profile-form input { box-sizing: border-box; width: 100%; min-width: 0; }
        .profile-form input:disabled { opacity: .8; cursor: not-allowed; }
        .profile-help { display: block; margin-top: 7px; color: #64748b; font-size: 12px; line-height: 1.6; }
        .profile-save { width: 100%; min-height: 46px; }
        .profile-plan {
          display: flex; align-items: center; justify-content: space-between;
          gap: 12px; padding: 18px; border: 1px solid #bde9df;
          border-radius: 15px; background: linear-gradient(135deg, #e4faf3, #eff6ff);
        }
        .profile-plan-name { margin: 0 0 7px; font-weight: 700; color: #334155; }
        .profile-price { margin: 0; color: #0f766e; font-size: 27px; font-weight: 850; }
        .profile-price span { font-size: 12px; font-weight: 500; color: #64748b; }
        .profile-plan-tag {
          padding: 6px 9px; border-radius: 999px;
          background: #ffffff; border: 1px solid #a7e3d5;
          color: #0f766e; font-size: 10px; font-weight: 700;
        }
        .profile-subscription { display: grid; gap: 8px; margin-top: 22px; }
        .profile-label { color: #64748b; font-size: 12px; font-weight: 700; }
        .profile-status {
          display: inline-flex; width: fit-content; max-width: 100%;
          padding: 7px 11px; border-radius: 9px; background: #f1f5f9;
          color: #475569; font-size: 12px; font-weight: 750;
        }
        .profile-status--active { background: #dcfce7; color: #166534; }
        .profile-status--trial { background: #dbeafe; color: #1d4ed8; }
        .profile-status--other { background: #ffedd5; color: #9a3412; }
        .profile-notice {
          margin-top: 22px; padding: 15px; border: 1px solid #fdba74;
          border-radius: 14px; background: linear-gradient(135deg, #fff1e6, #fff8ed); color: #9a3412;
        }
        .profile-notice strong { font-size: 13px; }
        .profile-notice p { margin: 7px 0 0; color: #7c2d12; font-size: 12px; line-height: 1.7; }
        .profile-loading { margin-top: 20px; }
        @media (max-width: 760px) {
          .profile-page { padding: 10px; border-radius: 18px; }
          .profile-grid { grid-template-columns: minmax(0, 1fr); }
          .profile-heading { align-items: flex-start; }
          .profile-avatar { flex-basis: 52px; width: 52px; height: 52px; border-radius: 16px; }
          .profile-plan { align-items: flex-start; flex-direction: column; }
        }
      `}</style>
    </main>
  );
}
