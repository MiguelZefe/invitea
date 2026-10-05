-- Auditoria de metadatos: ejecutar manualmente UNA consulta numerada cada vez.
-- Solo SELECT sobre catalogos. No ejecuta funciones de negocio ni lee sus filas.
-- "public" es un alcance inicial, NO una afirmacion sobre el esquema real.
-- Tras Q01, repetir las consultas con filtro 'public' para el esquema confirmado.
-- Los nombres tecnicos tambien deben revisarse antes de compartir resultados.
-- Expresiones y cuerpos potencialmente sensibles se omiten deliberadamente.
-- Si una consulta falla por permisos, registrar Qxx y continuar con la siguiente.

-- Q01: candidatos de eventos y migraciones; esquema, propietario y RLS.
SELECT n.oid AS schema_oid, n.nspname AS schema_name,
       n.nspowner AS schema_owner_oid,
       c.oid AS relation_oid, c.relname AS relation_name,
       c.relkind AS relation_kind, c.relowner AS owner_oid,
       c.relrowsecurity AS rls_enabled, c.relforcerowsecurity AS rls_forced
FROM pg_catalog.pg_namespace AS n
JOIN pg_catalog.pg_class AS c ON c.relnamespace = n.oid
WHERE n.nspname NOT IN ('pg_catalog', 'information_schema')
  AND n.nspname !~ '^pg_'
  AND c.relkind IN ('r', 'p', 'v', 'm', 'f', 'S')
  AND (n.nspname = 'public'
       OR n.nspname ~* '(event|invit|rsvp|migrat)'
       OR c.relname ~* '(event|invit|guest|rsvp|check.?in|metric|histor|migrat)')
ORDER BY n.nspname, c.relname;

-- Q02: columnas, tipos y defaults seguros; no evalua ningun default.
-- Los demas defaults/generadas requieren revision manual sanitizada posterior.
SELECT n.nspname AS schema_name, c.oid AS relation_oid,
       c.relname AS relation_name, a.attnum AS column_number,
       a.attname AS column_name, t.oid AS type_oid,
       tn.nspname AS type_schema, t.typname AS type_name,
       a.atttypmod AS type_modifier, t.typtype AS type_kind,
       t.typbasetype AS domain_base_type_oid, t.typnotnull AS domain_not_null,
       a.attnotnull AS column_not_null,
       a.attidentity AS identity_kind, a.attgenerated AS generated_kind,
       d.oid IS NOT NULL AS has_default_or_generation,
       CASE WHEN d.oid IS NULL THEN NULL
            WHEN pg_catalog.pg_get_expr(d.adbin, d.adrelid)
                 IN ('true', 'false', 'NULL', '0', '1')
            THEN pg_catalog.pg_get_expr(d.adbin, d.adrelid)
            ELSE '[REDACTED_EXPRESSION]' END AS default_or_generation,
       t.typdefault IS NOT NULL AS has_domain_default
FROM pg_catalog.pg_attribute AS a
JOIN pg_catalog.pg_class AS c ON c.oid = a.attrelid
JOIN pg_catalog.pg_namespace AS n ON n.oid = c.relnamespace
JOIN pg_catalog.pg_type AS t ON t.oid = a.atttypid
JOIN pg_catalog.pg_namespace AS tn ON tn.oid = t.typnamespace
LEFT JOIN pg_catalog.pg_attrdef AS d
  ON d.adrelid = a.attrelid AND d.adnum = a.attnum
WHERE n.nspname = 'public'
  AND c.relkind IN ('r', 'p', 'v', 'm', 'f')
  AND a.attnum > 0 AND NOT a.attisdropped
ORDER BY c.oid, a.attnum;

