// src/components/dashboard/ComplaintModal.jsx
import { useState } from "react";
import toast from "react-hot-toast";

// Icons (Internal components for simplicity)
const Spinner = () => <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>;

const ComplaintModal = ({ isOpen, onClose, onSubmit, userHostel }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "", category: "electrical", description: "", 
    isCommon: false, location: "", imageBase64: null,previewUrl:null
  });

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(formData); // Call parent function
      setFormData({ title: "", category: "electrical", description: "", isCommon: false, location: "", imageBase64: null, previewUrl: null }); // Reset form
      onClose();
    } catch (error) {
       // Error handled in hook
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) return toast.error("Max 5MB allowed");

      var reader = new FileReader();
      
      
      reader.onloadend = () => {
        // reader.result is the Base64 string!
        setFormData({ 
          ...formData, 
          imageBase64: reader.result,
          previewUrl: reader.result 
        });
      };
      
      reader.readAsDataURL(file);


    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 flex justify-between items-center text-white shrink-0">
          <h3 className="text-xl font-bold">File Complaint</h3>
          <button onClick={onClose} className="text-2xl hover:text-gray-200">&times;</button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto custom-scrollbar">
          <div>
            <label className="text-sm font-bold text-gray-600">Title</label>
            <input className="w-full p-3 border rounded-lg" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="e.g. Fan broken" />
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="text-sm font-bold text-gray-600">Category</label>
                <select className="w-full p-3 border rounded-lg bg-white" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                    {['electrical','plumbing','cleaning','furniture','other'].map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                </select>
             </div>
             <div>
                <label className="text-sm font-bold text-gray-600">Hostel</label>
                <input className="w-full p-3 border rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed" disabled value={userHostel || "Fetching..."} readOnly />
             </div>
          </div>

          <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg border">
            <input type="checkbox" className="w-5 h-5" checked={formData.isCommon} onChange={e => setFormData({...formData, isCommon: e.target.checked})} />
            <label className="text-gray-700 font-medium">Common Area?</label>
          </div>

          {formData.isCommon && (
             <div>
                <label className="text-sm font-bold text-gray-600">Location</label>
                <input className="w-full p-3 border rounded-lg" required value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} placeholder="e.g. Corridor" />
             </div>
          )}

          {/* Image Upload */}
          <div>
            <label className="text-sm font-bold text-gray-600 mb-1 block">Attach Image</label>
            {!formData.previewUrl ? (
                <input type="file" accept="image/*" onChange={handleImageChange} className="w-full p-2 border rounded-lg text-sm text-gray-500 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
            ) : (
                <div className="relative mt-2 inline-block">
                    <img src={formData.previewUrl} alt="Preview" className="h-24 w-24 object-cover rounded-lg border-2 border-gray-200" />
                    <button type="button" onClick={() => setFormData({...formData, imageBase64: null,previewUrl:null})} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"><TrashIcon /></button>
                </div>
            )}
          </div>

          <div>
            <label className="text-sm font-bold text-gray-600">Description</label>
            <textarea className="w-full p-3 border rounded-lg" required rows="3" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Describe issue..."></textarea>
          </div>

          <div className="flex gap-3 pt-2">
             <button type="button" onClick={onClose} className="w-1/3 py-3 rounded-lg font-bold text-gray-600 bg-gray-200 hover:bg-gray-300">Cancel</button>
             <button type="submit" disabled={isSubmitting} className={`w-2/3 py-3 rounded-lg font-bold text-white flex justify-center items-center ${isSubmitting ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'}`}>
                {isSubmitting ? <><Spinner /> Submitting...</> : "Submit"}
             </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ComplaintModal;