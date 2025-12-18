'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useUser } from '../context/UserContext';

export default function AuditPage() {
  const { role } = useUser();
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    if (role === 'ADMIN') {
      fetch('/api/audit-logs')
        .then(res => res.json())
        .then(setLogs);
    }
  }, [role]);

  if (role !== 'ADMIN') {
    return (
      <div className="p-8 text-center text-red-600">
        Access Denied. Admins only.
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/" className="text-gray-600 hover:text-gray-900">
            <ArrowLeft size={24} />
        </Link>
        <h1 className="text-3xl font-bold text-gray-800">System Audit Logs</h1>
      </div>
      
      <div className="bg-white rounded shadow overflow-hidden">
        <table className="w-full text-left text-sm">
            <thead className="bg-gray-100 border-b">
                <tr>
                    <th className="p-4 font-semibold">Time</th>
                    <th className="p-4 font-semibold">Action</th>
                    <th className="p-4 font-semibold">Entity</th>
                    <th className="p-4 font-semibold">Details</th>
                    <th className="p-4 font-semibold">User</th>
                </tr>
            </thead>
            <tbody>
                {logs.map((log: any) => (
                    <tr key={log.id} className="border-b hover:bg-gray-50">
                        <td className="p-4 text-gray-500">{new Date(log.createdAt).toLocaleString()}</td>
                        <td className="p-4 font-medium">
                            <span className={`px-2 py-1 rounded text-xs ${
                                log.action === 'CREATE' ? 'bg-green-100 text-green-800' :
                                log.action === 'UPDATE' ? 'bg-blue-100 text-blue-800' :
                                'bg-red-100 text-red-800'
                            }`}>
                                {log.action}
                            </span>
                        </td>
                        <td className="p-4">{log.entityType} ({log.entityId.substring(0, 8)}...)</td>
                        <td className="p-4 text-gray-600">{log.details}</td>
                        <td className="p-4">{log.userId || 'System'}</td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>
    </div>
  );
}
