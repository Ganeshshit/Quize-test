import React, { useState, useEffect } from "react";
// import { userAPI } from "../../api/users.api"; // Uncomment when backend ready

const Profile = () => {
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
    });

    const [loading, setLoading] = useState(false);

    // TEMP MOCK — Replace with real API call
    useEffect(() => {
        const mockUser = {
            name: "Ganesh Shit",
            email: "student.Ganesh@example.com",
        };
        setForm({ ...form, ...mockUser });
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Example API call:
            // await userAPI.updateProfile(form);

            setTimeout(() => {
                setLoading(false);
                alert("Profile updated successfully!");
            }, 1000);
        } catch (error) {
            alert("Failed to update profile");
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>
                <p className="text-gray-600">Manage your personal information.</p>
            </div>

            {/* Profile Card */}
            <div className="bg-white shadow rounded-xl p-6">
                <div className="flex flex-col items-center mb-6">
                    <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center text-3xl font-bold text-blue-600">
                        {form.name?.charAt(0)}
                    </div>
                    <h2 className="text-xl font-semibold mt-3">{form.name}</h2>
                    <p className="text-gray-500">{form.email}</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block font-medium text-gray-700">Name</label>
                        <input
                            type="text"
                            name="name"
                            className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring focus:ring-blue-300"
                            value={form.name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div>
                        <label className="block font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            name="email"
                            className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring focus:ring-blue-300"
                            value={form.email}
                            disabled
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Email cannot be changed.
                        </p>
                    </div>

                    <div>
                        <label className="block font-medium text-gray-700">New Password</label>
                        <input
                            type="password"
                            name="password"
                            placeholder="Leave blank to keep same password"
                            className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring focus:ring-blue-300"
                            onChange={handleChange}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                    >
                        {loading ? "Updating..." : "Update Profile"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Profile;
