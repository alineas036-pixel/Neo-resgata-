import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import styles from "../admin.module.css";
import AdminShell from "../AdminShell";

export const dynamic = "force-dynamic";

const statusLabels: Record<string, string> = {
  trial: "Em teste",
  active: "Ativa",
  past_due: "Em atraso",
  canceled: "Cancelada",
  expired: "Expirada",
};

export default async function AdminSubscriptionsPage() {
  const supabase = await getSupabaseServerClient();

  const { data: authData, error: authError } =
    await supabase.auth.getUser();

  if (authError || !authData.user) {
    redirect("/login?next=/admin/assinaturas");
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

  return (
    <AdminShell>
      <div className={styles.dashboardContent}>
        <header className={styles.header}>
          <div>
            <span className={styles.eyebrow}>
              RESGATA+ · ADMINISTRAÇÃO
            </span>
            <h1>Assinaturas</h1>
            <p>
              Consulte os planos e acompanhe a situação dos assinantes.
            </p>
          </div>
          <a href="/admin" className={styles.back}>
            Voltar à visão geral
          </a>
        </header>

        {error ? (
          <section className={styles.panel}>
            <p className={styles.error}>
              Não foi possível carregar as assinaturas.
            </p>
          </section>
        ) : (
          <>
            <section className={styles.cards}>
              <article className={styles.card}>
                <span>Total de assinaturas</span>
                <strong>{items.length}</strong>
                <small>Registros encontrados</small>
              </article>
              <article className={styles.card}>
                <span>Ativas</span>
                <strong>{countStatus("active")}</strong>
                <small>Planos em situação ativa</small>
              </article>
              <article className={styles.card}>
                <span>Em período de teste</span>
                <strong>{countStatus("trial")}</strong>
                <small>Assinaturas em teste</small>
              </article>
            </section>

            <section className={styles.panel}>
              <div className={styles.panelHeader}>
                <div>
                  <h2>Situação dos planos</h2>
                  <p>Quantidade de assinaturas por status.</p>
                </div>
              </div>

              <div className={styles.cards}>
                {[
                  ["Em atraso", countStatus("past_due")],
                  ["Canceladas", countStatus("canceled")],
                  ["Expiradas", countStatus("expired")],
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
                  <h2>Lista de assinaturas</h2>
                  <p>Os 50 registros mais recentes.</p>
                </div>
                <span className={styles.count}>
                  {items.length} assinaturas
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
                        <th>Assinante</th>
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
                  Não foi possível carregar os nomes dos assinantes.
                </p>
              )}
            </section>

            <footer className={styles.footer}>
              Consulta administrativa somente para leitura. Nenhum plano
              ou status de assinatura é alterado nesta página.
            </footer>
          </>
        )}
      </div>
    </AdminShell>
  );
}
