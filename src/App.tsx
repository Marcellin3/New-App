/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  LayoutDashboard, 
  PieChart, 
  Wallet, 
  PiggyBank, 
  X, 
  ChevronRight,
  TrendingDown,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart as RePieChart,
  Pie
} from 'recharts';
import { format, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { fr } from 'date-fns/locale';

import { Category, AppState, Expense, Budget, StepGoal } from './types';
import { CURRENCY, CATEGORY_ICONS, CATEGORY_COLORS } from './constants';
import { cn, formatCurrency } from './lib/utils';

// --- Mock Initial Data ---
const INITIAL_BUDGET: Budget = {
  id: 'b1',
  month: format(new Date(), 'yyyy-MM'),
  income: 650000, // Balanced for a typical middle-class professional in Kinshasa
  allocations: {
    [Category.FOOD]: 150000,
    [Category.TRANSPORT]: 80000,
    [Category.HOUSING]: 200000,
    [Category.COMMUNICATION]: 40000,
    [Category.HEALTH]: 30000,
    [Category.SAVINGS]: 100000,
    [Category.OTHER]: 50000,
  }
};

const INITIAL_EXPENSES: Expense[] = [
  { id: 'e1', amount: 5000, category: Category.TRANSPORT, date: new Date().toISOString(), note: 'Zando' },
  { id: 'e2', amount: 15000, category: Category.FOOD, date: new Date().toISOString(), note: 'Course alimentation' },
];

const INITIAL_GOALS: StepGoal[] = [
  { id: 'g1', name: 'Nouveau Téléphone', targetAmount: 300000, currentAmount: 45000 },
  { id: 'g2', name: 'Urgence / Maliba', targetAmount: 1000000, currentAmount: 120000 },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'budget' | 'stats' | 'savings'>('dashboard');
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem('expenses');
    return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
  });
  const [budget, setBudget] = useState<Budget>(() => {
    const saved = localStorage.getItem('budget');
    return saved ? JSON.parse(saved) : INITIAL_BUDGET;
  });
  const [goals, setGoals] = useState<StepGoal[]>(() => {
    const saved = localStorage.getItem('goals');
    return saved ? JSON.parse(saved) : INITIAL_GOALS;
  });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Persistence
  useEffect(() => {
    localStorage.setItem('expenses', JSON.stringify(expenses));
    localStorage.setItem('budget', JSON.stringify(budget));
    localStorage.setItem('goals', JSON.stringify(goals));
  }, [expenses, budget, goals]);

  // Calculations
  const currentMonthExpenses = useMemo(() => {
    const start = startOfMonth(new Date());
    const end = endOfMonth(new Date());
    return expenses.filter(e => isWithinInterval(new Date(e.date), { start, end }));
  }, [expenses]);

  const totalSpent = useMemo(() => 
    currentMonthExpenses.reduce((sum, e) => sum + e.amount, 0)
  , [currentMonthExpenses]);

  const expensesByCategory = useMemo(() => {
    return currentMonthExpenses.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    }, {} as Record<string, number>);
  }, [currentMonthExpenses]);

  const remainingBalance = budget.income - totalSpent;
  const budgetUtilization = (totalSpent / budget.income) * 100;

  // Handlers
  const addExpense = (amount: number, category: Category, note: string) => {
    const newExpense: Expense = {
      id: crypto.randomUUID(),
      amount,
      category,
      date: new Date().toISOString(),
      note
    };
    setExpenses([newExpense, ...expenses]);
    setIsAddModalOpen(false);
  };

  const activeInsight = useMemo(() => {
    if (utilization > 100) return "Odelekisi budget na yo sanza oyo! (Tu as dépassé ton budget). Réduis tes dépenses non-essentielles immédiatement.";
    if (utilization > 90) return "Attention, il ne reste que 10% de ton budget. Emoniseli te il faut ko meka ko réduire transport.";
    if (utilization > 70) return "Tu es dans la zone de vigilance. Garde un œil sur tes dépenses d'alimentation.";
    if (remainingBalance > (budget.income * 0.2)) return "Très bonne gestion! Tu es en avance sur tes objectifs d'épargne. Continue moke moke.";
    return "Budget en ordre. N'oublie pas de noter tes petites dépenses quotidiennes (Zando, transport).";
  }, [utilization, remainingBalance, budget.income]);

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-sleek-bg shadow-2xl overflow-hidden relative font-sans">
      {/* Header */}
      <header className="px-6 pt-8 pb-4 bg-white border-b border-sleek-border">
        <h1 className="text-xl font-display font-bold text-brand-secondary">Gestion de Budget</h1>
        <p className="text-sleek-muted text-xs font-medium">Kinshasa — {format(new Date(), 'MMMM yyyy', { locale: fr })}</p>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto px-6 pb-24 no-scrollbar">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <Dashboard 
              balance={remainingBalance} 
              spent={totalSpent} 
              income={budget.income} 
              utilization={budgetUtilization}
              expensesByCategory={expensesByCategory}
              recentExpenses={currentMonthExpenses.slice(0, 5)}
              onAddClick={() => setIsAddModalOpen(true)}
              insight={activeInsight}
            />
          )}
          {activeTab === 'budget' && (
            <BudgetConfig 
              budget={budget} 
              onUpdate={setBudget} 
            />
          )}
          {activeTab === 'stats' && (
            <Statistics 
              expensesByCategory={expensesByCategory}
              totalSpent={totalSpent}
            />
          )}
          {activeTab === 'savings' && (
            <Savings goals={goals} onUpdate={setGoals} />
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Nav */}
      <nav className="glass fixed bottom-0 left-0 right-0 max-w-md mx-auto h-16 flex items-center justify-around border-t border-gray-100 z-40 px-2 pb-safe">
        <NavButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={LayoutDashboard} label="Accueil" />
        <NavButton active={activeTab === 'budget'} onClick={() => setActiveTab('budget')} icon={Wallet} label="Budget" />
        <div className="relative -top-6">
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="w-14 h-14 bg-brand-primary rounded-full shadow-lg shadow-brand-primary/40 flex items-center justify-center text-white active:scale-95 transition-transform"
          >
            <Plus size={28} />
          </button>
        </div>
        <NavButton active={activeTab === 'stats'} onClick={() => setActiveTab('stats')} icon={PieChart} label="Stats" />
        <NavButton active={activeTab === 'savings'} onClick={() => setActiveTab('savings')} icon={PiggyBank} label="Épargne" />
      </nav>

      {/* Add Expense Modal */}
      <AddExpenseModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onAdd={addExpense}
      />
    </div>
  );
}

