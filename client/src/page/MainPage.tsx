import { useState, useEffect, useRef, type FC } from "react";

// ────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────

interface TypewriterProps {
  lines: string[];
}

interface StatCounterProps {
  end: number;
  suffix: string;
  label: string;
}

type Level = "입문" | "중급" | "고급";

interface CourseCardProps {
  tag: string;
  title: string;
  instructor: string;
  level: Level;
  students: number;
  thumb: string;
}

interface CategoryPillProps {
  icon: string;
  label: string;
  active: boolean;
  onClick: () => void;
}

interface Category {
  icon: string;
  label: string;
}

interface Course {
  tag: string;
  title: string;
  instructor: string;
  level: Level;
  students: number;
  thumb: string;
}

interface RoadmapItem {
  icon: string;
  label: string;
  desc: string;
}

interface StatItem {
  n: string;
  l: string;
}

// ────────────────────────────────────────────────────────────
// Typewriter
// ────────────────────────────────────────────────────────────
const Typewriter: FC<TypewriterProps> = ({ lines }) => {
  const [displayed, setDisplayed] = useState<string[]>([]);
  const [lineIdx, setLineIdx] = useState<number>(0);
  const [charIdx, setCharIdx] = useState<number>(0);

  useEffect(() => {
    if (lineIdx >= lines.length) return;
    if (charIdx < lines[lineIdx].length) {
      const t = setTimeout(() => setCharIdx((c) => c + 1), 35);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(() => {
        setDisplayed((d) => [...d, lines[lineIdx]]);
        setLineIdx((l) => l + 1);
        setCharIdx(0);
      }, 500);
      return () => clearTimeout(t);
    }
  }, [lineIdx, charIdx, lines]);

  const current: string =
    lineIdx < lines.length ? lines[lineIdx].slice(0, charIdx) : "";

  return (
    <div className="font-mono text-sm leading-7">
      {displayed.map((line, i) => (
        <div key={i} className="text-[#00ff88]">
          <span className="text-[#4af]">$</span> {line}
        </div>
      ))}
      {lineIdx < lines.length && (
        <div className="text-[#00ff88]">
          <span className="text-[#4af]">$</span> {current}
          <span className="animate-pulse">█</span>
        </div>
      )}
    </div>
  );
};

// ────────────────────────────────────────────────────────────
// StatCounter
// ────────────────────────────────────────────────────────────
const StatCounter: FC<StatCounterProps> = ({ end, suffix, label }) => {
  const [count, setCount] = useState<number>(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          let start = 0;
          const step = Math.ceil(end / 60);
          const timer = setInterval(() => {
            start += step;
            if (start >= end) {
              setCount(end);
              clearInterval(timer);
            } else {
              setCount(start);
            }
          }, 24);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end]);

  return (
    <div ref={ref} className="text-center">
      <div className="text-4xl font-black tracking-tight text-white">
        {count.toLocaleString()}
        <span className="text-[#00ff88]">{suffix}</span>
      </div>
      <div className="text-xs text-[#557] mt-1 uppercase tracking-widest">
        {label}
      </div>
    </div>
  );
};

// ────────────────────────────────────────────────────────────
// CourseCard
// ────────────────────────────────────────────────────────────
const levelColorMap: Record<Level, string> = {
  입문: "#00ff88",
  중급: "#4af",
  고급: "#f05",
};

const CourseCard: FC<CourseCardProps> = ({
  tag,
  title,
  instructor,
  level,
  students,
  thumb,
}) => {
  const color = levelColorMap[level];
  return (
    <div className="group relative bg-[#0d1117] border border-[#1e2a3a] rounded-xl overflow-hidden cursor-pointer hover:border-[#00ff88]/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(0,255,136,0.1)]">
      {/* Thumbnail */}
      <div className="relative h-44 overflow-hidden bg-[#0a0f1a]">
        <div className="absolute inset-0 flex items-center justify-center text-6xl select-none">
          {thumb}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d1117] to-transparent" />
        <span
          className="absolute top-3 left-3 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-widest"
          style={{
            background: `${color}22`,
            color,
            border: `1px solid ${color}55`,
          }}
        >
          {level}
        </span>
      </div>
      {/* Body */}
      <div className="p-4">
        <span className="text-[10px] text-[#4af] font-mono uppercase tracking-widest">
          {tag}
        </span>
        <h3 className="text-white font-bold text-sm mt-1 leading-snug group-hover:text-[#00ff88] transition-colors">
          {title}
        </h3>
        <div className="flex items-center justify-between mt-3">
          <span className="text-[#445] text-xs">{instructor}</span>
          <span className="text-[#334] text-xs font-mono">
            {students.toLocaleString()}명
          </span>
        </div>
      </div>
    </div>
  );
};

