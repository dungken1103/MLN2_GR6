import React, { useState, useEffect } from 'react';
import gameData from '../data/gameData.json';
import StatCard from './StatCard';
import { FaBook, FaCheckCircle, FaUndo, FaFlagCheckered, FaTrophy, FaHistory, FaInfoCircle, FaQuoteLeft, FaArrowRight } from 'react-icons/fa';

const EconomyDashboard = () => {
  const [stats, setStats] = useState(gameData.initialStats);
  const [currentTurn, setCurrentTurn] = useState(0);
  const [history, setHistory] = useState([]);
  const [gameStatus, setGameStatus] = useState('playing'); // 'playing' | 'finished'
  const [showInsight, setShowInsight] = useState(false);
  const [lastChoice, setLastChoice] = useState(null);

  const currentScenario = gameData.scenarios[currentTurn];

  const handleChoice = (option) => {
    setLastChoice(option);
    setShowInsight(true);
  };

  const confirmChoice = () => {
    const option = lastChoice;
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
      insight: option.insight,
      tag: option.tag 
    }]);

    setShowInsight(false);
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
    const matches = gameData.rankings.filter(r => {
      const cond = r.condition;
      if (Object.keys(cond).length === 0) return false;
      return Object.entries(cond).every(([key, value]) => {
        if (key === 'growth') return stats.growth >= value;
        if (key === 'satisfaction') return stats.satisfaction >= value;
        if (key === 'inflation') return stats.inflation >= value;
        if (key === 'unemployment') return stats.unemployment >= value;
        return true;
      });
    });

    if (stats.inflation >= 12) return gameData.rankings.find(r => r.id === 'hyper_inflation');
    if (stats.unemployment >= 10) return gameData.rankings.find(r => r.id === 'unemployment_crisis');
    if (stats.growth <= 1) return gameData.rankings.find(r => r.id === 'stagnation');

    return matches[0] || gameData.rankings.find(r => r.id === 'general');
  };

  if (gameStatus === 'finished') {
    const ranking = getFinalRanking();
    return (
      <div className="min-h-screen bg-[#F5F5F5] p-4 md:p-8 flex items-center justify-center font-sans">
        <div className="max-w-5xl w-full bg-white border-4 border-slate-900 shadow-[20px_20px_0px_0px_rgba(0,0,0,1)] p-8 md:p-12 animate-in zoom-in-95 duration-500 overflow-hidden relative">
          
          <div className="text-center mb-12 border-b-4 border-slate-900 pb-8">
            <h2 className="text-5xl md:text-7xl font-black text-slate-900 mb-2 tracking-tighter uppercase italic">
                Báo cáo <span className="text-red-600">Nhiệm kỳ</span>
            </h2>
            <p className="text-lg text-slate-500 font-bold uppercase tracking-widest">Kết quả điều hành nền kinh tế quốc dân</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            <div className="lg:col-span-2 bg-red-600 p-8 text-white shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 -rotate-45 translate-x-16 -translate-y-16" />
                <div className="flex items-center gap-2 mb-6">
                    <FaTrophy className="text-yellow-400" />
                    <span className="text-xs font-black uppercase tracking-[0.3em] text-red-200">Xếp loại Xã hội</span>
                </div>
                <h3 className="text-4xl font-black mb-6 uppercase italic tracking-tight leading-none">{ranking.title}</h3>
                <p className="text-xl text-red-50 leading-relaxed mb-8 opacity-95 border-l-4 border-white pl-6 italic">
                    {ranking.description}
                </p>
                <div className="inline-block px-6 py-3 bg-slate-900 text-white font-black text-sm uppercase tracking-widest">
                    Thành tựu: {ranking.achievement}
                </div>
            </div>
            
            <div className="space-y-4">
                <h4 className="text-xs font-black uppercase text-slate-400 tracking-widest px-2">Chỉ số Cuối kỳ</h4>
                <div className="grid grid-cols-1 gap-4">
                    {[
                        { label: 'Tăng trưởng', val: stats.growth, unit: '%', color: 'text-slate-900' },
                        { label: 'Hài lòng', val: stats.satisfaction, unit: '%', color: 'text-slate-900' },
                        { label: 'Lạm phát', val: stats.inflation, unit: '%', color: 'text-red-600' },
                        { label: 'Thất nghiệp', val: stats.unemployment, unit: '%', color: 'text-red-600' }
                    ].map(s => (
                        <div key={s.label} className="bg-[#F5F5F5] p-5 border-2 border-slate-900 flex justify-between items-center group hover:bg-white transition-colors">
                            <span className="text-xs font-black text-slate-500 uppercase tracking-widest">{s.label}</span>
                            <span className={`text-2xl font-black ${s.color}`}>{s.val.toFixed(1)}{s.unit}</span>
                        </div>
                    ))}
                </div>
            </div>
          </div>

          <div className="mb-12 border-4 border-slate-900">
            <div className="flex items-center justify-between p-6 bg-slate-900 text-white">
                <div className="flex items-center gap-2">
                    <FaHistory className="text-red-500" />
                    <h4 className="text-sm font-black uppercase tracking-[0.2em]">Hồ sơ Quyết định</h4>
                </div>
                <span className="text-xs font-bold opacity-60">10 / 10 GIAI ĐOẠN</span>
            </div>
            <div className="max-h-80 overflow-y-auto p-6 bg-[#F5F5F5] custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {history.map((h, i) => (
                    <div key={i} className="bg-white p-6 border-2 border-slate-200 hover:border-red-600 transition-colors">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="bg-slate-900 text-white font-black w-6 h-6 flex items-center justify-center text-[10px]">{i + 1}</span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">[{h.tag}]</span>
                        </div>
                        <p className="font-black text-slate-900 text-sm uppercase mb-2 tracking-tight">{h.scenario}</p>
                        <p className="text-xs text-red-600 font-bold mb-3 italic">Lựa chọn: {h.choice}</p>
                        <p className="text-[11px] text-slate-500 leading-relaxed bg-slate-50 p-3 border-l-2 border-slate-300 italic">
                            "{h.insight}"
                        </p>
                    </div>
                ))}
              </div>
            </div>
          </div>

          <button 
            onClick={restartGame}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-6 shadow-[10px_10px_0px_0px_rgba(26,26,26,1)] transition-all flex items-center justify-center gap-4 text-xl uppercase italic tracking-tighter"
          >
            <FaUndo className="text-sm" /> Thực hiện nhiệm kỳ mới
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] text-slate-900 font-sans p-4 md:p-8">
      {/* Insight Modal */}
      {showInsight && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="max-w-2xl w-full bg-white border-8 border-red-600 p-8 md:p-12 shadow-[30px_30px_0px_0px_rgba(0,0,0,0.5)] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-red-600 flex items-center justify-center rotate-45 translate-x-12 -translate-y-12">
                    <FaQuoteLeft className="text-white -rotate-45 text-2xl" />
                </div>
                
                <h3 className="text-xs font-black uppercase tracking-[0.4em] text-red-600 mb-8 border-b-2 border-red-600 pb-2 inline-block">Cơ sở Lý luận</h3>
                
                <div className="mb-10">
                    <p className="text-2xl md:text-3xl font-black text-slate-900 mb-6 italic leading-tight tracking-tight">
                        "{lastChoice.insight}"
                    </p>
                    <div className="p-5 bg-slate-100 border-l-8 border-slate-900">
                        <p className="text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Phân tích Hệ thống</p>
                        <p className="text-sm font-bold text-slate-700 leading-relaxed italic">
                            {lastChoice.theory}
                        </p>
                    </div>
                </div>

                <button 
                    onClick={confirmChoice}
                    className="w-full bg-slate-900 hover:bg-black text-white font-black py-6 flex items-center justify-center gap-4 text-xl uppercase italic tracking-tighter group transition-all"
                >
                    Tiếp tục điều hành <FaArrowRight className="text-red-500 group-hover:translate-x-2 transition-transform" />
                </button>
            </div>
        </div>
      )}

      <header className="max-w-7xl mx-auto mb-12 flex flex-col md:flex-row items-end justify-between gap-8 border-b-8 border-slate-900 pb-8">
        <div>
            <h1 className="text-5xl md:text-8xl font-black bg-slate-900 text-white px-4 py-2 inline-block mb-4 italic tracking-tighter uppercase transform -skew-x-6">
                Mô phỏng <span className="text-red-600">MLN122</span>
            </h1>
            <p className="text-xl md:text-2xl font-black uppercase tracking-[0.2em] text-slate-400">Học thuyết Kinh tế Chính trị Mác - Lênin</p>
        </div>
        
        <div className="flex flex-col items-end gap-3">
            <div className="flex items-center gap-3">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Tiến trình</span>
                <div className="flex gap-1.5">
                    {[...Array(10)].map((_, i) => (
                        <div key={i} className={`w-3 h-8 transform -skew-x-12 border-2 border-slate-900 ${i <= currentTurn ? 'bg-red-600' : 'bg-slate-200'}`} />
                    ))}
                </div>
            </div>
            <div className="bg-red-100 text-red-700 px-4 py-2 text-xs font-black uppercase tracking-widest border-2 border-red-600">
                Giai đoạn {currentTurn + 1} / 10
            </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-12">
        
        {/* Left Sidebar: Stats */}
        <div className="lg:col-span-1 space-y-8">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 bg-red-600" />
            <h2 className="text-xs font-black uppercase tracking-[0.4em] text-slate-900">Thông số Vĩ mô</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
            <StatCard label="Tăng trưởng" value={stats.growth} description="Thặng dư xã hội thặng dư." />
            <StatCard label="Lòng dân" value={stats.satisfaction} unit="%" description="Liên minh công nông." />
            <StatCard label="Lạm phát" value={stats.inflation} description="Biến động quy luật giá trị." />
            <StatCard label="Thất nghiệp" value={stats.unemployment} description="Đội quân dự bị lao động." />
          </div>
        </div>

        {/* Main Content: Scenarios */}
        <div className="lg:col-span-3">
          <div className="bg-white border-8 border-slate-900 p-8 md:p-14 shadow-[40px_40px_0px_0px_rgba(204,0,0,1)] relative overflow-hidden group">
            
            <div className="mb-12">
                <div className="flex items-center gap-4 mb-6">
                    <span className="text-xs font-black uppercase tracking-[0.5em] text-red-600">Tình huống Chiến lược</span>
                    <div className="flex-grow h-px bg-slate-200" />
                </div>
                <h2 className="text-4xl md:text-6xl font-black text-slate-900 mb-10 leading-none uppercase italic tracking-tighter">
                    {currentScenario.title}
                </h2>
                <div className="relative">
                    <FaQuoteLeft className="absolute -top-6 -left-6 text-slate-100 text-8xl -z-10" />
                    <p className="text-2xl md:text-3xl text-slate-800 leading-[1.2] font-black italic border-l-8 border-red-600 pl-8">
                        {currentScenario.description}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                {currentScenario.options.map((option, idx) => (
                    <button
                        key={idx}
                        onClick={() => handleChoice(option)}
                        className="group relative flex flex-col p-8 border-4 border-slate-900 bg-[#F5F5F5] hover:bg-slate-900 transition-all duration-300 text-left"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <span className="text-2xl font-black text-slate-900 group-hover:text-red-600 transition-colors">
                                0{idx + 1}
                            </span>
                            <div className="w-4 h-4 border-2 border-slate-900 group-hover:bg-red-600 group-hover:border-red-600 transition-all" />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 mb-4 leading-tight group-hover:text-white transition-colors uppercase italic tracking-tighter">
                            {option.text}
                        </h3>
                        <div className="h-1 w-12 bg-red-600 group-hover:w-full transition-all duration-500" />
                    </button>
                ))}
            </div>

            <div className="flex items-center justify-between pt-8 border-t-2 border-slate-100 text-slate-300">
                <p className="text-[10px] font-black uppercase tracking-[0.5em]">Constructivist Simulation Engine v3.0</p>
                <div className="flex gap-2">
                    <div className="w-2 h-2 bg-red-600" />
                    <div className="w-2 h-2 bg-slate-900" />
                </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="max-w-7xl mx-auto mt-24 py-12 border-t-4 border-slate-900 flex flex-col md:flex-row justify-between items-start gap-8">
        <div className="space-y-4">
            <h4 className="text-xl font-black uppercase italic tracking-tighter">Ban Biên Tập Nhóm 6</h4>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest max-w-sm leading-relaxed">
                Hệ thống mô phỏng phục vụ nghiên cứu và học tập học phần Kinh tế Chính trị Mác - Lênin. Thiết kế theo ngôn ngữ tạo hình Constructivism.
            </p>
        </div>
        <div className="flex gap-12">
            <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Học phần</p>
                <p className="text-xs font-black uppercase italic tracking-tighter">MLN2_GR6</p>
            </div>
            <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Phiên bản</p>
                <p className="text-xs font-black uppercase italic tracking-tighter">2026.03.22</p>
            </div>
        </div>
      </footer>
    </div>
  );
};

export default EconomyDashboard;
