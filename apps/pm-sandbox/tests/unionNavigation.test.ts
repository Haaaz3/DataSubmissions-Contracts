import { expect, it, vi } from 'vitest';
vi.mock('next/navigation', () => ({ redirect: (href: string) => { throw new Error(href); } }));
import RootPage from '../app/page';
it('preserves a Data Submissions deep link through the original home redirect', async () => {
  await expect(RootPage({ searchParams: Promise.resolve({ product: 'data-submissions', scope: ['one', 'two'] }) })).rejects.toThrow('/home?product=data-submissions&scope=one&scope=two');
});
it('keeps the original root-to-home behavior without query parameters', async () => {
  await expect(RootPage({ searchParams: Promise.resolve({}) })).rejects.toThrow('/home');
});
