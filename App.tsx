
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Users, 
  UserPlus, 
  ClipboardCheck, 
  LayoutDashboard, 
  ArrowLeft, 
  Plus, 
  Check, 
  X, 
  TrendingUp, 
  Search,
  Trash2,
  Calendar,
  AlertCircle,
  Camera,
  Image as ImageIcon,
  Volume2,
  Clock,
  CircleStop,
  Filter
} from 'lucide-react';
import { Worker, AttendanceRecord, AppView, AttendanceStatus, LastMarked } from './types.ts';
import { getAIInsights } from './services/geminiService.ts';

const LOCAL_STORAGE_KEY = 'hazira_khata_data';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('dashboard');
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [currentDate] = useState(new Date().toISOString().split('T')[0]);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [loadingInsight, setLoadingInsight] = useState(false);
  const [lastMarked, setLastMarked] = useState<LastMarked | null>(null);

  // Persistence
  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      setWorkers(parsed.workers || []);
      setAttendance(parsed.attendance || []);
    } else {
      const mockWorkers: Worker[] = [
        { id: '1', workerIdNum: '১০০১', name: 'রহিম মোল্লা', phone: '01712345678', designation: 'মিস্ত্রি', joinDate: '2024-01-01' },
        { id: '2', workerIdNum: '১০০২', name: 'করিম শেখ', phone: '01812345678', designation: 'হেল্পার', joinDate: '2024-01-05' },
        { id: '3', workerIdNum: '১০০৩', name: 'আলি আহমেদ', phone: '01912345678', designation: 'মিস্ত্রি', joinDate: '2024-01-10' },
      ];
      setWorkers(mockWorkers);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ workers, attendance }));
  }, [workers, attendance]);

  // Derived Stats
  const todayAttendance = useMemo(() => {
    return attendance.filter(r => r.date === currentDate);
  }, [attendance, currentDate]);

  const presentCount = useMemo(() => {
    return todayAttendance.filter(r => r.status === 'present').length;
  }, [todayAttendance]);

  const remainingCount = workers.length - todayAttendance.length;

  const handleToggleAttendance = (workerId: string, status: AttendanceStatus) => {
    const worker = workers.find(w => w.id === workerId);
    const nowTime = new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' });
    
    setAttendance(prev => {
      const existing = prev.findIndex(r => r.workerId === workerId && r.date === currentDate);
      if (existing > -1) {
        const updated = [...prev];
        updated[existing] = { ...updated[existing], status, time: status === 'present' ? nowTime : undefined };
        return updated;
      }
      return [...prev, { date: currentDate, workerId, status, time: status === 'present' ? nowTime : undefined }];
    });
    
    if (status === 'present' && worker) {
      setLastMarked({
        name: worker.name,
        time: nowTime
      });
    }
  };

  const handleAddWorker = (worker: Omit<Worker, 'id' | 'joinDate'>) => {
    const newWorker: Worker = {
      ...worker,
      id: crypto.randomUUID(),
      joinDate: new Date().toISOString().split('T')[0]
    };
    setWorkers(prev => [...prev, newWorker]);
    setView('workers');
  };

  const handleDeleteWorker = (id: string) => {
    if (window.confirm('আপনি কি নিশ্চিত যে এই শ্রমিককে বাদ দিতে চান?')) {
      setWorkers(prev => prev.filter(w => w.id !== id));
      setAttendance(prev => prev.filter(a => a.workerId !== id));
    }
  };

  const fetchInsights = async () => {
    setLoadingInsight(true);
    const insight = await getAIInsights(workers, attendance);
    setAiInsight(insight);
    setLoadingInsight(false);
  };

  const Dashboard = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-white rounded-3xl p-6 shadow-xl border border-blue-50">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-3 bg-blue-50 rounded-2xl">
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-1">মোট শ্রমিক</p>
            <p className="text-2xl font-bold text-blue-600 leading-tight">{workers.length}</p>
          </div>
          <div className="p-3 bg-green-50 rounded-2xl">
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-1">উপস্থিত</p>
            <p className="text-2xl font-bold text-green-600 leading-tight">{presentCount}</p>
          </div>
          <div className="p-3 bg-amber-50 rounded-2xl">
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-1">বাকি আছে</p>
            <p className="text-2xl font-bold text-amber-600 leading-tight">{remainingCount}</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <button 
          onClick={() => setView('active-session')}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white p-6 rounded-2xl shadow-lg flex items-center justify-between transition-all transform active:scale-95 group"
        >
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-xl">
              <ClipboardCheck className="w-6 h-6" />
            </div>
            <div className="text-left">
              <span className="block text-xl font-bold">🟢 হাজিরা শুরু করুন</span>
              <span className="text-xs text-emerald-100 opacity-80">স্মার্ট ভয়েস অ্যাসিস্ট্যান্ট সহ</span>
            </div>
          </div>
          <div className="bg-white/10 p-2 rounded-full group-hover:translate-x-1 transition-transform">
            <Plus className="w-5 h-5" />
          </div>
        </button>

        <button onClick={() => setView('add-worker')} className="w-full bg-blue-600 hover:bg-blue-700 text-white p-5 rounded-2xl shadow-md flex items-center gap-4 transition-all transform active:scale-95">
          <div className="bg-white/20 p-2 rounded-lg"><UserPlus className="w-5 h-5" /></div>
          <span className="text-lg font-semibold">নতুন শ্রমিক যোগ করুন</span>
        </button>

        <button onClick={() => setView('workers')} className="w-full bg-slate-500 hover:bg-slate-600 text-white p-5 rounded-2xl shadow-md flex items-center gap-4 transition-all transform active:scale-95">
          <div className="bg-white/20 p-2 rounded-lg"><Users className="w-5 h-5" /></div>
          <span className="text-lg font-semibold">সব শ্রমিক দেখুন</span>
        </button>
      </div>
    </div>
  );

  const ActiveSessionView = () => (
    <div className="animate-in zoom-in duration-300 flex flex-col items-center justify-center space-y-8 py-4">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full font-bold animate-pulse">
          <span className="w-3 h-3 bg-green-500 rounded-full"></span>
          হাজিরা চলছে...
        </div>
      </div>

      <div className="w-full bg-white rounded-[2.5rem] p-8 shadow-2xl border-4 border-emerald-50 space-y-8">
        <div className="grid grid-cols-1 gap-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <span className="text-gray-500 font-semibold">মোট শ্রমিক:</span>
            <span className="text-3xl font-black text-gray-800">{workers.length}</span>
          </div>
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <span className="text-emerald-600 font-semibold flex items-center gap-2">
              <Check className="w-5 h-5" /> উপস্থিত:
            </span>
            <span className="text-4xl font-black text-emerald-600">{presentCount} ✅</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-amber-500 font-semibold flex items-center gap-2">
              <Clock className="w-5 h-5" /> বাকি আছে:
            </span>
            <span className="text-3xl font-black text-amber-500">{remainingCount} ⏳</span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-3 py-4 bg-blue-50 rounded-2xl">
          <Volume2 className="w-6 h-6 text-blue-600" />
          <span className="font-bold text-blue-800">শব্দ চালু আছে</span>
        </div>

        {lastMarked && (
          <div className="space-y-3 bg-slate-50 p-6 rounded-3xl border border-slate-100">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center">শেষ হাজিরা</p>
            <div className="flex items-center justify-center gap-4">
              <div className="bg-white p-2 rounded-xl shadow-sm text-lg font-bold text-slate-700">
                ⏰ {lastMarked.time}
              </div>
              <div className="text-2xl font-black text-slate-900">
                {lastMarked.name}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="w-full px-4 text-center">
        <p className="text-sm text-gray-400 font-medium mb-6 italic">
          (এখন আপনি অন্য অ্যাপ দিয়ে ছবি তুলতে পারেন)
        </p>
        
        <button 
          onClick={() => setView('dashboard')}
          className="w-full bg-red-500 hover:bg-red-600 text-white p-6 rounded-[2rem] shadow-xl flex items-center justify-center gap-3 transition-all transform active:scale-95 group"
        >
          <CircleStop className="w-8 h-8 group-hover:rotate-12 transition-transform" />
          <span className="text-2xl font-black">🛑 বন্ধ করুন</span>
        </button>
      </div>
    </div>
  );

  const AttendanceView = () => {
    const [filter, setFilter] = useState<'all' | 'pending' | 'present'>('all');

    const filteredWorkers = useMemo(() => {
      return workers.filter(worker => {
        const record = todayAttendance.find(r => r.workerId === worker.id);
        if (filter === 'present') return record?.status === 'present';
        if (filter === 'pending') return !record || record.status !== 'present';
        return true;
      });
    }, [workers, todayAttendance, filter]);

    return (
      <div className="animate-in slide-in-from-right duration-300">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => setView('dashboard')} className="p-2 hover:bg-gray-200 rounded-full">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h2 className="text-2xl font-bold">আজকের হাজিরা তালিকা</h2>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          <div className="flex items-center gap-1 bg-white p-1 rounded-2xl shadow-sm border border-gray-100">
            <button 
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${filter === 'all' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              সবাই
            </button>
            <button 
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${filter === 'pending' ? 'bg-amber-500 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              বাকি আছে
            </button>
            <button 
              onClick={() => setFilter('present')}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${filter === 'present' ? 'bg-emerald-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              উপস্থিত
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {filteredWorkers.map(worker => {
            const record = todayAttendance.find(r => r.workerId === worker.id);
            const isPresent = record?.status === 'present';

            return (
              <div 
                key={worker.id} 
                onClick={() => handleToggleAttendance(worker.id, isPresent ? 'absent' : 'present')}
                className={`bg-white p-5 rounded-[2rem] shadow-sm border transition-all active:scale-[0.98] cursor-pointer flex items-center justify-between ${isPresent ? 'border-emerald-100 bg-emerald-50/20' : 'border-gray-100'}`}
              >
                <div className="flex items-center gap-4">
                  {/* Status Indicator Dot */}
                  <div className={`w-4 h-4 rounded-full shadow-inner ${isPresent ? 'bg-emerald-500' : 'bg-gray-300'}`}></div>
                  
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-gray-800 text-lg">{worker.name}</h4>
                      {isPresent && <Check className="w-5 h-5 text-emerald-600 font-bold" />}
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-gray-400">ID: {worker.workerIdNum || 'নেই'}</p>
                      <p className="text-xs font-medium text-gray-500">
                        {isPresent ? `সময়: ${record.time || '--:--'}` : 'হাজিরা নেই'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className={`p-3 rounded-2xl transition-all ${isPresent ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                  {isPresent ? <Check className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
                </div>
              </div>
            );
          })}
          
          {filteredWorkers.length === 0 && (
            <div className="text-center py-20 text-gray-400">
              <AlertCircle className="w-16 h-16 mx-auto mb-4 opacity-10" />
              <p className="font-bold">এই তালিকায় কেউ নেই</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const WorkerListView = () => {
    const [search, setSearch] = useState('');
    const filtered = workers.filter(w => w.name.toLowerCase().includes(search.toLowerCase()));

    return (
      <div className="animate-in slide-in-from-right duration-300">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button onClick={() => setView('dashboard')} className="p-2 hover:bg-gray-200 rounded-full">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-bold">শ্রমিক তালিকা</h2>
          </div>
          <button onClick={() => setView('add-worker')} className="bg-blue-600 text-white p-2 rounded-xl">
            <Plus className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-3">
          {filtered.map(worker => (
            <div key={worker.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                {worker.photo ? (
                  <img src={worker.photo} className="w-12 h-12 rounded-full object-cover" alt="" />
                ) : (
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                    {worker.name.charAt(0)}
                  </div>
                )}
                <div>
                  <h4 className="font-bold text-gray-800">{worker.name}</h4>
                  <p className="text-xs text-gray-500">{worker.designation} {worker.workerIdNum ? `• ID: ${worker.workerIdNum}` : ''}</p>
                  <p className="text-[10px] text-gray-400">{worker.phone}</p>
                </div>
              </div>
              <button onClick={() => handleDeleteWorker(worker.id)} className="p-2 text-gray-300 hover:text-red-500">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const AddWorkerView = () => {
    const [name, setName] = useState('');
    const [workerIdNum, setWorkerIdNum] = useState('');
    const [phone, setPhone] = useState('');
    const [designation, setDesignation] = useState('হেল্পার');
    const [photo, setPhoto] = useState<string | null>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);
    const galleryInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPhoto(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    };

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!name) return;
      handleAddWorker({ 
        name, 
        phone, 
        designation, 
        workerIdNum, 
        photo: photo || undefined 
      });
    };

    return (
      <div className="animate-in slide-in-from-bottom duration-300">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => setView('dashboard')} className="p-2 hover:bg-gray-200 rounded-full">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h2 className="text-2xl font-bold">নতুন শ্রমিক যোগ করুন</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-3xl shadow-xl">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-600">নাম লিখুন:</label>
            <input required type="text" className="w-full p-4 rounded-2xl bg-gray-50 border-none ring-1 ring-gray-200 focus:ring-2 focus:ring-blue-500" placeholder="যেমন: রহিম মিয়া" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-600">আইডি নম্বর (ঐচ্ছিক):</label>
            <input type="text" className="w-full p-4 rounded-2xl bg-gray-50 border-none ring-1 ring-gray-200 focus:ring-2 focus:ring-blue-500" placeholder="যেমন: ১০০১" value={workerIdNum} onChange={(e) => setWorkerIdNum(e.target.value)} />
          </div>
          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-600 block">ছবি তুলুন:</label>
            <div className="flex gap-4">
              <button type="button" onClick={() => cameraInputRef.current?.click()} className="flex-1 border-2 border-dashed border-gray-200 rounded-2xl p-4 flex flex-col items-center justify-center gap-1 hover:border-blue-400 transition-colors bg-gray-50">
                <div className="bg-blue-100 p-2 rounded-lg text-blue-600"><Camera className="w-6 h-6" /></div>
                <span className="text-xs font-bold text-gray-500">ক্যামেরা</span>
              </button>
              <button type="button" onClick={() => galleryInputRef.current?.click()} className="flex-1 border-2 border-dashed border-gray-200 rounded-2xl p-4 flex flex-col items-center justify-center gap-1 hover:border-blue-400 transition-colors bg-gray-50">
                <div className="bg-purple-100 p-2 rounded-lg text-purple-600"><ImageIcon className="w-6 h-6" /></div>
                <span className="text-xs font-bold text-gray-500">গ্যালারি</span>
              </button>
            </div>
            <input type="file" accept="image/*" capture="environment" className="hidden" ref={cameraInputRef} onChange={handleFileChange} />
            <input type="file" accept="image/*" className="hidden" ref={galleryInputRef} onChange={handleFileChange} />
            {photo && (
              <div className="mt-2 relative inline-block">
                <img src={photo} alt="Preview" className="w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-md" />
                <button type="button" onClick={() => setPhoto(null)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg"><X className="w-4 h-4" /></button>
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase">ফোন</label>
              <input type="tel" className="w-full p-3 rounded-xl bg-gray-50 ring-1 ring-gray-100 text-sm" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="০১৭..." />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase">পদবী</label>
              <select className="w-full p-3 rounded-xl bg-gray-50 ring-1 ring-gray-100 text-sm" value={designation} onChange={(e) => setDesignation(e.target.value)}>
                <option value="মিস্ত্রি">মিস্ত্রি</option>
                <option value="হেল্পার">হেল্পার</option>
                <option value="লেবার">লেবার</option>
              </select>
            </div>
          </div>
          <button type="submit" className="w-full bg-emerald-600 text-white p-5 rounded-2xl font-bold shadow-xl mt-4 flex items-center justify-center gap-2 hover:bg-emerald-700 active:scale-95 transition-all">
            <Check className="w-6 h-6" /> ✅ সেভ করুন
          </button>
        </form>
      </div>
    );
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-gray-50 flex flex-col pb-20">
      <header className="p-6 bg-white flex items-center justify-between sticky top-0 z-10 border-b border-gray-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-600 p-2 rounded-xl text-white shadow-lg">
            <LayoutDashboard className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">হাজিরা খাতা</h1>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Digital Attendance</p>
          </div>
        </div>
        <div className="bg-gray-100 px-3 py-1 rounded-full flex items-center gap-2">
          <Calendar className="w-3 h-3 text-gray-500" />
          <span className="text-xs font-bold text-gray-600">
            {new Date().toLocaleDateString('bn-BD')}
          </span>
        </div>
      </header>

      <main className="p-5 flex-1 overflow-y-auto">
        {view === 'dashboard' && <Dashboard />}
        {view === 'active-session' && <ActiveSessionView />}
        {view === 'attendance' && <AttendanceView />}
        {view === 'workers' && <WorkerListView />}
        {view === 'add-worker' && <AddWorkerView />}
      </main>

      {!['add-worker', 'active-session'].includes(view) && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-lg border-t border-gray-100 flex justify-around max-w-md mx-auto z-20">
          <button onClick={() => setView('dashboard')} className={`p-3 rounded-2xl transition-all ${view === 'dashboard' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-blue-600'}`}>
            <LayoutDashboard className="w-6 h-6" />
          </button>
          <button onClick={() => setView('attendance')} className={`p-3 rounded-2xl transition-all ${view === 'attendance' ? 'bg-emerald-600 text-white shadow-lg' : 'text-gray-400 hover:text-emerald-600'}`}>
            <ClipboardCheck className="w-6 h-6" />
          </button>
          <button onClick={() => setView('workers')} className={`p-3 rounded-2xl transition-all ${view === 'workers' ? 'bg-slate-600 text-white shadow-lg' : 'text-gray-400 hover:text-slate-600'}`}>
            <Users className="w-6 h-6" />
          </button>
        </div>
      )}
    </div>
  );
};

export default App;
