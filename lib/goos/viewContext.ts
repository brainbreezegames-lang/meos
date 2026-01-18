import { Session } from 'next-auth';

export type GoOSViewMode = 'owner' | 'visitor';

export interface GoOSViewContext {
  mode: GoOSViewMode;
  username: string;
  isAuthenticated: boolean;
  canEdit: boolean;
  canViewDrafts: boolean;
}

/**
 * Determines the view context based on the requested username and session.
 * Used to decide what data to show and what actions are allowed.
 */
export function getGoOSViewContext(
  requestUsername: string,
  session: Session | null
): GoOSViewContext {
  const isAuthenticated = !!session?.user;
  const sessionUsername = (session?.user as { username?: string })?.username;
  const isOwner = isAuthenticated && sessionUsername === requestUsername;

  return {
    mode: isOwner ? 'owner' : 'visitor',
    username: requestUsername,
    isAuthenticated,
    canEdit: isOwner,
    canViewDrafts: isOwner,
  };
}

/**
 * Builds Prisma where clause for filtering files based on view context.
 */
export function buildFileFilterForView(
  desktopId: string,
  viewContext: GoOSViewContext,
  parentId?: string | null
) {
  const baseFilter = {
    desktopId,
    itemVariant: 'goos-file' as const,
  };

  // Add parent filter
  const parentFilter = parentId === undefined
    ? {} // All files
    : parentId === null
      ? { parentItemId: null } // Root level only
      : { parentItemId: parentId }; // Specific folder

  // Visitors only see published files
  const publishFilter = viewContext.canViewDrafts
    ? {}
    : { publishStatus: 'published' as const };

  return {
    ...baseFilter,
    ...parentFilter,
    ...publishFilter,
  };
}
