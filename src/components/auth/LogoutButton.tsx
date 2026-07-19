"use client";

export default function LogoutButton() {
  const handleLogout = () => {
    window.location.href = "/logout";
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="rounded-full border border-black px-6 py-3 text-center transition hover:bg-black hover:text-white"
    >
      Cerrar sesión
    </button>
  );
}