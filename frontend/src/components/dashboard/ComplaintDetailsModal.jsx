import { useState } from "react";

// Icons
const CheckIcon = () => <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>;

const ComplaintDetailsModal = ({ isOpen, onClose, complaint, onReopen }) => {
  const [reopenReason, setReopenReason] = useState("");
  const [showReopenForm, setShowReopenForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !complaint) return null;

  // --- 1. STATUS TRACKER LOGIC ---
  const steps = [
    { id: "pending", label: "Complaint Filed", date: complaint.createdAt },
    { 
        id: "assigned", 
        label: "Worker Assigned", 
        date: complaint.assignAt, 
        details: complaint.worker ? (
            <div className="mt-3 bg-blue-50 p-3 rounded-xl border border-blue-100 flex items-center gap-3">
                
                {/* WORKER PHOTO OR FALLBACK */}
                {complaint.worker.image ? (
                    <img 
                        src={complaint.worker.image} 
                        alt="Worker Profile" 
                        className="w-12 h-12 rounded-full object-cover border-2 border-blue-300 shadow-sm shrink-0" 
                    />
                ) : (
                    <div className="w-12 h-12 rounded-full bg-blue-200 text-blue-600 flex items-center justify-center font-bold text-lg border-2 border-blue-300 shrink-0">
                        {complaint.worker.name ? complaint.worker.name.charAt(0).toUpperCase() : 'W'}
                    </div>
                )}
                
                {/* WORKER INFO */}
                <div>
                    <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wider mb-0.5">Assigned Worker</p>
                    <h4 className="font-bold text-blue-900 text-sm leading-tight">{complaint.worker.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] bg-blue-200 text-blue-800 px-1.5 py-0.5 rounded font-medium">
                            {complaint.worker.category}
                        </span>
                        <span className="text-xs font-bold text-blue-800">
                            📞 {complaint.worker.mobNo}
                        </span>
                    </div>
                </div>

            </div>
        ) : null
    },
    { id: "resolved", label: "Issue Resolved", date: complaint.resolvedAt }
  ];

  // Determine current step index (0, 1, or 2)
  let currentStepIndex = 0;
  if (complaint.status === 'assigned') currentStepIndex = 1;
  if (complaint.status === 'resolved') currentStepIndex = 2;

  // --- 2. REOPEN DEADLINE LOGIC ---
  let deadlineDate = null;
  let canReopen = false;

  if (complaint.status === 'resolved' && complaint.resolvedAt) {
      const resolveDate = new Date(complaint.resolvedAt);
      deadlineDate = new Date(resolveDate);
      deadlineDate.setDate(resolveDate.getDate() + 10); // Add 10 days
      
      const today = new Date();
      canReopen = today <= deadlineDate;
  }

  // Handle Form Submit
  const handleReopenSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    await onReopen(complaint._id, reopenReason);
    setIsSubmitting(false);
    onClose();
  };

  console.log("Complaint Data inside Modal:", complaint);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-gray-800 p-6 flex justify-between items-center text-white shrink-0">
          <div>
            <h3 className="text-xl font-bold">Complaint Details</h3>
            <p className="text-xs text-gray-400 font-mono mt-1">ID: {complaint._id}</p>
          </div>
          <button onClick={onClose} className="text-2xl hover:text-gray-400">&times;</button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar space-y-8">
          
          {/* --- FLIPKART STYLE TRACKER --- */}
          <div className="relative pl-2">
             {/* Vertical Line */}
             <div className="absolute left-[15px] top-2 bottom-4 w-0.5 bg-gray-200"></div>
             
             <div className="space-y-8 relative">
                {steps.map((step, index) => {
                    const isCompleted = index <= currentStepIndex;
                    const isCurrent = index === currentStepIndex;

                    return (
                        <div key={step.id} className="flex gap-4 items-start relative">
                             {/* Dot / Circle */}
                             <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 border-2 ${
                                 isCompleted 
                                 ? 'bg-green-500 border-green-500' 
                                 : 'bg-white border-gray-300'
                             }`}>
                                {isCompleted && <CheckIcon />}
                             </div>
                             
                             {/* Text Content */}
                             <div className="pt-1 w-full">
                                 <h4 className={`font-bold ${isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                                     {step.label}
                                 </h4>
                                 {step.date && (
                                     <p className="text-xs text-gray-500">
                                         {new Date(step.date).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                                     </p>
                                 )}
                                 {/* Render Worker Details if visible */}
                                 {isCompleted && step.details}
                             </div>
                        </div>
                    );
                })}
             </div>
          </div>

          {/* --- COMPLAINT INFO CARD --- */}
          <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 space-y-4">
             <div className="flex justify-between items-start">
                 <div>
                     <p className="text-xs font-bold text-gray-500 uppercase">Title</p>
                     <p className="font-semibold text-gray-900 text-lg">{complaint.title}</p>
                 </div>
                 <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                    complaint.status === 'resolved' ? 'bg-green-100 text-green-700' : 
                    complaint.status === 'assigned' ? 'bg-blue-100 text-blue-700' :
                    'bg-yellow-100 text-yellow-700'
                 }`}>
                    {complaint.status}
                 </span>
             </div>
             
             <div>
                 <p className="text-xs font-bold text-gray-500 uppercase">Description</p>
                 <p className="text-gray-700 mt-1">{complaint.description}</p>
             </div>

             {complaint.image && (
                 <div>
                    <p className="text-xs font-bold text-gray-500 uppercase mb-2">Attached Image</p>
                    <img src={complaint.image} alt="Proof" className="h-32 w-auto rounded-lg border border-gray-300 hover:scale-105 transition cursor-pointer" onClick={() => window.open(complaint.image, '_blank')} />
                 </div>
             )}
          </div>

          {/* --- REOPEN SECTION --- */}
          {complaint.status === 'resolved' && (
              <div className="border-t pt-6">
                  {!showReopenForm ? (
                     <div className="flex flex-col md:flex-row justify-between items-center bg-yellow-50 p-4 rounded-lg border border-yellow-200 gap-4">
                         <div>
                             <p className="text-sm font-bold text-yellow-800">Issue not actually resolved?</p>
                             {canReopen ? (
                                 <p className="text-xs text-yellow-700">
                                     Reopen available until: <b>{deadlineDate.toLocaleDateString()}</b>
                                 </p>
                             ) : (
                                 <p className="text-xs text-red-600 font-bold">
                                     Reopen window closed on {deadlineDate.toLocaleDateString()}
                                 </p>
                             )}
                         </div>
                         {canReopen && (
                             <button 
                                onClick={() => setShowReopenForm(true)}
                                className="px-5 py-2 bg-yellow-600 text-white font-bold rounded-lg hover:bg-yellow-700 transition shadow-sm"
                             >
                                Reopen Complaint
                             </button>
                         )}
                     </div>
                  ) : (
                      <form onSubmit={handleReopenSubmit} className="bg-red-50 p-5 rounded-lg border border-red-100 animate-fadeIn">
                          <h4 className="font-bold text-red-800 mb-3">Reopen Complaint</h4>
                          <textarea 
                             className="w-full p-3 border border-red-200 rounded-lg focus:ring-2 focus:ring-red-400 outline-none bg-white"
                             rows="3"
                             required
                             placeholder="Please describe why the issue persists..."
                             value={reopenReason}
                             onChange={(e) => setReopenReason(e.target.value)}
                          ></textarea>
                          <div className="flex gap-3 mt-3 justify-end">
                              <button type="button" onClick={() => setShowReopenForm(false)} className="px-4 py-2 text-gray-600 font-bold hover:bg-white rounded-lg transition">Cancel</button>
                              <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition shadow-md">
                                  {isSubmitting ? 'Processing...' : 'Confirm Reopen'}
                              </button>
                          </div>
                      </form>
                  )}
              </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComplaintDetailsModal;