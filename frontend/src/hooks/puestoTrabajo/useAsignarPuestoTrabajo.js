import { useEffect, useReducer } from "react";
import { Empleados } from "../../api/Empleados";
import { PuestosTrabajo } from "../../api/PuestosTrabajo";

const initialState = {
    empleados: [],
    puestosTrabajo: [],
    loading: true,
    assigning: false,
    error: null,
    successMessage: null,
    search: "",
    page: 1,
    lastPage: 1,
    selectedPuestos: {},
};

function reducer(state, action) {
    switch (action.type) {
        case "SET_FILTER":
            return {
                ...state,
                [action.field]: action.value,
                page: 1,
            };

        case "SET_PAGE":
            return {
                ...state,
                page: action.page,
            };

        case "SET_PUESTO_EMPLEADO":
            return {
                ...state,
                selectedPuestos: {
                    ...state.selectedPuestos,
                    [action.empleadoId]: action.puestoTrabajoId,
                },
            };

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
                empleados: action.payload.empleados.data || [],
                puestosTrabajo: action.payload.puestosTrabajo.data || [],
                lastPage: action.payload.empleados.last_page || 1,
            };

        case "FETCH_ERROR":
            return {
                ...state,
                loading: false,
                error: action.payload,
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

export function useAsignarPuestoTrabajo() {
    const [state, dispatch] = useReducer(reducer, initialState);

    const fetchData = async () => {
        try {
            dispatch({ type: "FETCH_START" });

            const [empleadosResponse, puestosResponse] = await Promise.all([
                Empleados.view({
                    search: state.search,
                    sin_puesto: 1,
                    page: state.page,
                    rol:'operario',
                    activo:1

                    
                }),
                PuestosTrabajo.view({
                    estado:'activo'
                }),
            ]);

            dispatch({
                type: "FETCH_SUCCESS",
                payload: {
                    empleados: empleadosResponse,
                    puestosTrabajo: puestosResponse.data,
                },
            });
        } catch (error) {
            dispatch({
                type: "FETCH_ERROR",
                payload:
                    error.response?.data?.message ||
                    "No se pudieron cargar los datos.",
            });
        }
    };

    const asignarPuesto = async (empleadoId) => {
        const puestoTrabajoId = state.selectedPuestos[empleadoId];

        if (!puestoTrabajoId) {
            dispatch({
                type: "ASSIGN_ERROR",
                payload: "Debes seleccionar un puesto de trabajo.",
            });
            return;
        }

        try {
            dispatch({ type: "ASSIGN_START" });

            const response = await Empleados.asignarPuestoTrabajo(empleadoId, {
                puesto_trabajo_id: puestoTrabajoId,
            });

            dispatch({
                type: "ASSIGN_SUCCESS",
                payload:
                    response.message ||
                    "Puesto de trabajo asignado correctamente.",
            });

            fetchData();
        } catch (error) {
            dispatch({
                type: "ASSIGN_ERROR",
                payload:
                    error.response?.data?.message ||
                    "No se pudo asignar el puesto de trabajo.",
            });
        }
    };

    useEffect(() => {
        const timeout = setTimeout(() => {
            fetchData();
        }, 400);

        return () => clearTimeout(timeout);
    }, [state.search, state.page]);

    return {
        ...state,
        dispatch,
        asignarPuesto,
    };
}