-- Q03: restricciones y FK, incluidas referencias fuera del esquema elegido.
-- conkey/confkey se enlazan con column_number de Q02.
SELECT co.oid AS constraint_oid, co.conname AS constraint_name,
       co.contype AS constraint_type, co.conrelid AS relation_oid,
       co.contypid AS domain_type_oid, co.conkey AS column_numbers,
       rn.nspname AS referenced_schema, rc.relname AS referenced_relation,
       co.confrelid AS referenced_relation_oid,
       co.confkey AS referenced_column_numbers,
       co.confupdtype AS fk_update_action, co.confdeltype AS fk_delete_action,
       co.confmatchtype AS fk_match_type,
       co.condeferrable AS deferrable, co.condeferred AS initially_deferred,
       co.convalidated AS validated, co.conindid AS supporting_index_oid,
       co.conbin IS NOT NULL AS has_expression
FROM pg_catalog.pg_constraint AS co
JOIN pg_catalog.pg_namespace AS n ON n.oid = co.connamespace
LEFT JOIN pg_catalog.pg_class AS rc ON rc.oid = co.confrelid
LEFT JOIN pg_catalog.pg_namespace AS rn ON rn.oid = rc.relnamespace
WHERE n.nspname = 'public'
   OR co.confrelid IN (
       SELECT c.oid FROM pg_catalog.pg_class AS c
       JOIN pg_catalog.pg_namespace AS ns ON ns.oid = c.relnamespace
       WHERE ns.nspname = 'public')
ORDER BY co.conrelid, co.oid;

-- Q04: indices; expresiones/predicados no se exportan.
SELECT i.indrelid AS relation_oid, i.indexrelid AS index_oid,
       x.relname AS index_name, am.amname AS access_method,
       i.indisunique AS is_unique, i.indisprimary AS is_primary,
       i.indisvalid AS is_valid, i.indisready AS is_ready,
       i.indnkeyatts AS key_count, i.indnatts AS total_attribute_count,
       i.indkey AS column_numbers, i.indclass AS operator_class_oids,
       i.indcollation AS collation_oids, i.indoption AS index_options,
       i.indexprs IS NOT NULL AS has_expressions,
       i.indpred IS NOT NULL AS has_predicate
FROM pg_catalog.pg_index AS i
JOIN pg_catalog.pg_class AS c ON c.oid = i.indrelid
JOIN pg_catalog.pg_namespace AS n ON n.oid = c.relnamespace
JOIN pg_catalog.pg_class AS x ON x.oid = i.indexrelid
JOIN pg_catalog.pg_am AS am ON am.oid = x.relam
WHERE n.nspname = 'public'
ORDER BY i.indrelid, i.indexrelid;

-- Q05: inventario de rutinas, incluidas candidatas a RPC.
-- No prosrc, probin, proconfig, argumentos default ni cuerpos SQL.
SELECT p.oid AS routine_oid, n.nspname AS schema_name,
       p.proname AS routine_name, p.proowner AS owner_oid,
       p.prokind AS routine_kind, l.lanname AS language_name,
       p.prosecdef AS security_definer, p.provolatile AS volatility,
       p.proisstrict AS is_strict, p.proretset AS returns_set,
       p.prorettype AS return_type_oid, p.proargtypes AS input_type_oids,
       p.proallargtypes AS all_argument_type_oids,
       p.proargmodes AS argument_modes, p.proargnames AS argument_names,
       p.pronargdefaults AS default_argument_count,
       p.proconfig IS NOT NULL AS has_local_settings,
       '[OMITTED_FOR_REVIEW]' AS definition
FROM pg_catalog.pg_proc AS p
JOIN pg_catalog.pg_namespace AS n ON n.oid = p.pronamespace
JOIN pg_catalog.pg_language AS l ON l.oid = p.prolang
WHERE n.nspname = 'public'
ORDER BY p.proname, p.oid;

-- Q06: mapa de tipos para argumentos y retornos de Q05.
SELECT t.oid AS type_oid, n.nspname AS type_schema,
       t.typname AS type_name, t.typtype AS type_kind,
       t.typelem AS element_type_oid, t.typrelid AS composite_relation_oid
