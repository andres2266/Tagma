<?php

namespace App\Http\Controllers;

use App\Http\Requests\Empleados\AsignarPuestoTrabajoRequest;
use Illuminate\Http\Request;
use App\Http\Requests\Empleados\UpdateEmpleadoRequest;
use App\Http\Requests\Empleados\CreateEmpleadoRequest;
use App\Models\Empleado;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class EmpleadoController extends Controller
{

    /**
     * Display a listing of the resource.
     */
    public function view(Request $request)
{
    $usuario = $request->user();

    if (!in_array($usuario->rol, ['administrador', 'gestor'])) {
        return response()->json([
            'message' => 'No tienes permisos para ver empleados.'
        ], 403);
    }

    $empleados = Empleado::with('puestoTrabajo')
        ->where('empresa_id', $usuario->empresa_id)
        ->when($request->search, function ($query) use ($request) {
            $query->where(function ($q) use ($request) {
                $q->where('nombre', 'like', "%{$request->search}%")
                    ->orWhere('apellido', 'like', "%{$request->search}%")
                    ->orWhere('usuario', 'like', "%{$request->search}%");
            });
        })
        ->when($request->rol, function ($query) use ($request) {
            $query->where('rol', $request->rol);
        })
        ->when($request->filled('activo'), function ($query) use ($request) {
            $query->where('activo', $request->boolean('activo'));
        })
        ->when($request->sin_puesto, function ($query) {
            $query->whereNull('puesto_trabajo_id');
        })
        ->when($request->puesto_trabajo_id, function ($query) use ($request) {
            $query->where('puesto_trabajo_id', $request->puesto_trabajo_id);
        })
        ->when($request->disponibles, function ($query) {
            $query->whereDoesntHave('tareasProduccion', function ($tareaQuery) {
                $tareaQuery->whereIn('estado', ['asignada', 'en_progreso']);
            });
        })
        ->select('id','puesto_trabajo_id','nombre', 'apellido','usuario','rol','activo' )->paginate(10);

    return response()->json($empleados, 200);
}

    /**
     * Store a newly created resource in storage.
     */
    public function store(CreateEmpleadoRequest $request)
    {
        $usuario = $request->user();

        if (!in_array($usuario->rol, ['administrador'])) {
            return response()->json([
                'message' => 'No tienes permisos para crear empleados.'
            ], 403);
        }


        $validated = $request->validated();

        $empleado = Empleado::create([
            'empresa_id' => $request->user()->empresa_id,
            'usuario'       => $validated['usuario'],
            'email'         => $validated['email'] ?? null,
            'password'      => Hash::make($validated['password']),
            'nombre'        => $validated['nombre'],
            'apellido'      => $validated['apellido'] ?? null,
            'telefono'      => $validated['telefono'] ?? null,
            'dni'           => $validated['dni'] ?? null,
            'tipo_contrato' => $validated['tipo_contrato'],
            'precio_hora'   => $validated['precio_hora'] ?? null,
            'saldo_pendiente' => 0,
            'rol'           => $validated['rol'],
            'activo'        => $validated['activo'] ?? true,
        ]);

        return response()->json([
            'message'  => 'Empleado creado correctamente',
            'empleado' => $empleado
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, Empleado $empleado)
    {
        $usuario = $request->user();

        if (!in_array($usuario->rol, ['administrador', 'gestor','operario'])) {
            return response()->json([
                'message' => 'No tienes permisos para ver este empleado.',
            ], 403);
        }

        if ($usuario->empresa_id !== $empleado->empresa_id) {
            return response()->json([
                'message' => 'Empleado no encontrado.',
            ], 404);
        }

        $empleado->load([
            'empresa:id,nombre,email,telefono',
            'puestoTrabajo:id,nombre',
        ]);

        return response()->json([
            'message' => 'Empleado encontrado correctamente.',
            'data' => $empleado,
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
    public function update(UpdateEmpleadoRequest $request, Empleado $empleado)
    {
        $usuario = $request->user();

        if (!in_array($usuario->rol, ['administrador'])) {
            return response()->json([
                'message' => 'No tienes permisos para modificar un empleado.'
            ], 403);
        }

        $data = $request->validated();

        if (array_key_exists('password', $data)) {
            if (!empty($data['password'])) {
                $data['password'] = Hash::make($data['password']);
            } else {
                unset($data['password']);
            }
        }

        $data = array_filter($data, function ($value) {
            return $value !== null && $value !== '';
        });

        $empleado->update($data);

        return response()->json([
            'message' => 'Empleado actualizado correctamente',
            'empleado' => $empleado->fresh()
        ], 200);
    }


    public function asignarPuestoTrabajo(AsignarPuestoTrabajoRequest $request, Empleado $empleado)
    {
        $usuario = $request->user();

        if (!in_array($usuario->rol, ['administrador', 'gestor'])) {
            return response()->json([
                'message' => 'No tienes permisos para asignar puestos de trabajo.'
            ], 403);
        }

        if ($empleado->empresa_id !== $usuario->empresa_id) {
            return response()->json([
                'message' => 'Empleado no encontrado.'
            ], 404);
        }

        $validated = $request->validated();

        $tieneTareaActiva = $empleado->tareasProduccion()
            ->whereIn('estado', ['asignada', 'en_progreso'])
            ->exists();

        if ($tieneTareaActiva) {
            return response()->json([
                'message' => 'No puedes cambiar el puesto de trabajo porque el empleado tiene tareas activas.'
            ], 422);
        }

        // Solo update() basta, no necesitas save() después
        $empleado->update([
            'puesto_trabajo_id' => $validated['puesto_trabajo_id'],
        ]);


        return response()->json([
            'message' => 'Puesto de trabajo asignado correctamente.',
            'empleado' => $empleado->load([
                'puestoTrabajo:id,nombre',
            ]),
        ], 200);
    }


    public function updateEstado(UpdateEmpleadoRequest $request, Empleado $empleado)
    {
        $usuario = $request->user();

        if (!in_array($usuario->rol, ['administrador', 'gestor'])) {
            return response()->json([
                'message' => 'No tienes permisos para cambiar el estado del empleado.'
            ], 403);
        }

        if ($empleado->empresa_id !== $usuario->empresa_id) {
            return response()->json([
                'message' => 'Empleado no encontrado.'
            ], 404);
        }

        if ($usuario->id === $empleado->id) {
            return response()->json([
                'message' => 'No puedes darte de baja a ti mismo.'
            ], 422);
        }

        $validated = $request->validated();

        $empleado->update([
            'activo' => $validated['activo'],
        ]);

        return response()->json([
            'message' => $empleado->activo
                ? 'Empleado activado correctamente.'
                : 'Empleado dado de baja correctamente.',
            'empleado' => $empleado->load([
                'puestoTrabajo:id,nombre',
                'empresa:id,nombre',
            ]),
        ], 200);
    }
}
