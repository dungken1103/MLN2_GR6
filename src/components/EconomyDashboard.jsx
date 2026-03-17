import React, { useState, useEffect } from 'react';
import gameData from '../data/gameData.json';
import StatCard from './StatCard';
import { FaBook, FaCheckCircle, FaUndo, FaFlagCheckered, FaChartLine } from 'react-icons/fa';

const EconomyDashboard = () => {
  const [stats, setStats] = useState(gameData.initialStats);
  const [currentTurn, setCurrentTurn] = useState(0);
  const [history, setHistory] = useState([]);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [gameStatus, setGameStatus] = useState('playing'); // 'playing' | 'finished'

  const currentScenario = gameData.scenarios[currentTurn];

  const handleChoice = (option) => {
    const newStats = {
      growth: stats.growth + option.impact.growth,
      inflation: stats.inflation + option.impact.inflation,
      unemployment: stats.unemployment + option.impact.unemployment,
      satisfaction: Math.min(Math.max(stats.satisfaction + option.impact.satisfaction, 0), 100),
    };
    
    const newHistory = [...history, { scenario: currentScenario.title, choice: option.text, theory: option.theory }];
    
    setStats(newStats);
    setHistory(newHistory);

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
    const ranking = gameData.rankings.find(r => {
      const cond = r.condition;
      return Object.keys(cond).every(key => {
        if (key === 'growth') return stats.growth >= cond[key];
        if (key === 'satisfaction') return stats.satisfaction >= cond[key];
        if (key === 'inflation') return stats.inflation <= cond[key];
        return true;
      });
    }) || gameData.rankings[gameData.rankings.length - 1];
    return ranking;
  };

  if (gameStatus === 'finished') {
    const ranking = getFinalRanking();
    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-8 flex items-center justify-center">
        <div className="max-w-4xl w-full bg-white rounded-3xl shadow-2xl p-8 border border-slate-100 animate-in zoom-in-95 duration-500">
          <div className="text-center mb-10">
            <FaFlagCheckered className="text-6xl text-red-600 mx-auto mb-4" />
            <h2 className="text-4xl font-black text-slate-800 mb-2">Kết Quả Mô Phỏng</h2>
            <p className="text-xl text-slate-500 font-medium">Sau 10 quyết định chiến lược</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="bg-red-50 rounded-2xl p-8 border border-red-100">
              <h3 className="text-2xl font-bold text-red-900 mb-4">{ranking.title}</h3>
              <p className="text-lg text-red-700 leading-relaxed">{ranking.description}</p>
            </div>
            <div className="space-y-4">
              <h4 className="text-sm font-bold uppercase text-slate-400 tracking-widest">Chỉ số cuối cùng</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <p className="text-xs text-slate-400 font-bold uppercase mb-1">Tăng trưởng</p>
                  <p className="text-2xl font-black text-slate-800">{stats.growth.toFixed(1)}%</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <p className="text-xs text-slate-400 font-bold uppercase mb-1">Hài lòng</p>
                  <p className="text-2xl font-black text-slate-800">{stats.satisfaction}%</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-10 overflow-hidden rounded-2xl border border-slate-100">
            <h4 className="bg-slate-100 p-4 text-sm font-bold uppercase text-slate-600">Lịch sử quyết định</h4>
            <div className="max-h-60 overflow-y-auto p-4 space-y-4">
              {history.map((h, i) => (
                <div key={i} className="flex gap-4 items-start border-b border-slate-50 pb-4 last:border-0">
                  <span className="bg-slate-200 text-slate-600 font-bold px-2 py-1 rounded text-xs">{i + 1}</span>
                  <div>
                    <p className="font-bold text-slate-800">{h.scenario}</p>
                    <p className="text-sm text-indigo-600 font-medium italic">Lựa chọn: {h.choice}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button 
            onClick={restartGame}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <FaUndo /> Làm lại từ đầu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans p-4 md:p-8">
      {/* Header */}
      <header className="max-w-6xl mx-auto mb-8 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-red-700 to-red-500 mb-2">
          Kinh tế Chính trị Mác - Lênin
        </h1>
        <div className="flex items-center justify-center gap-4">
            <p className="text-lg text-slate-500 font-medium uppercase tracking-widest">
                Lượt {currentTurn + 1} / 10
            </p>
            <div className="w-48 h-2 bg-slate-200 rounded-full overflow-hidden">
                <div 
                    className="h-full bg-red-500 transition-all duration-500" 
                    style={{ width: `${(currentTurn + 1) * 10}%` }}
                />
            </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Sidebar: Stats */}
        <div className="lg:col-span-1 space-y-6">
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-1 h-6 bg-red-600 rounded-full" />
            <h2 className="text-xl font-bold">Trạng thái Xã hội</h2>
          </div>
          <StatCard label="Tăng trưởng GDP" value={stats.growth} description="Sự gia tăng sản phẩm thặng dư xã hội." />
          <StatCard label="Tỉ lệ Lạm phát" value={stats.inflation} description="Sự biến động giá trị trao đổi hàng hóa." />
          <StatCard label="Tỉ lệ Thất nghiệp" value={stats.unemployment} description="Dự trữ đội quân lao động." />
          <StatCard label="Lòng dân (Hài lòng)" value={stats.satisfaction} unit="%" description="Mức độ đồng thuận của nhân dân." />
        </div>

        {/* Main Content: Scenarios */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100 h-full flex flex-col">
            <div className="mb-8">
                <span className="inline-block bg-red-100 text-red-700 text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full mb-4">
                    Kịch bản hiện tại
                </span>
                <h2 className="text-3xl font-black text-slate-800 mb-4">{currentScenario.title}</h2>
                <p className="text-xl text-slate-600 leading-relaxed italic">
                    "{currentScenario.description}"
                </p>
            </div>

            <div className="flex-grow space-y-4">
                {currentScenario.options.map((option, idx) => (
                    <div key={idx} className="group relative">
                        <button
                            onClick={() => handleChoice(option)}
                            className="w-full text-left p-6 rounded-2xl border-2 border-slate-100 bg-slate-50 hover:border-red-500 hover:bg-red-50/30 transition-all duration-300 flex justify-between items-center group"
                        >
                            <span className="text-lg font-bold text-slate-700 group-hover:text-red-900 transition-colors">
                                {option.text}
                            </span>
                            <FaCheckCircle className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                    </div>
                ))}
            </div>

            <div className="mt-8 pt-8 border-t border-slate-100 bg-slate-50/50 -mx-8 -mb-8 p-8 rounded-b-3xl">
                <div className="flex items-center gap-2 text-red-700 font-bold mb-2">
                    <FaBook />
                    <span className="uppercase text-xs tracking-widest">Góc nhìn Mác - Lênin</span>
                </div>
                <p className="text-sm text-slate-500 italic">
                    Tập trung vào mối quan hệ giữa lực lượng sản xuất và quan hệ sản xuất để đưa ra quyết định tối ưu.
                </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="max-w-6xl mx-auto mt-12 pt-8 border-t border-slate-200 text-center text-slate-400 text-sm">
        <p>© 2026 Học phần Kinh tế Chính trị Mác - Lênin - Mô phỏng Quản trị Xã hội</p>
      </footer>
    </div>
  );
};

export default EconomyDashboard;