FROM pg_catalog.pg_type AS t
JOIN pg_catalog.pg_namespace AS n ON n.oid = t.typnamespace
WHERE t.oid IN (
    SELECT p.prorettype FROM pg_catalog.pg_proc AS p
    JOIN pg_catalog.pg_namespace AS ns ON ns.oid = p.pronamespace
    WHERE ns.nspname = 'public')
   OR t.oid IN (
    SELECT pg_catalog.unnest(COALESCE(p.proallargtypes, p.proargtypes::oid[]))
    FROM pg_catalog.pg_proc AS p
    JOIN pg_catalog.pg_namespace AS ns ON ns.oid = p.pronamespace
    WHERE ns.nspname = 'public')
ORDER BY t.oid;

-- Q07: vistas y materializadas; sin ejecutar vistas ni exportar su cuerpo.
SELECT c.oid AS relation_oid, n.nspname AS schema_name,
       c.relname AS view_name, c.relkind AS view_kind,
       c.relowner AS owner_oid, c.relispopulated AS is_populated,
       c.reloptions IS NOT NULL AS has_options,
       '[OMITTED_FOR_REVIEW]' AS definition
FROM pg_catalog.pg_class AS c
JOIN pg_catalog.pg_namespace AS n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' AND c.relkind IN ('v', 'm')
ORDER BY c.oid;


-- Q08: triggers, funcion vinculada y estado; sin argumentos ni condicion WHEN.
SELECT tg.oid AS trigger_oid, tg.tgrelid AS relation_oid,
       tg.tgname AS trigger_name, tg.tgfoid AS routine_oid,
       pn.nspname AS routine_schema, p.proname AS routine_name,
       tg.tgtype AS trigger_type_bits, tg.tgenabled AS enabled_mode,
       tg.tgisinternal AS is_internal, tg.tgconstraint AS constraint_oid,
       tg.tgnargs AS argument_count, tg.tgqual IS NOT NULL AS has_condition
FROM pg_catalog.pg_trigger AS tg
JOIN pg_catalog.pg_class AS c ON c.oid = tg.tgrelid
JOIN pg_catalog.pg_namespace AS n ON n.oid = c.relnamespace
JOIN pg_catalog.pg_proc AS p ON p.oid = tg.tgfoid
JOIN pg_catalog.pg_namespace AS pn ON pn.oid = p.pronamespace
WHERE n.nspname = 'public'
ORDER BY tg.tgrelid, tg.oid;

-- Q09: politicas RLS; roles por OID (0 = PUBLIC), expresiones ocultas.
SELECT po.oid AS policy_oid, po.polrelid AS relation_oid,
       po.polname AS policy_name, po.polcmd AS command_code,
       po.polpermissive AS permissive, po.polroles AS role_oids,
       po.polqual IS NOT NULL AS has_using,
       po.polwithcheck IS NOT NULL AS has_with_check
FROM pg_catalog.pg_policy AS po
JOIN pg_catalog.pg_class AS c ON c.oid = po.polrelid
JOIN pg_catalog.pg_namespace AS n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
ORDER BY po.polrelid, po.oid;

-- Q10: ACL de relaciones (incluye vistas/secuencias), rutinas y esquema.
-- ACL nula se expande con el default incorporado, no con pg_default_acl.
-- Es privilegio de objeto; no demuestra acceso efectivo ni el efecto de RLS.
SELECT o.object_kind, o.object_oid, o.owner_oid, o.acl_was_null,
       a.grantor AS grantor_oid, a.grantee AS grantee_oid,
       a.privilege_type, a.is_grantable
