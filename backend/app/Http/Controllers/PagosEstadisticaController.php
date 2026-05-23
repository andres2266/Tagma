<?php

namespace App\Http\Controllers;

use App\Models\Empleado;
use App\Models\PagoEmpleado;
use Illuminate\Http\Request;

class PagosEstadisticaController extends Controller
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

        $totalPendiente = Empleado::where('empresa_id', $empresaId)
            ->where('saldo_pendiente', '>', 0)
            ->sum('saldo_pendiente');

        $pagadoMesActual = PagoEmpleado::where('empresa_id', $empresaId)
            ->whereMonth('fecha_pago', now()->month)
            ->whereYear('fecha_pago', now()->year)
            ->sum('monto_pagado');

        $empleadosConSaldoPendiente = Empleado::where('empresa_id', $empresaId)
            ->where('saldo_pendiente', '>', 0)
            ->count();

        $ultimoPago = PagoEmpleado::with('empleado:id,nombre,apellido')
            ->where('empresa_id', $empresaId)
            ->latest()
            ->first();

        return response()->json([
            'message' => 'Estadísticas de pagos obtenidas correctamente.',
            'data' => [
                'total_pendiente' => (float) $totalPendiente,
                'pagado_mes_actual' => (float) $pagadoMesActual,
                'empleados_con_saldo_pendiente' => $empleadosConSaldoPendiente,
                'ultimo_pago' => $ultimoPago ? [
                    'id' => $ultimoPago->id,
                    'fecha_pago' => $ultimoPago->fecha_pago,
                    'monto_pagado' => (float) $ultimoPago->monto_pagado,
                    'metodo_pago' => $ultimoPago->metodo_pago,
                    'empleado' => trim(
                        $ultimoPago->empleado->nombre . ' ' . $ultimoPago->empleado->apellido
                    ),
                ] : null,
            ],
        ]);
    }
}
