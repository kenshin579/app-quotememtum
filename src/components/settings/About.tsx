export function About() {
  return (
    <div className="space-y-4 text-sm text-gray-300">
      <div>
        <h3 className="mb-1 font-medium text-white">InspireMe</h3>
        <p>새 탭에서 매일 영감을 주는 명언을 만나보세요.</p>
      </div>

      <div>
        <p>Version 2.0.0</p>
      </div>

      <div className="space-y-1">
        <a
          href="https://github.com/kenshin579/inspireme.chrome"
          target="_blank"
          rel="noopener noreferrer"
          className="block underline hover:text-white"
        >
          GitHub
        </a>
        <a
          href="https://inspire-me.advenoh.pe.kr"
          target="_blank"
          rel="noopener noreferrer"
          className="block underline hover:text-white"
        >
          InspireMe
        </a>
      </div>
    </div>
  );
}
