import { SearchIcon, XIcon } from "lucide-react";
import { useSearchBox } from "react-instantsearch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function SearchInput() {
  const { query, refine } = useSearchBox();

  return (
    <form
      role="search"
      className="relative"
      onSubmit={(event) => event.preventDefault()}
    >
      <SearchIcon
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-[#14110F]/45"
      />
      <Input
        aria-label="Buscar productos"
        className="h-11 border-[#B58018]/35 bg-[#F8F4EC] px-11 text-base transition-colors duration-150 hover:border-[#8B6218] focus-visible:border-[#B58018] focus-visible:ring-[#E8B94B]/40 md:text-base"
        value={query}
        onChange={(event) => refine(event.target.value)}
        placeholder="Buscar prendas, accesorios o estilos"
      />
      {query && (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="absolute top-1/2 right-2 -translate-y-1/2 text-[#14110F]/55 hover:text-[#14110F]"
          onClick={() => refine("")}
        >
          <XIcon aria-hidden="true" />
          <span className="sr-only">Borrar búsqueda</span>
        </Button>
      )}
    </form>
  );
}
