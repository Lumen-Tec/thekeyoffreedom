import { useState } from "react";
import { useRange } from "react-instantsearch";
import { Slider } from "@/components/ui/slider";

function formatPrice(value: number) {
  return value.toLocaleString("es-CR");
}

type PriceRangeSliderProps = {
  min: number;
  max: number;
  from: number;
  to: number;
  onCommit: (value: number[]) => void;
};

function PriceRangeSlider({ min, max, from, to, onCommit }: PriceRangeSliderProps) {
  const [value, setValue] = useState<number[]>([from, to]);

  return (
    <div className="space-y-3">
      <Slider
        min={min}
        max={max}
        value={value}
        onValueChange={(next) => setValue(next as number[])}
        onValueCommitted={(next) => onCommit(next as number[])}
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>₡{formatPrice(value[0])}</span>
        <span>₡{formatPrice(value[1])}</span>
      </div>
    </div>
  );
}

export function PriceRangeFilter() {
  const { start, range, canRefine, refine } = useRange({ attribute: "price" });
  const min = range.min ?? 0;
  const max = range.max ?? 0;
  const from = Math.max(min, Number.isFinite(start[0] as number) ? (start[0] as number) : min);
  const to = Math.min(max, Number.isFinite(start[1] as number) ? (start[1] as number) : max);

  if (!canRefine) {
    return null;
  }

  return (
    <PriceRangeSlider
      key={`${from}-${to}-${min}-${max}`}
      min={min}
      max={max}
      from={from}
      to={to}
      onCommit={(value) => refine([value[0], value[1]])}
    />
  );
}
