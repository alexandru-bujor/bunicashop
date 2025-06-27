import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaCheck, FaTimes, FaPhone } from 'react-icons/fa';
import './Leads.css';

const API_URL = 'http://localhost:3001';

const Leads = () => {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedLead, setSelectedLead] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        loadLeads();
    }, []);

    const loadLeads = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('adminToken');
            if (!token) {
                throw new Error('Nu sunteți autentificat');
            }

            const response = await fetch(`${API_URL}/admin/leads`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Sesiunea a expirat. Vă rugăm să vă autentificați din nou.');
                }
                throw new Error('Eroare la încărcarea lead-urilor');
            }

            const data = await response.json();
            setLeads(data);
            setError(null);
        } catch (err) {
            setError(err.message);
            if (err.message.includes('autentificați')) {
                navigate('/admin');
            }
        } finally {
            setLoading(false);
        }
    };

    const updateLeadStatus = async (leadId, newStatus) => {
        try {
            const token = localStorage.getItem('adminToken');
            if (!token) {
                throw new Error('Nu sunteți autentificat');
            }

            const response = await fetch(`${API_URL}/admin/leads/${leadId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Sesiunea a expirat. Vă rugăm să vă autentificați din nou.');
                }
                throw new Error('Eroare la actualizarea lead-ului');
            }

            await loadLeads();
        } catch (err) {
            setError(err.message);
            if (err.message.includes('autentificați')) {
                navigate('/admin');
            }
        }
    };

    const deleteLead = async (leadId) => {
        if (!window.confirm('Sigur doriți să ștergeți acest lead?')) return;

        try {
            const token = localStorage.getItem('adminToken');
            if (!token) {
                throw new Error('Nu sunteți autentificat');
            }

            const response = await fetch(`${API_URL}/admin/leads/${leadId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Sesiunea a expirat. Vă rugăm să vă autentificați din nou.');
                }
                throw new Error('Eroare la ștergerea lead-ului');
            }

            await loadLeads();
        } catch (err) {
            setError(err.message);
            if (err.message.includes('autentificați')) {
                navigate('/admin');
            }
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'new':
                return <FaPhone className="status-icon new" />;
            case 'in_progress':
                return <FaPhone className="status-icon in-progress" />;
            case 'completed':
                return <FaCheck className="status-icon completed" />;
            case 'not_completed':
                return <FaTimes className="status-icon not-completed" />;
            default:
                return null;
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'new':
                return 'Nou';
            case 'in_progress':
                return 'În procesare';
            case 'completed':
                return 'Finalizat';
            case 'not_completed':
                return 'Necompletat';
            default:
                return status;
        }
    };

    if (loading) {
        return (
            <div className="leads-loading">
                <div className="loader"></div>
                <p>Se încarcă lead-urile...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="leads-error">
                <p>{error}</p>
                <button onClick={loadLeads}>Reîncearcă</button>
            </div>
        );
    }

    return (
        <div className="leads">
            <h2>Lead-uri</h2>
            <div className="leads-table-container">
                <table className="leads-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nume</th>
                            <th>Email</th>
                            <th>Telefon</th>
                            <th>Data</th>
                            <th>Status</th>
                            <th>Acțiuni</th>
                        </tr>
                    </thead>
                    <tbody>
                        {leads.map(lead => (
                            <tr key={lead.id}>
                                <td>#{lead.id}</td>
                                <td>{lead.name}</td>
                                <td>{lead.email}</td>
                                <td>{lead.phone || 'N/A'}</td>
                                <td>{new Date(lead.created_at).toLocaleDateString()}</td>
                                <td>
                                    <select
                                        value={lead.status}
                                        onChange={(e) => updateLeadStatus(lead.id, e.target.value)}
                                        className={`status-select ${lead.status}`}
                                    >
                                        <option value="new">Nou</option>
                                        <option value="in_progress">În Procesare</option>
                                        <option value="completed">Finalizat</option>
                                        <option value="not_completed">Necompletat</option>
                                    </select>
                                </td>
                                <td>
                                    <div className="action-buttons">
                                        <button
                                            onClick={() => setSelectedLead(lead)}
                                            className="view-button"
                                        >
                                            <FaEye /> Vezi
                                        </button>
                                        <button
                                            onClick={() => deleteLead(lead.id)}
                                            className="delete-button"
                                        >
                                            <FaTimes /> Șterge
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {selectedLead && (
                <div className="lead-modal">
                    <div className="modal-content">
                        <h3>Detalii Lead #{selectedLead.id}</h3>
                        <div className="lead-details">
                            <p><strong>Nume:</strong> {selectedLead.name}</p>
                            <p><strong>Email:</strong> {selectedLead.email}</p>
                            <p><strong>Telefon:</strong> {selectedLead.phone || 'N/A'}</p>
                            <p><strong>Data:</strong> {new Date(selectedLead.created_at).toLocaleDateString()}</p>
                            <p><strong>Status:</strong> {selectedLead.status}</p>
                            <p><strong>Mesaj:</strong></p>
                            <div className="message-content">
                                {selectedLead.message}
                            </div>
                            {selectedLead.notes && (
                                <>
                                    <p><strong>Note:</strong></p>
                                    <div className="notes-content">
                                        {selectedLead.notes}
                                    </div>
                                </>
                            )}
                        </div>
                        <button
                            onClick={() => setSelectedLead(null)}
                            className="close-button"
                        >
                            Închide
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Leads; 