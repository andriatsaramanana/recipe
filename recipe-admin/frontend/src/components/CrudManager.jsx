import { useState, useEffect, useRef, useCallback } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import api from '../services/api';

// Composant CRUD générique : liste paginée + dialogue d'ajout/édition + suppression
export default function CrudManager({ resource, title, fields }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [optionsMap, setOptionsMap] = useState({});
  const [optionsReady, setOptionsReady] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});
  const toast = useRef(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/${resource}`);
      setItems(res.data);
    } catch (err) {
      toast.current?.show({ severity: 'error', summary: 'Erreur', detail: err.response?.data?.error || err.message });
    } finally {
      setLoading(false);
    }
  }, [resource]);

  // Charge les listes pour les champs de type "select" (clés étrangères)
  const loadOptions = useCallback(async () => {
    const selectFields = fields.filter(f => f.type === 'select' && f.optionsResource);
    const map = {};
    for (const f of selectFields) {
      try {
        const res = await api.get(`/${f.optionsResource}`);
        map[f.name] = res.data.map(o => ({ label: o[f.optionLabelField] ?? `#${o.id}`, value: o.id }));
      } catch {
        map[f.name] = [];
      }
    }
    setOptionsMap(map);
    setOptionsReady(true);
  }, [fields]);

  useEffect(() => { load(); loadOptions(); }, [load, loadOptions]);

  const openNew = () => {
    setEditingItem(null);
    setFormData({});
    setDialogVisible(true);
  };

  const openEdit = (item) => {
    setEditingItem(item);
    setFormData({ ...item });
    setDialogVisible(true);
  };

  const save = async () => {
    try {
      if (editingItem) {
        await api.put(`/${resource}/${editingItem.id}`, formData);
      } else {
        await api.post(`/${resource}`, formData);
      }
      setDialogVisible(false);
      load();
      toast.current?.show({ severity: 'success', summary: 'Enregistré', life: 2000 });
    } catch (err) {
      toast.current?.show({ severity: 'error', summary: 'Erreur', detail: err.response?.data?.error || err.message });
    }
  };

  const remove = (item) => {
    confirmDialog({
      message: `Supprimer l'élément #${item.id} ?`,
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        try {
          await api.delete(`/${resource}/${item.id}`);
          load();
          toast.current?.show({ severity: 'success', summary: 'Supprimé', life: 2000 });
        } catch (err) {
          toast.current?.show({ severity: 'error', summary: 'Erreur', detail: err.response?.data?.error || err.message });
        }
      },
    });
  };

  const renderField = (field) => {
    if (field.type === 'number') {
      return (
        <InputNumber
          value={formData[field.name] ?? null}
          onValueChange={(e) => setFormData({ ...formData, [field.name]: e.value })}
          mode={field.mode || 'decimal'}
          maxFractionDigits={field.maxFractionDigits ?? 2}
          className="w-full"
        />
      );
    }
    if (field.type === 'select') {
      return (
        <Dropdown
          value={formData[field.name] ?? null}
          options={optionsMap[field.name] || []}
          onChange={(e) => setFormData({ ...formData, [field.name]: e.value })}
          placeholder="Sélectionner"
          showClear
          filter
          className="w-full"
        />
      );
    }
    if (field.type === 'textarea') {
      return (
        <InputTextarea
          value={formData[field.name] ?? ''}
          onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
          rows={3}
          className="w-full"
        />
      );
    }
    return (
      <InputText
        value={formData[field.name] ?? ''}
        onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
        className="w-full"
      />
    );
  };

  const columnBody = (field) => (rowData) => {
    if (field.type === 'select' && optionsMap[field.name]) {
      const opt = optionsMap[field.name].find(o => o.value === rowData[field.name]);
      return opt ? opt.label : rowData[field.name];
    }
    if (field.name === 'price' && rowData.price != null) {
      return `${parseFloat(rowData.price).toFixed(2)} ${rowData.currency || ''}`.trim();
    }
    return rowData[field.name];
  };

  const actionBody = (item) => (
    <div className="flex gap-2">
      <Button icon="pi pi-pencil" rounded text onClick={() => openEdit(item)} />
      <Button icon="pi pi-trash" rounded text severity="danger" onClick={() => remove(item)} />
    </div>
  );

  return (
    <div className="card">
      <Toast ref={toast} />
      <ConfirmDialog />
      <div className="flex justify-content-between align-items-center mb-3">
        <h2 className="m-0">{title}</h2>
        <Button label="Ajouter" icon="pi pi-plus" onClick={openNew} />
      </div>
      <DataTable key={optionsReady ? 'ready' : 'loading'} value={items} loading={loading} paginator rows={10} stripedRows size="small" emptyMessage="Aucune donnée">
        <Column field="id" header="ID" style={{ width: '80px' }} />
        {fields.map(f => (
          <Column key={f.name} field={f.name} header={f.label} body={columnBody(f)} />
        ))}
        <Column body={actionBody} style={{ width: '100px' }} />
      </DataTable>

      <Dialog visible={dialogVisible} onHide={() => setDialogVisible(false)} header={editingItem ? `Modifier #${editingItem.id}` : 'Ajouter'} style={{ width: '450px' }}>
        <div className="flex flex-column gap-3 mt-2">
          {fields.map(f => (
            <div key={f.name} className="flex flex-column gap-1">
              <label>{f.label}</label>
              {renderField(f)}
            </div>
          ))}
          <Button label="Enregistrer" icon="pi pi-check" onClick={save} />
        </div>
      </Dialog>
    </div>
  );
}
