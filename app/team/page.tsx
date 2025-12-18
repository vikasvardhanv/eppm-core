'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle } from 'lucide-react';

export default function TeamPage() {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    // In a real app, we would filter by logged-in user
    // Here we fetch all active tasks from all projects
    fetch('/api/team/tasks').then(res => res.json()).then(setTasks);
  }, []);

  const updateTask = async (taskId: string, percentComplete: number, remainingDuration: number) => {
    await fetch(`/api/activities/${taskId}`, {
        method: 'PATCH',
        body: JSON.stringify({ percentComplete, remainingDuration })
    });
    // Refresh
    const res = await fetch('/api/team/tasks');
    setTasks(await res.json());
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/" className="text-gray-600 hover:text-gray-900">
            <ArrowLeft size={24} />
        </Link>
        <h1 className="text-3xl font-bold text-gray-800">My Tasks</h1>
      </div>
      
      <div className="bg-white rounded shadow overflow-hidden">
        <table className="w-full text-left">
            <thead className="bg-gray-100 border-b">
                <tr>
                    <th className="p-4 font-semibold">Project</th>
                    <th className="p-4 font-semibold">Activity</th>
                    <th className="p-4 font-semibold">Start</th>
                    <th className="p-4 font-semibold">Finish</th>
                    <th className="p-4 font-semibold">% Complete</th>
                    <th className="p-4 font-semibold">Remaining (h)</th>
                    <th className="p-4 font-semibold">Action</th>
                </tr>
            </thead>
            <tbody>
                {tasks.map((t: any) => (
                    <tr key={t.id} className="border-b hover:bg-gray-50">
                        <td className="p-4 text-sm text-gray-500">{t.project.name}</td>
                        <td className="p-4 font-medium">{t.name}</td>
                        <td className="p-4 text-sm">{t.earlyStart ? new Date(t.earlyStart).toLocaleDateString() : '-'}</td>
                        <td className="p-4 text-sm">{t.earlyFinish ? new Date(t.earlyFinish).toLocaleDateString() : '-'}</td>
                        <td className="p-4">
                            <input 
                                type="number" 
                                min="0" max="100" 
                                defaultValue={t.percentComplete}
                                className="border rounded p-1 w-16"
                                id={`pct-${t.id}`}
                            />
                        </td>
                        <td className="p-4">
                            <input 
                                type="number" 
                                min="0"
                                defaultValue={t.remainingDuration}
                                className="border rounded p-1 w-16"
                                id={`rem-${t.id}`}
                            />
                        </td>
                        <td className="p-4">
                            <button 
                                onClick={() => {
                                    const pct = (document.getElementById(`pct-${t.id}`) as HTMLInputElement).value;
                                    const rem = (document.getElementById(`rem-${t.id}`) as HTMLInputElement).value;
                                    updateTask(t.id, Number(pct), Number(rem));
                                }}
                                className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                            >
                                Update
                            </button>
                        </td>
                    </tr>
                ))}
                {tasks.length === 0 && (
                    <tr>
                        <td colSpan={7} className="p-8 text-center text-gray-500">No active tasks found.</td>
                    </tr>
                )}
            </tbody>
        </table>
      </div>
    </div>
  );
}
