interface SectionLabelProps {
  children: React.ReactNode;
}

export default function SectionLabel({ children }: SectionLabelProps) {
  return (
    <div style={{
      fontFamily: "var(--font-mono)",
      fontSize: "0.68rem",
      letterSpacing: "0.2em",
      textTransform: "uppercase",
      color: "var(--accent)",
      marginBottom: "3rem",
      display: "flex",
      alignItems: "center",
      gap: "0.8rem",
    }}>
      {children}
      <span style={{
        flex: 1,
        height: "1px",
        background: "var(--border)",
        display: "block",
      }} />
    </div>
  );
}
