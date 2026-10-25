import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { api } from '../services/api';
import {
  Wallet,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  PieChart as PieIcon,
  Plus,
  Trash2,
  Tag,
  DollarSign
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis
} from 'recharts';

const CATEGORY_COLORS = {
  Salary: '#10b981',
  Miscellaneous: '#94a3b8',
  Investments: '#6366f1',
  Food: '#f59e0b',
  Gym: '#ec4899',
  Tech: '#8b5cf6',
  Leisure: '#3b82f6',
  Rent: '#ef4444',
  General: '#94a3b8'
};

const CHART_COLORS = ['#10b981', '#f59e0b', '#ec4899', '#6366f1', '#06b6d4', '#ef4444', '#8b5cf6'];

export const FinanceHub = () => {
  const { addXp, addCoins } = useStore();
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({
    totalIncome: 5000,
    totalExpenses: 60,
    netSavings: 4940,
    savingsRate: 98.8,
    categoryBreakdown: [
      { category: 'Salary', total: 5000, type: 'income' },
      { category: 'Gym', total: 60, type: 'expense' }
    ]
  });

  // Form State
  const [type, setType] = useState('expense');
  const [category, setCategory] = useState('Food');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  const fetchFinanceData = async () => {
    try {
      const summaryData = await api.finance.getSummary();
      if (summaryData.success && summaryData.summary) {
        setSummary(summaryData.summary);
      }
      const logsData = await api.finance.getLogs(20);
      if (logsData.success && logsData.logs) {
        setTransactions(logsData.logs);
      }
    } catch (e) {
      console.log('Using local finance state');
      if (transactions.length === 0) {
        setTransactions([
          { _id: '1', type: 'income', category: 'Salary', amount: 5000, note: 'Monthly retainer', date: new Date() },
          { _id: '2', type: 'expense', category: 'Gym', amount: 60, note: 'Iron Club membership', date: new Date() }
        ]);
      }
    }
  };

  useEffect(() => {
    fetchFinanceData();
  }, []);

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) return;

    const newTx = {
      _id: `tx-${Date.now()}`,
      type,
      category,
      amount: numAmount,
      note: note.trim() || 'Quick log',
      date: new Date()
    };

    setTransactions([newTx, ...transactions]);

    // Update summary metrics
    const isIncome = type === 'income';
    const newTotalIncome = isIncome ? summary.totalIncome + numAmount : summary.totalIncome;
    const newTotalExpenses = !isIncome ? summary.totalExpenses + numAmount : summary.totalExpenses;
    const newNetSavings = newTotalIncome - newTotalExpenses;
    const newRate = newTotalIncome > 0 ? ((newNetSavings / newTotalIncome) * 100).toFixed(1) : 0;

    setSummary({
      ...summary,
      totalIncome: newTotalIncome,
      totalExpenses: newTotalExpenses,
      netSavings: newNetSavings,
      savingsRate: Number(newRate)
    });

    addXp(15);
    addCoins(3);

    try {
      await api.finance.create({ type, category, amount: numAmount, note: note.trim() });
    } catch (e) {}

    setAmount('');
    setNote('');
  };

  const handleDelete = async (id) => {
    setTransactions(transactions.filter((t) => t._id !== id));
    try {
      await api.finance.delete(id);
    } catch (e) {}
  };

  // Prepare chart data from transactions
  const expenseTransactions = transactions.filter((t) => t.type === 'expense');
  const expensesByCategory = expenseTransactions.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
    return acc;
  }, {});

  const pieChartData = Object.keys(expensesByCategory).map((cat) => ({
    name: cat,
    value: expensesByCategory[cat]
  }));

  if (pieChartData.length === 0) {
    pieChartData.push({ name: 'General', value: 60 });
  }

  return (
    <div className="glass-card rounded-3xl p-6 border-t-2 border-t-amber-500 shadow-xl">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-md shadow-amber-500/20">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-display font-bold text-xl text-white flex items-center gap-2">
              Finance Tracking Hub
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Wealth Warden
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Categorized ledger and Recharts visual budgeting breakdown
            </p>
          </div>
        </div>

        {/* Aggregate Badges */}
        <div className="flex items-center gap-2 text-xs font-mono font-bold">
          <span className="px-3 py-1.5 rounded-xl bg-emerald-950/40 text-emerald-400 border border-emerald-500/30">
            Income: ₹{summary.totalIncome.toLocaleString()}
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-rose-950/40 text-rose-400 border border-rose-500/30">
            Expenses: ₹{summary.totalExpenses.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Main Finance Content: Metrics + Recharts Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        
        {/* Left: Net Balance Card & Add Form */}
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-[#090d16] border border-amber-900/30">
            <span className="text-xs text-slate-400 font-medium block">Net Savings Balance</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-mono text-3xl font-extrabold text-white">
                ₹{summary.netSavings.toLocaleString()}
              </span>
              <span className="text-xs font-bold text-emerald-400 flex items-center">
                <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
                {summary.savingsRate}% Rate
              </span>
            </div>
          </div>

          {/* Quick Transaction Form */}
          <form onSubmit={handleAddTransaction} className="p-4 rounded-2xl bg-[#090d16] border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Log Transaction</h4>
              <div className="flex rounded-lg overflow-hidden border border-slate-700 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setType('expense')}
                  className={`px-3 py-1 transition-colors ${type === 'expense' ? 'bg-rose-600 text-white' : 'bg-slate-900 text-slate-400'}`}
                >
                  Expense
                </button>
                <button
                  type="button"
                  onClick={() => setType('income')}
                  className={`px-3 py-1 transition-colors ${type === 'income' ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-slate-400'}`}
                >
                  Income
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Amount (₹)</label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g. 45"
                  required
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white outline-none"
                >
                  <option value="Food">Food</option>
                  <option value="Gym">Gym & Fitness</option>
                  <option value="Tech">Tech & Tools</option>
                  <option value="Leisure">Leisure</option>
                  <option value="Salary">Salary</option>
                  <option value="Miscellaneous">Miscellaneous</option>
                  <option value="Rent">Rent & Living</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Note (Optional)</label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. Grocery restock"
                className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
            >
              + Record (+15 XP & 3 Coins)
            </button>
          </form>
        </div>

        {/* Center: Recharts Visual Budgeting Breakdown */}
        <div className="bg-[#090d16] border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <PieIcon className="w-4 h-4 text-amber-400" />
              Expense Distribution
            </span>
            <span className="text-[10px] text-slate-500 font-mono">Recharts Engine</span>
          </div>

          {/* Recharts Pie Chart */}
          <div className="h-56 w-full flex items-center justify-center my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {(pieChartData || []).map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={CHART_COLORS[index % CHART_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0d1322',
                    borderColor: '#374151',
                    borderRadius: '0.75rem',
                    fontSize: '11px',
                    color: '#fff'
                  }}
                  formatter={(val) => [`₹${val}`, 'Amount']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-center gap-3 flex-wrap text-[11px] text-slate-400">
            {(pieChartData || []).map((d, i) => (
              <span key={d.name} className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                {d.name}: ₹{d.value}
              </span>
            ))}
          </div>
        </div>

        {/* Right: Transactions Ledger */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
            <span>Recent Transactions</span>
            <span className="font-mono text-slate-500">{transactions.length} Records</span>
          </div>

          <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
            {(transactions || []).map((tx) => (
              <div
                key={tx._id}
                className="p-3 rounded-xl bg-[#090d16] border border-slate-800 flex items-center justify-between gap-3 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs shrink-0 ${
                      tx.type === 'income' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                    }`}
                  >
                    {tx.type === 'income' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                  </div>
                  <div className="truncate">
                    <h5 className="font-bold text-xs text-white truncate">{tx.category}</h5>
                    <p className="text-[10px] text-slate-400 truncate">{tx.note || 'No note'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`font-mono font-bold text-xs ${
                      tx.type === 'income' ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {tx.type === 'income' ? '+' : '-'}₹{tx.amount}
                  </span>
                  <button
                    onClick={() => handleDelete(tx._id)}
                    className="p-1 rounded text-slate-600 hover:text-rose-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
