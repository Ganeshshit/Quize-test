import React, { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { Link, useNavigate } from "react-router-dom";
import ParticlesBackground from "../../components/ParticlesBackground";

const Register = () => {
    const { register, isLoading, error } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        rollNo: "",
        registrationNo: "",
        semester: "",
        department: "",
        batch: "",
        softwareSkills: [{ name: "", proficiency: "" }],
        programmingLanguages: [{ language: "", experience: "" }],
        phone: "",
        gender: "",
        dateOfBirth: "",
        address: {
            street: "",
            city: "",
            state: "",
            zipCode: "",
            country: "",
        },
        cgpa: "",
        previousEducation: [{ degree: "", institution: "", year: "", percentage: "" }],
    });

    // Handle normal + address fields
    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name.startsWith("address.")) {
            const key = name.split(".")[1];
            setFormData({
                ...formData,
                address: { ...formData.address, [key]: value },
            });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    // FIXED — Handles array updates for skills/languages/education
    const handleArrayChange = (e, index, key) => {
        const updated = [...formData[key]];
        const field = e.target.name.split(".")[1];
        updated[index][field] = e.target.value;
        setFormData({ ...formData, [key]: updated });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const payload = {
            ...formData,
            semester: Number(formData.semester),
            cgpa: Number(formData.cgpa),

            previousEducation: [
                {
                    degree: formData.previousEducation[0].degree,
                    institution: formData.previousEducation[0].institution,
                    year: Number(formData.previousEducation[0].year),
                    percentage: Number(formData.previousEducation[0].percentage),
                },
            ],

            programmingLanguages: [
                {
                    language: formData.programmingLanguages[0].language,
                    experience: formData.programmingLanguages[0].experience,
                },
            ],

            softwareSkills: [
                {
                    name: formData.softwareSkills[0].name,
                    proficiency: formData.softwareSkills[0].proficiency,
                },
            ],
        };

        console.log("FINAL PAYLOAD:", payload); // Debug

        const result = await register(payload);
        if (result.success) navigate("/dashboard");
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#080c1b] relative overflow-hidden px-4">
            <ParticlesBackground />

            <div className="relative w-full max-w-3xl">
                <div className="absolute inset-0 rounded-3xl animate-pulse bg-gradient-to-r from-purple-600 to-blue-600 blur-2xl opacity-30"></div>

                <div className="relative bg-white/10 backdrop-blur-xl border border-purple-500/20 shadow-[0_0_30px_#4f46e5] rounded-3xl p-10 text-white">

                    <h2 className="typing-title text-3xl font-extrabold text-center mb-8 text-purple-300">
                        Create Your Account
                    </h2>

                    {error && (
                        <p className="bg-red-800/40 text-red-400 p-2 rounded mb-4 text-center border border-red-500">
                            {error}
                        </p>
                    )}

                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* NAME */}
                        <div>
                            <label className="text-gray-300">Full Name</label>
                            <input
                                required
                                name="name"
                                className="input-dark"
                                placeholder="Enter full name"
                                value={formData.name}
                                onChange={handleChange}
                            />
                        </div>

                        {/* EMAIL */}
                        <div>
                            <label className="text-gray-300">Email</label>
                            <input
                                required
                                name="email"
                                type="email"
                                className="input-dark"
                                placeholder="Enter email"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>

                        {/* PASSWORD */}
                        <div>
                            <label className="text-gray-300">Password</label>
                            <input
                                required
                                type="password"
                                name="password"
                                className="input-dark"
                                placeholder="Password"
                                value={formData.password}
                                onChange={handleChange}
                            />
                        </div>

                        {/* PHONE */}
                        <div>
                            <label className="text-gray-300">Phone</label>
                            <input
                                name="phone"
                                className="input-dark"
                                placeholder="Phone number"
                                value={formData.phone}
                                onChange={handleChange}
                            />
                        </div>

                        {/* ROLL NO */}
                        <div>
                            <label className="text-gray-300">Roll No</label>
                            <input
                                required
                                name="rollNo"
                                className="input-dark"
                                placeholder="Roll number"
                                value={formData.rollNo}
                                onChange={handleChange}
                            />
                        </div>

                        {/* REGISTRATION NO */}
                        <div>
                            <label className="text-gray-300">Registration No</label>
                            <input
                                required
                                name="registrationNo"
                                className="input-dark"
                                placeholder="Registration number"
                                value={formData.registrationNo}
                                onChange={handleChange}
                            />
                        </div>

                        {/* SEMESTER */}
                        <div>
                            <label className="text-gray-300">Semester</label>
                            <input
                                required
                                name="semester"
                                className="input-dark"
                                placeholder="Semester"
                                value={formData.semester}
                                onChange={handleChange}
                            />
                        </div>

                        {/* DEPARTMENT */}
                        <div>
                            <label className="text-gray-300">Department</label>
                            <input
                                required
                                name="department"
                                className="input-dark"
                                placeholder="Department"
                                value={formData.department}
                                onChange={handleChange}
                            />
                        </div>

                        {/* BATCH */}
                        <div>
                            <label className="text-gray-300">Batch</label>
                            <input
                                required
                                name="batch"
                                className="input-dark"
                                placeholder="Batch year"
                                value={formData.batch}
                                onChange={handleChange}
                            />
                        </div>

                        {/* DOB */}
                        <div>
                            <label className="text-gray-300">Date of Birth</label>
                            <input
                                name="dateOfBirth"
                                type="date"
                                className="input-dark"
                                value={formData.dateOfBirth}
                                onChange={handleChange}
                            />
                        </div>

                        {/* GENDER */}
                        <div>
                            <label className="text-gray-300">Gender</label>
                            <select
                                name="gender"
                                className="input-dark"
                                value={formData.gender}
                                onChange={handleChange}
                            >
                                <option value="">Select gender</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        {/* ADDRESS */}
                        <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[
                                ["address.street", "Street"],
                                ["address.city", "City"],
                                ["address.state", "State"],
                                ["address.zipCode", "ZIP Code"],
                                ["address.country", "Country"],
                            ].map(([name, label]) => (
                                <div key={name}>
                                    <label className="text-gray-300">{label}</label>
                                    <input
                                        name={name}
                                        className="input-dark"
                                        placeholder={label}
                                        onChange={handleChange}
                                    />
                                </div>
                            ))}
                        </div>

                        {/* CGPA */}
                        <div>
                            <label className="text-gray-300">CGPA</label>
                            <input
                                name="cgpa"
                                className="input-dark"
                                placeholder="CGPA"
                                value={formData.cgpa}
                                onChange={handleChange}
                            />
                        </div>

                        {/* SOFTWARE SKILL */}
                        <div>
                            <label className="text-gray-300">Software Skill</label>
                            <input
                                required
                                name="softwareSkills.name"
                                className="input-dark"
                                placeholder="Skill (e.g. React)"
                                value={formData.softwareSkills[0].name}
                                onChange={(e) => handleArrayChange(e, 0, "softwareSkills")}
                            />

                            <select
                                required
                                name="softwareSkills.proficiency"
                                className="input-dark mt-2"
                                value={formData.softwareSkills[0].proficiency}
                                onChange={(e) => handleArrayChange(e, 0, "softwareSkills")}
                            >
                                <option value="">Select proficiency</option>
                                <option value="beginner">Beginner</option>
                                <option value="intermediate">Intermediate</option>
                                <option value="advanced">Advanced</option>
                                <option value="expert">Expert</option>
                            </select>
                        </div>

                        {/* PROGRAMMING LANGUAGE */}
                        <div>
                            <label className="text-gray-300">Programming Language</label>

                            <input
                                required
                                name="programmingLanguages.language"
                                className="input-dark"
                                placeholder="Language (e.g. JavaScript)"
                                value={formData.programmingLanguages[0].language}
                                onChange={(e) => handleArrayChange(e, 0, "programmingLanguages")}
                            />

                            <select
                                required
                                name="programmingLanguages.experience"
                                className="input-dark mt-2"
                                value={formData.programmingLanguages[0].experience}
                                onChange={(e) => handleArrayChange(e, 0, "programmingLanguages")}
                            >
                                <option value="">Select experience</option>
                                <option value="< 6 months">&lt; 6 months</option>
                                <option value="6-12 months">6–12 months</option>
                                <option value="1-2 years">1–2 years</option>
                                <option value="2+ years">2+ years</option>
                            </select>
                        </div>

                        {/* PREVIOUS EDUCATION */}
                        <div>
                            <label className="text-gray-300">Previous Education</label>

                            <input
                                required
                                name="previousEducation.degree"
                                className="input-dark"
                                placeholder="Degree (e.g. Higher Secondary)"
                                value={formData.previousEducation[0].degree}
                                onChange={(e) => handleArrayChange(e, 0, "previousEducation")}
                            />

                            <input
                                required
                                name="previousEducation.institution"
                                className="input-dark mt-2"
                                placeholder="Institution name"
                                value={formData.previousEducation[0].institution}
                                onChange={(e) => handleArrayChange(e, 0, "previousEducation")}
                            />

                            <input
                                required
                                type="number"
                                name="previousEducation.year"
                                className="input-dark mt-2"
                                placeholder="Year"
                                value={formData.previousEducation[0].year}
                                onChange={(e) => handleArrayChange(e, 0, "previousEducation")}
                            />

                            <input
                                required
                                type="number"
                                name="previousEducation.percentage"
                                className="input-dark mt-2"
                                placeholder="Percentage"
                                value={formData.previousEducation[0].percentage}
                                onChange={(e) => handleArrayChange(e, 0, "previousEducation")}
                            />
                        </div>

                        {/* SUBMIT BUTTON */}
                        <div className="col-span-2">
                            <button
                                type="submit"
                                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 
                                py-3 rounded-xl font-bold text-lg shadow-[0_0_20px_#4f46e5] 
                                hover:opacity-90 transition"
                            >
                                {isLoading ? "Registering..." : "Create Account"}
                            </button>
                        </div>
                    </form>

                    <p className="text-center text-gray-400 mt-6">
                        Already have an account?{" "}
                        <Link className="text-purple-400 hover:underline" to="/login">
                            Login
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
