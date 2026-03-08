interface BackgroundProps {
  url: string | null;
}

export function Background({ url }: BackgroundProps) {
  return (
    <div
      className="fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat bg-gray-900 transition-opacity duration-1000"
      style={url ? { backgroundImage: `url(${url})` } : undefined}
    >
      <div className="absolute inset-0 bg-black/30" />
    </div>
  );
}
