import { useState } from "react";
import { useStudentData } from "../hooks/useStudentData";
import NoticeModal from "../components/dashboard/NoticeModal";

// --- MODULES ---
import StudentNavbar from "../components/layout/StudentNavbar";
import ComplaintModal from "../components/dashboard/ComplaintModal";
import ProfileModal from "../components/dashboard/ProfileModal";
import ComplaintDetailsModal from "../components/dashboard/ComplaintDetailsModal";

// --- ICONS ---
const ArrowRightIcon = () => <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>;

const StudentDashboard = () => {
  const { 
    user, complaints, notices, stats, notifications, loading, 
    logout, fileComplaint, updateProfile, reopenComplaint 
  } = useStudentData();

  // --- STATE ---
  const [activeModal, setActiveModal] = useState(null); 
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [filter, setFilter] = useState('all'); // <--- NEW: Filter State ('all', 'pending', 'resolved')

  // --- FILTER LOGIC ---
  const filteredComplaints = complaints.filter(c => {
      if (filter === 'all') return true;
      return c.status === filter; 
  });

  // --- INSTANT STATS CALCULATION ---
  const localStats = {
      total: complaints.length,
      pending: complaints.filter(c => c.status === 'pending').length,
      assigned: complaints.filter(c => c.status === 'assigned').length,
      resolved: complaints.filter(c => c.status === 'resolved').length,
  };

  const openDetails = (complaint) => {
      setSelectedComplaint(complaint);
      setActiveModal('details');
  };

  const canReopen = (resolvedDate) => {
    const diffTime = Math.abs(new Date() - new Date(resolvedDate));
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) <= 10;
  };

  if (loading) return <div className="h-screen flex items-center justify-center text-blue-600 font-bold animate-pulse">Loading Dashboard...</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      
      <StudentNavbar 
        user={user} 
        notifications={notifications} 
        onLogout={logout} 
        onOpenProfile={() => setActiveModal('profile')}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-10 grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* LEFT COLUMN */}
        <div className="lg:col-span-3 space-y-8">
            
            {/* --- INTERACTIVE STATS --- */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <StatCard 
                    title="Total" 
                    count={stats.total} 
                    color="blue" 
                    isActive={filter === 'all'} 
                    onClick={() => setFilter('all')} 
                />
                <StatCard 
                    title="Pending" 
                    count={stats.pending} 
                    color="yellow" 
                    isActive={filter === 'pending'} 
                    onClick={() => setFilter('pending')} 
                />

                <StatCard 
                    title="Assigned" 
                    count={localStats.assigned} 
                    color="cyan" // We will add 'cyan' to your color map in the next step!
                    isActive={filter === 'assigned'} 
                    onClick={() => setFilter('assigned')} 
                />

                <StatCard 
                    title="Resolved" 
                    count={stats.resolved} 
                    color="green" 
                    isActive={filter === 'resolved'} 
                    onClick={() => setFilter('resolved')} 
                />
            </div>

            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">
                    {filter === 'all' ? 'All Complaints' : filter === 'pending' ? 'Pending Complaints' : 'Resolved Complaints'}
                </h2>
                <button onClick={() => setActiveModal('complaint')} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold shadow-lg transition transform hover:-translate-y-1">
                    + New Complaint
                </button>
            </div>

            {/* --- COMPLAINT TABLE --- */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden min-h-[300px]">
                {filteredComplaints.length === 0 ? (
                    <div className="p-10 text-center flex flex-col items-center justify-center h-full">
                        <p className="text-gray-400 text-lg mb-2">No complaints found in this category.</p>
                        {filter !== 'all' && (
                            <button onClick={() => setFilter('all')} className="text-blue-600 font-bold hover:underline">
                                View All
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 text-gray-600 text-sm uppercase">
                                    <th className="p-4">Title</th>
                                    <th className="p-4">Category</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4 text-right">Details</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredComplaints.map(c => (
                                    <tr 
                                        key={c._id} 
                                        onClick={() => openDetails(c)} 
                                        className="hover:bg-blue-50 cursor-pointer transition duration-150 group animate-fadeIn"
                                    >
                                        <td className="p-4 font-semibold text-gray-800">{c.title}</td>
                                        <td className="p-4 capitalize text-gray-600">{c.category}</td>
                                        <td className="p-4"><Badge status={c.status} /></td>
                                        <td className="p-4 text-right">
                                            <span className="inline-block p-2 rounded-full group-hover:bg-white group-hover:shadow-sm transition">
                                                <ArrowRightIcon />
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-24">
                <h3 className="text-lg font-bold mb-4">📢 Notice Board</h3>
                <div className="space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar">
                    {notices.map(n => (
                        <div key={n._id} onClick={() => setSelectedNotice(n)} className="p-3 bg-gray-50 rounded-lg border border-gray-100 cursor-pointer hover:bg-gray-100 hover:shadow-md transition group">
                            <h4 className="font-bold text-sm">{n.title}</h4>
                            <p className="text-xs text-gray-600 mt-1">{n.description}</p>
                            <p className="text-[10px] text-gray-400 text-right mt-1">{new Date(n.createdAt).toLocaleDateString()}</p>
                        </div>
                    ))}
                    {notices.length === 0 && <p className="text-sm text-gray-500">No active notices.</p>}
                </div>
            </div>
        </div>
      </main>

      {/* --- MODALS --- */}
      <ComplaintModal isOpen={activeModal === 'complaint'} onClose={() => setActiveModal(null)} onSubmit={fileComplaint} userHostel={user.hostel} />
      <ProfileModal isOpen={activeModal === 'profile'} onClose={() => setActiveModal(null)} user={user} onUpdate={updateProfile} />
      <ComplaintDetailsModal isOpen={activeModal === 'details'} onClose={() => setActiveModal(null)} complaint={selectedComplaint} onReopen={reopenComplaint} />
        <NoticeModal isOpen={!!selectedNotice} notice={selectedNotice} onClose={() => setSelectedNotice(null)} />

    </div>
  );
};

// --- UPDATED STAT CARD ---
// Now accepts `onClick` and `isActive` props
const StatCard = ({ title, count, color, onClick, isActive }) => {
    // Tailwind color mapping
    const colors = {
        blue: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', activeRing: 'ring-blue-400' },
        yellow: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', activeRing: 'ring-yellow-400' },
        green: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', activeRing: 'ring-green-400' },
        
        // --- ADD THIS NEW COLOR FOR THE ASSIGNED CARD ---
        cyan: { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200', activeRing: 'ring-cyan-400' }
    };

    const c = colors[color];

    return (
        <button 
            onClick={onClick}
            className={`
                p-6 rounded-xl border flex flex-col items-center justify-center transition-all duration-200 w-full
                ${c.bg} ${c.text} ${c.border}
                ${isActive ? `ring-2 ${c.activeRing} shadow-md scale-105` : 'hover:scale-105 hover:shadow-sm'}
            `}
        >
            <span className="text-4xl font-extrabold mb-1">{count}</span>
            <span className="text-sm font-medium uppercase opacity-80">{title}</span>
        </button>
    );
};

const Badge = ({ status }) => {
    const colors = { resolved: 'bg-green-100 text-green-700', assigned: 'bg-blue-100 text-blue-700', pending: 'bg-yellow-100 text-yellow-700' };
    return <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${colors[status] || colors.pending}`}>{status}</span>;
};

export default StudentDashboard;