import { BlogNav } from "@/components/BlogNav";

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BlogNav />
      <div className="pt-16">{children}</div>
    </>
  );
}
