import React, { useState, useEffect } from 'react';
import { Dropdown } from './Dropdown';
import { KeyboardWithNumpad } from './KeyboardWithNumpad';

const PRINTER_FORM_TYPE_OPTIONS = [
  { value: 'COM', label: 'COM' },
  { value: 'USB', label: 'USB' },
  { value: 'Network', label: 'Network' }
];

const PRINTER_FORM_COM_PORT_OPTIONS = [
  { value: '', label: '—' },
  { value: 'COM1', label: 'COM 1' },
  { value: 'COM2', label: 'COM 2' },
  { value: 'COM3', label: 'COM 3' },
  { value: 'COM4', label: 'COM 4' },
  { value: 'COM5', label: 'COM 5' },
  { value: 'COM6', label: 'COM 6' },
  { value: 'COM7', label: 'COM 7' },
  { value: 'COM8', label: 'COM 8' }
];

const PRINTER_FORM_CHARACTERS_OPTIONS = [
  { value: '48', label: '48' },
  { value: '80', label: '80' },
  { value: '96', label: '96' }
];

const PRINTER_FORM_TICKET_SIZE_OPTIONS = [
  { value: 'normal', label: 'Normal' },
  { value: 'large', label: 'Large' },
  { value: 'small', label: 'Small' }
];

const PRINTER_FORM_SPACE_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' }
];

const PRINTER_FORM_LOGO_OPTIONS = [
  { value: 'disable', label: 'Disable' },
  { value: 'enable', label: 'Enable' }
];

const PRINTER_FORM_PRINTER_TYPE_OPTIONS = [
  { value: 'Esc', label: 'Esc' },
  { value: 'TSPL', label: 'TSPL' }
];

const defaultForm = () => ({
  name: '',
  tab: 'General',
  type: 'COM',
  comPort: '',
  baudrate: '9600',
  characters: '48',
  standard: false,
  numberOfPrints: 1,
  productionTicketSize: 'normal',
  vatTicketSize: 'normal',
  spaceBetweenProducts: 'none',
  logo: 'disable',
  printerType: 'Esc'
});

