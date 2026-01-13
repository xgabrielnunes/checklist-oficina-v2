import React, { useState, useEffect } from 'react';
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, onSnapshot } from "firebase/firestore";
import { 
  Printer, RotateCcw, ClipboardList, CheckSquare, XSquare, 
  MinusSquare, Wrench, Zap, LayoutGrid, Disc, Settings 
} from 'lucide-react';

// --- CHAVE SECRETA ---

// -------------------------------------------

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default function App() {
  const [header, setHeader] = useState({ cliente: '', carro: '', placa: '', km: '', data: new Date().toISOString().split('T')[0] });
  const [observacoes, setObservacoes] = useState('');
  const [checklistItems, setChecklistItems] = useState([
    { id: 3, label: 'Chave de Roda', category: 'ferramentas', status: 0 },
    { id: 4, label: 'Macaco', category: 'ferramentas', status: 0 },
    { id: 5, label: 'Triângulo', category: 'ferramentas', status: 0 },
    { id: 6, label: 'Estepe', category: 'ferramentas', status: 0 },
    { id: 22, label: 'Disco', category: 'freio', status: 0 },
    { id: 23, label: 'Pastilha', category: 'freio', status: 0 },
    { id: 24, label: 'Fluido de freio', category: 'freio', status: 0 },
    { id: 25, label: 'Freio de mão', category: 'freio', status: 0 },
    { id: 30, label: 'Óleo de Motor', category: 'motor', status: 0 },
    { id: 31, label: 'Filtro de Óleo', category: 'motor', status: 0 },
    { id: 32, label: 'Correia Dentada', category: 'motor', status: 0 },
    { id: 33, label: 'Correia Alternador', category: 'motor', status: 0 },
    { id: 34, label: 'Arrefecimento', category: 'motor', status: 0 },
    { id: 35, label: 'Injeção Eletrônica', category: 'motor', status: 0 },
    { id: 12, label: 'Bateria', category: 'eletrica', status: 0 },
    { id: 14, label: 'Buzina', category: 'eletrica', status: 0 },
    { id: 15, label: 'Luzes Painel', category: 'eletrica', status: 0 },
    { id: 16, label: 'Faróis / Lanternas', category: 'eletrica', status: 0 },
    { id: 13, label: 'Limpadores / Palhetas', category: 'geral', status: 0 },
    { id: 20, label: 'Ar Condicionado', category: 'geral', status: 0 },
  ]);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "vistorias", "atual"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if(data.items) setChecklistItems(data.items);
        if(data.header) setHeader(data.header);
        if(data.observacoes) setObservacoes(data.observacoes);
      }
    });
    return () => unsub();
  }, []);

  const saveToFirebase = async (newItems, newHeader, newObs) => {
    try {
        await setDoc(doc(db, "vistorias", "atual"), {
        items: newItems, header: newHeader, observacoes: newObs, lastUpdate: new Date()
        });
    } catch (e) { console.error("Erro:", e); }
  };

  const toggleStatus = (id) => {
    const updated = checklistItems.map(item => item.id === id ? { ...item, status: (item.status + 1) % 3 } : item);
    setChecklistItems(updated);
    saveToFirebase(updated, header, observacoes);
  };

  const handleHeaderChange = (e, field) => {
    const updatedHeader = { ...header, [field]: e.target.value };
    setHeader(updatedHeader);
    saveToFirebase(checklistItems, updatedHeader, observacoes);
  };

  const handleReset = async () => {
    if(confirm("Deseja limpar todos os campos para uma nova vistoria?")) {
      const resetHeader = { ...header, cliente: '', carro: '', placa: '', km: '' };
      const resetItems = checklistItems.map(i => ({...i, status: 0}));
      setObservacoes('');
      await saveToFirebase(resetItems, resetHeader, '');
    }
  };

  const ChecklistGroup = ({ title, icon: Icon, categoryFilter }) => (
    <div className="mb-6 break-inside-avoid bg-white rounded-lg border border-slate-100 shadow-sm overflow-hidden">
      <h3 className="flex items-center gap-2 font-bold text-slate-800 bg-slate-50 p-3 border-b border-slate-100 uppercase text-xs tracking-wider">
        <Icon className="h-4 w-4 text-blue-600" /> {title}
      </h3>
      <div className="divide-y divide-slate-100">
        {checklistItems.filter(i => i.category === categoryFilter).map((item) => (
          <div key={item.id} onClick={() => toggleStatus(item.id)} className="flex items-center justify-between p-3 md:p-4 cursor-pointer hover:bg-blue-50 transition-colors active:bg-blue-100">
            <span className="text-base font-medium text-slate-700">{item.label}</span>
            <div className="flex items-center gap-2">
              {item.status === 0 && <MinusSquare className="text-slate-300" size={28} strokeWidth={1.5} />}
              {item.status === 1 && <CheckSquare className="text-green-600" size={28} strokeWidth={2.5} />}
              {item.status === 2 && <XSquare className="text-red-600" size={28} strokeWidth={2.5} />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-900 pb-12">
      {/* Barra Superior Fixa */}
      <div className="bg-slate-900 text-white p-3 sticky top-0 z-50 shadow-lg print:hidden flex justify-between items-center">
        <div className="flex items-center gap-2 text-sm md:text-base">
            <ClipboardList className="text-yellow-400 h-5 w-5" /> 
            <span className="font-bold tracking-tight">Mecânica Nunes</span>
        </div>
        <div className="flex gap-2">
          <button onClick={handleReset} className="p-2 bg-slate-700 rounded hover:bg-slate-600 transition text-slate-200" title="Limpar">
            <RotateCcw size={18}/>
          </button>
          <button onClick={() => window.print()} className="px-3 py-2 bg-blue-600 font-bold rounded flex items-center gap-2 shadow hover:bg-blue-500 text-sm">
            <Printer size={18}/> <span className="hidden md:inline">Imprimir</span>
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-3 md:p-6 mt-2">
        {/* Cabeçalho do Cliente */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
          <div className="flex justify-between items-start mb-4 border-b border-slate-100 pb-2">
             <h1 className="text-xl md:text-2xl font-black uppercase text-slate-800">Checklist</h1>
             <input type="date" className="font-bold text-slate-600 bg-transparent border-none text-right focus:ring-0 p-0" value={header.data} onChange={(e) => handleHeaderChange(e, 'data')} />
          </div>
          
          <div className="space-y-4">
            <div>
                <label className="text-xs font-bold text-slate-400 uppercase">Cliente</label>
                <input className="w-full text-lg font-semibold border-b border-slate-300 focus:border-blue-500 focus:outline-none py-1 bg-transparent uppercase text-slate-800 placeholder-slate-300" placeholder="Nome do Cliente" value={header.cliente} onChange={(e) => handleHeaderChange(e, 'cliente')} />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="text-xs font-bold text-slate-400 uppercase">Veículo</label>
                    <input className="w-full text-base font-medium border-b border-slate-300 focus:border-blue-500 focus:outline-none py-1 bg-transparent uppercase placeholder-slate-300" placeholder="Modelo / Marca" value={header.carro} onChange={(e) => handleHeaderChange(e, 'carro')} />
                </div>
                <div className="flex gap-4">
                    <div className="w-1/2">
                        <label className="text-xs font-bold text-slate-400 uppercase">Placa</label>
                        <input className="w-full text-base font-medium border-b border-slate-300 focus:border-blue-500 focus:outline-none py-1 bg-transparent uppercase placeholder-slate-300" placeholder="ABC-1234" value={header.placa} onChange={(e) => handleHeaderChange(e, 'placa')} />
                    </div>
                    <div className="w-1/2">
                        <label className="text-xs font-bold text-slate-400 uppercase">KM</label>
                        <input className="w-full text-base font-medium border-b border-slate-300 focus:border-blue-500 focus:outline-none py-1 bg-transparent placeholder-slate-300" type="number" placeholder="00000" value={header.km} onChange={(e) => handleHeaderChange(e, 'km')} />
                    </div>
                </div>
            </div>
          </div>
        </section>

        {/* Itens do Checklist */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div className="space-y-4">
            <ChecklistGroup title="Ferramentas" icon={Wrench} categoryFilter="ferramentas" />
            <ChecklistGroup title="Sistema de Freio" icon={Disc} categoryFilter="freio" />
            <ChecklistGroup title="Geral" icon={LayoutGrid} categoryFilter="geral" />
          </div>
          <div className="space-y-4">
            <ChecklistGroup title="Motor" icon={Settings} categoryFilter="motor" />
            <ChecklistGroup title="Elétrica" icon={Zap} categoryFilter="eletrica" />
          </div>
        </div>

        {/* Observações */}
        <div className="mt-6 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <h3 className="font-bold text-xs text-slate-500 uppercase mb-2">Observações Adicionais</h3>
          <textarea 
            className="w-full bg-slate-50 border-none rounded-lg p-3 text-slate-700 focus:ring-2 focus:ring-blue-100 h-24 resize-none" 
            placeholder="Digite avarias, arranhões ou detalhes extras..."
            value={observacoes} 
            onChange={(e) => { setObservacoes(e.target.value); saveToFirebase(checklistItems, header, e.target.value); }}
          />
        </div>
      </div>
    </div>
  );
}