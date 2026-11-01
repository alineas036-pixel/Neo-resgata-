import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import styles from "../admin.module.css";
import AdminShell from "../AdminShell";

export const dynamic = "force-dynamic";

export default async function AdminSecurityPage() {
  const supabase = await getSupabaseServerClient();

  const { data: authData, error: authError } =
    await supabase.auth.getUser();

  if (authError || !authData.user) {
    redirect("/login?next=/admin/seguranca");
  }

  const { data: isAdmin, error: adminError } =
    await supabase.rpc("is_admin");

  if (adminError || isAdmin !== true) {
    redirect("/dashboard");
  }

  return (
    <AdminShell>
      <div className={styles.dashboardContent}>
        <header className={styles.header}>
          <div>
            <span className={styles.eyebrow}>
              RESGATA+ · ADMINISTRAÇÃO
            </span>
            <h1>Segurança e acessos</h1>
            <p>
              Consulte as informações de proteção e o acesso
              administrativo da plataforma.
            </p>
          </div>

          <a href="/admin" className={styles.back}>
            Voltar à visão geral
          </a>
        </header>

        <section className={styles.cards}>
          <article className={styles.card}>
            <span>Autenticação</span>
            <strong>Ativa</strong>
            <small>Sessão validada pelo Supabase Auth</small>
          </article>

          <article className={styles.card}>
            <span>Permissão administrativa</span>
            <strong>Validada</strong>
            <small>Acesso autorizado por is_admin()</small>
          </article>

          <article className={styles.card}>
            <span>Proteção de dados</span>
            <strong>RLS ativa</strong>
            <small>Políticas de acesso no banco de dados</small>
          </article>
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <h2>Acesso administrativo atual</h2>
              <p>Conta autenticada nesta sessão.</p>
            </div>
          </div>

          <div className={styles.tableWrap}>
            <table>
              <tbody>
                <tr>
                  <th>E-mail</th>
                  <td>{authData.user.email ?? "Não disponível"}</td>
                </tr>
                <tr>
                  <th>Situação da sessão</th>
                  <td>Autenticada</td>
                </tr>
                <tr>
                  <th>Permissão</th>
                  <td>Administrador autorizado</td>
                </tr>
                <tr>
                  <th>Identificação</th>
                  <td>Conta autenticada no Resgata+</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <h2>Camadas de proteção</h2>
              <p>Controles utilizados no acesso administrativo.</p>
            </div>
          </div>

          <div className={styles.cards}>
            <article className={styles.card}>
              <span>01 · Autenticação</span>
              <strong>Supabase Auth</strong>
              <small>
                Verificação da identidade antes de acessar
                as páginas administrativas.
              </small>
            </article>

            <article className={styles.card}>
              <span>02 · Autorização</span>
              <strong>is_admin()</strong>
              <small>
                Verificação da permissão administrativa
                no servidor.
              </small>
            </article>

            <article className={styles.card}>
              <span>03 · Banco de dados</span>
              <strong>Row Level Security</strong>
              <small>
                Políticas de acesso aplicadas às tabelas
                protegidas do Supabase.
              </small>
            </article>
          </div>
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <h2>Regras de acesso</h2>
              <p>Princípios adotados na administração do Resgata+.</p>
            </div>
          </div>

          <ul>
            <li>
              Somente contas autenticadas e autorizadas podem
              acessar o painel administrativo.
            </li>
            <li>
              As consultas administrativas respeitam as políticas
              de segurança do banco de dados.
            </li>
            <li>
              As páginas administrativas de consulta não alteram
              os registros dos usuários.
            </li>
            <li>
              As permissões não são concedidas automaticamente
              por meio da interface.
            </li>
          </ul>
        </section>

        <footer className={styles.footer}>
          Área informativa e somente para leitura. Nenhuma
          permissão ou configuração de segurança é alterada
          nesta página.
        </footer>
      </div>
    </AdminShell>
  );
}
