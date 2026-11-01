"use client";

import AppHeader from "@/components/AppHeader";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase";

type Wallet = {
  id: string;
  name: string;
  account_type: string;
  balance: number | string;
};

type CreditCard = {
  id: string;
  name: string;
  bank_name: string;
  credit_limit: number | string;
  closing_day: number;
  due_day: number;
};

const ACCOUNT_TYPES = [
  { value: "banco", label: "Conta bancária" },
  { value: "dinheiro", label: "Dinheiro em mãos" },
  { value: "digital", label: "Carteira digital" },
  { value: "poupanca", label: "Poupança" },
  { value: "outro", label: "Outra conta" },
];

const money = (value: number) =>
  value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

export default function CarteiraPage() {
  const supabase = getSupabaseBrowserClient();
  const router = useRouter();

  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [name, setName] = useState("");
  const [accountType, setAccountType] = useState("banco");
  const [balance, setBalance] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [showAccountForm, setShowAccountForm] = useState(false);
  const [showCardForm, setShowCardForm] = useState(false);

  const [creditCards, setCreditCards] = useState<CreditCard[]>([]);
  const [cardName, setCardName] = useState("");
  const [bankName, setBankName] = useState("");
  const [creditLimit, setCreditLimit] = useState("");
  const [closingDay, setClosingDay] = useState("10");
  const [dueDay, setDueDay] = useState("20");
  const [savingCard, setSavingCard] = useState(false);
  const [cardError, setCardError] = useState("");
  const [cardNotice, setCardNotice] = useState("");

  const loadWallets = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const { data: authData, error: authError } =
        await supabase.auth.getUser();

      if (authError) throw authError;

      const user = authData.user;
      if (!user) {
        router.replace("/login");
        return;
      }

      const { data, error: queryError } = await supabase
        .from("wallet_accounts")
        .select("id,name,account_type,balance")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });

      if (queryError) throw queryError;

      setWallets((data ?? []) as Wallet[]);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível carregar suas contas."
      );
    } finally {
      setLoading(false);
    }
  }, [router, supabase]);

  const loadCreditCards = useCallback(async () => {
    const { data: authData, error: authError } =
      await supabase.auth.getUser();

    if (authError) throw authError;
    if (!authData.user) {
      router.replace("/login");
      return;
    }

    const { data, error: queryError } = await supabase
      .from("credit_cards")
      .select("id,name,bank_name,credit_limit,closing_day,due_day")
      .eq("user_id", authData.user.id)
      .order("created_at", { ascending: true });

    if (queryError) throw queryError;
    setCreditCards((data ?? []) as CreditCard[]);
  }, [router, supabase]);

  useEffect(() => {
    void loadWallets();
    void loadCreditCards().catch((err: unknown) => {
      setCardError(
        err instanceof Error
          ? err.message
          : "Não foi possível carregar os cartões."
      );
    });
  }, [loadWallets, loadCreditCards]);

  const total = wallets.reduce(
    (sum, wallet) => sum + Number(wallet.balance || 0),
    0
  );

  function resetForm() {
    setName("");
    setAccountType("banco");
    setBalance("");
    setEditingId(null);
    setShowAccountForm(false);
  }

  function startEdit(wallet: Wallet) {
    setShowAccountForm(true);
    setEditingId(wallet.id);
    setName(wallet.name);
    setAccountType(wallet.account_type);
    setBalance(String(wallet.balance ?? 0).replace(".", ","));
    setError("");
    setNotice("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function saveWallet(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");

    const parsedBalance = Number(balance.trim().replace(/\./g, "").replace(",", "."));

    if (!name.trim()) {
      setError("Informe o nome da conta.");
      return;
    }

    if (!balance.trim() || !Number.isFinite(parsedBalance) || parsedBalance < 0) {
      setError("Informe um saldo válido, igual ou maior que zero.");
      return;
    }

    setSaving(true);

    try {
      const { data: authData, error: authError } =
        await supabase.auth.getUser();

      if (authError) throw authError;
      if (!authData.user) {
        router.replace("/login");
        return;
      }

      const values = {
        name: name.trim(),
        account_type: accountType,
        balance: parsedBalance,
      };

      const result = editingId
        ? await supabase
            .from("wallet_accounts")
            .update(values)
            .eq("id", editingId)
            .eq("user_id", authData.user.id)
        : await supabase.from("wallet_accounts").insert({
            ...values,
            user_id: authData.user.id,
          });

      if (result.error) throw result.error;

      resetForm();
      setNotice(editingId ? "Conta atualizada." : "Conta adicionada à Carteira.");
      await loadWallets();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível salvar a conta."
      );
    } finally {
      setSaving(false);
    }
  }

  async function saveCreditCard(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCardError("");
    setCardNotice("");

    const parsedLimit = Number(
      creditLimit.trim().replace(/\./g, "").replace(",", ".")
    );
    const parsedClosingDay = Number(closingDay);
    const parsedDueDay = Number(dueDay);

    if (!cardName.trim() || !bankName.trim()) {
      setCardError("Informe o nome do cartão e o banco.");
      return;
    }

    if (!Number.isFinite(parsedLimit) || parsedLimit <= 0) {
      setCardError("Informe um limite maior que zero.");
      return;
    }

    if (
      !Number.isInteger(parsedClosingDay) ||
      parsedClosingDay < 1 ||
      parsedClosingDay > 31 ||
      !Number.isInteger(parsedDueDay) ||
      parsedDueDay < 1 ||
      parsedDueDay > 31
    ) {
      setCardError("Os dias de fechamento e vencimento devem estar entre 1 e 31.");
      return;
    }

    setSavingCard(true);

    try {
      const { data: authData, error: authError } =
        await supabase.auth.getUser();

      if (authError) throw authError;
      if (!authData.user) {
        router.replace("/login");
        return;
      }

      const { error: insertError } = await supabase
        .from("credit_cards")
        .insert({
          user_id: authData.user.id,
          name: cardName.trim(),
          bank_name: bankName.trim(),
          credit_limit: parsedLimit,
          closing_day: parsedClosingDay,
          due_day: parsedDueDay,
        });

      if (insertError) throw insertError;

      setCardName("");
      setBankName("");
      setCreditLimit("");
      setClosingDay("10");
      setDueDay("20");
      setCardNotice("Cartão cadastrado com sucesso.");
      await loadCreditCards();
    } catch (err) {
      setCardError(
        err instanceof Error
          ? err.message
          : "Não foi possível salvar o cartão."
      );
    } finally {
      setSavingCard(false);
    }
  }

  async function deleteCreditCard(card: CreditCard) {
    if (!window.confirm(`Excluir o cartão "${card.name}"?`)) return;

    setBusyId(card.id);
    setCardError("");
    setCardNotice("");

    try {
      const { data: authData, error: authError } =
        await supabase.auth.getUser();

      if (authError) throw authError;
      if (!authData.user) {
        router.replace("/login");
        return;
      }

      const { data: deletedRows, error: deleteError } = await supabase
        .from("credit_cards")
        .delete()
        .eq("id", card.id)
        .eq("user_id", authData.user.id)
        .select("id");

      if (deleteError) throw deleteError;
      if (!deletedRows?.length) {
        throw new Error("Nenhum cartão foi excluído.");
      }

      setCreditCards((current) =>
        current.filter((item) => item.id !== card.id)
      );
      setCardNotice("Cartão excluído.");
    } catch (err) {
      setCardError(
        err instanceof Error
          ? err.message
          : "Não foi possível excluir o cartão."
      );
    } finally {
      setBusyId(null);
    }
  }

  async function deleteWallet(wallet: Wallet) {
    const confirmed = window.confirm(
      `Excluir "${wallet.name}"? Se houver registros vinculados, a exclusão poderá ser bloqueada.`
    );
    if (!confirmed) return;

    setBusyId(wallet.id);
    setError("");
    setNotice("");

    try {
      const { data: authData, error: authError } =
        await supabase.auth.getUser();

      if (authError) throw authError;
      if (!authData.user) {
        router.replace("/login");
        return;
      }

      const { data: deletedRows, error: deleteError } = await supabase
        .from("wallet_accounts")
        .delete()
        .eq("id", wallet.id)
        .eq("user_id", authData.user.id)
        .select("id");

      if (deleteError) {
        if (deleteError.code === "23503") {
          throw new Error(
            "Esta conta possui registros vinculados que impedem a exclusão. O histórico foi preservado. Código: 23503."
          );
        }

        const details = [
          deleteError.message,
          deleteError.details,
          deleteError.hint,
          deleteError.code ? `Código: ${deleteError.code}` : "",
        ].filter(Boolean).join(" — ");

        throw new Error(details || "O Supabase recusou a exclusão.");
      }

      if (!deletedRows || deletedRows.length === 0) {
        throw new Error(
          "Nenhuma conta foi excluída. Ela pode não existir mais ou sua conta pode não ter permissão para excluí-la."
        );
      }

      if (editingId === wallet.id) resetForm();
      setNotice("Conta excluída com sucesso.");
      await loadWallets();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Erro inesperado ao excluir a conta."
      );
    } finally {
      setBusyId(null);
    }
  }

  function bankColors(name: string) {
    const normalized = name.normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

    if (/bradesco/.test(normalized))
      return { background: "#FCE8EC", color: "#B5122B", border: "#F2B8C2" };
    if (/caixa/.test(normalized))
      return { background: "#E5F0FF", color: "#1557A6", border: "#B8D2F5" };
    if (/pag.?bank|pag.?seguro/.test(normalized))
      return { background: "#E4F6E9", color: "#176B36", border: "#B5E2C1" };
    if (/itau/.test(normalized))
      return { background: "#FFF0D9", color: "#9A4D00", border: "#F2D09A" };
    if (/santander/.test(normalized))
      return { background: "#FCE8E8", color: "#B4232D", border: "#F2B8B8" };
    if (/banco do brasil|\bbb\b/.test(normalized))
      return { background: "#FFF7CC", color: "#765900", border: "#E8D778" };
    if (/nubank/.test(normalized))
      return { background: "#F0E7FF", color: "#6B35B5", border: "#D6C1F7" };
    if (/inter/.test(normalized))
      return { background: "#FFF0E5", color: "#B84A08", border: "#F4C6A5" };

    return { background: "#EDF2F7", color: "#334155", border: "#D7E0EA" };
  }

  function typeLabel(value: string) {
    return ACCOUNT_TYPES.find((item) => item.value === value)?.label ?? value;
  }

  return (
    <>
      <AppHeader />
    <main className="page-container wallet-page-professional">
      <div className="page-heading">
        <div>
          <p className="muted"></p>
          <h1>Minha Carteira</h1>
          <p className="muted">
            Reúna os saldos dos seus bancos, dinheiro em mãos e carteiras digitais.
          </p>
        </div>
      </div>

      {error && <p className="error-message" role="alert">{error}</p>}
      {notice && <p className="success-message" role="status">{notice}</p>}

      <div className="wallet-summary-grid">
        <section className="card wallet-summary-card" aria-labelledby="wallet-total-title">
          <p className="muted" id="wallet-total-title">Contas</p>
          <div className="stat-value">{money(total)}</div>
          <p className="muted">
            {wallets.length} {wallets.length === 1 ? "conta Ativa" : "contas Ativa"}
          </p>
        </section>

        <section className="card wallet-summary-card" aria-labelledby="wallet-savings-title">
          <p className="muted" id="wallet-savings-title">Economia geral</p>
          <div className="stat-value">A calcular</div>
          <p className="muted">Economia</p>
        </section>
      </div>

      <div className="wallet-entry-grid">
      <section className="card wallet-entry-card">
        <div className="section-heading wallet-accordion-heading">
          <div>
            <h2>{editingId ? "Editar conta" : "Adicionar conta"}</h2>
            <p className="muted">
              Cadastre e organize os saldos das suas contas.
            </p>
          </div>
          <button
            type="button"
            className="secondary wallet-toggle"
            aria-expanded={showAccountForm}
            onClick={() => setShowAccountForm((open) => !open)}
          >
            {showAccountForm ? "Fechar" : "Adicionar conta"}
          </button>
        </div>

        {showAccountForm && (
        <form onSubmit={saveWallet}>
          <div className="form-grid">
            <label>
              Nome da conta
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Ex.: Banco principal, dinheiro"
                maxLength={80}
                required
              />
            </label>

            <label>
              Tipo de conta
              <select
                value={accountType}
                onChange={(event) => setAccountType(event.target.value)}
              >
                {ACCOUNT_TYPES.map((item) => (
                  <option value={item.value} key={item.value}>{item.label}</option>
                ))}
              </select>
            </label>

            <label>
              Saldo atual (R$)
              <input
                inputMode="decimal"
                value={balance}
                onChange={(event) => setBalance(event.target.value)}
                placeholder="0,00"
                required
              />
            </label>
          </div>

          <div className="form-actions">
            <button type="submit" disabled={saving}>
              {saving ? "Salvando..." : editingId ? "Salvar alterações" : "Adicionar à Carteira"}
            </button>
            {editingId && (
              <button type="button" className="secondary" onClick={resetForm}>
                Cancelar edição
              </button>
            )}
          </div>
        </form>
        )}
      </section>

      <section className="card wallet-entry-card wallet-credit-card">
        <div className="section-heading wallet-accordion-heading">
          <div>
            <h2>Cartões de crédito</h2>
            <p className="muted">
              Gerencie os limites e as datas da fatura.
            </p>
          </div>
          <button
            type="button"
            className="secondary wallet-toggle"
            aria-expanded={showCardForm}
            onClick={() => setShowCardForm((open) => !open)}
          >
            {showCardForm ? "Fechar" : "Adicionar cartão"}
          </button>
        </div>

        {cardError && <p role="alert" className="error-message">{cardError}</p>}
        {cardNotice && <p role="status" className="success-message">{cardNotice}</p>}

        {showCardForm && (
        <form onSubmit={saveCreditCard}>
          <div className="form-grid">
            <label>
              Nome do cartão
              <input
                value={cardName}
                onChange={(event) => setCardName(event.target.value)}
                placeholder="Ex.: Cartão principal"
                maxLength={80}
                required
              />
            </label>

            <label>
              Banco ou instituição
              <input
                value={bankName}
                onChange={(event) => setBankName(event.target.value)}
                placeholder="Ex.: Nubank"
                maxLength={80}
                required
              />
            </label>

            <label>
              Limite total (R$)
              <input
                inputMode="decimal"
                value={creditLimit}
                onChange={(event) => setCreditLimit(event.target.value)}
                placeholder="Ex.: 1500,00"
                required
              />
            </label>

            <label>
              Dia de fechamento
              <select
                value={closingDay}
                onChange={(event) => setClosingDay(event.target.value)}
              >
                {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                  <option value={day} key={day}>{day}</option>
                ))}
              </select>
            </label>

            <label>
              Dia de vencimento
              <select
                value={dueDay}
                onChange={(event) => setDueDay(event.target.value)}
              >
                {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                  <option value={day} key={day}>{day}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="form-actions">
            <button type="submit" disabled={savingCard}>
              {savingCard ? "Salvando..." : "Adicionar cartão"}
            </button>
          </div>
        </form>
        )}

      </section>
      </div>

      <section className="card">
        <div className="section-heading">
          <div>
            <h2>Histórico de cartões</h2>
            <p className="muted">
              Consulte os cartões cadastrados, seus limites e datas da fatura.
            </p>
          </div>
        </div>

        {cardError ? (
          <p role="alert" className="error-message">{cardError}</p>
        ) : creditCards.length === 0 ? (
          <p className="muted">Nenhum cartão cadastrado ainda.</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Cartão</th>
                  <th>Banco</th>
                  <th>Limite</th>
                  <th>Fechamento</th>
                  <th>Vencimento</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {creditCards.map((card) => (
                  <tr key={card.id}>
                    <td>{card.name}</td>
                    <td>{card.bank_name}</td>
                    <td>{money(Number(card.credit_limit))}</td>
                    <td>Dia {card.closing_day}</td>
                    <td>Dia {card.due_day}</td>
                    <td>
                      <button
                        type="button"
                        className="secondary"
                        disabled={busyId === card.id}
                        onClick={() => void deleteCreditCard(card)}
                      >
                        {busyId === card.id ? "Excluindo..." : "Excluir"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="card">
        <div className="section-heading">
          <div>
            <h2>Suas contas</h2>
            <p className="muted">
              Os saldos são os registrados nas contas e podem ser atualizados por você.
            </p>
          </div>
        </div>

        {loading ? (
          <p>Carregando suas contas...</p>
        ) : wallets.length === 0 ? (
          <div>
            <p>Você ainda não cadastrou nenhuma conta.</p>
            <p className="muted">
              Adicione seu primeiro banco, carteira digital ou valor em dinheiro.
            </p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Conta</th>
                  <th>Tipo</th>
                  <th>Saldo</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {wallets.map((wallet) => (
                  <tr key={wallet.id}>
                    <td>
                      <span
                        className="wallet-bank-badge"
                        style={{
                          backgroundColor: bankColors(wallet.name).background,
                          color: bankColors(wallet.name).color,
                          borderColor: bankColors(wallet.name).border,
                        }}
                      >
                        {wallet.name}
                      </span>
                    </td>
                    <td>{typeLabel(wallet.account_type)}</td>
                    <td>{money(Number(wallet.balance || 0))}</td>
                    <td>
                      <div className="form-actions">
                        <button
                          type="button"
                          className="secondary"
                          onClick={() => startEdit(wallet)}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          className="secondary"
                          disabled={busyId === wallet.id}
                          onClick={() => void deleteWallet(wallet)}
                        >
                          {busyId === wallet.id ? "Excluindo..." : "Excluir"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>


      <style jsx>{`
      .wallet-page-professional .wallet-entry-grid {
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
        align-items: stretch;
        gap: 16px;
        width: 100%;
        max-width: 1180px;
        margin: 0 auto 18px;
      }

      .wallet-page-professional .wallet-entry-card {
        box-sizing: border-box;
        min-width: 0;
        margin: 0;
        padding: 20px;
        background: linear-gradient(145deg, #fffaf2, #fff3df);
        border: 1px solid #f2d7ae;
        border-radius: 18px;
        box-shadow: 0 8px 24px rgba(154, 84, 18, 0.08);
      }

      .wallet-page-professional .wallet-credit-card {
        background: linear-gradient(145deg, #f7f7ff, #eceeff);
        border-color: #d9dcff;
        box-shadow: 0 8px 24px rgba(69, 70, 165, 0.09);
      }

      .wallet-page-professional .wallet-entry-card h2 {
        margin: 0 0 6px;
        color: #263248;
        font-size: clamp(18px, 2vw, 22px);
      }

      .wallet-page-professional .wallet-entry-card .muted {
        line-height: 1.5;
      }

      .wallet-page-professional .wallet-credit-card h2 {
        color: #38358d;
      }

      .wallet-page-professional .wallet-entry-card .wallet-toggle {
        margin-left: auto;
        border: 0;
        border-radius: 11px;
        padding: 10px 16px;
        font-weight: 650;
        box-shadow: 0 3px 8px rgba(15, 23, 42, 0.08);
      }

      .wallet-page-professional .wallet-entry-card:not(.wallet-credit-card) .wallet-toggle {
        background: #a85d17;
        color: #fff;
      }

      .wallet-page-professional .wallet-credit-card .wallet-toggle {
        background: #4948a8;
        color: #fff;
      }

      .wallet-page-professional .wallet-entry-card .wallet-toggle:hover {
        filter: brightness(0.96);
      }

      .wallet-page-professional .wallet-entry-card form {
        gap: 14px;
      }

      .wallet-page-professional .wallet-entry-card :global(.form-grid) {
        grid-template-columns: minmax(0, 1fr);
        gap: 12px;
      }

      .wallet-page-professional .wallet-accordion-heading {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        flex-wrap: wrap;
      }

      .wallet-page-professional .wallet-toggle {
        flex: 0 0 auto;
        min-height: 40px;
        white-space: nowrap;
      }

      .wallet-page-professional .wallet-entry-card {
        min-width: 0;
      }

      .wallet-page-professional .wallet-entry-card .form-grid {
        gap: 12px;
      }

      .wallet-page-professional .wallet-entry-card label {
        min-width: 0;
      }

      .wallet-page-professional .wallet-entry-card input,
      .wallet-page-professional .wallet-entry-card select {
        width: 100%;
        min-width: 0;
        box-sizing: border-box;
      }

      .wallet-page-professional .credit-card-placeholder {
        display: grid;
        gap: 14px;
      }

      .wallet-page-professional .credit-card-visual {
        display: grid;
        gap: 18px;
        min-height: 155px;
        padding: 18px;
        border-radius: 14px;
        color: #fff;
        background: linear-gradient(135deg, #173d32, #16845b);
        box-shadow: 0 8px 18px rgba(22, 65, 50, 0.16);
      }

      .wallet-page-professional .credit-card-visual strong {
        font-size: 17px;
        letter-spacing: 2px;
      }

      .wallet-page-professional .credit-card-visual span {
        font-size: 12px;
        font-weight: 650;
      }

      .wallet-page-professional .credit-card-visual .credit-card-chip {
        font-size: 23px;
      }

      .wallet-page-professional .wallet-summary-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 12px;
        margin-bottom: 20px;
      }

      .wallet-page-professional .wallet-summary-card {
        box-sizing: border-box;
        min-width: 0;
        padding: 20px;
        border: 1px solid #d9e8df;
        border-radius: 18px;
        background: linear-gradient(145deg, #f0faf3, #e1f3e7);
        box-shadow: 0 8px 22px rgba(24, 121, 78, 0.07);
      }

      .wallet-page-professional .wallet-summary-card:nth-child(2) {
        border-color: #dcdcff;
        background: linear-gradient(145deg, #f4f4ff, #e7e9ff);
        box-shadow: 0 8px 22px rgba(69, 70, 165, 0.07);
      }

      .wallet-page-professional .wallet-summary-card:first-child .stat-value {
        color: #17663f;
      }

      .wallet-page-professional .wallet-summary-card:nth-child(2) .stat-value {
        color: #41419a;
      }

      .wallet-page-professional .wallet-summary-card > .muted {
        margin-top: 0;
      }

      .wallet-page-professional .wallet-summary-card > .stat-value {
        margin: 10px 0;
        font-weight: 750;
        line-height: 1.2;
        letter-spacing: -0.025em;
      }

      .wallet-page-professional .wallet-entry-card :global(.success-message),
      .wallet-page-professional .wallet-entry-card :global(.error-message) {
        margin: 12px 0 0;
        padding: 9px 12px;
        border-radius: 10px;
        font-size: 13px;
        line-height: 1.45;
        overflow-wrap: anywhere;
      }

      .wallet-page-professional .wallet-summary-card .stat-value {
        font-size: clamp(18px, 2.5vw, 26px);
        overflow-wrap: anywhere;
      }

      @media (max-width: 760px) {
        .wallet-page-professional .wallet-entry-grid {
          grid-template-columns: minmax(0, 1fr);
        }
      }

      @media (max-width: 420px) {
        .wallet-page-professional .wallet-entry-card {
          padding: 14px;
        }

        .wallet-page-professional .wallet-summary-grid {
          gap: 8px;
        }

        .wallet-page-professional .wallet-summary-card {
          padding: 12px;
        }
      }

        .wallet-page-professional {
          box-sizing: border-box;
          min-height: 100vh;
          padding: 28px 18px 48px;
          background: #f3f6fb;
          color: #172033;
        }

        .wallet-page-professional :global(.page-heading) {
          max-width: 1180px;
          margin: 0 auto 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }

        .wallet-page-professional :global(.page-heading h1) {
          margin: 4px 0 8px;
          font-size: clamp(28px, 4vw, 38px);
          line-height: 1.15;
          font-weight: 800;
          letter-spacing: -0.035em;
          color: #172033;
        }

        .wallet-page-professional :global(.page-heading .muted) {
          margin: 0;
          color: #64748b;
          line-height: 1.65;
        }

        .wallet-page-professional > :global(.card),
        .wallet-page-professional > :global(.error-message),
        .wallet-page-professional > :global(.success-message) {
          box-sizing: border-box;
          width: 100%;
          max-width: 1180px;
          margin: 0 auto 18px;
        }

        .wallet-page-professional > :global(.card) {
          padding: clamp(18px, 3vw, 26px);
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 18px;
          box-shadow: 0 6px 24px rgba(15, 23, 42, 0.045);
        }

        .wallet-page-professional > :global(.card:first-of-type) {
          border-top: 4px solid #16845b;
        }

        .wallet-page-professional :global(.stat-value) {
          margin: 10px 0;
          color: #126b49;
          font-size: clamp(30px, 5vw, 42px);
          font-weight: 800;
          line-height: 1.2;
          letter-spacing: -0.03em;
          overflow-wrap: anywhere;
        }

        .wallet-page-professional h2 {
          margin: 0 0 8px;
          font-size: 20px;
          font-weight: 750;
          letter-spacing: -0.02em;
          color: #172033;
        }

        .wallet-page-professional :global(.section-heading) {
          margin-bottom: 20px;
        }

        .wallet-page-professional :global(.section-heading p),
        .wallet-page-professional > :global(.card) > :global(.muted) {
          color: #64748b;
          line-height: 1.6;
        }

        .wallet-page-professional form {
          display: grid;
          gap: 20px;
        }

        .wallet-page-professional :global(.form-grid) {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 16px;
        }

        .wallet-page-professional label {
          display: grid;
          align-content: start;
          gap: 8px;
          min-width: 0;
          color: #334155;
          font-size: 14px;
          font-weight: 650;
        }

        .wallet-page-professional input,
        .wallet-page-professional select {
          box-sizing: border-box;
          width: 100%;
          min-height: 46px;
          padding: 11px 13px;
          border: 1px solid #cbd5e1;
          border-radius: 11px;
          background: #fff;
          color: #172033;
          font: inherit;
          font-weight: 400;
          outline: none;
          transition: border-color .18s, box-shadow .18s;
        }

        .wallet-page-professional input:focus,
        .wallet-page-professional select:focus {
          border-color: #16845b;
          box-shadow: 0 0 0 3px rgba(22, 132, 91, .13);
        }

        .wallet-page-professional :global(.form-actions) {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 10px;
        }

        .wallet-page-professional button {
          min-height: 42px;
          padding: 10px 15px;
          border: 1px solid transparent;
          border-radius: 10px;
          background: #147a53;
          color: #fff;
          font: inherit;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: background .18s, border-color .18s, transform .18s;
        }

        .wallet-page-professional button:hover:not(:disabled) {
          background: #106342;
        }

        .wallet-page-professional button:focus-visible,
        .wallet-page-professional a:focus-visible {
          outline: 3px solid rgba(22, 132, 91, .35);
          outline-offset: 3px;
        }

        .wallet-page-professional button:disabled {
          opacity: .6;
          cursor: not-allowed;
        }

        .wallet-page-professional button.secondary {
          background: #fff;
          color: #334155;
          border-color: #cbd5e1;
        }

        .wallet-page-professional button.secondary:hover:not(:disabled) {
          background: #f1f5f9;
        }

        .wallet-page-professional :global(.table-container) {
          width: 100%;
          overflow-x: auto;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
        }

        .wallet-page-professional .wallet-bank-badge {
          display: inline-flex;
          align-items: center;
          max-width: 100%;
          padding: 7px 12px;
          border: 1px solid;
          border-radius: 999px;
          font-size: 0.88rem;
          font-weight: 750;
          line-height: 1.3;
          overflow-wrap: anywhere;
          transition: box-shadow 160ms ease, transform 160ms ease;
        }

        .wallet-page-professional .wallet-bank-badge:hover {
          box-shadow: 0 3px 10px rgba(15, 23, 42, 0.08);
          transform: translateY(-1px);
        }

        .wallet-page-professional table {
          width: 100%;
          min-width: 590px;
          border-collapse: collapse;
          text-align: left;
        }

        .wallet-page-professional th {
          padding: 14px 16px;
          background: #f8fafc;
          color: #475569;
          font-size: 12px;
          font-weight: 750;
          letter-spacing: .045em;
          text-transform: uppercase;
        }

        .wallet-page-professional td {
          padding: 15px 16px;
          border-top: 1px solid #e2e8f0;
          color: #334155;
          vertical-align: middle;
        }

        .wallet-page-professional td:first-child {
          color: #172033;
          font-weight: 700;
        }

        .wallet-page-professional td:nth-child(3) {
          font-weight: 750;
          font-variant-numeric: tabular-nums;
          white-space: nowrap;
        }

        .wallet-page-professional td :global(.form-actions) {
          flex-wrap: nowrap;
        }

        .wallet-page-professional > :global(.error-message) {
          padding: 13px 16px;
          border: 1px solid #fecaca;
          border-radius: 12px;
          background: #fef2f2;
          color: #991b1b;
        }

        .wallet-page-professional > :global(.success-message) {
          padding: 13px 16px;
          border: 1px solid #bbf7d0;
          border-radius: 12px;
          background: #f0fdf4;
          color: #166534;
        }

        .wallet-page-professional a {
          color: #147a53;
          font-weight: 700;
          text-decoration-thickness: 1px;
          text-underline-offset: 3px;
        }

        @media (max-width: 760px) {
          .wallet-page-professional {
            padding: 22px 14px 36px;
          }

          .wallet-page-professional :global(.form-grid) {
            grid-template-columns: minmax(0, 1fr);
          }

          .wallet-page-professional > :global(.card) {
            border-radius: 14px;
          }

          .wallet-page-professional :global(.page-heading) {
            align-items: flex-start;
          }

          .wallet-page-professional td :global(.form-actions) {
            flex-wrap: wrap;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .wallet-page-professional * {
            transition: none !important;
          }
        }
      `}</style>

    </main>
    </>
  );
}
