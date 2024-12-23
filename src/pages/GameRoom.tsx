import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useGameState } from '@/hooks/useGameState';
import BotpressKeyInput from '@/components/BotpressKeyInput';

const betOptions = [50, 100, 200, 500];

interface Player {
  address: string;
  ready: boolean;
  score?: number;
}

const GameRoom = () => {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const { gameState, handleAnswer } = useGameState(gameId || '');
  const [betAmount, setBetAmount] = useState<number>(50);
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [gameStarted, setGameStarted] = useState(false);
  const [showContinueButton, setShowContinueButton] = useState(false);
  const [hasCredentials, setHasCredentials] = useState(
    !!localStorage.getItem('BOTPRESS_API_KEY') && !!localStorage.getItem('BOTPRESS_BOT_ID')
  );

  useEffect(() => {
    // Simulate players joining
    const mockPlayers = [
      { address: 'DUDeMYmrSztkLVfmN5gGkGA6cacPvZ8xYyDJw3DmQR83', ready: true, score: 0 },
      { address: 'GkiKqSVfnU2y4TeUW7up2JS9Z8g1yjGYJ8x2QNf4K6Y', ready: true, score: 0 },
      { address: 'B9N2mNXjmhMdMiWj8W2TyLqwf1RtC5uQXWi6qEuYBjXC', ready: true, score: 0 },
      { address: 'F866Kc1Fs323QaNV3ji6brzPTRyRvV7ZwLFFhSK6T2N2', ready: true, score: 0 },
    ];
    
    setTimeout(() => {
      setPlayers(mockPlayers);
      setIsLoading(false);
      setShowContinueButton(true);
    }, 1500);
  }, []);

  const handleStartGame = () => {
    setGameStarted(true);
    setShowContinueButton(false);
  };

  if (!hasCredentials) {
    return <BotpressKeyInput onKeySet={() => setHasCredentials(true)} />;
  }

  if (gameState.showResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-jinblack via-jingold/20 to-jinblack text-white p-6 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-8 max-w-lg w-full"
        >
          <h2 className="text-3xl font-bold mb-6 jin-heading text-center">Quiz Results</h2>
          <p className="text-xl text-center mb-4">
            Your Score: {gameState.score} points!
          </p>
          <div className="flex justify-center">
            <Button
              onClick={() => navigate('/')}
              className="btn-connect mt-4"
            >
              Return to Home
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (gameStarted && gameState.questions.length > 0) {
    const currentQuestion = gameState.questions[gameState.currentQuestionIndex];
    return (
      <div className="min-h-screen bg-gradient-to-br from-jinblack via-jingold/20 to-jinblack text-white p-6 flex">
        {/* Leaderboard Section */}
        <div className="w-1/4 glass-card p-4 mr-4">
          <h3 className="text-xl font-bold mb-4 jin-heading">Leaderboard</h3>
          <div className="space-y-2">
            {players.sort((a, b) => (b.score || 0) - (a.score || 0)).map((player, index) => (
              <div key={index} className="glass-card p-2 flex justify-between items-center">
                <span className="truncate">{player.address}</span>
                <span className="font-bold">{player.score || 0}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quiz Section */}
        <div className="w-3/4 glass-card p-6">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Question {gameState.currentQuestionIndex + 1}</h2>
            <div className="space-y-4">
              <p className="text-lg">{currentQuestion.text}</p>
              <div className="grid grid-cols-2 gap-4">
                {currentQuestion.options.map((option, index) => (
                  <Button
                    key={index}
                    onClick={() => handleAnswer(index)}
                    variant="outline"
                    className="p-4 text-left hover:bg-jingold hover:text-jinblack transition-all duration-300"
                  >
                    {option}
                  </Button>
                ))}
              </div>
              <div className="mt-4">
                <Progress 
                  value={gameState.timeLeft * 10} 
                  className="h-2 bg-gray-700"
                  indicatorClassName="bg-gradient-to-r from-jingold to-jingold-light"
                />
                <p className="text-center mt-2">{gameState.timeLeft} seconds remaining</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-jinblack via-jingold/20 to-jinblack text-white p-6">
      <div className="max-w-4xl mx-auto pt-20">
        <motion.div
          className="glass-card p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-3xl font-bold mb-8 jin-heading text-center">
            Game Room
          </h2>

          <div className="mb-8">
            <h3 className="text-xl mb-4">Select Bet Amount</h3>
            <div className="flex gap-4">
              {betOptions.map((amount) => (
                <button
                  key={amount}
                  className={`px-6 py-3 rounded-lg transition-all duration-300 ${
                    betAmount === amount
                      ? 'bg-jingold text-jinblack'
                      : 'bg-black/30 hover:bg-black/50'
                  }`}
                  onClick={() => setBetAmount(amount)}
                >
                  ${amount}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl mb-4">Players</h3>
            {isLoading ? (
              <div className="animate-pulse space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-12 bg-black/30 rounded-lg" />
                ))}
              </div>
            ) : (
              <>
                {players.map((player, index) => (
                  <motion.div
                    key={index}
                    className="glass-card p-4 flex justify-between items-center"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <span>{player.address}</span>
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${
                        player.ready
                          ? 'bg-green-500/20 text-green-300'
                          : 'bg-yellow-500/20 text-yellow-300'
                      }`}
                    >
                      {player.ready ? 'Ready' : 'Waiting'}
                    </span>
                  </motion.div>
                ))}
                {showContinueButton && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-8 flex justify-center"
                  >
                    <Button
                      onClick={handleStartGame}
                      className="btn-connect"
                    >
                      Click to Continue
                    </Button>
                  </motion.div>
                )}
              </>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default GameRoom;
