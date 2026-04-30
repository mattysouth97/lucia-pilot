// Modal shell — shared overlay
const Modal = ({ open, onClose, children, width = 920 }) => {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0,
      background: "rgba(14, 17, 22, 0.45)", backdropFilter: "blur(4px)",
      zIndex: 100,
      display: "grid", placeItems: "center",
      animation: "fadeIn .18s ease-out",
      padding: 24, overflow: "auto",
    }}>
      <style>{`@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      @keyframes scaleIn { from { transform: scale(.96); opacity: 0; } to { transform: scale(1); opacity: 1; } }`}</style>
      <div onClick={e => e.stopPropagation()} style={{
        background: "#fff", borderRadius: 22, width,
        maxWidth: "100%", boxShadow: "0 30px 80px rgba(0,0,0,0.25)",
        animation: "scaleIn .22s cubic-bezier(0.2,0.8,0.2,1)",
        maxHeight: "calc(100vh - 48px)", overflow: "hidden",
        display: "flex", flexDirection: "column",
      }}>
        {children}
      </div>
    </div>
  );
};

window.Modal = Modal;
