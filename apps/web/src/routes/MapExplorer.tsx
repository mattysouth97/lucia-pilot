// 후보지 지도 — GIS site-selection page with AI chatbot.
//
// V1 is fully simulated:
//   - 116 LH 매입임대주택 buildings with mock-but-realistic Korean lat/lng
//   - Mapbox GL basemap with state-coded markers (token via VITE_MAPBOX_TOKEN)
//   - Deterministic ko-KR query parser stubbing the Anthropic tool-use loop
//
// When RTUs land real lat/lng + 세움터/VWORLD/부동산정보 통합 열람 keys
// arrive, only the marker source swaps; the chat stub swaps to a real
// Anthropic SDK tool-use call. The visual contract (map / chat / result
// panel) stays intact.

import mapboxgl from 'mapbox-gl';
import { useEffect, useMemo, useRef, useState } from 'react';

import 'mapbox-gl/dist/mapbox-gl.css';

import { Icons } from '@/components/Icons';
import { Pill, fmt } from '@/components/atoms';

// ────────────────────────────────────────────────────────────────────────────
// Mock dataset — deterministic 116-building generator
// ────────────────────────────────────────────────────────────────────────────

interface ProvinceSpec {
  id: string;
  name: string;
  shortName: string;
  cities: { code: string; name: string; lat: number; lng: number; share: number }[];
}

const PROVINCES: ProvinceSpec[] = [
  { id: 'SEL', name: '서울특별시', shortName: '서울', cities: [
    { code: 'SELG', name: '강서', lat: 37.561, lng: 126.823, share: 4 },
    { code: 'SEL2', name: '노원', lat: 37.654, lng: 127.056, share: 5 },
    { code: 'SEL3', name: '관악', lat: 37.478, lng: 126.951, share: 5 },
    { code: 'SEL4', name: '구로', lat: 37.495, lng: 126.887, share: 4 },
  ]},
  { id: 'BSN', name: '부산광역시', shortName: '부산', cities: [
    { code: 'BSAN', name: '사상',  lat: 35.150, lng: 128.991, share: 4 },
    { code: 'BSN2', name: '해운대', lat: 35.163, lng: 129.163, share: 4 },
    { code: 'BSN3', name: '동래',  lat: 35.205, lng: 129.083, share: 4 },
  ]},
  { id: 'ICN', name: '인천광역시', shortName: '인천', cities: [
    { code: 'INCH', name: '계양',  lat: 37.537, lng: 126.738, share: 5 },
    { code: 'INC2', name: '부평',  lat: 37.507, lng: 126.722, share: 5 },
  ]},
  { id: 'GGD', name: '경기도', shortName: '경기', cities: [
    { code: 'SUWN', name: '수원',  lat: 37.263, lng: 127.029, share: 6 },
    { code: 'YGIN', name: '용인',  lat: 37.241, lng: 127.178, share: 4 },
    { code: 'PYTK', name: '평택',  lat: 36.991, lng: 127.085, share: 4 },
    { code: 'HSNG', name: '화성',  lat: 37.199, lng: 126.831, share: 4 },
    { code: 'UJBU', name: '의정부', lat: 37.738, lng: 127.034, share: 4 },
  ]},
  { id: 'GBD', name: '경상북도', shortName: '경북', cities: [
    { code: 'ULJN', name: '울진',  lat: 36.993, lng: 129.401, share: 4 },
    { code: 'YESU', name: '예천',  lat: 36.658, lng: 128.451, share: 2 },
    { code: 'PHNG', name: '포항',  lat: 36.019, lng: 129.343, share: 2 },
  ]},
  { id: 'GND', name: '경상남도', shortName: '경남', cities: [
    { code: 'CWNG', name: '창원',  lat: 35.227, lng: 128.682, share: 5 },
    { code: 'GNJU', name: '진주',  lat: 35.180, lng: 128.108, share: 4 },
  ]},
  { id: 'CBD', name: '충청북도', shortName: '충북', cities: [
    { code: 'CGJU', name: '청주',  lat: 36.642, lng: 127.489, share: 5 },
  ]},
  { id: 'CND', name: '충청남도', shortName: '충남', cities: [
    { code: 'YESN', name: '예산',  lat: 36.681, lng: 126.844, share: 3 },
    { code: 'CNAN', name: '천안',  lat: 36.815, lng: 127.114, share: 4 },
  ]},
  { id: 'GWD', name: '강원도', shortName: '강원', cities: [
    { code: 'CHCN', name: '춘천',  lat: 37.881, lng: 127.730, share: 3 },
    { code: 'KGNG', name: '강릉',  lat: 37.752, lng: 128.875, share: 3 },
  ]},
  { id: 'JND', name: '전라남도', shortName: '전남', cities: [
    { code: 'YEOS', name: '여수',  lat: 34.760, lng: 127.662, share: 3 },
    { code: 'MOKP', name: '목포',  lat: 34.811, lng: 126.392, share: 3 },
  ]},
  { id: 'JBD', name: '전라북도', shortName: '전북', cities: [
    { code: 'JEON', name: '전주',  lat: 35.824, lng: 127.148, share: 3 },
    { code: 'GNSN', name: '군산',  lat: 35.967, lng: 126.711, share: 3 },
  ]},
  { id: 'GJU', name: '광주광역시', shortName: '광주', cities: [
    { code: 'GWAN', name: '광산',  lat: 35.139, lng: 126.793, share: 4 },
  ]},
  { id: 'DGU', name: '대구광역시', shortName: '대구', cities: [
    { code: 'DGNG', name: '달성',  lat: 35.774, lng: 128.431, share: 3 },
  ]},
];

