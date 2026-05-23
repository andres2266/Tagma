import React from "react";
import { Link, useNavigate } from "react-router-dom";
import Icons from "../../utils/icons";

export default function PuestoTrabajoForm({
    register,
    handleSubmit,
    errors,
    isSubmitting,
    onSubmit,
    generalError = null,
    successMessage = null,
    backPath = "/puestosTrabajo",
    mode = "create",
}) {
    const isEdit = mode === "edit";
    const navigate = useNavigate()
    return (
        <form className="employee-form" onSubmit={handleSubmit(onSubmit)}>
            {generalError && (
                <div className="form-alert form-alert-error">
                    <Icons.Alert size={18} />
                    <span>{generalError}</span>
                </div>
            )}

            {successMessage && (
                <div className="form-alert form-alert-success">
                    <Icons.Check size={18} />
                    <span>{successMessage}</span>
                </div>
            )}

            <div className="form-grid">
                <div className="form-group">
                    <label>
                        <Icons.Role size={14} />
                        Nombre del puesto
                    </label>

                    <input
                        type="text"
                        placeholder={
                            isEdit
                                ? "Nuevo nombre del puesto..."
                                : "Ej: Tapicero, Cortador, Costurera..."
                        }
                        {...register("nombre")}
                        className={errors.nombre ? "input-error" : ""}
                    />

                    {errors.nombre && (
                        <p className="form-error">{errors.nombre.message}</p>
                    )}
                </div>

                <div className="form-group">
                    <label>
                        <Icons.Check size={14} />
                        Estado
                    </label>

                    <div className="checkbox-group">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                {...register("activo")}
                                defaultChecked={!isEdit}
                            />

                            <span className="checkbox-text">
                                Activo
                            </span>
                        </label>
                    </div>

                    {errors.activo && (
                        <p className="form-error">{errors.activo.message}</p>
                    )}
                </div>

                <div className="form-group form-full">
                    <label>
                        <Icons.Info size={14} />
                        Descripción
                    </label>

                    <textarea
                        rows="5"
                        placeholder={
                            isEdit
                                ? "Nueva descripción del puesto..."
                                : "Describe las funciones y responsabilidades del puesto..."
                        }
                        {...register("descripcion")}
                        className={errors.descripcion ? "input-error" : ""}
                    />

                    {errors.descripcion && (
                        <p className="form-error">
                            {errors.descripcion.message}
                        </p>
                    )}
                </div>
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
                    type="submit"
                    className="btn btn-primary"
                    disabled={isSubmitting}
                >
                    {isSubmitting
                        ? isEdit
                            ? "Actualizando..."
                            : "Guardando..."
                        : isEdit
                            ? "Actualizar puesto"
                            : "Guardar puesto"}
                </button>
            </div>
        </form>
    );
}