import React from 'react'
import { useEmpleadosView } from '../../hooks/empleados/useEmpleadosView';
import { Link, useNavigate } from 'react-router-dom';
import Icons from '../../utils/icons';



export default function ViewEmpleadosPage() {
    const { dispatch, empleados, loading, search, rol, error, page, actualizarEstadoEmpleado, successMessage} = useEmpleadosView();

    const navigate = useNavigate();



    const handleCambiarEstado = async (empleado) => {
        const nuevoEstado = !empleado.activo;

        const confirmar = window.confirm(
            empleado.activo
                ? "¿Seguro que quieres dar de baja este empleado? No se borrará su historial."
                : "¿Seguro que quieres activar este empleado?"
        );

        if (!confirmar) return;

        await actualizarEstadoEmpleado(empleado.id, nuevoEstado);
    };

    if (loading) {
        return (
            <div className="loading-message">
                <Icons.Info size={24} />
                <p>Cargando empleados...</p>
            </div>
        );
    }

    if (error && empleados.length === 0) {
        return (
            <div className="form-alert form-alert-error">
                <Icons.Alert size={18} />
                {error}
            </div>
        );
    }

    return (
        <section className="page">
            <div className="page-header">
                <h1>Trabajadores</h1>
                <p>Consulta y administra los empleados del taller.</p>
            </div>

            {error && empleados.length > 0 && (
                <div className="form-alert form-alert-error">
                    <Icons.Alert size={18} />
                    {error}
                </div>
            )}

            {successMessage && (
                <div className="form-alert form-alert-success">
                    <Icons.Check size={18} />
                    {successMessage}
                </div>
            )}

            <div className="card">
                <div className="filters">
                    <div className="form-group">
                        <label>
                            <Icons.Search size={12} />
                            Buscar
                        </label>
                        <input
                            type="text"
                            value={search}
                            placeholder="Nombre, apellido o usuario"
                            onChange={(e) =>
                                dispatch({
                                    type: "SET_FILTER",
                                    field: "search",
                                    value: e.target.value,
                                })
                            }
                        />
                    </div>

                    <div className="form-group">
                        <label>
                            <Icons.Role size={12} />
                            Rol
                        </label>
                        <select
                            value={rol}
                            onChange={(e) =>
                                dispatch({
                                    type: "SET_FILTER",
                                    field: "rol",
                                    value: e.target.value,
                                })
                            }
                        >
                            <option value="">Todos</option>
                            <option value="gestor">Gestor</option>
                            <option value="administrador">Administrador</option>
                            <option value="operario">Operario</option>
                        </select>
                    </div>
                </div>

                <div className="table-wrapper">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Empleado</th>
                                <th>Usuario</th>
                                <th>Rol</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>

                        <tbody>
                            {empleados.length === 0 ? (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', padding: '3rem' }}>
                                        <Icons.Info size={20} />
                                        <p>No hay trabajadores registrados</p>
                                    </td>
                                </tr>
                            ) : (
                                empleados.map((empleado) => (
                                    <tr key={empleado.id}>
                                        <td>
                                            <strong>{empleado.nombre} {empleado.apellido}</strong>
                                        </td>

                                        <td>@{empleado.usuario}</td>

                                        <td>
                                            <span className="badge-muted">
                                                {empleado.rol === 'administrador' && <Icons.Role size={10} />}
                                                {empleado.rol === 'gestor' && <Icons.UserSingle size={10} />}
                                                {empleado.rol === 'operario' && <Icons.UserSingle size={10} />}
                                                {empleado.rol}
                                            </span>
                                        </td>

                                        <td>
                                            <span className={empleado.activo ? "status status-active" : "status status-inactive"}>
                                                <span className="status-dot"></span>
                                                {empleado.activo ? "Activo" : "Inactivo"}
                                            </span>
                                        </td>

                                        <td>
                                            <div className="table-actions">
                                                <button
                                                    className="btn btn-secondary"
                                                    onClick={() => navigate(`/empleados/${empleado.id}/detail`)}
                                                >
                                                    <Icons.Info size={12} />
                                                    Ver
                                                </button>

                                                <button
                                                    className="btn btn-primary"
                                                    onClick={() => navigate(`/empleados/${empleado.id}/editar`)}
                                                >
                                                    <Icons.Edit size={12} />
                                                    Editar
                                                </button>

                                                <button
                                                    type="button"
                                                    className={empleado.activo ? "btn btn-danger" : "btn btn-success"}
                                                    onClick={() => handleCambiarEstado(empleado)}
                                                >
                                                    {empleado.activo ? "Dar de baja" : "Activar"}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="pagination">
                    <button
                        className="btn btn-secondary"
                        disabled={page === 1}
                        onClick={() => dispatch({ type: "SET_PAGE", page: page - 1 })}
                    >
                        <Icons.ArrowRight size={12} style={{ transform: 'rotate(180deg)' }} />
                        Anterior
                    </button>

                    <span className="page-info">Página {page}</span>

                    <button
                        className="btn btn-secondary"
                        onClick={() => dispatch({ type: "SET_PAGE", page: page + 1 })}
                        disabled={empleados.length === 0}
                    >
                        Siguiente
                        <Icons.ArrowRight size={12} />
                    </button>

                    <Link className="btn btn-secondary" to="/homeAdmin">
                        <Icons.Close size={12} />
                        Volver
                    </Link>
                </div>
            </div>
        </section>
    );
}