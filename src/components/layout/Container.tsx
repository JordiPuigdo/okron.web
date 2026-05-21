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
      className={`pt-20 w-full h-full flex flex-col bg-red-2 ${fullWidth ? '' : 'mx-6'} ${className}`}
    >
      <div className="flex-1 overflow-auto pb-6 flex flex-col min-h-0 pr-6">
        {children}
      </div>
    </div>
  );
}
