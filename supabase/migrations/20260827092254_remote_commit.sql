drop extension if exists "pg_net";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.current_person_has_organization(target_organization_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select exists (
    select 1
    from public.organization_memberships om
    where om.person_id = public.current_person_id()
      and om.organization_id = target_organization_id
  );
$function$
;

CREATE OR REPLACE FUNCTION public.current_person_organizations()
 RETURNS TABLE(organization_id uuid, organization_name text, membership_id uuid, membership_type public.organization_membership_type, is_admin boolean)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select
    o.id,
    o.name,
    om.id,
    om.membership_type,
    om.is_admin
  from public.organization_memberships om
  join public.organizations o
    on o.id = om.organization_id
  where om.person_id = public.current_person_id()
  order by o.name;
$function$
;

grant delete on table "public"."organization_memberships" to "anon";

grant insert on table "public"."organization_memberships" to "anon";

grant select on table "public"."organization_memberships" to "anon";

grant update on table "public"."organization_memberships" to "anon";

grant delete on table "public"."organization_memberships" to "authenticated";

grant insert on table "public"."organization_memberships" to "authenticated";

grant select on table "public"."organization_memberships" to "authenticated";

grant update on table "public"."organization_memberships" to "authenticated";

grant delete on table "public"."organization_memberships" to "service_role";

grant insert on table "public"."organization_memberships" to "service_role";

grant select on table "public"."organization_memberships" to "service_role";

grant update on table "public"."organization_memberships" to "service_role";

grant delete on table "public"."organizations" to "anon";

grant insert on table "public"."organizations" to "anon";

grant select on table "public"."organizations" to "anon";

grant update on table "public"."organizations" to "anon";

grant delete on table "public"."organizations" to "authenticated";

grant insert on table "public"."organizations" to "authenticated";

grant select on table "public"."organizations" to "authenticated";

grant update on table "public"."organizations" to "authenticated";

grant delete on table "public"."organizations" to "service_role";

grant insert on table "public"."organizations" to "service_role";

grant select on table "public"."organizations" to "service_role";

grant update on table "public"."organizations" to "service_role";

grant delete on table "public"."persons" to "anon";

grant insert on table "public"."persons" to "anon";

grant select on table "public"."persons" to "anon";

grant update on table "public"."persons" to "anon";

grant delete on table "public"."persons" to "authenticated";

grant insert on table "public"."persons" to "authenticated";

grant select on table "public"."persons" to "authenticated";

grant update on table "public"."persons" to "authenticated";

grant delete on table "public"."persons" to "service_role";

grant insert on table "public"."persons" to "service_role";

grant select on table "public"."persons" to "service_role";

grant update on table "public"."persons" to "service_role";


