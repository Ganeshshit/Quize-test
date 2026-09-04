import React, { useState } from "react";
import { Upload, FileUp, CheckCircle, AlertTriangle, Download, Info, X } from "lucide-react";

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
                    reject(new Error("Upload failed"));
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

    const removeFile = () => {
        setFile(null);
    };

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-200 p-6 mb-6 shadow-sm">
                <div className="flex items-center gap-4 mb-4">
                    <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-3 shadow-lg">
                        <Upload className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h3 className="text-3xl font-bold text-gray-900">Bulk Upload Questions</h3>
                        <p className="text-sm text-gray-600 mt-1 font-medium">Upload CSV or Excel files with multiple questions</p>
                    </div>
                </div>
            </div>

            {/* Instructions Card */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-5 mb-6 shadow-sm">
                <div className="flex items-start gap-3">
                    <div className="bg-blue-600 p-2 rounded-lg mt-0.5">
                        <Info className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                        <h4 className="font-bold text-blue-900 mb-2 text-lg">File Format Instructions</h4>
                        <ul className="text-sm text-blue-800 space-y-1.5 font-medium">
                            <li>• Supported formats: CSV, XLSX</li>
                            <li>• Required columns: Question, Option A, Option B, Option C, Option D, Correct Answer, Marks</li>
                            <li>• Correct Answer should be A, B, C, or D</li>
                            <li>• Maximum file size: 5MB</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Upload Area */}
            <div className="space-y-6">
                {/* Drag and Drop Area */}
                <div
                    className={`relative border-3 border-dashed rounded-xl p-8 transition-all ${dragActive
                            ? "border-green-500 bg-green-50"
                            : file
                                ? "border-green-300 bg-green-50"
                                : "border-gray-300 bg-gray-50 hover:bg-gray-100"
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
                        <label
                            htmlFor="file-upload"
                            className="flex flex-col items-center cursor-pointer"
                        >
                            <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-full p-6 mb-4 shadow-lg">
                                <FileUp className="w-12 h-12 text-white" />
                            </div>
                            <p className="text-xl font-bold text-gray-700 mb-2">
                                Drop your file here or click to browse
                            </p>
                            <p className="text-sm text-gray-500 font-medium">
                                CSV or Excel files up to 5MB
                            </p>
                        </label>
                    ) : (
                        <div className="flex items-center justify-between bg-white border-2 border-green-300 rounded-lg p-4 shadow-md">
                            <div className="flex items-center gap-4">
                                <div className="bg-green-100 p-3 rounded-lg">
                                    <CheckCircle className="w-8 h-8 text-green-600" />
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900 text-lg">{file.name}</p>
                                    <p className="text-sm text-gray-600 font-medium">
                                        {(file.size / 1024).toFixed(2)} KB
                                    </p>
                                </div>
                            </div>
                            {!uploading && (
                                <button
                                    type="button"
                                    onClick={removeFile}
                                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Upload Button */}
                <button
                    onClick={handleSubmit}
                    disabled={uploading || !file}
                    className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all shadow-lg ${uploading
                            ? "bg-gray-400 text-white cursor-not-allowed"
                            : file
                                ? "bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 hover:shadow-xl"
                                : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
                >
                    {uploading ? (
                        <>
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                            Uploading Questions...
                        </>
                    ) : (
                        <>
                            <Upload className="w-6 h-6" />
                            Upload Questions to Quiz
                        </>
                    )}
                </button>
            </div>

            {/* Download Template */}
            <div className="mt-8 bg-amber-50 border-2 border-amber-200 rounded-xl p-5 shadow-sm">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-amber-600 p-2 rounded-lg">
                            <Download className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="font-bold text-amber-900 text-lg">Need a template?</p>
                            <p className="text-sm text-amber-800 font-medium">Download our sample CSV file to get started</p>
                        </div>
                    </div>
                    <button className="px-5 py-2.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-all font-bold shadow-md hover:shadow-lg flex items-center gap-2">
                        <Download className="w-5 h-5" />
                        Download Template
                    </button>
                </div>
            </div>

            {/* Tips */}
            <div className="mt-6 bg-purple-50 border-2 border-purple-200 rounded-xl p-5 shadow-sm">
                <div className="flex items-start gap-3">
                    <div className="bg-purple-600 p-2 rounded-lg mt-0.5">
                        <AlertTriangle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h4 className="font-bold text-purple-900 mb-2 text-lg">Pro Tips</h4>
                        <ul className="text-sm text-purple-800 space-y-1.5 font-medium">
                            <li>• Ensure all required fields are filled in your file</li>
                            <li>• Double-check correct answers before uploading</li>
                            <li>• Preview your file in a spreadsheet editor first</li>
                            <li>• Remove any special characters that might cause issues</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BulkUpload;