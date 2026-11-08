import type { ReactNode } from "react";

type PageHeaderProps = {
  title: string;
  description?: string;
  /** Acciones a la derecha (botones). */
  actions?: ReactNode;
  /** Enlace de regreso sobre el título. */
  back?: ReactNode;
};

export function PageHeader({ title, description, actions, back }: PageHeaderProps): ReactNode {
  return (
    <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {back}
        <h1 className="text-2xl font-semibold tracking-tight text-balance">{title}</h1>
        {description && <p className="mt-1 text-pretty text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </header>
  );
}
