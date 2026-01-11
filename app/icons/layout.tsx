export default function IconsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 overflow-auto bg-gradient-to-b from-stone-50 to-stone-100">
      {children}
    </div>
  );
}
