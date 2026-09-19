// @vitest-environment jsdom
import React from "react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
const mocked = vi.hoisted(() => ({
  getSession: vi.fn(),
  listener: undefined as
    undefined | ((event: string, session: unknown) => void),
  getPerson: vi.fn(),
  getOrgs: vi.fn(),
  signOut: vi.fn(),
  create: vi.fn(),
  accept: vi.fn(),
  navigate: vi.fn(),
}));
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      getSession: mocked.getSession,
      signOut: mocked.signOut,
      onAuthStateChange: (callback: typeof mocked.listener) => {
        mocked.listener = callback;
        return { data: { subscription: { unsubscribe: vi.fn() } } };
      },
    },
  },
}));
vi.mock("@/lib/identity", () => ({
  getCurrentPerson: mocked.getPerson,
  getMyOrganizations: mocked.getOrgs,
  createOrganization: mocked.create,
  acceptInvitation: mocked.accept,
}));
vi.mock("@/components/app-shell", () => ({
  AppShell: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
vi.mock("@tanstack/react-router", () => ({
  Link: ({
    children,
    to,
    onClick,
  }: {
    children: React.ReactNode;
    to: string;
    onClick?: () => void;
  }) => (
    <a href={to} onClick={onClick}>
      {children}
    </a>
  ),
  createFileRoute: () => (x: unknown) => x,
  useNavigate: () => mocked.navigate,
  useRouterState: () => "/definicoes",
}));
import {
  IdentityProvider,
  useIdentity,
  OrganizationSwitcher,
} from "@/components/identity-context";
import { Onboarding } from "@/routes/onboarding";
function Probe() {
  const ctx = useIdentity();
  return (
    <>
      <output data-testid="identity">
        {ctx.loading
          ? "loading"
          : `${ctx.session?.user.id ?? "signed-out"}:${ctx.active?.id ?? "personal"}`}
      </output>
      <OrganizationSwitcher />
    </>
  );
}
const session = (id: string) => ({ user: { id }, access_token: `${id}-token` });
const orgs = [
  {
    id: "a",
    name: "A",
    membership: { id: "ma", membership_type: "member", is_admin: true },
  },
  {
    id: "b",
    name: "B",
    membership: { id: "mb", membership_type: "freelancer", is_admin: false },
  },
];
function mount(children: React.ReactNode = <Probe />) {
  const client = new QueryClient();
  render(
    <QueryClientProvider client={client}>
      <IdentityProvider>{children}</IdentityProvider>
    </QueryClientProvider>,
  );
  return client;
}
beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  mocked.getSession.mockResolvedValue({ data: { session: session("alice") } });
  mocked.getPerson.mockResolvedValue({ id: "person-alice" });
  mocked.getOrgs.mockResolvedValue(orgs);
  mocked.signOut.mockResolvedValue({ error: null });
});
afterEach(cleanup);
it("restores a valid selection and clears cached tenant data on switch and logout", async () => {
  localStorage.setItem("encore-os.active-organization-id:alice", "b");
  const client = mount();
  await waitFor(() =>
    expect(screen.getByTestId("identity").textContent).toBe("alice:b"),
  );
  client.setQueryData(["tenant", "b"], ["private-data"]);
  await userEvent.selectOptions(screen.getByLabelText("Contexto ativo"), "a");
  expect(client.getQueryData(["tenant", "b"])).toBeUndefined();
  expect(screen.getByTestId("identity").textContent).toBe("alice:a");
  await userEvent.click(screen.getByText("Sair"));
  await waitFor(() =>
    expect(screen.getByTestId("identity").textContent).toBe(
      "signed-out:personal",
    ),
  );
});
it("drops a late identity response after logout", async () => {
  let resolve!: (value: unknown) => void;
  mocked.getOrgs.mockReturnValue(
    new Promise((r) => {
      resolve = r;
    }),
  );
  mount();
  await waitFor(() => expect(mocked.getOrgs).toHaveBeenCalled());
  act(() => mocked.listener?.("SIGNED_OUT", null));
  await waitFor(() =>
    expect(screen.getByTestId("identity").textContent).toBe(
      "signed-out:personal",
    ),
  );
  await act(async () => resolve(orgs));
  expect(screen.getByTestId("identity").textContent).toBe(
    "signed-out:personal",
  );
});
it("does not restore another account selection and validates revoked memberships", async () => {
  localStorage.setItem("encore-os.active-organization-id:alice", "b");
  mount();
  await waitFor(() =>
    expect(screen.getByTestId("identity").textContent).toBe("alice:b"),
  );
  mocked.getOrgs.mockResolvedValue([orgs[0]]);
  act(() => mocked.listener?.("SIGNED_IN", session("bob")));
  await waitFor(() =>
    expect(screen.getByTestId("identity").textContent).toBe("bob:a"),
  );
  expect(localStorage.getItem("encore-os.active-organization-id:bob")).toBe(
    "a",
  );
});
it("offers independent creation, invitation acceptance and personal paths", async () => {
  mocked.getOrgs.mockResolvedValue([]);
  mocked.create.mockResolvedValue({ id: "new" });
  mount(<Onboarding />);
  await userEvent.type(
    screen.getByLabelText("Nome da organização"),
    "Produção Individual",
  );
  await userEvent.click(
    screen.getByRole("button", { name: "Criar organização" }),
  );
  await waitFor(() =>
    expect(mocked.create).toHaveBeenCalledWith("Produção Individual"),
  );
  expect(
    screen.getByText("Continuar apenas como Person").getAttribute("href"),
  ).toBe("/pessoal");
  expect(screen.getByRole("button", { name: "Aceitar convite" })).toBeTruthy();
});
it("submits an invitation and displays rejected acceptance", async () => {
  mocked.accept.mockRejectedValue(new Error("Convite expirado"));
  mount(<Onboarding />);
  await userEvent.type(
    screen.getByLabelText("Código de convite"),
    "one-time-token",
  );
  await userEvent.click(
    screen.getByRole("button", { name: "Aceitar convite" }),
  );
  await waitFor(() =>
    expect(screen.getByRole("alert").textContent).toBe("Convite expirado"),
  );
});
