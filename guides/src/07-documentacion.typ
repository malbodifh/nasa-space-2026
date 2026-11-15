// Generado por scripts/md_to_typst.py. No editar a mano.
#import "docs/theme.typ": *
#show: docs
#set document(title: "Documentación — Astral Codes", author: "Astral Codes")

#cover()

#outline(title: "Contenido", indent: auto, depth: 1)

#part("I", "Inicio", "Contexto, reglas y estado del proyecto.")

#include "docs/readme.typ"

#include "docs/contributing.typ"

#include "docs/agents.typ"

#include "docs/documentacion.typ"

#part("II", "Equipo y retos", "Cómo se organiza el equipo y qué retos existen.")

#include "docs/00-equipo-y-reglas.typ"

#include "docs/02-challenges-2026.typ"

#part("III", "Producto y arquitectura", "Qué se construye y cómo se estructura.")

#include "docs/22-investigacion-desastres.typ"

#include "docs/23-plan-app.typ"

#include "docs/24-arquitectura-app.typ"

#part("IV", "Datos y APIs", "Qué datos existen, qué se probó y qué se puede construir.")

#include "docs/25-api-research.typ"

#include "docs/26-spike-datos.typ"

#include "docs/27-benchmark-apps.typ"

#include "docs/apis-research-samuel.typ"

#part("V", "Operación", "Cómo se trabaja y qué se registró.")

#include "docs/18-workflow.typ"

#include "docs/19-herramientas.typ"

#include "docs/bitacora-2026-11-14.typ"

#part("VI", "Anexos", "README de carpetas, plantillas y reglas de la app.")

#include "docs/anexo-guides.typ"

#include "docs/anexo-research.typ"

#include "docs/anexo-assets.typ"

#include "docs/anexo-scripts.typ"

#include "docs/anexo-pr-template.typ"

#include "docs/anexo-web.typ"

#include "docs/anexo-nextjs-agents.typ"

#part("VII", "Archivo", "Idea SPHEREx descartada; no se borra.")

#include "docs/archivo-spherex-readme.typ"

#include "docs/archivo-spherex-03-tecnico.typ"

#include "docs/archivo-spherex-04-apis.typ"

#include "docs/archivo-spherex-05-arquitectura.typ"

#include "docs/archivo-spherex-07-pitch.typ"

#include "docs/archivo-spherex-08-problemas.typ"

#include "docs/archivo-spherex-15-validacion.typ"

#colophon()
