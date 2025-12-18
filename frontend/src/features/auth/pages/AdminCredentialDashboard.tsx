import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { credentialsApi } from '@/shared/api/credentials';
import { ProfessionalRoleRequest } from '@/shared/api/types';
import { FaUserMd, FaCheck, FaTimes, FaSearch, FaFilter, FaFileAlt } from 'react-icons/fa';
import { format } from 'date-fns';

export function AdminCredentialDashboard() {
    const { user } = useAuth();
    const [requests, setRequests] = useState<ProfessionalRoleRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRequest, setSelectedRequest] = useState<ProfessionalRoleRequest | null>(null);
    const [actionNote, setActionNote] = useState('');
    const [actionLoading, setActionLoading] = useState(false);
    const [showActionModal, setShowActionModal] = useState<'approve' | 'reject' | null>(null);

    // Fetch requests
    useEffect(() => {
        const fetchRequests = async () => {
            setIsLoading(true);
            try {
                // Determine params based on filter
                const params: any = {};
                if (filterStatus !== 'all') {
                    params.status = filterStatus;
                }

                const data = await credentialsApi.listRequests(params);
                setRequests(data);
            } catch (err: any) {
                console.error(err);
                setError('Failed to load credential requests.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchRequests();
    }, [filterStatus]);

    // Derived state for search filtering
    const filteredRequests = requests.filter(req => {
        const searchLower = searchQuery.toLowerCase();
        return (
            req.user_details.first_name.toLowerCase().includes(searchLower) ||
            req.user_details.last_name.toLowerCase().includes(searchLower) ||
            req.license_number.toLowerCase().includes(searchLower) ||
            req.user_details.email.toLowerCase().includes(searchLower)
        );
    });

    const handleApprove = async () => {
        if (!selectedRequest) return;
        setActionLoading(true);
        try {
            await credentialsApi.approveRequest(selectedRequest.id, actionNote);
            // Refresh list
            const data = await credentialsApi.listRequests(filterStatus !== 'all' ? { status: filterStatus } : {});
            setRequests(data);
            setShowActionModal(null);
            setSelectedRequest(null);
            setActionNote('');
        } catch (err: any) {
            alert(err.message || 'Failed to approve request');
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async () => {
        if (!selectedRequest) return;
        if (!actionNote) {
            alert('Rejection reason is required');
            return;
        }
        setActionLoading(true);
        try {
            await credentialsApi.rejectRequest(selectedRequest.id, actionNote);
            // Refresh list
            const data = await credentialsApi.listRequests(filterStatus !== 'all' ? { status: filterStatus } : {});
            setRequests(data);
            setShowActionModal(null);
            setSelectedRequest(null);
            setActionNote('');
        } catch (err: any) {
            alert(err.message || 'Failed to reject request');
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Credential Verification</h1>
                        <p className="text-gray-500 mt-1">Manage professional role requests</p>
                    </div>
                </div>

                {/* Filters & Search */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="flex bg-gray-100 p-1 rounded-lg w-full md:w-auto">
                        {(['pending', 'approved', 'rejected', 'all'] as const).map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                className={`
                                    px-4 py-2 rounded-md text-sm font-medium capitalize transition-all
                                    ${filterStatus === status
                                        ? 'bg-white text-[#2774AE] shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700'}
                                `}
                            >
                                {status}
                            </button>
                        ))}
                    </div>

                    <div className="relative w-full md:w-72">
                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name, email or license..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2774AE] focus:border-transparent outline-none"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200">
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role Requested</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">License Info</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date Submitted</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                            Loading requests...
                                        </td>
                                    </tr>
                                ) : filteredRequests.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                            No requests found.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredRequests.map((req) => (
                                        <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-gray-900">
                                                        {req.user_details.first_name} {req.user_details.last_name}
                                                    </span>
                                                    <span className="text-sm text-gray-500">{req.user_details.email}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                    {req.role_requested}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col text-sm">
                                                    <span className="font-mono text-gray-700">{req.license_number}</span>
                                                    <span className="text-gray-500">{req.license_state}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {format(new Date(req.created_at), 'MMM d, yyyy')}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`
                                                    inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                                    ${req.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                                                    ${req.status === 'approved' ? 'bg-green-100 text-green-800' : ''}
                                                    ${req.status === 'rejected' ? 'bg-red-100 text-red-800' : ''}
                                                `}>
                                                    {req.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => setSelectedRequest(req)}
                                                    className="text-[#2774AE] hover:text-[#1e5a8a] font-medium text-sm"
                                                >
                                                    View Details
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Detail Modal */}
            {selectedRequest && !showActionModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-900">Request Details</h2>
                            <button
                                onClick={() => setSelectedRequest(null)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <FaTimes />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* User Info */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">User Information</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-gray-500">Full Name</p>
                                        <p className="font-medium">{selectedRequest.user_details.first_name} {selectedRequest.user_details.last_name}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Email</p>
                                        <p className="font-medium">{selectedRequest.user_details.email}</p>
                                    </div>
                                </div>
                            </div>

                            {/* License Info */}
                            <div>
                                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">License Details</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-gray-500">Role Requested</p>
                                        <p className="font-medium text-blue-600">{selectedRequest.role_requested}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Specialty</p>
                                        <p className="font-medium">{selectedRequest.specialty || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">License Number</p>
                                        <p className="font-mono bg-yellow-50 px-2 py-1 rounded inline-block border border-yellow-200">
                                            {selectedRequest.license_number}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">State</p>
                                        <p className="font-medium">{selectedRequest.license_state}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Reason */}
                            <div>
                                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Reason for Request</h3>
                                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg text-sm">
                                    {selectedRequest.reason}
                                </p>
                            </div>

                            {/* Documents */}
                            <div>
                                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Uploaded Documents</h3>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                                        <div className="flex items-center gap-3">
                                            <FaFileAlt className="text-red-500" />
                                            <span className="font-medium text-sm">Medical License</span>
                                        </div>
                                        <a
                                            href={selectedRequest.license_document}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-[#2774AE] text-sm hover:underline"
                                        >
                                            View Document
                                        </a>
                                    </div>

                                    {selectedRequest.certification_document && (
                                        <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                                            <div className="flex items-center gap-3">
                                                <FaFileAlt className="text-blue-500" />
                                                <span className="font-medium text-sm">Board Certification</span>
                                            </div>
                                            <a
                                                href={selectedRequest.certification_document}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-[#2774AE] text-sm hover:underline"
                                            >
                                                View Document
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl flex justify-end gap-3">
                            {selectedRequest.status === 'pending' ? (
                                <>
                                    <button
                                        onClick={() => setShowActionModal('reject')}
                                        className="px-4 py-2 text-red-700 font-medium hover:bg-red-100 rounded-lg transition-colors border border-transparent hover:border-red-200"
                                    >
                                        Reject Request
                                    </button>
                                    <button
                                        onClick={() => setShowActionModal('approve')}
                                        className="px-4 py-2 bg-[#2774AE] text-white font-medium rounded-lg hover:bg-[#1e5a8a] transition-colors shadow-sm"
                                    >
                                        Approve Request
                                    </button>
                                </>
                            ) : (
                                <div className="text-sm text-gray-500 font-medium italic">
                                    Request was {selectedRequest.status} on {selectedRequest.updated_at ? format(new Date(selectedRequest.updated_at), 'MMM d, yyyy') : 'Unknown date'}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Action Confirmation Modal */}
            {showActionModal && selectedRequest && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]">
                    <div className={`bg-white rounded-xl shadow-xl max-w-md w-full border-t-4 ${showActionModal === 'approve' ? 'border-green-500' : 'border-red-500'}`}>
                        <div className="p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                {showActionModal === 'approve' ? 'Approve Access Request' : 'Reject Access Request'}
                            </h3>
                            <p className="text-gray-600 mb-6 text-sm">
                                {showActionModal === 'approve'
                                    ? `Are you sure you want to verify credentials for ${selectedRequest.user_details.first_name}? This will grant them the ${selectedRequest.role_requested} role.`
                                    : `Please provide a reason for rejecting the request from ${selectedRequest.user_details.first_name}.`
                                }
                            </p>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {showActionModal === 'approve' ? 'Verification Notes (Optional)' : 'Rejection Reason (Required)'}
                                </label>
                                <textarea
                                    value={actionNote}
                                    onChange={(e) => setActionNote(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2774AE] outline-none"
                                    rows={3}
                                    placeholder={showActionModal === 'approve' ? 'e.g. Verified with State Board...' : 'e.g. License number not found...'}
                                />
                            </div>

                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => {
                                        setShowActionModal(null);
                                        setActionNote('');
                                    }}
                                    className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={showActionModal === 'approve' ? handleApprove : handleReject}
                                    disabled={actionLoading}
                                    className={`
                                        px-4 py-2 text-white font-medium rounded-lg shadow-sm flex items-center gap-2
                                        ${showActionModal === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
                                    `}
                                >
                                    {actionLoading && <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>}
                                    {showActionModal === 'approve' ? 'Confirm Approval' : 'Confirm Rejection'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
