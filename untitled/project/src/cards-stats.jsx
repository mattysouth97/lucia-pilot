// Stats row — top of dashboard, FRD KPIs
const StatsRow = () => {
  const items = [
    {
      label: "오늘 발전량",
      value: "11,852",
      unit: "kWh",
      delta: 4.2,
      icon: Icons.Sun,
      accent: "linear-gradient(135deg,#10B981,#06B6A2)",
      spark: [820, 1040, 1180, 1520, 1680, 1620, 1480, 1240, 920, 540, 210, 32],
      sparkColor: "#10B981",
    },
    {
      label: "누적 정산 매출 (4월)",
      value: "32,356,400",
      unit: "원",
      delta: 8.7,
      icon: Icons.Coin,
      accent: "#0E1116",
      spark: [62, 68, 71, 79, 84, 88, 91, 95, 100, 108, 113, 119],
      sparkColor: "#0E1116",
    },
    {
      label: "주거비 환원 (월)",
      value: "13,266,360",
      unit: "원",
      delta: 6.1,
      icon: Icons.Home,
      accent: "#06B6A2",
      spark: [40, 44, 48, 52, 58, 64, 68, 72, 78, 84, 92, 98],
      sparkColor: "#06B6A2",
    },
    {
      label: "REC 적립",
      value: "1,422.4",
      unit: "REC",
      delta: 3.4,
      icon: Icons.Spark,
      accent: "#4F46E5",
      spark: [12, 18, 24, 32, 41, 52, 64, 78, 92, 108, 124, 142],
      sparkColor: "#4F46E5",
    },
    {
      label: "이상 감지",
      value: "3",
      unit: "건",
      delta: -1.2,
      deltaLabel: "양호",
      icon: Icons.Bell,
      accent: "#F43F5E",
      spark: [5, 4, 6, 4, 3, 5, 4, 3, 2, 4, 3, 3],
      sparkColor: "#F43F5E",
    },
  ];

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(5, 1fr)",
      gap: 16,
    }}>
      {items.map((it, i) => (
        <div key={i} className="card flow-in" style={{ padding: 20, animationDelay: `${i * 60}ms` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <Stat label={it.label} value={it.value} unit={it.unit} delta={it.delta} deltaLabel={it.deltaLabel} icon={it.icon} accent={it.accent} />
          </div>
          <div style={{ marginTop: 12, marginLeft: 52 }}>
            <Spark data={it.spark} color={it.sparkColor} w={150} h={28} />
          </div>
        </div>
      ))}
    </div>
  );
};

window.StatsRow = StatsRow;
