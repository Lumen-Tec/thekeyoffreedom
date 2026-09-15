import { Badge } from "@/components/ui/badge";

export function AvailabilityBadge({ available }: { available: boolean }) {
  return (
    <Badge className={`h-6 rounded-none px-2 text-xs ${available ? "bg-[#365443] text-[#F8F4EC]" : "bg-[#14110F] text-[#EDE6D6]"}`}>
      {available ? "Disponible" : "Agotado"}
    </Badge>
  );
}
