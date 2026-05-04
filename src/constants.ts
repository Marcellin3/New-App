/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Category } from './types';
import { Utensils, Car, House, Smartphone, Stethoscope, PiggyBank, GraduationCap, LayoutGrid } from 'lucide-react';

export const CURRENCY = 'CDF';
export const LOCALE = 'fr-CD';

export const CATEGORY_ICONS = {
  [Category.FOOD]: Utensils,
  [Category.TRANSPORT]: Car,
  [Category.HOUSING]: House,
  [Category.COMMUNICATION]: Smartphone,
  [Category.HEALTH]: Stethoscope,
  [Category.SAVINGS]: PiggyBank,
  [Category.EDUCATION]: GraduationCap,
  [Category.OTHER]: LayoutGrid,
};

export const CATEGORY_COLORS = {
  [Category.FOOD]: '#EAB308', // yellow-500
  [Category.TRANSPORT]: '#3B82F6', // blue-500
  [Category.HOUSING]: '#EF4444', // red-500
  [Category.COMMUNICATION]: '#8B5CF6', // purple-500
  [Category.HEALTH]: '#10B981', // emerald-500
  [Category.SAVINGS]: '#F97316', // orange-500
  [Category.EDUCATION]: '#EC4899', // pink-500
  [Category.OTHER]: '#6B7280', // gray-500
};
