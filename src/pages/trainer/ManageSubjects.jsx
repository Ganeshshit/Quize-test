// src/pages/trainer/ManageSubjects.jsx
import React, { useState, useEffect } from 'react';
import TrainerLayout from '../../components/Layout/TrainerLayout';
import {
  BookOpen,
  Plus,
  Search,
  Edit2,
  Trash2,
  Loader2,
  AlertCircle,
  X,
  Save
} from 'lucide-react';
import toast from 'react-hot-toast';

const ManageSubjects = () => {
  // --- STATE ---
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentSubject, setCurrentSubject] = useState({ name: "", description: "" });

  // --- DATA FETCHING (Dynamic Ready) ---
  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      setLoading(true);

      // TODO: BACKEND DEVELOPER - Replace with actual API call
      // const res = await subjectsAPI.getAll();
      // setSubjects(res.data);

      // SIMULATED API DELAY & MOCK DATA
      await new Promise(resolve => setTimeout(resolve, 800));
      setSubjects([
        { _id: "1", name: "JavaScript Fundamentals", description: "Core concepts, ES6+, and DOM manipulation.", questionCount: 45 },
        { _id: "2", name: "Data Structures", description: "Arrays, Trees, Graphs, and algorithm complexity.", questionCount: 120 },
        { _id: "3", name: "React Architecture", description: "Hooks, state management, and component design.", questionCount: 34 },
      ]);
    } catch (err) {
      console.error(err);
      setError("Failed to load subjects.");
      toast.error("Failed to load subjects.");
    } finally {
      setLoading(false);
    }
  };

  // --- HANDLERS ---
  const handleOpenModal = (subject = null) => {
    if (subject) {
      setCurrentSubject(subject);
    } else {
      setCurrentSubject({ name: "", description: "" });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentSubject({ name: "", description: "" });
  };

  const handleSaveSubject = async (e) => {
    e.preventDefault();

    if (!currentSubject.name.trim()) {
      toast.error("Subject name is required");
      return;
    }

    try {
      setIsSubmitting(true);

      // TODO: BACKEND DEVELOPER - Replace with actual API call
      // if (currentSubject._id) {
      //     await subjectsAPI.update(currentSubject._id, currentSubject);
      // } else {
      //     await subjectsAPI.create(currentSubject);
      // }

      await new Promise(resolve => setTimeout(resolve, 600)); // Simulate save

      toast.success(currentSubject._id ? "Subject updated!" : "Subject created!");
      handleCloseModal();
      fetchSubjects(); // Refresh list
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save subject");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this subject?")) return;

    try {
      // TODO: BACKEND DEVELOPER - Replace with actual API call
      // await subjectsAPI.delete(id);
      toast.success("Subject deleted");
      setSubjects(prev => prev.filter(s => s._id !== id));
    } catch (err) {
      toast.error("Failed to delete subject");
    }
  };

  // --- FILTER ---
  const filteredSubjects = subjects.filter(subject =>
    subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (subject.description && subject.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Premium Input Classes
  const inputClasses = "w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:bg-white focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition-all";

  return (
    <TrainerLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto w-full font-sans selection:bg-yellow-200">

        {/* Premium Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
              <div className="p-2 bg-yellow-400 rounded-lg text-black shadow-sm">
                <BookOpen size={24} />
              </div>
              Manage Subjects
            </h1>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mt-2">
              Organize your question bank categories
            </p>
          </div>

          <button
            onClick={() => handleOpenModal()}
            className="flex items-center justify-center gap-2 px-6 py-3.5 bg-[#0A0A0A] hover:bg-black text-white text-sm font-bold rounded-xl shadow-md transition-all whitespace-nowrap"
          >
            <Plus size={18} /> Add New Subject
          </button>
        </div>

        {/* Toolbar */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4 mb-8 flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative w-full sm:max-w-md">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search subjects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`${inputClasses} pl-11`}
            />
          </div>
          <div className="text-xs font-bold text-gray-400 uppercase tracking-widest sm:ml-auto">
            Showing {filteredSubjects.length} subjects
          </div>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 min-h-[40vh]">
            <Loader2 size={40} className="text-yellow-400 animate-spin mb-4" />
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Loading Subjects...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 min-h-[40vh] text-center">
            <AlertCircle size={48} className="text-red-400 mb-4" />
            <h3 className="text-lg font-black text-gray-900">Failed to load</h3>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mt-1">{error}</p>
          </div>
        ) : filteredSubjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 min-h-[40vh] bg-white border border-gray-200 rounded-3xl border-dashed">
            <div className="p-4 bg-gray-50 rounded-full text-gray-400 mb-4">
              <BookOpen size={32} />
            </div>
            <h3 className="text-lg font-black text-gray-900">No Subjects Found</h3>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mt-1 mb-6">Create a subject to categorize your questions</p>
            <button
              onClick={() => handleOpenModal()}
              className="text-sm font-bold text-yellow-600 hover:text-yellow-700 bg-yellow-50 px-6 py-2.5 rounded-lg transition-colors"
            >
              + Create First Subject
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSubjects.map(subject => (
              <div key={subject._id} className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm hover:border-yellow-400 hover:shadow-md transition-all group flex flex-col h-full">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-gray-50 rounded-xl text-gray-700 group-hover:bg-yellow-50 group-hover:text-yellow-700 transition-colors">
                    <BookOpen size={20} />
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleOpenModal(subject)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit Subject"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(subject._id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Subject"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <h3 className="text-lg font-black text-gray-900 mb-2">{subject.name}</h3>
                <p className="text-sm font-medium text-gray-500 flex-grow">
                  {subject.description || "No description provided."}
                </p>

                <div className="pt-6 mt-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Question Bank</span>
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-[10px] font-black uppercase tracking-widest border border-gray-200">
                    {subject.questionCount || 0} ITEMS
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create/Edit Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-slide-up">

              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
                  {currentSubject._id ? <Edit2 size={20} className="text-yellow-500" /> : <Plus size={20} className="text-yellow-500" />}
                  {currentSubject._id ? "Edit Subject" : "Create New Subject"}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveSubject} className="p-6">
                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">
                      Subject Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={currentSubject.name}
                      onChange={(e) => setCurrentSubject({ ...currentSubject, name: e.target.value })}
                      className={inputClasses}
                      placeholder="e.g. System Design"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">
                      Description
                    </label>
                    <textarea
                      rows={4}
                      value={currentSubject.description}
                      onChange={(e) => setCurrentSubject({ ...currentSubject, description: e.target.value })}
                      className={`${inputClasses} resize-none`}
                      placeholder="Brief overview of what this subject covers..."
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-8">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-bold rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#0A0A0A] hover:bg-black text-white text-sm font-bold rounded-xl shadow-md transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <><Save size={18} /> {currentSubject._id ? "Save Changes" : "Create"}</>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </TrainerLayout>
  );
};

export default ManageSubjects;