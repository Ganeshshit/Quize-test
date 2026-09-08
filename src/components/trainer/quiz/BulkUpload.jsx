// src/components/trainer/quiz/BulkUpload.jsx
import React, { useState } from "react";
import { Upload, FileUp, CheckCircle, AlertCircle, Download, Info, X, FileSpreadsheet, Loader2 } from "lucide-react";

const BulkUpload = ({ quizId, reloadQuiz }) => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);

    // Mock API call - replace with actual API
    const uploadFile = async (quizId, file) => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (Math.random() > 0.1) {
                    resolve({ success: true, questionsAdded: 10 });
                } else {
                    reject(new Error("Upload failed. Please check the file format."));
                }
            }, 2000);
        });
    };

    const handleSubmit = async () => {
        if (!file) {
            alert("Please upload a file");
            return;
        }

        try {
            setUploading(true);
            await uploadFile(quizId, file);
            alert("Bulk upload successful!");
            setFile(null);
            if (reloadQuiz) reloadQuiz();
        } catch (err) {
            alert(err.message || "Failed to upload file");
        } finally {
            setUploading(false);
        }
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const removeFile = (e) => {
        e.preventDefault();
        setFile(null);
    };

    return (
        <div className="w-full font-sans max-w-6xl mx-auto">

            {/* Header Section */}
            <div className="flex items-center gap-4 mb-6 pb-4 border-b border-gray-100">
                <div className="w-12 h-12 bg-[#0A0A0A] rounded-2xl flex items-center justify-center text-white shadow-sm flex-shrink-0">
                    <Upload size={24} className="text-yellow-400" />
                </div>
                <div>
                    <h2 className="text-xl font-black text-gray-900 tracking-tight">Bulk Import Questions</h2>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">Upload CSV or Excel files</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Column: Upload Area */}
                <div className="lg:col-span-2 space-y-4 flex flex-col">

                    {/* Drag & Drop Zone */}
                    <div
                        className={`relative flex flex-col items-center justify-center w-full min-h-[320px] border-2 border-dashed rounded-3xl transition-all ${dragActive
                            ? "border-yellow-400 bg-yellow-50/50 scale-[1.01]"
                            : file
                                ? "border-gray-300 bg-gray-50"
                                : "border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-gray-400"
                            }`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                    >
                        <input
                            type="file"
                            accept=".csv,.xlsx,.xls"
                            onChange={handleFileChange}
                            className="hidden"
                            id="file-upload"
                            disabled={uploading}
                        />

                        {!file ? (
                            <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full h-full cursor-pointer p-8 text-center">
                                <div className="w-16 h-16 bg-white border border-gray-200 rounded-2xl shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <FileUp size={32} className="text-gray-400" />
                                </div>
                                <p className="text-lg font-black text-gray-900 mb-2">
                                    Drag & drop your file here
                                </p>
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">
                                    or click to browse from your computer
                                </p>
                                <span className="px-3 py-1 bg-gray-200 text-gray-600 rounded-lg text-[10px] font-black uppercase tracking-widest">
                                    Max Size: 5MB • CSV, XLSX
                                </span>
                            </label>
                        ) : (
                            <div className="flex flex-col items-center justify-center w-full h-full p-8 text-center animate-fade-in">
                                <div className="w-16 h-16 bg-[#0A0A0A] rounded-2xl shadow-md flex items-center justify-center mb-4 relative">
                                    <FileSpreadsheet size={32} className="text-yellow-400" />
                                    <div className="absolute -top-2 -right-2 bg-white rounded-full p-0.5 shadow-sm">
                                        <CheckCircle size={16} className="text-emerald-500" />
                                    </div>
                                </div>
                                <p className="text-lg font-black text-gray-900 truncate max-w-xs mb-1">
                                    {file.name}
                                </p>
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-6">
                                    {(file.size / 1024).toFixed(2)} KB
                                </p>
                                {!uploading && (
                                    <button
                                        onClick={removeFile}
                                        className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-black uppercase tracking-widest rounded-xl transition-colors"
                                    >
                                        <X size={14} /> Remove File
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Upload Action Button */}
                    <button
                        onClick={handleSubmit}
                        disabled={uploading || !file}
                        className={`w-full py-4 rounded-2xl text-sm font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-sm ${uploading
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : file
                                ? "bg-[#0A0A0A] hover:bg-black text-white hover:shadow-md"
                                : "bg-gray-100 text-gray-400 cursor-not-allowed"
                            }`}
                    >
                        {uploading ? (
                            <>
                                <Loader2 size={18} className="animate-spin" /> Processing Upload...
                            </>
                        ) : (
                            <>
                                <Upload size={18} /> Import Questions to Quiz
                            </>
                        )}
                    </button>
                </div>

                {/* Right Column: Instructions & Template */}
                <div className="flex flex-col gap-4">

                    {/* Template Card */}
                    <div className="bg-[#0A0A0A] border border-gray-800 rounded-3xl p-6 shadow-lg text-white relative overflow-hidden group">
                        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-yellow-400 rounded-full blur-3xl opacity-20 pointer-events-none transition-opacity group-hover:opacity-30"></div>
                        <div className="relative z-10 flex flex-col items-start gap-4">
                            <div className="p-3 bg-yellow-400 rounded-xl text-black">
                                <Download size={20} />
                            </div>
                            <div>
                                <h4 className="text-base font-black text-white mb-1">Need a template?</h4>
                                <p className="text-xs font-bold text-gray-400 leading-relaxed mb-5">
                                    Download our standardized template to ensure your questions import correctly.
                                </p>
                                <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-colors">
                                    <Download size={14} /> Download CSV
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Instructions Card */}
                    <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm flex-1">
                        <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-100">
                            <Info size={16} className="text-gray-400" />
                            <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest">Formatting Rules</h4>
                        </div>

                        <ul className="space-y-4">
                            <li className="flex items-start gap-3">
                                <div className="w-5 h-5 rounded bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-[10px] font-black text-gray-600">1</span>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-900">Required Columns</p>
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1 leading-relaxed">
                                        Question, Option A, Option B, Option C, Option D, Correct Answer, Marks
                                    </p>
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="w-5 h-5 rounded bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-[10px] font-black text-gray-600">2</span>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-900">Answer Format</p>
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1 leading-relaxed">
                                        The 'Correct Answer' column must strictly contain A, B, C, or D.
                                    </p>
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="w-5 h-5 rounded bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <AlertCircle size={12} className="text-yellow-600" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-900">Pro Tip</p>
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1 leading-relaxed">
                                        Remove complex special characters or HTML tags before importing to prevent parsing errors.
                                    </p>
                                </div>
                            </li>
                        </ul>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default BulkUpload;