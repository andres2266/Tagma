import React from 'react'
import { authStore } from '../../stores/auth.js'
import { Link } from 'react-router-dom'
import LogoutButton from '../../components/common/LogoutButton.jsx'
import LinksHomeAdmind from '../../components/links/LinksHomeAdmind.jsx'
import Icons from '../../utils/icons.jsx'
import { JornadaLaboralButton } from '../../components/common/JornadaLaboralButton.jsx'
export default function HomePageGestor() {
    const user = authStore((state) => state.empleado)

    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <div className="home-container">
            {/* Banner de bienvenida */}
            <div className="welcome-banner">
                <div className="welcome-text">
                    <h3>¡Bienvenido, Gestor! {user.nombre}</h3>
                    <p>Gestiona tu tapicería de forma eficiente y organizada</p>
                </div>
                <div className="welcome-date">
                    <Icons.Calendar />
                    <span>{formattedDate}</span>
                </div>
            </div>

            {/* Header */}
            <div className="home-header">
                <h1>Panel de Control</h1>
                <p>Selecciona una opción para comenzar a gestionar tu taller</p>
            </div>
            {/* Grid de tarjetas con tus Links normales */}
            <div className="home-menu">
                <div className="home-grid">




                    <Link to="/empleado/view" className="home-card">
                        <div className="home-card-icon"><Icons.ViewUsers /></div>
                        <h3 className="home-card-title">Ver usuarios</h3>
                        <p className="home-card-description">Consulta, edita y gestiona todos los trabajadores del taller</p>
                        <div className="home-card-arrow">
                            <span>Acceder</span>
                            <Icons.ArrowRight />
                        </div>
                    </Link>

                    <Link to="/produccion/home" className="home-card">
                        <div className="home-card-icon"><Icons.Orders /></div>
                        <h3 className="home-card-title">Órdenes de pedido</h3>
                        <p className="home-card-description">Controla la producción, seguimiento y estado de pedidos</p>
                        <div className="home-card-arrow">
                            <span>Acceder</span>
                            <Icons.ArrowRight />
                        </div>
                    </Link>

                    <Link to="/modelos/home" className="home-card">
                        <div className="home-card-icon"><Icons.Models size={24} /></div>
                        <h3 className="home-card-title">Modelos</h3>
                        <p className="home-card-description">Gestiona los modelos de productos y sus especificaciones</p>
                        <div className="home-card-arrow">
                            <span>Acceder</span>
                            <Icons.ArrowRight size={14} />
                        </div>
                    </Link>

                </div>
            </div>
            <div className="action-buttons-row">
                <div className="logout-section">
                    <LogoutButton />
                </div>
                <div className="operario-actions-footer">
                    {user?.tipo_contrato === 'horas' && <JornadaLaboralButton />}
                </div>
            </div>

        </div>




    );
}
