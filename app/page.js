export default function Home() {
  return (
    <main style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      background: "#0f172a",
      color: "white",
      fontFamily: "Arial, sans-serif",
      padding: "40px"
    }}>
      
      <h1 style={{ fontSize: "42px", marginBottom: "20px" }}>
        Simulatore Professionale Rendimento B&B
      </h1>

      <p style={{ fontSize: "20px", opacity: 0.8, marginBottom: "40px", textAlign: "center", maxWidth: "600px" }}>
        Calcola in pochi secondi il rendimento reale del tuo investimento immobiliare
        per affitti brevi.
      </p>

      <button style={{
        background: "#22c55e",
        border: "none",
        padding: "15px 30px",
        fontSize: "18px",
        borderRadius: "8px",
        cursor: "pointer"
      }}>
        Inizia la simulazione
      </button>

    </main>
  );
}