type SiteState = 'existing' | 'good' | 'marginal' | 'unsuitable';
type Orientation = 'south' | 'south-east' | 'south-west' | 'east' | 'west' | 'mixed';

interface MapBuilding {
  id: string;
  name: string;
  cityName: string;
  province: string;
  provinceShort: string;
  lat: number;
  lng: number;
  households: number;
  capacityKw: number;
  candidateCapacityKw: number;
  rooftopAreaM2: number;
  yearBuilt: number;
  orientation: Orientation;
  state: SiteState;
  scoreReason: string;
}

// LCG-style deterministic pseudorandom — same seed = same dataset every render.
function createRng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0x100000000;
  };
}

function pickOrientation(rng: () => number): Orientation {
  const r = rng();
  if (r < 0.42) return 'south';
  if (r < 0.58) return 'south-east';
  if (r < 0.74) return 'south-west';
  if (r < 0.84) return 'east';
  if (r < 0.92) return 'west';
  return 'mixed';
}

function generateBuildings(): MapBuilding[] {
  const rng = createRng(7349);
  const list: MapBuilding[] = [];
  let counter = 0;
  for (const province of PROVINCES) {
    for (const city of province.cities) {
      for (let i = 0; i < city.share; i++) {
        counter++;
        const id = `${city.code}-${String(counter).padStart(3, '0')}`;
        const latJitter = (rng() - 0.5) * 0.06;
        const lngJitter = (rng() - 0.5) * 0.08;
        const households = 80 + Math.floor(rng() * 1500);
        const yearBuilt = 1985 + Math.floor(rng() * 38);
        const orientation = pickOrientation(rng);
        const rooftopAreaM2 = 200 + Math.floor(rng() * 1800);

        // State distribution: 60% existing, 22% good, 13% marginal, 5% unsuit.
        const stateRoll = rng();
        let state: SiteState;
        if (stateRoll < 0.60) state = 'existing';
        else if (stateRoll < 0.82) state = 'good';
        else if (stateRoll < 0.95) state = 'marginal';
        else state = 'unsuitable';

        // Override with rules so the visualisation is internally consistent.
        const southFacing = orientation === 'south' || orientation === 'south-east' || orientation === 'south-west';
        if (state !== 'existing') {
          if (rooftopAreaM2 >= 600 && yearBuilt >= 2000 && southFacing) state = 'good';
          else if (rooftopAreaM2 >= 300 && yearBuilt >= 1990) state = 'marginal';
          else state = 'unsuitable';
        }

        const capacityKw =
          state === 'existing'
            ? Math.round((rooftopAreaM2 * 0.16) + rng() * 40)
            : 0;
        const candidateCapacityKw =
          state === 'existing'
            ? 0
            : Math.round((rooftopAreaM2 * 0.16) * (state === 'good' ? 1.0 : state === 'marginal' ? 0.7 : 0.3));

        const scoreReason =
          state === 'existing'
            ? `${capacityKw}kW 가동중`
            : state === 'good'
              ? `옥상 ${rooftopAreaM2}㎡ · ${yearBuilt}년 · 남향`
              : state === 'marginal'
                ? `옥상 ${rooftopAreaM2}㎡ · 보강 필요`
                : `면적 부족 또는 노후`;

        list.push({
          id,
          name: `${city.name} ${province.shortName}-${String.fromCharCode(64 + ((i % 26) + 1))}`,
          cityName: city.name,
          province: province.name,
          provinceShort: province.shortName,
          lat: city.lat + latJitter,
          lng: city.lng + lngJitter,
          households,
          capacityKw,
          candidateCapacityKw,
          rooftopAreaM2,
          yearBuilt,
          orientation,
          state,
          scoreReason,
        });
      }
    }
  }
  return list;
}

const ALL_BUILDINGS: ReadonlyArray<MapBuilding> = generateBuildings();

// ────────────────────────────────────────────────────────────────────────────
// Filter model — what the chatbot returns into the map
// ────────────────────────────────────────────────────────────────────────────

interface BuildingFilter {
  provinces?: string[];
  cities?: string[];
  states?: SiteState[];
  capacityMin?: number;
  capacityMax?: number;
  candidateCapacityMin?: number;
  householdsMin?: number;
  rooftopAreaMin?: number;
  southFacing?: boolean;
  yearBuiltMin?: number;
}

function applyFilter(buildings: ReadonlyArray<MapBuilding>, f: BuildingFilter): MapBuilding[] {
  return buildings.filter((b) => {
    if (f.provinces && !f.provinces.some((p) => b.province.includes(p) || b.provinceShort === p)) return false;
    if (f.cities && !f.cities.some((c) => b.cityName.includes(c))) return false;
    if (f.states && !f.states.includes(b.state)) return false;
    if (f.capacityMin != null && b.capacityKw < f.capacityMin) return false;
    if (f.capacityMax != null && b.capacityKw > f.capacityMax) return false;
    if (f.candidateCapacityMin != null && b.candidateCapacityKw < f.candidateCapacityMin) return false;
    if (f.householdsMin != null && b.households < f.householdsMin) return false;
    if (f.rooftopAreaMin != null && b.rooftopAreaM2 < f.rooftopAreaMin) return false;
    if (f.yearBuiltMin != null && b.yearBuilt < f.yearBuiltMin) return false;
    if (f.southFacing) {
      const south = b.orientation === 'south' || b.orientation === 'south-east' || b.orientation === 'south-west';
      if (!south) return false;
    }
    return true;
  });
}

