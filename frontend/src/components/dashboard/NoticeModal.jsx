// src/components/dashboard/NoticeModal.jsx
import React from "react";

const NoticeModal = ({ isOpen, onClose, notice, onDelete }) => {
  if (!isOpen || !notice) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-gray-800 p-6 flex justify-between items-center text-white shrink-0">
          <h3 className="text-xl font-bold">Notice Details</h3>
          <button onClick={onClose} className="text-2xl hover:text-gray-400 transition">&times;</button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar space-y-5">
          <div>
            <h4 className="text-2xl font-bold text-gray-900">{notice.title}</h4>
            <p className="text-xs text-gray-500 mt-1">
              Posted on {new Date(notice.createdAt).toLocaleString()}
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">
            {notice.description}
          </div>

          {/* Display the Image if it exists */}
          {notice.image && (
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase mb-2">Attached Image</p>
              <img 
                src={notice.image} 
                alt="Notice Attachment" 
                className="w-full h-auto rounded-xl border border-gray-300 cursor-pointer hover:opacity-90 transition shadow-sm"
                onClick={() => window.open(notice.image, '_blank')} // Opens image full screen in new tab
              />
              <p className="text-[10px] text-gray-400 mt-2 text-center font-medium">Click image to view full size</p>
            </div>
          )}
        </div>


        {onDelete && (
          <div className="bg-gray-100 p-4 border-t border-gray-200 flex justify-end shrink-0">
            <button 
              onClick={() => {
                if(window.confirm("Are you sure you want to delete this notice?")) {
                  onDelete(notice._id);
                  onClose(); // Automatically close the modal after deleting
                }
              }}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-bold rounded-lg transition shadow-sm"
            >
              {/* Trash Icon SVG */}
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
              Delete Notice
            </button>
          </div>
        )}

        
      </div>
    </div>
  );
};

export default NoticeModal;