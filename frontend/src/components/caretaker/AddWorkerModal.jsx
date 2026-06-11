import { useState } from "react";
import toast from "react-hot-toast";


const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>;


const AddWorkerModal = ({ isOpen, onClose, onAdd }) => {
  const [formData, setFormData] = useState({ 
      name: "", mobNo: "", category: "electrical", photoBase64: null, previewUrl: null 
  });


  const handleSubmit = async (e) => {
    e.preventDefault();
    await onAdd(formData);
    setFormData({ name: "", mobNo: "", category: "electrical" ,photoBase64: null, previewUrl: null});
    onClose();
  };


  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) return toast.error("Max 5MB allowed");
      
      const reader = new FileReader();
      reader.readAsDataURL(file); 
      reader.onloadend = () => {
        setFormData({ 
            ...formData, 
            photoBase64: reader.result, 
            previewUrl: reader.result 
        });
      };
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-xl shadow-xl overflow-hidden">
        <div className="bg-gray-800 p-4 text-white flex justify-between items-center">
          <h3 className="font-bold">Add New Worker</h3>
          <button onClick={onClose} className="text-xl hover:text-gray-200">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
           <div>
               <label className="block text-sm font-bold text-gray-700">Name</label>
               <input className="w-full p-2 border rounded" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
           </div>
           <div>
               <label className="block text-sm font-bold text-gray-700">Mobile No</label>
               <input className="w-full p-2 border rounded" required value={formData.mobNo} onChange={e => setFormData({...formData, mobNo: e.target.value})} />
           </div>
           <div>
               <label className="block text-sm font-bold text-gray-700">Category</label>
               <select className="w-full p-2 border rounded bg-white" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                   <option value="electrical">Electrical</option>
                   <option value="plumbing">Plumbing</option>
                   <option value="cleaning">Cleaning</option>
                   <option value="furniture">Furniture</option>
                   <option value="other">Other</option>
               </select>
           </div>


           <div>
               <label className="block text-sm font-bold text-gray-700 mb-1 block">Worker Photo (Optional)</label>
               {!formData.previewUrl ? (
                   <input type="file" accept="image/*" onChange={handleImageChange} className="w-full p-2 border rounded text-sm text-gray-600 file:bg-gray-100 hover:file:bg-gray-200" />
               ) : (
                   <div className="relative mt-2 inline-block">
                       <img src={formData.previewUrl} alt="Preview" className="mt-2 h-16 w-16 object-cover rounded-full border-2 border-gray-200" />
                       <button type="button" onClick={() => setFormData({...formData, photoBase64: null, previewUrl: null})} className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"><TrashIcon /></button>
                   </div>
               )}
           </div>

           
           <button type="submit" className="w-full py-2 bg-green-600 text-white font-bold rounded hover:bg-green-700">Add Worker</button>
        </form>
      </div>
    </div>
  );
};

export default AddWorkerModal;