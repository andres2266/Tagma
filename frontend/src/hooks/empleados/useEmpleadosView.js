
import { useEffect, useReducer } from "react";
import { Empleados } from '../../api/Empleados';


const initialState = { empleados: [], loading: true, error: null, search: "", rol: "", estado: "", page: 1, successMessage: null };

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

        case "SET_SUCCESS_MESSAGE":
            return {
                ...state,
                error: null,
                successMessage: action.payload,
            };

        case "FETCH_ERROR":
            return {
                ...state,
                loading: false,
                error:
                    action.payload?.response?.data?.message ||
                    "Error al cargar empleados.",
            };

        case "SET_GENERAL_ERROR":
            return {
                ...state,
                loading: false,
                error: action.payload,
            };

        case "UPDATE_EMPLEADO_ESTADO":
            return {
                ...state,
                empleados: state.empleados.map((empleado) =>
                    empleado.id === action.id
                        ? { ...empleado, activo: action.activo }
                        : empleado
                ),
            };

        default:
            return state;
    }
}

export function useEmpleadosView() {
    const [state, dispatch] = useReducer(reducer, initialState);

    const fetchEmpleados = async () => {
        try {
            dispatch({ type: "FETCH_START" });

            const data = await Empleados.view({
                search: state.search,
                rol: state.rol,
                activo: state.estado,
                page: state.page,
            });
            console.log(data)
            dispatch({
                type: "FETCH_SUCCESS",
                payload: data.data,
            });

        } catch (error) {
            dispatch({
                type: "FETCH_ERROR",
                payload: error,
            });
        }
    };

    const actualizarEstadoEmpleado = async (id, activo) => {
        try {
            const response = await Empleados.updateEstado(id, activo);

            dispatch({
                type: "UPDATE_EMPLEADO_ESTADO",
                id,
                activo,
            });

            dispatch({
                type: "SET_SUCCESS_MESSAGE",
                payload: response.message || "Estado actualizado correctamente.",
            });

            return response;
        } catch (error) {
            dispatch({
                type: "SET_GENERAL_ERROR",
                payload:
                    error.response?.data?.message ||
                    "Ocurrió un error al cambiar el estado del empleado.",
            });

            return null;
        }
    };

    useEffect(() => {
        const timeout = setTimeout(() => {
            fetchEmpleados();
        }, 400);

        return () => clearTimeout(timeout);
    }, [state.search, state.rol, state.estado, state.page]);

    return {
        ...state,
        dispatch,
        actualizarEstadoEmpleado
    };

}
