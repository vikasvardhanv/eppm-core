'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { useUser } from './context/UserContext';

export default function Dashboard() {
  const { role } = useUser();
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    fetch('/api/projects')
      .then(async res => {
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      })
      .then(setProjects)
      .catch(err => console.error("Failed to fetch projects:", err));
  }, []);

  const createProject = async () => {
    const name = prompt("Project Name:");
    if (!name) return;
    const res = await fetch('/api/projects', {
      method: 'POST',
      body: JSON.stringify({ name, description: '', startDate: new Date() })
    });
    const newProject = await res.json();
    setProjects([newProject, ...projects] as any);
  };

  const setApiKey = async () => {
    const key = prompt("Enter Gemini API Key:");
    if (key) {
        await fetch('/api/settings/apikey', {
            method: 'POST',
            body: JSON.stringify({ apiKey: key })
        });
        alert("API Key saved. Please restart the server for it to take effect.");
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">EPPM Dashboard</h1>
        <div className="flex items-center">
            <Link href="/team" className="text-blue-600 hover:text-blue-800 mr-4 font-medium">
                My Tasks
            </Link>
            {role === 'ADMIN' && (
                <>
                    <Link href="/roles" className="text-blue-600 hover:text-blue-800 mr-4 font-medium">
                        Manage Roles
                    </Link>
                    <Link href="/resources" className="text-blue-600 hover:text-blue-800 mr-4 font-medium">
                        Manage Resources
                    </Link>
                    <Link href="/audit" className="text-blue-600 hover:text-blue-800 mr-4 font-medium">
                        Audit Logs
                    </Link>
                    <button onClick={setApiKey} className="text-gray-600 hover:text-gray-800 mr-4">
                        Set API Key
                    </button>
                    <button onClick={createProject} className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-blue-700">
                    <Plus size={16} /> New Project
                    </button>
                </>
            )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded shadow">
            <h3 className="text-gray-500 text-sm font-medium">Total Projects</h3>
            <p className="text-3xl font-bold text-gray-900">{projects.length}</p>
        </div>
        <div className="bg-white p-6 rounded shadow">
            <h3 className="text-gray-500 text-sm font-medium">Active Projects</h3>
            <p className="text-3xl font-bold text-green-600">{projects.filter((p: any) => p.status !== 'COMPLETED').length}</p>
        </div>
        <div className="bg-white p-6 rounded shadow">
            <h3 className="text-gray-500 text-sm font-medium">Completed Projects</h3>
            <p className="text-3xl font-bold text-blue-600">{projects.filter((p: any) => p.status === 'COMPLETED').length}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {projects.map((p: any) => (
          <Link href={`/projects/${p.id}`} key={p.id} className="block p-6 bg-white border rounded shadow hover:shadow-lg transition">
            <h2 className="text-xl font-semibold mb-2 text-gray-900">{p.name}</h2>
            <p className="text-gray-500 text-sm mb-4">Status: <span className="font-medium text-blue-600">{p.status}</span></p>
            <div className="text-xs text-gray-400">
              Start: {new Date(p.startDate).toLocaleDateString()}
            </div>
          </Link>
        ))}
        
        {projects.length === 0 && (
            <div className="col-span-3 text-center py-12 text-gray-500">
                No projects found. Create one to get started.
            </div>
        )}
      </div>
    </div>
  );
}
