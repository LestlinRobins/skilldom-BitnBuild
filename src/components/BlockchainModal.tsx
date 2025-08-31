import React, { useState, useEffect } from 'react';
import { X, Shield, CheckCircle, Loader } from 'lucide-react';

interface BlockchainModalProps {
  onClose: () => void;
}

const BlockchainModal: React.FC<BlockchainModalProps> = ({ onClose }) => {
  const [stage, setStage] = useState<'verifying' | 'processing' | 'success'>('verifying');

  useEffect(() => {
    const timer1 = setTimeout(() => setStage('processing'), 2000);
    const timer2 = setTimeout(() => setStage('success'), 4000);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-primary-800 rounded-xl w-full max-w-md p-6 animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Blockchain Verification</h2>
          {stage === 'success' && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="text-center space-y-4">
          {stage === 'verifying' && (
            <>
              <div className="inline-flex items-center justify-center w-16 h-16 bg-accent-500/20 rounded-full mb-4">
                <Loader className="text-accent-400 animate-spin" size={32} />
              </div>
              <h3 className="text-lg font-bold text-white">Verifying Session</h3>
              <p className="text-gray-300">Validating your learning progress on the blockchain...</p>
            </>
          )}

          {stage === 'processing' && (
            <>
              <div className="inline-flex items-center justify-center w-16 h-16 bg-warning-500/20 rounded-full mb-4">
                <Shield className="text-warning-400 animate-pulse" size={32} />
              </div>
              <h3 className="text-lg font-bold text-white">Processing Smart Contract</h3>
              <p className="text-gray-300">Executing skill verification and reward distribution...</p>
            </>
          )}

          {stage === 'success' && (
            <>
              <div className="inline-flex items-center justify-center w-16 h-16 bg-success-500/20 rounded-full mb-4">
                <CheckCircle className="text-success-400" size={32} />
              </div>
              <h3 className="text-lg font-bold text-white">Verification Complete!</h3>
              <p className="text-gray-300">Your skill progress has been recorded on the blockchain.</p>
              <div className="bg-primary-700/50 rounded-lg p-4 mt-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Reward Earned:</span>
                  <span className="text-accent-400 font-bold">+50 SVC</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="text-gray-400">Blockchain TX:</span>
                  <span className="text-gray-300 font-mono text-xs">0x4A7B...9F2E</span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-full bg-accent-500 hover:bg-accent-600 text-white font-medium py-3 px-4 rounded-lg transition-colors mt-4"
              >
                Continue Learning
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlockchainModal;