import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Target, Home, Trophy, AlertTriangle, History, X, Sparkles, Flame, Crosshair } from 'lucide-react';

// --- ABIFUNKTSIOON ---
const formatDate = (timestamp) => {
  return new Intl.DateTimeFormat('et-EE', { 
    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' 
  }).format(new Date(timestamp));
};

export default function App() {
  const [view, setView] = useState('menu'); 
  const [highScores, setHighScores] = useState({ classic: null, target: 0 });
  const [scoreHistory, setScoreHistory] = useState({ classic: [], target: [] });
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const savedScores = localStorage.getItem('neonHighScores');
    const savedHistory = localStorage.getItem('neonHistory');
    if (savedScores) setHighScores(JSON.parse(savedScores));
    if (savedHistory) setScoreHistory(JSON.parse(savedHistory));
  }, []);

  const saveResult = (mode, score) => {
    const newScores = { ...highScores };
    if (mode === 'classic') {
      if (!newScores.classic || score < newScores.classic) newScores.classic = score;
    } else {
      if (score > newScores.target) newScores.target = score;
    }
    setHighScores(newScores);
    localStorage.setItem('neonHighScores', JSON.stringify(newScores));

    const newHistory = { ...scoreHistory };
    newHistory[mode] = [{ score, date: Date.now() }, ...newHistory[mode]].slice(0, 15);
    setScoreHistory(newHistory);
    localStorage.setItem('neonHistory', JSON.stringify(newHistory));
  };

  return (
    <div className="min-h-screen bg-[#070b19] text-slate-50 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      
      {/* Rikkalik animeeritud taust */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_20%,transparent_100%)] pointer-events-none" />
      
      <motion.div 
        animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }} 
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} 
        className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-cyan-600/30 rounded-full blur-[120px] pointer-events-none" 
      />
      <motion.div 
        animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.2, 0.1] }} 
        transition={{ duration: 10, repeat: Infinity, delay: 2, ease: "easeInOut" }} 
        className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-fuchsia-600/30 rounded-full blur-[120px] pointer-events-none" 
      />

      <AnimatePresence mode="wait">
        {view === 'menu' && (
          <MainMenu 
            key="menu" 
            onSelect={setView} 
            highScores={highScores}
            onOpenHistory={() => setShowHistory(true)}
          />
        )}
        {view === 'classic' && (
          <ClassicMode 
            key="classic" 
            onBack={() => setView('menu')} 
            onSaveScore={(s) => saveResult('classic', s)} 
            best={highScores.classic}
          />
        )}
        {view === 'target' && (
          <TargetRushMode 
            key="target" 
            onBack={() => setView('menu')} 
            onSaveScore={(s) => saveResult('target', s)} 
            best={highScores.target}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showHistory && (
          <HistoryModal 
            onClose={() => setShowHistory(false)} 
            history={scoreHistory} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// --- MAIN MENU ---
function MainMenu({ onSelect, highScores, onOpenHistory }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, y: -50 }}
      className="z-10 flex flex-col items-center max-w-xl w-full relative"
    >
      <div className="relative mb-12 text-center">
        <Sparkles className="absolute -top-6 -right-12 text-yellow-400 animate-pulse drop-shadow-[0_0_15px_rgba(250,204,21,0.8)]" size={32} />
        <Sparkles className="absolute -bottom-2 -left-8 text-cyan-400 animate-pulse drop-shadow-[0_0_15px_rgba(34,211,238,0.8)]" size={24} />
        <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-br from-white via-cyan-300 to-fuchsia-500 drop-shadow-[0_0_20px_rgba(6,182,212,0.5)] py-2">
          REAKTSIOONIMÄNG
        </h1>
        <div className="h-1 w-32 bg-gradient-to-r from-transparent via-cyan-400 to-transparent mx-auto rounded-full" />
      </div>

      <div className="grid grid-cols-1 gap-6 w-full">
        <MenuCard 
          icon={<Zap size={32} />}
          title="Klassikaline"
          desc="Oota rohelist tuld ja kliki!"
          color="cyan"
          bestScore={highScores.classic ? `${highScores.classic} ms` : null}
          onClick={() => onSelect('classic')}
        />

        <MenuCard 
          icon={<Crosshair size={32} />}
          title="Sihtmärgid"
          desc="Kogu kombosid, hävita sihtmärke"
          color="fuchsia"
          bestScore={highScores.target ? `${highScores.target} p` : null}
          onClick={() => onSelect('target')}
        />

        <motion.button
          whileHover={{ scale: 1.03, backgroundColor: 'rgba(30, 41, 59, 0.9)' }}
          whileTap={{ scale: 0.98 }}
          onClick={onOpenHistory}
          className="mt-4 flex items-center justify-center gap-3 p-5 rounded-2xl bg-slate-800/60 border border-slate-700/50 shadow-lg backdrop-blur-xl transition-all text-slate-300 group"
        >
          <History size={24} className="group-hover:text-cyan-400 transition-colors" />
          <span className="font-bold text-lg tracking-wide uppercase">Tulemuste ajalugu</span>
        </motion.button>
      </div>
    </motion.div>
  );
}

