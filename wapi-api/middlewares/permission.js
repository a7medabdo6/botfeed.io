import { User, Permission, RolePermission, TeamPermission } from '../models/index.js';

export const checkPermission = (permissionSlug) => {
  return async (req, res, next) => {
    try {
      const user = req.user;

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      let userRole;
      if (user.role_id && user.role_id.name) {
        userRole = user.role_id;
      } else {
        const userWithRole = await User.findById(user._id).populate('role_id').lean();
        if (!userWithRole || !userWithRole.role_id) {
          return res.status(403).json({
            success: false,
            code: 'USER_ROLE_MISSING',
            permission: permissionSlug,
            message:
              'Your account has no role assigned, so access to this action is blocked. Ask an administrator to assign a role in wapi-admin → Users.',
          });
        }
        userRole = userWithRole.role_id;
      }

      if (userRole.name === 'super_admin') {
        return next();
      }

      const permissionDoc = await Permission.findOne({ slug: permissionSlug }).lean();

      if (!permissionDoc) {
        return res.status(403).json({
          success: false,
          code: 'PERMISSION_NOT_IN_DATABASE',
          permission: permissionSlug,
          message: `The permission "${permissionSlug}" is not defined in the database yet. Run the API permission seeder (or redeploy seeds) so it appears in wapi-admin → Roles, then assign it to the relevant roles.`,
        });
      }

      if (userRole.name === 'agent') {
        if (!user.team_id) {
          return res.status(403).json({
            success: false,
            code: 'AGENT_NO_TEAM',
            permission: permissionSlug,
            message: 'You are an agent but are not assigned to a team. Ask an administrator to assign you to a team before using this action.',
          });
        }

        const hasPermission = await TeamPermission.exists({
          team_id: user.team_id,
          permission_id: permissionDoc._id
        });

        if (!hasPermission) {
          return res.status(403).json({
            success: false,
            code: 'TEAM_PERMISSION_MISSING',
            permission: permissionSlug,
            message: `Your team does not have "${permissionSlug}". An administrator can grant team permissions in wapi-admin → Teams for your team.`,
          });
        }

        return next();
      }

      const hasPermission = await RolePermission.exists({
        role_id: userRole._id,
        permission_id: permissionDoc._id
      });

      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          code: 'ROLE_PERMISSION_MISSING',
          permission: permissionSlug,
          message: `Your role does not include "${permissionSlug}". In wapi-admin → Roles, edit the role assigned to this user, enable that permission under Access permissions, and save.`,
        });
      }

      return next();

    } catch (error) {
      console.error('Permission middleware error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error during permission check'
      });
    }
  };
};
