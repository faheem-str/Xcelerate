import React, { useState } from 'react';
import { Plus, ArrowRight } from 'lucide-react';
import { Modal, Button } from 'react-bootstrap';

const CRMCard = ({ title, onSelect, selected }) => {
  return (
    <div 
      className={`w-64 h-40 p-4 rounded-lg border-2 cursor-pointer transition-all
        ${selected ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-blue-400'}`}
      onClick={onSelect}
    >
      <div className="h-full flex flex-col justify-between">
        <div className="text-lg font-medium text-gray-700">{title}</div>
        {selected && (
          <div className="text-sm text-blue-600">Selected</div>
        )}
      </div>
    </div>
  );
};

const CRMSelectionStep = () => {
  const [showCRMModal, setShowCRMModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'source' or 'target'
  const [sourceCRM, setSourceCRM] = useState('');
  const [targetCRM, setTargetCRM] = useState('');

  const crmOptions = [
    { id: 'microsoft', name: 'Microsoft Dynamics 365' },
    { id: 'salesforce', name: 'Salesforce' },
    { id: 'other', name: 'Other CRM' }
  ];

  const handleCRMSelect = (crmId) => {
    if (modalType === 'source') {
      setSourceCRM(crmId);
    } else {
      setTargetCRM(crmId);
    }
    setShowCRMModal(false);
  };

  const openCRMModal = (type) => {
    setModalType(type);
    setShowCRMModal(true);
  };

  return (
    // <div className="w-full space-y-8">
    //   <h2 className="text-2xl font-semibold text-gray-800">Select CRM Systems</h2>
      
    //   <div className="flex items-center justify-center space-x-6">
    //     {/* Source CRM Selection */}
    //     <div className="relative">
    //       {sourceCRM ? (
    //         <CRMCard 
    //           title={crmOptions.find(crm => crm.id === sourceCRM)?.name} 
    //           selected={true}
    //           onSelect={() => openCRMModal('source')}
    //         />
    //       ) : (
    //         <button
    //           onClick={() => openCRMModal('source')}
    //           className="w-64 h-40 border-2 border-dashed border-gray-300 rounded-lg 
    //                    flex flex-col items-center justify-center space-y-2
    //                    hover:border-blue-400 hover:bg-blue-50 transition-all"
    //         >
    //           <Plus className="w-8 h-8 text-gray-400" />
    //           <span className="text-sm text-gray-600">Select Source CRM</span>
    //         </button>
    //       )}
    //     </div>

    //     <ArrowRight className="w-8 h-8 text-gray-400" />

    //     {/* Target CRM Selection */}
    //     <div className="relative">
    //       {targetCRM ? (
    //         <CRMCard 
    //           title={crmOptions.find(crm => crm.id === targetCRM)?.name}
    //           selected={true}
    //           onSelect={() => openCRMModal('target')}
    //         />
    //       ) : (
    //         <button
    //           onClick={() => openCRMModal('target')}
    //           className="w-64 h-40 border-2 border-dashed border-gray-300 rounded-lg 
    //                    flex flex-col items-center justify-center space-y-2
    //                    hover:border-blue-400 hover:bg-blue-50 transition-all"
    //         >
    //           <Plus className="w-8 h-8 text-gray-400" />
    //           <span className="text-sm text-gray-600">Select Target CRM</span>
    //         </button>
    //       )}
    //     </div>
    //   </div>

    //   {/* CRM Selection Modal using React Bootstrap */}
    //   <Modal show={showCRMModal} onHide={() => setShowCRMModal(false)} centered>
    //     <Modal.Header closeButton>
    //       <Modal.Title>
    //         Select {modalType === 'source' ? 'Source' : 'Target'} CRM
    //       </Modal.Title>
    //     </Modal.Header>
    //     <Modal.Body>
    //       <div className="space-y-3">
    //         {crmOptions.map((crm) => (
    //           <button
    //             key={crm.id}
    //             className="w-full p-3 text-left rounded-lg border border-gray-200 
    //                      hover:border-blue-400 hover:bg-blue-50 transition-all"
    //             onClick={() => handleCRMSelect(crm.id)}
    //           >
    //             {crm.name}
    //           </button>
    //         ))}
    //       </div>
    //     </Modal.Body>
    //     <Modal.Footer>
    //       <Button variant="secondary" onClick={() => setShowCRMModal(false)}>
    //         Cancel
    //       </Button>
    //     </Modal.Footer>
    //   </Modal>

    //   {/* Next Button */}
    //   <div className="flex justify-end">
    //   <button
    //         className={`px-4 py-2 text-sm font-medium text-white lgBG rounded ${
    //           newCRMFileName === "" ? "cursor-not-allowed opacity-50" : ""
    //         }`}
    //         onClick={handleNext}
    //         disabled={newCRMFileName === ""}
    //       >
    //         Next
    //       </button>
    //   </div>
    // </div>
    <div></div>
  );
};

export default CRMSelectionStep;