import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { PersonaTagChips } from '../../src/components/PersonaTagChips';

describe('PersonaTagChips', () => {
  it('renders interpunct-separated personas', () => {
    render(
      <PersonaTagChips
        personas={['발전사업자', '자산관리자·EPC', '공공발주처']}
        onClick={() => {}}
      />,
    );
    expect(screen.getByText('관련 페르소나:')).toBeInTheDocument();
    expect(screen.getByText('발전사업자')).toBeInTheDocument();
    expect(screen.getByText('자산관리자·EPC')).toBeInTheDocument();
    expect(screen.getByText('공공발주처')).toBeInTheDocument();
  });

  it('invokes onClick with the persona label', () => {
    const onClick = vi.fn();
    render(<PersonaTagChips personas={['발전사업자']} onClick={onClick} />);
    fireEvent.click(screen.getByText('발전사업자'));
    expect(onClick).toHaveBeenCalledWith('발전사업자');
  });
});
