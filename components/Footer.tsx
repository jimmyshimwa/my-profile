export default function Footer() {
  return (
    <footer
      style={{
        padding: "2rem 2.5rem",
        borderTop: "1px solid var(--border)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.68rem",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "var(--muted)",
        }}
      >
        © {new Date().getFullYear()} Jimmy Shimwa
      </span>
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.68rem",
          letterSpacing: "0.05em",
          color: "var(--muted)",
        }}
      >
        Kigali, Rwanda — Available for freelance
      </span>
    </footer>
  );
}
