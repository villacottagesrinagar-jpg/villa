import { BlogNav } from "@/components/BlogNav";
import { Footer } from "@/components/Footer";

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BlogNav />
      <div className="pt-16">{children}</div>
      <Footer />
    </>
  );
}
