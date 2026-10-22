import { useState, type FormEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import { Panel } from "@/components/ui-kit";
import { addWorkParticipant } from "@/lib/work";

type WorkOption = {
  id: string;
  title: string;
};

export function WorkParticipantForm({
  works,
}: {
  works: WorkOption[];
}) {
  const [workId, setWorkId] = useState("");
  const [personId, setPersonId] = useState("");

  const mutation = useMutation({
    mutationFn: (input: {
      workId: string;
      personId: string;
    }) => addWorkParticipant(input.workId, input.personId),
    onSuccess: () => setPersonId(""),
  });

  if (!works.length) return null;

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!workId || !personId.trim()) return;

    mutation.mutate({
      workId,
      personId: personId.trim(),
    });
  }

  return (
    <Panel
      title="Adicionar participante"
      subtitle="Partilhar um trabalho com outra Person"
    >
      <form onSubmit={submit} className="space-y-4">
        <label className="block text-sm">
          Trabalho
          <select
            required
            value={workId}
            onChange={(e) => {
              setWorkId(e.target.value);
              mutation.reset();
            }}
            className="mt-1 w-full rounded-lg border border-border bg-background p-2"
          >
            <option value="">Selecionar trabalho</option>
            {works.map((work) => (
              <option key={work.id} value={work.id}>
                {work.title}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm">
          Identificador da Person
          <input
            required
            value={personId}
            onChange={(e) => {
              setPersonId(e.target.value);
              mutation.reset();
            }}
            placeholder="UUID da Person"
            className="mt-1 w-full rounded-lg border border-border bg-background p-2"
          />
        </label>

        {mutation.isError && (
          <p role="alert" className="text-sm text-destructive">
            {mutation.error.message}
          </p>
        )}

        {mutation.isSuccess && (
          <p role="status" className="text-sm text-success">
            Participante adicionado com sucesso.
          </p>
        )}

        <button
          type="submit"
          disabled={mutation.isPending}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
        >
          {mutation.isPending
            ? "A adicionar..."
            : "Adicionar participante"}
        </button>
      </form>
    </Panel>
  );
}
