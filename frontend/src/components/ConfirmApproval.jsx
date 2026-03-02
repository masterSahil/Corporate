import React from 'react';

// A simple, reusable component for each row in the summary section.
// This keeps the main component clean and readable.
const SummaryRow = ({ label, value, isHighlight }) => (
  <div className="flex justify-between items-center py-3 border-b border-gray-800/50 last:border-0">
    <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">
      {label}
    </span>
    <span className={`text-sm font-medium ${isHighlight ? 'text-blue-400' : 'text-gray-200'}`}>
      {value}
    </span>
  </div>
);

const ConfirmApprovalModal = ({
  isOpen = true, // Controls modal visibility
  onClose,       // Function to handle the 'close' text button
  onCancel,      // Function to handle the 'CANCEL' button
  onFinalize,    // Function to handle the 'FINALIZE APPROVAL' button
  data = {       // Default data object, replace with real props
    requester: 'Charlie Davis',
    reward: 'Sony WH-1000XM5',
    points: '15,000 PTS',
  },
}) => {
  // Don't render anything if the modal is not open
  if (!isOpen) return null;

  return (
    // This outer div acts as the dark overlay background
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a0e17] font-sans">
      
      {/* The Modal Card itself */}
      <div className="w-full max-w-120 bg-[#111827] rounded-xl border border-gray-800 shadow-2xl p-6 sm:p-8 relative">

        {/* Header Section: Logo and Close button */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-2">
             {/* A simple checkmark SVG icon */}
            <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {/* Gradient text for a modern feel */}
            <span className="text-lg font-semibold text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-blue-600">
              verified
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-300 transition-colors text-sm"
          >
            close
          </button>
        </div>

        {/* Title and Descriptive Text */}
        <h2 className="text-xl font-semibold text-white mb-3">
          Confirm Approval
        </h2>
        <p className="text-sm text-gray-400 leading-relaxed mb-8">
          You are granting administrative approval for a point redemption
          request. This action will deduct points from the employee's wallet
          and initiate the procurement process.
        </p>

        {/* Data Summary Section placed in a slightly distinct container */}
        <div className="bg-[#161e2e]/50 rounded-lg p-4 mb-8 border border-gray-800/50">
          <SummaryRow label="Requester" value={data.requester} />
          <SummaryRow label="Reward" value={data.reward} />
          <SummaryRow label="Point Value" value={data.points} isHighlight />
        </div>

        {/* Action Buttons Footer */}
        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-5 py-2.5 text-sm font-medium text-gray-300 border border-gray-700 rounded-md hover:bg-gray-800/70 hover:text-white transition-all focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-offset-2 focus:ring-offset-[#111827]"
          >
            CANCEL
          </button>
          <button
            onClick={onFinalize}
            className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#111827]"
          >
            FINALIZE APPROVAL
          </button>
        </div>

      </div>
    </div>
  );
};

export default ConfirmApprovalModal;