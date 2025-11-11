'use client';
import AuthGate from "../ui/AuthGate";

export default function LoginPage() {
  return (
    <div className="p-6">
      <AuthGate>
        {/* Hvis man allerede er logget ind, kan du vise en lille besked eller redirect */}
        <p>Du er allerede logget ind.</p>
      </AuthGate>
    </div>
  );
}