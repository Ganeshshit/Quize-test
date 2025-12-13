import React, { useState } from "react";
import { quizzesAPI } from "../../../api/quizzes.api";

const BulkUpload = ({ quizId, reloadQuiz }) => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!file) return alert("Please upload a file");

        try {
            setUploading(true);
            await quizzesAPI.bulkUploadQuestions(quizId, file);

            alert("Bulk upload successful!");
            setFile(null);

            if (reloadQuiz) reloadQuiz();

        } catch (err) {
            alert(err.response?.data?.message || "Failed to upload file");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold mb-4 text-gray-800">📤 Bulk Upload Questions</h3>

            <form onSubmit={handleSubmit} className="space-y-3">
                <input
                    type="file"
                    accept=".csv,.xlsx"
                    onChange={(e) => setFile(e.target.files[0])}
                    className="border border-gray-300 p-2 w-full rounded-md"
                />

                <button
                    type="submit"
                    disabled={uploading}
                    className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
                >
                    {uploading ? "Uploading..." : "📁 Upload File"}
                </button>
            </form>
        </div>
    );
};

export default BulkUpload;
