import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, test } from 'vitest';

import { AuthProvider } from '@/auth/AuthProvider';
import { ModalProvider } from '@/lib/modals';
import { AnalystHome } from '@/routes/Home/AnalystHome';

const ANALYST_USER_ID = 'u_analyst_kim';

afterEach(() => {
  cleanup();
  sessionStorage.clear();
});

function renderAnalystHome() {
  sessionStorage.setItem('lucia.auth.userId', ANALYST_USER_ID);
  return render(
    <MemoryRouter>
      <AuthProvider>
        <ModalProvider>
          <AnalystHome />
        </ModalProvider>
      </AuthProvider>
    </MemoryRouter>,
  );
}

describe('AnalystHome', () => {
  test('renders the audit-integrity hero with greeting + monumental 0', () => {
    renderAnalystHome();
    expect(screen.getByText(/안녕하세요, 김지호 처장님/)).toBeInTheDocument();
    expect(screen.getByLabelText(/이번 달 변조 시도/)).toHaveTextContent('0');
  });

  test('renders the distribution audit card with formula strip', () => {
    renderAnalystHome();
    expect(screen.getByText(/환원 검증/)).toBeInTheDocument();
    expect(screen.getByText('41%')).toBeInTheDocument();
  });

  test('renders the integrity timeline card heading', () => {
    renderAnalystHome();
    expect(screen.getByText('감사 무결성 타임라인')).toBeInTheDocument();
  });

  test('does NOT render the dropped HeroBand 매출 hero', () => {
    renderAnalystHome();
    expect(screen.queryByText(/이달 정산 매출 · 2026\.04 누적/)).toBeNull();
  });

  test('does NOT render the dropped BlockchainIntegrityStrip', () => {
    renderAnalystHome();
    expect(screen.queryByText(/Block #847,231/)).toBeNull();
  });
});
