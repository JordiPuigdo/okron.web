export default function Container({
  children,
  className = '',
}: {
  children: React.ReactNode;
  enablePading?: boolean;
  className?: string;
}) {
  return (
    <div className={`pt-20 pb-6 mx-6 w-full h-full ${className}`}>
      {children}
    </div>
  );
}
