// src/components/dashboard/StatCard.js
import { Card, CardContent } from "@/components/ui/card";

export default function StatCard({ title, value, children, icon: Icon, iconClassName }) {
  return (
    <Card className="bg-white shadow-sm rounded-xl border-none">
      <CardContent className="p-6 flex items-start justify-between">
        <div>
          {title && <p className="text-sm text-muted-foreground">{title}</p>}
          <p className="text-5xl font-bold mt-2 text-gray-800">{value}</p>
          {/* A prop 'children' nos permite passar subtítulos mais complexos */}
          {children && <div className="mt-1">{children}</div>}
        </div>
        {/* Renderiza o ícone se ele for passado */}
        {Icon && <Icon className={iconClassName || "h-6 w-6 text-muted-foreground"} />}
      </CardContent>
    </Card>
  );
}