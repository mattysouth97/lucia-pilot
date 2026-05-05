// apps/lucia-energy/src/components/PersonaTagChips.tsx
// Inline persona-tag strip — interpunct-separated, no pill backgrounds.
// Each persona is a click-through that scrolls to inquiry + pre-selects via URL hash.
interface PersonaTagChipsProps {
  personas: ReadonlyArray<string>;
  onClick: (persona: string) => void;
}

export function PersonaTagChips({ personas, onClick }: PersonaTagChipsProps) {
  return (
    <div
      style={{
        marginTop: 8,
        marginBottom: 24,
        fontSize: 13,
        fontWeight: 500,
        color: 'var(--ink-3)',
      }}
    >
      <span>관련 페르소나: </span>
      {personas.map((p, idx) => (
        <span key={p}>
          <button
            type="button"
            onClick={() => onClick(p)}
            style={{
              background: 'transparent',
              border: 'none',
              padding: 0,
              fontSize: 'inherit',
              fontWeight: 'inherit',
              color: 'var(--accent)',
              cursor: 'pointer',
              textDecoration: 'underline',
              textUnderlineOffset: 3,
            }}
          >
            {p}
          </button>
          {idx < personas.length - 1 ? ' · ' : null}
        </span>
      ))}
    </div>
  );
}
