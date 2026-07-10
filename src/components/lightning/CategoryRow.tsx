import { ReactNode } from "react";

export const CategoryRow = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => (
  <section className="mb-8">
    <h2 className="mb-3 text-2xl md:text-3xl font-bold tracking-tight text-foreground">
      {title}
    </h2>
    <div className="-mx-4 md:-mx-10 flex gap-3 md:gap-4 overflow-x-auto scroll-smooth px-4 md:px-10 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {children}
    </div>
  </section>
);