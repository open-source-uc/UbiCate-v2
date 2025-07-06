# Componentes del Sidebar - Estructura Organizada

Esta carpeta contiene todos los componentes relacionados con el sidebar organizados en una estructura lógica y mantenible.

## 📁 Estructura de Carpetas

```
sidebar/
├── ui/                     # Componentes UI reutilizables
│   ├── campusButton.tsx           # Botón de selección de campus
│   ├── sidebarCloseButton.tsx     # Botón de cerrar estandarizado
│   ├── sidebarNavigationButton.tsx # Botón de navegación para escritorio
│   ├── sidebarMobileNavigationButton.tsx # Botón de navegación móvil
│   ├── sidebarToggleButton.tsx    # Botón de alternar sidebar
│   ├── dragHandle.tsx             # Manija de arrastre para móvil
│   ├── sidebarHeader.tsx          # Componente de encabezado flexible
│   └── index.ts                   # Exportaciones UI
├── layouts/                # Contenedores de diseño y estructuras principales
│   ├── desktopSidebar.tsx         # Diseño del sidebar de escritorio
│   ├── mobilSidebar.tsx           # Diseño del sidebar móvil
│   ├── NavigationSidebar.tsx      # Envoltorio de navegación principal
│   ├── notificationsBarDesktop.tsx # Notificaciones de escritorio
│   ├── topMobilSidebar.tsx        # Sección superior móvil
│   └── index.ts                   # Exportaciones de layouts
├── sections/               # Secciones de contenido del sidebar
│   ├── campusList.tsx             # Sección de selección de campus
│   ├── footerOptionsSidebar.tsx   # Sección de opciones del footer
│   └── index.ts                   # Exportaciones de secciones
├── data/                   # Configuración y datos
│   ├── config.ts                  # Configuración de campus y navegación
│   └── index.ts                   # Exportaciones de datos
├── index.ts                # Exportaciones principales (todos los componentes)
└── README.md               # Esta documentación
```

## 🎯 Categorías de Componentes

### **Componentes UI** (`/ui/`)
Componentes UI genéricos y reutilizables que pueden usarse en diferentes secciones del sidebar.

- **Bajo acoplamiento**: No dependen de lógica de negocio específica
- **Alta reutilización**: Pueden usarse en múltiples contextos
- **Estilo consistente**: Siguen patrones del sistema de diseño
- **Type-safe**: Interfaces de props bien definidas

### **Componentes de Layout** (`/layouts/`)
Componentes contenedores que definen la estructura y organización del sidebar.

- **Responsivos**: Manejan diferentes tamaños de pantalla
- **Gestión de estado**: Administran estados de apertura/cierre del sidebar
- **Manejo de eventos**: Gestionan interacciones del usuario
- **Composición**: Combinan componentes UI y de sección

### **Componentes de Sección** (`/sections/`)
Componentes de lógica de negocio que representan áreas funcionales específicas.

- **Específicos del dominio**: Selección de campus, opciones del footer, etc.
- **Integración de datos**: Se conectan a fuentes de datos
- **Funcionalidad completa**: Funcionalidad autocontenida

### **Configuración de Datos** (`/data/`)
Configuración centralizada y constantes.

- **Type-safe**: Usa aserciones const de TypeScript
- **Mantenible**: Fácil actualización de datos de campus/navegación
- **Escalable**: Fácil agregar nuevos elementos

## 🚀 Ejemplos de Uso

### Importando Componentes

```tsx
// Importar componentes específicos
import { CampusButton, SidebarHeader } from '@/app/components/sidebar/ui';
import { DesktopSidebar } from '@/app/components/sidebar/layouts';
import { CampusList } from '@/app/components/sidebar/sections';
import { campuses } from '@/app/components/sidebar/data';

// O importar desde el índice principal
import { 
  CampusButton, 
  DesktopSidebar, 
  campuses 
} from '@/app/components/sidebar';
```

### Usando Datos de Campus

```tsx
import { campuses, CampusKey } from '@/app/components/sidebar/data';

function handleCampusSelection(campusKey: CampusKey) {
  const campus = campuses.find(c => c.key === campusKey);
  console.log(`Seleccionado: ${campus?.name}`);
}
```

### Creando Nuevos Botones de Campus

```tsx
import { CampusButton } from '@/app/components/sidebar/ui';

{campuses.map((campus) => (
  <CampusButton
    key={campus.key}
    campusKey={campus.key}
    campusName={campus.name}
    imageSrc={campus.imageSrc}
    onClick={handleCampusClick}
    className={campus.className}
  />
))}
```

## 📊 Antes vs Después de la Organización

