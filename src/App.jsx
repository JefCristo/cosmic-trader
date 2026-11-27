import { useState } from 'react';

function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const [resources, setResources] = useState({ credits: 10, scrap: 5, warpCores: 0 });
  const [currentOffer, setCurrentOffer] = useState(null);
  const [gameStatus, setGameStatus] = useState('playing');
  const [turn, setTurn] = useState(1);
  const [log, setLog] = useState([]);
  const [warning, setWarning] = useState('');

  const offers = [
    // --- GOOD TRADES ---
    { id: 1, alien: "Zorgon the Merchant", text: "I'll give you 1 Warp Core for 3 Scrap Metal.", cost: { credits: 0, scrap: 3 }, reward: { warpCores: 1, scrap: 0 } },
    { id: 2, alien: "The Hive Mind", text: "We require 5 Credits. We give 2 Scrap.", cost: { credits: 5, scrap: 0 }, reward: { warpCores: 0, scrap: 2 } },
    { id: 3, alien: "Captain Nova", text: "I'm low on fuel. Give me 2 Scrap, I'll give you 3 Credits.", cost: { credits: 0, scrap: 2 }, reward: { warpCores: 0, scrap: 0, credits: 3 } },
    { id: 4, alien: "The Archivist", text: "Pay 8 Credits for a rare artifact (1 Warp Core).", cost: { credits: 8, scrap: 0 }, reward: { warpCores: 1, scrap: 0 } },
    
    // --- BAD TRADES / TRAPS ---
    { id: 5, alien: "Sly Vex", text: "A 'sure thing' investment! Pay 4 Credits, get 1 Scrap.", cost: { credits: 4, scrap: 0 }, reward: { warpCores: 0, scrap: 1 } },
    { id: 6, alien: "Rusty Droid", text: "I need 2 Scrap to repair myself. I have nothing to give.", cost: { credits: 0, scrap: 2 }, reward: { warpCores: 0, scrap: 0 } },

    // --- PIRATES & DANGERS (Pay to avoid, or suffer consequences) ---
    { id: 7, alien: "Space Pirate!", text: "Pay 5 Credits to let me pass, or I'll steal a Warp Core!", cost: { credits: 5, scrap: 0 }, reward: { warpCores: 0, scrap: 0 }, punishment: { warpCores: -1, scrap: 0 }, isPirate: true },
    { id: 8, alien: "Asteroid Field!", text: "Spend 2 Scrap on repairs, or take hull damage!", cost: { credits: 0, scrap: 2 }, reward: { warpCores: 0, scrap: 0 }, punishment: { warpCores: 0, scrap: -2 }, isPirate: true },
    { id: 9, alien: "Black Hole!", text: "Burn 3 Credits on emergency thrust, or get pulled in!", cost: { credits: 3, scrap: 0 }, reward: { warpCores: 0, scrap: 0 }, punishment: { warpCores: 0, scrap: -3 }, isPirate: true },

    // --- LUCK / EVENTS ---
    { id: 10, alien: "Lucky Meteor", text: "You find floating debris! Gain 2 Scrap.", cost: { credits: 0, scrap: 0 }, reward: { warpCores: 0, scrap: 2 } },
    { id: 11, alien: "Derelict Ship", text: "You salvage a working engine! Gain 1 Warp Core.", cost: { credits: 0, scrap: 0 }, reward: { warpCores: 1, scrap: 0 } },
    { id: 12, alien: "Cosmic Tax", text: "The Galactic Federation demands a toll! Pay 2 Credits or lose 1 Scrap.", cost: { credits: 2, scrap: 0 }, reward: { warpCores: 0, scrap: 0 }, punishment: { warpCores: 0, scrap: -1 }, isPirate: true },,
  ];

  const addLog = (msg) => setLog(prev => [msg, ...prev]);

  const canAfford = (offer) => {
    return resources.credits >= offer.cost.credits && resources.scrap >= offer.cost.scrap;
  };

  const resetGame = () => {
    setResources({ credits: 10, scrap: 5, warpCores: 0 });
    setCurrentOffer(null);
    setGameStatus('playing');
    setTurn(1);
    setLog([]);
    setWarning('');
    setGameStarted(true);
  };

  const drawCard = () => {
    if (gameStatus !== 'playing') return;
    const randomOffer = offers[Math.floor(Math.random() * offers.length)];
    setCurrentOffer(randomOffer);
    setWarning('');
    addLog(`Day ${turn}: Encountered ${randomOffer.alien}.`);
  };

  const acceptTrade = () => {
    if (!currentOffer) return;
    if (!canAfford(currentOffer)) {
      setWarning("You can't afford this trade!");
      return;
    }

    const newCredits = Math.max(0, resources.credits - currentOffer.cost.credits + (currentOffer.reward.credits || 0));
    const newScrap = Math.max(0, resources.scrap - currentOffer.cost.scrap + currentOffer.reward.scrap);
    const newCores = Math.max(0, resources.warpCores + (currentOffer.reward.warpCores || 0));

    setResources({ credits: newCredits, scrap: newScrap, warpCores: newCores });
    addLog(`Accepted trade with ${currentOffer.alien}.`);
    setCurrentOffer(null);
    setWarning('');
    setTurn(t => t + 1);

    if (newCores >= 3) setGameStatus('won');
    else if (newCredits <= 0 && newScrap <= 0) setGameStatus('lost');
  };

  const declineTrade = () => {
    if (currentOffer?.isPirate && currentOffer.punishment) {
      // Applying punishment for declining a pirate
      const newCredits = Math.max(0, resources.credits + (currentOffer.punishment.credits || 0));
      const newScrap = Math.max(0, resources.scrap + (currentOffer.punishment.scrap || 0));
      const newCores = Math.max(0, resources.warpCores + (currentOffer.punishment.warpCores || 0));
      
      setResources({ credits: newCredits, scrap: newScrap, warpCores: newCores });
      addLog(`Declined ${currentOffer.alien} - suffered consequences!`);
      
      if (newCredits <= 0 && newScrap <= 0) {
        setGameStatus('lost');
      }
    } else {
      addLog('Declined the trade.');
    }
    setCurrentOffer(null);
    setWarning('');
    setTurn(t => t + 1);
  };

  if (gameStatus === 'won') return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-white">
      <h1 className="text-6xl font-bold text-green-400 mb-4 drop-shadow-[0_0_15px_rgba(74,222,128,0.8)]">🎉 You escaped!</h1>
      <p className="text-xl mb-8">You collected 3 Warp Cores and made it back to Earth.</p>
      <button onClick={resetGame} className="bg-purple-600 hover:bg-purple-500 px-8 py-3 rounded-lg font-bold text-lg transition-all hover:scale-105 shadow-lg shadow-purple-500/50">Play Again</button>
    </div>
  );

  if (gameStatus === 'lost') return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-white">
      <h1 className="text-6xl font-bold text-red-400 mb-4 drop-shadow-[0_0_15px_rgba(248,113,113,0.8)]">💀 Stranded in Space</h1>
      <p className="text-xl mb-8">You ran out of resources.</p>
      <button onClick={resetGame} className="bg-purple-600 hover:bg-purple-500 px-8 py-3 rounded-lg font-bold text-lg transition-all hover:scale-105 shadow-lg shadow-purple-500/50">Try Again</button>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-white">
      {!gameStarted ? (
        <div className="text-center max-w-lg bg-slate-900/80 backdrop-blur-sm p-10 rounded-2xl border border-purple-500/50 shadow-[0_0_30px_rgba(168,85,247,0.3)]">
          <h1 className="text-6xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">🚀 Cosmic Trader</h1>
          <p className="text-lg mb-8 text-slate-300">
            Your ship is stranded! Trade with aliens, avoid space pirates, and collect 
            <strong className="text-yellow-300"> 3 Warp Cores </strong> 
            to jump back to Earth.
          </p>
          <div className="text-left bg-black/40 p-6 rounded-xl mb-8 text-sm text-slate-300 space-y-3 border border-slate-700">
            <p>💰 <strong>Credits:</strong> Used to buy goods.</p>
            <p>🔩 <strong>Scrap:</strong> Used for repairs and trades.</p>
            <p>🌀 <strong>Warp Cores:</strong> Collect 3 to win!</p>
            <p>⚠️ <strong>Beware:</strong> Pirates will attack if you don't pay up!</p>
          </div>
          <button 
            onClick={() => setGameStarted(true)} 
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xl px-10 py-4 rounded-xl font-bold shadow-lg shadow-purple-500/50 transition-all hover:scale-105 active:scale-95"
          >
            Start Ship 🚀
          </button>
        </div>
      ) : (
        <>
          <h1 className="text-4xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">🚀 Cosmic Trader</h1>

          {/* Resource Dashboard */}
          <div className="flex flex-wrap justify-center gap-4 mb-8 text-lg bg-slate-900/80 backdrop-blur-sm p-4 rounded-xl border border-slate-700 shadow-lg">
            <span className="bg-slate-800 px-4 py-2 rounded-lg border border-slate-600">💰 Credits: <strong className="text-yellow-300">{resources.credits}</strong></span>
            <span className="bg-slate-800 px-4 py-2 rounded-lg border border-slate-600">🔩 Scrap: <strong className="text-gray-300">{resources.scrap}</strong></span>
            <span className="bg-slate-800 px-4 py-2 rounded-lg border border-purple-500/50">🌀 Warp Cores: <strong className="text-purple-300">{resources.warpCores} / 3</strong></span>
            <span className="bg-slate-800 px-4 py-2 rounded-lg border border-slate-600">📅 Day: <strong>{turn}</strong></span>
          </div>

          {/* Game Area */}
          <div className={`w-full max-w-md bg-slate-900/80 backdrop-blur-sm p-8 rounded-2xl border-2 ${currentOffer?.isPirate ? 'border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.3)]' : 'border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.3)]'} text-center min-h-[280px] flex flex-col justify-center items-center transition-all duration-300`}>
            {currentOffer ? (
              <div className="animate-float w-full">
                <h2 className={`text-3xl font-bold mb-4 ${currentOffer.isPirate ? 'text-red-400 drop-shadow-[0_0_10px_rgba(248,113,113,0.8)]' : 'text-yellow-300 drop-shadow-[0_0_10px_rgba(253,224,71,0.8)]'}`}>{currentOffer.alien}</h2>
                <p className="text-xl mb-6 text-slate-200 px-4">{currentOffer.text}</p>
                {warning && <p className="text-red-400 mb-4 font-bold animate-pulse">{warning}</p>}
                <div className="flex gap-4 justify-center">
                  <button 
                    onClick={acceptTrade} 
                    disabled={!canAfford(currentOffer)}
                    className={`px-8 py-3 rounded-lg font-bold text-lg transition-all shadow-lg ${
                      canAfford(currentOffer) 
                        ? 'bg-green-600 hover:bg-green-500 text-white hover:scale-105 active:scale-95 shadow-green-500/30' 
                        : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {currentOffer.isPirate ? 'Pay Up' : 'Accept'}
                  </button>
                  <button 
                    onClick={declineTrade} 
                    className={`px-8 py-3 rounded-lg font-bold text-lg transition-all hover:scale-105 active:scale-95 shadow-lg ${
                      currentOffer.isPirate 
                        ? 'bg-orange-600 hover:bg-orange-500 text-white shadow-orange-500/30' 
                        : 'bg-red-600 hover:bg-red-500 text-white shadow-red-500/30'
                    }`}
                  >
                    {currentOffer.isPirate ? 'Fight Back' : 'Decline'}
                  </button>
                </div>
                {currentOffer.isPirate && (
                  <p className="text-sm text-red-300 mt-4 italic">
                    ⚠️ Declining will have consequences!
                  </p>
                )}
              </div>
            ) : (
              <button onClick={drawCard} className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-2xl px-10 py-5 rounded-xl font-bold shadow-lg shadow-purple-500/50 transition-all hover:scale-105 active:scale-95 animate-float">
                Draw Alien Card 🃏
              </button>
            )}
          </div>

          {/* Ship's Log */}
          <div className="mt-8 w-full max-w-md bg-black/40 backdrop-blur-sm p-4 rounded-xl border border-slate-700 h-48 overflow-y-auto shadow-inner">
            <h3 className="text-lg font-bold mb-2 text-purple-400 sticky top-0 bg-black/80 p-2 rounded">📜 Ship's Log</h3>
            <ul className="text-sm text-slate-300 space-y-2 px-2">
              {log.map((entry, index) => (
                <li key={index} className="border-b border-slate-800 pb-1 last:border-0">- {entry}</li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}

export default App;