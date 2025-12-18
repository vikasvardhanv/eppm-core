'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, ArrowLeft } from 'lucide-react';
import { useUser } from '../context/UserContext';

interface Role {
  id: string;
  name: string;
}

interface Resource {
  id: string;
  name: string;
  type: string;
  unitPrice: number;
  maxUnits: number;
  roleId?: string;
  role?: Role;
}

export default function ResourcesPage() {
  const { role } = useUser();
  const [resources, setResources] = useState<Resource[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newResource, setNewResource] = useState<Partial<Resource>>({
    name: '',
    type: 'LABOR',
    unitPrice: 50,
    maxUnits: 1.0,
    roleId: ''
  });

  useEffect(() => {
    fetch('/api/resources')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch resources');
        return res.json();
      })
      .then(setResources)
      .catch(console.error);

    fetch('/api/roles')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch roles');
        return res.json();
      })
      .then(setRoles)
      .catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/resources', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newResource)
    });
    const created = await res.json();
    setResources([...resources, created]);
    setIsModalOpen(false);
    setNewResource({ name: '', type: 'LABOR', unitPrice: 50, maxUnits: 1.0, roleId: '' });
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/" className="text-gray-600 hover:text-gray-900">
            <ArrowLeft size={24} />
        </Link>
        <h1 className="text-3xl font-bold text-gray-800">Resource Dictionary</h1>
        {role === 'ADMIN' && (
          <button onClick={() => setIsModalOpen(true)} className="ml-auto bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-blue-700">
            <Plus size={16} /> Add Resource
          </button>
        )}
      </div>
      
      <div className="bg-white rounded shadow overflow-hidden">
        <table className="w-full text-left">
            <thead className="bg-gray-100 border-b">
                <tr>
                    <th className="p-4 font-semibold">Name</th>
                    <th className="p-4 font-semibold">Type</th>
                    <th className="p-4 font-semibold">Role</th>
                    <th className="p-4 font-semibold">Max Units</th>
                    <th className="p-4 font-semibold">Unit Price</th>
                </tr>
            </thead>
            <tbody>
                {resources.map((r) => (
                    <tr key={r.id} className="border-b hover:bg-gray-50">
                        <td className="p-4">{r.name}</td>
                        <td className="p-4"><span className="px-2 py-1 bg-gray-200 rounded text-xs">{r.type}</span></td>
                        <td className="p-4">{r.role?.name || '-'}</td>
                        <td className="p-4">{r.maxUnits * 100}%</td>
                        <td className="p-4">${r.unitPrice}/hr</td>
                    </tr>
                ))}
                {resources.length === 0 && (
                    <tr>
                        <td colSpan={5} className="p-8 text-center text-gray-500">No resources defined.</td>
                    </tr>
                )}
            </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Add New Resource</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input 
                  type="text" 
                  required
                  className="mt-1 block w-full border rounded-md p-2"
                  value={newResource.name}
                  onChange={e => setNewResource({...newResource, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Type</label>
                <select 
                  className="mt-1 block w-full border rounded-md p-2"
                  value={newResource.type}
                  onChange={e => setNewResource({...newResource, type: e.target.value})}
                >
                  <option value="LABOR">Labor</option>
                  <option value="NON_LABOR">Non-Labor</option>
                  <option value="MATERIAL">Material</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Role (Optional)</label>
                <select 
                  className="mt-1 block w-full border rounded-md p-2"
                  value={newResource.roleId}
                  onChange={e => setNewResource({...newResource, roleId: e.target.value})}
                >
                  <option value="">None</option>
                  {roles.map(role => (
                    <option key={role.id} value={role.id}>{role.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Unit Price ($/hr)</label>
                <input 
                  type="number" 
                  className="mt-1 block w-full border rounded-md p-2"
                  value={newResource.unitPrice}
                  onChange={e => setNewResource({...newResource, unitPrice: Number(e.target.value)})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Max Units (1.0 = 100%)</label>
                <input 
                  type="number" 
                  step="0.1"
                  className="mt-1 block w-full border rounded-md p-2"
                  value={newResource.maxUnits}
                  onChange={e => setNewResource({...newResource, maxUnits: Number(e.target.value)})}
                />
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Create Resource
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
