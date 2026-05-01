import WidgetConfig from '../models/widget-config.model.js';
import WebConversation from '../models/web-conversation.model.js';
import WebMessage from '../models/web-message.model.js';
import { v4 as uuidv4 } from 'uuid';

export async function getConfig(req, res) {
  try {
    const widget = await WidgetConfig.findOne({ api_key: req.params.apiKey, is_active: true })
      .select('mode whatsapp_number prefill_message wa_style welcome_message placeholder_text primary_color position bubble_icon title subtitle escalate_to_human')
      .lean();
    if (!widget) return res.status(404).json({ success: false, message: 'Widget not found' });
    return res.json({ success: true, data: widget });
  } catch (err) {
    console.error('getConfig error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

export async function createOrResumeSession(req, res) {
  try {
    const widget = await WidgetConfig.findOne({ api_key: req.params.apiKey, is_active: true });
    if (!widget) return res.status(404).json({ success: false, message: 'Widget not found' });

    let visitorId = req.body.visitor_id;
    if (!visitorId) visitorId = uuidv4();

    let conversation = await WebConversation.findOne({ widget_config_id: widget._id, visitor_id: visitorId });
    if (!conversation) {
      conversation = await WebConversation.create({
        widget_config_id: widget._id,
        user_id: widget.user_id,
        visitor_id: visitorId,
        visitor_name: req.body.visitor_name || '',
        visitor_email: req.body.visitor_email || '',
        metadata: {
          user_agent: req.headers['user-agent'] || '',
          referrer: req.body.referrer || '',
          page_url: req.body.page_url || '',
          ip: req.ip || '',
        },
      });
    }

    return res.json({
      success: true,
      data: {
        conversation_id: conversation._id,
        visitor_id: visitorId,
        status: conversation.status,
      },
    });
  } catch (err) {
    console.error('createOrResumeSession error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

export async function getMessages(req, res) {
  try {
    const widget = await WidgetConfig.findOne({ api_key: req.params.apiKey, is_active: true });
    if (!widget) return res.status(404).json({ success: false, message: 'Widget not found' });

    const conversation = await WebConversation.findOne({
      widget_config_id: widget._id,
      visitor_id: req.params.visitorId,
    });
    if (!conversation) return res.json({ success: true, data: [] });

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
    console.error('getMessages error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}
