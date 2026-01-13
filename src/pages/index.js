import React, { useState, useEffect } from 'react';
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, onSnapshot } from "firebase/firestore";
import { 
  Printer, RotateCcw, ClipboardList, CheckSquare, XSquare, 
  MinusSquare, Wrench, Zap, LayoutGrid, Disc, Settings 
} from 'lucide-react';

// --- CHAVE SECRETA ---
const firebaseConfig = {
  apiKey: "AIzaSyD_mesE7d-Hu0CW9jytPwsgHQoC9byjP10",
  authDomain: "checklist-mecanica-nunes.firebaseapp.com",
  projectId: "checklist-mecanica-nunes",
  storageBucket: "checklist-mecanica-nunes.firebasestorage.app",
  messagingSenderId: "141827449570",
  appId: "1:141827449570:web:51fdbe6c90325b3da174bb",
  measurementId: "G-WB62TX1E18"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default function App() {
  const [printDate, setPrintDate] = useState(''); 
  const [header, setHeader] = useState({ cliente: '', carro: '', placa: '', km: '', data: '' });
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
    setHeader(prev => ({...prev, data: new Date().toISOString().split('T')[0]}));
    setPrintDate(new Date().toLocaleDateString('pt-BR'));
  }, []);

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

  // --- NOVA FUNÇÃO COM FORMATAÇÃO DO KM ---
  const handleHeaderChange = (e, field) => {
    let value = e.target.value;

    // Se for o campo KM, aplica a máscara de milhar (15000 -> 15.000)
    if (field === 'km') {
      // 1. Remove tudo que não é número
      value = value.replace(/\D/g, "");
      // 2. Adiciona o ponto a cada 3 dígitos
      value = value.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    }

    const updatedHeader = { ...header, [field]: value };
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

  const handlePrint = () => {
    if (!header.cliente || !header.carro || !header.placa || !header.km) {
      alert("⚠️ Atenção: Preencha CLIENTE, CARRO, PLACA e KM antes de imprimir.");
      return; 
    }
    window.print();
  };

  const ChecklistGroup = ({ title, icon: Icon, categoryFilter }) => (
    <div className="mb-6 break-inside-avoid bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
      <h3 className="flex items-center gap-2 font-bold text-slate-800 bg-slate-50 p-3 border-b border-slate-100 uppercase text-xs tracking-wider border-l-4 border-l-red-600">
        <Icon className="h-4 w-4 text-red-600" /> {title}
      </h3>
      <div className="divide-y divide-slate-100">
        {checklistItems.filter(i => i.category === categoryFilter).map((item) => (
          <div key={item.id} onClick={() => toggleStatus(item.id)} className="flex items-center justify-between p-3 md:p-4 cursor-pointer hover:bg-red-50 transition-colors active:bg-red-100">
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
    <div className="min-h-screen bg-slate-100 font-sans text-slate-900 pb-12 print:bg-white print:pb-0">
      
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Russo+One&display=swap');
      `}</style>

      {/* --- BARRA SUPERIOR (Preta e Vermelha) --- */}
      <div className="bg-slate-900 text-white p-3 sticky top-0 z-50 shadow-xl border-b-4 border-red-600 flex justify-between items-center print:hidden">
        
        {/* LOGO + NOME NA BARRA */}
        <div className="flex items-center gap-3">
             <img src="/logo.png" alt="Logo" className="h-10 w-auto md:h-12 object-contain bg-white rounded-full border-2 border-red-600" 
                  onError={(e) => {e.target.style.display='none'}} />
             
             <div className="flex flex-col">
                <h1 className="text-xl md:text-2xl tracking-wide leading-none text-white uppercase" 
                    style={{ fontFamily: "'Russo One', sans-serif" }}>
                    Mecânica <span className="text-red-600">Nunes</span>
                </h1>
            </div>
        </div>
        
        <div className="flex gap-2">
          <button onClick={handleReset} className="p-2 bg-slate-800 rounded hover:bg-slate-700 transition text-slate-300 border border-slate-700" title="Nova Vistoria">
            <RotateCcw size={18}/>
          </button>
          
          <button onClick={handlePrint} className="px-4 py-2 bg-red-600 font-bold rounded flex items-center gap-2 shadow-lg hover:bg-red-700 text-white text-sm transition-all transform hover:scale-105">
            <Printer size={18}/> <span className="hidden md:inline">Imprimir</span>
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-3 md:p-8 mt-2 print:p-0 print:max-w-full">
        
        {/* --- CABEÇALHO DE IMPRESSÃO (Papel) --- */}
        <div className="hidden print:flex mb-6 border-b-2 border-slate-800 pb-4 justify-between items-center">
            <div className="flex items-center gap-4">
                 <img src="/logo.png" alt="Logo" className="h-20 w-auto object-contain" />
                 <div>
                    <h1 className="text-3xl uppercase text-slate-900" style={{ fontFamily: "'Russo One', sans-serif" }}>
                        Relatório de Vistoria
                    </h1>
                    <p className="text-sm text-slate-500">Mecânica Nunes • (11) 99999-9999</p>
                 </div>
            </div>
            <div className="text-right">
                <p className="font-bold text-lg text-slate-800">Data: {printDate}</p>
                <p className="text-xs text-slate-500">Relatório de Entrada</p>
            </div>
        </div>

        {/* --- DADOS DO CLIENTE --- */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8 print:shadow-none print:border print:border-slate-300 print:rounded-none">
          <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-2 print:hidden">
             <h2 className="text-xl font-bold uppercase text-slate-700 flex items-center gap-2">
                <ClipboardList className="text-red-600"/> Dados do Serviço
             </h2>
             <input type="date" className="font-bold text-slate-600 bg-transparent border-none text-right focus:ring-0 cursor-pointer" value={header.data} onChange={(e) => handleHeaderChange(e, 'data')} />
          </div>
          
          <div className="space-y-5">
            <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cliente / Proprietário <span className="text-red-500">*</span></label>
                <input className="w-full text-xl font-bold border-b-2 border-slate-200 focus:border-red-600 focus:outline-none py-2 bg-transparent uppercase text-slate-900 placeholder-slate-300 transition-colors" placeholder="NOME DO CLIENTE" value={header.cliente} onChange={(e) => handleHeaderChange(e, 'cliente')} />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Veículo <span className="text-red-500">*</span></label>
                    <input className="w-full text-lg font-semibold border-b-2 border-slate-200 focus:border-red-600 focus:outline-none py-2 bg-transparent uppercase text-slate-800 placeholder-slate-300" placeholder="MODELO" value={header.carro} onChange={(e) => handleHeaderChange(e, 'carro')} />
                </div>
                <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Placa <span className="text-red-500">*</span></label>
                    <input className="w-full text-lg font-semibold border-b-2 border-slate-200 focus:border-red-600 focus:outline-none py-2 bg-transparent uppercase text-slate-800 placeholder-slate-300" placeholder="ABC-0000" value={header.placa} onChange={(e) => handleHeaderChange(e, 'placa')} />
                </div>
                <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Quilometragem <span className="text-red-500">*</span></label>
                    {/* AQUI ESTÁ A MUDANÇA NO INPUT: type="text" e inputMode="numeric" */}
                    <input 
                      className="w-full text-lg font-semibold border-b-2 border-slate-200 focus:border-red-600 focus:outline-none py-2 bg-transparent text-slate-800 placeholder-slate-300" 
                      type="text" 
                      inputMode="numeric"
                      placeholder="00.000" 
                      value={header.km} 
                      onChange={(e) => handleHeaderChange(e, 'km')} 
                    />
                </div>
            </div>
          </div>
        </section>

        {/* --- GRID DO CHECKLIST --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:gap-4 print:block print:columns-2">
          <div className="space-y-6 print:break-inside-avoid">
            <ChecklistGroup title="Ferramentas Obrigatórias" icon={Wrench} categoryFilter="ferramentas" />
            <ChecklistGroup title="Sistema de Freio" icon={Disc} categoryFilter="freio" />
            <ChecklistGroup title="Itens Gerais" icon={LayoutGrid} categoryFilter="geral" />
          </div>
          <div className="space-y-6 print:break-inside-avoid">
            <ChecklistGroup title="Motor e Mecânica" icon={Settings} categoryFilter="motor" />
            <ChecklistGroup title="Parte Elétrica" icon={Zap} categoryFilter="eletrica" />
          </div>
        </div>

        {/* --- OBSERVAÇÕES --- */}
        <div className="mt-8 bg-white p-6 rounded-xl shadow-sm border border-slate-200 print:shadow-none print:border print:border-slate-300 print:mt-4 print:break-inside-avoid">
          <h3 className="font-bold text-sm text-slate-500 uppercase mb-3 flex items-center gap-2">
            <ClipboardList className="h-4 w-4"/> Observações Técnicas / Avarias
          </h3>
          <textarea 
            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-4 text-slate-700 focus:ring-2 focus:ring-red-100 focus:border-red-400 outline-none h-32 resize-none transition-all print:bg-white print:border-0 print:p-0 print:h-auto" 
            placeholder="Descreva amassados, arranhões ou problemas específicos..."
            value={observacoes} 
            onChange={(e) => { setObservacoes(e.target.value); saveToFirebase(checklistItems, header, e.target.value); }}
          />
        </div>

        {/* --- RODAPÉ DA IMPRESSÃO (ASSINATURA) --- */}
        <div className="hidden print:flex mt-12 pt-8 border-t border-slate-300 justify-between items-end break-inside-avoid">
            <div className="text-center">
                <div className="w-64 border-b border-black mb-2"></div>
                <p className="text-xs uppercase font-bold text-slate-600">Responsável Técnico</p>
            </div>
            <div className="text-center">
                <div className="w-64 border-b border-black mb-2"></div>
                <p className="text-xs uppercase font-bold text-slate-600">Assinatura do Cliente</p>
            </div>
        </div>
        
        <div className="hidden print:block text-center mt-8 text-[10px] text-slate-400">
            <p>Este documento comprova o estado do veículo no momento da entrada.</p>
        </div>

      </div>
    </div>
  );
}