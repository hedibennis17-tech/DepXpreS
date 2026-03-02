import { CATEGORIES } from "@/lib/data";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function CategoryList({ className }: { className?: string }) {
  return (
    <div className={cn("pb-4", className)}>
        <h2 className="text-2xl font-bold tracking-tight mb-4">Catégories</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {CATEGORIES.map((category) => (
            <Link href={`/client/category/${category.slug}`} key={category.id}>
                <Card className="group hover:bg-primary/5 transition-all">
                <CardContent className="flex flex-col items-center justify-center p-6 gap-3">
                    <category.icon className="h-8 w-8 text-primary group-hover:scale-110 transition-transform" />
                    <p className="text-sm font-medium text-center">{category.name}</p>
                </CardContent>
                </Card>
            </Link>
            ))}
        </div>
    </div>
  );
}
