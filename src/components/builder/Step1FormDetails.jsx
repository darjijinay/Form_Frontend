import EditableLabel from './EditableLabel';
import { useState } from 'react';

const fieldCategories = {
  'Basic': ['subtitle', 'logo', 'headerImage', 'location'],
  'Event': ['date', 'time', 'organizerName', 'organizerEmail', 'organizerPhone'],
  'Job Application': ['salary', 'employmentType', 'skills', 'deadline'],
  'Event RSVP': ['eventStatus', 'capacity', 'agenda'],
  'Trip Package': ['destination', 'duration', 'price', 'itinerary'],
  'Appointment Booking': ['appointmentTitle', 'appointmentType', 'appointmentDateTime', 'appointmentLocation', 'appointmentDescription']
};

const fieldLabels = {
    subtitle: 'Short Subtitle',
    logo: 'Logo',
    headerImage: 'Header Image',
    location: 'Location / Mode',
    date: 'Date',
    time: 'Time',
    organizerName: 'Organizer Name',
    organizerEmail: 'Organizer Email',
    organizerPhone: 'Organizer Phone',
    salary: 'Salary',
    employmentType: 'Employment Type',
    skills: 'Skills',
    deadline: 'Application Deadline',
    eventStatus: 'Event Status',
    capacity: 'Capacity',
    agenda: 'Agenda',
    destination: 'Destination',
    duration: 'Duration',
    price: 'Price',
    itinerary: 'Itinerary',
    appointmentTitle: 'Appointment Title',
    appointmentType: 'Appointment Type',
    appointmentDateTime: 'Appointment Date & Time',
    appointmentLocation: 'Appointment Location',
    appointmentDescription: 'Appointment Description'
};

