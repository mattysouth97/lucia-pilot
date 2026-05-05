import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { InquirySplit } from '../../src/sections/InquirySplit';

describe('InquirySplit', () => {
  it('renders both buyer + generator sides', () => {
    render(<InquirySplit />);
    expect(screen.getByText('전기구매자 문의')).toBeInTheDocument();
    expect(screen.getByText('발전사업자 문의')).toBeInTheDocument();
  });

  it('submits the buyer card via console fallback (no endpoint configured)', async () => {
    const consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
    render(<InquirySplit />);

    const companies = screen.getAllByLabelText(/회사명/);
    fireEvent.change(companies[0]!, { target: { value: '테스트사' } });

    const contacts = screen.getAllByLabelText(/담당자/);
    fireEvent.change(contacts[0]!, { target: { value: '홍길동' } });

    const emails = screen.getAllByLabelText(/이메일/);
    fireEvent.change(emails[0]!, { target: { value: 'a@b.kr' } });

    const phones = screen.getAllByLabelText(/전화/);
    fireEvent.change(phones[0]!, { target: { value: '02-0000-0000' } });

    const recChips = screen.getAllByLabelText(/REC 매입/);
    fireEvent.click(recChips[0]!);

    const consents = screen.getAllByLabelText(/개인정보 처리에 동의합니다/);
    fireEvent.click(consents[0]!);

    const submits = screen.getAllByRole('button', { name: /문의 접수/ });
    fireEvent.click(submits[0]!);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled();
    });
  });
});
