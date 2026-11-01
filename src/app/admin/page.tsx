import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import styles from "./admin.module.css";
import AdminShell from "./AdminShell";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const supabase = await getSupabaseServerClient();

  const { data: authData, error: authError } =
    await supabase.auth.getUser();

  if (authError || !authData.user) {
    redirect("/login?next=/admin");
  }

  const { data: isAdmin, error: adminError } =
    await supabase.rpc("is_admin");

  if (adminError || isAdmin !== true) {
    redirect("/dashboard");
  }

  const [
    usersCountResult,
    subscriptionsCountResult,
    usersResult,
    subscriptionsResult,
  ] = await Promise.all([
    supabase.from("users").select("id", { count: "exact", head: true }),
    supabase.from("subscriptions").select("id", { count: "exact", head: true }),
    supabase
      .from("users")
      .select("id, name, email, created_at")
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("subscriptions")
      .select("id, user_id, plan, status, created_at")
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  const usersCount = usersCountResult.count ?? 0;
  const subscriptionsCount = subscriptionsCountResult.count ?? 0;
  const users = usersResult.data ?? [];
  const subscriptions = subscriptionsResult.data ?? [];

  const activeSubscriptions = subscriptions.filter(
    (item) => item.status === "active"
  ).length;

  const statusLabels: Record<string, string> = {
    trial: "Teste",
    active: "Ativa",
    past_due: "Em atraso",
    canceled: "Cancelada",
    expired: "Expirada",
  };

  return (
    <AdminShell>
       <div className={styles.dashboardContent}>
      <header className={styles.header}>
        <div>
          <span className={styles.eyebrow}>RESGATA+ · ADMINISTRAÇÃO</span>
          <h1>Painel administrativo</h1>
          <p>Visão geral da plataforma e acompanhamento de cadastros.</p>
        </div>
        <a href="/dashboard" className={styles.back}>Voltar ao aplicativo ↗</a>
      </header>

      <section className={styles.cards}>
        <article className={styles.card}>
          <span>Usuários cadastrados</span>
          <strong>{usersCount}</strong>
          <small>Perfis registrados na plataforma</small>
        </article>
        <article className={styles.card}>
          <span>Assinaturas registradas</span>
          <strong>{subscriptionsCount}</strong>
          <small>Registros de planos existentes</small>
        </article>
        <article className={styles.card}>
          <span>Assinaturas ativas recentes</span>
          <strong>{activeSubscriptions}</strong>
          <small>Entre os últimos 10 registros consultados</small>
        </article>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <div>
            <h2>Usuários recentes</h2>
            <p>Os 10 cadastros mais recentes.</p>
          </div>
          <span className={styles.count}>{usersCount} usuários</span>
        </div>

        {usersResult.error ? (
          <p className={styles.error}>Não foi possível carregar os usuários.</p>
        ) : users.length === 0 ? (
          <p className={styles.empty}>Nenhum usuário encontrado.</p>
        ) : (
          <div className={styles.tableWrap}>
            <table>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>E-mail</th>
                  <th>Cadastro</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      {new Date(user.created_at).toLocaleDateString("pt-BR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <div>
            <h2>Assinaturas recentes</h2>
            <p>Acompanhamento dos últimos 10 registros.</p>
          </div>
        </div>

        {subscriptionsResult.error ? (
          <p className={styles.error}>Não foi possível carregar as assinaturas.</p>
        ) : subscriptions.length === 0 ? (
          <p className={styles.empty}>Nenhuma assinatura encontrada.</p>
        ) : (
          <div className={styles.tableWrap}>
            <table>
              <thead>
                <tr>
                  <th>Plano</th>
                  <th>Status</th>
                  <th>Data</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.map((item) => (
                  <tr key={item.id}>
                    <td>{item.plan}</td>
                    <td>
                      <span className={styles.status}>
                        {statusLabels[item.status] ?? item.status}
                      </span>
                    </td>
                    <td>
                      {new Date(item.created_at).toLocaleDateString("pt-BR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <footer className={styles.footer}>
        Acesso administrativo protegido pelo Supabase e pelas políticas do banco.
      </footer>
      </div>
    </AdminShell>
  );
}
