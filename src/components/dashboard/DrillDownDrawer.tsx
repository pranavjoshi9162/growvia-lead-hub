import { ReactNode } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";

interface DrillDownDrawerProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
}

export function DrillDownDrawer({ open, onOpenChange, title, description, children }: DrillDownDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto p-0">
        <div className="border-b border-border px-6 py-5 bg-card sticky top-0 z-10">
          <SheetHeader>
            <SheetTitle className="text-xl">{title}</SheetTitle>
            {description && <SheetDescription>{description}</SheetDescription>}
          </SheetHeader>
        </div>
        <div className="p-6">{children}</div>
      </SheetContent>
    </Sheet>
  );
}
