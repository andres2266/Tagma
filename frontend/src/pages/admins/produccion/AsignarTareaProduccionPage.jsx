import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useAsignarTareaProduccion } from "../../../hooks/tareasProduccion/useAsignarTareaProduccion";

export function AsignarTareaProduccionPage() {
    const navigate = useNavigate();
    const { tareaId } = useParams();
    const {puestoTrabajoId} = useParams();


    const {
        empleados,
        loading,
        assigning,
        error,
        successMessage,
        selectedEmpleadoId,
        dispatch,
        asignarTarea,
    } = useAsignarTareaProduccion(tareaId, puestoTrabajoId);
    console.log(empleados)
    return (
        <main className="page">
            <div className="page-header">
                <div>
                    <h1>Asignar tarea</h1>
                    <p>Selecciona un operario disponible para esta tarea.</p>
                </div>
            </div>

            {error && (
                <div className="form-alert form-alert-error">
                    {error}
                </div>
            )}

            {successMessage && (
                <div className="form-alert form-alert-success">
                    {successMessage}
                </div>
            )}

            {loading && <p>Cargando empleados disponibles...</p>}

            {!loading && !error && empleados.length === 0 && (
                <section className="card">
                    <p>No hay empleados disponibles para esta tarea.</p>
                </section>
            )}

            {!loading && !error && empleados.length > 0 && (
                <section className="card">
                    <div className="table-wrapper">
                        <table className="data-table tasks-table">
                            <thead>
                                <tr>
                                    <th>Seleccionar</th>
                                    <th>Nombre</th>
                                    <th>Usuario</th>
                                    <th>Puesto</th>
                                    <th>Contrato</th>
                                    <th>Saldo pendiente</th>
                                </tr>
                            </thead>

                            <tbody>
                                {empleados.map((empleado) => (
                                    <tr key={empleado.id}>
                                        <td>
                                            <input
                                                type="radio"
                                                name="empleado_id"
                                                value={empleado.id}
                                                checked={
                                                    String(selectedEmpleadoId) ===
                                                    String(empleado.id)
                                                }
                                                onChange={(e) =>
                                                    dispatch({
                                                        type: "SET_SELECTED_EMPLEADO",
                                                        payload: e.target.value,
                                                    })
                                                }
                                            />
                                        </td>

                                        <td>
                                            <strong>
                                                {empleado.nombre}{" "}
                                                {empleado.apellido || ""}
                                            </strong>
                                        </td>

                                        <td>{empleado.usuario}</td>

                                        <td>
                                            {empleado.puesto_trabajo?.nombre||
                                                "Sin puesto"}
                                        </td>

                                        <td>{empleado.tipo_contrato}</td>

                                        <td>
                                            {Number(
                                                empleado.saldo_pendiente || 0
                                            ).toFixed(2)}{" "}
                                            €
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="pagination">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => navigate(-1)}
                            disabled={assigning}
                        >
                            Cancelar
                        </button>

                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={asignarTarea}
                            disabled={assigning || !selectedEmpleadoId}
                        >
                            {assigning ? "Asignando..." : "Asignar tarea"}
                        </button>
                    </div>
                </section>
            )}
        </main>
    );
}