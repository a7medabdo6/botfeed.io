import { Workspace, WhatsappWaba } from '../models/index.js';

const WORKSPACE_SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const createWorkspace = async (req, res) => {
    try {
        const { name, description, slug } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                error: 'Workspace name is required'
            });
        }

        let slugVal = null;
        if (slug !== undefined && slug !== null && String(slug).trim()) {
            const s = String(slug).trim().toLowerCase();
            if (!WORKSPACE_SLUG_RE.test(s)) {
                return res.status(400).json({
                    success: false,
                    error: 'slug must be lowercase letters, numbers, and hyphens only',
                });
            }
            const taken = await Workspace.findOne({ slug: s, deleted_at: null }).select('_id').lean();
            if (taken) {
                return res.status(400).json({
                    success: false,
                    error: 'This workspace slug is already in use',
                });
            }
            slugVal = s;
        }

        const workspace = await Workspace.create({
            user_id: req.user.owner_id,
            created_by: req.user.id,
            name,
            description,
            slug: slugVal,
        });

        return res.status(201).json({
            success: true,
            data: workspace
        });
    } catch (error) {
        console.error('Error creating workspace:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to create workspace',
            details: error.message
        });
    }
};

export const getWorkspaces = async (req, res) => {
    try {
        const userId = req.user.owner_id;
        const workspaces = await Workspace.find({
            user_id: userId,
            deleted_at: null
        }).sort({ createdAt: -1 }).lean();


        const connectedWabas = await WhatsappWaba.find({
            user_id: userId,
            workspace_id: { $in: workspaces.map(ws => ws._id) },
            deleted_at: null
        }).lean();

        const result = workspaces.map(ws => {
            const waba = connectedWabas.find(w => w.workspace_id.toString() === ws._id.toString());
            return {
                ...ws,
                waba_id: waba?._id || null,
                connection_status: waba?.connection_status || null,
                waba_type: waba?.provider || null
            };
        });

        return res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Error fetching workspaces:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to fetch workspaces',
            details: error.message
        });
    }
};

export const getWorkspaceById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.owner_id;

        const workspace = await Workspace.findOne({
            _id: id,
            user_id: userId,
            deleted_at: null
        });

        if (!workspace) {
            return res.status(404).json({
                success: false,
                error: 'Workspace not found'
            });
        }

        return res.json({
            success: true,
            data: workspace
        });
    } catch (error) {
        console.error('Error fetching workspace:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to fetch workspace',
            details: error.message
        });
    }
};

export const updateWorkspace = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, is_active, slug } = req.body;

        const update = {};
        if (name !== undefined) update.name = name;
        if (description !== undefined) update.description = description;
        if (is_active !== undefined) update.is_active = is_active;
        if (slug !== undefined) {
            const s = slug === null || slug === '' ? null : String(slug).trim().toLowerCase();
            if (s && !WORKSPACE_SLUG_RE.test(s)) {
                return res.status(400).json({
                    success: false,
                    error: 'slug must be lowercase letters, numbers, and hyphens only',
                });
            }
            if (s) {
                const taken = await Workspace.findOne({
                    slug: s,
                    _id: { $ne: id },
                    deleted_at: null,
                }).select('_id').lean();
                if (taken) {
                    return res.status(400).json({
                        success: false,
                        error: 'This workspace slug is already in use',
                    });
                }
            }
            update.slug = s;
        }

        if (Object.keys(update).length === 0) {
            const current = await Workspace.findOne({ _id: id, user_id: req.user.owner_id, deleted_at: null });
            if (!current) {
                return res.status(404).json({ success: false, error: 'Workspace not found' });
            }
            return res.json({ success: true, data: current });
        }

        const workspace = await Workspace.findOneAndUpdate(
            { _id: id, user_id: req.user.owner_id, deleted_at: null },
            { $set: update },
            { new: true, runValidators: true }
        );

        if (!workspace) {
            return res.status(404).json({
                success: false,
                error: 'Workspace not found'
            });
        }

        return res.json({
            success: true,
            data: workspace
        });
    } catch (error) {
        console.error('Error updating workspace:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to update workspace',
            details: error.message
        });
    }
};

export const deleteWorkspace = async (req, res) => {
    try {
        const { id } = req.params;

        const workspace = await Workspace.findOneAndUpdate(
            { _id: id, user_id: req.user.owner_id, deleted_at: null },
            { deleted_at: new Date() },
            { new: true }
        );

        if (!workspace) {
            return res.status(404).json({
                success: false,
                error: 'Workspace not found'
            });
        }

        const existingWabas = await WhatsappWaba.find({ workspace_id: id });
        if (existingWabas.length > 0) {
            const wabaIds = existingWabas.map(w => w._id);
            await WhatsappPhoneNumber.deleteMany({ waba_id: { $in: wabaIds } });
            await WhatsappWaba.deleteMany({ _id: { $in: wabaIds } });
        }


        return res.json({
            success: true,
            message: 'Workspace deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting workspace:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to delete workspace',
            details: error.message
        });
    }
};

export const getConnectedWorkspaces = async (req, res) => {
    try {
        const userId = req.user.owner_id;

        const connectedWabas = await WhatsappWaba.find({
            user_id: userId,
            workspace_id: { $exists: true, $ne: null },
            deleted_at: null
        }).select('workspace_id whatsapp_business_account_id name').lean();

        if (connectedWabas.length === 0) {
            return res.json({
                success: true,
                data: []
            });
        }

        const workspaceIds = connectedWabas.map(w => w.workspace_id);
        const workspaces = await Workspace.find({
            _id: { $in: workspaceIds },
            deleted_at: null
        }).lean();

        const result = workspaces.map(ws => {
            const waba = connectedWabas.find(w => w.workspace_id.toString() === ws._id.toString());
            return {
                ...ws,
                waba_id: waba ? waba.whatsapp_business_account_id : null,
                waba_db_id: waba ? waba._id : null,
                waba_name: waba ? waba.name : null
            };
        });

        return res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Error fetching connected workspaces:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to fetch connected workspaces',
            details: error.message
        });
    }
};

export default {
    createWorkspace,
    getWorkspaces,
    getWorkspaceById,
    updateWorkspace,
    deleteWorkspace,
    getConnectedWorkspaces
};
