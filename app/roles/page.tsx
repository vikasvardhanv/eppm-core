'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUser } from '../context/UserContext';

interface Role {
  id: string;
  name: string;
  maxUnits: number;
  resources: any[];
}

export default function RolesPage() {
  const { role } = useUser();
  const [roles, setRoles] = useState<Role[]>([]);
  const [newRole, setNewRole] = useState({ name: '', maxUnits: 1.0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const res = await fetch('/api/roles');
      if (!res.ok) throw new Error('Failed to fetch roles');
      const data = await res.json();
      setRoles(data);
    } catch (error) {
      console.error('Failed to fetch roles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRole),
      });
      
      if (res.ok) {
        setNewRole({ name: '', maxUnits: 1.0 });
        fetchRoles();
      }
    } catch (error) {
      console.error('Failed to create role:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/" className="text-xl font-bold text-indigo-600">
                  P6 EPPM
                </Link>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link href="/" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Projects
                </Link>
                <Link href="/resources" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Resources
                </Link>
                <Link href="/roles" className="border-indigo-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Roles
                </Link>
                <Link href="/team" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Team
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">Roles Dictionary</h1>
          </div>

          {role === 'ADMIN' && (
          <div className="bg-white shadow sm:rounded-lg mb-6 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Add New Role</h2>
            <form onSubmit={handleCreateRole} className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Role Name
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="name"
                    id="name"
                    required
                    value={newRole.name}
                    onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                    placeholder="e.g. Senior Engineer"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="maxUnits" className="block text-sm font-medium text-gray-700">
                  Max Units (FTE)
                </label>
                <div className="mt-1">
                  <input
                    type="number"
                    name="maxUnits"
                    id="maxUnits"
                    step="0.1"
                    required
                    value={newRole.maxUnits}
                    onChange={(e) => setNewRole({ ...newRole, maxUnits: parseFloat(e.target.value) })}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                  />
                </div>
              </div>

              <div className="sm:col-span-1 flex items-end">
                <button
                  type="submit"
                  className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Add Role
                </button>
              </div>
            </form>
          </div>
          )}

          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {roles.map((role) => (
                <li key={role.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-indigo-600 truncate">{role.name}</p>
                      <div className="ml-2 flex-shrink-0 flex">
                        <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Max Units: {role.maxUnits}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500">
                          Resources: {role.resources?.length || 0}
                        </p>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
              {roles.length === 0 && !loading && (
                <li className="px-4 py-4 sm:px-6 text-center text-gray-500">
                  No roles defined yet.
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
