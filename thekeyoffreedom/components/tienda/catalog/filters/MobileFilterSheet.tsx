import { SlidersHorizontalIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { FilterPanel } from "./FilterPanel";

export function MobileFilterSheet() {
  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button className="fixed right-4 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-30 h-12 cursor-pointer gap-2 rounded-full bg-[#14110F] px-5 text-[#EDE6D6] shadow-lg hover:bg-[#14110F]/90 hover:shadow-xl motion-reduce:transition-none lg:hidden" />
        }
      >
        <SlidersHorizontalIcon aria-hidden="true" />
        Filtros
      </SheetTrigger>
      <SheetContent
        side="left"
        className="max-h-dvh overflow-hidden border-[#14110F] bg-[#F1E1B9] p-0 data-[side=left]:h-dvh data-[side=left]:w-4/5"
      >
        <SheetHeader className="shrink-0 border-b border-[#E8B94B]/30 bg-[#14110F]">
          <SheetTitle className="text-[#EDE6D6]">Filtrá</SheetTitle>
        </SheetHeader>
        <FilterPanel className="min-h-0 flex-1 overflow-hidden pb-[max(1rem,env(safe-area-inset-bottom))]" />
      </SheetContent>
    </Sheet>
  );
}
