import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WalletContextProvider } from "./components/WalletProvider";
import Index from "./pages/Index";
import GameRoom from "./pages/GameRoom";
import ComingSoon from "./pages/ComingSoon";
import Leaderboard from "./pages/Leaderboard";
import Community from "./pages/Community";
import Settings from "./pages/Settings";
import Quiz from "./pages/Quiz";
import {
  Container,
  Header,
  MessageList,
  Composer,
  ComposerInput,
  ComposerButton,
  WebchatProvider,
} from "@botpress/webchat";

const queryClient = new QueryClient();

const App = () => (
  <BrowserRouter>
    <WalletContextProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/game/:gameId" element={<GameRoom />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/community" element={<Community />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/quiz" element={<Quiz />} />
          </Routes>
        </TooltipProvider>
      </QueryClientProvider>
    </WalletContextProvider>
  </BrowserRouter>
);

export default App;
