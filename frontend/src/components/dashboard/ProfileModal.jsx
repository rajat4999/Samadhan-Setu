import { useState, useEffect } from "react";

const ProfileModal = ({ isOpen, onClose, user, onUpdate }) => {
  const [formData, setFormData] = useState({
    hostel: "", room: "", mobNo: ""
  });

  // Load user data when modal opens
  useEffect(() => {
    if (user) {
      setFormData({
        hostel: user.hostel || "Patel",
        room: user.room || "",
        mobNo: user.mobNo || ""
      });
    }
  }, [user, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onUpdate(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Sticky Header */}
        <div className="bg-gray-800 p-6 flex justify-between items-center text-white shrink-0">
          <h3 className="text-xl font-bold">Edit Profile</h3>
          <button onClick={onClose} className="text-2xl hover:text-gray-400">&times;</button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto custom-scrollbar">
          <div className="bg-gray-50 p-3 rounded-lg border">
            <p className="text-xs font-bold text-gray-500 uppercase">Name</p>
            <p className="font-bold text-gray-800">{user.name}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-bold text-gray-600">Hostel</label>
              <select className="w-full p-2 border rounded-lg bg-white" value={formData.hostel} onChange={e => setFormData({...formData, hostel: e.target.value})}>
                <option value="Patel">Patel</option>
                <option value="Tilak">Tilak</option>
                <option value="Malviya">Malviya</option>
                <option value="SVBH">SVBH</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-bold text-gray-600">Room</label>
              <input className="w-full p-2 border rounded-lg" value={formData.room} onChange={e => setFormData({...formData, room: e.target.value})} />
            </div>
          </div>

          <div>
            <label className="text-sm font-bold text-gray-600">Mobile No</label>
            <input className="w-full p-2 border rounded-lg" value={formData.mobNo} onChange={e => setFormData({...formData, mobNo: e.target.value})} />
          </div>



          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="w-1/3 py-3 rounded-lg font-bold text-gray-600 bg-gray-200 hover:bg-gray-300">Cancel</button>
            <button type="submit" className="w-2/3 bg-gray-800 text-white py-3 rounded-lg font-bold hover:bg-gray-900 transition">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileModal;