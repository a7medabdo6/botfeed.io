import { Chatbot, AIModel } from '../models/index.js';
import { buildChatbotSystemPrompt } from '../utils/chatbot-system-prompt.js';

function normalizePersonaProfile(raw) {
    if (raw == null) return null;
    if (typeof raw !== 'object' || Array.isArray(raw)) return null;
    return raw;
}

export const previewSystemPrompt = async (req, res) => {
    try {
        const {
            business_name,
            business_description,
            persona_profile,
            training_data,
            raw_training_text,
        } = req.body;

        const system_prompt = buildChatbotSystemPrompt({
            business_name,
            business_description,
            persona_profile: normalizePersonaProfile(persona_profile),
            training_data,
            raw_training_text,
        });

        return res.json({
            success: true,
            data: { system_prompt },
        });
    } catch (error) {
        console.error('Preview system prompt error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to build preview',
            error: error.message,
        });
    }
};

export const createChatbot = async (req, res) => {
    try {
        const userId = req.user.owner_id;
        const {
            waba_id,
            name,
            ai_model,
            api_key,
            business_name,
            business_description,
            persona_profile: rawPersona,
            system_prompt: bodySystemPrompt,
            use_custom_system_prompt,
        } = req.body;

        if (!waba_id || !name || !ai_model || !api_key) {
            return res.status(400).json({ success: false, message: 'waba_id, name, ai_model, and api_key are required' });
        }

        const model = await AIModel.findOne({ _id: ai_model, status: 'active', deleted_at: null });
        if (!model) {
            return res.status(404).json({
                success: false,
                message: 'AI Model not found or inactive',
            });
        }

        const persona_profile = normalizePersonaProfile(rawPersona);

        let system_prompt;
        if (use_custom_system_prompt === true && typeof bodySystemPrompt === 'string' && bodySystemPrompt.trim()) {
            system_prompt = bodySystemPrompt.trim();
        } else {
            system_prompt = buildChatbotSystemPrompt({
                business_name,
                business_description,
                persona_profile,
            });
        }

        const chatbot = await Chatbot.create({
            user_id: req.user.owner_id,
            created_by: req.user.id,
            waba_id,
            name,
            ai_model,
            api_key,
            business_name,
            business_description,
            persona_profile,
            system_prompt,
        });

        return res.status(201).json({
            success: true,
            message: 'Chatbot created successfully',
            data: chatbot,
        });
    } catch (error) {
        console.error('Create chatbot error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to create chatbot',
            error: error.message,
        });
    }
};

export const getAllChatbots = async (req, res) => {
    try {
        const userId = req.user.owner_id;
        const { waba_id } = req.query;

        if (!waba_id) {
            return res.status(400).json({ success: false, message: 'waba_id is required' });
        }

        const chatbots = await Chatbot.find({ user_id: userId, waba_id, deleted_at: null })
            .populate('ai_model', 'name display_name')
            .lean()
            .sort({ created_at: -1 });

        return res.json({
            success: true,
            data: chatbots,
        });
    } catch (error) {
        console.error('Get all chatbots error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch chatbots',
            error: error.message,
        });
    }
};

export const getChatbotById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.owner_id;

        const chatbot = await Chatbot.findOne({ _id: id, user_id: userId, deleted_at: null })
            .populate('ai_model', 'display_name provider model_id');

        if (!chatbot) {
            return res.status(404).json({
                success: false,
                message: 'Chatbot not found',
            });
        }

        return res.json({
            success: true,
            data: chatbot,
        });
    } catch (error) {
        console.error('Get chatbot by ID error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch chatbot details',
            error: error.message,
        });
    }
};

