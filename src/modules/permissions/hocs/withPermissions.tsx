import { ComponentType, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import usePermissions from '@modules/permissions/hooks/usePermissions';
import { Permission, PermissionCheck } from '@modules/permissions/defs/types';

interface WithPermissionsProps {
  requiredPermissions: PermissionCheck;
  redirectUrl: string;
}

const withPermissions = <P extends object>(
  WrappedComponent: ComponentType<P>,
  { requiredPermissions, redirectUrl }: WithPermissionsProps
): ComponentType<P> => {
  const WithPermissions: ComponentType<P> = (props: P) => {
    const { can } = usePermissions();
    const router = useRouter();
    const [allowed, setAllowed] = useState<boolean | null>(null);

    const isPermission = (check: PermissionCheck): check is Permission =>
      (check as Permission).entity !== undefined;

    const evaluatePermission = (permissionCheck: PermissionCheck): boolean => {
      if ('and' in permissionCheck) {
        return permissionCheck.and?.every(evaluatePermission) ?? false;
      }
      if ('or' in permissionCheck) {
        return permissionCheck.or?.some(evaluatePermission) ?? false;
      }
      if ('not' in permissionCheck) {
        const notCheck = permissionCheck.not;
        if (Array.isArray(notCheck)) {
          return notCheck.every((pc) => !evaluatePermission(pc));
        }
        return !evaluatePermission(notCheck!);
      }
      if (isPermission(permissionCheck)) {
        return can(permissionCheck.entity, permissionCheck.action, permissionCheck.entityId);
      }
      return false;
    };

    const updateEntityId = (id: string, permissionCheck: PermissionCheck): PermissionCheck => {
      if (
        isPermission(permissionCheck) &&
        permissionCheck.entityQueryKey &&
        permissionCheck.entityId !== Number(id)
      ) {
        return { ...permissionCheck, entityId: Number(id) };
      }
      if ('and' in permissionCheck) {
        return { and: permissionCheck.and!.map((pc) => updateEntityId(id, pc)) };
      }
      if ('or' in permissionCheck) {
        return { or: permissionCheck.or!.map((pc) => updateEntityId(id, pc)) };
      }
      if ('not' in permissionCheck) {
        return { not: permissionCheck.not!.map((pc) => updateEntityId(id, pc)) };
      }
      return permissionCheck;
    };

    useEffect(() => {
      if (!router.isReady) {
        return;
      }
      let permCheck = requiredPermissions;
      const queryId = router.query.id;
      if (typeof queryId === 'string') {
        const key =
          isPermission(requiredPermissions) && requiredPermissions.entityQueryKey
            ? requiredPermissions.entityQueryKey
            : 'id';
        permCheck = updateEntityId(router.query[key] as string, requiredPermissions);
      }
      const hasPerm = evaluatePermission(permCheck);
      if (hasPerm) {
        setAllowed(true);
      } else {
        setAllowed(false);
        router.replace(redirectUrl);
      }
    }, [router.isReady, router.query, can]);

    if (allowed !== true) {
      return null;
    }
    return <WrappedComponent {...props} />;
  };

  return WithPermissions;
};

export default withPermissions;
