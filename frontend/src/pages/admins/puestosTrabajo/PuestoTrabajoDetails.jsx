// src/pages/admins/puestosTrabajo/PuestoTrabajoDetails.jsx
import React from "react";
import { useNavigate, useParams } from "react-router-dom";

import Icons from "../../../utils/icons";
import { usePuestoTrabajoDetail } from "../../../hooks/puestoTrabajo/usePuestoTrabajoDetails";

export default function PuestoTrabajoDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const {
        puestoTrabajo,
        loading,
        error,
    } = usePuestoTrabajoDetail(id);

    if (loading) {
        return (
            <section className="page">
                <div className="loading-message">
                    <Icons.Info size={24} />
                    <p>Cargando puesto de trabajo...</p>
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="page">
                <div className="form-alert form-alert-error">
                    {error}
                </div>

                <div className="page-actions">
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => navigate("/puestosTrabajoViews")}
                    >
                        Volver
                    </button>
                </div>
            </section>
        );
    }

    if (!puestoTrabajo) {
        return (
            <section className="page">
                <div className="form-alert form-alert-error">
                    No se encontró información del puesto de trabajo.
                </div>
            </section>
        );
    }

    return (
        <section className="page">
            <div className="page-header">
                <div>
                    <h1>Detalle del puesto de trabajo</h1>
                    <p>
                        Consulta la información registrada de este puesto dentro del taller.
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

            <div className="detail-card">
                {/* Header del detalle con ícono */}
                <div className="detail-header">
                    <div className="detail-icon">
                        <Icons.Positions size={40} />
                    </div>
                    <div className="detail-title">
                        <h2>{puestoTrabajo.nombre}</h2>
                        <span className={`detail-status status-${puestoTrabajo.activo ? 'active' : 'inactive'}`}>
                            <span className="status-dot"></span>
                            {puestoTrabajo.activo ? "Activo" : "Inactivo"}
                        </span>
                    </div>
                </div>

                {/* Grid de información */}
                <div className="detail-grid">
                    {/* Nombre */}
                    <div className="detail-item">
                        <div className="detail-label">
                            <Icons.Role size={16} />
                            Nombre del puesto
                        </div>
                        <div className="detail-value">
                            {puestoTrabajo.nombre}
                        </div>
                    </div>

                    {/* Estado */}
                    <div className="detail-item">
                        <div className="detail-label">
                            <Icons.Check size={16} />
                            Estado actual
                        </div>
                        <div className="detail-value">
                            <span className={`status-badge status-${puestoTrabajo.activo ? 'active' : 'inactive'}`}>
                                {puestoTrabajo.activo ? "Activo" : "Inactivo"}
                            </span>
                        </div>
                    </div>

                    {/* Descripción (ocupa todo el ancho) */}
                    <div className="detail-item detail-full">
                        <div className="detail-label">
                            <Icons.Info size={16} />
                            Descripción del puesto
                        </div>
                        <div className="detail-value description-text">
                            {puestoTrabajo.descripcion ? (
                                puestoTrabajo.descripcion
                            ) : (
                                <span className="empty-value">Sin descripción registrada</span>
                            )}
                        </div>
                    </div>

                    {/* Fecha de creación */}
                    <div className="detail-item">
                        <div className="detail-label">
                            <Icons.Calendar size={16} />
                            Fecha de creación
                        </div>
                        <div className="detail-value">
                            {puestoTrabajo.created_at
                                ? new Date(puestoTrabajo.created_at).toLocaleDateString('es-ES', {
                                    day: '2-digit',
                                    month: 'long',
                                    year: 'numeric'
                                  })
                                : "No disponible"}
                        </div>
                    </div>

                    {/* Última actualización */}
                    <div className="detail-item">
                        <div className="detail-label">
                            <Icons.Refresh size={16} />
                            Última actualización
                        </div>
                        <div className="detail-value">
                            {puestoTrabajo.updated_at
                                ? new Date(puestoTrabajo.updated_at).toLocaleDateString('es-ES', {
                                    day: '2-digit',
                                    month: 'long',
                                    year: 'numeric'
                                  })
                                : "No disponible"}
                        </div>
                    </div>
                </div>

                {/* Empleados en este puesto (opcional - si tienes relación) */}
                {puestoTrabajo.empleados && puestoTrabajo.empleados.length > 0 && (
                    <div className="detail-section">
                        <div className="detail-section-header">
                            <Icons.Users size={18} />
                            <h3>Empleados en este puesto</h3>
                        </div>
                        <div className="empleados-list">
                            {puestoTrabajo.empleados.map(empleado => (
                                <div key={empleado.id} className="empleado-tag">
                                    <Icons.UserSingle size={12} />
                                    {empleado.nombre} {empleado.apellido}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="page-actions">
                <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => navigate(-1)}
                >
                    <Icons.ArrowRight size={12} style={{ transform: 'rotate(180deg)' }} />
                    Volver
                </button>

                <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => navigate(`/puestosTrabajo/${puestoTrabajo.id}/editar`)}
                > 
                    <Icons.Edit size={14} />
                    Editar puesto
                </button>
            </div>
        </section>
    );
}