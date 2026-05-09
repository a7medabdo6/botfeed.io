import WidgetConfig from '../models/widget-config.model.js';
import WebConversation from '../models/web-conversation.model.js';
import WebMessage from '../models/web-message.model.js';
import Workspace from '../models/workspace.model.js';
import mongoose from 'mongoose';

const getOwnerId = (req) => req.user?.owner_id || req.user?._id;

function parseWorkspaceId(raw) {
  if (raw === undefined) return undefined;
  if (raw === null || raw === '') return null;
  if (!mongoose.Types.ObjectId.isValid(raw)) return 'invalid';
  return new mongoose.Types.ObjectId(raw);
}

async function assertWorkspaceOwnership(ownerId, workspaceId) {
  if (!workspaceId) return true;
  const ws = await Workspace.findOne({
    _id: workspaceId,
    user_id: ownerId,
    deleted_at: null,
  })
    .select('_id')
    .lean();
  return Boolean(ws);
}

export async function list(req, res) {
  try {
    const ownerId = getOwnerId(req);
    const filter = { user_id: ownerId };
    const workspaceId = parseWorkspaceId(req.query.workspace_id);

    if (workspaceId === 'invalid') {
      return res.status(400).json({ success: false, message: 'Invalid workspace_id' });
    }
    if (workspaceId !== undefined) {
      if (workspaceId && !(await assertWorkspaceOwnership(ownerId, workspaceId))) {
        return res.status(403).json({ success: false, message: 'Workspace not found or not owned by this account' });
      }
      filter.workspace_id = workspaceId;
    }
    if (req.query.mode) {
      filter.mode = req.query.mode;
    }
    const configs = await WidgetConfig.find(filter).sort({ created_at: -1 }).lean();
    return res.json({ success: true, data: configs });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function getById(req, res) {
  try {
    const config = await WidgetConfig.findOne({ _id: req.params.id, user_id: getOwnerId(req) }).lean();
    if (!config) return res.status(404).json({ success: false, message: 'Not found' });
    return res.json({ success: true, data: config });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function create(req, res) {
  try {
    const ownerId = getOwnerId(req);
    const workspaceId = parseWorkspaceId(req.body.workspace_id);
    if (workspaceId === 'invalid') {
      return res.status(400).json({ success: false, message: 'Invalid workspace_id' });
    }
    if (workspaceId && !(await assertWorkspaceOwnership(ownerId, workspaceId))) {
      return res.status(403).json({ success: false, message: 'Workspace not found or not owned by this account' });
    }
    const config = await WidgetConfig.create({
      ...req.body,
      user_id: ownerId,
      workspace_id: workspaceId ?? null,
    });
    return res.status(201).json({ success: true, data: config });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function update(req, res) {
  try {
    const ownerId = getOwnerId(req);
    const payload = { ...req.body };
    if (Object.prototype.hasOwnProperty.call(req.body, 'workspace_id')) {
      const workspaceId = parseWorkspaceId(req.body.workspace_id);
      if (workspaceId === 'invalid') {
        return res.status(400).json({ success: false, message: 'Invalid workspace_id' });
      }
      if (workspaceId && !(await assertWorkspaceOwnership(ownerId, workspaceId))) {
        return res.status(403).json({ success: false, message: 'Workspace not found or not owned by this account' });
      }
      payload.workspace_id = workspaceId;
    }
    const config = await WidgetConfig.findOneAndUpdate(
      { _id: req.params.id, user_id: ownerId },
      payload,
      { new: true, runValidators: true },
    );
    if (!config) return res.status(404).json({ success: false, message: 'Not found' });
    return res.json({ success: true, data: config });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function remove(req, res) {
  try {
    const config = await WidgetConfig.findOneAndDelete({ _id: req.params.id, user_id: getOwnerId(req) });
    if (!config) return res.status(404).json({ success: false, message: 'Not found' });
    return res.json({ success: true, message: 'Deleted' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function getConversations(req, res) {
  try {
    const ownerId = getOwnerId(req);
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const skip = (page - 1) * limit;

    const filter = { user_id: ownerId };
    if (req.query.status) filter.status = req.query.status;
    if (req.query.workspace_id) {
      const workspaceId = parseWorkspaceId(req.query.workspace_id);
      if (workspaceId === 'invalid') {
        return res.status(400).json({ success: false, message: 'Invalid workspace_id' });
      }
      if (!workspaceId) {
        filter.widget_config_id = null;
      } else {
        if (!(await assertWorkspaceOwnership(ownerId, workspaceId))) {
          return res.status(403).json({ success: false, message: 'Workspace not found or not owned by this account' });
        }
        const ids = await WidgetConfig.find({ user_id: ownerId, workspace_id: workspaceId })
          .select('_id')
          .lean();
        filter.widget_config_id = { $in: ids.map((d) => d._id) };
      }
    }
    if (req.query.widget_config_id) {
      const widget = await WidgetConfig.findOne({
        _id: req.query.widget_config_id,
        user_id: ownerId,
      })
        .select('_id')
        .lean();
      if (!widget) {
        return res.status(404).json({ success: false, message: 'Widget config not found' });
      }
      filter.widget_config_id = widget._id;
    }

    const [conversations, total] = await Promise.all([
      WebConversation.find(filter).sort({ last_message_at: -1 }).skip(skip).limit(limit).lean(),
      WebConversation.countDocuments(filter),
    ]);
    return res.json({ success: true, data: conversations, pagination: { page, limit, total } });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function getConversationMessages(req, res) {
  try {
    const conversation = await WebConversation.findOne({ _id: req.params.conversationId, user_id: getOwnerId(req) });
    if (!conversation) return res.status(404).json({ success: false, message: 'Not found' });

    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 50);
    const skip = (page - 1) * limit;

    const messages = await WebMessage.find({ conversation_id: conversation._id })
      .sort({ created_at: 1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return res.json({ success: true, data: messages });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function replyToConversation(req, res) {
  try {
    const conversation = await WebConversation.findOne({ _id: req.params.conversationId, user_id: getOwnerId(req) });
    if (!conversation) return res.status(404).json({ success: false, message: 'Not found' });

    const { handleAgentReply } = await import('../utils/widget-chat-engine.js');
    const io = req.app.get('io');

    const msg = await handleAgentReply({
      conversationId: conversation._id,
      content: req.body.content,
      agentId: getOwnerId(req),
      io,
    });

    return res.json({ success: true, data: msg });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
