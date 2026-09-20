import { createFileRoute, Link } from "@tanstack/react-router";
import { useIdentity } from "@/components/identity-context";
export const Route = createFileRoute("/pessoal")({
  ssr: false,
  component: Personal,
});
function Personal() {
  const { person, session } = useIdentity();
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Espaço pessoal</h1>
      <p>{person?.first_name || session?.user.email}</p>
      <p>
        A sua Person é global. Pode participar em várias organizações ou
        continuar sem nenhuma.
      </p>
      <Link to="/onboarding">Criar organização ou aceitar convite</Link>
    </section>
  );
}