export const updateChatbot = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.owner_id;
        const updateData = req.body;

        const chatbot = await Chatbot.findOne({ _id: id, user_id: userId, deleted_at: null });

        if (!chatbot) {
            return res.status(404).json({
                success: false,
                message: 'Chatbot not found',
            });
        }

        const prevBusinessName = chatbot.business_name;
        const prevBusinessDescription = chatbot.business_description;
        const prevPersonaStr = JSON.stringify(chatbot.persona_profile || null);

        const scalarFields = ['name', 'ai_model', 'api_key', 'status', 'business_name', 'business_description'];
        scalarFields.forEach((field) => {
            if (updateData[field] !== undefined) {
                chatbot[field] = updateData[field];
            }
        });

        if (updateData.persona_profile !== undefined) {
            chatbot.persona_profile = normalizePersonaProfile(updateData.persona_profile);
        }

        const useCustom =
            updateData.use_custom_system_prompt === true &&
            typeof updateData.system_prompt === 'string' &&
            updateData.system_prompt.trim();

        const businessChanged =
            (updateData.business_name !== undefined && updateData.business_name !== prevBusinessName) ||
            (updateData.business_description !== undefined && updateData.business_description !== prevBusinessDescription);

        const personaChanged =
            updateData.persona_profile !== undefined &&
            JSON.stringify(chatbot.persona_profile || null) !== prevPersonaStr;

        const forceComposed = updateData.use_custom_system_prompt === false;

        if (useCustom) {
            chatbot.system_prompt = updateData.system_prompt.trim();
        } else if (forceComposed || businessChanged || personaChanged) {
            chatbot.system_prompt = buildChatbotSystemPrompt({
                business_name: chatbot.business_name,
                business_description: chatbot.business_description,
                training_data: chatbot.training_data,
                raw_training_text: chatbot.raw_training_text,
                persona_profile: chatbot.persona_profile,
            });
        }

        await chatbot.save();

        return res.json({
            success: true,
            message: 'Chatbot updated successfully',
            data: chatbot,
        });
    } catch (error) {
        console.error('Update chatbot error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to update chatbot',
            error: error.message,
        });
    }
};

export const deleteChatbot = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await Chatbot.deleteOne({ _id: id, user_id: req.user.owner_id });

        if (result.deletedCount === 0) {
            return res.status(404).json({
                success: false,
                message: 'Chatbot not found',
            });
        }

        return res.json({
            success: true,
            message: 'Chatbot deleted successfully',
        });
    } catch (error) {
        console.error('Delete chatbot error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to delete chatbot',
            error: error.message,
        });
    }
};

export const trainChatbot = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.owner_id;
        const { business_name, business_description, training_data, raw_training_text, knowledgeType } = req.body;

        const chatbot = await Chatbot.findOne({ _id: id, user_id: userId, deleted_at: null });

        if (!chatbot) {
            return res.status(404).json({
                success: false,
                message: 'Chatbot not found',
            });
        }

        if (business_name !== undefined) chatbot.business_name = business_name;
        if (business_description !== undefined) chatbot.business_description = business_description;
        if (knowledgeType !== undefined) chatbot.knowledge_type = knowledgeType;

        if (knowledgeType === 'q&a') {
            if (training_data !== undefined) chatbot.training_data = training_data;
        } else if (raw_training_text !== undefined) {
            chatbot.raw_training_text = raw_training_text;
        } else {
            if (training_data !== undefined) chatbot.training_data = training_data;
            if (raw_training_text !== undefined) chatbot.raw_training_text = raw_training_text;
        }

        chatbot.system_prompt = buildChatbotSystemPrompt({
            business_name: chatbot.business_name,
            business_description: chatbot.business_description,
            training_data: chatbot.training_data,
            raw_training_text: chatbot.raw_training_text,
            persona_profile: chatbot.persona_profile,
        });

        await chatbot.save();

        return res.json({
            success: true,
            message: 'Chatbot trained successfully',
            data: chatbot,
        });
    } catch (error) {
        console.error('Train chatbot error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to train chatbot',
            error: error.message,
        });
    }
};

export default {
    previewSystemPrompt,
    createChatbot,
    getAllChatbots,
    getChatbotById,
    updateChatbot,
    deleteChatbot,
    trainChatbot,
};
