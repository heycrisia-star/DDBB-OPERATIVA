# Directiva: Parser de Correos (IMAP a Supabase)

## Objetivo
Analizar los correos electrónicos entrantes en `info@legacytoursspain.com` provenientes de los operadores (GetYourGuide, FareHarbor, etc.), identificar si son nuevas reservas, modificaciones o cancelaciones, extraer los metadatos relevantes y sincronizar de forma determinista la tabla `tours` en Supabase.

## Arquitectura (Capa 3 - Ejecución)
El script determinista debe vivir en `execution/email_parser.py`.
Debe ejecutarse bajo demanda (o cron) y basarse en las credenciales guardadas en `.env`:
- `IMAP_USER`
- `IMAP_PASS`
- `SUPABASE_URL`
- `SUPABASE_KEY`

## Entradas
- Carpeta INBOX de la cuenta IMAP especificada.
- Remitentes objetivo: `*@getyourguide.com`, `*@fareharbor.com`, etc.

## Procesamiento Esperado
1. **Conexión IMAP**: Autenticarse usando SSL.
2. **Filtrado**: Buscar correos recientes no leídos o desde una fecha determinada.
3. **Parseo de Texto**:
   - Usar Regex y BeautifulSoup para lidiar con el HTML.
   - Extraer `code` (Reference Number).
   - Extraer `date` y `start` (Día y Hora).
   - Extraer `pax` (Cantidad de clientes).
   - Extraer `clientName` y `phone`.
   - Extraer `language`.
   - Extraer `netPrice` (calculado a un -25% si aplica, como en GYG).
   - Extraer `status` (Confirmado, cancelado).
4. **Base de Datos**:
   - Consultar en Supabase si `code` ya existe.
   - Si no existe: Hacer `INSERT`.
   - Si existe y hay un cambio de estado a Cancelado, o cambio de fecha: Hacer `UPDATE` de variables de tiempo/estado.
   - **Regla Estricta**: NUNCA sobrescribir `vehicle` ni `driver` si ya tienen asignados valores desde el frontend (es decir, respetar el trabajo manual del trafico).

## Salidas y Retornos
- El script de Python debe imprimir un log por consola en formato JSON o texto claro indicando el resultado total (ej. `{"nuevas": 3, "modificadas": 1, "errores": 0}`).
- Cero tolerancia a colgarse: Manejo estricto de excepciones `try/except` que permita continuar la cola de IMAP si un email individual falla.