// --- Sub-components ---

function NavButton({ active, onClick, icon: Icon, label }: { active: boolean, onClick: () => void, icon: any, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center gap-1 transition-all w-16 h-12 rounded-xl relative",
        active ? "text-brand-primary bg-blue-50" : "text-slate-400"
      )}
    >
      <Icon size={18} />
      <span className="text-[10px] font-bold uppercase tracking-tighter">{label}</span>
      {active && (
        <motion.div layoutId="nav-pill" className="w-1 h-1 bg-brand-primary rounded-full absolute -bottom-1" />
      )}
    </button>
  );
}

function Dashboard({ balance, spent, income, utilization, expensesByCategory, recentExpenses, onAddClick, insight }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-5 py-4"
    >
      {/* Balance Grid - Sleek Style */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card-sleek col-span-2">
          <p className="metric-label">Solde Restant</p>
          <div className="flex items-baseline gap-1">
            <h2 className="metric-value">{formatCurrency(balance).replace('CDF', '')}</h2>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">CDF</span>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-[11px] font-bold mb-1.5">
              <span className="text-slate-500 uppercase tracking-tighter">{Math.round(utilization)}% du budget utilisé</span>
              <span className="text-slate-400">{formatCurrency(spent)}</span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(utilization, 100)}%` }}
                className={cn(
                  "h-full transition-all rounded-full",
                  utilization > 90 ? "bg-red-500" : utilization > 70 ? "bg-amber-500" : "bg-emerald-500"
                )}
              />
            </div>
          </div>
        </div>

        <div className="card-sleek">
          <p className="metric-label">Budget</p>
          <p className="text-lg font-bold text-slate-800">{formatCurrency(income).replace('CDF', '')}</p>
          <span className="text-[9px] font-bold text-slate-400 uppercase">Total Mensuel</span>
        </div>
        <div className="card-sleek">
          <p className="metric-label">Statut</p>
          <span className={cn(
            "badge-sleek px-3 py-1 rounded-full text-[10px] font-bold uppercase",
            utilization < 80 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
          )}>
            {utilization < 80 ? "Stable" : "Alerte"}
          </span>
        </div>
      </div>

      {/* Category Mini Graph (Simple Bars) */}
      <section>
        <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center justify-between">
          Répartition des dépenses
          <ChevronRight size={16} className="text-gray-400" />
        </h3>
        <div className="space-y-3">
          {Object.values(Category).map((cat) => {
            const amount = expensesByCategory[cat] || 0;
            if (amount === 0) return null;
            const percentage = (amount / spent) * 100;
            const Icon = (CATEGORY_ICONS as any)[cat];
            
            return (
              <div key={cat} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${(CATEGORY_COLORS as any)[cat]}15`, color: (CATEGORY_COLORS as any)[cat] }}>
                  <Icon size={16} />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between text-[11px] font-bold mb-1">
                    <span className="text-gray-700">{cat}</span>
                    <span className="text-gray-500">{formatCurrency(amount)}</span>
                  </div>
                  <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${percentage}%`, backgroundColor: (CATEGORY_COLORS as any)[cat] }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Recent Transactions */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-gray-800">Activités récentes</h3>
          <button className="text-xs font-bold text-brand-primary">Tout voir</button>
        </div>
        <div className="space-y-2">
          {recentExpenses.length > 0 ? (
            recentExpenses.map((exp: Expense) => {
              const Icon = (CATEGORY_ICONS as any)[exp.category];
              return (
                <div key={exp.id} className="flex items-center justify-between bg-white p-3 rounded-2xl shadow-sm border border-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 shrink-0">
                      <Icon size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{exp.category}</p>
                      <p className="text-[10px] text-gray-500">{exp.note || format(new Date(exp.date), 'dd MMM HH:mm', { locale: fr })}</p>
                    </div>
                  </div>
                  <p className="font-bold text-red-500 text-sm">-{formatCurrency(exp.amount)}</p>
                </div>
              );
            })
          ) : (
            <div className="py-8 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
              <p className="text-gray-400 text-xs">Aucune dépense ce mois</p>
              <button 
                onClick={onAddClick}
                className="mt-2 text-xs font-bold text-brand-primary underline"
              >
                Ajouter une dépense
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Insight Section */}
      <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl flex gap-3">
        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
          <span className="text-lg">💡</span>
        </div>
        <div>
          <p className="text-[11px] font-extrabold text-blue-700 uppercase tracking-widest mb-1">Conseil du jour</p>
          <p className="text-xs text-blue-800 leading-relaxed font-medium">
            "{insight}"
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function BudgetConfig({ budget, onUpdate }: { budget: Budget, onUpdate: (b: Budget) => void }) {
  const [income, setIncome] = useState(budget.income);
  const [allocations, setAllocations] = useState(budget.allocations);

  const totalAllocated = Object.values(allocations).reduce((sum, val) => sum + (val || 0), 0);
  const isOverBudget = totalAllocated > income;

  const handleSave = () => {
    onUpdate({ ...budget, income, allocations });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <section>
        <label className="metric-label block mb-2">Revenu Mensuel (CDF)</label>
        <div className="relative">
          <input 
            type="number" 
            value={income}
            onChange={(e) => setIncome(Number(e.target.value))}
            className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-4 font-display font-bold text-xl text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm"
          />
          <Wallet className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
        </div>
        <p className="text-[10px] text-slate-400 mt-2 font-medium italic">Estime ton revenu si celui-ci est variable.</p>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-bold text-slate-800">Catégories de budget</h3>
          <span className={cn(
            "text-[10px] font-bold px-2.5 py-1 rounded-full",
            isOverBudget ? "bg-red-50 text-red-600 border border-red-100" : "bg-blue-50 text-blue-600 border border-blue-100"
          )}>
            {formatCurrency(totalAllocated)} / {formatCurrency(income)}
          </span>
        </div>

        <div className="space-y-3">
          {Object.values(Category).map((cat) => (
            <div key={cat} className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm transition-all focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
              <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                {(CATEGORY_ICONS as any)[cat] && React.createElement((CATEGORY_ICONS as any)[cat], { size: 18 })}
              </div>
              <div className="flex-1">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">{cat}</p>
                <input 
                  type="number"
                  value={allocations[cat] || 0}
                  onChange={(e) => setAllocations(prev => ({ ...prev, [cat]: Number(e.target.value) }))}
                  className="w-full font-bold text-slate-800 outline-none text-sm"
                  placeholder="0 CDF"
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <button 
        onClick={handleSave}
        className="w-full bg-brand-primary text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all uppercase tracking-widest text-xs"
      >
        Enregistrer le budget
      </button>

      {isOverBudget && (
        <div className="bg-red-50 p-4 rounded-2xl flex gap-3 text-red-700">
          <AlertCircle size={20} className="shrink-0" />
          <p className="text-xs leading-relaxed">Attention: Ton budget total dépasse ton revenu prévu. Pense à réduire certaines catégories.</p>
        </div>
      )}
    </motion.div>
  );
}

function Statistics({ expensesByCategory, totalSpent }: any) {
  const chartData = useMemo(() => {
    return Object.entries(expensesByCategory).map(([name, value]) => ({
      name,
      value
    })).sort((a, b: any) => b.value - a.value);
  }, [expensesByCategory]);

  const pieData = useMemo(() => {
    return chartData.map(d => ({
      ...d,
      color: (CATEGORY_COLORS as any)[d.name] || '#CBD5E1'
    }));
  }, [chartData]);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="space-y-8"
    >
      <section className="card-sleek text-center">
        <p className="metric-label mb-2">Total Dépensé</p>
        <h2 className="text-3xl font-display font-bold text-slate-900 mb-6">{formatCurrency(totalSpent)}</h2>
        
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RePieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={85}
                paddingAngle={4}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                formatter={(value: number) => formatCurrency(value)} 
              />
            </RePieChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section>
        <h3 className="text-sm font-bold text-slate-800 mb-4 px-1">Analyse par catégorie</h3>
        <div className="card-sleek p-4">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chartData} layout="vertical" margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#F1F5F9" />
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" width={100} axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#64748B' }} />
              <Tooltip cursor={{ fill: '#F8FAFC' }} formatter={(value: number) => formatCurrency(value)} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={16}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={(CATEGORY_COLORS as any)[entry.name] || '#CBD5E1'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl">
        <div className="flex gap-3">
          <TrendingDown className="text-blue-600 shrink-0" size={20} />
          <p className="text-xs text-blue-800 font-medium leading-relaxed italic">
            "Emoniseli te ozo kende malamu. Odepanser mingi na {chartData[0]?.name || "nini te"} sanza oyo. Tokolela moke mpona sanza eya."
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function Savings({ goals, onUpdate }: { goals: StepGoal[], onUpdate: (g: StepGoal[]) => void }) {
  const [isAdding, setIsAdding] = useState(false);
  const [newGoal, setNewGoal] = useState({ name: '', target: 0 });

  const handleAddGoal = () => {
    if (!newGoal.name || newGoal.target <= 0) return;
    onUpdate([...goals, { id: crypto.randomUUID(), name: newGoal.name, targetAmount: newGoal.target, currentAmount: 0 }]);
    setNewGoal({ name: '', target: 0 });
    setIsAdding(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-800 px-1">Objectifs d'épargne</h3>
        <button 
          onClick={() => setIsAdding(true)}
          className="text-xs font-bold text-blue-600 flex items-center gap-1"
        >
          <Plus size={14} /> Nouvel objectif
        </button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-white p-4 rounded-2xl border-2 border-brand-primary/20 overflow-hidden"
          >
            <input 
              autoFocus
              placeholder="Nom (ex: Mobile...)"
              className="w-full font-bold mb-3 outline-none"
              value={newGoal.name}
              onChange={e => setNewGoal(prev => ({ ...prev, name: e.target.value }))}
            />
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs font-bold text-gray-400">Montant cible</span>
              <input 
                type="number"
                placeholder="0 CDF"
                className="flex-1 font-bold outline-none"
                value={newGoal.target || ''}
                onChange={e => setNewGoal(prev => ({ ...prev, target: Number(e.target.value) }))}
              />
            </div>
            <div className="flex gap-2">
              <button 
                onClick={handleAddGoal}
                className="flex-1 bg-brand-primary text-white py-2 rounded-xl text-xs font-bold"
              >
                Créer
              </button>
              <button 
                onClick={() => setIsAdding(false)}
                className="px-4 bg-gray-100 text-gray-500 py-2 rounded-xl text-xs font-bold"
              >
                Fermer
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-4">
        {goals.map((goal) => {
          const progress = (goal.currentAmount / goal.targetAmount) * 100;
          return (
            <div key={goal.id} className="card-sleek">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-bold text-slate-900">{goal.name}</h4>
                  <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">Cible: {formatCurrency(goal.targetAmount)}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                  <CheckCircle2 size={18} className={progress >= 100 ? "text-blue-500" : "text-slate-200"} />
                </div>
              </div>
              
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden mb-2">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(progress, 100)}%` }}
                  className="h-full bg-blue-500 rounded-full"
                />
              </div>
              
              <div className="flex justify-between text-[11px] font-bold">
                <span className="text-blue-600 uppercase tracking-tighter">{formatCurrency(goal.currentAmount)} épargné</span>
                <span className="text-slate-400">{Math.round(progress)}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

