import { expenseCategories, incomeCategories, iconForCategory } from '../constants/categories';

describe('expenseCategories & incomeCategories', () => {
  it('every category has a non-empty key, label, and icon', () => {
    [...expenseCategories, ...incomeCategories].forEach((c) => {
      expect(c.key.length).toBeGreaterThan(0);
      expect(c.label.length).toBeGreaterThan(0);
      expect(c.icon.length).toBeGreaterThan(0);
    });
  });

  it('has no duplicate keys within expenseCategories', () => {
    const keys = expenseCategories.map((c) => c.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('has no duplicate keys within incomeCategories', () => {
    const keys = incomeCategories.map((c) => c.key);
    expect(new Set(keys).size).toBe(keys.length);
  });
});

describe('iconForCategory', () => {
  it('returns the correct icon for a known expense category', () => {
    expect(iconForCategory('Makanan')).toBe('fast-food-outline');
  });

  it('returns the correct icon for a known income category', () => {
    expect(iconForCategory('Gaji')).toBe('cash-outline');
  });

  it('falls back to a generic icon for an unknown category', () => {
    expect(iconForCategory('Kategori Aneh Yang Gak Ada')).toBe('pricetag-outline');
  });
});
