import Link from "next/link";
export default function PaymentReturnPage() {
  return <main className="container" style={{padding:"64px 0",maxWidth:680}}>
    <section className="panel" style={{padding:28}}>
      <h1>Estamos confirmando seu pagamento</h1>
      <p>O retorno do checkout não é, sozinho, uma confirmação de pagamento. O Resgata+ libera a assinatura depois que o servidor valida a transação com a InfinitePay.</p>
      <p>Se o pagamento já foi aprovado, aguarde alguns instantes e entre novamente no seu perfil para conferir o plano.</p>
      <Link className="btn primary" href="/perfil">Ir para meu perfil</Link>
    </section>
  </main>;
}
