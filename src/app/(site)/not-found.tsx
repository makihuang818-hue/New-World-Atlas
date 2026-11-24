import Link from "next/link";

export default function NotFound() {
  return (
    <main className="page">
      <section className="done">
        <h1>Page not found</h1>
        <p>This page doesn’t exist, or it has moved. <Link href="/">Back to the atlas</Link>.</p>
      </section>
    </main>
  );
}
