import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { credentialsApi } from '@/shared/api/credentials';
import { FaUpload, FaSpinner, FaCheckCircle } from 'react-icons/fa';

export function RequestProfessionalAccess() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        role_requested: 'Doctors',
        license_number: '',
        license_state: '',
        specialty: '',
        reason: '',
    });

    const [files, setFiles] = useState<{
        license_document: File | null;
        certification_document: File | null;
        employment_verification: File | null;
    }>({
        license_document: null,
        certification_document: null,
        employment_verification: null,
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFiles({
                ...files,
                [e.target.name]: e.target.files[0],
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        if (!files.license_document) {
            setError('Medical License document is required');
            setIsLoading(false);
            return;
        }

        try {
            const submitData = new FormData();
            submitData.append('role_requested', formData.role_requested);
            submitData.append('license_number', formData.license_number);
            submitData.append('license_state', formData.license_state);
            submitData.append('reason', formData.reason);
            if (formData.specialty) {
                submitData.append('specialty', formData.specialty);
            }

            // Append files
            submitData.append('license_document', files.license_document);
            if (files.certification_document) {
                submitData.append('certification_document', files.certification_document);
            }
            if (files.employment_verification) {
                submitData.append('employment_verification', files.employment_verification);
            }

            await credentialsApi.requestProfessionalRole(submitData);
            setSuccess(true);
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Failed to submit request. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
                    <div className="flex justify-center mb-4">
                        <FaCheckCircle className="text-green-500 text-6xl" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Request Submitted!</h2>
                    <p className="text-gray-600 mb-6">
                        Your request for professional access involves manual verification.
                        Our team will review your credentials within 24-48 hours.
                    </p>
                    <button
                        onClick={() => navigate('/dqr-health/dashboard')}
                        className="bg-[#2774AE] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#1e5a8a] transition shadow-sm"
                    >
                        Return to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    const US_STATES = [
        'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
        'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
        'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
        'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
        'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
    ];

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    {/* Header */}
                    <div className="bg-[#2774AE] px-8 py-6">
                        <h1 className="text-3xl font-bold text-white">Request Professional Access</h1>
                        <p className="text-blue-100 mt-2">
                            Submit your credentials for verification to access clinical features.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-8">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                                {error}
                            </div>
                        )}

                        {/* 1. Role Selection */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
                                1. Select Role
                            </h3>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                {['Doctors', 'Nurses', 'Pharmacists', 'Receptionists'].map((role) => (
                                    <label
                                        key={role}
                                        className={`
                                            flex items-center justify-center p-4 border rounded-lg cursor-pointer transition-all
                                            ${formData.role_requested === role
                                                ? 'border-[#2774AE] bg-blue-50 text-[#2774AE] ring-2 ring-[#2774AE] ring-opacity-50'
                                                : 'border-gray-200 hover:border-[#2774AE]'}
                                        `}
                                    >
                                        <input
                                            type="radio"
                                            name="role_requested"
                                            value={role}
                                            checked={formData.role_requested === role}
                                            onChange={handleInputChange}
                                            className="sr-only"
                                        />
                                        <span className="font-medium">{role.slice(0, -1)}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* 2. License Information */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
                                2. License Information
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        License Number *
                                    </label>
                                    <input
                                        type="text"
                                        name="license_number"
                                        value={formData.license_number}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2774AE] focus:border-transparent outline-none"
                                        placeholder="e.g. A1234567"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        License State *
                                    </label>
                                    <select
                                        name="license_state"
                                        value={formData.license_state}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2774AE] focus:border-transparent outline-none"
                                    >
                                        <option value="">Select State</option>
                                        {US_STATES.map((state) => (
                                            <option key={state} value={state}>{state}</option>
                                        ))}
                                    </select>
                                </div>
                                {formData.role_requested === 'Doctors' && (
                                    <div className="sm:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Specialty
                                        </label>
                                        <input
                                            type="text"
                                            name="specialty"
                                            value={formData.specialty}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2774AE] focus:border-transparent outline-none"
                                            placeholder="e.g. Cardiology, Pediatrics"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 3. Documents */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
                                3. Required Documents
                            </h3>
                            <div className="space-y-6">
                                {/* License Document (Required) */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Professional License (PDF/Image) *
                                    </label>
                                    <div className="flex items-center justify-center w-full">
                                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                <FaUpload className="w-8 h-8 text-gray-400 mb-2" />
                                                <p className="text-sm text-gray-500">
                                                    {files.license_document ? files.license_document.name : 'Click to upload or drag and drop'}
                                                </p>
                                            </div>
                                            <input
                                                type="file"
                                                name="license_document"
                                                className="hidden"
                                                accept=".pdf,.jpg,.jpeg,.png"
                                                onChange={handleFileChange}
                                                required
                                            />
                                        </label>
                                    </div>
                                </div>

                                {/* Certification (Optional) */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Board Certification (Optional)
                                    </label>
                                    <div className="flex items-center justify-center w-full">
                                        <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                <p className="text-sm text-gray-500">
                                                    {files.certification_document ? files.certification_document.name : 'Click to upload or drag and drop'}
                                                </p>
                                            </div>
                                            <input
                                                type="file"
                                                name="certification_document"
                                                className="hidden"
                                                accept=".pdf,.jpg,.jpeg,.png"
                                                onChange={handleFileChange}
                                            />
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 4. Reason */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
                                4. Reason for Request
                            </h3>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Please explain why you need professional access *
                                </label>
                                <textarea
                                    name="reason"
                                    value={formData.reason}
                                    onChange={handleInputChange}
                                    required
                                    minLength={50}
                                    rows={4}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2774AE] focus:border-transparent outline-none"
                                    placeholder="I am a new physician joining the Cardiology department..."
                                />
                                <p className="text-xs text-gray-500 mt-1 text-right">
                                    {formData.reason.length} / 50 characters minimum
                                </p>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-6">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex justify-center items-center gap-2 bg-[#2774AE] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#1e5a8a] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                            >
                                {isLoading ? (
                                    <>
                                        <FaSpinner className="animate-spin" />
                                        Submitting Request...
                                    </>
                                ) : (
                                    'Submit Verification Request'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
