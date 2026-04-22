export default function Container({
  children,
  fullWidth = false,
  className = '',
}: {
  children: React.ReactNode;
  enablePading?: boolean;
  fullWidth?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`pt-20 pb-6 w-full h-full flex flex-col overflow-auto ${fullWidth ? '' : 'mx-6'} ${className}`}
    >
      {children}
    </div>
  );
}
