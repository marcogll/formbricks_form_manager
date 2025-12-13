# Formbricks Vanity Server - Coolify Deployment Guide

## Configuración para Coolify en VPS

### Información del Deployment

- **Dominio**: `your-vanity-server.com` (configurable)
- **Formbricks Instance**: `your-formbricks-instance.com` (configurable)
- **Puerto**: 3011

## Pasos para Desplegar en Coolify

### 1. Publicar Imagen en Docker Hub

```bash
# Login a Docker Hub
docker login

# Construir la imagen
docker build -t your-dockerhub-username/formbricks-vanity-server:latest .

# Publicar a Docker Hub
docker push your-dockerhub-username/formbricks-vanity-server:latest
```

### 2. Configurar en Coolify

1. **Crear Nuevo Recurso**

   - Ve a tu proyecto en Coolify
   - Click en "Add New Resource"
   - Selecciona "Docker Compose"

2. **Configurar Docker Compose**

   - Pega el contenido del archivo `docker-compose.yml`
   - O usa la imagen directamente desde Docker Hub

3. **Variables de Entorno**

   En Coolify, configura estas variables de entorno:

   ```
   FORMBRICKS_API_KEY=fbk_6QpdF1eC0E9umr9HjWUBaTxO_ispeHZYd-dI_EK9m2Q
   ADMIN_API_TOKEN=9HiRr6K0Hfp2I4RgoLLsXr
   FORMBRICKS_ENV_ID=cmbgr9ipo000ls201jpy12fbi,cmbgr9ipk000gs201rcukyfr7
   ```

   > ⚠️ **Importante**: No incluyas `FORMBRICKS_SDK_URL` ni `BASE_DOMAIN` en las variables de entorno de Coolify, ya que están hardcodeadas en el docker-compose.yml

4. **Configurar Dominio**

   - En Coolify, ve a "Domains"
   - Agrega: `forms.soul23.cloud`
   - Coolify configurará automáticamente SSL con Let's Encrypt

5. **Configurar Red**

   - Asegúrate de que el servicio esté en la red `coolify`
   - Esto ya está configurado en el `docker-compose.yml`

6. **Volumen para Persistencia**
   - El volumen `formbricks_data` se crea automáticamente
   - Los datos de SQLite se guardarán en `/app/data`

### 3. Desplegar

1. Click en "Deploy" en Coolify
2. Espera a que la imagen se descargue y el contenedor inicie
3. Verifica los logs en Coolify

### 4. Verificar Deployment

Una vez desplegado, verifica:

- **Admin UI**: `https://forms.soul23.cloud/admin`
- **Ejemplo de encuesta**: `https://forms.soul23.cloud/socias/Contratos`
  - Debe redirigir a: `https://feedback.soul23.cloud/s/k40zfrs2r62ifbgavpumemlc`

## Configuración Inicial

### 1. Acceder al Admin UI

```
URL: https://forms.soul23.cloud/admin
Token: 9HiRr6K0Hfp2I4RgoLLsXr
```

### 2. Configurar Aliases

1. Ve al Admin UI
2. Configura los aliases para tus proyectos:
   - `socias` → Environment `cmbgr9ipo000ls201jpy12fbi`
   - `vanity` → Environment `cmbgr6u7s0009s201i45xtbtv`

### 3. Usar las Encuestas

Tus encuestas estarán disponibles en:

- `https://forms.soul23.cloud/{alias}/{nombre-encuesta}`

Ejemplos:

- `https://forms.soul23.cloud/socias/Contratos` (redirige a Formbricks)
- `https://forms.soul23.cloud/vanity/test` (embebida)

## Actualizar la Aplicación

Para actualizar a una nueva versión:

```bash
# 1. Construir nueva imagen
docker build -t your-dockerhub-username/formbricks-vanity-server:v1.1.0 .

# 2. Publicar
docker push your-dockerhub-username/formbricks-vanity-server:v1.1.0

# 3. En Coolify, actualiza la imagen en docker-compose.yml
# 4. Click en "Redeploy"
```

## Troubleshooting

### Ver Logs en Coolify

1. Ve a tu servicio en Coolify
2. Click en "Logs"
3. Verifica que el servidor inicie correctamente

### Problemas Comunes

**Error de conexión a Formbricks**

- Verifica que `FORMBRICKS_API_KEY` sea correcta
- Verifica que `feedback.soul23.cloud` sea accesible desde el VPS

**Base de datos no persiste**

- Verifica que el volumen `formbricks_data` esté montado
- En Coolify, ve a "Volumes" y verifica que exista

**SSL no funciona**

- Coolify maneja SSL automáticamente
- Verifica que el dominio `forms.soul23.cloud` apunte a tu VPS
- Espera unos minutos para que Let's Encrypt emita el certificado

## Backup de la Base de Datos

Para hacer backup de la base de datos SQLite:

```bash
# Conectarse al contenedor
docker exec -it formbricks-vanity sh

# Copiar la base de datos
cp /app/data/survey_mappings.db /tmp/backup.db

# Salir del contenedor
exit

# Copiar desde el contenedor al host
docker cp formbricks-vanity:/tmp/backup.db ./backup-$(date +%Y%m%d).db
```

## Monitoreo

Coolify proporciona métricas automáticas. Puedes ver:

- CPU usage
- Memory usage
- Network traffic
- Container status

## Recursos Adicionales

- **Documentación de Coolify**: https://coolify.io/docs
- **Docker Hub**: Publica tu imagen para fácil deployment
- **Health Checks**: Coolify monitorea automáticamente la salud del contenedor