function MenuCard({ icon, title, desc, color, bestScore, onClick }) {
  const isCyan = color === 'cyan';
  const borderFocus = isCyan ? 'group-hover:border-cyan-400' : 'group-hover:border-fuchsia-400';
  const shadowFocus = isCyan ? 'group-hover:shadow-[0_0_40px_rgba(6,182,212,0.3)]' : 'group-hover:shadow-[0_0_40px_rgba(217,70,239,0.3)]';
  const bgIcon = isCyan ? 'bg-cyan-500/20 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.5)]' : 'bg-fuchsia-500/20 text-fuchsia-300 shadow-[0_0_15px_rgba(217,70,239,0.5)]';
  const gradientHover = isCyan ? 'from-cyan-500/10' : 'from-fuchsia-500/10';

  return (
    <motion.button
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`group relative flex items-center justify-between p-6 bg-slate-900/60 border border-slate-700/60 rounded-3xl overflow-hidden ${borderFocus} ${shadowFocus} transition-all duration-300 backdrop-blur-xl`}
    >
      <div className={`absolute inset-0 bg-gradient-to-r ${gradientHover} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
      <div className="flex items-center gap-5 relative z-10">
        <div className={`p-4 rounded-2xl ${bgIcon}`}>
          {icon}
        </div>
        <div className="text-left">
          <h2 className="text-3xl font-black text-white mb-1 tracking-tight">{title}</h2>
          <p className="text-slate-400 font-semibold">{desc}</p>
        </div>
      </div>
      {bestScore && (
        <div className="text-right relative z-10 bg-slate-950/50 p-3 rounded-xl border border-slate-800">
          <p className={`text-[10px] ${isCyan ? 'text-cyan-400' : 'text-fuchsia-400'} font-black tracking-widest uppercase mb-1`}>Parim</p>
          <p className="text-xl font-black text-white">{bestScore}</p>
        </div>
      )}
    </motion.button>
  );
}

// --- HISTORY MODAL ---
function HistoryModal({ onClose, history }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="absolute inset-0 z-50 flex items-center justify-center bg-[#070b19]/90 backdrop-blur-xl p-4"
    >
      <motion.div 
        initial={{ y: 50, scale: 0.95 }} animate={{ y: 0, scale: 1 }} exit={{ y: 50, scale: 0.95 }}
        className="bg-slate-900/80 border border-slate-700 rounded-[2rem] p-8 w-full max-w-3xl max-h-[85vh] flex flex-col shadow-[0_0_80px_rgba(0,0,0,0.8)] relative"
      >
        <button onClick={onClose} className="absolute top-6 right-6 p-3 bg-slate-800 rounded-full hover:bg-red-500/20 hover:text-red-400 text-slate-300 transition-colors border border-slate-700">
          <X size={24} />
        </button>
        <h2 className="text-4xl font-black mb-8 flex items-center gap-4 border-b border-slate-800 pb-6">
          <History className="text-cyan-400" size={36} /> Tulemuste Ajalugu
        </h2>
        
        <div className="flex-1 overflow-y-auto pr-4 grid grid-cols-1 md:grid-cols-2 gap-8 custom-scrollbar">
          <div>
            <h3 className="text-2xl font-black text-cyan-400 mb-6 flex items-center gap-3 bg-cyan-950/30 p-4 rounded-2xl border border-cyan-900/50">
              <Zap size={24} /> Klassikaline
            </h3>
            {history.classic.length === 0 ? <p className="text-slate-500 font-bold p-4 text-center bg-slate-800/30 rounded-xl">Ajalugu puudub</p> : (
              <ul className="space-y-3">
                {history.classic.map((item, i) => (
                  <li key={i} className="flex justify-between items-center bg-slate-800/40 p-4 rounded-xl border border-slate-700/50 hover:bg-slate-700/50 transition-colors">
                    <span className="text-slate-400 font-semibold">{formatDate(item.date)}</span>
                    <span className="font-black text-xl text-white bg-slate-950 px-3 py-1 rounded-lg shadow-inner">{item.score} ms</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <h3 className="text-2xl font-black text-fuchsia-400 mb-6 flex items-center gap-3 bg-fuchsia-950/30 p-4 rounded-2xl border border-fuchsia-900/50">
              <Crosshair size={24} /> Sihtmärgid
            </h3>
            {history.target.length === 0 ? <p className="text-slate-500 font-bold p-4 text-center bg-slate-800/30 rounded-xl">Ajalugu puudub</p> : (
              <ul className="space-y-3">
                {history.target.map((item, i) => (
                  <li key={i} className="flex justify-between items-center bg-slate-800/40 p-4 rounded-xl border border-slate-700/50 hover:bg-slate-700/50 transition-colors">
                    <span className="text-slate-400 font-semibold">{formatDate(item.date)}</span>
                    <span className="font-black text-xl text-white bg-slate-950 px-3 py-1 rounded-lg shadow-inner">{item.score} p</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// --- CLASSIC MODE ---
function ClassicMode({ onBack, onSaveScore, best }) {
  const [gameState, setGameState] = useState('idle');
  const [startTime, setStartTime] = useState(0);
  const [reactionTime, setReactionTime] = useState(null);
  const timeoutRef = useRef(null);

  const startGame = () => {
    setGameState('waiting');
    setReactionTime(null);
    const delay = Math.floor(Math.random() * 3000) + 2000;
    timeoutRef.current = setTimeout(() => {
      setGameState('ready');
      setStartTime(Date.now());
    }, delay);
  };

  const handleClick = () => {
    if (gameState === 'idle' || gameState === 'result' || gameState === 'early') {
      startGame();
    } else if (gameState === 'waiting') {
      clearTimeout(timeoutRef.current);
      setGameState('early');
    } else if (gameState === 'ready') {
      const time = Date.now() - startTime;
      setReactionTime(time);
      setGameState('result');
      onSaveScore(time);
    }
  };

  useEffect(() => {
    return () => clearTimeout(timeoutRef.current);
  }, []);

  // UI Teemad erinevate olekute jaoks
  const getTheme = () => {
    switch(gameState) {
      case 'idle': return 'bg-slate-900/80 border-slate-700 shadow-[0_0_50px_rgba(0,0,0,0.5)]';
      case 'waiting': return 'bg-red-600 border-red-400 shadow-[0_0_150px_rgba(220,38,38,0.8)] scale-105';
      case 'ready': return 'bg-green-500 border-green-300 shadow-[0_0_200px_rgba(34,197,94,1)] scale-110';
      case 'early': return 'bg-orange-600 border-orange-400 shadow-[0_0_100px_rgba(234,88,12,0.8)]';
      case 'result': return 'bg-slate-900 border-cyan-500 shadow-[0_0_100px_rgba(6,182,212,0.5)]';
      default: return 'bg-slate-900 border-slate-700';
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="absolute inset-0 z-20 flex flex-col items-center justify-center cursor-pointer select-none bg-[#070b19]"
      onMouseDown={handleClick}
    >
      <button onClick={(e) => { e.stopPropagation(); onBack(); }} className="absolute top-6 left-6 p-4 bg-slate-900/80 rounded-full text-slate-400 hover:text-white hover:bg-slate-700 hover:scale-110 transition-all z-50 backdrop-blur-md border border-slate-700 shadow-lg">
        <Home size={28} />
      </button>

      {/* Rikkalik mänguala */}
      <div className={`relative flex flex-col items-center justify-center w-[90vw] max-w-2xl h-[60vh] rounded-[3rem] border-4 transition-all duration-300 ease-out ${getTheme()}`}>
        
        {/* Sisemine gradient/tekstuur */}
        <div className="absolute inset-0 rounded-[2.8rem] bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
        
        {gameState === 'idle' && (
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} transition={{ repeat: Infinity, duration: 1.5, repeatType: 'reverse' }} className="text-center z-10">
            <Zap size={80} className="mx-auto mb-6 text-cyan-400 drop-shadow-[0_0_20px_rgba(6,182,212,0.8)]" />
            <h2 className="text-5xl font-black text-white mb-2">Valmis?</h2>
            <p className="font-bold tracking-widest text-slate-300 uppercase text-lg bg-slate-950/50 px-6 py-2 rounded-full mt-4">Kliki ekraanile</p>
          </motion.div>
        )}
        
        {gameState === 'waiting' && (
          <div className="text-center z-10">
            <h2 className="text-7xl font-black uppercase tracking-widest text-white drop-shadow-md">Oota...</h2>
          </div>
        )}
        
        {gameState === 'ready' && (
          <div className="text-center z-10">
            <h2 className="text-8xl font-black uppercase tracking-widest text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.8)]">KLIKI!</h2>
          </div>
        )}
        
        {gameState === 'early' && (
          <div className="text-center z-10">
            <AlertTriangle size={80} className="mx-auto mb-6 text-white drop-shadow-md" />
            <h2 className="text-5xl font-black text-white mb-4">Liiga vara!</h2>
            <p className="font-bold tracking-widest text-orange-200 uppercase text-lg bg-black/30 px-6 py-2 rounded-full">Kliki uuesti</p>
          </div>
        )}
        
        {gameState === 'result' && (
          <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} type="spring" className="text-center z-10">
            <p className="text-slate-400 text-sm uppercase tracking-widest mb-2 font-bold">Reageerimisaeg</p>
            <h2 className="text-7xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-cyan-300 to-blue-600 drop-shadow-[0_0_30px_rgba(6,182,212,0.8)] mb-8">
              {reactionTime} <span className="text-4xl text-cyan-500">ms</span>
            </h2>
            {best && (
              <div className="inline-flex items-center gap-3 bg-slate-950/80 px-8 py-4 rounded-full border border-slate-700 shadow-xl">
                <Trophy size={24} className="text-yellow-500 drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]" /> 
                <span className="text-slate-300 font-bold uppercase tracking-wide">Parim:</span>
                <strong className="text-2xl text-white font-black">{best} ms</strong>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {gameState === 'result' && (
        <p className="absolute bottom-10 text-slate-500 font-bold text-lg animate-pulse uppercase tracking-widest">Kliki uuesti</p>
      )}
    </motion.div>
  );
}

// --- TARGET RUSH MODE ---
function TargetRushMode({ onBack, onSaveScore, best }) {
  const GAME_DURATION = 30;
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [score, setScore] = useState(0);
  const [target, setTarget] = useState(null);
  
  const [combo, setCombo] = useState(0);
  const [floatingTexts, setFloatingTexts] = useState([]);

  const spawnTarget = useCallback(() => {
    const x = Math.floor(Math.random() * 70) + 15;
    const y = Math.floor(Math.random() * 60) + 20; 
    setTarget({ x, y, spawnTime: Date.now(), id: Math.random() });
  }, []);

  const startGame = () => {
    setIsPlaying(true);
    setScore(0);
    setCombo(0);
    setFloatingTexts([]);
    setTimeLeft(GAME_DURATION);
    spawnTarget();
  };

  const handleTargetClick = (e) => {
    e.stopPropagation();
    if (!isPlaying) return;

    const reactTime = Date.now() - target.spawnTime;
    let basePoints = Math.max(50, 1000 - reactTime);
    
    const comboMultiplier = 1 + (combo * 0.1); 
    const finalPoints = Math.floor(basePoints * comboMultiplier);
    
    setScore(prev => prev + finalPoints);
    setCombo(prev => prev + 1);

    const newText = { id: Date.now(), x: target.x, y: target.y, val: finalPoints, isCombo: combo > 2 };
    setFloatingTexts(prev => [...prev, newText]);
    
    setTimeout(() => {
      setFloatingTexts(prev => prev.filter(t => t.id !== newText.id));
    }, 1000);

    spawnTarget();
  };

  const handleMissClick = () => {
    if (isPlaying) setCombo(0);
  };

  // 1. TAIMERI PARANDUS: Taimer sõltub nüüd vaid isPlaying olekust ja ei lähtestu skoori uuenemisel
  useEffect(() => {
    let timer;
    if (isPlaying && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying]); 

  // Mängu lõppemise loogika eraldi
  useEffect(() => {
    if (timeLeft === 0 && isPlaying) {
      setIsPlaying(false);
      onSaveScore(score);
      setTarget(null);
    }
  }, [timeLeft, isPlaying, score, onSaveScore]);

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="absolute inset-0 z-20 flex flex-col bg-[#070b19]"
    >
      {/* HUD Bar */}
      <div className="flex justify-between items-start p-6 z-10 pointer-events-none w-full max-w-6xl mx-auto">
        <button onClick={(e) => { e.stopPropagation(); onBack(); }} className="pointer-events-auto p-4 bg-slate-900/80 border border-slate-700 hover:bg-slate-700 hover:scale-110 rounded-full text-slate-300 transition-all backdrop-blur-xl shadow-lg">
          <Home size={28} />
        </button>
        
        <div className="flex gap-10 bg-slate-900/80 border border-slate-700 px-10 py-4 rounded-[2rem] backdrop-blur-xl shadow-[0_0_30px_rgba(0,0,0,0.5)]">
          <div className="text-center">
            <p className="text-xs text-slate-400 uppercase tracking-widest font-black mb-1">Aeg</p>
            <p className={`text-4xl font-black ${timeLeft <= 5 ? 'text-red-500 animate-pulse drop-shadow-[0_0_15px_rgba(239,68,68,0.8)]' : 'text-white'}`}>
              00:{timeLeft.toString().padStart(2, '0')}
            </p>
          </div>
          <div className="w-[2px] bg-slate-700 rounded-full" />
          <div className="text-center min-w-[100px]">
            <p className="text-xs text-slate-400 uppercase tracking-widest font-black mb-1">Skoor</p>
            <p className="text-4xl font-black text-fuchsia-400 drop-shadow-[0_0_15px_rgba(217,70,239,0.8)]">{score}</p>
          </div>
        </div>

        <div className={`w-32 text-right transition-opacity duration-300 ${combo > 1 ? 'opacity-100' : 'opacity-0'}`}>
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-orange-600/20 to-red-600/20 text-orange-400 px-5 py-3 rounded-2xl border border-orange-500/50 shadow-[0_0_20px_rgba(249,115,22,0.4)]">
            <Flame size={24} className={combo > 5 ? 'animate-bounce text-red-500' : ''} />
            <span className="font-black text-2xl">{combo}x</span>
          </div>
        </div>
      </div>

      <div className="absolute inset-0 cursor-crosshair overflow-hidden" onMouseDown={handleMissClick}>
        
        {!isPlaying && timeLeft === GAME_DURATION && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#070b19]/80 backdrop-blur-md z-30">
            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="text-center bg-slate-900/80 p-12 rounded-[3rem] border border-slate-700 shadow-2xl backdrop-blur-xl">
              <div className="relative inline-block mb-8">
                <Crosshair size={100} className="text-fuchsia-500 drop-shadow-[0_0_40px_rgba(217,70,239,0.8)]" />
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 8, ease: "linear" }} className="absolute inset-0 border-[4px] border-dashed border-fuchsia-500/40 rounded-full scale-[1.3]" />
              </div>
              <h2 className="text-6xl font-black mb-4 tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-purple-600">SIHTMÄRGID</h2>
              <p className="text-slate-400 mb-10 max-w-md mx-auto text-lg font-semibold">Kliki märklaudadele nii kiiresti kui suudad. Mööda klikkides kaotad oma kombo kordaja!</p>
              <motion.button 
                whileHover={{ scale: 1.05, boxShadow: "0 0 50px rgba(217,70,239,0.6)" }}
                whileTap={{ scale: 0.95 }}
                onClick={startGame}
                className="pointer-events-auto px-14 py-6 bg-gradient-to-r from-fuchsia-600 to-purple-700 rounded-full text-2xl font-black uppercase tracking-widest text-white shadow-[0_0_30px_rgba(217,70,239,0.4)] transition-all border border-fuchsia-400/50"
              >
                Alusta
              </motion.button>
            </motion.div>
          </div>
        )}

        {!isPlaying && timeLeft === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#070b19]/90 backdrop-blur-xl z-30">
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center bg-slate-900/90 border border-slate-700 p-16 rounded-[3rem] shadow-[0_0_100px_rgba(0,0,0,0.8)]">
              <h2 className="text-4xl font-black text-white mb-2">Aeg on läbi!</h2>
              <p className="text-slate-500 mb-6 uppercase tracking-widest font-black">Lõppskoor</p>
              <h1 className="text-8xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-fuchsia-400 to-purple-600 mb-10 drop-shadow-[0_0_40px_rgba(217,70,239,0.5)]">
                {score}
              </h1>
              {best > 0 && (
                <div className="flex items-center justify-center gap-3 mb-12 text-slate-300 bg-slate-950/80 px-8 py-4 rounded-full border border-slate-700 shadow-xl inline-flex mx-auto">
                  <Trophy size={24} className="text-yellow-500 drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]"/> 
                  <span className="font-bold uppercase tracking-wide">Parim tulemus:</span>
                  <span className="text-2xl text-white font-black">{Math.max(score, best)}</span>
                </div>
              )}
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startGame}
                className="pointer-events-auto px-12 py-5 bg-slate-800 hover:bg-slate-700 border-2 border-fuchsia-500/50 rounded-full text-xl font-black text-white uppercase tracking-widest transition-colors shadow-[0_0_30px_rgba(217,70,239,0.2)]"
              >
                Mängi Uuesti
              </motion.button>
            </motion.div>
          </div>
        )}

        <AnimatePresence>
          {floatingTexts.map(ft => (
            <motion.div
              key={ft.id}
              initial={{ opacity: 1, y: 0, scale: 0.5 }}
              animate={{ opacity: 0, y: -80, scale: 1.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className={`absolute pointer-events-none font-black text-3xl z-40 ${ft.isCombo ? 'text-orange-400 drop-shadow-[0_0_20px_rgba(249,115,22,1)]' : 'text-fuchsia-300 drop-shadow-[0_0_15px_rgba(217,70,239,0.8)]'}`}
              style={{ left: `${ft.x}%`, top: `${ft.y}%`, transform: 'translate(-50%, -50%)' }}
            >
              +{ft.val}
            </motion.div>
          ))}
        </AnimatePresence>

        <AnimatePresence>
          {isPlaying && target && (
            <motion.div
              key={target.id}
              initial={{ scale: 0, opacity: 0, rotate: -90 }}
              animate={{ scale: [0, 1.3, 1], opacity: 1, rotate: 0 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", duration: 0.5, bounce: 0.6 }}
              className="absolute w-32 h-32 -ml-16 -mt-16 rounded-full flex items-center justify-center z-20 group pointer-events-none"
              style={{ top: `${target.y}%`, left: `${target.x}%` }}
            >
              <div className="absolute inset-0 rounded-full bg-fuchsia-500/20 animate-ping opacity-70" />
              
              {/* 2. HITBOXI PARANDUS: Kliki funktsioon asub nüüd visuaalsel elemendil endal, mille suuruseks on täpne w-20 h-20 */}
              <div 
                onMouseDown={handleTargetClick}
                className="relative w-20 h-20 rounded-full bg-gradient-to-br from-fuchsia-400 via-purple-500 to-indigo-600 flex items-center justify-center shadow-[0_0_40px_rgba(217,70,239,1)] hover:scale-90 transition-transform border-2 border-white/20 cursor-crosshair pointer-events-auto"
              >
                <div className="w-8 h-8 rounded-full border-[4px] border-white/60 flex items-center justify-center pointer-events-none">
                  <div className="w-3 h-3 bg-white rounded-full shadow-[0_0_15px_white]" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}