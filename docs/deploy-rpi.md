# Deploy en Raspberry Pi + DuckDNS

Plan de deployment auto-gestionado para el sitio estático de Clases de Dibujo Online.

## Stack

| Componente | Opción |
|-----------|--------|
| Servidor | nginx en Raspberry Pi |
| Dominio | DuckDNS (`tunombre.duckdns.org`) |
| SSL | Let's Encrypt + certbot |
| Deploy | rsync desde local → Pi |
| CI/CD | GitHub Actions (opcional) |

## Pendientes pre-deploy

Antes de subir, reemplazar placeholders:
- `astro.config.mjs` → `site: 'https://tunombre.duckdns.org'`
- `public/admin/config.yml` → `repo: usuario/repo`
- `src/i18n/*.json` → email real
- `src/components/ContactoContent.astro` → WhatsApp real
- SVGs placeholder → imágenes reales

## Pasos

### 1. DuckDNS
- Registrarse en duckdns.org
- Crear dominio (`tunombre.duckdns.org`)
- Apuntar a IP pública de la Raspberry
- Renovación automática con cron

### 2. nginx en Raspberry
- Instalar nginx
- Configurar server block para `tunombre.duckdns.org`
- Servir desde `/var/www/clases-dibujo/`

### 3. SSL con Let's Encrypt
- Instalar certbot + plugin nginx
- `certbot --nginx -d tunombre.duckdns.org`
- Renovación automática con systemd timer

### 4. Deploy manual
```sh
npm run build
rsync -avz --delete dist/ pi@raspberry:/var/www/clases-dibujo/
```

### 5. GitHub Actions (posterior)
- Workflow que corre `npm run build`
- Hace SSH a la Pi y rsync automático

### 6. Formulario de contacto
El form actual usa Netlify Forms. Alternativas:
- **Formspree**: 0 configuración, gratis hasta 250/mes
- **Backend propio**: Express + nodemailer en la misma Pi

### 7. CMS
Decap CMS puede funcionar sin Netlify usando GitHub OAuth. Alternativas:
- **Decap + GitHub backend**: configurar OAuth en GitHub, Decap se comunica directo a la API de GitHub
- **Decap + proxy local**: para desarrollo local con `npx decap-server`
- **Eleventy / TinaCMS**: otras opciones si después se migra de Astro

## Recursos

- [DuckDNS docs](https://www.duckdns.org/install.jsp)
- [nginx beginner's guide](https://nginx.org/en/docs/beginners_guide.html)
- [certbot instructions](https://certbot.eff.org/instructions)
- [Decap CMS with GitHub backend](https://decapcms.org/docs/github-backend/)
