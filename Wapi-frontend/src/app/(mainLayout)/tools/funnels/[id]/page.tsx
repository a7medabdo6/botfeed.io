"use client";

import FunnelEditor from "@/src/components/funnels/FunnelEditor";
import { useParams } from "next/navigation";

export default function EditFunnelPage() {
  const params = useParams();
  const id = params.id as string;
  return <FunnelEditor funnelId={id} />;
}
