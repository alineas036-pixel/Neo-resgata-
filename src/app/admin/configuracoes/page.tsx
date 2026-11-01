import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import styles from "../admin.module.css";
import AdminShell from "../AdminShell";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const supabase = await getSupabaseServerClient();

  const { data: authData, error: authError } =
    await supabase.auth.getUser();

  if (authError || !authData.user) {
    redirect("/login?next=/admin/configuracoes");
  }

  const { data: isAdmin, error: adminError } =
    await supabase.rpc("is_admin");

  if (adminError || isAdmin !== true) {
    redirect("/dashboard");
  }

  const [
    { count: userCount, error: usersError },
    { count: subscriptionCount, error: subscriptionsError },
  ] = await Promise.all([
    supabase
      .from("users")
      .select("id", { count: "exact", head: true }),

    supabase
      .from("subscriptions")
      .select("id", { count: "exact", head: true }),
  ]);

  const hasError = usersError || subscriptionsError;

  return (
    <AdminShell>
      <div className={styles.dashboardContent}>
        <header className={styles.header}>
          <div>
            <span className={styles.eyebrow}>
              RESGATA+ · ADMINISTRAÇÃO
            </span>
            <h1>Configurações</h1>
            <p>
              Informações gerais sobre a configuração atual
              da plataforma.
            </p>
          </div>

          <a href="/admin" className={styles.back}>
            Voltar à visão geral
          </a>
        </header>

        {hasError ? (
          <section className={styles.panel}>
            <p className={styles.error}>
              Não foi possível consultar os dados da plataforma.
              Verifique as permissões administrativas.
            </p>
          </section>
        ) : (
          <>
            <section className={styles.cards}>
              <article className={styles.card}>
                <span>Usuários cadastrados</span>
                <strong>
                  {(userCount ?? 0).toLocaleString("pt-BR")}
                </strong>
                <small>Total de contas registradas</small>
              </article>

              <article className={styles.card}>
                <span>Assinaturas registradas</span>
                <strong>
                  {(subscriptionCount ?? 0).toLocaleString("pt-BR")}
                </strong>
                <small>Total de registros no sistema</small>
              </article>
            </section>

            <section className={styles.panel}>
              <div className={styles.panelHeader}>
                <div>
                  <h2>Identidade da plataforma</h2>
                  <p>Informações atuais do produto.</p>
                </div>
              </div>

              <div className={styles.tableWrap}>
                <table>
                  <tbody>
                    <tr>
                      <th>Nome</th>
                      <td>Resgata+</td>
                    </tr>
                    <tr>
                      <th>Plano cadastrado</th>
                      <td>Mensal · R$ 9,90</td>
                    </tr>
                    <tr>
                      <th>Identificador do plano</th>
                      <td>mensal_9_90</td>
                    </tr>
                    <tr>
                      <th>Período de teste</th>
                      <td>Status de assinatura: trial</td>
                    </tr>
                    <tr>
                      <th>Banco de dados</th>
                      <td>Supabase</td>
                    </tr>
                    <tr>
                      <th>Autenticação</th>
                      <td>Supabase Auth</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section className={styles.panel}>
              <div className={styles.panelHeader}>
                <div>
                  <h2>Gerenciamento de configurações</h2>
                  <p>
                    Os parâmetros abaixo ainda não possuem
                    gerenciamento integrado.
                  </p>
                </div>
              </div>

              <div className={styles.tableWrap}>
                <table>
                  <thead>
                    <tr>
                      <th>Recurso</th>
                      <th>Situação</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Alteração de planos e preços</td>
                      <td>Não disponível</td>
                    </tr>
                    <tr>
                      <td>Configuração do período de teste</td>
                      <td>Não disponível</td>
                    </tr>
                    <tr>
                      <td>Integração de pagamentos</td>
                      <td>Gerenciada fora deste painel</td>
                    </tr>
                    <tr>
                      <td>Permissões administrativas</td>
                      <td>Protegidas pelo Supabase</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <footer className={styles.footer}>
              Painel informativo. Nenhuma configuração,
              assinatura ou dado de usuário é alterado nesta página.
            </footer>
          </>
        )}
      </div>
    </AdminShell>
  );
}
