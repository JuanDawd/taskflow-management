This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Diagrama de Casos de Uso

```mermaid
graph TB
    %% Actores
    Admin["👤 Administrador"]
    PM["👤 Project Manager"]
    Dev["👤 Desarrollador"]
    Guest["👤 Invitado"]
    System["🔧 Sistema"]

    %% Casos de Uso - Autenticación
    subgraph Auth["🔐 Autenticación"]
        UC1["Iniciar Sesión"]
        UC2["Registrarse"]
        UC3["Recuperar Contraseña"]
        UC4["Cerrar Sesión"]
    end

    %% Casos de Uso - Gestión de Usuarios
    subgraph UserMgmt["👥 Gestión de Usuarios"]
        UC5["Crear Usuario"]
        UC6["Editar Perfil"]
        UC7["Asignar Roles"]
        UC8["Gestionar Permisos"]
    end

    %% Casos de Uso - Proyectos
    subgraph Projects["🏢 Proyectos"]
        UC9["Crear Proyecto"]
        UC10["Editar Proyecto"]
        UC11["Eliminar Proyecto"]
        UC12["Ver Proyectos"]
        UC13["Asignar Miembros"]
    end

    %% Casos de Uso - Tareas
    subgraph Tasks["📋 Tareas"]
        UC14["Crear Tarea"]
        UC15["Editar Tarea"]
        UC16["Eliminar Tarea"]
        UC17["Asignar Tarea"]
        UC18["Cambiar Estado"]
        UC19["Comentar Tarea"]
        UC20["Subir Archivos"]
    end

    %% Casos de Uso - Reportes
    subgraph Reports["📊 Reportes"]
        UC21["Ver Dashboard"]
        UC22["Generar Reportes"]
        UC23["Exportar Datos"]
        UC24["Ver Métricas"]
    end

    %% Casos de Uso - Notificaciones
    subgraph Notifications["🔔 Notificaciones"]
        UC25["Enviar Notificación"]
        UC26["Ver Notificaciones"]
        UC27["Marcar como Leída"]
    end

    %% Relaciones Admin
    Admin --> UC1
    Admin --> UC5
    Admin --> UC7
    Admin --> UC8
    Admin --> UC9
    Admin --> UC11
    Admin --> UC22

    %% Relaciones Project Manager
    PM --> UC1
    PM --> UC6
    PM --> UC9
    PM --> UC10
    PM --> UC12
    PM --> UC13
    PM --> UC14
    PM --> UC17
    PM --> UC21
    PM --> UC22

    %% Relaciones Desarrollador
    Dev --> UC1
    Dev --> UC6
    Dev --> UC12
    Dev --> UC14
    Dev --> UC15
    Dev --> UC18
    Dev --> UC19
    Dev --> UC20
    Dev --> UC21
    Dev --> UC26
    Dev --> UC27

    %% Relaciones Sistema
    System --> UC25

    %% Relaciones Guest
    Guest --> UC2
    Guest --> UC3
```

# Diagramas de Secuencia

## Secuencia: Creación de Tarea

```mermaid
sequenceDiagram
    participant U as Usuario
    participant F as Frontend
    participant API as API Routes
    participant DB as Database
    participant WS as WebSocket
    participant N as Sistema Notificaciones

    U->>F: Abrir formulario de tarea
    F->>F: Renderizar TaskForm

    U->>F: Completar datos y enviar
    F->>F: Validar con Zod

    alt Validación exitosa
        F->>API: POST /api/tasks
        API->>API: Verificar autenticación
        API->>API: Verificar permisos
        API->>DB: Insertar tarea
        DB-->>API: Tarea creada
        API->>WS: Emitir evento task_created
        API-->>F: Respuesta exitosa
        F->>F: Actualizar UI
        F->>U: Mostrar confirmación

        WS->>N: Procesar notificación
        N->>DB: Crear notificación
        N->>F: Notificación en tiempo real
    else Error de validación
        F->>U: Mostrar errores
    end
```

## Secuencia: Autenticación con NextAuth

