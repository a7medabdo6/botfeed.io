import mongoose from 'mongoose';
import FunnelPage from '../models/funnel-page.model.js';
import FunnelPageVersion from '../models/funnel-page-version.model.js';
import FunnelAnalyticsEvent from '../models/funnel-analytics-event.model.js';
import WidgetConfig from '../models/widget-config.model.js';
import Workspace from '../models/workspace.model.js';

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const ALLOWED_BLOCK_TYPES = new Set(['hero', 'text', 'image', 'button']);

function slugify(input) {
  return String(input || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120) || 'funnel';
}

export function validateBlocks(blocks) {
  if (!Array.isArray(blocks)) return 'blocks must be an array';
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    if (!b || typeof b !== 'object') return `Block ${i} is invalid`;
    const t = b.type;
    if (!ALLOWED_BLOCK_TYPES.has(t)) return `Block ${i}: unknown type "${t}"`;
    if (t === 'hero') {
      if (typeof b.title !== 'string' || !b.title.trim()) return `Block ${i} (hero): title required`;
    }
    if (t === 'text') {
      if (typeof b.body !== 'string') return `Block ${i} (text): body must be a string`;
    }
    if (t === 'image') {
      if (typeof b.url !== 'string' || !b.url.trim()) return `Block ${i} (image): url required`;
    }
    if (t === 'button') {
      if (typeof b.label !== 'string' || !b.label.trim()) return `Block ${i} (button): label required`;
      if (typeof b.url !== 'string' || !b.url.trim()) return `Block ${i} (button): url required`;
    }
  }
  return null;
}

function pickAbVariant(doc) {
  let blocks = doc.blocks || [];
  let variant = null;
  if (doc.ab_test_enabled && Array.isArray(doc.ab_blocks_b) && doc.ab_blocks_b.length) {
    const errB = validateBlocks(doc.ab_blocks_b);
    if (!errB) {
      const pct = Math.min(99, Math.max(1, doc.ab_traffic_a_percent ?? 50));
      if (Math.random() * 100 < pct) {
        blocks = doc.blocks || [];
        variant = 'A';
      } else {
        blocks = doc.ab_blocks_b;
        variant = 'B';
      }
    }
  }
  return { blocks, variant };
}

async function resolveWidgetKeys(doc) {
  const keys = { whatsapp_api_key: null, chatbot_api_key: null };
  if (doc.whatsapp_widget_config_id) {
    const wa = await WidgetConfig.findOne({
      _id: doc.whatsapp_widget_config_id,
      user_id: doc.user_id,
      mode: 'whatsapp',
      is_active: true,
    })
      .select('api_key')
      .lean();
    if (wa) keys.whatsapp_api_key = wa.api_key;
  }
  if (doc.chatbot_widget_config_id) {
    const bot = await WidgetConfig.findOne({
      _id: doc.chatbot_widget_config_id,
      user_id: doc.user_id,
      mode: 'chatbot',
      is_active: true,
    })
      .select('api_key')
      .lean();
    if (bot) keys.chatbot_api_key = bot.api_key;
  }
  return keys;
}

async function buildPublicPayload(doc) {
  const { blocks, variant } = pickAbVariant(doc);
  const widgets = await resolveWidgetKeys(doc);
  return {
    title: doc.title,
    blocks,
    widgets,
    public_id: doc.public_id,
    ab_variant: variant,
    custom_domain: doc.custom_domain || null,
  };
}

async function assertWidgetRefs(userId, waId, botId) {
  const uid = new mongoose.Types.ObjectId(userId);
  if (waId) {
    const wa = await WidgetConfig.findOne({
      _id: waId,
      user_id: uid,
      mode: 'whatsapp',
      is_active: true,
    }).lean();
    if (!wa) return 'WhatsApp widget config not found or wrong mode (need whatsapp-only, active)';
  }
  if (botId) {
    const bot = await WidgetConfig.findOne({
      _id: botId,
      user_id: uid,
      mode: 'chatbot',
      is_active: true,
    }).lean();
    if (!bot) return 'Chatbot widget config not found or wrong mode (need chatbot-only, active)';
  }
  return null;
}

async function assertWorkspaceForFunnel(funnelUserId, workspaceId) {
  if (!workspaceId) return null;
  const ws = await Workspace.findOne({
    _id: workspaceId,
    user_id: funnelUserId,
    deleted_at: null,
  }).lean();
  if (!ws) return 'Workspace not found or not owned by this account';
  return null;
}

function ownerQuery(req) {
  return { user_id: req.user._id, deleted_at: null };
}