// ────────────────────────────────────────────────────────────
// CategoryPill
// ────────────────────────────────────────────────────────────
const CategoryPill: FC<CategoryPillProps> = ({
  icon,
  label,
  active,
  onClick,
}) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-mono font-bold uppercase tracking-wider border transition-all duration-200 whitespace-nowrap
      ${
        active
          ? "bg-[#00ff88] text-black border-[#00ff88]"
          : "bg-transparent text-[#556] border-[#1e2a3a] hover:border-[#00ff88]/40 hover:text-[#00ff88]"
      }`}
  >
    <span>{icon}</span> {label}
  </button>
);

// ────────────────────────────────────────────────────────────
// MainPage
// ────────────────────────────────────────────────────────────
const CATEGORIES: Category[] = [
  { icon: "◈", label: "전체" },
  { icon: "🛡", label: "네트워크 보안" },
  { icon: "🔒", label: "웹 해킹" },
  { icon: "⚙", label: "리버싱" },
  { icon: "💀", label: "포렌식" },
  { icon: "🤖", label: "AI 보안" },
  { icon: "☁", label: "클라우드 보안" },
];

const COURSES: Course[] = [
  {
    tag: "웹 해킹",
    title: "OWASP Top 10으로 배우는 실전 웹 취약점 분석",
    instructor: "박민준 · OSCP",
    level: "입문",
    students: 8420,
    thumb: "🕷️",
  },
  {
    tag: "네트워크 보안",
    title: "Wireshark 패킷 분석 완전 정복 A to Z",
    instructor: "김서연 · CEH",
    level: "중급",
    students: 5100,
    thumb: "📡",
  },
  {
    tag: "리버싱",
    title: "x64 어셈블리와 IDA Pro로 시작하는 리버스 엔지니어링",
    instructor: "이현우 · GREM",
    level: "고급",
    students: 2870,
    thumb: "⚙️",
  },
  {
    tag: "포렌식",
    title: "디지털 포렌식: 증거 수집부터 보고서 작성까지",
    instructor: "최지원 · EnCE",
    level: "중급",
    students: 3650,
    thumb: "🔍",
  },
  {
    tag: "AI 보안",
    title: "LLM 취약점과 프롬프트 인젝션 공격 방어 기법",
    instructor: "정우성 · PhD",
    level: "고급",
    students: 4210,
    thumb: "🤖",
  },
  {
    tag: "클라우드 보안",
    title: "AWS 인프라 보안 설계와 IAM 정책 최적화",
    instructor: "한소희 · AWS SA",
    level: "중급",
    students: 6030,
    thumb: "☁️",
  },
];

const ROADMAP_ITEMS: RoadmapItem[] = [
  { icon: "🌱", label: "입문자", desc: "컴퓨터 기초 → 리눅스 → 네트워크 기초" },
  { icon: "⚡", label: "CTF 준비생", desc: "웹해킹 → 리버싱 → 포렌식 → 암호학" },
  { icon: "💼", label: "취업/이직 목표", desc: "실무 보안 → 자격증 → 포트폴리오" },
];

const HERO_STATS: StatItem[] = [
  { n: "12,400+", l: "수강생" },
  { n: "240+", l: "강좌" },
  { n: "98%", l: "취업/이직 성공률" },
];

const HERO_CATEGORIES = [
  { icon: "🛡", label: "네트워크 보안", count: 42, accent: "#00ff88" },
  { icon: "🔒", label: "웹 해킹",       count: 38, accent: "#4af"    },
  { icon: "⚙",  label: "리버싱",        count: 21, accent: "#f05"    },
  { icon: "💀", label: "포렌식",         count: 19, accent: "#fa0"    },
  { icon: "🤖", label: "AI 보안",        count: 15, accent: "#c8f"    },
  { icon: "☁",  label: "클라우드 보안",  count: 27, accent: "#4af"    },
];

interface HeroCategoryCardProps {
  icon: string;
  label: string;
  count: number;
  accent: string;
}

const HeroCategoryCard: FC<HeroCategoryCardProps> = ({ icon, label, count, accent }) => (
  <div
    className="group flex items-center gap-3 bg-[#0d1117] border border-[#1e2a3a] rounded-xl px-4 py-3 cursor-pointer transition-all duration-200 hover:-translate-y-0.5"
    style={{ ["--accent" as string]: accent }}
  >
    <span className="text-xl">{icon}</span>
    <div className="flex-1 min-w-0">
      <p className="text-white text-xs font-bold truncate group-hover:text-[var(--accent)] transition-colors">
        {label}
      </p>
      <p className="text-[#445] text-[10px] font-mono">{count}개 강좌</p>
    </div>
    <span className="text-[#223] group-hover:text-[var(--accent)] transition-colors text-xs">→</span>
  </div>
);

const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Syne:wght@700;800&family=Noto+Sans+KR:wght@400;700;900&display=swap');
  * { font-family: 'Noto Sans KR', sans-serif; }
  .font-mono { font-family: 'Share Tech Mono', monospace !important; }
  .font-display { font-family: 'Syne', 'Noto Sans KR', sans-serif !important; }
  .scanline {
    background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,136,0.015) 2px, rgba(0,255,136,0.015) 4px);
    pointer-events: none;
  }
  
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: #060b12; }
  ::-webkit-scrollbar-thumb { background: #00ff8844; border-radius: 2px; }
`;

