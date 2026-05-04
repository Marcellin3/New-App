/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum Category {
  FOOD = 'Alimentation',
  TRANSPORT = 'Transport',
  HOUSING = 'Logement',
  COMMUNICATION = 'Communication',
  HEALTH = 'Santé',
  SAVINGS = 'Épargne',
  EDUCATION = 'Éducation',
  OTHER = 'Autres',
}

export interface Budget {
  id: string;
  month: string; // YYYY-MM
  income: number;
  allocations: {
    [key in Category]?: number;
  };
}

export interface Expense {
  id: string;
  amount: number;
  category: Category;
  date: string;
  note?: string;
}

export interface StepGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
}

export interface AppState {
  budget: Budget;
  expenses: Expense[];
  savingsGoals: StepGoal[];
}
