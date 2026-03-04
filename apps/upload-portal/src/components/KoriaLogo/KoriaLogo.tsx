interface KoriaLogoProps {
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = {
  sm: { text: 'text-xl', sub: 'text-[6px] tracking-[0.25em]' },
  md: { text: 'text-3xl', sub: 'text-[8px] tracking-[0.3em]' },
  lg: { text: 'text-5xl', sub: 'text-[10px] tracking-[0.35em]' },
};

export function KoriaLogo({ size = 'md' }: KoriaLogoProps) {
  const s = sizeMap[size];

  return (
    <div className="flex flex-col items-center select-none">
      <div className={`${s.text} font-bold leading-none`}>
        <span className="text-white">Kor</span>
        <span className="text-primary">IA</span>
      </div>
      <span className={`${s.sub} mt-0.5 font-medium uppercase text-muted-foreground`}>
        Creative Studio
      </span>
    </div>
  );
}
