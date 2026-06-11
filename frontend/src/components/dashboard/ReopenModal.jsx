import { useState } from "react";

const ReopenModal = ({ isOpen, onClose, onSubmit, complaintId }) => {
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    await onSubmit(complaintId, reason);
    setIsSubmitting(false);
    setReason("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white w-full max-w-md rounded-xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="bg-red-600 p-4 flex justify-between items-center text-white shrink-0">
          <h3 className="font-bold">Reopen Complaint</h3>
          <button onClick={onClose} className="text-xl hover:text-red-100">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          <p className="text-sm text-gray-600">Why is the issue not resolved?</p>
          <textarea 
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-200 outline-none" 
            rows="3" 
            required 
            placeholder="Describe the issue..." 
            value={reason} 
            onChange={e => setReason(e.target.value)}
          ></textarea>
          
          <div className="flex gap-3 pt-2">
             <button type="button" onClick={onClose} className="w-1/3 py-2 rounded-lg font-bold text-gray-600 bg-gray-200 hover:bg-gray-300">Cancel</button>
             <button type="submit" disabled={isSubmitting} className="w-2/3 bg-red-600 text-white py-2 rounded-lg font-bold hover:bg-red-700">
                {isSubmitting ? "Processing..." : "Confirm Reopen"}
             </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReopenModal;