import React, { useState } from "react";

// Embedded CSS styles
const styles = `
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Roboto', sans-serif;
  background: #f5f7fa;
  color: #2c3e50;
  line-height: 1.3;
}

.admin-header {
  background: #2c3e50;
  color: white;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.admin-header h1 {
  font-size: 1.5rem;
  font-weight: 600;
}

.admin-header .user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.breadcrumb {
  background: white;
  padding: 1rem 2rem;
  border-bottom: 1px solid #e0e6ed;
  font-size: 0.9rem;
  color: #7f8c8d;
}

.breadcrumb a {
  color: #3498db;
  text-decoration: none;
}

.main-container {
  min-height: calc(100vh - 120px);
}

.content-area {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0.125rem;
}

.page-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  margin-bottom: 0.25rem;
  color: white;
}

.page-header h2 {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 0.125rem;
}

.page-header p {
  opacity: 0.9;
  font-size: 0.8rem;
}

.form-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  overflow: hidden;
}

.form-tabs {
  display: flex;
  background: #f8f9fa;
  border-bottom: 1px solid #e0e6ed;
  border-radius: 8px 8px 0 0;
}

.form-tabs button {
  flex: 1;
  background: transparent;
  border: none;
  padding: 0.75rem 1rem;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 600;
  color: #7f8c8d;
  transition: all 0.3s ease;
  position: relative;
}

.form-tabs button:hover {
  background: #e9ecef;
  color: #495057;
}

.form-tabs button.active {
  background: white;
  color: #2c3e50;
  font-weight: 600;
}

.form-tabs button.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: #3498db;
}

.form-content {
  padding: 0.375rem;
}

.tab-content {
  display: none;
}

.tab-content.active {
  display: block;
}

.section-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: #333333;
  margin-bottom: 0.25rem;
  padding-bottom: 0.125rem;
  border-bottom: 3px solid #007acc;
  position: relative;
}

.section-title::before {
  content: '';
  position: absolute;
  bottom: -3px;
  left: 0;
  width: 50px;
  height: 3px;
  background: #e74c3c;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 0.5rem;
  margin-bottom: 0.25rem;
}

.form-group {
  margin-bottom: 0.25rem;
}

.form-group label {
  display: block;
  font-weight: 500;
  color: #34495e;
  margin-bottom: 0.25rem;
  font-size: 0.9rem;
}

.form-group label.required::after {
  content: ' *';
  color: #e74c3c;
}

.form-control {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #bdc3c7;
  border-radius: 4px;
  font-size: 0.9rem;
  transition: border-color 0.3s ease;
  background: #ffffff;
}

.form-control:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

.data-table {
  background: linear-gradient(145deg, #f8f9fa, #e9ecef);
  border-radius: 8px;
  padding: 0.5rem;
  margin-bottom: 0.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  border: 1px solid #e0e6ed;
}

.table-header {
  font-weight: 700;
  color: #333333;
  margin-bottom: 0.25rem;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
}

.table-header::before {
  content: '▶';
  color: #007acc;
  margin-right: 0.5rem;
  font-size: 0.7rem;
}

.table-grid {
  display: grid;
  gap: 0.25rem;
  background: white;
  border-radius: 4px;
  padding: 0.25rem;
  border: 1px solid #e0e6ed;
}

.table-grid.cols-6 { grid-template-columns: repeat(6, 1fr); }
.table-grid.cols-8 { grid-template-columns: repeat(8, 1fr); }
.table-grid.cols-2 { grid-template-columns: repeat(2, 1fr); }

.section-group {
  border: 1px solid #e0e6ed;
  border-radius: 6px;
  padding: 0.25rem;
  margin-bottom: 0.25rem;
  background: #fafbfc;
  display: none;
}

.section-group.active {
  display: block;
}

.sub-tabs {
  display: flex;
  background: #f8f9fa;
  border-bottom: 1px solid #e0e6ed;
  margin-bottom: 0.5rem;
  border-radius: 6px 6px 0 0;
  overflow-x: auto;
}

.sub-tab-btn {
  background: transparent;
  border: none;
  padding: 0.75rem 1rem;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 500;
  color: #666666;
  transition: all 0.3s ease;
  white-space: nowrap;
  border-bottom: 2px solid transparent;
}

.sub-tab-btn:hover {
  background: #e9ecef;
  color: #495057;
}

.sub-tab-btn.active {
  background: white;
  color: #2c3e50;
  font-weight: 600;
  border-bottom: 2px solid #3498db;
}

.table-header-cell {
  background: #ecf0f1;
  padding: 0.5rem 0.25rem;
  font-weight: 600;
  font-size: 0.85rem;
  color: #2c3e50;
  text-align: center;
  border-radius: 3px;
}

.table-data-cell {
  padding: 0.25rem;
}

.table-data-cell input, .table-data-cell select {
  width: 100%;
  padding: 0.35rem;
  border: 1px solid #bdc3c7;
  border-radius: 3px;
  font-size: 0.85rem;
  background: #ffffff;
}

.table-data-cell select {
  cursor: pointer;
}

.table-data-cell select:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

.btn {
  padding: 0.4rem 0.8rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.75rem;
  font-weight: 600;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.12);
  text-transform: none;
  letter-spacing: 0.3px;
  min-height: 32px;
}

.btn-primary {
  background: linear-gradient(135deg, #3498db, #5dade2);
  color: white;
  border: 1px solid #2980b9;
}

.btn-primary:hover {
  background: linear-gradient(135deg, #2980b9, #3498db);
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(52, 152, 219, 0.3);
}

.btn-success {
  background: linear-gradient(135deg, #27ae60, #2ecc71);
  color: white;
  border: 1px solid #229954;
}

.btn-success:hover {
  background: linear-gradient(135deg, #229954, #27ae60);
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(39, 174, 96, 0.3);
}

.btn-danger {
  background: linear-gradient(135deg, #e74c3c, #ec7063);
  color: white;
  border: 1px solid #c0392b;
}

.btn-danger:hover {
  background: linear-gradient(135deg, #c0392b, #e74c3c);
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(231, 76, 60, 0.3);
}

.btn-secondary {
  background: linear-gradient(135deg, #95a5a6, #bdc3c7);
  color: white;
  border: 1px solid #7f8c8d;
}

.btn-secondary:hover {
  background: linear-gradient(135deg, #7f8c8d, #95a5a6);
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(149, 165, 166, 0.3);
}

.form-actions {
  background: #f8f9fa;
  padding: 0.75rem 1rem;
  border-top: 1px solid #e0e6ed;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.float-btn {
  position: fixed;
  top: 20px;
  right: 20px;
  width: 40px;
  height: 40px;
  background: #3498db;
  border: none;
  border-radius: 50%;
  color: white;
  font-size: 16px;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  z-index: 1000;
}

.modal {
  position: fixed;
  z-index: 1001;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0,0,0,0.5);
}

.modal-content {
  background-color: white;
  margin: 5% auto;
  padding: 20px;
  border-radius: 8px;
  width: 80%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
}

.close {
  color: #aaa;
  float: right;
  font-size: 28px;
  font-weight: bold;
  cursor: pointer;
}

.close:hover {
  color: black;
}

@media (max-width: 768px) {
  .content-area {
    padding: 1rem;
  }
  .form-row {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  .table-grid {
    grid-template-columns: 1fr !important;
  }
  .admin-header {
    padding: 0.75rem 1rem;
    flex-direction: column;
    gap: 0.5rem;
  }
  .form-tabs {
    flex-wrap: wrap;
  }
  .form-tabs button {
    flex: 1 0 50%;
    font-size: 0.8rem;
    padding: 0.75rem 0.5rem;
  }
}

@media (max-width: 480px) {
  .form-tabs button {
    flex: 1 0 100%;
  }
}
`;

