<?php

namespace App\Http\Controllers;

use App\Models\OrdenProduccion;
use App\Models\TareaProduccion;
use App\Models\UnidadFabricacion;
use Illuminate\Http\Request;

class TareasEstadisticasController extends Controller
{
    public function index(Request $request)
    {
        $usuario = $request->user();

        if (!in_array($usuario->rol, ['administrador', 'gestor'])) {
            return response()->json([
                'message' => 'No tienes permisos para ver estas estadísticas.',
            ], 403);
        }

        $empresaId = $usuario->empresa_id;

        $tareasPendientes = TareaProduccion::where('empresa_id', $empresaId)
            ->where('estado', 'pendiente')
            ->count();

        $tareasEnProgreso = TareaProduccion::where('empresa_id', $empresaId)
            ->where('estado', 'asignada')
            ->count();

        $empleadosTrabajandoAhora = TareaProduccion::where('empresa_id', $empresaId)
            ->whereIn('estado', ['asignada', 'en_progreso'])
            ->whereNotNull('trabajador_id')
            ->distinct()
            ->count('trabajador_id');

        $ordenesEnProduccion = OrdenProduccion::where('empresa_id', $empresaId)
            ->where('estado', 'pendiente')
            ->count();

        $unidadesPendientes = UnidadFabricacion::whereHas('ordenProduccion', function ($query) use ($empresaId) {
            $query->where('empresa_id', $empresaId);
        })
            ->where('estado', 'pendiente')
            ->whereHas('tareasProduccion', function ($query) {
                $query->where('estado', 'pendiente');
            })
            ->count();

        $tareasCompletadasHoy = TareaProduccion::where('empresa_id', $empresaId)
            ->where('estado', 'completada')
            ->whereDate('hora_fin', now()->toDateString())
            ->count();

        return response()->json([
            'message' => 'Estadísticas de tareas obtenidas correctamente.',
            'data' => [
                'tareas_pendientes' => $tareasPendientes,
                'tareas_en_progreso' => $tareasEnProgreso,
                'empleados_trabajando_ahora' => $empleadosTrabajandoAhora,
                'ordenes_en_produccion' => $ordenesEnProduccion,
                'unidades_pendientes' => $unidadesPendientes,
                'tareas_completadas_hoy' => $tareasCompletadasHoy,
            ],
        ]);
    }
}
