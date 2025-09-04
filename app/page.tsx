import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import {
	CheckIcon,
	PlayIcon,
	PersonIcon,
	ClockIcon,
} from '@radix-ui/react-icons'

export default function LandingPage() {
	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
			{/* Header */}
			<header className="container mx-auto px-4 py-6">
				<nav className="flex items-center justify-between">
					<div className="flex items-center space-x-2">
						<div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
							<CheckIcon className="h-5 w-5 text-white" />
						</div>
						<span className="text-xl font-bold text-gray-900">TaskFlow</span>
					</div>
					<div className="flex items-center space-x-4">
						<Link href="/login">
							<Button variant="ghost">Iniciar Sesión</Button>
						</Link>
						<Link href="/register">
							<Button>Comenzar Gratis</Button>
						</Link>
					</div>
				</nav>
			</header>

			{/* Hero Section */}
			<section className="container mx-auto px-4 py-20 text-center">
				<h1 className="text-5xl font-bold text-gray-900 mb-6">
					Gestiona tus proyectos con
					<span className="text-blue-600"> simplicidad</span>
				</h1>
				<p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
					Una plataforma colaborativa para equipos que quieren mantener sus
					tareas organizadas, seguir el progreso en tiempo real y aumentar su
					productividad.
				</p>
				<div className="flex items-center justify-center space-x-4">
					<Link href="/register">
						<Button size="lg" className="text-lg px-8 py-3">
							<PlayIcon className="mr-2 h-5 w-5" />
							Empezar Ahora
						</Button>
					</Link>
					<Button variant="outline" size="lg" className="text-lg px-8 py-3">
						Ver Demo
					</Button>
				</div>
			</section>

			{/* Features Section */}
			<section className="container mx-auto px-4 py-20">
				<div className="text-center mb-16">
					<h2 className="text-3xl font-bold text-gray-900 mb-4">
						Todo lo que necesitas para gestionar proyectos
					</h2>
					<p className="text-lg text-gray-600 max-w-2xl mx-auto">
						Desde la planificación hasta la entrega, TaskFlow te ayuda a
						mantener todo organizado
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
					<Card className="border-0 shadow-lg">
						<CardHeader>
							<div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
								<PersonIcon className="h-6 w-6 text-blue-600" />
							</div>
							<CardTitle>Colaboración en Tiempo Real</CardTitle>
							<CardDescription>
								Trabaja con tu equipo en tiempo real. Ve las actualizaciones al
								instante y mantén a todos sincronizados.
							</CardDescription>
						</CardHeader>
					</Card>

					<Card className="border-0 shadow-lg">
						<CardHeader>
							<div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
								<CheckIcon className="h-6 w-6 text-green-600" />
							</div>
							<CardTitle>Tableros Kanban</CardTitle>
							<CardDescription>
								Visualiza el flujo de trabajo con tableros al estilo Jira.
								Arrastra y suelta tareas entre columnas.
							</CardDescription>
						</CardHeader>
					</Card>

					<Card className="border-0 shadow-lg">
						<CardHeader>
							<div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
								<ClockIcon className="h-6 w-6 text-purple-600" />
							</div>
							<CardTitle>Seguimiento de Tiempo</CardTitle>
							<CardDescription>
								Establece fechas límite, asigna prioridades y mantén el control
								de todos los plazos importantes.
							</CardDescription>
						</CardHeader>
					</Card>
				</div>
			</section>

			{/* Benefits Section */}
			<section className="bg-white py-20">
				<div className="container mx-auto px-4">
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
						<div>
							<h2 className="text-3xl font-bold text-gray-900 mb-6">
								Perfecto para equipos de todos los tamaños
							</h2>
							<div className="space-y-4">
								<div className="flex items-start space-x-3">
									<CheckIcon className="h-6 w-6 text-green-500 mt-0.5" />
									<div>
										<h3 className="font-semibold text-gray-900">
											Control de Roles
										</h3>
										<p className="text-gray-600">
											Administra permisos y roles para cada miembro del equipo
										</p>
									</div>
								</div>
								<div className="flex items-start space-x-3">
									<CheckIcon className="h-6 w-6 text-green-500 mt-0.5" />
									<div>
										<h3 className="font-semibold text-gray-900">
											Múltiples Proyectos
										</h3>
										<p className="text-gray-600">
											Organiza diferentes proyectos y equipos en una sola
											plataforma
										</p>
									</div>
								</div>
								<div className="flex items-start space-x-3">
									<CheckIcon className="h-6 w-6 text-green-500 mt-0.5" />
									<div>
										<h3 className="font-semibold text-gray-900">
											Notificaciones Inteligentes
										</h3>
										<p className="text-gray-600">
											Recibe actualizaciones importantes sin saturación de
											notificaciones
										</p>
									</div>
								</div>
							</div>
						</div>
						<div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-8 text-white">
							<h3 className="text-2xl font-bold mb-4">¿Listo para empezar?</h3>
							<p className="text-blue-100 mb-6">
								Únete a miles de equipos que ya están usando TaskFlow para
								mejorar su productividad.
							</p>
							<Link href="/register">
								<Button size="lg" variant="secondary" className="w-full">
									Crear cuenta gratuita
								</Button>
							</Link>
						</div>
					</div>
				</div>
			</section>

			{/* Footer */}
			<footer className="bg-gray-900 text-gray-300 py-12">
				<div className="container mx-auto px-4">
					<div className="grid grid-cols-1 md:grid-cols-4 gap-8">
						<div>
							<div className="flex items-center space-x-2 mb-4">
								<div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
									<CheckIcon className="h-5 w-5 text-white" />
								</div>
								<span className="text-xl font-bold text-white">TaskFlow</span>
							</div>
							<p className="text-gray-400">
								La plataforma de gestión de tareas colaborativas más intuitiva
								del mercado.
							</p>
						</div>
						<div>
							<h4 className="font-semibold text-white mb-4">Producto</h4>
							<ul className="space-y-2">
								<li>
									<a href="#" className="hover:text-white transition-colors">
										Características
									</a>
								</li>
								<li>
									<a href="#" className="hover:text-white transition-colors">
										Precios
									</a>
								</li>
								<li>
									<a href="#" className="hover:text-white transition-colors">
										Integraciones
									</a>
								</li>
							</ul>
						</div>
						<div>
							<h4 className="font-semibold text-white mb-4">Empresa</h4>
							<ul className="space-y-2">
								<li>
									<a href="#" className="hover:text-white transition-colors">
										Acerca de
									</a>
								</li>
								<li>
									<a href="#" className="hover:text-white transition-colors">
										Blog
									</a>
								</li>
								<li>
									<a href="#" className="hover:text-white transition-colors">
										Contacto
									</a>
								</li>
							</ul>
						</div>
						<div>
							<h4 className="font-semibold text-white mb-4">Soporte</h4>
							<ul className="space-y-2">
								<li>
									<a href="#" className="hover:text-white transition-colors">
										Centro de Ayuda
									</a>
								</li>
								<li>
									<a href="#" className="hover:text-white transition-colors">
										Documentación
									</a>
								</li>
								<li>
									<a href="#" className="hover:text-white transition-colors">
										Estado del Sistema
									</a>
								</li>
							</ul>
						</div>
					</div>
					<div className="border-t border-gray-800 mt-8 pt-8 text-center">
						<p className="text-gray-400">
							© 2025 TaskFlow. Todos los derechos reservados.
						</p>
					</div>
				</div>
			</footer>
		</div>
	)
}