// ────────────────────────────────────────────────────────────────────────────
// Stub chatbot — deterministic ko-KR pattern parser mimicking tool-use shape
// ────────────────────────────────────────────────────────────────────────────

interface ToolCall {
  tool: 'query_buildings' | 'fetch_saeumteo' | 'fetch_vworld_3d';
  args: Record<string, string | number | boolean | string[]>;
  resultCount?: number;
}

interface ChatTurn {
  role: 'user' | 'assistant';
  text: string;
  toolCalls?: ToolCall[];
  resultIds?: string[]; // building ids
  pending?: boolean;
}

const PROVINCE_KEYWORDS: { keyword: string; province: string }[] = [
  { keyword: '서울', province: '서울특별시' },
  { keyword: '부산', province: '부산광역시' },
  { keyword: '인천', province: '인천광역시' },
  { keyword: '대구', province: '대구광역시' },
  { keyword: '광주', province: '광주광역시' },
  { keyword: '경기', province: '경기도' },
  { keyword: '경상북도', province: '경상북도' },
  { keyword: '경북', province: '경상북도' },
  { keyword: '경상남도', province: '경상남도' },
  { keyword: '경남', province: '경상남도' },
  { keyword: '충청북도', province: '충청북도' },
  { keyword: '충북', province: '충청북도' },
  { keyword: '충청남도', province: '충청남도' },
  { keyword: '충남', province: '충청남도' },
  { keyword: '강원', province: '강원도' },
  { keyword: '전라남도', province: '전라남도' },
  { keyword: '전남', province: '전라남도' },
  { keyword: '전라북도', province: '전라북도' },
  { keyword: '전북', province: '전라북도' },
];

interface QueryResult {
  filter: BuildingFilter;
  toolCalls: ToolCall[];
  reasoning: string;
}

function parseUserQuery(text: string): QueryResult {
  const filter: BuildingFilter = {};
  const detectedProvinces: string[] = [];
  for (const p of PROVINCE_KEYWORDS) {
    if (text.includes(p.keyword) && !detectedProvinces.includes(p.province)) {
      detectedProvinces.push(p.province);
    }
  }
  if (detectedProvinces.length > 0) filter.provinces = detectedProvinces;

  // Capacity: "300kW 이상" / "300 kW 이상" / "300킬로와트 이상"
  const capMin = /(\d+)\s*(?:kW|킬로와트|kw)\s*이상/i.exec(text);
  if (capMin) filter.capacityMin = parseInt(capMin[1] ?? '0', 10);
  const capMax = /(\d+)\s*(?:kW|킬로와트|kw)\s*이하/i.exec(text);
  if (capMax) filter.capacityMax = parseInt(capMax[1] ?? '0', 10);

  // Candidate capacity for new install
  if (/추가\s*설치|확장|증설/.test(text)) {
    const candMin = /(\d+)\s*(?:kW|킬로와트)/i.exec(text);
    if (candMin) filter.candidateCapacityMin = parseInt(candMin[1] ?? '0', 10);
  }

  // Households
  const hh = /(\d+)\s*세대\s*이상/.exec(text);
  if (hh) filter.householdsMin = parseInt(hh[1] ?? '0', 10);

  // Rooftop area
  const roof = /(\d+)\s*(?:㎡|m²|m2|제곱미터)\s*이상/.exec(text);
  if (roof) filter.rooftopAreaMin = parseInt(roof[1] ?? '0', 10);

  // Orientation
  if (/남향|남쪽/.test(text)) filter.southFacing = true;

  // Year built
  const year = /(\d{4})년\s*이후/.exec(text);
  if (year) filter.yearBuiltMin = parseInt(year[1] ?? '0', 10);

  // State
  const states: SiteState[] = [];
  if (/후보|적합한|설치 가능|확장 가능|추가 설치/.test(text)) {
    states.push('good');
    if (!/적합한 곳만|좋은 곳만/.test(text)) states.push('marginal');
  }
  if (/기존|발전\s*중|가동\s*중|이미 설치/.test(text)) states.push('existing');
  if (/부적합|불가능/.test(text)) states.push('unsuitable');
  if (states.length > 0) filter.states = states;

  // Reasoning trace
  const traceParts: string[] = [];
  if (filter.provinces) traceParts.push(`지역: ${filter.provinces.join(', ')}`);
  if (filter.capacityMin) traceParts.push(`설치용량 ≥ ${filter.capacityMin}kW`);
  if (filter.capacityMax) traceParts.push(`설치용량 ≤ ${filter.capacityMax}kW`);
  if (filter.candidateCapacityMin) traceParts.push(`확장 가능량 ≥ ${filter.candidateCapacityMin}kW`);
  if (filter.householdsMin) traceParts.push(`세대수 ≥ ${filter.householdsMin}`);
  if (filter.rooftopAreaMin) traceParts.push(`옥상 ${filter.rooftopAreaMin}㎡ 이상`);
  if (filter.southFacing) traceParts.push('남향');
  if (filter.yearBuiltMin) traceParts.push(`${filter.yearBuiltMin}년 이후 준공`);
  if (filter.states) traceParts.push(`상태: ${filter.states.join(', ')}`);

  // Tool calls — primary query, plus optional saeumteo when rooftop/year mentioned
  const toolCalls: ToolCall[] = [];
  toolCalls.push({
    tool: 'query_buildings',
    args: filter as Record<string, string | number | boolean | string[]>,
  });
  if (filter.rooftopAreaMin || filter.yearBuiltMin || filter.southFacing) {
    toolCalls.push({
      tool: 'fetch_saeumteo',
      args: { fields: ['rooftop_area', 'year_built', 'orientation'] },
    });
  }
  if (filter.candidateCapacityMin) {
    toolCalls.push({
      tool: 'fetch_vworld_3d',
      args: { include_neighbors: true, shading_radius_m: 50 },
    });
  }

  const reasoning = traceParts.length > 0 ? traceParts.join(' · ') : '전체 116동 조회';
  return { filter, toolCalls, reasoning };
}