```mermaid
sequenceDiagram
    participant U as Usuario
    participant F as Frontend
    participant NA as NextAuth
    participant DB as Database
    participant JWT as JWT Service

    U->>F: Ingresar credenciales
    F->>NA: signIn(credentials)
    NA->>DB: Buscar usuario

    alt Usuario encontrado
        DB-->>NA: Datos usuario
        NA->>NA: Verificar contraseña

        alt Contraseña correcta
            NA->>JWT: Generar token
            JWT-->>NA: Token JWT
            NA->>F: Session con token
            F->>F: Redirigir a dashboard
            F->>U: Dashboard cargado
        else Contraseña incorrecta
            NA-->>F: Error autenticación
            F->>U: Mensaje de error
        end
    else Usuario no encontrado
        DB-->>NA: Usuario no existe
        NA-->>F: Error usuario no existe
        F->>U: Mensaje de error
    end
```

## Secuencia: Drag & Drop en Kanban

```mermaid
sequenceDiagram
    participant U as Usuario
    participant K as KanbanBoard
    participant DND as DnD Context
    participant API as API Routes
    participant WS as WebSocket

    U->>K: Iniciar drag de tarea
    K->>DND: onDragStart
    DND->>K: Actualizar estado drag

    U->>K: Drop tarea en nueva columna
    K->>DND: onDragEnd
    DND->>K: Calcular nueva posición

    K->>API: PATCH /api/tasks/[id]/move
    API->>API: Validar movimiento
    API->>API: Actualizar tarea en DB
    API-->>K: Confirmación

    API->>WS: Emitir task_moved
    WS->>K: Sincronizar otros usuarios
    K->>K: Actualizar UI optimista
    K->>U: Confirmación visual
```

# Diagramas de clase

## Modelo de Dominio Principal

```mermaid
classDiagram
      class Company {
        +String id
        +String name
        +String email
        +String phone
        +String address
        +String website
        +JSON settings
        +DateTime createdAt
        +DateTime updatedAt
        +createProject()
        +addUser()
        +updateSettings()
    }
    class User {
        +String id
        +String name
        +String email
        +String password
        +String avatar
        +String companyId
        +String roleId
        +DateTime createdAt
        +DateTime updatedAt
        +authenticate()
        +updateProfile()
        +assignTask()
    }
    class Role {
        +String id
        +String name
        +String description
        +Permission[] permissions
        +DateTime createdAt
        +hasPermission()
        +grantPermission()
    }
    class Permission {
        +String id
        +String name
        +String resource
        +String action
        +String description
        +validate()
    }
    class Project {
        +String id
        +String name
        +String description
        +String companyId
        +String ownerId
        +ProjectStatus status
        +DateTime startDate
        +DateTime endDate
        +DateTime createdAt
        +DateTime updatedAt
        +addMember()
        +removeMember()
        +updateStatus()
        +getProgress()
    }
    class Task {
        +String id
        +String title
        +String description
        +String projectId
        +String assigneeId
        +TaskStatus status
        +TaskPriority priority
        +DateTime dueDate
        +Float estimatedHours
        +Float actualHours
        +String[] tags
        +DateTime createdAt
        +DateTime updatedAt
        +changeStatus()
        +assignTo()
        +addComment()
        +uploadAttachment()
    }
    class Comment {
        +String id
        +String content
        +String taskId
        +String authorId
        +String[] mentions
        +DateTime createdAt
        +DateTime updatedAt
        +mentionUser()
        +edit()
        +delete()
    }
    class Attachment {
        +String id
        +String name
        +String url
        +String type
        +Integer size
        +String taskId
        +String uploadedById
        +DateTime uploadedAt
        +download()
        +preview()
        +delete()
    }
    class Notification {
        +String id
        +NotificationType type
        +String title
        +String message
        +String userId
        +String taskId
        +String projectId
        +Boolean read
        +DateTime createdAt
        +markAsRead()
        +delete()
    }
    Company "1" --> "*" User : employs
    Company "1" --> "*" Project : owns
    User "1" --> "*" Task : assigned

    User "1" --> "*" Comment : writes
    User "1" --> "*" Attachment uploads
    User "1" --> "*" Notification receives
    Project "1" --> "*" Task : contains
    Task "1" --> "*" Comment : has
    Task "1" --> "*" Attachment : has
    Task "1" --> "*" Notification : triggers
    Role "1" --> "*" User : assigned

    %% Relaciones N:N (Muchos a Muchos) - Usando tablas intermedias
    Project "*" --> "*" ProjectMember : have
    User "*" --> "*" ProjectMember : are
    Role "*" --> "*" RolePermission : have
    Permission "*" --> "*" RolePermission : belong



    User "1" --> "1" Role : has

     %% Enumeraciones
    class TaskStatus {
        <<enumeration>>
        TODO
        IN_PROGRESS
        REVIEW
        DONE
    }

    class TaskPriority {
        <<enumeration>>
        LOW
        MEDIUM
        HIGH
        URGENT
    }

    class ProjectStatus {
        <<enumeration>>
        PLANNING
        ACTIVE
        ON_HOLD
        COMPLETED
        CANCELLED
    }

    class NotificationType {
        <<enumeration>>
        TASK_CREATED
        TASK_UPDATED
        TASK_ASSIGNED
        COMMENT_ADDED
        MENTION
        DEADLINE_REMINDER
    }
```

