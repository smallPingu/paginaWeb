# Sitio Web Estático para Clases de Dibujo Online — AGENTS.md

Este es un sitio web estático construido con Astro 5 para ofrecer clases de dibujo en línea. Mantén los cambios pequeños y verifica siempre con la compilación.

## Comandos

```sh
npm run dev    # Inicia el servidor de desarrollo
npm run build  # Construye el sitio para producción
npm run preview # Previsualiza el sitio construido
```

No existen scripts de prueba, verificación de estilo o comprobación de tipos.

## Consideraciones Importantes

- **Rutas de i18n**: Las rutas de internacionalización son `/`, `/en/`, `/uk/` (`prefixDefaultLocale: false`, `redirectToDefaultLocale: false`). Asegúrate de que los enlaces y envoltorios sean conscientes de la localización y estén alineados con esta estructura. Por ejemplo, usa `Astro.currentLocale` en tus plantillas para obtener la localización actual. Si la localización es desconocida, `src/i18n/utils.ts` vuelve a español.
  
- **Colecciones de Contenido**: Las colecciones de contenido se definen en `src/content/config.ts`.
  - La colección `blog` utiliza `import.meta.glob('../content/blog/*.md', { eager: true })` y `<post.Content />`. No reemplaces esto con `Astro.glob`.
  - La colección `obras` está configurada pero aún no tiene archivos; la galería aún renderiza marcadores de posición codificados.
  
- **Animaciones con GSAP**: Las animaciones están gestionadas por GSAP en `src/scripts/animations.js`. Si agregas o eliminas animaciones de página, asegúrate de mantener la limpieza de animaciones con `astro:before-swap` para evitar animaciones obsoletas.
  
- **Lightbox de la Galería**: El lightbox de la galería está implementado en JavaScript puro en `src/scripts/gallery-lightbox.js`. Inicialízalo con `initLightbox('#gallery-grid')`. Por ejemplo, en tu archivo HTML o JavaScript, puedes llamar a esta función después de que el DOM esté cargado.
  
- **Tokens Personalizados de Tailwind**: Tailwind utiliza tokens personalizados como `brand-*`, `paper-*`, `ink-*`, `font-display`, `font-body`. Prefiere usar estos en lugar de los nombres de paleta o fuentes predeterminados.

## Restricciones de Despliegue

- **Formulario de Contacto**: El formulario de contacto en `src/components/ContactoContent.astro` depende del manejo de formularios de Netlify.
- **Configuración de Decap CMS**: `public/admin/config.yml` depende del flujo de autenticación de Netlify/Decap CMS.
- **Configuración de Astro**: `astro.config.mjs` tiene un marcador de posición `site: 'https://tusitio.com'`. Asegúrate de actualizarlo antes de un despliegue real.
- **Valores de lanzamiento**: `src/components/ContactoContent.astro`, `src/i18n/*.json`, y los marcadores de posición de la galería contienen valores de lanzamiento que deben ser reemplazados.

## Gotchas Específicos del Repositorio

- **Filtrado de Copias de Blog**: Las copias de blog deben filtrarse por `frontmatter.locale` en `getStaticPaths`.
- **Tipos de GSAP**: `@types/gsap` solo está aquí porque GSAP incluye sus propios tipos.
- **Galería Vacía**: `src/content/obras/` está vacío, así que no asumas que la galería es controlada por contenido aún.
