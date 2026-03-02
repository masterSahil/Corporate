import React, { useState } from "react";
import { Menu, ShieldCheck, User, UploadCloud } from "lucide-react";
import Sidebar from "../../components/Sidebar";
import { theme } from "../../components/theme";

/* =================================
   Reusable Components
================================= */

const Card = ({ title, icon: Icon, children }) => {
  return (
    <div className={`${theme.cardBg} border ${theme.border} rounded-xl p-6 shadow-sm`}>
      {title && (
        <div className={`flex items-center gap-2 mb-5 pb-4 border-b ${theme.border}`}>
          {Icon && <Icon size={18} className={theme.textMuted} />}
          <h2 className="text-base font-bold text-slate-900">{title}</h2>
        </div>
      )}
      {children}
    </div>
  );
};

const Input = ({ label, type = "text", value, onChange, ...props }) => {
  return (
    <div className="flex flex-col gap-2 mb-4">
      <label className={`text-sm font-semibold ${theme.textMuted}`}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        className={`w-full bg-zinc-50 border ${theme.border} text-slate-900 text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:border-black transition-all`}
        {...props}
      />
    </div>
  );
};

const Select = ({ label, value, onChange, options }) => {
  return (
    <div className="flex flex-col gap-2 mb-4">
      <label className={`text-sm font-semibold ${theme.textMuted}`}>
        {label}
      </label>
      <select
        value={value}
        onChange={onChange}
        className={`w-full bg-zinc-50 border ${theme.border} text-slate-900 text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:border-black cursor-pointer`}
      >
        <option value="">Select an option</option>
        {options.map((option, index) => (
          <option key={index} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
};

const TextArea = ({ label, value, onChange, ...props }) => {
  return (
    <div className="flex flex-col gap-2 mb-4">
      <label className={`text-sm font-semibold ${theme.textMuted}`}>
        {label}
      </label>
      <textarea
        value={value}
        onChange={onChange}
        className={`w-full bg-zinc-50 border ${theme.border} text-slate-900 text-sm rounded-lg px-4 py-3 focus:outline-none focus:border-black transition-all min-h-[120px]`}
        {...props}
      />
    </div>
  );
};

const ImageDropzone = ({ onFileSelect }) => {
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      onFileSelect(file);
    }
  };

  return (
    <Card title="Profile Image" icon={UploadCloud}>
      <label
        className={`border-2 border-dashed ${theme.border} rounded-xl p-8 flex flex-col items-center justify-center text-center hover:border-zinc-400 hover:bg-zinc-50 transition-all cursor-pointer group`}
      >
        <div className="bg-black p-3 rounded-full mb-4 group-hover:scale-110 transition-transform">
          <UploadCloud size={24} className="text-white" />
        </div>

        <p className="text-sm font-bold text-slate-900 mb-1">
          Click to upload or drag and drop
        </p>

        <p className={`text-xs ${theme.textMuted} mb-4`}>
          JPG, PNG up to 5MB
        </p>

        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </label>
    </Card>
  );
};

const StatusToggle = ({ enabled, setEnabled, label }) => {
  return (
    <div
      className={`${theme.cardBg} border ${theme.border} rounded-xl p-5 mb-6 flex items-center justify-between shadow-sm`}
    >
      <div>
        <h3 className="text-sm font-bold text-slate-900">{label}</h3>
        <p className={`text-xs ${theme.textMuted} mt-1`}>
          When enabled, the employee account is active.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <span
          className={`text-sm font-semibold ${
            enabled ? "text-slate-900" : theme.textMuted
          }`}
        >
          {enabled ? "Active" : "Inactive"}
        </span>

        <button
          onClick={() => setEnabled(!enabled)}
          className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${
            enabled ? "bg-black" : "bg-zinc-300"
          }`}
        >
          <div
            className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform duration-300 ${
              enabled ? "translate-x-7" : "translate-x-1"
            }`}
          />
        </button>
      </div>
    </div>
  );
};

/* =================================
   Main Component
================================= */

const AddEmployee = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isActive, setIsActive] = useState(true);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    role: "",
    department: "",
    notes: "",
    profileImage: null,
  });

  const handleChange = (field) => (e) => {
    setFormData({
      ...formData,
      [field]: e.target.value,
    });
  };

  const handleSubmit = () => {
    const payload = {
      ...formData,
      status: isActive ? "Active" : "Inactive",
    };

    console.log("Submitting employee:", payload);

    // TODO: Connect to backend API
  };

  return (
    <div className={`flex h-screen w-full ${theme.appBg} ${theme.textMain} font-sans overflow-hidden`}>
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <main className="flex-1 overflow-y-auto bg-slate-50">
        {/* Mobile Header */}
        <div className="lg:hidden p-4 flex justify-between items-center">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className={`flex items-center gap-2 ${theme.textMuted} border ${theme.border} px-3 py-2 rounded-lg`}
          >
            <Menu size={20} />
            <span className="text-sm font-medium">Menu</span>
          </button>
        </div>

        <div className="p-6 max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Add New Employee
              </h1>
              <p className={`text-sm ${theme.textMuted} mt-2`}>
                Configure the professional profile for the new hire.
              </p>
            </div>

            <div className="flex gap-3">
              <button className={`px-5 py-2.5 rounded-lg text-sm font-semibold border ${theme.border}`}>
                Cancel
              </button>

              <button
                onClick={handleSubmit}
                className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-black"
              >
                Save Employee
              </button>
            </div>
          </div>

          <StatusToggle
            label="Employee Status"
            enabled={isActive}
            setEnabled={setIsActive}
          />

          {/* Layout Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 space-y-6">
              <Card title="Personal Information" icon={User}>
                <div className="grid md:grid-cols-2 gap-6">
                  <Input
                    label="Full Name"
                    value={formData.fullName}
                    onChange={handleChange("fullName")}
                    placeholder="e.g. Jonathan Smith"
                  />

                  <Input
                    label="Email Address"
                    type="email"
                    value={formData.email}
                    onChange={handleChange("email")}
                    placeholder="j.smith@enterprise.com"
                  />

                  <Input
                    label="Phone Number"
                    value={formData.phone}
                    onChange={handleChange("phone")}
                    placeholder="+1 (555) 000-0000"
                  />

                  <Select
                    label="Role/Designation"
                    value={formData.role}
                    onChange={handleChange("role")}
                    options={[
                      "Senior Engineer",
                      "Product Manager",
                      "UI/UX Designer",
                    ]}
                  />
                </div>

                <Select
                  label="Department"
                  value={formData.department}
                  onChange={handleChange("department")}
                  options={[
                    "Engineering",
                    "Human Resources",
                    "Marketing",
                    "Sales",
                  ]}
                />
              </Card>

              <Card title="Additional Notes">
                <TextArea
                  label="Internal Notes"
                  value={formData.notes}
                  onChange={handleChange("notes")}
                  placeholder="Recruitment details, equipment requirements..."
                />
              </Card>
            </div>

            <div className="space-y-6">
              <ImageDropzone
                onFileSelect={(file) =>
                  setFormData({ ...formData, profileImage: file })
                }
              />

              <Card title="Company Policy" icon={ShieldCheck}>
                <p className={`text-sm ${theme.textMuted} mb-4`}>
                  Adding this employee confirms compliance with company
                  privacy policies. Login credentials will be sent securely.
                </p>

                <div className={`flex justify-between text-xs font-bold uppercase tracking-wider border-t ${theme.border} pt-4`}>
                  <span className={theme.textMuted}>Status</span>
                  <span className="text-emerald-600">Secure</span>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AddEmployee;