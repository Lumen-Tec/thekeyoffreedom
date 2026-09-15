import { SearchInput } from "./SearchInput";
import { cn } from "@/lib/utils";

export function SearchBar({ className }: { className?: string }) {
  return (
    <section
      aria-label="Buscar en el catálogo"
      className={cn("flex h-[76px] items-center border-b border-[#B58018]/30 bg-[#D8C9AD] px-4 sm:px-5", className)}
    >
      <div className="flex w-full items-center gap-4">
        <p className="shrink-0 text-[11px] font-medium uppercase tracking-[0.22em] text-[#14110F]">
          Buscá
        </p>
        <div className="flex-1">
          <SearchInput />
        </div>
      </div>
    </section>
  );
}