export function PrinterModal({ open, initialPrinter, onClose, onSave }) {
  const [name, setName] = useState('');
  const [tab, setTab] = useState('General');
  const [type, setType] = useState('COM');
  const [comPort, setComPort] = useState('');
  const [baudrate, setBaudrate] = useState('9600');
  const [characters, setCharacters] = useState('48');
  const [standard, setStandard] = useState(false);
  const [numberOfPrints, setNumberOfPrints] = useState(1);
  const [productionTicketSize, setProductionTicketSize] = useState('normal');
  const [vatTicketSize, setVatTicketSize] = useState('normal');
  const [spaceBetweenProducts, setSpaceBetweenProducts] = useState('none');
  const [logo, setLogo] = useState('disable');
  const [printerType, setPrinterType] = useState('Esc');

  useEffect(() => {
    if (!open) return;
    const d = defaultForm();
    if (initialPrinter) {
      setName(initialPrinter.name || '');
      setTab('General');
      setType(initialPrinter.type || 'COM');
      setComPort(initialPrinter.comPort || '');
      setBaudrate(initialPrinter.baudrate || '9600');
      setCharacters(initialPrinter.characters || '48');
      setStandard(!!initialPrinter.standard);
      setNumberOfPrints(Number(initialPrinter.numberOfPrints) || 1);
      setProductionTicketSize(initialPrinter.productionTicketSize || 'normal');
      setVatTicketSize(initialPrinter.vatTicketSize || 'normal');
      setSpaceBetweenProducts(initialPrinter.spaceBetweenProducts || 'none');
      setLogo(initialPrinter.logo || 'disable');
      setPrinterType(initialPrinter.printerType || 'Esc');
    } else {
      setName(d.name);
      setTab(d.tab);
      setType(d.type);
      setComPort(d.comPort);
      setBaudrate(d.baudrate);
      setCharacters(d.characters);
      setStandard(d.standard);
      setNumberOfPrints(d.numberOfPrints);
      setProductionTicketSize(d.productionTicketSize);
      setVatTicketSize(d.vatTicketSize);
      setSpaceBetweenProducts(d.spaceBetweenProducts);
      setLogo(d.logo);
      setPrinterType(d.printerType);
    }
  }, [open, initialPrinter]);

  const handleSave = () => {
    const trimmedName = (name || '').trim();
    if (!trimmedName) return;
    onSave({
      name: trimmedName,
      type,
      comPort,
      baudrate,
      characters,
      standard,
      numberOfPrints,
      productionTicketSize,
      vatTicketSize,
      spaceBetweenProducts,
      logo,
      printerType
    });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="relative flex flex-col bg-pos-bg rounded-xl border border-pos-border shadow-2xl max-w-[1430px] w-full h-[1050px] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="absolute top-4 right-4 z-10 p-2 rounded text-pos-muted hover:text-pos-text hover:bg-pos-panel" onClick={onClose} aria-label="Close">
          <svg className="w-14 h-14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        <div className="flex mt-10 mb-4 px-6 w-full justify-center shrink-0 gap-20">
          {['General', 'Production sorting'].map((t) => (
            <button
              key={t}
              type="button"
              className={`px-4 py-3 text-xl font-medium border-b-2 transition-colors ${tab === t ? 'border-blue-500 text-pos-text' : 'border-transparent text-pos-muted hover:text-pos-text'}`}
              onClick={() => setTab(t)}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="p-6 overflow-hidden flex-1">
          {tab === 'General' && (
            <div className="grid grid-cols-3 w-full gap-6">
              <div className="flex flex-col gap-6">
                <div className="flex items-center gap-3">
                  <span className="text-pos-text text-xl shrink-0 w-[140px]">Name:</span>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="flex-1 min-w-0 max-w-[260px] px-4 py-3 rounded-lg bg-pos-panel border border-pos-border text-pos-text text-xl" />
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-pos-text text-xl shrink-0 w-[140px]">Type:</span>
                  <Dropdown options={PRINTER_FORM_TYPE_OPTIONS} value={type} onChange={setType} placeholder="COM" className="text-xl min-w-[140px] max-w-[200px]" />
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-pos-text text-xl shrink-0 w-[140px]">Com port:</span>
                  <Dropdown options={PRINTER_FORM_COM_PORT_OPTIONS} value={comPort} onChange={setComPort} placeholder="Select" className="text-xl min-w-[140px] max-w-[200px]" />
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-pos-text text-xl shrink-0 w-[140px]">Baudrate:</span>
                  <input type="text" value={baudrate} onChange={(e) => setBaudrate(e.target.value)} className="w-[140px] px-4 py-3 rounded-lg bg-pos-panel border border-pos-border text-pos-text text-xl" />
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-pos-text text-xl shrink-0 w-[140px]">Characters:</span>
                  <Dropdown options={PRINTER_FORM_CHARACTERS_OPTIONS} value={characters} onChange={setCharacters} placeholder="48" className="text-xl min-w-[140px] max-w-[140px]" />
                </div>
              </div>
              <div className="flex flex-col gap-6">
                <label className="flex items-center gap-3 cursor-pointer">
                  <span className="text-pos-text text-xl min-w-[200px] max-w-[200px] shrink-0">Standard:</span>
                  <input type="checkbox" checked={standard} onChange={(e) => setStandard(e.target.checked)} className="w-8 h-8 rounded border-gray-400" />
                </label>
                <div className="flex items-center gap-3">
                  <span className="text-pos-text text-xl shrink-0 min-w-[200px] max-w-[200px]">Number of prints:</span>
                  <div className="flex items-center gap-2">
                    <button type="button" className="p-1 px-2 rounded bg-pos-panel border border-pos-border text-pos-text hover:bg-pos-bg text-3xl" onClick={() => setNumberOfPrints((n) => Math.max(1, n - 1))}>−</button>
                    <input type="number" min={1} value={numberOfPrints} onChange={(e) => setNumberOfPrints(Math.max(1, Number(e.target.value) || 1))} className="w-16 px-2 py-2 bg-pos-panel border border-pos-border rounded text-pos-text text-xl text-center" />
                    <button type="button" className="p-1 px-2 rounded bg-pos-panel border border-pos-border text-pos-text hover:bg-pos-bg text-3xl" onClick={() => setNumberOfPrints((n) => n + 1)}>+</button>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-6">
                <div className="flex items-center gap-3">
                  <span className="text-pos-text text-xl shrink-0 min-w-[250px] max-w-[250px]">Text size Production ticket:</span>
                  <Dropdown options={PRINTER_FORM_TICKET_SIZE_OPTIONS} value={productionTicketSize} onChange={setProductionTicketSize} placeholder="Normal" className="text-xl min-w-[120px] max-w-[120px]" />
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-pos-text text-xl shrink-0 min-w-[250px] max-w-[250px]">Total amount of VAT ticket size:</span>
                  <Dropdown options={PRINTER_FORM_TICKET_SIZE_OPTIONS} value={vatTicketSize} onChange={setVatTicketSize} placeholder="Normal" className="text-xl min-w-[120px] max-w-[120px]" />
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-pos-text text-xl shrink-0 min-w-[250px] max-w-[250px]">Space between products:</span>
                  <Dropdown options={PRINTER_FORM_SPACE_OPTIONS} value={spaceBetweenProducts} onChange={setSpaceBetweenProducts} placeholder="None" className="text-xl min-w-[120px] max-w-[120px]" />
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-pos-text text-xl shrink-0 min-w-[250px] max-w-[250px]">Logo:</span>
                  <Dropdown options={PRINTER_FORM_LOGO_OPTIONS} value={logo} onChange={setLogo} placeholder="Disable" className="text-xl min-w-[120px] max-w-[120px]" />
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-pos-text text-xl shrink-0 min-w-[250px] max-w-[250px]">Printer type:</span>
                  <Dropdown options={PRINTER_FORM_PRINTER_TYPE_OPTIONS} value={printerType} onChange={setPrinterType} placeholder="Esc" className="text-xl min-w-[120px] max-w-[120px]" />
                </div>
              </div>
            </div>
          )}
          {tab === 'Production sorting' && (
            <div className="grid grid-cols-3 w-full gap-6">
              <div className="flex flex-col gap-6">
                <label className="flex items-center gap-3 cursor-pointer">
                  <span className="text-pos-text text-xl min-w-[200px] max-w-[200px] shrink-0">Standard:</span>
                  <input type="checkbox" checked={standard} onChange={(e) => setStandard(e.target.checked)} className="w-8 h-8 rounded border-gray-400" />
                </label>
                <div className="flex items-center gap-3">
                  <span className="text-pos-text text-xl shrink-0 min-w-[200px] max-w-[200px]">Number of prints:</span>
                  <div className="flex items-center gap-2">
                    <button type="button" className="p-1 px-2 rounded bg-pos-panel border border-pos-border text-pos-text hover:bg-pos-bg text-3xl" onClick={() => setNumberOfPrints((n) => Math.max(1, n - 1))}>−</button>
                    <input type="number" min={1} value={numberOfPrints} onChange={(e) => setNumberOfPrints(Math.max(1, Number(e.target.value) || 1))} className="w-16 px-2 py-2 bg-pos-panel border border-pos-border rounded text-pos-text text-xl text-center" />
                    <button type="button" className="p-1 px-2 rounded bg-pos-panel border border-pos-border text-pos-text hover:bg-pos-bg text-3xl" onClick={() => setNumberOfPrints((n) => n + 1)}>+</button>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-6">
                <div className="flex items-center gap-3">
                  <span className="text-pos-text text-xl shrink-0 min-w-[250px] max-w-[250px]">Text size Production ticket:</span>
                  <Dropdown options={PRINTER_FORM_TICKET_SIZE_OPTIONS} value={productionTicketSize} onChange={setProductionTicketSize} placeholder="Normal" className="text-xl min-w-[120px] max-w-[120px]" />
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-pos-text text-xl shrink-0 min-w-[250px] max-w-[250px]">Total amount of VAT ticket size:</span>
                  <Dropdown options={PRINTER_FORM_TICKET_SIZE_OPTIONS} value={vatTicketSize} onChange={setVatTicketSize} placeholder="Normal" className="text-xl min-w-[120px] max-w-[120px]" />
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-pos-text text-xl shrink-0 min-w-[250px] max-w-[250px]">Space between products:</span>
                  <Dropdown options={PRINTER_FORM_SPACE_OPTIONS} value={spaceBetweenProducts} onChange={setSpaceBetweenProducts} placeholder="None" className="text-xl min-w-[120px] max-w-[120px]" />
                </div>
              </div>
              <div className="flex flex-col gap-6">
                <div className="flex items-center gap-3">
                  <span className="text-pos-text text-xl shrink-0 min-w-[250px] max-w-[250px]">Logo:</span>
                  <Dropdown options={PRINTER_FORM_LOGO_OPTIONS} value={logo} onChange={setLogo} placeholder="Disable" className="text-xl min-w-[120px] max-w-[120px]" />
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-pos-text text-xl shrink-0 min-w-[250px] max-w-[250px]">Printer type:</span>
                  <Dropdown options={PRINTER_FORM_PRINTER_TYPE_OPTIONS} value={printerType} onChange={setPrinterType} placeholder="Esc" className="text-xl min-w-[120px] max-w-[120px]" />
                </div>
              </div>
            </div>
          )}
          <div className="flex items-center justify-center gap-20 mt-12">
            <button type="button" className="flex items-center gap-2 px-6 py-3 rounded-lg bg-pos-panel border border-pos-border text-pos-text font-medium hover:bg-pos-bg text-xl" onClick={() => { /* Test print */ }}>
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
              Test print
            </button>
            <button type="button" className="flex items-center gap-2 px-6 py-3 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 disabled:opacity-50 text-xl" disabled={!(name || '').trim()} onClick={handleSave}>
              <svg fill="currentColor" width="24" height="24" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M-5.732,2.97-7.97.732a2.474,2.474,0,0,0-1.483-.7A.491.491,0,0,0-9.591,0H-18.5A2.5,2.5,0,0,0-21,2.5v11A2.5,2.5,0,0,0-18.5,16h11A2.5,2.5,0,0,0-5,13.5V4.737A2.483,2.483,0,0,0-5.732,2.97ZM-13,1V5.455h-3.591V1Zm-4.272,14V10.545h8.544V15ZM-6,13.5A1.5,1.5,0,0,1-7.5,15h-.228V10.045a.5.5,0,0,0-.5-.5h-9.544a.5.5,0,0,0-.5.5V15H-18.5A1.5,1.5,0,0,1-20,13.5V2.5A1.5,1.5,0,0,1-18.5,1h.909V5.955a.5.5,0,0,0,.5.5h7.5a.5.5,0,0,0,.5-.5v-4.8a1.492,1.492,0,0,1,.414.285l2.238,2.238A1.511,1.511,0,0,1-6,4.737Z" transform="translate(21)" /></svg>
              Save
            </button>
          </div>
        </div>
        <div className="shrink-0">
          <KeyboardWithNumpad value={name} onChange={setName} />
        </div>
      </div>
    </div>
  );
}