function AddExpenseModal({ isOpen, onClose, onAdd }: any) {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<Category>(Category.FOOD);
  const [note, setNote] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center px-4 pb-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-brand-secondary/40 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        className="relative w-full max-w-md bg-white rounded-t-[40px] px-8 pt-8 pb-10 shadow-2xl overflow-hidden"
      >
        <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-8" />
        
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-display font-bold text-gray-900">Ajouter une dépense</h2>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full text-gray-500">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6">
          <section>
            <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block tracking-widest">Montant (CDF)</label>
            <input 
              autoFocus
              type="number"
              placeholder="0"
              className="w-full text-4xl font-display font-bold text-slate-900 outline-none border-b border-divider pb-2 focus:border-blue-500 transition-colors"
              value={amount}
              onChange={e => setAmount(e.target.value)}
            />
          </section>

          <section>
            <label className="text-[10px] font-bold text-slate-400 uppercase mb-3 block tracking-widest">Catégorie</label>
            <div className="grid grid-cols-4 gap-3">
              {Object.values(Category).map((cat) => {
                const Icon = (CATEGORY_ICONS as any)[cat];
                const isActive = category === cat;
                return (
                  <button 
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={cn(
                      "flex flex-col items-center gap-2 p-2 rounded-2xl transition-all border",
                      isActive ? "bg-blue-50 text-blue-600 border-blue-200" : "text-slate-400 border-transparent bg-slate-50/50"
                    )}
                  >
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", isActive ? "bg-blue-100" : "bg-slate-100/50")}>
                      <Icon size={18} />
                    </div>
                    <span className="text-[8px] font-bold uppercase truncate w-full text-center">{cat}</span>
                  </button>
                );
              })}
            </div>
          </section>

          <section>
            <input 
              placeholder="Note (facultatif)..."
              className="w-full bg-slate-50 px-4 py-3 rounded-xl text-sm outline-none border border-slate-200 focus:border-blue-500 transition-all font-medium text-slate-800"
              value={note}
              onChange={e => setNote(e.target.value)}
            />
          </section>

          <button 
            disabled={!amount || Number(amount) <= 0}
            onClick={() => onAdd(Number(amount), category, note)}
            className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold shadow-xl shadow-blue-500/20 active:scale-[0.98] disabled:opacity-40 disabled:active:scale-100 transition-all uppercase tracking-widest text-xs"
          >
            Confirmer la dépense
          </button>
        </div>
      </motion.div>
    </div>
  );
}
