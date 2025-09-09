import {
	PrismaClient,
	UserRole,
	ProjectRole,
	TaskStatus,
	TaskPriority,
} from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
	console.log('🌱 Starting database seed...')

	// Clean existing data (in order due to foreign keys)
	await prisma.taskAttachment.deleteMany()
	await prisma.taskComment.deleteMany()
	await prisma.task.deleteMany()
	await prisma.projectMember.deleteMany()
	await prisma.project.deleteMany()
	await prisma.teamMember.deleteMany()
	await prisma.user.deleteMany()
	await prisma.company.deleteMany()

	console.log('🧹 Cleaned existing data')

	// Hash password for all users
	const hashedPassword = await hash('password123', 10)

	// Create Companies
	const techCorp = await prisma.company.create({
		data: {
			name: 'TechCorp Solutions',
			slug: 'techcorp-solutions',
			logo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=200&h=200&fit=crop&crop=entropy&auto=format',
		},
	})

	const designStudio = await prisma.company.create({
		data: {
			name: 'Creative Design Studio',
			slug: 'creative-design-studio',
			logo: 'https://images.unsplash.com/photo-1572044162444-ad60f128bdea?w=200&h=200&fit=crop&crop=entropy&auto=format',
		},
	})

	console.log('🏢 Created companies')

	// Create Users for TechCorp
	const techCorpUsers = await Promise.all([
		prisma.user.create({
			data: {
				email: 'john.doe@techcorp.com',
				name: 'John Doe',
				avatar:
					'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face&auto=format',
				role: UserRole.ADMIN,
				password: hashedPassword,
				companyId: techCorp.id,
			},
		}),
		prisma.user.create({
			data: {
				email: 'jane.smith@techcorp.com',
				name: 'Jane Smith',
				avatar:
					'https://images.unsplash.com/photo-1494790108755-2616b612b123?w=150&h=150&fit=crop&crop=face&auto=format',
				role: UserRole.USER,
				password: hashedPassword,
				companyId: techCorp.id,
			},
		}),
		prisma.user.create({
			data: {
				email: 'mike.wilson@techcorp.com',
				name: 'Mike Wilson',
				avatar:
					'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face&auto=format',
				role: UserRole.USER,
				password: hashedPassword,
				companyId: techCorp.id,
			},
		}),
		prisma.user.create({
			data: {
				email: 'sarah.jones@techcorp.com',
				name: 'Sarah Jones',
				avatar:
					'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face&auto=format',
				role: UserRole.USER,
				password: hashedPassword,
				companyId: techCorp.id,
			},
		}),
	])

	// Create Users for Design Studio
	const designStudioUsers = await Promise.all([
		prisma.user.create({
			data: {
				email: 'alice.brown@designstudio.com',
				name: 'Alice Brown',
				avatar:
					'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=150&h=150&fit=crop&crop=face&auto=format',
				role: UserRole.ADMIN,
				password: hashedPassword,
				companyId: designStudio.id,
			},
		}),
		prisma.user.create({
			data: {
				email: 'bob.garcia@designstudio.com',
				name: 'Bob Garcia',
				avatar:
					'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face&auto=format',
				role: UserRole.USER,
				password: hashedPassword,
				companyId: designStudio.id,
			},
		}),
	])

	console.log('👥 Created users')

	// Create Team Members
	await Promise.all([
		...techCorpUsers.map((user, index) =>
			prisma.teamMember.create({
				data: {
					userId: user.id,
					companyId: techCorp.id,
					role: index === 0 ? ProjectRole.ADMIN : ProjectRole.MEMBER,
				},
			}),
		),
		...designStudioUsers.map((user, index) =>
			prisma.teamMember.create({
				data: {
					userId: user.id,
					companyId: designStudio.id,
					role: index === 0 ? ProjectRole.ADMIN : ProjectRole.MEMBER,
				},
			}),
		),
	])

	console.log('👔 Created team members')

	// Create Projects for TechCorp
	const techCorpProjects = await Promise.all([
		prisma.project.create({
			data: {
				name: 'E-commerce Platform',
				description:
					'Building a modern e-commerce platform with React and Node.js',
				slug: 'ecommerce-platform',
				color: '#3B82F6',
				companyId: techCorp.id,
				ownerId: techCorpUsers[0].id,
			},
		}),
		prisma.project.create({
			data: {
				name: 'Mobile App Development',
				description: 'React Native mobile application for iOS and Android',
				slug: 'mobile-app-development',
				color: '#10B981',
				companyId: techCorp.id,
				ownerId: techCorpUsers[1].id,
			},
		}),
		prisma.project.create({
			data: {
				name: 'API Gateway',
				description:
					'Microservices API gateway with authentication and rate limiting',
				slug: 'api-gateway',
				color: '#F59E0B',
				companyId: techCorp.id,
				ownerId: techCorpUsers[0].id,
			},
		}),
	])

	// Create Projects for Design Studio
	const designStudioProjects = await Promise.all([
		prisma.project.create({
			data: {
				name: 'Brand Identity Redesign',
				description: 'Complete brand identity redesign for client company',
				slug: 'brand-identity-redesign',
				color: '#8B5CF6',
				companyId: designStudio.id,
				ownerId: designStudioUsers[0].id,
			},
		}),
		prisma.project.create({
			data: {
				name: 'Website UI/UX',
				description: 'Modern website design with focus on user experience',
				slug: 'website-ui-ux',
				color: '#EF4444',
				companyId: designStudio.id,
				ownerId: designStudioUsers[1].id,
			},
		}),
	])

	console.log('📁 Created projects')

	// Create Project Members
	await Promise.all([
		// E-commerce Platform members
		...techCorpUsers.slice(1).map((user) =>
			prisma.projectMember.create({
				data: {
					userId: user.id,
					projectId: techCorpProjects[0].id,
					role: ProjectRole.MEMBER,
				},
			}),
		),
		// Mobile App members
		prisma.projectMember.create({
			data: {
				userId: techCorpUsers[0].id,
				projectId: techCorpProjects[1].id,
				role: ProjectRole.ADMIN,
			},
		}),
		prisma.projectMember.create({
			data: {
				userId: techCorpUsers[2].id,
				projectId: techCorpProjects[1].id,
				role: ProjectRole.MEMBER,
			},
		}),
		// API Gateway members
		prisma.projectMember.create({
			data: {
				userId: techCorpUsers[3].id,
				projectId: techCorpProjects[2].id,
				role: ProjectRole.MEMBER,
			},
		}),
		// Design Studio project members
		...designStudioUsers.map((user) =>
			prisma.projectMember.create({
				data: {
					userId: user.id,
					projectId: designStudioProjects[0].id,
					role:
						user.id === designStudioUsers[0].id
							? ProjectRole.ADMIN
							: ProjectRole.MEMBER,
				},
			}),
		),
		prisma.projectMember.create({
			data: {
				userId: designStudioUsers[0].id,
				projectId: designStudioProjects[1].id,
				role: ProjectRole.MEMBER,
			},
		}),
	])

	console.log('🤝 Created project members')

	// Create Tasks
	const tasks = await Promise.all([
		// E-commerce Platform tasks
		prisma.task.create({
			data: {
				title: 'Set up project structure',
				description:
					'Initialize React project with TypeScript and configure build tools',
				status: TaskStatus.DONE,
				priority: TaskPriority.HIGH,
				projectId: techCorpProjects[0].id,
				assigneeId: techCorpUsers[1].id,
				createdById: techCorpUsers[0].id,
				dueDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
			},
		}),
		prisma.task.create({
			data: {
				title: 'Design database schema',
				description:
					'Create ERD and implement database tables for products, users, and orders',
				status: TaskStatus.IN_PROGRESS,
				priority: TaskPriority.HIGH,
				projectId: techCorpProjects[0].id,
				assigneeId: techCorpUsers[2].id,
				createdById: techCorpUsers[0].id,
				dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
			},
		}),
		prisma.task.create({
			data: {
				title: 'Implement user authentication',
				description:
					'JWT-based authentication with login, register, and password reset',
				status: TaskStatus.TODO,
				priority: TaskPriority.MEDIUM,
				projectId: techCorpProjects[0].id,
				assigneeId: techCorpUsers[3].id,
				createdById: techCorpUsers[1].id,
				dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
			},
		}),
		prisma.task.create({
			data: {
				title: 'Create product catalog UI',
				description: 'Responsive product listing with filters and pagination',
				status: TaskStatus.BACKLOG,
				priority: TaskPriority.MEDIUM,
				projectId: techCorpProjects[0].id,
				createdById: techCorpUsers[0].id,
				dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
			},
		}),
		// Mobile App tasks
		prisma.task.create({
			data: {
				title: 'Setup React Native environment',
				description: 'Configure development environment for iOS and Android',
				status: TaskStatus.DONE,
				priority: TaskPriority.URGENT,
				projectId: techCorpProjects[1].id,
				assigneeId: techCorpUsers[2].id,
				createdById: techCorpUsers[1].id,
				dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
			},
		}),
		prisma.task.create({
			data: {
				title: 'Design app navigation',
				description: 'Implement tab navigation with React Navigation',
				status: TaskStatus.IN_REVIEW,
				priority: TaskPriority.HIGH,
				projectId: techCorpProjects[1].id,
				assigneeId: techCorpUsers[0].id,
				createdById: techCorpUsers[1].id,
				dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
			},
		}),
		// API Gateway tasks
		prisma.task.create({
			data: {
				title: 'Research API gateway solutions',
				description:
					'Compare different API gateway solutions and make recommendation',
				status: TaskStatus.DONE,
				priority: TaskPriority.LOW,
				projectId: techCorpProjects[2].id,
				assigneeId: techCorpUsers[3].id,
				createdById: techCorpUsers[0].id,
				dueDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
			},
		}),
		// Design Studio tasks
		prisma.task.create({
			data: {
				title: 'Logo design concepts',
				description: 'Create 5 different logo concepts for client review',
				status: TaskStatus.IN_PROGRESS,
				priority: TaskPriority.HIGH,
				projectId: designStudioProjects[0].id,
				assigneeId: designStudioUsers[1].id,
				createdById: designStudioUsers[0].id,
				dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
			},
		}),
		prisma.task.create({
			data: {
				title: 'Color palette development',
				description: 'Develop comprehensive color palette for brand identity',
				status: TaskStatus.TODO,
				priority: TaskPriority.MEDIUM,
				projectId: designStudioProjects[0].id,
				assigneeId: designStudioUsers[0].id,
				createdById: designStudioUsers[0].id,
				dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
			},
		}),
		prisma.task.create({
			data: {
				title: 'Website wireframes',
				description: 'Create low-fidelity wireframes for all main pages',
				status: TaskStatus.IN_PROGRESS,
				priority: TaskPriority.HIGH,
				projectId: designStudioProjects[1].id,
				assigneeId: designStudioUsers[1].id,
				createdById: designStudioUsers[1].id,
				dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 days from now
			},
		}),
	])

	console.log('📋 Created tasks')

	// Create Task Comments
	await Promise.all([
		prisma.taskComment.create({
			data: {
				content:
					'Great work on the initial setup! The TypeScript configuration looks solid.',
				taskId: tasks[0].id,
				userId: techCorpUsers[0].id,
			},
		}),
		prisma.taskComment.create({
			data: {
				content:
					'Thanks! I also added ESLint and Prettier for code consistency.',
				taskId: tasks[0].id,
				userId: techCorpUsers[1].id,
			},
		}),
		prisma.taskComment.create({
			data: {
				content:
					"I'm working on the user and product tables first. Should be ready for review by tomorrow.",
				taskId: tasks[1].id,
				userId: techCorpUsers[2].id,
			},
		}),
		prisma.taskComment.create({
			data: {
				content:
					'The environment setup is complete. Ready to start on the UI components.',
				taskId: tasks[4].id,
				userId: techCorpUsers[2].id,
			},
		}),
		prisma.taskComment.create({
			data: {
				content:
					'I like concept #3 the best. Can we try a few variations of that one?',
				taskId: tasks[7].id,
				userId: designStudioUsers[0].id,
			},
		}),
	])

	console.log('💬 Created task comments')

	// Create Task Attachments
	await Promise.all([
		prisma.taskAttachment.create({
			data: {
				filename: 'database-schema.sql',
				fileUrl: '/uploads/database-schema.sql',
				fileSize: 15420,
				mimeType: 'application/sql',
				taskId: tasks[1].id,
			},
		}),
		prisma.taskAttachment.create({
			data: {
				filename: 'project-wireframes.pdf',
				fileUrl: '/uploads/project-wireframes.pdf',
				fileSize: 2450000,
				mimeType: 'application/pdf',
				taskId: tasks[4].id,
			},
		}),
		prisma.taskAttachment.create({
			data: {
				filename: 'logo-concepts.sketch',
				fileUrl: '/uploads/logo-concepts.sketch',
				fileSize: 8900000,
				mimeType: 'application/vnd.sketch',
				taskId: tasks[7].id,
			},
		}),
		prisma.taskAttachment.create({
			data: {
				filename: 'wireframes-v1.fig',
				fileUrl: '/uploads/wireframes-v1.fig',
				fileSize: 12500000,
				mimeType: 'application/vnd.figma',
				taskId: tasks[9].id,
			},
		}),
	])

	console.log('📎 Created task attachments')

	console.log('✅ Database seeded successfully!')

	// Print summary
	console.log('\n📊 Seeding Summary:')
	console.log(`Companies: 2`)
	console.log(`Users: ${techCorpUsers.length + designStudioUsers.length}`)
	console.log(
		`Team Members: ${techCorpUsers.length + designStudioUsers.length}`,
	)
	console.log(
		`Projects: ${techCorpProjects.length + designStudioProjects.length}`,
	)
	console.log(`Tasks: ${tasks.length}`)
	console.log(`Comments: 5`)
	console.log(`Attachments: 4`)

	console.log('\n🔑 Test Login Credentials:')
	console.log('Email: john.doe@techcorp.com | Password: password123 (Admin)')
	console.log('Email: jane.smith@techcorp.com | Password: password123 (User)')
	console.log(
		'Email: alice.brown@designstudio.com | Password: password123 (Admin)',
	)
}

main()
	.catch((e) => {
		console.error('❌ Error seeding database:', e)
		process.exit(1)
	})
	.finally(async () => {
		await prisma.$disconnect()
	})
