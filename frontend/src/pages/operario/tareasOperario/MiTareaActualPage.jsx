import { useNavigate } from "react-router-dom";
import { useTareaActualProduccion } from "../../../hooks/tareasProduccion/useTareaActualProduccion";
import Icons from "../../../utils/icons";
export default function MiTareaActualPage() {
    const navigate = useNavigate();

    const {
        tarea,
        loading,
        error,
        successMessage,
        finishing,
        terminarTarea,
    } = useTareaActualProduccion();
    console.log(tarea)
    const handleVerProceso = (tareaId) => {
        navigate(`/tareas/${tareaId}/showInstrucciones/`);
    };

    if (loading) {
        return (
            <div className="page">
                <p>Cargando tarea actual...</p>
            </div>
        );
    }

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1>Mi tarea actual</h1>

                    <p>
                        Aquí puedes ver la tarea que tienes asignada actualmente.
                    </p>
                </div>

                <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => navigate("/homeOperario")}
                >
                    Volver
                </button>


            </div>

            {error && (
                <p className="form-alert form-alert-error">
                    {error}
                </p>
            )}

            {successMessage && (
                <p className="form-alert form-alert-success">
                    {successMessage}
                </p>
            )}

            {!tarea ? (
                <div className="card">
                    <p>No hay tarea asignada.</p>
                </div>
            ) : (
                <div className="card mi-tarea-card">

                    <div className="mi-tarea-top">

                        <div className="mi-tarea-title">

                            <span
                                className={`estado-badge estado-${tarea.estado}`}
                            >
                                {tarea.estado}
                            </span>

                            <h2>{tarea.nombre_tarea}</h2>

                            <p>
                                Trabajo actualmente asignado dentro del proceso de producción.
                            </p>

                        </div>


                    </div>

                    <div className="mi-tarea-grid">

                        <div
                            className={`mi-tarea-item mi-tarea-priority-${tarea.orden_produccion?.prioridad}`}
                        >
                            <label>Orden de producción</label>

                            <strong>
                                {tarea.orden|| "Sin orden"}
                            </strong>
                        </div>

                        <div className="mi-tarea-item">
                            <label>Puesto de trabajo</label>

                            <strong>
                                {tarea.puesto_trabajo?.nombre || "Sin puesto"}
                            </strong>
                        </div>

                        <div className="mi-tarea-item">
                            <label>Prioridad</label>

                            <strong>
                                {tarea.orden_produccion?.prioridad || "Normal"}
                            </strong>
                        </div>

                        <div className="mi-tarea-item">
                            <label>Tiempo estimado</label>

                            <strong>
                                {tarea.tiempo_estimado_minutos
                                    ? `${tarea.tiempo_estimado_minutos} minutos`
                                    : "No definido"}
                            </strong>
                        </div>

                        <div className="mi-tarea-item mi-tarea-money">
                            <label>Pago por destajo</label>

                            <strong>
                                {tarea.ganancia_destajo
                                    ? `${tarea.ganancia_destajo} €`
                                    : "0 €"}
                            </strong>
                        </div>

                    </div>

                    <div className="mi-tarea-description">

                        <h3>Descripción del trabajo</h3>

                        <p>
                            {tarea.descripcion ||
                                "Esta tarea no tiene descripción."}
                        </p>

                    </div>

                    <div className="mi-tarea-actions">

                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() =>
                                navigate("/operario/tareas-disponibles")
                            }
                        >
                            Ver tareas disponibles
                        </button>

                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={terminarTarea}
                            disabled={finishing}
                        >
                            {finishing
                                ? "Finalizando..."
                                : "Marcar como finalizada"}
                        </button>

                        <button
                            className="btn btn-secondary"
                            onClick={() => handleVerProceso(tarea.id)}
                            title="Ver proceso de fabricación"
                        >
                            <Icons.Info size={12} />
                            Ver proceso
                        </button>

                    </div>

                </div>
            )}
        </div>
    );
}