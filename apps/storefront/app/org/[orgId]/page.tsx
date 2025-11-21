import { redirect } from "next/navigation";

interface OrgPageProps {
  params: Promise<{
    orgId: string;
  }>;
}

export default async function OrgPage(props: OrgPageProps) {
  const { orgId } = await props.params;

  // sempre que acessar /org/:orgId, manda pra /org/:orgId/anuncios
  redirect(`/org/${orgId}/anuncios`);
}
