import React, { useState, useEffect } from 'react';
import gameData from '../data/gameData.json';
import StatCard from './StatCard';
import { FaBook, FaCheckCircle, FaUndo, FaFlagCheckered, FaTrophy, FaHistory, FaInfoCircle } from 'react-icons/fa';

const EconomyDashboard = () => {
  const [stats, setStats] = useState(gameData.initialStats);
  const [currentTurn, setCurrentTurn] = useState(0);
  const [history, setHistory] = useState([]);
  const [gameStatus, setGameStatus] = useState('playing'); // 'playing' | 'finished'

  const currentScenario = gameData.scenarios[currentTurn];

  const handleChoice = (option) => {
    const newStats = {
      growth: stats.growth + option.impact.growth,
      inflation: stats.inflation + option.impact.inflation,
      unemployment: stats.unemployment + option.impact.unemployment,
      satisfaction: Math.min(Math.max(stats.satisfaction + option.impact.satisfaction, 0), 100),
    };
    
    setStats(newStats);
    setHistory([...history, { 
      scenario: currentScenario.title, 
      choice: option.text, 
      theory: option.theory,
      tag: option.tag 
    }]);

    if (currentTurn < 9) {
      setCurrentTurn(currentTurn + 1);
    } else {
      setGameStatus('finished');
    }
  };

  const restartGame = () => {
    setStats(gameData.initialStats);
    setCurrentTurn(0);
    setHistory([]);
    setGameStatus('playing');
  };

  const getFinalRanking = () => {
    // Advanced ranking logic
    const matches = gameData.rankings.filter(r => {
      const cond = r.condition;
      if (Object.keys(cond).length === 0) return false;
      return Object.entries(cond).every(([key, value]) => {
        if (key === 'growth') return stats.growth >= value;
        if (key === 'satisfaction') return stats.satisfaction >= value;
        if (key === 'inflation') return stats.inflation >= value; // Special case for hyperinflation
        if (key === 'unemployment') return stats.unemployment >= value;
        return true;
      });
    });

    // Special case for hyperinflation/unemployment
    if (stats.inflation >= 12) return gameData.rankings.find(r => r.id === 'hyper_inflation');
    if (stats.unemployment >= 10) return gameData.rankings.find(r => r.id === 'unemployment_crisis');
    if (stats.growth <= 1) return gameData.rankings.find(r => r.id === 'stagnation');

    return matches[0] || gameData.rankings.find(r => r.id === 'general');
  };

  if (gameStatus === 'finished') {
    const ranking = getFinalRanking();
    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-8 flex items-center justify-center">
        <div className="max-w-5xl w-full bg-white rounded-[2rem] shadow-2xl p-8 md:p-12 border border-slate-100 animate-in zoom-in-95 duration-500 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          
          <div className="text-center mb-12 relative">
            <div className="w-20 h-20 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                <FaFlagCheckered className="text-4xl" />
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-slate-800 mb-2 tracking-tight">Tổng kết Mô phỏng</h2>
            <p className="text-lg text-slate-500 font-medium">Bạn đã hoàn thành 10 lượt điều hành xã hội</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            <div className="lg:col-span-2 bg-gradient-to-br from-red-600 to-red-800 rounded-3xl p-8 text-white shadow-xl flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-4">
                    <FaTrophy className="text-yellow-400" />
                    <span className="text-xs font-black uppercase tracking-[0.2em] text-red-200">Thành tựu đạt được</span>
                </div>
                <h3 className="text-3xl font-black mb-4">{ranking.title}</h3>
                <p className="text-lg text-red-50 leading-relaxed mb-6 opacity-90">{ranking.description}</p>
                <div className="inline-flex items-center px-4 py-2 bg-white/10 rounded-full border border-white/20 self-start">
                    <span className="text-sm font-bold">Danh hiệu: {ranking.achievement}</span>
                </div>
            </div>
            
            <div className="space-y-4">
                <h4 className="text-xs font-black uppercase text-slate-400 tracking-widest px-2">Chỉ số cuối kỳ</h4>
                <div className="grid grid-cols-1 gap-4">
                    {[
                        { label: 'Tăng trưởng', val: stats.growth, unit: '%', color: 'text-emerald-600' },
                        { label: 'Hài lòng', val: stats.satisfaction, unit: '%', color: 'text-indigo-600' },
                        { label: 'Lạm phát', val: stats.inflation, unit: '%', color: 'text-orange-600' },
                        { label: 'Thất nghiệp', val: stats.unemployment, unit: '%', color: 'text-red-600' }
                    ].map(s => (
                        <div key={s.label} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex justify-between items-center transition-hover hover:border-slate-300">
                            <span className="text-sm font-bold text-slate-500 uppercase">{s.label}</span>
                            <span className={`text-xl font-black ${s.color}`}>{s.val.toFixed(1)}{s.unit}</span>
                        </div>
                    ))}
                </div>
            </div>
          </div>

          <div className="mb-12 bg-slate-50 rounded-3xl border border-slate-100 overflow-hidden">
            <div className="flex items-center justify-between p-6 bg-white border-b border-slate-100">
                <div className="flex items-center gap-2">
                    <FaHistory className="text-slate-400" />
                    <h4 className="text-sm font-black uppercase text-slate-600 tracking-widest">Lịch sử điều hành</h4>
                </div>
                <span className="text-xs font-bold text-slate-400">10 QUYẾT ĐỊNH</span>
            </div>
            <div className="max-h-64 overflow-y-auto p-4 custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {history.map((h, i) => (
                    <div key={i} className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-sm flex gap-4 items-start">
                        <span className="bg-slate-100 text-slate-500 font-bold px-2 py-1 rounded-lg text-[10px] mt-1 shrink-0">{i + 1}</span>
                        <div>
                            <p className="font-bold text-slate-800 text-sm leading-tight mb-1">{h.scenario}</p>
                            <p className="text-xs text-red-600 font-medium mb-2">● {h.choice}</p>
                            <div className="flex items-center gap-1.5 opacity-60">
                                <FaInfoCircle className="text-[10px]" />
                                <span className="text-[10px] font-bold uppercase tracking-tighter">[{h.tag}]</span>
                            </div>
                        </div>
                    </div>
                ))}
              </div>
            </div>
          </div>

          <button 
            onClick={restartGame}
            className="w-full bg-slate-900 hover:bg-black text-white font-black py-5 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-3 text-lg"
          >
            <FaUndo className="text-sm" /> THỰC HIỆN NHIỆM KỲ MỚI
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans p-4 md:p-8">
      {/* Header */}
      <header className="max-w-6xl mx-auto mb-10 text-center">
        <h1 className="text-4xl md:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-red-800 to-red-500 mb-3 tracking-tighter">
          Kinh tế Chính trị Mác - Lênin
        </h1>
        <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            <div className="flex items-center gap-2 px-4 py-1.5 bg-red-100 text-red-700 rounded-full text-xs font-black uppercase tracking-widest shadow-sm">
                <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
                Lượt {currentTurn + 1} / 10
            </div>
            <div className="w-64 h-2 bg-slate-200 rounded-full overflow-hidden shadow-inner">
                <div 
                    className="h-full bg-red-600 transition-all duration-700 ease-out" 
                    style={{ width: `${(currentTurn + 1) * 10}%` }}
                />
            </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Sidebar: Stats */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex items-center space-x-2 mb-2 px-2">
            <div className="w-1.5 h-5 bg-red-600 rounded-full" />
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">Điều kiện Vĩ mô</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
            <StatCard label="Tăng trưởng" value={stats.growth} description="Thặng dư xã hội." />
            <StatCard label="Lòng dân" value={stats.satisfaction} unit="%" description="Sự đồng thuận giai cấp." />
            <StatCard label="Lạm phát" value={stats.inflation} description="Biến động giá trị." />
            <StatCard label="Thất nghiệp" value={stats.unemployment} description="Đội quân dự bị." />
          </div>
        </div>

        {/* Main Content: Scenarios */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl border border-slate-100 h-full flex flex-col relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-red-600" />
            
            <div className="mb-10">
                <div className="flex items-center gap-2 mb-4">
                    <span className="p-2 bg-slate-100 rounded-xl text-slate-500">
                        <FaBook className="text-xs" />
                    </span>
                    <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Học thuyết & Thực tiễn</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-black text-slate-800 mb-6 leading-[1.1]">{currentScenario.title}</h2>
                <div className="bg-slate-50 rounded-2xl p-6 border-l-4 border-red-500 shadow-sm inline-block w-full">
                    <p className="text-xl md:text-2xl text-slate-700 leading-relaxed font-serif italic font-medium">
                        "{currentScenario.description}"
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow">
                {currentScenario.options.map((option, idx) => (
                    <button
                        key={idx}
                        onClick={() => handleChoice(option)}
                        className="group relative flex flex-col p-6 rounded-3xl border-2 border-slate-100 bg-white hover:border-red-600 hover:shadow-xl hover:shadow-red-500/10 transition-all duration-300 text-left"
                    >
                        <div className="flex justify-between items-center mb-3">
                            <span className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-black text-slate-500 group-hover:bg-red-600 group-hover:text-white transition-colors">
                                {idx + 1}
                            </span>
                            <FaCheckCircle className="text-red-500 opacity-0 group-hover:opacity-100 transition-all scale-50 group-hover:scale-100" />
                        </div>
                        <h3 className="text-lg font-black text-slate-800 mb-2 leading-tight group-hover:text-red-700 transition-colors">
                            {option.text}
                        </h3>
                        <p className="text-sm text-slate-500 line-clamp-2 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                            {option.theory}
                        </p>
                    </button>
                ))}
            </div>

            <div className="mt-12 flex items-center justify-between text-slate-300">
                <p className="text-[10px] font-black uppercase tracking-[0.3em]">Marxism-Leninism Simulation v2.0</p>
                <div className="flex gap-1">
                    {[...Array(10)].map((_, i) => (
                        <div key={i} className={`w-1.5 h-1.5 rounded-full ${i <= currentTurn ? 'bg-red-500' : 'bg-slate-200'}`} />
                    ))}
                </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="max-w-6xl mx-auto mt-12 py-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-400">
        <p className="text-xs font-bold font-['Outfit'] uppercase underline decoration-red-500/30 decoration-2 underline-offset-4">Dự án mô phỏng giáo dục bậc đại học</p>
        <p className="text-xs">Phát triển cho học phần Kinh tế Chính trị Mác - Lênin</p>
      </footer>
    </div>
  );
};

export default EconomyDashboard;