## Arquitectura de Componentes Frontend

```mermaid
classDiagram
    class App {
        +render()
        +handleRouting()
    }

    class Layout {
        +children: ReactNode
        +renderHeader()
        +renderSidebar()
        +renderMain()
    }

    class TaskForm {
        +task?: Task
        +onSubmit: Function
        +open: boolean
        +validateForm()
        +handleFileUpload()
        +submitTask()
    }

    class KanbanBoard {
        +tasks: Task[]
        +columns: Column[]
        +onTaskMove: Function
        +handleDragStart()
        +handleDragEnd()
        +renderColumns()
    }

    class TaskCard {
        +task: Task
        +draggable: boolean
        +onClick: Function
        +renderPriority()
        +renderAssignee()
        +renderTags()
    }

    class Dashboard {
        +metrics: DashboardMetrics
        +timeRange: string
        +loadMetrics()
        +renderCharts()
        +renderKPIs()
    }

    class NotificationBell {
        +notifications: Notification[]
        +unreadCount: number
        +onMarkAsRead: Function
        +renderDropdown()
        +handleNotificationClick()
    }

    %% Hooks
    class useTaskStore {
        +tasks: Task[]
        +isLoading: boolean
        +fetchTasks()
        +createTask()
        +updateTask()
        +deleteTask()
    }

    class useNotifications {
        +notifications: Notification[]
        +unreadCount: number
        +addNotification()
        +markAsRead()
        +subscribe()
    }

    class useWebSocket {
        +isConnected: boolean
        +sendMessage()
        +onMessage()
        +connect()
        +disconnect()
    }

    %% Relaciones
    App --> Layout
    Layout --> Dashboard
    Layout --> KanbanBoard
    Layout --> NotificationBell

    KanbanBoard --> TaskCard
    TaskCard --> TaskForm

    Dashboard --> useTaskStore
    NotificationBell --> useNotifications
    KanbanBoard --> useWebSocket

    useTaskStore --> Task
    useNotifications --> Notification
```

# Arquitectura del Sistema

## Arquitectura General