// // Type definitions
// declare global {
//   namespace JSX {
//     interface IntrinsicElements {
//       [elemName: string]: any;
//     }
//   }
// }

interface FormData {
  projectName: string;
  developerName: string;
  location: string;
  subLocation: string;
  road: string;
  landmark: string;
  state: string;
  district: string;
  pincode: string;
  landParcel: string;
  numTowers: number;
  storey: string;
  plotsPerFloor: number;
  cosmaProject: string;
}

interface PricingRow {
  wingBuildingNum: string;
  projectType: string;
  devPossession: string;
  reraPossession: string;
  reraNumber: string;
  reraUrl: string;
  typology: string;
  selableArea: string;
  reraCarpet: string;
  psfBase: string;
  avRate: string;
  fixedComponents: string;
  possessionCharges: string;
  totalPackage: string;
  negotiationScope: string;
  availability: string;
  unitPlan: File | null;
}

interface Section {
  id: number;
  label: string;
  pricingRows: PricingRow[];
}

const ProjectForm = () => {
  // Inject styles
  React.useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  const [currentTab, setCurrentTab] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    projectName: '',
    developerName: '',
    location: '',
    subLocation: '',
    road: '',
    landmark: '',
    state: '',
    district: '',
    pincode: '',
    landParcel: '',
    numTowers: 0,
    storey: '',
    plotsPerFloor: 0,
    cosmaProject: ''
  });

  const [sections, setSections] = useState<Section[]>([
    {
      id: 0,
      label: 'RERA-001',
      pricingRows: [{
        wingBuildingNum: '',
        projectType: '',
        devPossession: '',
        reraPossession: '',
        reraNumber: '',
        reraUrl: '',
        typology: '',
        selableArea: '',
        reraCarpet: '',
        psfBase: '',
        avRate: '',
        fixedComponents: '',
        possessionCharges: '',
        totalPackage: '',
        negotiationScope: '',
        availability: '',
        unitPlan: null
      }]
    }
  ]);

  const [activeSection, setActiveSection] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [marketingMessage, setMarketingMessage] = useState('');

  const tabs = ['basic', 'pricing', 'charges', 'amenities', 'ledger', 'contacts'];

  const typologyOptions = [
    '1 RK', '1 BHK', '1.5 BHK', '2 BHK', '2.5 BHK', '3 BHK', 
    '3.5 BHK', '4 BHK', '4.5 BHK', '5 BHK', 'Penthouse', 
    'Row House', 'Bungalow', 'Villa'
  ];

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev: FormData) => ({
      ...prev,
      [name]: value
    }));
  };  

  const handlePricingRowChange = (sectionId: number, rowIndex: number, field: keyof PricingRow, value: string | File | null) => {
    setSections((prev: Section[]) => prev.map((section: Section) => 
      section.id === sectionId 
        ? {
            ...section,
            pricingRows: section.pricingRows.map((row: PricingRow, idx: number) => 
              idx === rowIndex ? { ...row, [field]: value } : row
            )
          }
        : section
    ));
  };

  const addPricingRow = (sectionId: number) => {
    setSections((prev: Section[]) => prev.map((section: Section) => 
      section.id === sectionId 
        ? {
            ...section,
            pricingRows: [...section.pricingRows, {
              wingBuildingNum: '',
              projectType: '',
              devPossession: '',
              reraPossession: '',
              reraNumber: '',
              reraUrl: '',
              typology: '',
              selableArea: '',
              reraCarpet: '',
              psfBase: '',
              avRate: '',
              fixedComponents: '',
              possessionCharges: '',
              totalPackage: '',
              negotiationScope: '',
              availability: '',
              unitPlan: null
            }]
          }
        : section
    ));
  };

  const removePricingRow = (sectionId: number) => {
    setSections((prev: Section[]) => prev.map((section: Section) => 
      section.id === sectionId && section.pricingRows.length > 1
        ? {
            ...section,
            pricingRows: section.pricingRows.slice(0, -1)
          }
        : section
    ));
  };

  const addSection = () => {
    const newId = sections.length;
    setSections((prev: Section[]) => [...prev, {
      id: newId,
      label: `RERA-${String(newId + 1).padStart(3, '0')}`,
      pricingRows: [{
        wingBuildingNum: '',
        projectType: '',
        devPossession: '',
        reraPossession: '',
        reraNumber: '',
        reraUrl: '',
        typology: '',
        selableArea: '',
        reraCarpet: '',
        psfBase: '',
        avRate: '',
        fixedComponents: '',
        possessionCharges: '',
        totalPackage: '',
        negotiationScope: '',
        availability: '',
        unitPlan: null
      }]
    }]);
    setActiveSection(newId);
  };

  const removeSection = (sectionId: number) => {
    if (sections.length > 1) {
      setSections((prev: Section[]) => prev.filter((section: Section) => section.id !== sectionId));
      if (activeSection === sectionId) {
        setActiveSection(0);
      }
    }
  };

  const formatCurrency = (value: string): string => {
    const number = parseFloat(value.replace(/[^\d.]/g, ''));
    return isNaN(number) ? '' : `₹${number.toLocaleString('en-IN')}`;
  };

  const calculateTotal = (sectionId: number, rowIndex: number) => {
    const section = sections.find((s: Section) => s.id === sectionId);
    if (!section) return;

    const row = section.pricingRows[rowIndex];
    const selableArea = parseFloat(row.selableArea.replace(/[^\d.]/g, '')) || 0;
    const psfRate = parseFloat(row.psfBase.replace(/[^\d.]/g, '')) || 0;
    const avRate = parseFloat(row.avRate.replace(/[^\d.]/g, '')) || 0;
    const fixedComponent = parseFloat(row.fixedComponents.replace(/[^\d.]/g, '')) || 0;
    const possessionCharges = parseFloat(row.possessionCharges.replace(/[^\d.]/g, '')) || 0;

    const baseAmount = (selableArea * avRate) - fixedComponent;
    const stampDuty = baseAmount * 0.07;
    const gstRate = baseAmount > 4500000 ? 0.05 : 0.01;
    const gst = baseAmount * gstRate;
    const registrationFee = 30000;
    const perSqFtDifference = selableArea * (psfRate - avRate);

    const total = baseAmount + gst + stampDuty + registrationFee + possessionCharges + fixedComponent + perSqFtDifference;

    handlePricingRowChange(sectionId, rowIndex, 'totalPackage', formatCurrency(total.toString()));
  };

  const handleUnitPlanUpload = (sectionId: number, rowIndex: number, file: File | null) => {
    handlePricingRowChange(sectionId, rowIndex, 'unitPlan', file);
  };

  const generateMarketingMessage = () => {
    const typologies: string[] = [];
    sections.forEach((section: Section) => {
      section.pricingRows.forEach((row: PricingRow) => {
        if (row.typology) typologies.push(row.typology);
      });
    });
    const uniqueTypologies = Array.from(new Set(typologies));

    const totalPackages: number[] = [];
    sections.forEach((section: Section) => {
      section.pricingRows.forEach((row: PricingRow) => {
        if (row.totalPackage) {
          totalPackages.push(parseFloat(row.totalPackage.replace(/[^\d.]/g, '')));
        }
      });
    });

    const minPrice = totalPackages.length ? Math.min(...totalPackages) : 0;
    const maxPrice = totalPackages.length ? Math.max(...totalPackages) : 0;

    const message = `The residential property *${formData.projectName || '[Project Name]'}* is RERA Registered project, developing by *${formData.developerName || '[Developer Name]'}*, Located at ${formData.subLocation || '[Sub Location]'} in ${formData.location || '[Location]'}, ${formData.landmark || '[Landmark]'}. The total land parcel of the project is *${formData.landParcel || '[Land Parcel]'} Acres*.

"The project contains ${formData.numTowers || '[Number of Towers]'} ${parseInt(formData.numTowers.toString()) === 1 ? 'Tower' : 'Towers'} of ${formData.storey || '[Storey]'} Storey building, having *${uniqueTypologies.join(' | ')}* Apartments,

*🏠 Configuration Type: [Rera Carpet Areas]:*
${uniqueTypologies.map(typology => `- *${typology}* - Available`).join('\n')}

Price range : *₹${(minPrice/100000).toFixed(2)} L* to *₹${(maxPrice/10000000).toFixed(2)} Cr* All Inclusive."`;

    setMarketingMessage(message);
    setShowModal(true);
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    console.log('Form Data:', { formData, sections });
    alert('Project saved successfully!');
  };

  const renderBasicTab = () => (
    <div className={`tab-content ${currentTab === 0 ? 'active' : ''}`}>
      <div className="section-title">Project Basic Information</div>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="projectName" className="required">Project Name</label>
          <input
            type="text"
            id="projectName"
            name="projectName"
            className="form-control"
            value={formData.projectName}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="developerName" className="required">Developer Name</label>
          <input
            type="text"
            id="developerName"
            name="developerName"
            className="form-control"
            value={formData.developerName}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="location" className="required">Location</label>
          <input
            type="text"
            id="location"
            name="location"
            className="form-control"
            value={formData.location}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="subLocation" className="required">Sub-Location</label>
          <input
            type="text"
            id="subLocation"
            name="subLocation"
            className="form-control"
            value={formData.subLocation}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="road" className="required">Road</label>
          <input
            type="text"
            id="road"
            name="road"
            className="form-control"
            value={formData.road}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="landmark" className="required">Landmark</label>
          <input
            type="text"
            id="landmark"
            name="landmark"
            className="form-control"
            value={formData.landmark}
            onChange={handleInputChange}
            required
          />
        </div>
      </div>

      <div className="section-title">Address Details</div>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="state" className="required">State</label>
          <input
            type="text"
            id="state"
            name="state"
            className="form-control"
            value={formData.state}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="district" className="required">District</label>
          <input
            type="text"
            id="district"
            name="district"
            className="form-control"
            value={formData.district}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="pincode" className="required">PIN Code</label>
          <input
            type="text"
            id="pincode"
            name="pincode"
            className="form-control"
            value={formData.pincode}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="landParcel" className="required">Land Parcel</label>
          <input
            type="text"
            id="landParcel"
            name="landParcel"
            className="form-control"
            value={formData.landParcel}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="numTowers" className="required">No. of Towers</label>
          <input
            type="number"
            id="numTowers"
            name="numTowers"
            className="form-control"
            value={formData.numTowers}
            onChange={handleInputChange}
            min="0"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="storey" className="required">Storey</label>
          <input
            type="text"
            id="storey"
            name="storey"
            className="form-control"
            value={formData.storey}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="plotsPerFloor" className="required">Flats per Floor</label>
          <input
            type="number"
            id="plotsPerFloor"
            name="plotsPerFloor"
            className="form-control"
            value={formData.plotsPerFloor}
            onChange={handleInputChange}
            min="0"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="cosmaProject" className="required">Cosmo Project</label>
          <select
            id="cosmaProject"
            name="cosmaProject"
            className="form-control"
            value={formData.cosmaProject}
            onChange={handleInputChange}
            required
          >
            <option value="">Select</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderPricingTab = () => (
    <div className={`tab-content ${currentTab === 1 ? 'active' : ''}`}>
      <div className="sub-tabs">
        {sections.map(section => (
          <button
            key={section.id}
            type="button"
            className={`sub-tab-btn ${activeSection === section.id ? 'active' : ''}`}
            onClick={() => setActiveSection(section.id)}
          >
            {section.label}
          </button>
        ))}
      </div>

      <div id="sectionsContainer">
        {sections.map(section => (
          <div
            key={section.id}
            className={`section-group ${activeSection === section.id ? 'active' : ''}`}
            data-section={section.id}
          >
            <div className="data-table">
              <div className="table-header">Wing / Building Details</div>
              <div className="table-grid cols-6">
                <div className="table-header-cell">Wing/Building No.</div>
                <div className="table-header-cell">Project Type</div>
                <div className="table-header-cell">Developer Possession</div>
                <div className="table-header-cell">RERA Possession</div>
                <div className="table-header-cell">RERA Number</div>
                <div className="table-header-cell">RERA URL</div>

                {section.pricingRows.map((row, rowIndex) => (
                  <div key={rowIndex} style={{display: 'contents'}}>
                    <div className="table-data-cell">
                      <input
                        type="text"
                        value={row.wingBuildingNum}
                        onChange={(e) => handlePricingRowChange(section.id, rowIndex, 'wingBuildingNum', e.target.value)}
                      />
                    </div>
                    <div className="table-data-cell">
                      <select
                        value={row.projectType}
                        onChange={(e) => handlePricingRowChange(section.id, rowIndex, 'projectType', e.target.value)}
                        required
                      >
                        <option value="">Select</option>
                        <option value="New">New</option>
                        <option value="Pre-Launch">Pre-Launch</option>
                        <option value="Redevelopment">Redevelopment</option>
                        <option value="SRA">SRA</option>
                      </select>
                    </div>
                    <div className="table-data-cell">
                      <input
                        type="date"
                        value={row.devPossession}
                        onChange={(e) => handlePricingRowChange(section.id, rowIndex, 'devPossession', e.target.value)}
                      />
                    </div>
                    <div className="table-data-cell">
                      <input
                        type="date"
                        value={row.reraPossession}
                        onChange={(e) => handlePricingRowChange(section.id, rowIndex, 'reraPossession', e.target.value)}
                      />
                    </div>
                    <div className="table-data-cell">
                      <input
                        type="text"
                        value={row.reraNumber}
                        onChange={(e) => handlePricingRowChange(section.id, rowIndex, 'reraNumber', e.target.value)}
                      />
                    </div>
                    <div className="table-data-cell">
                      <input
                        type="text"
                        value={row.reraUrl}
                        onChange={(e) => handlePricingRowChange(section.id, rowIndex, 'reraUrl', e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="data-table">
              <div className="table-header">Pricing Configuration</div>
              <div className="table-grid pricing-table" style={{gridTemplateColumns: '1.3fr 1fr 1fr 1.2fr 1.3fr 1.2fr 1.3fr 1.5fr 1.2fr 1.3fr 0.6fr'}}>
                <div className="table-header-cell">Typology</div>
                <div className="table-header-cell">Saleable Area</div>
                <div className="table-header-cell">RERA Carpet</div>
                <div className="table-header-cell">Per Sq. ft. Rate</div>
                <div className="table-header-cell">Agreement Value Rate</div>
                <div className="table-header-cell">Fixed Component</div>
                <div className="table-header-cell">Possession Charges</div>
                <div className="table-header-cell">Total Package</div>
                <div className="table-header-cell">Negotiation Scope</div>
                <div className="table-header-cell">Availability</div>
                <div className="table-header-cell">Unit<br/>Plan</div>

                {section.pricingRows.map((row, rowIndex) => (
                  <div key={rowIndex} style={{display: 'contents'}}>
                    <div className="table-data-cell">
                      <select
                        value={row.typology}
                        onChange={(e) => handlePricingRowChange(section.id, rowIndex, 'typology', e.target.value)}
                        required
                      >
                        <option value="">Select</option>
                        {typologyOptions.map(option => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </div>
                    <div className="table-data-cell">
                      <input
                        type="text"
                        value={row.selableArea}
                        onChange={(e) => handlePricingRowChange(section.id, rowIndex, 'selableArea', e.target.value)}
                        required
                      />
                    </div>
                    <div className="table-data-cell">
                      <input
                        type="text"
                        value={row.reraCarpet}
                        onChange={(e) => handlePricingRowChange(section.id, rowIndex, 'reraCarpet', e.target.value)}
                        required
                      />
                    </div>
                    <div className="table-data-cell">
                      <input
                        type="text"
                        value={row.psfBase}
                        onChange={(e) => {
                          const formatted = formatCurrency(e.target.value);
                          handlePricingRowChange(section.id, rowIndex, 'psfBase', formatted);
                          calculateTotal(section.id, rowIndex);
                        }}
                        required
                      />
                    </div>
                    <div className="table-data-cell">
                      <input
                        type="text"
                        value={row.avRate}
                        onChange={(e) => {
                          const formatted = formatCurrency(e.target.value);
                          handlePricingRowChange(section.id, rowIndex, 'avRate', formatted);
                          calculateTotal(section.id, rowIndex);
                        }}
                        required
                      />
                    </div>
                    <div className="table-data-cell">
                      <input
                        type="text"
                        value={row.fixedComponents}
                        onChange={(e) => {
                          const formatted = formatCurrency(e.target.value);
                          handlePricingRowChange(section.id, rowIndex, 'fixedComponents', formatted);
                          calculateTotal(section.id, rowIndex);
                        }}
                      />
                    </div>
                    <div className="table-data-cell">
                      <input
                        type="text"
                        value={row.possessionCharges}
                        onChange={(e) => {
                          const formatted = formatCurrency(e.target.value);
                          handlePricingRowChange(section.id, rowIndex, 'possessionCharges', formatted);
                          calculateTotal(section.id, rowIndex);
                        }}
                        required
                      />
                    </div>
                    <div className="table-data-cell">
                      <input
                        type="text"
                        value={row.totalPackage}
                        readOnly
                        style={{backgroundColor: '#f8f9fa'}}
                      />
                    </div>
                    <div className="table-data-cell">
                      <input
                        type="text"
                        value={row.negotiationScope}
                        onChange={(e) => {
                          const formatted = formatCurrency(e.target.value);
                          handlePricingRowChange(section.id, rowIndex, 'negotiationScope', formatted);
                        }}
                        required
                      />
                    </div>
                    <div className="table-data-cell">
                      <select
                        value={row.availability}
                        onChange={(e) => handlePricingRowChange(section.id, rowIndex, 'availability', e.target.value)}
                        required
                      >
                        <option value="">Select</option>
                        <option value="Available">Available</option>
                        <option value="Sold Out">Sold Out</option>
                      </select>
                    </div>
                    <div className="table-data-cell" style={{textAlign: 'center'}}>
                      <input
                        type="file"
                        accept=".jpg,.jpeg,.png,.pdf"
                        style={{display: 'none'}}
                        id={`unitPlan_${section.id}_${rowIndex}`}
                        onChange={(e) => handleUnitPlanUpload(section.id, rowIndex, e.target.files?.[0] || null)}
                      />
                      <div style={{position: 'relative', display: 'inline-block'}}>
                        {row.unitPlan ? (
                          <div style={{position: 'relative'}}>
                            <div style={{width: '40px', height: '40px', background: '#dc3545', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '8px'}}>
                              {row.unitPlan.type === 'application/pdf' ? 'PDF' : 'IMG'}
                            </div>
                            <button
                              type="button"
                              onClick={() => handleUnitPlanUpload(section.id, rowIndex, null)}
                              style={{position: 'absolute', top: '-5px', right: '-5px', background: '#e74c3c', color: 'white', border: 'none', borderRadius: '50%', width: '16px', height: '16px', fontSize: '10px', cursor: 'pointer'}}
                            >
                              ×
                            </button>
                          </div>
                        ) : (
                          <i
                            className="fas fa-paperclip"
                            onClick={() => document.getElementById(`unitPlan_${section.id}_${rowIndex}`)?.click()}
                            style={{cursor: 'pointer', fontSize: '1.2rem', color: '#3498db'}}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginTop: '0.5rem'}}>
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={() => addPricingRow(section.id)}
                >
                  <i className="fas fa-plus"></i>
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => removePricingRow(section.id)}
                >
                  <i className="fas fa-minus"></i>
                </button>
              </div>
            </div>

            <div className="section-actions" style={{textAlign: 'right', marginTop: '0.5rem'}}>
              {section.id > 0 && (
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => removeSection(section.id)}
                >
                  <i className="fas fa-trash"></i> Remove Section
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div style={{textAlign: 'center', marginTop: '1rem'}}>
        <button
          type="button"
          className="btn btn-success"
          onClick={addSection}
        >
          <i className="fas fa-plus"></i> Add New Section
        </button>
      </div>
    </div>
  );

  return (
    <div>
      <div className="admin-header">
        <h1><i className="fas fa-cogs"></i> Project Management System</h1>
        <div className="user-info">
          <span><i className="fas fa-user-circle"></i> Admin User</span>
          <span>|</span>
          <a href="#" style={{color: '#ecf0f1'}}><i className="fas fa-sign-out-alt"></i> Logout</a>
        </div>
      </div>

      <div className="breadcrumb">
        <a href="#">Dashboard</a> / <a href="#">Projects</a> / <strong>Add New Project</strong>
      </div>

      <div className="main-container">
        <div className="content-area">
          <div className="page-header">
            <h2>Add New Project</h2>
            <p>Enter comprehensive project details and configuration settings</p>
          </div>

          <div className="form-container">
            <div className="form-tabs">
              {['Basic Information', 'Pricing & Buildings', 'Charges & Payment', 'Amenities', 'Ladder & Scheme', 'Contacts & Collaterals'].map((tab, index) => (
                <button
                  key={index}
                  type="button"
                  className={`tab-btn ${currentTab === index ? 'active' : ''}`}
                  onClick={() => setCurrentTab(index)}
                >
                  <i className={`fas fa-${['info-circle', 'dollar-sign', 'calculator', 'star', 'book', 'address-book'][index]}`}></i> {tab}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-content">
                {currentTab === 0 && renderBasicTab()}
                {currentTab === 1 && renderPricingTab()}
                {/* Add other tabs as needed */}
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setCurrentTab(Math.max(0, currentTab - 1))}
                  style={{display: currentTab === 0 ? 'none' : 'inline-flex'}}
                >
                  <i className="fas fa-arrow-left"></i> Previous
                </button>
                <div>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => setCurrentTab(Math.min(tabs.length - 1, currentTab + 1))}
                    style={{display: currentTab === tabs.length - 1 ? 'none' : 'inline-flex'}}
                  >
                    Next <i className="fas fa-arrow-right"></i>
                  </button>
                  <button
                    type="submit"
                    className="btn btn-success"
                    style={{display: currentTab === tabs.length - 1 ? 'inline-flex' : 'none'}}
                  >
                    <i className="fas fa-save"></i> Save Project
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      <button
        className="float-btn"
        onClick={generateMarketingMessage}
        title="View Marketing Message"
      >
        <i className="fas fa-envelope"></i>
      </button>

      {showModal && (
        <div className="modal" style={{display: 'block'}}>
          <div className="modal-content">
            <span className="close" onClick={() => setShowModal(false)}>&times;</span>
            <h2 style={{marginTop: 0}}>Marketing Message</h2>
            <div style={{whiteSpace: 'pre-wrap', fontFamily: 'monospace', background: '#f8f9fa', padding: '15px', borderRadius: '4px', border: '1px solid #e0e6ed'}}>
              {marketingMessage}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectForm;