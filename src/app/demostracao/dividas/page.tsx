"use client";

import DemoMenu from "@/components/DemoMenu";
import PainelContas from "./PainelContas";

export default function DemonstracaoDividas() {
  return (
    <>
      <DemoMenu />
      <main
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "28px 18px",
          color: "#172033",
        }}
      >
        <PainelContas />
      </main>
    </>
  );
}
