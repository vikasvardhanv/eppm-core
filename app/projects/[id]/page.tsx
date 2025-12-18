'use client';
import { useState, useEffect, use } from 'react';
import { Gantt, Task, ViewMode } from 'gantt-task-react';
import "gantt-task-react/dist/index.css";
import { Plus, Play, MessageSquare } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, AreaChart, Area, ComposedChart } from 'recharts';
import { useUser } from '@/app/context/UserContext';

export default function ProjectDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { role } = useUser();
  const [project, setProject] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('activities');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [resources, setResources] = useState([]);
  const [baselines, setBaselines] = useState<any[]>([]);
  const [selectedBaseline, setSelectedBaseline] = useState<any>(null);
  const [editingActivity, setEditingActivity] = useState<any>(null);
  
  // AI Chat State
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<{role: string, content: string}[]>([]);
  const [generatedGraph, setGeneratedGraph] = useState<any>(null);

  useEffect(() => {
    loadProject();
    loadBaselines();
    fetch('/api/resources')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch resources');
        return res.json();
      })
      .then(setResources)
      .catch(err => console.error(err));
  }, [id]);

  const loadBaselines = async () => {
    const res = await fetch(`/api/projects/${id}/baselines`);
    if (res.ok) {
      const data = await res.json();
      setBaselines(data);
    }
  };

  const createBaseline = async () => {
    const name = prompt("Baseline Name:");
    if (!name) return;
    await fetch(`/api/projects/${id}/baselines`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    });
    loadBaselines();
  };

  const handleUpdateActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingActivity) return;
    
    await fetch(`/api/activities/${editingActivity.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: editingActivity.name,
        originalDuration: editingActivity.originalDuration,
        costCode: editingActivity.costCode
      })
    });
    
    setEditingActivity(null);
    loadProject();
  };

  const loadProject = async () => {
    try {
        const res = await fetch(`/api/projects/${id}`);
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        setProject(data);
        
        // Convert activities to Gantt tasks
        if (data.activities && data.activities.length > 0) {
            const ganttTasks = data.activities.map((a: any) => ({
                start: new Date(a.earlyStart || a.startDate || new Date()),
                end: new Date(a.earlyFinish || a.finishDate || new Date()),
                name: a.name,
                id: a.id,
                type: 'task',
                progress: 0,
                isDisabled: true,
                styles: { progressColor: a.isCritical ? '#ff4d4d' : '#ffbb54', progressSelectedColor: '#ff9e0d' },
            }));
            setTasks(ganttTasks);
        }
    } catch (e) {
        console.error("Failed to load project:", e);
    }
  };

  const runSchedule = async () => {
      await fetch(`/api/projects/${id}/schedule`, { method: 'POST' });
      loadProject();
  };

  const addActivity = async () => {
      const name = prompt("Activity Name:");
      const duration = prompt("Duration (hours):", "8");
      if (!name) return;
      
      await fetch(`/api/projects/${id}/activities`, {
          method: 'POST',
          body: JSON.stringify({ name, originalDuration: duration })
      });
      loadProject();
  };

  const askAI = async () => {
      if (!chatInput) return;
      const userMsg = { role: 'user', content: chatInput };
      setChatHistory([...chatHistory, userMsg]);
      setChatInput('');
      
      // Prepare context
      const context = JSON.stringify({
          project: {
              name: project.name,
              activities: project.activities.map((a: any) => ({
                  name: a.name,
                  duration: a.originalDuration,
                  start: a.earlyStart,
                  finish: a.earlyFinish,
                  float: a.totalFloat,
                  critical: a.isCritical
              }))
          }
      });
      
      const prompt = `Context: ${context}\n\nUser: ${chatInput}`;
      const isGraphRequest = chatInput.toLowerCase().includes('graph') || chatInput.toLowerCase().includes('chart');

      const res = await fetch('/api/gemini', {
          method: 'POST',
          body: JSON.stringify({ 
              prompt: isGraphRequest ? `${prompt} \n\n Generate a JSON object for a Recharts graph representing this data. Format: { type: 'bar' | 'line', data: [{name: string, value: number}, ...], title: string, xLabel: string, yLabel: string }` : prompt, 
              type: isGraphRequest ? 'json' : 'text' 
          })
      });
      
      if (isGraphRequest) {
          const data = await res.json();
          setGeneratedGraph(data);
          setChatHistory(prev => [...prev, { role: 'assistant', content: "Here is the graph you requested." }]);
      } else {
          const data = await res.json();
          setChatHistory(prev => [...prev, { role: 'assistant', content: data.text }]);
      }
  };

  if (!project) return <div>Loading...</div>;

  return (
    <div className="flex h-screen flex-col">
      <header className="bg-white border-b p-4 flex justify-between items-center">
        <div>
            <h1 className="text-2xl font-bold">{project.name}</h1>
            <p className="text-sm text-gray-500">{project.status}</p>
        </div>
        <div className="flex gap-2">
            {role === 'ADMIN' && (
              <button onClick={runSchedule} className="bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2">
                  <Play size={16} /> Run Schedule
              </button>
            )}
        </div>
      </header>
      
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-64 bg-gray-50 border-r p-4">
            <nav className="space-y-2">
                <button onClick={() => setActiveTab('activities')} className={`w-full text-left p-2 rounded ${activeTab === 'activities' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-200'}`}>Activities</button>
                <button onClick={() => setActiveTab('gantt')} className={`w-full text-left p-2 rounded ${activeTab === 'gantt' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-200'}`}>Gantt Chart</button>
                <button onClick={() => setActiveTab('resources')} className={`w-full text-left p-2 rounded ${activeTab === 'resources' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-200'}`}>Resource Analysis</button>
                <button onClick={() => setActiveTab('costs')} className={`w-full text-left p-2 rounded ${activeTab === 'costs' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-200'}`}>Cost & Cash Flow</button>
                <button onClick={() => setActiveTab('baselines')} className={`w-full text-left p-2 rounded ${activeTab === 'baselines' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-200'}`}>Baselines</button>
                <button onClick={() => setActiveTab('ai')} className={`w-full text-left p-2 rounded ${activeTab === 'ai' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-200'}`}>AI Insights</button>
            </nav>
        </aside>
        
        <main className="flex-1 p-6 overflow-auto">
            {activeTab === 'activities' && (
                <div>
                    <div className="flex justify-between mb-4">
                        <h2 className="text-xl font-bold">Activities</h2>
                        {role === 'ADMIN' && (
                          <button onClick={addActivity} className="bg-blue-600 text-white px-3 py-1 rounded flex items-center gap-1">
                              <Plus size={14} /> Add
                          </button>
                        )}
                    </div>
                    <table className="w-full border-collapse border">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="border p-2">Name</th>
                                <th className="border p-2">Cost Code</th>
                                <th className="border p-2">Duration</th>
                                <th className="border p-2">Start</th>
                                <th className="border p-2">Finish</th>
                                <th className="border p-2">Float</th>
                                <th className="border p-2">Predecessors</th>
                                <th className="border p-2">Resources</th>
                                <th className="border p-2">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {project.activities.map((a: any) => (
                                <tr key={a.id} className={a.isCritical ? "bg-red-50" : ""}>
                                    <td className="border p-2">{a.name}</td>
                                    <td className="border p-2">{a.costCode || '-'}</td>
                                    <td className="border p-2">{a.originalDuration}h</td>
                                    <td className="border p-2">{a.earlyStart ? new Date(a.earlyStart).toLocaleString() : '-'}</td>
                                    <td className="border p-2">{a.earlyFinish ? new Date(a.earlyFinish).toLocaleString() : '-'}</td>
                                    <td className="border p-2">{a.totalFloat}</td>
                                    <td className="border p-2 text-xs">
                                        {a.predecessors.map((p: any) => (
                                            <div key={p.id}>{p.predecessor?.name || 'Unknown'} ({p.type})</div>
                                        ))}
                                    </td>
                                    <td className="border p-2 text-xs">
                                        {a.assignments.map((asg: any) => (
                                            <div key={asg.id}>{asg.resource.name} ({asg.plannedUnits * 100}%) - ${asg.cost}</div>
                                        ))}
                                    </td>
                                    <td className="border p-2">
                                        {role === 'ADMIN' && (
                                          <button 
                                              onClick={() => setEditingActivity(a)}
                                              className="text-blue-600 hover:text-blue-800 text-sm"
                                          >
                                              Edit
                                          </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    
                    {role === 'ADMIN' && (
                    <div className="mt-8 grid grid-cols-2 gap-8">
                        <div className="border-t pt-4 bg-gray-50 p-4 rounded">
                            <h3 className="font-bold mb-2">Add Relationship</h3>
                            <div className="flex gap-2 flex-wrap">
                                <select id="pred" className="border p-2 rounded">
                                    <option value="">Select Predecessor</option>
                                    {project.activities.map((a: any) => <option key={a.id} value={a.id}>{a.name}</option>)}
                                </select>
                                <span className="self-center">→</span>
                                <select id="succ" className="border p-2 rounded">
                                    <option value="">Select Successor</option>
                                    {project.activities.map((a: any) => <option key={a.id} value={a.id}>{a.name}</option>)}
                                </select>
                                <select id="type" className="border p-2 rounded">
                                    <option value="FS">FS</option>
                                    <option value="SS">SS</option>
                                    <option value="FF">FF</option>
                                    <option value="SF">SF</option>
                                </select>
                                <input id="lag" type="number" placeholder="Lag (h)" className="border p-2 rounded w-24" defaultValue={0} />
                                <button onClick={async () => {
                                    const predId = (document.getElementById('pred') as HTMLSelectElement).value;
                                    const succId = (document.getElementById('succ') as HTMLSelectElement).value;
                                    const type = (document.getElementById('type') as HTMLSelectElement).value;
                                    const lag = (document.getElementById('lag') as HTMLInputElement).value;
                                    
                                    if (!predId || !succId) return;
                                    if (predId === succId) { alert("Cannot link activity to itself"); return; }
                                    
                                    await fetch('/api/relationships', {
                                        method: 'POST',
                                        body: JSON.stringify({ predecessorId: predId, successorId: succId, type, lag })
                                    });
                                    loadProject();
                                }} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Link</button>
                            </div>
                        </div>

                        <div className="border-t pt-4 bg-gray-50 p-4 rounded">
                            <h3 className="font-bold mb-2">Assign Resource</h3>
                            <div className="flex gap-2 flex-wrap">
                                <select id="resActivity" className="border p-2 rounded">
                                    <option value="">Select Activity</option>
                                    {project.activities.map((a: any) => <option key={a.id} value={a.id}>{a.name}</option>)}
                                </select>
                                <select id="resId" className="border p-2 rounded">
                                    <option value="">Select Resource</option>
                                    {resources.map((r: any) => <option key={r.id} value={r.id}>{r.name} (${r.unitPrice}/h)</option>)}
                                </select>
                                <input id="units" type="number" placeholder="Units (1.0 = 100%)" className="border p-2 rounded w-32" defaultValue={1.0} step={0.1} />
                                <button onClick={async () => {
                                    const activityId = (document.getElementById('resActivity') as HTMLSelectElement).value;
                                    const resourceId = (document.getElementById('resId') as HTMLSelectElement).value;
                                    const plannedUnits = (document.getElementById('units') as HTMLInputElement).value;
                                    
                                    if (!activityId || !resourceId) return;
                                    
                                    await fetch('/api/assignments', {
                                        method: 'POST',
                                        body: JSON.stringify({ activityId, resourceId, plannedUnits })
                                    });
                                    loadProject();
                                }} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Assign</button>
                            </div>
                        </div>
                    </div>
                    )}
                </div>
            )}
            
            {activeTab === 'gantt' && (
                <div className="h-full">
                    {tasks.length > 0 ? (
                        <Gantt tasks={tasks} viewMode={ViewMode.Day} />
                    ) : (
                        <p>No activities to display.</p>
                    )}
                </div>
            )}

            {activeTab === 'resources' && (
                <div className="h-full flex flex-col">
                    <h2 className="text-xl font-bold mb-4">Resource Utilization</h2>
                    <div className="flex-1">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={(() => {
                                    const dataMap = new Map<string, any>();
                                    project.activities.forEach((a: any) => {
                                        if (!a.earlyStart || !a.earlyFinish) return;
                                        const start = new Date(a.earlyStart);
                                        const end = new Date(a.earlyFinish);
                                        const duration = (end.getTime() - start.getTime()) / (1000 * 3600 * 24);
                                        
                                        for (let i = 0; i <= Math.ceil(duration); i++) {
                                            const date = new Date(start);
                                            date.setDate(date.getDate() + i);
                                            const dateStr = date.toLocaleDateString();
                                            
                                            if (!dataMap.has(dateStr)) dataMap.set(dateStr, { date: dateStr });
                                            const entry = dataMap.get(dateStr);
                                            
                                            a.assignments.forEach((asg: any) => {
                                                entry[asg.resource.name] = (entry[asg.resource.name] || 0) + asg.plannedUnits;
                                            });
                                        }
                                    });
                                    return Array.from(dataMap.values()).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                                })()}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis label={{ value: 'Units', angle: -90, position: 'insideLeft' }} />
                                <Tooltip />
                                <Legend />
                                {resources.map((r: any) => (
                                    <Bar key={r.id} dataKey={r.name} stackId="a" fill={`#${Math.floor(Math.random()*16777215).toString(16)}`} />
                                ))}
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {activeTab === 'costs' && (
                <div className="h-full flex flex-col">
                    <h2 className="text-xl font-bold mb-4">Cost S-Curve (Cash Flow) & EVM</h2>
                    
                    {(() => {
                        let totalPV = 0;
                        let totalEV = 0;
                        let totalAC = 0;
                        
                        project.activities.forEach((a: any) => {
                            const activityBudget = a.assignments.reduce((sum: number, asg: any) => sum + asg.cost, 0);
                            const activityAC = a.assignments.reduce((sum: number, asg: any) => sum + (asg.actualUnits * asg.resource.unitPrice), 0);
                            
                            totalPV += activityBudget;
                            totalEV += activityBudget * (a.percentComplete / 100);
                            totalAC += activityAC;
                        });
                        
                        const cpi = totalAC > 0 ? (totalEV / totalAC).toFixed(2) : '1.00';
                        const spi = totalPV > 0 ? (totalEV / totalPV).toFixed(2) : '1.00';
                        
                        return (
                            <div className="grid grid-cols-4 gap-4 mb-6">
                                <div className="bg-blue-50 p-4 rounded">
                                    <div className="text-sm text-gray-500">Budget at Completion (BAC)</div>
                                    <div className="text-2xl font-bold">${totalPV.toLocaleString()}</div>
                                </div>
                                <div className="bg-green-50 p-4 rounded">
                                    <div className="text-sm text-gray-500">Earned Value (EV)</div>
                                    <div className="text-2xl font-bold">${totalEV.toLocaleString()}</div>
                                </div>
                                <div className="bg-yellow-50 p-4 rounded">
                                    <div className="text-sm text-gray-500">Actual Cost (AC)</div>
                                    <div className="text-2xl font-bold">${totalAC.toLocaleString()}</div>
                                </div>
                                <div className="bg-purple-50 p-4 rounded">
                                    <div className="text-sm text-gray-500">CPI / SPI</div>
                                    <div className="text-2xl font-bold">{cpi} / {spi}</div>
                                </div>
                            </div>
                        );
                    })()}

                    <div className="flex-1">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart
                                data={(() => {
                                    const dataMap = new Map<string, any>();
                                    let cumulative = 0;
                                    
                                    // Get all dates
                                    const allDates = new Set<string>();
                                    project.activities.forEach((a: any) => {
                                        if (!a.earlyStart || !a.earlyFinish) return;
                                        const start = new Date(a.earlyStart);
                                        const end = new Date(a.earlyFinish);
                                        const duration = (end.getTime() - start.getTime()) / (1000 * 3600 * 24);
                                        for (let i = 0; i <= Math.ceil(duration); i++) {
                                            const date = new Date(start);
                                            date.setDate(date.getDate() + i);
                                            allDates.add(date.toLocaleDateString());
                                        }
                                    });
                                    
                                    const sortedDates = Array.from(allDates).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
                                    
                                    return sortedDates.map(dateStr => {
                                        const dateObj = new Date(dateStr);
                                        let dailyCost = 0;
                                        
                                        project.activities.forEach((a: any) => {
                                            if (!a.earlyStart || !a.earlyFinish) return;
                                            const start = new Date(a.earlyStart);
                                            const end = new Date(a.earlyFinish);
                                            
                                            if (dateObj >= start && dateObj <= end) {
                                                const durationHours = (end.getTime() - start.getTime()) / (1000 * 3600);
                                                if (durationHours > 0) {
                                                    const totalActivityCost = a.assignments.reduce((sum: number, asg: any) => sum + asg.cost, 0);
                                                    // Cost per hour * 24 hours (simplified daily distribution)
                                                    // Better: Cost / DurationDays
                                                    const durationDays = durationHours / 24;
                                                    dailyCost += totalActivityCost / (durationDays || 1);
                                                }
                                            }
                                        });
                                        
                                        cumulative += dailyCost;
                                        return { date: dateStr, cumulativeCost: Math.round(cumulative) };
                                    });
                                })()}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis label={{ value: 'Cost ($)', angle: -90, position: 'insideLeft' }} />
                                <Tooltip />
                                <Legend />
                                <Area type="monotone" dataKey="cumulativeCost" stroke="#82ca9d" fill="#82ca9d" name="Cumulative Cost (PV)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {activeTab === 'baselines' && (
                <div>
                    <div className="flex justify-between mb-6">
                        <h2 className="text-xl font-bold">Project Baselines</h2>
                        {role === 'ADMIN' && (
                            <button onClick={createBaseline} className="bg-purple-600 text-white px-4 py-2 rounded flex items-center gap-2">
                                <Plus size={16} /> Create Baseline
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-4 rounded shadow">
                            <h3 className="font-semibold mb-4">Available Baselines</h3>
                            <ul className="space-y-2">
                                {baselines.map((b: any) => (
                                    <li 
                                        key={b.id} 
                                        className={`p-3 border rounded cursor-pointer hover:bg-gray-50 ${selectedBaseline?.id === b.id ? 'border-purple-500 bg-purple-50' : ''}`}
                                        onClick={() => setSelectedBaseline(JSON.parse(b.data))}
                                    >
                                        <div className="font-medium">{b.name}</div>
                                        <div className="text-xs text-gray-500">{new Date(b.createdAt).toLocaleString()}</div>
                                    </li>
                                ))}
                                {baselines.length === 0 && <div className="text-gray-500 text-sm">No baselines created.</div>}
                            </ul>
                        </div>

                        <div className="md:col-span-2 bg-white p-4 rounded shadow overflow-auto">
                            <h3 className="font-semibold mb-4">Variance Analysis (Current vs Selected Baseline)</h3>
                            {selectedBaseline ? (
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-gray-100">
                                            <th className="p-2 text-left">Activity</th>
                                            <th className="p-2 text-left">BL Start</th>
                                            <th className="p-2 text-left">Curr Start</th>
                                            <th className="p-2 text-left">Start Var</th>
                                            <th className="p-2 text-left">BL Finish</th>
                                            <th className="p-2 text-left">Curr Finish</th>
                                            <th className="p-2 text-left">Finish Var</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {project.activities.map((curr: any) => {
                                            const bl = selectedBaseline.activities.find((a: any) => a.id === curr.id);
                                            if (!bl) return null;
                                            
                                            const startVar = (new Date(curr.earlyStart || 0).getTime() - new Date(bl.earlyStart || 0).getTime()) / (1000 * 3600 * 24);
                                            const finishVar = (new Date(curr.earlyFinish || 0).getTime() - new Date(bl.earlyFinish || 0).getTime()) / (1000 * 3600 * 24);
                                            
                                            return (
                                                <tr key={curr.id} className="border-b">
                                                    <td className="p-2 font-medium">{curr.name}</td>
                                                    <td className="p-2 text-gray-600">{bl.earlyStart ? new Date(bl.earlyStart).toLocaleDateString() : '-'}</td>
                                                    <td className="p-2">{curr.earlyStart ? new Date(curr.earlyStart).toLocaleDateString() : '-'}</td>
                                                    <td className={`p-2 font-bold ${startVar > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                                        {startVar.toFixed(1)}d
                                                    </td>
                                                    <td className="p-2 text-gray-600">{bl.earlyFinish ? new Date(bl.earlyFinish).toLocaleDateString() : '-'}</td>
                                                    <td className="p-2">{curr.earlyFinish ? new Date(curr.earlyFinish).toLocaleDateString() : '-'}</td>
                                                    <td className={`p-2 font-bold ${finishVar > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                                        {finishVar.toFixed(1)}d
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="text-center text-gray-500 py-8">Select a baseline to view variance analysis.</div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'ai' && (
                <div className="flex flex-col h-full">
                    <div className="flex-1 overflow-auto border p-4 rounded mb-4 bg-white">
                        {chatHistory.map((msg, i) => (
                            <div key={i} className={`mb-4 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                                <div className={`inline-block p-3 rounded-lg ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}>
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                        
                        {generatedGraph && (
                            <div className="mt-4 border p-4 rounded bg-gray-50">
                                <h3 className="text-lg font-bold mb-2">{generatedGraph.title}</h3>
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        {generatedGraph.type === 'line' ? (
                                            <LineChart data={generatedGraph.data}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="name" label={{ value: generatedGraph.xLabel, position: 'insideBottom', offset: -5 }} />
                                                <YAxis label={{ value: generatedGraph.yLabel, angle: -90, position: 'insideLeft' }} />
                                                <Tooltip />
                                                <Legend />
                                                <Line type="monotone" dataKey="value" stroke="#8884d8" />
                                            </LineChart>
                                        ) : (
                                            <BarChart data={generatedGraph.data}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="name" label={{ value: generatedGraph.xLabel, position: 'insideBottom', offset: -5 }} />
                                                <YAxis label={{ value: generatedGraph.yLabel, angle: -90, position: 'insideLeft' }} />
                                                <Tooltip />
                                                <Legend />
                                                <Bar dataKey="value" fill="#8884d8" />
                                            </BarChart>
                                        )}
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <input 
                            className="flex-1 border p-2 rounded" 
                            value={chatInput} 
                            onChange={e => setChatInput(e.target.value)}
                            placeholder="Ask Gemini about your schedule (e.g., 'Show me a duration graph')"
                            onKeyDown={e => e.key === 'Enter' && askAI()}
                        />
                        <button onClick={askAI} className="bg-purple-600 text-white px-4 py-2 rounded">
                            <MessageSquare size={16} />
                        </button>
                    </div>
                </div>
            )}
        </main>
      </div>

      {editingActivity && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Edit Activity</h2>
            <form onSubmit={handleUpdateActivity} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Activity Name</label>
                <input 
                  type="text" 
                  required
                  className="mt-1 block w-full border rounded-md p-2"
                  value={editingActivity.name}
                  onChange={e => setEditingActivity({...editingActivity, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Original Duration (hours)</label>
                <input 
                  type="number" 
                  required
                  className="mt-1 block w-full border rounded-md p-2"
                  value={editingActivity.originalDuration}
                  onChange={e => setEditingActivity({...editingActivity, originalDuration: Number(e.target.value)})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Cost Code (CBS)</label>
                <input 
                  type="text" 
                  className="mt-1 block w-full border rounded-md p-2"
                  value={editingActivity.costCode || ''}
                  onChange={e => setEditingActivity({...editingActivity, costCode: e.target.value})}
                  placeholder="e.g. 01-001-001"
                />
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button 
                  type="button"
                  onClick={() => setEditingActivity(null)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
