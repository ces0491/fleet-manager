/**
 * Privacy Settings Component (POPIA Compliance)
 *
 * Allows users to exercise their data subject rights under POPIA.
 *
 * Copyright (c) 2025 Sheet Solved - Spreadsheets Solved
 * Licensed under GNU GPL v3.0
 */

import { useState } from 'react';
import axios from 'axios';

interface ConsentRecord {
  _id: string;
  consentType: string;
  consentGiven: boolean;
  consentDate: string;
  consentVersion: string;
  withdrawalDate?: string;
}

interface DataSubjectRequest {
  _id: string;
  requestType: string;
  status: string;
  requestDate: string;
  completionDate?: string;
  requestDetails?: string;
  responseDetails?: string;
}

export default function PrivacySettings() {
  const [activeTab, setActiveTab] = useState<'overview' | 'consents' | 'requests' | 'data'>('overview');
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [requests, setRequests] = useState<DataSubjectRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const loadConsents = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/data-subject/consents');
      setConsents(response.data.consents);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to load consents' });
    } finally {
      setLoading(false);
    }
  };

  const loadRequests = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/data-subject/my-requests');
      setRequests(response.data.requests);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to load requests' });
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/data-subject/export', {
        params: { format: 'json' },
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `my-data-${Date.now()}.json`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      setMessage({ type: 'success', text: 'Data exported successfully' });
    } catch (error: any) {
      setMessage({ type: 'error', text: 'Failed to export data' });
    } finally {
      setLoading(false);
    }
  };

  const handleRequestDeletion = async () => {
    try {
      setLoading(true);
      await axios.post('/api/data-subject/request-deletion', {
        reason: 'User requested account deletion',
      });
      setMessage({
        type: 'success',
        text: 'Deletion request submitted. Your request will be reviewed within 30 days.',
      });
      setShowDeleteConfirm(false);
      loadRequests();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to submit deletion request' });
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawConsent = async (consentType: string) => {
    try {
      setLoading(true);
      await axios.post('/api/data-subject/withdraw-consent', { consentType });
      setMessage({ type: 'success', text: 'Consent withdrawn successfully' });
      loadConsents();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to withdraw consent' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white shadow rounded-lg">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Privacy Settings</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage your data and exercise your rights under POPIA (Protection of Personal Information Act)
          </p>
        </div>

        {/* Message Alert */}
        {message && (
          <div className={`mx-6 mt-4 p-4 rounded ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
            <p>{message.text}</p>
            <button onClick={() => setMessage(null)} className="ml-2 underline">
              Dismiss
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex px-6 -mb-px space-x-8">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'consents', label: 'Consents' },
              { id: 'requests', label: 'My Requests' },
              { id: 'data', label: 'My Data' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  if (tab.id === 'consents') loadConsents();
                  if (tab.id === 'requests') loadRequests();
                }}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold mb-4">Your Rights Under POPIA</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { title: 'Right of Access', desc: 'View all personal information we hold about you' },
                    { title: 'Right to Correction', desc: 'Request corrections to inaccurate information' },
                    { title: 'Right to Deletion', desc: 'Request deletion of your account and data' },
                    { title: 'Right to Data Portability', desc: 'Export your data in machine-readable format' },
                    { title: 'Right to Object', desc: 'Object to certain data processing activities' },
                    { title: 'Right to Restrict Processing', desc: 'Limit how we process your data' },
                  ].map((right) => (
                    <div key={right.title} className="border rounded-lg p-4">
                      <h3 className="font-medium text-gray-900">{right.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{right.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-6">
                <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
                <div className="space-y-3">
                  <button
                    onClick={handleExportData}
                    disabled={loading}
                    className="w-full md:w-auto px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    Download My Data
                  </button>
                  <button
                    onClick={() => window.open('/PRIVACY_POLICY.md', '_blank')}
                    className="w-full md:w-auto px-4 py-2 ml-0 md:ml-3 border border-gray-300 rounded hover:bg-gray-50"
                  >
                    View Privacy Policy
                  </button>
                  <button
                    onClick={() => window.open('/TERMS_OF_SERVICE.md', '_blank')}
                    className="w-full md:w-auto px-4 py-2 ml-0 md:ml-3 border border-gray-300 rounded hover:bg-gray-50"
                  >
                    View Terms of Service
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Consents Tab */}
          {activeTab === 'consents' && (
            <div>
              <h2 className="text-lg font-semibold mb-4">Your Consent Records</h2>
              {loading ? (
                <p>Loading...</p>
              ) : consents.length === 0 ? (
                <p className="text-gray-600">No consent records found.</p>
              ) : (
                <div className="space-y-4">
                  {consents.map((consent) => (
                    <div key={consent._id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {consent.consentType.replace(/_/g, ' ').toUpperCase()}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            Status: {consent.consentGiven ? 'Consented' : 'Withdrawn'}
                          </p>
                          <p className="text-sm text-gray-600">
                            Consent Date: {new Date(consent.consentDate).toLocaleDateString()}
                          </p>
                          {consent.withdrawalDate && (
                            <p className="text-sm text-gray-600">
                              Withdrawn: {new Date(consent.withdrawalDate).toLocaleDateString()}
                            </p>
                          )}
                          <p className="text-sm text-gray-600">Version: {consent.consentVersion}</p>
                        </div>
                        {consent.consentGiven && (
                          <button
                            onClick={() => handleWithdrawConsent(consent.consentType)}
                            disabled={loading}
                            className="px-3 py-1 text-sm text-red-600 border border-red-600 rounded hover:bg-red-50 disabled:opacity-50"
                          >
                            Withdraw
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Requests Tab */}
          {activeTab === 'requests' && (
            <div>
              <h2 className="text-lg font-semibold mb-4">Your Data Subject Requests</h2>
              {loading ? (
                <p>Loading...</p>
              ) : requests.length === 0 ? (
                <p className="text-gray-600">No requests found.</p>
              ) : (
                <div className="space-y-4">
                  {requests.map((request) => (
                    <div key={request._id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {request.requestType.toUpperCase()} Request
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">Status: {request.status}</p>
                          <p className="text-sm text-gray-600">
                            Requested: {new Date(request.requestDate).toLocaleDateString()}
                          </p>
                          {request.completionDate && (
                            <p className="text-sm text-gray-600">
                              Completed: {new Date(request.completionDate).toLocaleDateString()}
                            </p>
                          )}
                          {request.requestDetails && (
                            <p className="text-sm text-gray-600 mt-2">Details: {request.requestDetails}</p>
                          )}
                        </div>
                        <span
                          className={`px-2 py-1 text-xs rounded ${
                            request.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : request.status === 'rejected'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {request.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* My Data Tab */}
          {activeTab === 'data' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold mb-4">Access Your Data</h2>
                <p className="text-gray-600 mb-4">
                  You have the right to access all personal information we hold about you. Click below to view or
                  export your data.
                </p>
                <button
                  onClick={handleExportData}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  Download My Data (JSON)
                </button>
              </div>

              <div className="border-t pt-6">
                <h2 className="text-lg font-semibold mb-4 text-red-600">Delete My Account</h2>
                <p className="text-gray-600 mb-4">
                  Permanently delete your account and all associated data. This action cannot be undone.
                </p>
                {!showDeleteConfirm ? (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Request Account Deletion
                  </button>
                ) : (
                  <div className="bg-red-50 border border-red-200 rounded p-4">
                    <p className="text-red-800 font-medium mb-3">Are you absolutely sure?</p>
                    <p className="text-red-700 text-sm mb-4">
                      This will submit a deletion request. Your account and data will be deleted after review (within
                      30 days). Some data may be retained for legal obligations.
                    </p>
                    <div className="flex space-x-3">
                      <button
                        onClick={handleRequestDeletion}
                        disabled={loading}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                      >
                        Yes, Delete My Account
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(false)}
                        className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Information Regulator Contact */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2">Lodge a Complaint</h3>
        <p className="text-sm text-blue-800 mb-2">
          If you have concerns about how we handle your personal information, you can lodge a complaint with the
          Information Regulator of South Africa:
        </p>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Website: https://inforegulator.org.za</li>
          <li>• Email: inforeg@justice.gov.za</li>
          <li>• Phone: 012 406 4818</li>
        </ul>
      </div>
    </div>
  );
}
