import { FC } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { toast } from "sonner";
import { IconWallet } from "@tabler/icons-react";

export const WalletButton: FC = () => {
  const { wallet, connecting, connected, disconnect } = useWallet();

  return (
    <div className="relative">
      <WalletMultiButton className="!bg-gradient-to-r !from-jingold !to-jingold-dark hover:!from-jingold-light hover:!to-jingold !transition-all !duration-300 !rounded-lg !px-6 !py-3 !text-jinblack !font-semibold !shadow-lg !border-0 !neo-button-style" />

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .wallet-adapter-button {
          background: linear-gradient(145deg, #D4AF37, #B4943F) !important;
          border: none !important;
          border-radius: 12px !important;
          color: #0A0A0A !important;
          font-weight: 600 !important;
          padding: 12px 24px !important;
          box-shadow: 
            0 4px 15px rgba(212, 175, 55, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.3),
            inset 0 -1px 0 rgba(0, 0, 0, 0.2) !important;
          transition: all 0.2s ease !important;
        }
        
        .wallet-adapter-button:hover {
          transform: translateY(-2px) !important;
          box-shadow: 
            0 8px 25px rgba(212, 175, 55, 0.4),
            inset 0 1px 0 rgba(255, 255, 255, 0.4),
            inset 0 -1px 0 rgba(0, 0, 0, 0.3) !important;
        }
        
        .wallet-adapter-button:active {
          transform: translateY(0) !important;
          box-shadow: 
            0 2px 8px rgba(212, 175, 55, 0.3),
            inset 0 1px 3px rgba(0, 0, 0, 0.3) !important;
        }
        
        .wallet-adapter-button-trigger {
          background: linear-gradient(145deg, #D4AF37, #B4943F) !important;
          border: none !important;
          border-radius: 12px !important;
          color: #0A0A0A !important;
        }
        
        .wallet-adapter-modal-wrapper {
          background: rgba(0, 0, 0, 0.8) !important;
          backdrop-filter: blur(10px) !important;
        }
        
        .wallet-adapter-modal {
          background: linear-gradient(145deg, rgba(20, 20, 20, 0.95), rgba(5, 5, 5, 0.95)) !important;
          border: 1px solid rgba(212, 175, 55, 0.2) !important;
          border-radius: 16px !important;
          box-shadow: 
            0 8px 32px rgba(0, 0, 0, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.1) !important;
        }
        
        .wallet-adapter-modal-title {
          color: #D4AF37 !important;
          font-family: 'Orbitron', monospace !important;
          font-weight: 600 !important;
        }
        
        .wallet-adapter-modal-list {
          background: transparent !important;
        }
        
        .wallet-adapter-modal-list-item {
          background: rgba(212, 175, 55, 0.1) !important;
          border: 1px solid rgba(212, 175, 55, 0.2) !important;
          border-radius: 8px !important;
          margin-bottom: 8px !important;
        }
        
        .wallet-adapter-modal-list-item:hover {
          background: rgba(212, 175, 55, 0.2) !important;
        }
      `,
        }}
      />
    </div>
  );
};
