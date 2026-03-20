---
description: Cómo funciona y cómo mantener el parser automático de emails
---

# Email Parser — Legacy Tours Spain

## Fuentes de datos
- **GetYourGuide:** `do-not-reply@notification.getyourguide.com`
- **FareHarbor:** `messages@fareharbor.com`

## Tipos de emails detectados
| Tipo         | Identificación                        | Acción               |
|--------------|---------------------------------------|----------------------|
| Nueva reserva | Asunto sin "cancel" ni "cancelad"    | INSERT en mockTours  |
| Cancelación  | Asunto contiene "cancel" / "cancelad" | UPDATE status        |
| Modificación | Asunto contiene "modif" / "update"   | UPDATE fecha/pax     |

## Precio neto (25% deducción)
- El precio que aparece en el email es el precio bruto de la plataforma.
- El script aplica automáticamente **× 0.75** para obtener el ingreso neto.
- Si la plataforma cambia su comisión, editar `clean_price()` en `execution/email_parser.py`.

## Ejecución manual
```bash
cd /Users/cristiangutierrez/Desktop/DDBB/legacy-tours-dashboard
python3 execution/email_parser.py
```

## Ejecución automática (launchd)
- Fichero plist: `~/Library/LaunchAgents/com.legacytours.emailparser.plist`
- Se activa cada mañana a las **08:00h** (configurable)
- Log en: `legacy-tours-dashboard/.tmp/parser.log`

## Estructura del objeto reserva
```json
{
  "code":       "GYG7VK265K28",
  "date":       "2026-03-25",
  "start":      "18:00",
  "duration":   2,
  "operator":   "GYG",
  "status":     "confirmado",
  "pax":        4,
  "vehicle":    "01-DR",
  "driver":     "Cristian",
  "clientName": "Rane Bo Cross",
  "phone":      "+18165290747",
  "language":   "EN",
  "country":    "",
  "netPrice":   135.42,
  "product":    "Barcelona: Private Tuk Tuk Tour"
}
```

## Casos límite conocidos
- Los correos de FareHarbor tipo "Meetup" o "Barcelona Meetup" se ignoran automáticamente.
- Si un correo no tiene código de reserva reconocible, se marca como `skipped`.
- Las asignaciones manuales de `driver` y `vehicle` **nunca se sobrescriben**.

## Próximos pasos
- Añadir soporte para Viator cuando el usuario lo active.
- Migrar a Supabase para datos en tiempo real (sin necesidad de push a GitHub).
