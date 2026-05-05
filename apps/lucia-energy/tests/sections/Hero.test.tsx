import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Hero } from '../../src/sections/Hero';

describe('Hero', () => {
  it('renders the provocation headline + CTAs', () => {
    const onPrimary = vi.fn();
    const onSecondary = vi.fn();
    render(<Hero onPrimaryClick={onPrimary} onSecondaryClick={onSecondary} />);
    // The h1 contains both lines separated by <br/>, so RTL's strict-equality
    // text match doesn't see either line as the full text. We match via the
    // h1's textContent including both lines as substrings.
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading.textContent).toMatch(/사람 손 없이도/);
    expect(heading.textContent).toMatch(/발전소는 멈추지 않습니다/);
    fireEvent.click(screen.getByText('사업 문의하기'));
    expect(onPrimary).toHaveBeenCalled();
  });

  it('does NOT mention MERIDIAN, LangGraph, or named agents (hard rule)', () => {
    render(<Hero onPrimaryClick={() => {}} onSecondaryClick={() => {}} />);
    const text = document.body.textContent ?? '';
    expect(text).not.toMatch(/MERIDIAN/i);
    expect(text).not.toMatch(/LangGraph/i);
    expect(text).not.toMatch(/Forecaster|Diagnoser|Operator|Bidder|Settler|CarbonAgent|CitizenAgent|SecAgent/);
    expect(text).not.toMatch(/발전왕/);
  });
});
