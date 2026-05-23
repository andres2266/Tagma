// src/pages/admins/produccion/GenerarOrdenesPage.jsx
import { useNavigate } from "react-router-dom";
import Icons from "../../../utils/icons";
import { useModelosConProceso } from "../../../hooks/modelos/useModelosConProceso";
import { ModelosConProcesoTable } from "../../../components/modelos/ModelosConProcesoTable";

export function GenerarOrdenesPage() {
    const navigate = useNavigate();

    const {
        modelos,
        loading,
        error,
    } = useModelosConProceso();

    const handleGenerarOrden = (modelo) => {
        navigate(`/produccion/modelos/${modelo.id}/generar-orden`);
    };

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1>Generar órdenes de producción</h1>
                    <p>
                        Selecciona un modelo con proceso de fabricación para
                        crear una orden y generar sus tareas automáticamente.
                    </p>
                </div>
                <div className="page-header-date">
                    <Icons.Calendar size={14} />
                    {new Date().toLocaleDateString('es-ES', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })}
                </div>
            </div>

            {loading && (
                <div className="loading-card">
                    <div className="loading-spinner"></div>
                    <Icons.Info size={24} />
                    <p>Cargando modelos con proceso de fabricación...</p>
                </div>
            )}

            {error && (
                <div className="form-alert form-alert-error">
                    <Icons.Alert size={18} />
                    <span>{error}</span>
                </div>
            )}

            {!loading && !error && modelos.length === 0 && (
                <div className="empty-card">
                    <Icons.Box size={48} />
                    <h3>No hay modelos disponibles</h3>
                    <p>No hay modelos con proceso de fabricación configurado.</p>
                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => navigate("/modelos/create")}
                    >
                        <Icons.Plus size={14} />
                        Crear modelo
                    </button>
                </div>
            )}

            {!loading && !error && modelos.length > 0 && (
                <>
                    <div className="info-banner">
                        <Icons.Info size={16} />
                        <span>
                            Se encontraron <strong>{modelos.length}</strong> {modelos.length === 1 ? 'modelo' : 'modelos'} con proceso de fabricación configurado
                        </span>
                    </div>
                    <ModelosConProcesoTable
                        modelos={modelos}
                        onGenerarOrden={handleGenerarOrden}
                    />
                </>
            )}
        </div>
    );
}