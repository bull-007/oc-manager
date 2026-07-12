import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import OcForm from "@/components/oc/OcForm";

export default async function EditOCPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const { id } = await params;

  const oc = await prisma.oC.findUnique({
    where: { id },
    include: {
      media: true,
      ocTags: { include: { tag: true } },
    },
  });

  if (!oc || oc.userId !== session.user.id) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto animate-slide-up">
      <div className="mb-6">
        <h1 className="text-2xl font-serif font-bold text-warm-brown">
          编辑 OC
        </h1>
        <p className="text-warm-muted text-sm mt-1">
          修改「{oc.name}」的信息
        </p>
      </div>
      <OcForm initialData={oc} isEditing />
    </div>
  );
}
