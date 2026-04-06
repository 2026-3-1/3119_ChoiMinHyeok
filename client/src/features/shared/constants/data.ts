import type {
  CategoryBadge,
  CounterStat,
  CourseCardItem,
  FooterLink,
  HeroCategory,
  HeroStat,
  RoadmapItem,
} from "../types";

export const ALL_CATEGORY_LABEL = "전체";

export const footerLinks: FooterLink[] = [
  { label: "GitHub", href: "https://github.com" },
  { label: "개인정보처리방침", href: "#" },
  { label: "고객지원", href: "#" },
];

export const featuredCategoryBadges: CategoryBadge[] = [
  { icon: "ALL", label: ALL_CATEGORY_LABEL },
  { icon: "WEB", label: "웹 보안" },
  { icon: "NET", label: "네트워크" },
  { icon: "REV", label: "리버싱" },
  { icon: "FOR", label: "포렌식" },
];

export const featuredCourses: CourseCardItem[] = [
  {
    id: 101,
    title: "OWASP Top 10 실전 분석",
    description: "취약점 개념과 공격 흐름을 한 번에 익히는 웹 보안 입문 코스",
    difficulty: "EASY",
    categoryName: "웹 보안",
    learners: 1240,
  },
  {
    id: 102,
    title: "패킷 캡처로 배우는 네트워크 침해 대응",
    description: "트래픽 분석 관점으로 네트워크 보안 기초를 익히는 강의",
    difficulty: "MEDIUM",
    categoryName: "네트워크",
    learners: 860,
  },
  {
    id: 103,
    title: "x64 리버싱과 악성코드 추적",
    description: "정적 분석과 디버깅을 따라가며 실전 리버싱 역량을 키우는 코스",
    difficulty: "HARD",
    categoryName: "리버싱",
    learners: 420,
  },
];

export const roadmapItems: RoadmapItem[] = [
  {
    icon: "01",
    label: "입문 트랙",
    description: "웹 보안, 네트워크, 리눅스 기초를 빠르게 다지는 시작 단계입니다.",
  },
  {
    icon: "02",
    label: "실전 트랙",
    description: "CTF, 로그 분석, 취약점 재현 중심으로 실무 감각을 넓힙니다.",
  },
  {
    icon: "03",
    label: "심화 트랙",
    description: "리버싱과 포렌식, 클라우드 보안까지 확장해 보는 심화 과정입니다.",
  },
];

export const heroStats: HeroStat[] = [
  { value: "240+", label: "공개 강의" },
  { value: "12k+", label: "활성 수강생" },
  { value: "98%", label: "만족도" },
];

export const heroCategories: HeroCategory[] = [
  { icon: "WEB", label: "웹 보안", count: 42, accent: "#00ff88" },
  { icon: "NET", label: "네트워크", count: 31, accent: "#4dabff" },
  { icon: "REV", label: "리버싱", count: 18, accent: "#ff6b6b" },
  { icon: "FOR", label: "포렌식", count: 16, accent: "#ffd166" },
];

export const counterStats: CounterStat[] = [
  { end: 12400, suffix: "+", label: "누적 수강생" },
  { end: 240, suffix: "+", label: "강의 수" },
  { end: 48, suffix: "", label: "실전 프로젝트" },
  { end: 99, suffix: "%", label: "수강 만족도" },
];
