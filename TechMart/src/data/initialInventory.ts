import type { TechMartInventory } from '../types';
import { initialProducts } from './initialProducts';

export const generateInitialInventory = (): TechMartInventory[] => {
  const inventoryList: TechMartInventory[] = [];
  let count = 1001;

  initialProducts.forEach((product) => {
    // Split available stock across 3 warehouses
    const total = product.available_units;
    const ncrShare = Math.floor(total * 0.45);
    const northShare = Math.floor(total * 0.35);
    const westShare = total - ncrShare - northShare;

    const shares = [
      { code: 'WH-NCR' as const, units: ncrShare },
      { code: 'WH-NORTH' as const, units: northShare },
      { code: 'WH-WEST' as const, units: westShare },
    ];

    shares.forEach((s) => {
      inventoryList.push({
        inventory_id: `INV-TM-${count++}`,
        sku: product.sku,
        warehouse_code: s.code,
        available_units: s.units,
        reserved_units: Math.floor(Math.random() * 4),
        reorder_level: 5,
        last_updated: '2026-09-30T18:00:00Z'
      });
    });
  });

  return inventoryList;
};

export const initialInventory: TechMartInventory[] = generateInitialInventory();
