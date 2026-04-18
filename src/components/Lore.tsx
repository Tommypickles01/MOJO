export default function Lore({ onBack }: { onBack: () => void }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        backgroundColor: "#000",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <img
        src="/lore.png?v=2"
        alt="Mojo Lore"
        style={{ width: "100%", height: "100%", objectFit: "contain" }}
      />
      <div style={{ position: "absolute", bottom: "5vh", left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <button
          onClick={onBack}
          className="liquid-glass rounded-full px-12 py-4 text-base text-white cursor-pointer shadow-2xl backdrop-blur-md border border-white/20"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}
