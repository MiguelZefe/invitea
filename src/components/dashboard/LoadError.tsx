"use client";

export default function LoadError({ message }: { message: string }) {
  return (
    <div role="alert" className="my-4 rounded-2xl bg-red-50 px-5 py-4 text-sm text-red-700">
      <p>{message}</p>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="mt-3 rounded-full border border-current px-5 py-2 focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        Reintentar carga
      </button>
    </div>
  );
}
