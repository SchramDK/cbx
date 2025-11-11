export default function NotFound() {
  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold">Siden blev ikke fundet</h1>
      <p className="text-sm text-zinc-600">
        Gå tilbage til <a className="underline" href="/">forsiden</a>.
      </p>
    </div>
  );
}
