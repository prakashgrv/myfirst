import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import KidForm from "@/components/kids/KidForm";

export default async function EditKidPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  const { id } = await params;

  const child = await prisma.child.findFirst({
    where: { id, userId: session!.user!.id! },
  });

  if (!child) notFound();

  return (
    <div className="max-w-md mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Edit {child.name}</h1>
        <p className="text-gray-500 mt-1">Update profile information.</p>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <KidForm child={child} />
      </div>
    </div>
  );
}