function composeAssistantResponse(matched: MapBuilding[], reasoning: string): string {
  if (matched.length === 0) {
    return `조회 결과 없음. 조건(${reasoning})에 부합하는 건물이 없습니다. 조건을 완화해보시겠어요?`;
  }
  const stateBuckets = matched.reduce<Record<SiteState, number>>(
    (acc, b) => {
      acc[b.state] = (acc[b.state] ?? 0) + 1;
      return acc;
    },
    { existing: 0, good: 0, marginal: 0, unsuitable: 0 },
  );
  const stateSummary: string[] = [];
  if (stateBuckets.existing > 0) stateSummary.push(`기존 설치 ${stateBuckets.existing}동`);
  if (stateBuckets.good > 0) stateSummary.push(`적합 후보 ${stateBuckets.good}동`);
  if (stateBuckets.marginal > 0) stateSummary.push(`보강 필요 ${stateBuckets.marginal}동`);
  if (stateBuckets.unsuitable > 0) stateSummary.push(`부적합 ${stateBuckets.unsuitable}동`);

  const totalCandidateKw = matched.reduce((s, b) => s + b.candidateCapacityKw, 0);
  const totalExistingKw = matched.reduce((s, b) => s + b.capacityKw, 0);

  const summary = `총 ${matched.length}동 (${stateSummary.join(' · ')})을 지도에 표시했습니다.`;
  const capacity =
    totalCandidateKw > 0
      ? ` 추가 설치 가능 용량 합계 약 ${totalCandidateKw.toLocaleString('ko-KR')}kWp.`
      : totalExistingKw > 0
        ? ` 기존 발전 용량 합계 ${totalExistingKw.toLocaleString('ko-KR')}kW.`
        : '';
  return `${summary}${capacity} 마커를 클릭하면 상세 정보를 볼 수 있습니다.`;
}

// ────────────────────────────────────────────────────────────────────────────
// Component
// ────────────────────────────────────────────────────────────────────────────

const EXAMPLE_PROMPTS = [
  '경상북도에서 추가 설치 가능한 후보지를 보여줘',
  '200세대 이상 · 남향 · 옥상 600㎡ 이상',
  '서울 기존 설치 중 200kW 이상',
  '경기도에서 2000년 이후 준공 후보 건물',
  '부적합으로 분류된 건물 상세',
];