FROM (
    SELECT 'relation' AS object_kind, c.oid AS object_oid, c.relowner AS owner_oid,
           c.relacl IS NULL AS acl_was_null,
           COALESCE(c.relacl, pg_catalog.acldefault(
               CASE WHEN c.relkind = 'S' THEN 'S'::"char" ELSE 'r'::"char" END,
               c.relowner)) AS object_acl
    FROM pg_catalog.pg_class AS c
    JOIN pg_catalog.pg_namespace AS n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relkind IN ('r','p','v','m','f','S')
    UNION ALL
    SELECT 'routine', p.oid, p.proowner, p.proacl IS NULL,
           COALESCE(p.proacl, pg_catalog.acldefault('f'::"char", p.proowner))
    FROM pg_catalog.pg_proc AS p
    JOIN pg_catalog.pg_namespace AS n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
    UNION ALL
    SELECT 'schema', n.oid, n.nspowner, n.nspacl IS NULL,
           COALESCE(n.nspacl, pg_catalog.acldefault('n'::"char", n.nspowner))
    FROM pg_catalog.pg_namespace AS n WHERE n.nspname = 'public'
) AS o
CROSS JOIN LATERAL pg_catalog.aclexplode(o.object_acl) AS a
ORDER BY o.object_kind, o.object_oid, a.grantee, a.privilege_type;

-- Q11: ACL explicitas por columna; ausencia no elimina permisos de tabla.
SELECT c.oid AS relation_oid, at.attnum AS column_number,
       a.grantor AS grantor_oid, a.grantee AS grantee_oid,
       a.privilege_type, a.is_grantable
FROM pg_catalog.pg_attribute AS at
JOIN pg_catalog.pg_class AS c ON c.oid = at.attrelid
JOIN pg_catalog.pg_namespace AS n ON n.oid = c.relnamespace
CROSS JOIN LATERAL pg_catalog.aclexplode(at.attacl) AS a
WHERE n.nspname = 'public' AND at.attnum > 0 AND NOT at.attisdropped
ORDER BY c.oid, at.attnum, a.grantee;

-- Q12: privilegios por defecto globales o del esquema, para objetos futuros.
SELECT d.oid AS default_acl_oid, d.defaclrole AS owner_oid,
       d.defaclnamespace AS schema_oid, d.defaclobjtype AS object_type,
       a.grantor AS grantor_oid, a.grantee AS grantee_oid,
       a.privilege_type, a.is_grantable
FROM pg_catalog.pg_default_acl AS d
LEFT JOIN pg_catalog.pg_namespace AS n ON n.oid = d.defaclnamespace
CROSS JOIN LATERAL pg_catalog.aclexplode(d.defaclacl) AS a
WHERE d.defaclnamespace = 0 OR n.nspname = 'public'
ORDER BY d.oid, a.grantee;

-- Q13: roles sin passwords, configuracion, fechas ni nombres personales.
-- Solo se conservan nombres de roles tecnicos conocidos; el resto usa su OID.
SELECT r.oid AS role_oid,
       CASE WHEN r.rolname IN ('anon','authenticated','service_role','postgres')
            THEN r.rolname::text ELSE 'role_' || r.oid::text END AS role_label,
       r.rolsuper AS is_superuser, r.rolinherit AS inherits,
       r.rolcanlogin AS can_login, r.rolbypassrls AS bypasses_rls
FROM pg_catalog.pg_roles AS r
ORDER BY r.oid;

-- Q14: membresias, sin nombres ni credenciales; no cambia de rol.
SELECT m.roleid AS role_oid, m.member AS member_oid,
       m.grantor AS grantor_oid, m.admin_option
FROM pg_catalog.pg_auth_members AS m
ORDER BY m.roleid, m.member;

-- Q15: dependencias catalogadas, incluidas reglas de vistas y FK.
-- Identidades numericas evitan descripciones con expresiones o literales.
-- No descubre SQL dinamico ni todas las referencias en cuerpos de funciones.
SELECT d.classid AS dependent_catalog_oid, d.objid AS dependent_oid,
       d.objsubid AS dependent_column_number,
       d.refclassid AS referenced_catalog_oid, d.refobjid AS referenced_oid,
       d.refobjsubid AS referenced_column_number, d.deptype AS dependency_type,
       rw.ev_class AS view_relation_oid
FROM pg_catalog.pg_depend AS d
LEFT JOIN pg_catalog.pg_rewrite AS rw
  ON d.classid = 'pg_catalog.pg_rewrite'::regclass AND d.objid = rw.oid
