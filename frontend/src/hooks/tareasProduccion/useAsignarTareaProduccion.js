import { useEffect, useReducer } from "react";
import { useNavigate } from "react-router-dom";
import { Empleados } from "../../api/Empleados";
import { TareasProduccion } from "../../api/TareasProduccion";

const initialState = {
    empleados: [],
    loading: true,
    assigning: false,
    error: null,
    successMessage: null,
    selectedEmpleadoId: "",
};

function reducer(state, action) {
    switch (action.type) {
        case "FETCH_START":
            return {
                ...state,
                loading: true,
                error: null,
            };

        case "FETCH_SUCCESS":
            return {
                ...state,
                loading: false,
                empleados: action.payload,
            };

        case "FETCH_ERROR":
            return {
                ...state,
                loading: false,
                error: action.payload,
            };

        case "SET_SELECTED_EMPLEADO":
            return {
                ...state,
                selectedEmpleadoId: action.payload,
            };

        case "ASSIGN_START":
            return {
                ...state,
                assigning: true,
                error: null,
                successMessage: null,
            };

        case "ASSIGN_SUCCESS":
            return {
                ...state,
                assigning: false,
                successMessage: action.payload,
            };

        case "ASSIGN_ERROR":
            return {
                ...state,
                assigning: false,
                error: action.payload,
            };

        default:
            return state;
    }
}

export function useAsignarTareaProduccion(tareaId, puestoTrabajoId) {
    const [state, dispatch] = useReducer(reducer, initialState);
    const navigate = useNavigate();

    const fetchEmpleadosDisponibles = async () => {
        try {
            dispatch({ type: "FETCH_START" });

            const response = await Empleados.empleadosDisponiblesParaTarea(
                puestoTrabajoId
            );
            dispatch({
                type: "FETCH_SUCCESS",
                payload: response.data,
            });
        } catch (error) {
           
            dispatch({
                type: "FETCH_ERROR",
                payload:
                    error.response?.data?.message ||
                    "No se pudieron cargar los empleados disponibles.",
            });
        }
    };

    const asignarTarea = async () => {
        if (!state.selectedEmpleadoId) {
            dispatch({
                type: "ASSIGN_ERROR",
                payload: "Debes seleccionar un empleado.",
            });
            return;
        }

        try {
            dispatch({ type: "ASSIGN_START" });

            const response = await TareasProduccion.asignar(tareaId, {
                empleado_id: state.selectedEmpleadoId,
            });

            dispatch({
                type: "ASSIGN_SUCCESS",
                payload: response.message || "Tarea asignada correctamente.",
            });

            setTimeout(() => {
                navigate(-1);
            }, 700);
        } catch (error) {
            dispatch({
                type: "ASSIGN_ERROR",
                payload:
                    error.response?.data?.message ||
                    error.response?.data?.error ||
                    "No se pudo asignar la tarea.",
            });
        }
    };

    useEffect(() => {
        if (puestoTrabajoId) {
            fetchEmpleadosDisponibles();
        }
    }, [puestoTrabajoId]);

    return {
        ...state,
        dispatch,
        asignarTarea,
    };
}