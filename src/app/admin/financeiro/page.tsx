import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import styles from "../admin.module.css";
import AdminShell from "../AdminShell";

export const dynamic = "force-dynamic";

const PLAN_PRICE = 9.90;

const statusLabels: Record<string, string> = {
  trial: "Em teste",
  active: "Ativa",
  past_due: "Em atraso",
  canceled: "Cancelada",
  expired: "Expirada",
};

const currency = (value: number) =>
  value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

export default async function AdminFinancePage() {
  const supabase = await getSupabaseServerClient();

  const { data: authData, error: authError } =
    await supabase.auth.getUser();

  if (authError || !authData.user) {
    redirect("/login?next=/admin/financeiro");
  }

  const { data: isAdmin, error: adminError } =
    await supabase.rpc("is_admin");

  if (adminError || isAdmin !== true) {
    redirect("/dashboard");
  }

  const { data: subscriptions, error } = await supabase
    .from("subscriptions")
    .select("id, user_id, plan, status, created_at")
    .order("created_at", { ascending: false });

  const items = subscriptions ?? [];

  const userIds = [...new Set(items.map((item) => item.user_id))];

  const { data: users, error: usersError } = userIds.length
    ? await supabase
        .from("users")
        .select("id, name, email")
        .in("id", userIds)
    : { data: [], error: null };

  const usersById = new Map(
    (users ?? []).map((user) => [user.id, user])
  );

  const countStatus = (status: string) =>
    items.filter((item) => item.status === status).length;

  const total = items.length;
  const active = countStatus("active");
  const trial = countStatus("trial");
  const pastDue = countStatus("past_due");
  const canceled = countStatus("canceled");
  const expired = countStatus("expired");

  const monthlyEstimate = active * PLAN_PRICE;

  return (
    <AdminShell>
      <div className={styles.dashboardContent}>
        <header className={styles.header}>
          <div>
            <span className={styles.eyebrow}>
              RESGATA+ · ADMINISTRAÇÃO
            </span>
            <h1>Financeiro</h1>
            <p>
              Acompanhe as assinaturas e a previsão financeira da plataforma.
            </p>
          </div>
          <a href="/admin" className={styles.back}>
            Voltar à visão geral
          </a>
        </header>

        {error ? (
          <section className={styles.panel}>
            <p className={styles.error}>
              Não foi possível carregar os dados financeiros.
            </p>
          </section>
        ) : (
          <>
            <section className={styles.cards}>
              <article className={styles.card}>
                <span>Total de assinaturas</span>
                <strong>{total}</strong>
                <small>Registros encontrados no Supabase</small>
              </article>

              <article className={styles.card}>
                <span>Assinaturas ativas</span>
                <strong>{active}</strong>
                <small>Planos com status ativo</small>
              </article>

              <article className={styles.card}>
                <span>Previsão mensal</span>
                <strong>{currency(monthlyEstimate)}</strong>
                <small>
                  Estimativa baseada nas assinaturas ativas a R$ 9,90
                </small>
              </article>
            </section>

            <section className={styles.panel}>
              <div className={styles.panelHeader}>
                <div>
                  <h2>Situação das assinaturas</h2>
                  <p>Distribuição dos planos cadastrados.</p>
                </div>
              </div>

              <div className={styles.cards}>
                {[
                  ["Em teste", trial],
                  ["Ativas", active],
                  ["Em atraso", pastDue],
                  ["Canceladas", canceled],
                  ["Expiradas", expired],
                ].map(([label, value]) => (
                  <article className={styles.card} key={label}>
                    <span>{label}</span>
                    <strong>{value}</strong>
                  </article>
                ))}
              </div>
            </section>

            <section className={styles.panel}>
              <div className={styles.panelHeader}>
                <div>
                  <h2>Assinaturas cadastradas</h2>
                  <p>Histórico dos registros mais recentes.</p>
                </div>
                <span className={styles.count}>
                  {total} assinaturas
                </span>
              </div>

              {items.length === 0 ? (
                <p className={styles.empty}>
                  Nenhuma assinatura encontrada.
                </p>
              ) : (
                <div className={styles.tableWrap}>
                  <table>
                    <thead>
                      <tr>
                        <th>Usuário</th>
                        <th>Plano</th>
                        <th>Status</th>
                        <th>Cadastro</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.slice(0, 50).map((item) => {
                        const user = usersById.get(item.user_id);

                        return (
                          <tr key={item.id}>
                            <td>
                              {user?.name ?? "Usuário não encontrado"}
                              <br />
                              <small>{user?.email ?? ""}</small>
                            </td>
                            <td>
                              {item.plan === "mensal_9_90"
                                ? "Mensal · R$ 9,90"
                                : item.plan}
                            </td>
                            <td>
                              <span className={styles.status}>
                                {statusLabels[item.status] ?? item.status}
                              </span>
                            </td>
                            <td>
                              {new Date(item.created_at).toLocaleDateString(
                                "pt-BR",
                                { timeZone: "UTC" }
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {usersError && (
                <p className={styles.error}>
                  Não foi possível carregar os nomes dos usuários.
                </p>
              )}
            </section>

            <footer className={styles.footer}>
              A previsão mensal considera apenas assinaturas ativas.
              Não representa pagamentos confirmados ou receita recebida.
            </footer>
          </>
        )}
      </div>
    </AdminShell>
  );
}
