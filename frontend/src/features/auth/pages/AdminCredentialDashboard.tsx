import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { credentialsApi } from '@/shared/api/credentials';
import { ProfessionalRoleRequest } from '@/shared/api/types';
import { FaUserMd, FaCheck, FaTimes, FaSearch, FaFilter, FaFileAlt } from 'react-icons/fa';
import { format } from 'date-fns';
import { MainLayout } from '@/shared/layout/MainLayout';

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

    // Helper to resolve full media URL
    const getMediaUrl = (path: string | null) => {
        if (!path) return '';
        if (path.startsWith('http')) return path;
        // Assuming backend is at valid URL. In dev: localhost:8000
        // We can check local env or hardcode for dev/demo if config is not exposed
        const baseUrl = 'http://localhost:8000';
        return `${baseUrl}${path}`;
    };

    return (
        <MainLayout>
            <div className="min-h-screen bg-gray-50 dark:bg-dark-bg p-6 md:p-8 transition-colors">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-zinc-100">Credential Verification</h1>
                            <p className="text-gray-500 dark:text-zinc-400 mt-1">Manage professional role requests</p>
                        </div>
                    </div>

                    {/* Filters & Search */}
                    <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800 p-4 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between transition-colors">
                        <div className="flex bg-gray-100 dark:bg-zinc-800 p-1 rounded-lg w-full md:w-auto">
                            {(['pending', 'approved', 'rejected', 'all'] as const).map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setFilterStatus(status)}
                                    className={`
                                    px-4 py-2 rounded-md text-sm font-medium capitalize transition-all
                                    ${filterStatus === status
                                            ? 'bg-white dark:bg-zinc-700 text-[#2774AE] dark:text-blue-400 shadow-sm'
                                            : 'text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-zinc-200'}
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
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-100 rounded-lg focus:ring-2 focus:ring-[#2774AE] focus:border-transparent outline-none transition-colors"
                            />
                        </div>
                    </div>

                    {/* Table */}
                    <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800 overflow-hidden transition-colors">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 dark:bg-zinc-800/50 border-b border-gray-200 dark:border-zinc-800">
                                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">User</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">Role Requested</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">License Info</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">Date Submitted</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">
                                    {isLoading ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-zinc-400">
                                                Loading requests...
                                            </td>
                                        </tr>
                                    ) : filteredRequests.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-zinc-400">
                                                No requests found.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredRequests.map((req) => (
                                            <tr key={req.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-gray-900 dark:text-zinc-100">
                                                            {req.user_details.first_name} {req.user_details.last_name}
                                                        </span>
                                                        <span className="text-sm text-gray-500 dark:text-zinc-500">{req.user_details.email}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                                        {req.role_requested}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col text-sm">
                                                        <span className="font-mono text-gray-700 dark:text-zinc-300">{req.license_number}</span>
                                                        <span className="text-gray-500 dark:text-zinc-500">{req.license_state}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500 dark:text-zinc-400">
                                                    {format(new Date(req.created_at), 'MMM d, yyyy')}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`
                                                    inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                                    ${req.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' : ''}
                                                    ${req.status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : ''}
                                                    ${req.status === 'rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' : ''}
                                                `}>
                                                        {req.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <button
                                                        onClick={() => setSelectedRequest(req)}
                                                        className="text-[#2774AE] dark:text-blue-400 hover:text-[#1e5a8a] dark:hover:text-blue-300 font-medium text-sm"
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
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
                        <div className="bg-white dark:bg-dark-surface rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto transition-colors">
                            <div className="p-6 border-b border-gray-200 dark:border-zinc-800 flex justify-between items-center transition-colors">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-zinc-100">Request Details</h2>
                                <button
                                    onClick={() => setSelectedRequest(null)}
                                    className="text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200"
                                >
                                    <FaTimes />
                                </button>
                            </div>

                            <div className="p-6 space-y-6">
                                {/* User Info */}
                                <div className="bg-gray-50 dark:bg-zinc-800/50 p-4 rounded-lg transition-colors">
                                    <h3 className="text-sm font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-3">User Information</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-zinc-500">Full Name</p>
                                            <p className="font-medium dark:text-zinc-200">{selectedRequest.user_details.first_name} {selectedRequest.user_details.last_name}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-zinc-500">Email</p>
                                            <p className="font-medium dark:text-zinc-200">{selectedRequest.user_details.email}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* License Info */}
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-3">License Details</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-zinc-500">Role Requested</p>
                                            <p className="font-medium text-blue-600 dark:text-blue-400">{selectedRequest.role_requested}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-zinc-500">Specialty</p>
                                            <p className="font-medium dark:text-zinc-200">{selectedRequest.specialty || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-zinc-500">License Number</p>
                                            <p className="font-mono bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded inline-block border border-yellow-200 dark:border-yellow-900/50 dark:text-yellow-200">
                                                {selectedRequest.license_number}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-zinc-500">State</p>
                                            <p className="font-medium dark:text-zinc-200">{selectedRequest.license_state}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Reason */}
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-2">Reason for Request</h3>
                                    <p className="text-gray-700 dark:text-zinc-300 bg-gray-50 dark:bg-zinc-800/50 p-3 rounded-lg text-sm transition-colors">
                                        {selectedRequest.reason}
                                    </p>
                                </div>

                                {/* Documents */}
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-3">Uploaded Documents</h3>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-zinc-700 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <FaFileAlt className="text-red-500" />
                                                <span className="font-medium text-sm dark:text-zinc-200">Medical License</span>
                                            </div>
                                            <a
                                                href={getMediaUrl(selectedRequest.license_document)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-[#2774AE] dark:text-blue-400 text-sm hover:underline"
                                            >
                                                View Document
                                            </a>
                                        </div>

                                        {selectedRequest.certification_document && (
                                            <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-zinc-700 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <FaFileAlt className="text-blue-500" />
                                                    <span className="font-medium text-sm dark:text-zinc-200">Board Certification</span>
                                                </div>
                                                <a
                                                    href={getMediaUrl(selectedRequest.certification_document)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-[#2774AE] dark:text-blue-400 text-sm hover:underline"
                                                >
                                                    View Document
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Footer Actions */}
                            <div className="p-6 border-t border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/50 rounded-b-xl flex justify-end gap-3 transition-colors">
                                {/* Pending State: Approve or Reject */}
                                {selectedRequest.status === 'pending' && (
                                    <>
                                        <button
                                            onClick={() => setShowActionModal('reject')}
                                            className="px-4 py-2 text-red-700 dark:text-red-400 font-medium hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors border border-transparent hover:border-red-200 dark:hover:border-red-900/50"
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
                                )}

                                {/* Approved State: Allow Revocation */}
                                {selectedRequest.status === 'approved' && (
                                    <button
                                        onClick={() => setShowActionModal('reject')}
                                        className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors shadow-sm flex items-center gap-2"
                                    >
                                        <FaTimes />
                                        Revoke Access
                                    </button>
                                )}

                                {/* Rejected State: Immutable */}
                                {selectedRequest.status === 'rejected' && (
                                    <div className="text-sm text-gray-500 dark:text-zinc-400 font-medium italic">
                                        Request was rejected on {selectedRequest.updated_at ? format(new Date(selectedRequest.updated_at), 'MMM d, yyyy') : 'Unknown date'}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Action Confirmation Modal */}
                {showActionModal && selectedRequest && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60] backdrop-blur-sm">
                        <div className={`bg-white dark:bg-dark-surface rounded-xl shadow-xl max-w-md w-full border-t-4 ${showActionModal === 'approve' ? 'border-green-500' : 'border-red-500'} transition-colors`}>
                            <div className="p-6">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-zinc-100 mb-2">
                                    {showActionModal === 'approve'
                                        ? 'Approve Access Request'
                                        : (selectedRequest.status === 'approved' ? 'Revoke Access' : 'Reject Access Request')
                                    }
                                </h3>
                                <p className="text-gray-600 dark:text-zinc-400 mb-6 text-sm">
                                    {showActionModal === 'approve'
                                        ? `Are you sure you want to verify credentials for ${selectedRequest.user_details.first_name}? This will grant them the ${selectedRequest.role_requested} role.`
                                        : (selectedRequest.status === 'approved'
                                            ? `Are you sure you want to REVOKE access for ${selectedRequest.user_details.first_name}? This will remove their ${selectedRequest.role_requested} privileges immediately.`
                                            : `Please provide a reason for rejecting the request from ${selectedRequest.user_details.first_name}.`
                                        )
                                    }
                                </p>

                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">
                                        {showActionModal === 'approve' ? 'Verification Notes (Optional)' : 'Rejection Reason (Required)'}
                                    </label>
                                    <textarea
                                        value={actionNote}
                                        onChange={(e) => setActionNote(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-100 rounded-lg focus:ring-2 focus:ring-[#2774AE] outline-none transition-colors"
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
                                        className="px-4 py-2 text-gray-600 dark:text-zinc-400 font-medium hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
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
        </MainLayout>
    );
}
