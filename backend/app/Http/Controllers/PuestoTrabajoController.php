<?php

namespace App\Http\Controllers;

use App\Http\Requests\PuestosTrabajo\CreatePuestoTrabajoRequest;
use App\Http\Requests\PuestosTrabajo\UpdatePuestoTrabajoRequest;
use App\Models\PuestoTrabajo;
use Illuminate\Http\Request;

class PuestoTrabajoController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function view(Request $request)
    {
        $user = $request->user();

        if (!in_array($user->rol, ['administrador', 'gestor'])) {
            return response()->json([
                'message' => 'No tienes permisos para ver puestos de trabajo.'
            ], 403);
        }

        $perPage = $request->input('per_page', 10);

        $puestosTrabajo = PuestoTrabajo::where('empresa_id', $user->empresa_id)
            ->when($request->filled('search'), function ($query) use ($request) {
                $search = $request->search;

                $query->where(function ($q) use ($search) {
                    $q->where('nombre', 'like', "%{$search}%")
                        ->orWhere('descripcion', 'like', "%{$search}%");
                });
            })
            ->when($request->filled('estado'), function ($query) use ($request) {
                if ($request->estado === 'activo') {
                    $query->where('activo', true);
                }

                if ($request->estado === 'inactivo') {
                    $query->where('activo', false);
                }
            })
            ->select(
                'id',
                'empresa_id',
                'nombre',
                'descripcion',
                'activo',
                'created_at'
            )
            ->orderBy('nombre')
            ->paginate($perPage);

        return response()->json([
            'message' => 'Lista de puestos de trabajo',
            'data' => $puestosTrabajo,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create() {}

    /**
     * Store a newly created resource in storage.
     */
    public function store(CreatePuestoTrabajoRequest  $request)
    {
        $user = $request->user();
        if ($user->rol !== 'administrador') {
            return response()->json([
                'message' => 'No tienes permisos para crear puestos de trabajo.',
            ], 403);
        }
        $data = $request->validated();
        $puestoTrabajo = PuestoTrabajo::create([
            'empresa_id' => $user->empresa_id,
            'nombre' => $data['nombre'],
            'activo' => $data['activo'],
            'descripcion' => $data['descripcion']
        ]);

        return response()->json([
            'message' => 'Puesto de trabajo creado correctamente.',
            'data' => $puestoTrabajo,
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, PuestoTrabajo $puestoTrabajo)
    {
        $user = $request->user();

        if (!in_array($user->rol, ['administrador', 'gestor'])) {
            return response()->json([
                'message' => 'No tienes permisos para ver este puesto de trabajo.'
            ], 403);
        }

        $puestoTrabajo = PuestoTrabajo::where('empresa_id', $user->empresa_id)
            ->where('id', $puestoTrabajo->id)
            ->firstOrFail();

        return response()->json([
            'message' => 'Detalle del puesto de trabajo.',
            'data' => $puestoTrabajo
        ]); {
        }
    }

    public function cambiarEstado(Request $request, PuestoTrabajo $puesto)
{
    $usuario = $request->user();

    if ($puesto->empresa_id !== $usuario->empresa_id) {
        return response()->json([
            'message' => 'Puesto de trabajo no encontrado.'
        ], 404);
    }

    $request->validate([
        'activo' => ['required', 'boolean'],
    ]);

    $nuevoEstado = $request->boolean('activo');

    if ($puesto->tareasProduccion()->exists() && $nuevoEstado === false) {
        return response()->json([
            'message' => 'No puedes desactivar un puesto de trabajo con tareas asignadas.'
        ], 422);
    }

    if ($puesto->procesosFabricacion()->exists() && $nuevoEstado === false) {
        return response()->json([
            'message' => 'No puedes desactivar un puesto de trabajo con un proceso de fabricación asignado.'
        ], 422);
    }

    if ($puesto->empleados()->exists() && $nuevoEstado === false) {
        return response()->json([
            'message' => 'No puedes desactivar un puesto de trabajo con empleados asignados.'
        ], 422);
    }

    $puesto->activo = $nuevoEstado;
    $puesto->save();

    return response()->json([
        'message' => $puesto->activo
            ? 'Puesto de trabajo activado correctamente.'
            : 'Puesto de trabajo desactivado correctamente.',
        'data' => $puesto,
    ]);
}

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdatePuestoTrabajoRequest $request, PuestoTrabajo $puestoTrabajo)
    {
        $user = $request->user();

        $puestoTrabajo = PuestoTrabajo::where('empresa_id', $user->empresa_id)
            ->where('id', $puestoTrabajo->id)
            ->firstOrFail();

        if ($puestoTrabajo->tareasProduccion()->exists()) {
            return response()->json([
                'message' => 'No puedes modificar este puesto de trabajo porque ya tiene tareas de producción asociadas.'
            ], 409);
        }

        $data = $request->validated();

        $data = array_filter($data, function ($value) {
            return !is_null($value);
        });



        $puestoTrabajo->update($data);

        return response()->json([
            'message' => 'Puesto de trabajo actualizado correctamente.',
            'data' => $puestoTrabajo->fresh()
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id) {}
}