```mermaid
graph TB
    %% Frontend Layer
    subgraph "🖥️ Frontend (Next.js 15)"
        UI["🎨 UI Components<br/>• React Components<br/>• Tailwind CSS<br/>• Radix UI"]
        Pages["📄 Pages<br/>• App Router<br/>• Server Components<br/>• Client Components"]
        Hooks["🔗 Custom Hooks<br/>• useTaskStore<br/>• useNotifications<br/>• useWebSocket"]
        State["🗃️ State Management<br/>• Zustand<br/>• React Query<br/>• Local Storage"]
    end

    %% Backend Layer
    subgraph "⚙️ Backend (Next.js API Routes)"
        API["🔌 API Routes<br/>• REST Endpoints<br/>• Validation (Zod)<br/>• Error Handling"]
        Auth["🔐 Authentication<br/>• NextAuth.js<br/>• JWT Tokens<br/>• Session Management"]
        Middleware["🛡️ Middleware<br/>• Auth Guard<br/>• Rate Limiting<br/>• CORS"]
        WebSocket["⚡ WebSocket<br/>• Real-time Updates<br/>• Room Management<br/>• Event Broadcasting"]
    end

    %% Database Layer
    subgraph "🗄️ Database Layer"
        Prisma["📊 Prisma ORM<br/>• Schema Management<br/>• Query Builder<br/>• Migrations"]
        PostgreSQL["🐘 PostgreSQL<br/>• Primary Database<br/>• ACID Compliance<br/>• JSON Support"]
        Redis["🔴 Redis<br/>• Session Store<br/>• Cache Layer<br/>• Rate Limiting"]
    end

    %% External Services
    subgraph "🌐 External Services"
        Email["📧 Email Service<br/>• SMTP<br/>• Notifications<br/>• Templates"]
        FileStorage["📁 File Storage<br/>• Local/S3<br/>• File Upload<br/>• CDN"]
        Monitoring["📈 Monitoring<br/>• Logging<br/>• Error Tracking<br/>• Analytics"]
    end

    %% Infrastructure
    subgraph "🏗️ Infrastructure"
        Docker["🐳 Docker<br/>• Containerization<br/>• Multi-stage Build<br/>• Compose"]
        CI_CD["🔄 CI/CD<br/>• GitHub Actions<br/>• Automated Testing<br/>• Deployment"]
        Cloud["☁️ Cloud Platform<br/>• Vercel/AWS<br/>• Load Balancing<br/>• Auto Scaling"]
    end

    %% Connections
    UI --> Hooks
    Pages --> State
    Hooks --> API

    API --> Auth
    API --> Middleware
    API --> Prisma
    WebSocket --> Redis

    Auth --> PostgreSQL
    Prisma --> PostgreSQL

    API --> Email
    API --> FileStorage
    API --> Monitoring

    Docker --> Cloud
    CI_CD --> Cloud
```

## Flujo de Datos

```mermaid
graph LR
    %% User Interaction
    User["👤 Usuario"] --> Browser["🌐 Navegador"]

    %% Frontend
    Browser --> NextJS["⚛️ Next.js Frontend"]
    NextJS --> Components["🎨 Componentes"]
    Components --> Hooks["🔗 Hooks"]
    Hooks --> Store["🗃️ Zustand Store"]

    %% API Communication
    Store --> API["🔌 API Routes"]
    API --> Validation["✅ Validación Zod"]
    Validation --> Auth["🔐 Autenticación"]
    Auth --> Business["💼 Lógica de Negocio"]

    %% Database
    Business --> Prisma["📊 Prisma ORM"]
    Prisma --> DB["🗄️ PostgreSQL"]

    %% Real-time
    Business --> WS["⚡ WebSocket"]
    WS --> Redis["🔴 Redis"]
    WS --> Browser

    %% External Services
    Business --> Email["📧 Email"]
    Business --> Files["📁 Files"]

    %% Response
    DB --> Prisma
    Prisma --> Business
    Business --> API
    API --> Store
    Store --> Components
    Components --> Browser
    Browser --> User
```

# Cronograma de Actividades

## Fases del Proyecto

```mermaid
---
config:
  theme: mc
---
gantt
    title Cronograma de Desarrollo TaskFlow
    dateFormat  MM-DD

    section Recolección de requisitos
    Análisis del dominio  :req1, 03-01, 2d
    funcionalidades clave :req2, 03-03, 3d
    modelo de datos                         :req3, 03-06, 4d
    section Diseño técnico y de interfaz
    Wireframes                                                    :design1, 03-08, 7d
    arquitectura de componentes :design1, 03-08, 7d
    modelo relacional :design1, 03-08, 7d

    section Desarrollo del frontend
    Vistas con React/Next.js + estilos Tailwind CSS              :front1, 03-15, 14d

    section Desarrollo del backend
    API REST, lógica de negocio y PostgreSQL                     :back1, 03-29, 14d

    section Integración de funcionalidades en tiempo real
    Cliente-servidor con WebSockets                              :realtime1, 04-12, 7d

    section Pruebas y validación
    Funcionales, no funcionales, usabilidad y rendimiento        :test1, 04-19, 10d

    section Despliegue final y documentación
    Producción en Vercel + informe técnico                       :deploy1, 04-29, 7d
```