const MainPage: FC = () => {
  const [activeCat, setActiveCat] = useState<string>("전체");
  const [scrolled, setScrolled] = useState<boolean>(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#060b12] text-white overflow-x-hidden select-none">
      <style>{globalStyles}</style>

      {/* ── NAV ── */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-[#060b12]/95 backdrop-blur-md border-b border-[#1e2a3a]"
            : ""
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-[#00ff88] flex items-center justify-center">
              <span className="text-black text-xs font-black font-mono">S</span>
            </div>
            <span className="font-display font-black text-lg tracking-tight">
              sec<span className="text-[#00ff88]">101</span>
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-xs font-mono text-[#556] uppercase tracking-widest">
            {["강좌", "CTF 챌린지", "로드맵", "커뮤니티"].map((item) => (
              <a
                key={item}
                href="#"
                className="hover:text-[#00ff88] transition-colors"
              >
                {item}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <button className="text-xs font-mono text-[#556] hover:text-white transition-colors px-3 py-1.5">
              로그인
            </button>
            <button className="text-xs font-mono font-bold bg-[#00ff88] text-black px-4 py-1.5 rounded hover:bg-white transition-colors">
              무료 시작
            </button>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center pt-16 hex-grid">
        <div className="scanline absolute inset-0" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[#00ff88]/5 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-[#0af]/5 blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center py-24">
          {/* Left */}
          <div>
            <h1 className="font-display font-black text-5xl md:text-6xl leading-[1.05] tracking-tight mb-6">
              <span className="block text-white">해커의 시각으로</span>
              <p className="text-[#00ff88] block">시스템을 지킨다</p>
            </h1>

            <p className="text-[#445] text-base leading-relaxed mb-10 max-w-md">
              실전 CTF부터 기업 보안 실무까지. 국내 최고 화이트햇 해커들이 직접
              만든 사이버 보안 강좌로 레벨업하세요.
            </p>

            <div className="flex items-center gap-4 mb-12">
              <button className="font-mono font-bold text-sm bg-[#00ff88] text-black px-7 py-3 rounded hover:bg-white transition-all hover:shadow-[0_0_30px_rgba(0,255,136,0.4)]">
                강좌 둘러보기 →
              </button>
              <button className="font-mono text-sm text-[#00ff88] border border-[#00ff88]/30 px-7 py-3 rounded hover:bg-[#00ff88]/10 transition-all hidden">
                CTF 시작하기
              </button>
            </div>

            <div className="flex gap-8">
              {HERO_STATS.map(({ n, l }) => (
                <div key={l}>
                  <div className="font-mono font-bold text-lg text-white">{n}</div>
                  <div className="text-[10px] text-[#445] uppercase tracking-widest">
                    {l}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
              {/* Right: Category Grid */}
              <div className="grid grid-cols-2 gap-3">
                {HERO_CATEGORIES.map((cat) => (
                  <HeroCategoryCard key={cat.label} {...cat} />
                ))}
              </div>
            </div>
          </div>
      </section>

      {/* ── STATS BAR ── */}
      <section className="border-y border-[#1e2a3a] bg-[#0a0f1a] py-12">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          <StatCounter end={12400} suffix="+" label="누적 수강생" />
          <StatCounter end={240} suffix="+" label="강좌 수" />
          <StatCounter end={48} suffix="명" label="전문 강사진" />
          <StatCounter end={99} suffix="%" label="수강생 만족도" />
        </div>
      </section>

      {/* ── COURSES ── */}
      <section className="py-20 max-w-7xl mx-auto px-6">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="font-mono text-[10px] text-[#00ff88] uppercase tracking-widest mb-2">
              // 커리큘럼
            </p>
            <h2 className="font-display font-black text-3xl text-white">
              인기 강좌
            </h2>
          </div>
          <a
            href="#"
            className="font-mono text-xs text-[#4af] hover:text-white transition-colors hidden md:block"
          >
            전체 보기 →
          </a>
        </div>

        {/* Category filter */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-8">
          {CATEGORIES.map(({ icon, label }) => (
            <CategoryPill
              key={label}
              icon={icon}
              label={label}
              active={activeCat === label}
              onClick={() => setActiveCat(label)}
            />
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {COURSES.map((c) => (
            <CourseCard key={c.title} {...c} />
          ))}
        </div>
      </section>

      {/* ── ROADMAP BANNER ── */}
      <section className="mx-6 mb-20 rounded-2xl overflow-hidden relative bg-gradient-to-br from-[#0d2a1a] to-[#0a1a2a] border border-[#00ff88]/20">
        <div className="absolute inset-0 hex-grid opacity-40" />
        <div className="relative px-10 py-14 grid md:grid-cols-2 gap-8 items-center">
          <div>
            <p className="font-mono text-[10px] text-[#00ff88] uppercase tracking-widest mb-3">
              // 학습 로드맵
            </p>
            <h2 className="font-display font-black text-3xl text-white mb-4">
              어디서부터 시작해야 할지
              <br />
              <span className="text-[#00ff88]">모르겠다면?</span>
            </h2>
            <p className="text-[#445] text-sm leading-relaxed mb-6">
              입문자부터 전문가까지, 목표에 맞는 최적의 학습 경로를 제시해드립니다.
              OSCP, CEH, 버그바운티 취업 등 원하는 목적지를 선택하세요.
            </p>
            <button className="font-mono font-bold text-sm bg-[#00ff88] text-black px-6 py-3 rounded hover:bg-white transition-all">
              내 로드맵 만들기 →
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {ROADMAP_ITEMS.map(({ icon, label, desc }) => (
              <div
                key={label}
                className="flex items-center gap-4 bg-white/5 rounded-xl px-4 py-3 border border-white/10 hover:border-[#00ff88]/40 cursor-pointer transition-all group"
              >
                <span className="text-2xl">{icon}</span>
                <div>
                  <div className="text-sm font-bold text-white group-hover:text-[#00ff88] transition-colors">
                    {label}
                  </div>
                  <div className="text-xs text-[#445]">{desc}</div>
                </div>
                <span className="ml-auto text-[#334] group-hover:text-[#00ff88] transition-colors">
                  →
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-[#1e2a3a] py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-[#00ff88] flex items-center justify-center">
              <span className="text-black text-[10px] font-black font-mono">S</span>
            </div>
            <span className="font-display font-black text-sm">
              sec<span className="text-[#00ff88]">101</span>
            </span>
          </div>
          <p className="font-mono text-[10px] text-[#334]">
            © 2025 SEC101 · ethical hacking only · 화이트햇 해커 양성
          </p>
          <div className="flex gap-4 font-mono text-[10px] text-[#334]">
            {["이용약관", "개인정보처리방침", "GitHub"].map((item) => (
              <a
                key={item}
                href="#"
                className="hover:text-[#00ff88] transition-colors"
              >
                {item}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainPage;