async function saveVersionSnapshot(doc) {
  const last = await FunnelPageVersion.findOne({ funnel_page_id: doc._id })
    .sort({ version: -1 })
    .select('version')
    .lean();
  const nextV = (last?.version || 0) + 1;
  await FunnelPageVersion.create({
    funnel_page_id: doc._id,
    user_id: doc.user_id,
    version: nextV,
    snapshot: {
      title: doc.title,
      slug: doc.slug,
      blocks: doc.blocks,
      ab_test_enabled: doc.ab_test_enabled,
      ab_blocks_b: doc.ab_blocks_b,
      ab_traffic_a_percent: doc.ab_traffic_a_percent,
      whatsapp_widget_config_id: doc.whatsapp_widget_config_id,
      chatbot_widget_config_id: doc.chatbot_widget_config_id,
      workspace_id: doc.workspace_id,
      custom_domain: doc.custom_domain,
    },
  });
}

export async function list(req, res) {
  try {
    const items = await FunnelPage.find(ownerQuery(req))
      .populate('workspace_id', 'slug name')
      .sort({ updated_at: -1 })
      .lean();
    return res.json({ success: true, data: items });
  } catch (err) {
    console.error('funnel list error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

export async function getById(req, res) {
  try {
    const doc = await FunnelPage.findOne({ ...ownerQuery(req), _id: req.params.id })
      .populate('workspace_id', 'slug name')
      .lean();
    if (!doc) return res.status(404).json({ success: false, message: 'Not found' });
    return res.json({ success: true, data: doc });
  } catch (err) {
    console.error('funnel getById error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

export async function listVersions(req, res) {
  try {
    const funnelId = req.params.id;
    const exists = await FunnelPage.findOne({ ...ownerQuery(req), _id: funnelId }).select('_id').lean();
    if (!exists) return res.status(404).json({ success: false, message: 'Not found' });
    const rows = await FunnelPageVersion.find({ funnel_page_id: funnelId, user_id: req.user._id })
      .sort({ version: -1 })
      .limit(50)
      .lean();
    return res.json({ success: true, data: rows });
  } catch (err) {
    console.error('funnel listVersions error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

export async function getAnalytics(req, res) {
  try {
    const funnelId = req.params.id;
    const doc = await FunnelPage.findOne({ ...ownerQuery(req), _id: funnelId }).select('_id').lean();
    if (!doc) return res.status(404).json({ success: false, message: 'Not found' });

    const days = Math.min(90, Math.max(1, parseInt(req.query.days, 10) || 30));
    const since = new Date();
    since.setDate(since.getDate() - days);

    const pipeline = [
      { $match: { funnel_page_id: new mongoose.Types.ObjectId(funnelId), created_at: { $gte: since } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$created_at' } },
          views: { $sum: { $cond: [{ $eq: ['$event_type', 'view'] }, 1, 0] } },
          cta_clicks: { $sum: { $cond: [{ $eq: ['$event_type', 'cta_click'] }, 1, 0] } },
        },
      },
      { $sort: { _id: 1 } },
    ];
    const byDay = await FunnelAnalyticsEvent.aggregate(pipeline);

    const totals = await FunnelAnalyticsEvent.aggregate([
      { $match: { funnel_page_id: new mongoose.Types.ObjectId(funnelId), created_at: { $gte: since } } },
      {
        $group: {
          _id: null,
          views: { $sum: { $cond: [{ $eq: ['$event_type', 'view'] }, 1, 0] } },
          cta_clicks: { $sum: { $cond: [{ $eq: ['$event_type', 'cta_click'] }, 1, 0] } },
        },
      },
    ]);

    const ab = await FunnelAnalyticsEvent.aggregate([
      { $match: { funnel_page_id: new mongoose.Types.ObjectId(funnelId), created_at: { $gte: since }, ab_variant: { $in: ['A', 'B'] } } },
      { $group: { _id: '$ab_variant', count: { $sum: 1 } } },
    ]);

    return res.json({
      success: true,
      data: {
        days,
        by_day: byDay.map((d) => ({ date: d._id, views: d.views, cta_clicks: d.cta_clicks })),
        totals: totals[0] || { views: 0, cta_clicks: 0 },
        ab_split: ab.reduce((acc, row) => ({ ...acc, [row._id]: row.count }), {}),
      },
    });
  } catch (err) {
    console.error('funnel getAnalytics error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

export async function create(req, res) {
  try {
    const userId = req.user._id;
    let {
      title,
      slug,
      blocks,
      whatsapp_widget_config_id,
      chatbot_widget_config_id,
      workspace_id,
      custom_domain,
      ab_test_enabled,
      ab_blocks_b,
      ab_traffic_a_percent,
    } = req.body;
    if (!title || typeof title !== 'string' || !String(title).trim()) {
      return res.status(400).json({ success: false, message: 'title is required' });
    }
    const finalSlug = (slug && String(slug).trim()) ? String(slug).trim().toLowerCase() : slugify(title);
    if (!SLUG_RE.test(finalSlug)) {
      return res.status(400).json({ success: false, message: 'slug must be lowercase letters, numbers, and hyphens only' });
    }
    blocks = Array.isArray(blocks) ? blocks : [];
    const blockErr = validateBlocks(blocks);
    if (blockErr) return res.status(400).json({ success: false, message: blockErr });

    const waId = whatsapp_widget_config_id || null;
    const botId = chatbot_widget_config_id || null;
    const wErr = await assertWidgetRefs(userId, waId, botId);
    if (wErr) return res.status(400).json({ success: false, message: wErr });

    const wsId = workspace_id || null;
    const wsErr = await assertWorkspaceForFunnel(userId, wsId);
    if (wsErr) return res.status(400).json({ success: false, message: wsErr });

    if (custom_domain !== undefined && custom_domain !== null) {
      const cd = String(custom_domain).trim().toLowerCase();
      custom_domain = cd || null;
    }

    ab_blocks_b = Array.isArray(ab_blocks_b) ? ab_blocks_b : [];
    if (ab_blocks_b.length) {
      const errB = validateBlocks(ab_blocks_b);
      if (errB) return res.status(400).json({ success: false, message: `ab_blocks_b: ${errB}` });
    }

    const trimmedTitle = String(title).trim();
    const doc = await FunnelPage.create({
      user_id: userId,
      slug: finalSlug,
      title: trimmedTitle,
      status: 'draft',
      blocks,
      whatsapp_widget_config_id: waId || undefined,
      chatbot_widget_config_id: botId || undefined,
      workspace_id: wsId || undefined,
      custom_domain: custom_domain || undefined,
      ab_test_enabled: Boolean(ab_test_enabled),
      ab_blocks_b,
      ab_traffic_a_percent: Math.min(99, Math.max(1, parseInt(ab_traffic_a_percent, 10) || 50)),
    });
    return res.status(201).json({ success: true, data: doc.toObject() });
  } catch (err) {
    console.error('funnel create error:', err);
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: 'A funnel with this slug already exists for this scope' });
    }
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

export async function update(req, res) {
  try {
    const doc = await FunnelPage.findOne({ ...ownerQuery(req), _id: req.params.id });
    if (!doc) return res.status(404).json({ success: false, message: 'Not found' });

    const {
      title,
      slug,
      blocks,
      whatsapp_widget_config_id,
      chatbot_widget_config_id,
      status,
      workspace_id,
      custom_domain,
      ab_test_enabled,
      ab_blocks_b,
      ab_traffic_a_percent,
    } = req.body;

    if (title !== undefined) {
      if (typeof title !== 'string' || !title.trim()) {
        return res.status(400).json({ success: false, message: 'title invalid' });
      }
      doc.title = title.trim();
    }
    if (slug !== undefined) {
      const s = String(slug).trim().toLowerCase();
      if (!SLUG_RE.test(s)) {
        return res.status(400).json({ success: false, message: 'slug must be lowercase letters, numbers, and hyphens only' });
      }
      doc.slug = s;
    }
    if (blocks !== undefined) {
      const blockErr = validateBlocks(blocks);
      if (blockErr) return res.status(400).json({ success: false, message: blockErr });
      doc.blocks = blocks;
    }
    if (whatsapp_widget_config_id !== undefined) {
      doc.whatsapp_widget_config_id = whatsapp_widget_config_id || null;
    }
    if (chatbot_widget_config_id !== undefined) {
      doc.chatbot_widget_config_id = chatbot_widget_config_id || null;
    }
    if (status !== undefined) {
      if (!['draft', 'published'].includes(status)) {
        return res.status(400).json({ success: false, message: 'invalid status' });
      }
      doc.status = status;
    }
    if (workspace_id !== undefined) {
      const wsErr = await assertWorkspaceForFunnel(doc.user_id, workspace_id || null);
      if (wsErr) return res.status(400).json({ success: false, message: wsErr });
      doc.workspace_id = workspace_id || null;
    }
    if (custom_domain !== undefined) {
      const cd = String(custom_domain || '').trim().toLowerCase();
      doc.custom_domain = cd || null;
    }
    if (ab_test_enabled !== undefined) {
      doc.ab_test_enabled = Boolean(ab_test_enabled);
    }
    if (ab_blocks_b !== undefined) {
      const arr = Array.isArray(ab_blocks_b) ? ab_blocks_b : [];
      const errB = arr.length ? validateBlocks(arr) : null;
      if (errB) return res.status(400).json({ success: false, message: `ab_blocks_b: ${errB}` });
      doc.ab_blocks_b = arr;
    }
    if (ab_traffic_a_percent !== undefined) {
      doc.ab_traffic_a_percent = Math.min(99, Math.max(1, parseInt(ab_traffic_a_percent, 10) || 50));
    }

    const wErr = await assertWidgetRefs(
      req.user._id,
      doc.whatsapp_widget_config_id,
      doc.chatbot_widget_config_id
    );
    if (wErr) return res.status(400).json({ success: false, message: wErr });

    await doc.save();
    return res.json({ success: true, data: doc.toObject() });
  } catch (err) {
    console.error('funnel update error:', err);
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: 'A funnel with this slug already exists for this scope' });
    }
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

export async function publish(req, res) {
  try {
    const doc = await FunnelPage.findOne({ ...ownerQuery(req), _id: req.params.id });
    if (!doc) return res.status(404).json({ success: false, message: 'Not found' });

    const wErr = await assertWidgetRefs(
      req.user._id,
      doc.whatsapp_widget_config_id,
      doc.chatbot_widget_config_id
    );
    if (wErr) return res.status(400).json({ success: false, message: wErr });

    doc.status = 'published';
    await doc.save();
    await saveVersionSnapshot(doc);
    return res.json({ success: true, data: doc.toObject() });
  } catch (err) {
    console.error('funnel publish error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

export async function remove(req, res) {
  try {
    const doc = await FunnelPage.findOneAndUpdate(
      { ...ownerQuery(req), _id: req.params.id },
      { $set: { deleted_at: new Date() } },
      { new: true }
    );
    if (!doc) return res.status(404).json({ success: false, message: 'Not found' });
    return res.json({ success: true, message: 'Deleted' });
  } catch (err) {
    console.error('funnel remove error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

export async function getPublic(req, res) {
  try {
    const publicId = String(req.params.publicId || '').trim();
    if (!publicId || publicId.length > 80) {
      return res.status(400).json({ success: false, message: 'Invalid id' });
    }

    const doc = await FunnelPage.findOne({
      public_id: publicId,
      status: 'published',
      deleted_at: null,
    }).lean();

    if (!doc) {
      return res.status(404).json({ success: false, message: 'Funnel not found' });
    }

    const payload = await buildPublicPayload(doc);
    return res.json({ success: true, data: payload });
  } catch (err) {
    console.error('funnel getPublic error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

export async function getPublicByWorkspace(req, res) {
  try {
    const workspaceSlug = String(req.params.workspaceSlug || '').trim().toLowerCase();
    const funnelSlug = String(req.params.funnelSlug || '').trim().toLowerCase();
    if (!workspaceSlug || !funnelSlug || workspaceSlug.length > 64 || funnelSlug.length > 128) {
      return res.status(400).json({ success: false, message: 'Invalid path' });
    }

    const ws = await Workspace.findOne({ slug: workspaceSlug, deleted_at: null }).lean();
    if (!ws) return res.status(404).json({ success: false, message: 'Funnel not found' });

    const doc = await FunnelPage.findOne({
      workspace_id: ws._id,
      slug: funnelSlug,
      user_id: ws.user_id,
      status: 'published',
      deleted_at: null,
    }).lean();

    if (!doc) {
      return res.status(404).json({ success: false, message: 'Funnel not found' });
    }

    const payload = await buildPublicPayload(doc);
    return res.json({ success: true, data: payload });
  } catch (err) {
    console.error('funnel getPublicByWorkspace error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

export async function recordAnalytics(req, res) {
  try {
    const publicId = String(req.params.publicId || '').trim();
    if (!publicId || publicId.length > 80) {
      return res.status(400).json({ success: false, message: 'Invalid id' });
    }

    const funnel = await FunnelPage.findOne({
      public_id: publicId,
      status: 'published',
      deleted_at: null,
    })
      .select('_id user_id')
      .lean();
    if (!funnel) {
      return res.status(404).json({ success: false, message: 'Funnel not found' });
    }

    const event_type = req.body?.event_type === 'cta_click' ? 'cta_click' : 'view';
    const ab_variant = req.body?.ab_variant === 'B' ? 'B' : req.body?.ab_variant === 'A' ? 'A' : undefined;
    const path = String(req.body?.path || '').slice(0, 512);
    const referrer = String(req.body?.referrer || '').slice(0, 512);

    await FunnelAnalyticsEvent.create({
      funnel_page_id: funnel._id,
      user_id: funnel.user_id,
      event_type,
      ab_variant,
      path,
      referrer,
    });

    return res.json({ success: true });
  } catch (err) {
    console.error('funnel recordAnalytics error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}