WHERE (d.classid = 'pg_catalog.pg_class'::regclass AND d.objid IN (
         SELECT c.oid FROM pg_catalog.pg_class AS c
         JOIN pg_catalog.pg_namespace AS n ON n.oid = c.relnamespace
         WHERE n.nspname = 'public'))
   OR (d.refclassid = 'pg_catalog.pg_class'::regclass AND d.refobjid IN (
         SELECT c.oid FROM pg_catalog.pg_class AS c
         JOIN pg_catalog.pg_namespace AS n ON n.oid = c.relnamespace
         WHERE n.nspname = 'public'))
   OR (d.classid = 'pg_catalog.pg_proc'::regclass AND d.objid IN (
         SELECT p.oid FROM pg_catalog.pg_proc AS p
         JOIN pg_catalog.pg_namespace AS n ON n.oid = p.pronamespace
         WHERE n.nspname = 'public'))
   OR rw.ev_class IN (
         SELECT c.oid FROM pg_catalog.pg_class AS c
         JOIN pg_catalog.pg_namespace AS n ON n.oid = c.relnamespace
         WHERE n.nspname = 'public')
ORDER BY d.classid, d.objid, d.objsubid, d.refclassid, d.refobjid;

-- Q16: herencia/particiones; no exporta limites con posibles valores privados.
SELECT i.inhrelid AS child_relation_oid, i.inhparent AS parent_relation_oid,
       i.inhseqno AS inheritance_order
FROM pg_catalog.pg_inherits AS i
WHERE i.inhrelid IN (
    SELECT c.oid FROM pg_catalog.pg_class AS c
    JOIN pg_catalog.pg_namespace AS n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public')
   OR i.inhparent IN (
    SELECT c.oid FROM pg_catalog.pg_class AS c
    JOIN pg_catalog.pg_namespace AS n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public')
ORDER BY i.inhparent, i.inhrelid;

-- Q17: ubicacion de candidatos de migracion, NO historial ni contenido.
SELECT 'relation' AS object_kind, c.oid AS object_oid,
       n.nspname AS schema_name, c.relname AS object_name, c.relowner AS owner_oid
FROM pg_catalog.pg_class AS c
JOIN pg_catalog.pg_namespace AS n ON n.oid = c.relnamespace
WHERE n.nspname !~ '^pg_' AND n.nspname <> 'information_schema'
  AND (n.nspname ~* 'migrat' OR c.relname ~* '(migrat|schema_version)')
UNION ALL
SELECT 'routine', p.oid, n.nspname, p.proname, p.proowner
FROM pg_catalog.pg_proc AS p
JOIN pg_catalog.pg_namespace AS n ON n.oid = p.pronamespace
WHERE n.nspname !~ '^pg_' AND n.nspname <> 'information_schema'
  AND (n.nspname ~* 'migrat' OR p.proname ~* '(migrat|schema_version)')
ORDER BY object_kind, schema_name, object_name;

-- Q18: nombres de catalogos para interpretar los OID de Q15.
SELECT c.oid AS catalog_oid, c.relname AS catalog_name
FROM pg_catalog.pg_class AS c
JOIN pg_catalog.pg_namespace AS n ON n.oid = c.relnamespace
WHERE n.nspname = 'pg_catalog'
  AND c.relname IN ('pg_class','pg_proc','pg_type','pg_namespace',
                   'pg_constraint','pg_rewrite','pg_trigger','pg_policy',
                   'pg_attrdef','pg_extension')
ORDER BY c.oid;

-- Q19: vista estandar de columnas visibles para el rol actual.
-- No se devuelve column_default ni identity_start (podrian contener valores).
SELECT table_schema, table_name, column_name, ordinal_position,
       is_nullable, data_type, character_maximum_length,
       numeric_precision, numeric_scale, datetime_precision,
       udt_schema, udt_name, domain_schema, domain_name,
       is_identity, identity_generation, is_generated, is_updatable
FROM information_schema.columns
WHERE table_schema = 'public'
ORDER BY table_schema, table_name, ordinal_position;