export function MapExplorer() {
  const [chatInput, setChatInput] = useState('');
  const [chat, setChat] = useState<ChatTurn[]>([
    {
      role: 'assistant',
      text:
        '안녕하세요. LH 매입임대주택 116동의 설치 후보지를 자연어로 검색할 수 있습니다. 지역 · 용량 · 세대수 · 옥상 면적 · 방위 등을 조합해 질의해 보세요.',
    },
  ]);
  const [activeFilter, setActiveFilter] = useState<BuildingFilter>({});
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [stateFilter, setStateFilter] = useState<SiteState | 'all'>('all');

  const filtered = useMemo(() => {
    const baseFilter: BuildingFilter = stateFilter === 'all' ? activeFilter : { ...activeFilter, states: [stateFilter] };
    return applyFilter(ALL_BUILDINGS, baseFilter);
  }, [activeFilter, stateFilter]);

  const filteredIds = useMemo(() => new Set(filtered.map((b) => b.id)), [filtered]);

  const stateBuckets = useMemo(
    () =>
      ALL_BUILDINGS.reduce<Record<SiteState, number>>(
        (acc, b) => {
          acc[b.state] = (acc[b.state] ?? 0) + 1;
          return acc;
        },
        { existing: 0, good: 0, marginal: 0, unsuitable: 0 },
      ),
    [],
  );

  const sendQuery = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setChatInput('');

    const userTurn: ChatTurn = { role: 'user', text: trimmed };
    const pendingTurn: ChatTurn = { role: 'assistant', text: '', pending: true };
    setChat((c) => [...c, userTurn, pendingTurn]);

    const parsed = parseUserQuery(trimmed);
    const matched = applyFilter(ALL_BUILDINGS, parsed.filter);
    const toolCallsWithCounts: ToolCall[] = parsed.toolCalls.map((tc) =>
      tc.tool === 'query_buildings' ? { ...tc, resultCount: matched.length } : tc,
    );
    const responseText = composeAssistantResponse(matched, parsed.reasoning);

    // Simulate tool-call latency (1.1s) so UI shows realistic loading shape.
    setTimeout(() => {
      setChat((c) => {
        const next = c.slice(0, -1);
        next.push({
          role: 'assistant',
          text: responseText,
          toolCalls: toolCallsWithCounts,
          resultIds: matched.map((b) => b.id),
        });
        return next;
      });
      setActiveFilter(parsed.filter);
      setStateFilter('all');
      setHighlightedId(null);
    }, 1100);
  };

  const clearFilter = () => {
    setActiveFilter({});
    setStateFilter('all');
    setHighlightedId(null);
  };

  const selectedBuilding = highlightedId
    ? ALL_BUILDINGS.find((b) => b.id === highlightedId) ?? null
    : null;

  return (
    <>
      <HeroBand
        total={ALL_BUILDINGS.length}
        filteredCount={filtered.length}
        stateBuckets={stateBuckets}
        hasFilter={Object.keys(activeFilter).length > 0 || stateFilter !== 'all'}
        onClear={clearFilter}
      />

      <div
        style={{
          display: 'grid',
          gap: 16,
          gridTemplateColumns: 'minmax(0, 1fr)',
          marginBottom: 24,
        }}
        className="map-grid"
      >
        <MapPanel
          buildings={ALL_BUILDINGS}
          filteredIds={filteredIds}
          highlightedId={highlightedId}
          onSelect={setHighlightedId}
          stateFilter={stateFilter}
          setStateFilter={setStateFilter}
        />
        <ChatAndResultPanel
          chat={chat}
          input={chatInput}
          setInput={setChatInput}
          onSend={() => sendQuery(chatInput)}
          examples={EXAMPLE_PROMPTS}
          onExample={(t) => sendQuery(t)}
          filtered={filtered}
          highlightedId={highlightedId}
          onSelect={setHighlightedId}
          selectedBuilding={selectedBuilding}
        />
      </div>

      <DataSourcesFooter />
    </>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// HeroBand — counts + clear filter
// ────────────────────────────────────────────────────────────────────────────

function HeroBand({
  total,
  filteredCount,
  stateBuckets,
  hasFilter,
  onClear,
}: {
  total: number;
  filteredCount: number;
  stateBuckets: Record<SiteState, number>;
  hasFilter: boolean;
  onClear: () => void;
}) {
  return (
    <section className="hero-band" style={{ background: '#0F2563' }}>
      <div className="hero-band-top">
        <div className="hero-band-meta">
          <span className="num">매입임대주택 {total}동</span>
          <span className="sep">·</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span className="live-dot" />
            <span>RTU 미연동 · 시뮬레이션</span>
          </span>
          <span className="sep">·</span>
          <span>FRD-2026-001</span>
        </div>
        <div className="hero-band-actions">
          {hasFilter && (
            <button type="button" className="hero-band-cta" onClick={onClear}>
              <span style={{ display: 'inline-flex' }}>{Icons.Cross}</span>
              필터 해제
            </button>
          )}
        </div>
      </div>

      <div className="hero-headline-figure">
        <div className="hero-headline-label">현재 표시 · 후보지 지도</div>
        <div className="hero-headline-value">
          <span>
            {filteredCount.toLocaleString('ko-KR')}
            <span style={{ fontSize: '0.5em', color: '#8BB4E8', marginLeft: 8 }}>
              / {total}
            </span>
          </span>
          <span className="hero-headline-value-delta">
            {filteredCount === total ? '전체' : '필터 적용'}
          </span>
        </div>
        <div className="hero-headline-meta">
          <span>
            기존 설치 <span className="num">{stateBuckets.existing}</span>
          </span>
          <span className="sep">·</span>
          <span>
            적합 후보 <span className="num">{stateBuckets.good}</span>
          </span>
          <span className="sep">·</span>
          <span>
            보강 필요 <span className="num">{stateBuckets.marginal}</span>
          </span>
          <span className="sep">·</span>
          <span>
            부적합 <span className="num">{stateBuckets.unsuitable}</span>
          </span>
        </div>
      </div>
    </section>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// MapPanel — Mapbox basemap + state-coded markers + legend
// ────────────────────────────────────────────────────────────────────────────

const STATE_PALETTE: Record<SiteState, { fill: string; stroke: string; label: string; size: number }> = {
  existing:    { fill: 'var(--accent)',     stroke: 'var(--accent-ink)', label: '기존 설치',  size: 7 },
  good:        { fill: 'var(--ink)',        stroke: 'var(--ink)',        label: '적합 후보',  size: 6 },
  marginal:    { fill: 'transparent',       stroke: 'var(--ink)',        label: '보강 필요',  size: 6 },
  unsuitable:  { fill: 'transparent',       stroke: 'var(--muted-2)',    label: '부적합',     size: 4 },
};

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN ?? '';
const MAP_STYLE = 'mapbox://styles/mapbox/light-v11';
const KOREA_CENTER: [number, number] = [127.85, 36.4];
const KOREA_ZOOM = 5.7;

function MapPanel({
  buildings,
  filteredIds,
  highlightedId,
  onSelect,
  stateFilter,
  setStateFilter,
}: {
  buildings: ReadonlyArray<MapBuilding>;
  filteredIds: Set<string>;
  highlightedId: string | null;
  onSelect: (id: string | null) => void;
  stateFilter: SiteState | 'all';
  setStateFilter: (s: SiteState | 'all') => void;
}) {
  return (
    <section className="card card-pad" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span className="overline">전국 매입임대주택 후보지</span>
          <span className="kpi-metric" style={{ fontSize: 22, letterSpacing: '-0.025em' }}>
            대한민국 {buildings.length}동
          </span>
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {(['all', 'existing', 'good', 'marginal', 'unsuitable'] as const).map((s) => (
            <button
              key={s}
              type="button"
              className={`ledger-chip ${stateFilter === s ? 'is-active' : ''}`}
              onClick={() => setStateFilter(s)}
            >
              {s === 'all' ? '전체' : STATE_PALETTE[s].label}
            </button>
          ))}
        </div>
      </div>

      <MapboxMap
        buildings={buildings}
        filteredIds={filteredIds}
        highlightedId={highlightedId}
        onSelect={onSelect}
      />

      <MapLegend />

      <div style={{ fontSize: 11.5, color: 'var(--muted-2)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <span>좌표 시뮬레이션 · RTU 연동 시 실제 위치로 자동 갱신</span>
        <span className="num">표시 {Array.from(filteredIds).length} / 전체 {buildings.length}</span>
      </div>
    </section>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// MapboxMap — basemap + DOM markers; mounts once, styles update on prop change
// ────────────────────────────────────────────────────────────────────────────

function MapboxMap({
  buildings,
  filteredIds,
  highlightedId,
  onSelect,
}: {
  buildings: ReadonlyArray<MapBuilding>;
  filteredIds: Set<string>;
  highlightedId: string | null;
  onSelect: (id: string | null) => void;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<Map<string, { marker: mapboxgl.Marker; el: HTMLDivElement }>>(new Map());
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  // Mount the map and create one marker per building. Runs once.
  useEffect(() => {
    if (!containerRef.current || !MAPBOX_TOKEN) return;
    mapboxgl.accessToken = MAPBOX_TOKEN;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: MAP_STYLE,
      center: KOREA_CENTER,
      zoom: KOREA_ZOOM,
      attributionControl: true,
    });
    mapRef.current = map;

    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right');

    for (const b of buildings) {
      const el = document.createElement('div');
      el.style.width = '14px';
      el.style.height = '14px';
      el.style.borderRadius = '999px';
      el.style.cursor = 'pointer';
      el.style.boxSizing = 'border-box';
      el.style.transition = 'opacity .15s, transform .15s, box-shadow .15s';
      el.addEventListener('click', (ev) => {
        ev.stopPropagation();
        onSelectRef.current(b.id);
      });
      const marker = new mapboxgl.Marker({ element: el }).setLngLat([b.lng, b.lat]).addTo(map);
      markersRef.current.set(b.id, { marker, el });
    }

    // Background click clears selection.
    map.on('click', () => onSelectRef.current(null));

    return () => {
      for (const { marker } of markersRef.current.values()) marker.remove();
      markersRef.current.clear();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Re-style markers whenever filter / highlight changes.
  useEffect(() => {
    for (const b of buildings) {
      const entry = markersRef.current.get(b.id);
      if (!entry) continue;
      const { el } = entry;
      const palette = STATE_PALETTE[b.state];
      const active = filteredIds.has(b.id);
      const isHighlighted = highlightedId === b.id;

      const fill = palette.fill === 'transparent' ? '#FFFFFF' : palette.fill;
      el.style.background = fill;
      el.style.border = `1.5px solid ${palette.stroke}`;
      el.style.opacity = active ? '1' : '0.22';
      el.style.pointerEvents = active ? 'auto' : 'none';
      el.style.transform = isHighlighted ? 'scale(1.3)' : 'scale(1)';
      el.style.boxShadow = isHighlighted ? '0 0 0 3px var(--accent-ink)' : 'none';
      el.style.zIndex = isHighlighted ? '2' : active ? '1' : '0';
    }
  }, [buildings, filteredIds, highlightedId]);

  // Pan to the highlighted building (smooth fly-in).
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !highlightedId) return;
    const b = buildings.find((x) => x.id === highlightedId);
    if (!b) return;
    map.flyTo({ center: [b.lng, b.lat], zoom: Math.max(map.getZoom(), 8.5), duration: 700 });
  }, [buildings, highlightedId]);

  if (!MAPBOX_TOKEN) {
    return (
      <div
        style={{
          background: '#FAFAFA',
          border: '1px solid var(--line)',
          borderRadius: 'var(--r-sm)',
          padding: 24,
          minHeight: 400,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 6,
          color: 'var(--muted)',
          fontSize: 12.5,
          textAlign: 'center',
        }}
      >
        <strong style={{ color: 'var(--ink)' }}>VITE_MAPBOX_TOKEN 미설정</strong>
        <span>apps/web/.env.local 에 토큰을 추가한 뒤 dev 서버를 재시작해 주세요.</span>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      style={{
        height: 560,
        borderRadius: 'var(--r-sm)',
        border: '1px solid var(--line)',
        overflow: 'hidden',
      }}
      aria-label="후보지 지도"
    />
  );
}

function MapLegend() {
  return (
    <div
      role="list"
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '6px 16px',
        padding: '8px 10px',
        border: '1px solid var(--line)',
        borderRadius: 'var(--r-sm)',
        background: 'var(--panel)',
        fontSize: 11.5,
        color: 'var(--ink-2)',
      }}
    >
      {(['existing', 'good', 'marginal', 'unsuitable'] as const).map((s) => {
        const palette = STATE_PALETTE[s];
        return (
          <span
            key={s}
            role="listitem"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: 999,
                background: palette.fill === 'transparent' ? '#FFFFFF' : palette.fill,
                border: `1.5px solid ${palette.stroke}`,
                display: 'inline-block',
              }}
            />
            {palette.label}
          </span>
        );
      })}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// ChatAndResultPanel — chat thread + results list + selected-building card
// ────────────────────────────────────────────────────────────────────────────

function ChatAndResultPanel({
  chat,
  input,
  setInput,
  onSend,
  examples,
  onExample,
  filtered,
  highlightedId,
  onSelect,
  selectedBuilding,
}: {
  chat: ChatTurn[];
  input: string;
  setInput: (s: string) => void;
  onSend: () => void;
  examples: string[];
  onExample: (s: string) => void;
  filtered: MapBuilding[];
  highlightedId: string | null;
  onSelect: (id: string | null) => void;
  selectedBuilding: MapBuilding | null;
}) {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [chat]);

  return (
    <section
      className="card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: 600,
        maxHeight: 800,
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '14px 18px',
          borderBottom: '1px solid var(--line)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span className="overline">AI 후보지 검색</span>
          <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.015em' }}>
            자연어 질의
          </span>
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <Pill tone="neutral" dot>claude-opus-4-7</Pill>
          <Pill tone="green" dot>3 tools</Pill>
        </div>
      </div>

      {/* Selected building detail (if any) */}
      {selectedBuilding && <SelectedBuildingCard b={selectedBuilding} onClose={() => onSelect(null)} />}

      {/* Chat thread */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {chat.map((turn, i) => (
          <ChatTurnView
            key={i}
            turn={turn}
            onSelectBuilding={onSelect}
            highlightedId={highlightedId}
            allBuildings={ALL_BUILDINGS}
          />
        ))}
      </div>

      {/* Result count strip (when active filter has results, even outside chat) */}
      {filtered.length > 0 && filtered.length < ALL_BUILDINGS.length && (
        <div
          style={{
            padding: '8px 18px',
            borderTop: '1px solid var(--line)',
            background: '#FAFAFA',
            fontSize: 11.5,
            color: 'var(--muted)',
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <span>현재 결과 <span className="num" style={{ color: 'var(--ink)', fontWeight: 700 }}>{filtered.length}동</span></span>
          <span className="num" style={{ color: 'var(--muted-2)' }}>{filtered.reduce((s, b) => s + b.candidateCapacityKw, 0).toLocaleString('ko-KR')} kWp 추가 가능</span>
        </div>
      )}

      {/* Example prompts */}
      <div
        style={{
          padding: '10px 18px',
          borderTop: '1px solid var(--line)',
          display: 'flex',
          flexWrap: 'wrap',
          gap: 6,
        }}
      >
        {examples.map((ex) => (
          <button
            key={ex}
            type="button"
            className="ledger-chip"
            onClick={() => onExample(ex)}
            style={{ fontSize: 11 }}
          >
            {ex}
          </button>
        ))}
      </div>

      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSend();
        }}
        style={{
          padding: 12,
          borderTop: '1px solid var(--line)',
          display: 'flex',
          gap: 8,
          alignItems: 'center',
        }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="예: 경상북도 200세대 이상 후보지"
          style={{
            flex: 1,
            border: '1px solid var(--line-2)',
            borderRadius: 'var(--r-md)',
            padding: '10px 14px',
            fontSize: 13,
            fontFamily: 'inherit',
            background: 'var(--panel)',
            color: 'var(--ink)',
            outline: 'none',
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--ink)')}
          onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--line-2)')}
        />
        <button
          type="submit"
          style={{
            background: 'var(--ink)',
            color: '#fff',
            border: '1px solid var(--ink)',
            borderRadius: 'var(--r-md)',
            padding: '10px 18px',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          전송
          <span style={{ display: 'inline-flex' }}>{Icons.Arrow}</span>
        </button>
      </form>
    </section>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// ChatTurnView — bubble + tool-call indicators + result chips
// ────────────────────────────────────────────────────────────────────────────

function ChatTurnView({
  turn,
  onSelectBuilding,
  highlightedId,
  allBuildings,
}: {
  turn: ChatTurn;
  onSelectBuilding: (id: string | null) => void;
  highlightedId: string | null;
  allBuildings: ReadonlyArray<MapBuilding>;
}) {
  if (turn.role === 'user') {
    return (
      <div style={{ alignSelf: 'flex-end', maxWidth: '85%' }}>
        <div
          style={{
            background: 'var(--ink)',
            color: '#fff',
            padding: '10px 14px',
            borderRadius: 'var(--r-md)',
            fontSize: 13,
            lineHeight: 1.5,
            letterSpacing: '-0.005em',
          }}
        >
          {turn.text}
        </div>
      </div>
    );
  }

  // assistant
  return (
    <div style={{ alignSelf: 'flex-start', maxWidth: '95%', display: 'flex', flexDirection: 'column', gap: 8 }}>
      {turn.toolCalls && turn.toolCalls.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {turn.toolCalls.map((tc, i) => (
            <span
              key={i}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                padding: '3px 8px',
                background: 'var(--chip)',
                border: '1px solid var(--line)',
                borderRadius: 'var(--r-sm)',
                fontSize: 10.5,
                fontFamily: 'Geist Mono, monospace',
                color: 'var(--ink-2)',
              }}
            >
              <span style={{ width: 5, height: 5, borderRadius: 999, background: 'var(--accent)' }} />
              {tc.tool}
              {tc.resultCount != null && (
                <span style={{ color: 'var(--muted)', marginLeft: 2 }}>· {tc.resultCount}</span>
              )}
            </span>
          ))}
        </div>
      )}

      <div
        style={{
          background: '#FAFAFA',
          color: 'var(--ink)',
          padding: '12px 14px',
          borderRadius: 'var(--r-md)',
          border: '1px solid var(--line)',
          fontSize: 13,
          lineHeight: 1.55,
          letterSpacing: '-0.005em',
          minHeight: 30,
        }}
      >
        {turn.pending ? <PendingDots /> : turn.text}
      </div>

      {turn.resultIds && turn.resultIds.length > 0 && turn.resultIds.length <= 12 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {turn.resultIds.map((id) => {
            const b = allBuildings.find((x) => x.id === id);
            if (!b) return null;
            const active = highlightedId === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => onSelectBuilding(active ? null : id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '4px 10px',
                  background: active ? 'var(--ink)' : 'var(--panel)',
                  color: active ? '#fff' : 'var(--ink-2)',
                  border: `1px solid ${active ? 'var(--ink)' : 'var(--line-2)'}`,
                  borderRadius: 999,
                  fontSize: 11,
                  cursor: 'pointer',
                  fontWeight: 500,
                }}
              >
                <span
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: 999,
                    background:
                      STATE_PALETTE[b.state].fill === 'transparent'
                        ? 'transparent'
                        : STATE_PALETTE[b.state].fill,
                    border: `1px solid ${STATE_PALETTE[b.state].stroke}`,
                  }}
                />
                {b.id}
              </button>
            );
          })}
        </div>
      )}
      {turn.resultIds && turn.resultIds.length > 12 && (
        <div style={{ fontSize: 11, color: 'var(--muted)' }}>
          + {turn.resultIds.length - 12}건은 지도에서 확인하세요.
        </div>
      )}
    </div>
  );
}

function PendingDots() {
  return (
    <span style={{ display: 'inline-flex', gap: 5, alignItems: 'center', height: 18 }}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            width: 6,
            height: 6,
            borderRadius: 999,
            background: 'var(--muted-2)',
            animation: `pendingPulse 1.4s ease-in-out ${i * 0.18}s infinite`,
          }}
        />
      ))}
      <style>{`
        @keyframes pendingPulse {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </span>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// SelectedBuildingCard — slot at top of chat panel showing one building detail
// ────────────────────────────────────────────────────────────────────────────

function SelectedBuildingCard({ b, onClose }: { b: MapBuilding; onClose: () => void }) {
  const palette = STATE_PALETTE[b.state];
  return (
    <div
      style={{
        padding: '14px 18px',
        borderBottom: '1px solid var(--line)',
        background: '#FAFAFA',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <div style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
            <span
              style={{
                width: palette.size,
                height: palette.size,
                borderRadius: 999,
                background: palette.fill === 'transparent' ? '#fff' : palette.fill,
                border: `1px solid ${palette.stroke}`,
              }}
            />
            <span style={{ fontSize: 14.5, fontWeight: 700, letterSpacing: '-0.015em' }}>{b.name}</span>
          </div>
          <span className="ledger-bldg-id" style={{ fontSize: 11, color: 'var(--muted)' }}>{b.id} · {b.province}</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="닫기"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 24,
            height: 24,
            color: 'var(--muted)',
          }}
        >
          {Icons.Cross}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
        <DetailRow label="상태" value={palette.label} />
        <DetailRow label="세대수" value={`${fmt.n(b.households)}세대`} />
        <DetailRow label="옥상 면적" value={`${fmt.n(b.rooftopAreaM2)}㎡`} />
        <DetailRow label="준공년도" value={`${b.yearBuilt}년`} />
        <DetailRow label="방위" value={b.orientation} />
        <DetailRow
          label={b.state === 'existing' ? '발전 용량' : '추가 가능'}
          value={`${b.state === 'existing' ? b.capacityKw : b.candidateCapacityKw} kW`}
        />
      </div>

      <div
        style={{
          padding: 8,
          background: 'var(--panel)',
          border: '1px solid var(--line)',
          borderRadius: 'var(--r-sm)',
          fontSize: 11.5,
          color: 'var(--muted)',
          fontFamily: 'Geist Mono, monospace',
        }}
      >
        {b.scoreReason}
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <span className="overline" style={{ fontSize: 9.5 }}>{label}</span>
      <span className="num" style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink)' }}>{value}</span>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// DataSourcesFooter — credit the planned future integrations
// ────────────────────────────────────────────────────────────────────────────

function DataSourcesFooter() {
  return (
    <div
      style={{
        marginTop: 16,
        paddingTop: 16,
        borderTop: '1px solid var(--line)',
        display: 'flex',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '6px 16px',
        fontSize: 11,
        color: 'var(--muted-2)',
        letterSpacing: '-0.005em',
      }}
    >
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
        <span>예정 연동: 세움터 (건축물대장) · VWORLD (3D 건물·타일) · 부동산정보 통합 열람</span>
        <span>FR-O-003 · FR-S-008</span>
      </div>
      <div className="mono" style={{ fontSize: 10.5 }}>
        map v0.1 · simulated coords · stub LLM
      </div>
    </div>
  );
}
