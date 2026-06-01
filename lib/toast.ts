export function showToast(message: string, type: "success" | "error" | "info" = "info"): void {
  if (typeof document === "undefined") return;

  const existing = document.getElementById("pe-toast");
  if (existing) existing.remove();

  const colors = {
    success: "#22c55e",
    error: "#ef4444",
    info: "#3b82f6",
  };

  const toast = document.createElement("div");
  toast.id = "pe-toast";
  toast.textContent = message;
  Object.assign(toast.style, {
    position: "fixed",
    bottom: "24px",
    left: "50%",
    transform: "translateX(-50%)",
    background: colors[type],
    color: "#fff",
    padding: "10px 20px",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    zIndex: "9999",
    animation: "toast-in 0.2s ease",
    boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
    fontFamily: "var(--font-dm-sans, system-ui, sans-serif)",
    whiteSpace: "nowrap",
  });

  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}
