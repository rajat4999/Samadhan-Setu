import { useState, useEffect } from "react";
import toast from "react-hot-toast";

// Icons
const TrashIcon = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
const EditIcon = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>;
const PlusIcon = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>;

const ManageWorkersModal = ({ isOpen, onClose, workers, onAdd, onUpdate, onDelete }) => {
  // 'list' or 'form'
  const [view, setView] = useState('list'); 
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({ name: "", mobNo: "", category: "electrical", photoBase64: null, previewUrl: null });

  // Reset view when modal opens
  useEffect(() => {
      if (isOpen) setView('list');
  }, [isOpen]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) return toast.error("Max 5MB allowed");
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => setFormData({ ...formData, photoBase64: reader.result, previewUrl: reader.result });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingId) {
        await onUpdate(editingId, formData);
    } else {
        await onAdd(formData);
    }
    setView('list'); // Go back to list after save
  };

  const openAddForm = () => {
      setEditingId(null);
      setFormData({ name: "", mobNo: "", category: "electrical", photoBase64: null, previewUrl: null });
      setView('form');
  };

  const openEditForm = (worker) => {
      setEditingId(worker._id);
      setFormData({ name: worker.name, mobNo: worker.mobNo, category: worker.category, photoBase64: null, previewUrl: worker.image || null });
      setView('form');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-purple-800 p-5 flex justify-between items-center text-white shrink-0">
          <h3 className="font-bold text-lg">
              {view === 'list' ? 'Manage Workers' : editingId ? 'Edit Worker' : 'Add New Worker'}
          </h3>
          <button onClick={onClose} className="text-2xl hover:text-purple-200 transition">&times;</button>
        </div>

        {/* --- LIST VIEW --- */}
        {view === 'list' && (
            <div className="flex flex-col h-full overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex justify-end shrink-0">
                    <button onClick={openAddForm} className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition shadow-sm">
                        <PlusIcon /> Add New Worker
                    </button>
                </div>
                
                <div className="p-4 overflow-y-auto custom-scrollbar space-y-3 flex-1">
                    {workers.length === 0 ? <p className="text-center text-gray-500 py-10">No workers found.</p> : 
                    workers.map(w => (
                        <div key={w._id} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-xl hover:shadow-md transition">
                            <div className="flex items-center gap-4">
                                {w.image ? (
                                    <img src={w.image} alt={w.name} className="w-12 h-12 rounded-full object-cover border-2 border-purple-200" />
                                ) : (
                                    <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-lg border-2 border-purple-200">
                                        {w.name.charAt(0)}
                                    </div>
                                )}
                                <div>
                                    <h4 className="font-bold text-gray-800">{w.name}</h4>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-bold uppercase">{w.category}</span>
                                        <span className="text-xs text-gray-600 font-mono">📞 {w.mobNo}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => openEditForm(w)} className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition" title="Edit">
                                    <EditIcon />
                                </button>
                                <button onClick={() => { if(window.confirm(`Delete ${w.name}?`)) onDelete(w._id); }} className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition" title="Delete">
                                    <TrashIcon />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* --- FORM VIEW (ADD/EDIT) --- */}
        {view === 'form' && (
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto custom-scrollbar space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Name</label>
                        <input className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-purple-400 outline-none" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Mobile No</label>
                        <input className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-purple-400 outline-none" required value={formData.mobNo} onChange={e => setFormData({...formData, mobNo: e.target.value})} />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Category</label>
                    <select className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-purple-400 outline-none bg-white" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                        <option value="electrical">Electrical</option>
                        <option value="plumbing">Plumbing</option>
                        <option value="cleaning">Cleaning</option>
                        <option value="furniture">Furniture</option>
                        <option value="other">Other</option>
                    </select>
                </div>
                
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1 block">Worker Photo</label>
                    <div className="flex items-center gap-4 mt-2">
                        {formData.previewUrl && (
                            <img src={formData.previewUrl} alt="Preview" className="h-16 w-16 object-cover rounded-full border-2 border-purple-200 shrink-0" />
                        )}
                        <div className="flex-1">
                            <input type="file" accept="image/*" onChange={handleImageChange} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 transition" />
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 pt-4 border-t mt-6">
                    <button type="button" onClick={() => setView('list')} className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200 transition">Cancel</button>
                    <button type="submit" className="flex-1 py-2.5 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition">
                        {editingId ? 'Save Changes' : 'Add Worker'}
                    </button>
                </div>
            </form>
        )}

      </div>
    </div>
  );
};

export default ManageWorkersModal;