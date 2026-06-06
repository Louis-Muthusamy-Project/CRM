import { useEffect, useState } from 'react'
import { useCRM } from '../CRMProvider'
import { verifyLocalStorage, verifyDatabase, findDataDiscrepancies, generateVerificationReport } from '../lib/dataSync'
import { verifyStoredData } from '../storage'

export default function DataVerification() {
  const { dataSync, state } = useCRM()
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(false)
  const [syncResult, setSyncResult] = useState(null)
  const [activeTab, setActiveTab] = useState('summary')

  const handleGenerateReport = async () => {
    setLoading(true)
    try {
      const fullReport = await generateVerificationReport()
      setReport(fullReport)
    } catch (error) {
      console.error('Failed to generate report:', error)
      setReport({ error: error.message })
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyAndSync = async () => {
    setLoading(true)
    try {
      const result = await dataSync.verifyAndSync()
      setSyncResult(result)
      // Re-generate report after sync
      setTimeout(handleGenerateReport, 1000)
    } catch (error) {
      setSyncResult({ ok: false, error: error.message })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    handleGenerateReport()
  }, [])

  if (!report) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Data Verification</h1>
        <p className="text-gray-600">Loading...</p>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Data Verification & Sync Dashboard</h1>

      {/* Sync Result Alert */}
      {syncResult && (
        <div
          className={`mb-4 p-4 rounded-lg ${
            syncResult.ok ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}
        >
          {syncResult.ok ? '✓ Sync completed successfully!' : `✗ Sync failed: ${syncResult.error}`}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={handleGenerateReport}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Generating...' : 'Generate Report'}
        </button>
        <button
          onClick={handleVerifyAndSync}
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? 'Syncing...' : 'Verify & Sync'}
        </button>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-2 border-b">
        {['summary', 'localStorage', 'database', 'discrepancies', 'details'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-semibold ${
              activeTab === tab
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Summary Tab */}
      {activeTab === 'summary' && (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-lg border">
            <h3 className="font-semibold text-lg mb-2">Local Storage</h3>
            <p className="text-sm text-gray-600 mb-2">
              Status: {report.localStorage?.exists ? '✓ OK' : '✗ Not Found'}
            </p>
            <p className="text-sm">
              {report.localStorage?.data?.clients?.length || 0} clients
            </p>
            <p className="text-sm">
              {report.localStorage?.data?.tasks?.length || 0} tasks
            </p>
            <p className="text-sm">
              {report.localStorage?.data?.activities?.length || 0} activities
            </p>
            <p className="text-sm">
              {report.localStorage?.data?.projects?.length || 0} projects
            </p>
          </div>

          <div className="bg-white p-4 rounded-lg border">
            <h3 className="font-semibold text-lg mb-2">Database</h3>
            <p className="text-sm text-gray-600 mb-2">
              Status: {report.database?.connected ? '✓ Connected' : '✗ Disconnected'}
            </p>
            <p className="text-sm">
              {report.database?.collections?.clients || 0} clients
            </p>
            <p className="text-sm">
              {report.database?.collections?.tasks || 0} tasks
            </p>
            <p className="text-sm">
              {report.database?.collections?.activities || 0} activities
            </p>
            <p className="text-sm">
              {report.database?.collections?.projects || 0} projects
            </p>
          </div>
        </div>
      )}

      {/* LocalStorage Tab */}
      {activeTab === 'localStorage' && (
        <div className="bg-white p-4 rounded-lg border">
          <div className="mb-4">
            <h3 className="font-semibold mb-2">Status</h3>
            <p className="text-sm">
              Exists: {report.localStorage?.exists ? 'Yes ✓' : 'No ✗'}
            </p>
            <p className="text-sm">
              Valid: {report.localStorage?.missing?.length === 0 ? 'Yes ✓' : 'No ✗'}
            </p>
          </div>

          {report.localStorage?.missing?.length > 0 && (
            <div className="mb-4">
              <h3 className="font-semibold mb-2 text-orange-600">Missing Items</h3>
              <ul className="list-disc pl-5">
                {report.localStorage.missing.map((item, i) => (
                  <li key={i} className="text-sm text-orange-600">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {report.localStorage?.errors?.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2 text-red-600">Errors</h3>
              <ul className="list-disc pl-5">
                {report.localStorage.errors.map((error, i) => (
                  <li key={i} className="text-sm text-red-600">
                    {error}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-4 pt-4 border-t">
            <h4 className="font-semibold mb-2">Data Summary</h4>
            <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-64">
              {JSON.stringify(
                {
                  clients: (report.localStorage?.data?.clients || []).length,
                  tasks: (report.localStorage?.data?.tasks || []).length,
                  activities: (report.localStorage?.data?.activities || []).length,
                  projects: (report.localStorage?.data?.projects || []).length,
                },
                null,
                2,
              )}
            </pre>
          </div>
        </div>
      )}

      {/* Database Tab */}
      {activeTab === 'database' && (
        <div className="bg-white p-4 rounded-lg border">
          <h3 className="font-semibold mb-2">Status</h3>
          <p className="text-sm">
            Connected: {report.database?.connected ? 'Yes ✓' : 'No ✗'}
          </p>

          {report.database?.errors?.length > 0 && (
            <div className="mt-4 p-3 bg-red-100 rounded text-red-800">
              <p className="font-semibold">Errors:</p>
              {report.database.errors.map((error, i) => (
                <p key={i} className="text-sm">
                  {error}
                </p>
              ))}
            </div>
          )}

          {report.database?.collections && (
            <div className="mt-4 pt-4 border-t">
              <h4 className="font-semibold mb-2">Collections</h4>
              <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
                {JSON.stringify(report.database.collections, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* Discrepancies Tab */}
      {activeTab === 'discrepancies' && (
        <div className="space-y-4">
          {report.discrepancies?.missingInDatabase &&
          Object.values(report.discrepancies.missingInDatabase).some((arr) => arr?.length > 0) ? (
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <h3 className="font-semibold text-yellow-800 mb-2">Missing in Database</h3>
              <pre className="bg-white p-2 rounded text-xs overflow-auto">
                {JSON.stringify(report.discrepancies.missingInDatabase, null, 2)}
              </pre>
            </div>
          ) : (
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <p className="text-green-800">✓ All local storage items are in database</p>
            </div>
          )}

          {report.discrepancies?.missingInLocalStorage &&
          Object.values(report.discrepancies.missingInLocalStorage).some((arr) => arr?.length > 0) ? (
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <h3 className="font-semibold text-yellow-800 mb-2">Missing in Local Storage</h3>
              <pre className="bg-white p-2 rounded text-xs overflow-auto">
                {JSON.stringify(report.discrepancies.missingInLocalStorage, null, 2)}
              </pre>
            </div>
          ) : (
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <p className="text-green-800">✓ All database items are in local storage</p>
            </div>
          )}
        </div>
      )}

      {/* Details Tab */}
      {activeTab === 'details' && (
        <div className="bg-white p-4 rounded-lg border">
          <h3 className="font-semibold mb-4">Full Report</h3>
          <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto max-h-96">
            {JSON.stringify(report, null, 2)}
          </pre>
        </div>
      )}

      {/* Footer */}
      <div className="mt-6 text-xs text-gray-600 bg-gray-50 p-4 rounded">
        <p>Last updated: {report.timestamp}</p>
      </div>
    </div>
  )
}
