import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { FilterSection } from "./FilterSection";
import { PriceRangeFilter } from "./PriceRangeFilter";
import { RefinementFilter } from "./RefinementFilter";

type FilterPanelProps = {
  className?: string;
  scrollable?: boolean;
};

export function FilterPanel({ className, scrollable = true }: FilterPanelProps) {
  const content = (
    <div className="space-y-4 px-4 py-4 sm:px-5">
      <FilterSection title="Categorías">
        <RefinementFilter attribute="categories" />
      </FilterSection>
      <FilterSection title="Género">
        <RefinementFilter attribute="facets.gender" />
      </FilterSection>
      <FilterSection title="Precio">
        <PriceRangeFilter />
      </FilterSection>
      <FilterSection title="Marca">
        <RefinementFilter attribute="brand" />
      </FilterSection>
      <FilterSection title="Talla">
        <RefinementFilter attribute="facets.size" />
      </FilterSection>
      <FilterSection title="Color">
        <RefinementFilter attribute="facets.color" />
      </FilterSection>
    </div>
  );

  if (!scrollable) {
    return <div className={className}>{content}</div>;
  }

  return (
    <ScrollArea className={cn("overscroll-contain [&_[data-slot=scroll-area-thumb]]:bg-black", className)}>
      {content}
    </ScrollArea>
  );
}