const AddFieldDropdown = ({ onAddField, availableFields, formTemplate }) => {
  const [isOpen, setIsOpen] = useState(false);

  const getVisibleCategories = () => {
    const visibleCategories = {};
    const categoriesToShow = ['Basic'];

    const templateToCategory = {
      'tpl1': 'Event',
      'tpl2': 'Job Application',
      'tpl3': 'Event RSVP',
      'tpl10': 'Trip Package',
      'tpl11': 'Appointment Booking',
    };

    if (templateToCategory[formTemplate]) {
      categoriesToShow.push(templateToCategory[formTemplate]);
    }

    for (const category of categoriesToShow) {
      if (fieldCategories[category]) {
        const fields = fieldCategories[category].filter(field => availableFields.includes(field));
        if (fields.length > 0) {
          visibleCategories[category] = fields;
        }
      }
    }
    return visibleCategories;
  };
  
  const visibleCategories = getVisibleCategories();

  if (Object.keys(visibleCategories).length === 0) {
    return null;
  }

  return (
    <div className="relative inline-block text-left">
      <div>
        <button
          type="button"
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-200"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="font-bold">+</span>
          Add Field
        </button>
      </div>
      {isOpen && (
        <div 
          className="origin-top-right absolute left-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10"
          role="menu"
        >
          <div className="py-1" role="none">
            {Object.entries(visibleCategories).map(([category, fields]) => (
              <div key={category}>
                <p className="px-4 py-2 text-xs text-slate-500 uppercase">{category}</p>
                {fields.map(field => (
                  <button
                    key={field}
                    onClick={() => {
                      onAddField(field);
                      setIsOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                    role="menuitem"
                  >
                    {fieldLabels[field]}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Step1FormDetails({ form, onUpdate, visibleFields, onVisibleFieldsChange, formTemplate }) {
  const fieldTypeOptions = ['Short Text', 'Email', 'Number', 'Long Text', 'Date', 'Time'];
  const [newDetail, setNewDetail] = useState({ label: '', value: '', type: 'Short Text' });
  const [isDateFocused, setDateFocused] = useState(false);
  const [isTimeFocused, setTimeFocused] = useState(false);
  const [isDeadlineFocused, setDeadlineFocused] = useState(false);

  const handleInputChange = (field, value) => {
    onUpdate({ ...form, [field]: value });
  };

  const handleLabelUpdate = (field, newLabel) => {
    onUpdate({
      ...form,
      step1Labels: {
        ...form.step1Labels,
        [field]: newLabel,
      },
    });
  };

  const addCustomDetail = () => {
    if (!newDetail.label.trim()) return;
    const updated = [...(form.customDetails || []), { ...newDetail }];
    onUpdate({ ...form, customDetails: updated });
    setNewDetail({ label: '', value: '', type: 'Short Text' });
  };

  const removeCustomDetail = (index) => {
    const updated = (form.customDetails || []).filter((_, i) => i !== index);
    onUpdate({ ...form, customDetails: updated });
  };

  const removeField = (field) => {
    onVisibleFieldsChange(prev => ({ ...prev, [field]: false }));
    handleInputChange(field, '');
  };

  const addField = (field) => {
    onVisibleFieldsChange(prev => ({ ...prev, [field]: true }));
  };

  const availableFieldsToAdd = Object.keys(visibleFields || {})
  .filter(field => !visibleFields[field]);
    
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
        <h2 className="text-xl font-bold mb-6 text-slate-900">Step 1: Form / Event Details</h2>
        <p className="text-sm text-slate-600 mb-6">
          Add details about why the form exists. This becomes the landing / info page for participants. You can click on the labels to edit them.
        </p>

        {/* Main fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <div className="mb-2">
              <EditableLabel fieldKey="title" value={form.step1Labels?.title} onUpdate={handleLabelUpdate} defaultLabel="Form Title / Event Name" formTemplate={formTemplate} />
            </div>
            <input type="text" value={form.title || ''} onChange={(e) => handleInputChange('title', e.target.value)} placeholder="e.g., Workshop Registration" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          {visibleFields.subtitle && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <EditableLabel fieldKey="subtitle" value={form.step1Labels?.subtitle} onUpdate={handleLabelUpdate} defaultLabel="Short Subtitle (optional)" formTemplate={formTemplate} />
                <button onClick={() => removeField('subtitle')} className="text-xs text-red-500 hover:text-red-700">Remove</button>
              </div>
              <input type="text" value={form.subtitle || ''} onChange={(e) => handleInputChange('subtitle', e.target.value)} placeholder="e.g., 2024 Annual Workshop" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          )}
        </div>
        <div className="mb-6">
          <div className="mb-2">
            <EditableLabel fieldKey="description" value={form.step1Labels?.description} onUpdate={handleLabelUpdate} defaultLabel="Description / Purpose" formTemplate={formTemplate} />
          </div>
          <textarea value={form.description || ''} onChange={(e) => handleInputChange('description', e.target.value)} placeholder="Explain the purpose and details..." rows="4" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>

        {visibleFields.logo && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
               <EditableLabel fieldKey="logo" value={form.step1Labels?.logo} onUpdate={handleLabelUpdate} defaultLabel="Logo" formTemplate={formTemplate} />
              <button onClick={() => removeField('logo')} className="text-xs text-red-500 hover:text-red-700">Remove</button>
            </div>
            <input type="file" accept="image/png,image/jpeg,image/jpg,image/gif,image/svg+xml" onChange={(e) => { const file = e.target.files?.[0]; if (file) { const reader = new FileReader(); reader.onload = (event) => { handleInputChange('logo', event.target?.result || ''); }; reader.readAsDataURL(file); } }} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100" />
            {form.logo && (<div className="mt-3"><p className="text-xs text-slate-600 mb-2">Preview:</p><img src={form.logo} alt="Logo preview" className="h-20 w-20 object-cover rounded-lg border border-slate-200" /></div>)}
          </div>
        )}
        
        {visibleFields.headerImage && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
               <EditableLabel fieldKey="headerImage" value={form.step1Labels?.headerImage} onUpdate={handleLabelUpdate} defaultLabel="Header Image" formTemplate={formTemplate} />
              <button onClick={() => removeField('headerImage')} className="text-xs text-red-500 hover:text-red-700">Remove</button>
            </div>
            <input type="file" accept="image/png,image/jpeg,image/jpg,image/gif" onChange={(e) => { const file = e.target.files?.[0]; if (file) { const reader = new FileReader(); reader.onload = (event) => { handleInputChange('headerImage', event.target?.result || ''); }; reader.readAsDataURL(file); } }} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100" />
            {form.headerImage && (<div className="mt-3"><p className="text-xs text-slate-600 mb-2">Preview:</p><img src={form.headerImage} alt="Header image preview" className="w-full h-48 object-cover rounded-lg border border-slate-200" /></div>)}
          </div>
        )}

        {visibleFields.location && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <EditableLabel fieldKey="location" value={form.step1Labels?.location} onUpdate={handleLabelUpdate} defaultLabel="Location / Mode" formTemplate={formTemplate} />
              <button onClick={() => removeField('location')} className="text-xs text-red-500 hover:text-red-700">Remove</button>
            </div>
            <input type="text" value={form.location || ''} onChange={(e) => handleInputChange('location', e.target.value)} placeholder="Online / Office / City, etc." className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {formTemplate === 'tpl2' && visibleFields.salary && (
          <div>
            <div className="flex justify-between items-center mb-2">
              <EditableLabel fieldKey="salary" value={form.step1Labels?.salary} onUpdate={handleLabelUpdate} defaultLabel="Salary" formTemplate={formTemplate} />
              <button onClick={() => removeField('salary')} className="text-xs text-red-500 hover:text-red-700">Remove</button>
            </div>
            <input type="text" value={form.salary || ''} onChange={(e) => handleInputChange('salary', e.target.value)} placeholder="e.g., $100,000 - $120,000" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
        )}
        {formTemplate === 'tpl2' && visibleFields.employmentType && (
          <div>
            <div className="flex justify-between items-center mb-2">
              <EditableLabel fieldKey="employmentType" value={form.step1Labels?.employmentType} onUpdate={handleLabelUpdate} defaultLabel="Employment Type" formTemplate={formTemplate} />
              <button onClick={() => removeField('employmentType')} className="text-xs text-red-500 hover:text-red-700">Remove</button>
            </div>
            <input type="text" value={form.employmentType || ''} onChange={(e) => handleInputChange('employmentType', e.target.value)} placeholder="e.g., Full-time, Contract" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
        )}
        {formTemplate === 'tpl2' && visibleFields.skills && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <EditableLabel fieldKey="skills" value={form.step1Labels?.skills} onUpdate={handleLabelUpdate} defaultLabel="Skills" formTemplate={formTemplate} />
                <button onClick={() => removeField('skills')} className="text-xs text-red-500 hover:text-red-700">Remove</button>
              </div>
              <input type="text" value={form.skills || ''} onChange={(e) => handleInputChange('skills', e.target.value)} placeholder="e.g., React, Node.js, ..." className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          )}
          {formTemplate === 'tpl2' && visibleFields.deadline && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <EditableLabel fieldKey="deadline" value={form.step1Labels?.deadline} onUpdate={handleLabelUpdate} defaultLabel="Application Deadline" formTemplate={formTemplate} />
                <button onClick={() => removeField('deadline')} className="text-xs text-red-500 hover:text-red-700">Remove</button>
              </div>
              <input
                type={isDeadlineFocused || form.deadline ? 'date' : 'text'}
                value={form.deadline || ''}
                onChange={(e) => handleInputChange('deadline', e.target.value)}
                onFocus={() => setDeadlineFocused(true)}
                onBlur={() => setDeadlineFocused(false)}
                placeholder='Select application deadline'
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {formTemplate === 'tpl1' && visibleFields.date && (
            <div>
              <div className="flex justify-between items-center mb-2">
                 <EditableLabel fieldKey="date" value={form.step1Labels?.date} onUpdate={handleLabelUpdate} defaultLabel="Date" formTemplate={formTemplate} />
                <button onClick={() => removeField('date')} className="text-xs text-red-500 hover:text-red-700">Remove</button>
              </div>
              <input
                type={isDateFocused || form.date ? 'date' : 'text'}
                value={form.date || ''}
                onChange={(e) => handleInputChange('date', e.target.value)}
                onFocus={() => setDateFocused(true)}
                onBlur={() => setDateFocused(false)}
                placeholder='Select date'
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          )}
          {formTemplate === 'tpl1' && visibleFields.time && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <EditableLabel fieldKey="time" value={form.step1Labels?.time} onUpdate={handleLabelUpdate} defaultLabel="Time" formTemplate={formTemplate} />
                <button onClick={() => removeField('time')} className="text-xs text-red-500 hover:text-red-700">Remove</button>
              </div>
              <input
                type={isTimeFocused || form.time ? 'time' : 'text'}
                value={form.time || ''}
                onChange={(e) => handleInputChange('time', e.target.value)}
                onFocus={() => setTimeFocused(true)}
                onBlur={() => setTimeFocused(false)}
                placeholder='Select time'
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {formTemplate === 'tpl1' && visibleFields.organizerName && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <EditableLabel fieldKey="organizerName" value={form.step1Labels?.organizerName} onUpdate={handleLabelUpdate} defaultLabel="Organizer Name" formTemplate={formTemplate} />
                <button onClick={() => removeField('organizerName')} className="text-xs text-red-500 hover:text-red-700">Remove</button>
              </div>
              <input type="text" value={form.organizerName || ''} onChange={(e) => handleInputChange('organizerName', e.target.value)} placeholder="e.g., John Smith" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          )}
          {formTemplate === 'tpl1' && visibleFields.organizerEmail && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <EditableLabel fieldKey="organizerEmail" value={form.step1Labels?.organizerEmail} onUpdate={handleLabelUpdate} defaultLabel="Organizer Email" formTemplate={formTemplate} />
                <button onClick={() => removeField('organizerEmail')} className="text-xs text-red-500 hover:text-red-700">Remove</button>
              </div>
              <input type="email" value={form.organizerEmail || ''} onChange={(e) => handleInputChange('organizerEmail', e.target.value)} placeholder="e.g., event.organizer@example.com" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          )}
        </div>
        {formTemplate === 'tpl1' && visibleFields.organizerPhone && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <EditableLabel fieldKey="organizerPhone" value={form.step1Labels?.organizerPhone} onUpdate={handleLabelUpdate} defaultLabel="Organizer Phone" formTemplate={formTemplate} />
              <button onClick={() => removeField('organizerPhone')} className="text-xs text-red-500 hover:text-red-700">Remove</button>
            </div>
            <input type="tel" value={form.organizerPhone || ''} onChange={(e) => handleInputChange('organizerPhone', e.target.value)} placeholder="e.g., +1 (555) 123-4567" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
        )}

        {formTemplate === 'tpl3' && visibleFields.eventStatus && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <EditableLabel fieldKey="eventStatus" value={form.step1Labels?.eventStatus} onUpdate={handleLabelUpdate} defaultLabel="Event Status" formTemplate={formTemplate} />
              <button onClick={() => removeField('eventStatus')} className="text-xs text-red-500 hover:text-red-700">Remove</button>
            </div>
            <select value={form.eventStatus || ''} onChange={(e) => handleInputChange('eventStatus', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="Scheduled">Scheduled</option>
              <option value="Canceled">Canceled</option>
              <option value="Postponed">Postponed</option>
            </select>
          </div>
        )}

        {formTemplate === 'tpl3' && visibleFields.capacity && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <EditableLabel fieldKey="capacity" value={form.step1Labels?.capacity} onUpdate={handleLabelUpdate} defaultLabel="Capacity" formTemplate={formTemplate} />
              <button onClick={() => removeField('capacity')} className="text-xs text-red-500 hover:text-red-700">Remove</button>
            </div>
            <input type="number" value={form.capacity || ''} onChange={(e) => handleInputChange('capacity', e.target.value)} placeholder="e.g., 100" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
        )}

        {formTemplate === 'tpl3' && visibleFields.agenda && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <EditableLabel fieldKey="agenda" value={form.step1Labels?.agenda} onUpdate={handleLabelUpdate} defaultLabel="Agenda" formTemplate={formTemplate} />
              <button onClick={() => removeField('agenda')} className="text-xs text-red-500 hover:text-red-700">Remove</button>
            </div>
            <textarea value={form.agenda || ''} onChange={(e) => handleInputChange('agenda', e.target.value)} placeholder="e.g., 10:00 AM - Welcome, 10:30 AM - ..." rows="4" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
        )}

<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">

{formTemplate === 'tpl10' && visibleFields.destination && (
    <div>
        <div className="flex justify-between items-center mb-2">
            <EditableLabel fieldKey="destination" value={form.step1Labels?.destination} onUpdate={handleLabelUpdate} defaultLabel="Destination" formTemplate={formTemplate} />
            <button onClick={() => removeField('destination')} className="text-xs text-red-500 hover:text-red-700">Remove</button>
        </div>
        <input type="text" value={form.destination || ''} onChange={(e) => handleInputChange('destination', e.target.value)} placeholder="e.g., Paris, France" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
    </div>
)}
{formTemplate === 'tpl10' && visibleFields.duration && (
    <div>
        <div className="flex justify-between items-center mb-2">
            <EditableLabel fieldKey="duration" value={form.step1Labels?.duration} onUpdate={handleLabelUpdate} defaultLabel="Duration" formTemplate={formTemplate} />
            <button onClick={() => removeField('duration')} className="text-xs text-red-500 hover:text-red-700">Remove</button>
        </div>
        <input type="text" value={form.duration || ''} onChange={(e) => handleInputChange('duration', e.target.value)} placeholder="e.g., 7 Days, 6 Nights" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
    </div>
)}
</div>

{formTemplate === 'tpl10' && visibleFields.price && (
    <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
            <EditableLabel fieldKey="price" value={form.step1Labels?.price} onUpdate={handleLabelUpdate} defaultLabel="Price" formTemplate={formTemplate} />
            <button onClick={() => removeField('price')} className="text-xs text-red-500 hover:text-red-700">Remove</button>
        </div>
        <input type="text" value={form.price || ''} onChange={(e) => handleInputChange('price', e.target.value)} placeholder="e.g., $1500 per person" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
    </div>
)}

{formTemplate === 'tpl10' && visibleFields.itinerary && (
    <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
            <EditableLabel fieldKey="itinerary" value={form.step1Labels?.itinerary} onUpdate={handleLabelUpdate} defaultLabel="Itinerary" formTemplate={formTemplate} />
            <button onClick={() => removeField('itinerary')} className="text-xs text-red-500 hover:text-red-700">Remove</button>
        </div>
        <textarea value={form.itinerary || ''} onChange={(e) => handleInputChange('itinerary', e.target.value)} placeholder="e.g., Day 1: Arrival, Day 2: Sightseeing..." rows="4" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
    </div>
)}

{formTemplate === 'tpl11' && visibleFields.appointmentTitle && (
    <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
            <EditableLabel fieldKey="appointmentTitle" value={form.step1Labels?.appointmentTitle} onUpdate={handleLabelUpdate} defaultLabel="Appointment Title" formTemplate={formTemplate} />
            <button onClick={() => removeField('appointmentTitle')} className="text-xs text-red-500 hover:text-red-700">Remove</button>
        </div>
        <input type="text" value={form.appointmentTitle || ''} onChange={(e) => handleInputChange('appointmentTitle', e.target.value)} placeholder="e.g., Consultation, Follow-up" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
    </div>
)}

<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
    {formTemplate === 'tpl11' && visibleFields.appointmentType && (
        <div>
            <div className="flex justify-between items-center mb-2">
                <EditableLabel fieldKey="appointmentType" value={form.step1Labels?.appointmentType} onUpdate={handleLabelUpdate} defaultLabel="Appointment Type" formTemplate={formTemplate} />
                <button onClick={() => removeField('appointmentType')} className="text-xs text-red-500 hover:text-red-700">Remove</button>
            </div>
            <input type="text" value={form.appointmentType || ''} onChange={(e) => handleInputChange('appointmentType', e.target.value)} placeholder="e.g., Online, In-person" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
    )}
    {formTemplate === 'tpl11' && visibleFields.appointmentDateTime && (
        <div>
            <div className="flex justify-between items-center mb-2">
                <EditableLabel fieldKey="appointmentDateTime" value={form.step1Labels?.appointmentDateTime} onUpdate={handleLabelUpdate} defaultLabel="Appointment Date & Time" formTemplate={formTemplate} />
                <button onClick={() => removeField('appointmentDateTime')} className="text-xs text-red-500 hover:text-red-700">Remove</button>
            </div>
            <input type="datetime-local" value={form.appointmentDateTime || ''} onChange={(e) => handleInputChange('appointmentDateTime', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
    )}
</div>

{formTemplate === 'tpl11' && visibleFields.appointmentLocation && (
    <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
            <EditableLabel fieldKey="appointmentLocation" value={form.step1Labels?.appointmentLocation} onUpdate={handleLabelUpdate} defaultLabel="Appointment Location" formTemplate={formTemplate} />
            <button onClick={() => removeField('appointmentLocation')} className="text-xs text-red-500 hover:text-red-700">Remove</button>
        </div>
        <input type="text" value={form.appointmentLocation || ''} onChange={(e) => handleInputChange('appointmentLocation', e.target.value)} placeholder="e.g., Online, Office Address" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
    </div>
)}

{formTemplate === 'tpl11' && visibleFields.appointmentDescription && (
    <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
            <EditableLabel fieldKey="appointmentDescription" value={form.step1Labels?.appointmentDescription} onUpdate={handleLabelUpdate} defaultLabel="Appointment Description" formTemplate={formTemplate} />
            <button onClick={() => removeField('appointmentDescription')} className="text-xs text-red-500 hover:text-red-700">Remove</button>
        </div>
        <textarea value={form.appointmentDescription || ''} onChange={(e) => handleInputChange('appointmentDescription', e.target.value)} placeholder="e.g., Discuss project details" rows="4" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
    </div>
)}
        
        <div className="mb-6">
          <AddFieldDropdown onAddField={addField} availableFields={availableFieldsToAdd} formTemplate={formTemplate} />
        </div>

        {/* Custom Details Section */}
        <div className="border-t pt-6">
          <h3 className="text-sm font-bold text-slate-900 mb-3">Additional Details (custom)</h3>
          <p className="text-xs text-slate-500 mb-4">Add more structured details about the event/purpose (e.g., Speaker Name, Duration, Mode, Eligibility, Logo, etc.).</p>
          <div className="space-y-4 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Detail Label</label>
                <input type="text" value={newDetail.label} onChange={(e) => setNewDetail({ ...newDetail, label: e.target.value })} placeholder="e.g., Speaker, Duration, Logo, Email" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Field Type</label>
                <div className="relative group">
                  <select value={newDetail.type} onChange={(e) => setNewDetail({ ...newDetail, type: e.target.value })} className="w-full appearance-none pr-10 px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition">
                    {fieldTypeOptions.map((opt) => (<option key={opt} value={opt}>{opt}</option>))}
                  </select>
                  <svg aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">Value</label>
              {newDetail.type === 'Long Text' ? (
                <textarea value={newDetail.value} onChange={(e) => setNewDetail({ ...newDetail, value: e.target.value })} placeholder="e.g., Detailed info about the agenda, speakers, etc." rows="4" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              ) : newDetail.type === 'Date' ? (
                <input type="date" value={newDetail.value} onChange={(e) => setNewDetail({ ...newDetail, value: e.g. target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer" style={{ colorScheme: 'light' }} />
              ) : newDetail.type === 'Time' ? (
                <input type="time" value={newDetail.value} onChange={(e) => setNewDetail({ ...newDetail, value: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer" style={{ colorScheme: 'light' }} />
              ) : (
                <input type={newDetail.type === 'Email' ? 'email' : newDetail.type === 'Number' ? 'number' : 'text'} value={newDetail.value} onChange={(e) => setNewDetail({ ...newDetail, value: e.target.value })} placeholder={newDetail.type === 'Email' ? 'e.g., organizer@example.com' : newDetail.type === 'Number' ? 'e.g., 100, 50, 2, etc.' : 'e.g., Speaker lineup, 2 hours, Online, etc.'} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              )}
            </div>
          </div>
          <button onClick={addCustomDetail} className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 mb-6">+ Add Detail</button>
          {form.customDetails && form.customDetails.length > 0 && (
            <div className="space-y-2">
              {form.customDetails.map((detail, idx) => (
                <div key={idx} className="space-y-1 bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-900">{detail.label || 'Untitled detail'}</p>
                    <span className="text-xs text-slate-500">{detail.type || 'Short Text'}</span>
                  </div>
                  {detail.value && <p className="text-sm text-slate-600 whitespace-pre-wrap">{detail.value}</p>}
                  <div className="flex justify-end">
                    <button onClick={() => removeCustomDetail(idx)} className="text-red-600 hover:text-red-700 text-sm font-semibold">Remove</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}