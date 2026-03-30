import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { EditCheckForm } from "@/components/checks/edit-check-form";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function EditCheckPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const userId = session!.user!.id!;

  const check = await prisma.check.findFirst({
    where: { id, userId },
  });

  if (!check) notFound();

  return (
    <div className="space-y-8 max-w-xl">
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/checks/${check.id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Edit check</h1>
      </div>

      <EditCheckForm check={check} />
    </div>
  );
}