### Antes (Estructura Plana)
```
sidebar/
├── campusButton.tsx
├── campusList.tsx
├── desktopSidebar.tsx
├── dragHandle.tsx
├── footerOptionsSidebar.tsx
├── mobilSidebar.tsx
├── NavigationSidebar.tsx
├── notificationsBarDesktop.tsx
├── sidebarCloseButton.tsx
├── sidebarHeader.tsx
├── sidebarMobileNavigationButton.tsx
├── sidebarNavigationButton.tsx
├── sidebarToggleButton.tsx
├── topMobilSidebar.tsx
└── index.ts
```

### Después (Estructura Organizada)
```
sidebar/
├── ui/           # 7 componentes reutilizables
├── layouts/      # 5 contenedores de layout
├── sections/     # 2 secciones de contenido
├── data/         # 1 archivo de configuración
├── index.ts      # Exportaciones limpias
└── README.md     # Documentación
```

## 🔍 Beneficios de Esta Organización

### 1. **Clara Separación de Responsabilidades**
- Los componentes UI se enfocan en la presentación
- Los layouts manejan estructura y estado
- Las secciones contienen lógica de negocio
- Los datos están centralizados

### 2. **Mejor Descubribilidad**
- Los desarrolladores saben dónde encontrar tipos específicos de componentes
- Los nuevos miembros del equipo pueden entender la estructura rápidamente
- La agrupación lógica facilita la navegación

### 3. **Mejor Mantenibilidad**
- Los cambios en UI afectan solo componentes UI
- Los cambios de lógica de negocio están aislados en secciones
- Las actualizaciones de datos ocurren en un solo lugar

### 4. **Mayor Reutilización**
- Los componentes UI pueden reutilizarse en diferentes secciones
- Las interfaces claras hacen que los componentes sean más componibles
- El enfoque basado en configuración permite personalización fácil

### 5. **Escalabilidad**
- Fácil agregar nuevos campus vía configuración
- Los nuevos componentes UI tienen un hogar claro
- La estructura soporta crecimiento sin caos

## 🎨 Principios de Diseño

### **Influencia del Atomic Design**
- **UI**: Átomos y moléculas (botones, encabezados)
- **Sections**: Organismos (áreas funcionales completas)
- **Layouts**: Plantillas (estructura de página)
- **Data**: Configuración (props y estado)

### **Responsabilidad Única**
- Cada componente tiene un propósito claro
- La lógica de negocio está separada de la presentación
- La configuración está separada de la implementación

### **Dirección de Dependencias**
```
Data ← Sections ← Layouts
  ↑       ↑        ↑
  └─── UI ←────────┘
```

## 🔄 Ruta de Migración

### Agregando Nuevos Campus
1. Actualizar `data/config.ts`
2. Agregar imagen del campus a `/public/images/campus/`
3. ¡No se necesitan cambios en componentes!

### Agregando Nuevos Componentes UI
1. Crear componente en la carpeta `ui/`
2. Agregar exportación a `ui/index.ts`
3. Usar en secciones o layouts según sea necesario

### Agregando Nuevas Secciones
1. Crear componente en la carpeta `sections/`
2. Agregar exportación a `sections/index.ts`
3. Integrar en el layout apropiado

## 🧪 Estrategia de Testing

### **Testing Unitario**
- Testear componentes UI en aislamiento
- Mockear dependencias de datos
- Enfocarse en props y renderizado

### **Testing de Integración**
- Testear componentes de sección con datos reales
- Verificar interacciones de componentes UI
- Testear comportamiento responsivo

### **Testing E2E**
- Testear flujos completos del sidebar
- Verificar flujo de selección de campus
- Testear transiciones móvil/escritorio

## 📈 Consideraciones de Rendimiento

### **Optimización de Bundle**
- Exportaciones tree-shakable
- Code splitting a nivel de componente posible
- Re-renders mínimos a través de memoización apropiada

### **Optimización de Imágenes**
- Las imágenes de campus usan el componente Image de Next.js
- Lazy loading incorporado
- Tamaños de imagen responsivos

## 🔧 Flujo de Desarrollo

### **Agregando Características**
1. Identificar tipo de componente (UI, Layout, Section)
2. Colocar en la carpeta apropiada
3. Actualizar index.ts relevante
4. Agregar a exportaciones principales si es necesario

### **Actualizando Estilos**
1. Componentes UI: Actualizar estilos del componente
2. Cambios globales: Actualizar variables CSS
3. Responsivo: Usar breakpoints existentes

### **Cambios de Datos**
1. Actualizar `data/config.ts`
2. Verificar tipos de TypeScript
3. Testear componentes afectados
