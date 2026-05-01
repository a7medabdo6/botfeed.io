import {
  AutomationFlow,
  AutomationExecution,
  Chatbot,
  Contact,
  EcommerceOrder,
  GoogleAccount,
  GoogleCalendar,
  GoogleSheet,
  Message,
  Template,
  WhatsappPhoneNumber
} from '../models/index.js';
import { getCalendarClient, getSheetsClient } from './google-api-helper.js';
import { callAIModel } from './ai-utils.js';
import { runGoogleToolsChatAgent } from './ai-agent-google-tools.js';
import { resolveAiAgentFromFlow } from './ai-agent-resolve-from-flow.js';
import unifiedWhatsAppService from '../services/whatsapp/unified-whatsapp.service.js';
import { PROVIDER_TYPES } from '../services/whatsapp/unified-whatsapp.service.js';
import automationCache from './automation-cache.js';
import { v4 as uuidv4 } from 'uuid';

class AutomationEngine {
  constructor() {
    this.runningExecutions = new Map();
    this.eventListeners = new Map();
    this.initializeEventListeners();
  }


  initializeEventListeners() {
    this.eventListeners.set('message_received', this.handleMessageReceived.bind(this));

    this.eventListeners.set('contact_joined', this.handleContactJoined.bind(this));
    this.eventListeners.set('status_update', this.handleStatusUpdate.bind(this));
    this.eventListeners.set('order_received', this.handleOrderReceived.bind(this));

    console.log('Automation engine event listeners initialized:', Array.from(this.eventListeners.keys()));
  }

  async handleOrderReceived(eventData) {
    try {
      console.log("=====================handleOrderReceived called", eventData);
      const { userId } = eventData;

      let contact = null;
      try {
        if (eventData.contactId) {
          contact = await Contact.findOne({
            _id: eventData.contactId,
            created_by: userId,
            deleted_at: null
          }).lean();
        }
      } catch (contactErr) {
        console.warn('Failed to load contact for order_received:', contactErr.message);
      }

      const triggers = await automationCache.getUserActiveFlows(userId);
      console.log(`Found ${triggers.length} triggers for user ${userId}`);

      const orderTriggers = triggers.filter(t => t.event_type === 'order_received');
      console.log(`Found ${orderTriggers.length} order received triggers`);

      for (const trigger of orderTriggers) {
        let flow = automationCache.getFlow(trigger.flow_id.toString());
        if (!flow) {
          flow = await AutomationFlow.findById(trigger.flow_id).populate('user_id');
          if (flow) {
            automationCache.setFlow(trigger.flow_id.toString(), flow);
            console.log(`Loaded flow from DB and cached: ${trigger.flow_id}`);
          }
        }

        if (flow && flow.is_active && !flow.deleted_at) {
          const shouldExecute = this.checkOrderTriggerConditions(flow, eventData);
          console.log(`Should execute order flow: ${shouldExecute}`);
          if (shouldExecute) {
            await this.executeFlow(flow, {
              event_type: 'order_received',
              ...eventData,
              contact,
              timestamp: new Date()
            });
          }
        }
      }
    } catch (error) {
      console.error('Error handling order received event:', error);
    }
  }

  checkOrderTriggerConditions(flow, eventData) {
    const triggers = flow.triggers.filter(t => t.event_type === 'order_received');

    const dataObject = {
      eventType: "orderReceived",
      order_id: eventData.order_id,
      wa_order_id: eventData.wa_order_id,
      wa_message_id: eventData.wa_message_id,
      total_price: eventData.total_price,
      currency: eventData.currency,
      items_count: eventData.items_count,
      senderNumber: eventData.senderNumber,
      recipientNumber: eventData.recipientNumber,
      contactId: eventData.contactId,
      userId: eventData.userId,
      whatsappPhoneNumberId: eventData.whatsappPhoneNumberId
    };

    for (const trigger of triggers) {
      const conditions = trigger.conditions || {};
      if (Object.keys(conditions).length === 0) {
        return true;
      }

      const result = this.evaluateCondition(conditions, dataObject);
      if (result) return true;
    }

    return false;
  }


  /**
   * @returns {Promise<boolean>} true if an automation flow ran for this message (suppress keyword bot / fallback for same inbound)
   */
  async handleMessageReceived(eventData) {
    try {
      console.log("=====================handleMessageReceived called", eventData);
      const { message, senderNumber, recipientNumber, userId, messageType } = eventData;

      let contact = null;
      try {
        if (eventData.contactId) {
          contact = await Contact.findOne({
            _id: eventData.contactId,
            created_by: userId,
            deleted_at: null
          }).lean();
        } else if (senderNumber) {
          contact = await Contact.findOne({
            phone_number: senderNumber,
            created_by: userId,
            deleted_at: null
          }).lean();
        }
      } catch (contactErr) {
        console.warn('Failed to load contact for message_received:', contactErr.message);
      }

      const triggers = await automationCache.getUserActiveFlows(userId);
      console.log(`Found ${triggers.length} triggers for user ${userId}`);


      const messageTriggers = triggers.filter((t, i, arr) => t.event_type === 'message_received' && arr.findIndex(tt => String(tt.flow_id) === String(t.flow_id) && tt.event_type === 'message_received') === i);
      console.log(`Found ${messageTriggers.length} message received triggers`);

      for (const trigger of messageTriggers) {
        console.log(`Processing trigger:`, trigger);
        let flow = automationCache.getFlow(trigger.flow_id.toString());
        if (!flow) {
          flow = await AutomationFlow.findById(trigger.flow_id).populate('user_id');
          if (flow) {
            automationCache.setFlow(trigger.flow_id.toString(), flow);
            console.log(`Loaded flow from DB and cached: ${trigger.flow_id}`);
          }
        }

        if (flow && flow.is_active && !flow.deleted_at) {
          console.log(`Checking conditions for flow:`, flow.name);
          const shouldExecute = this.checkMessageTriggerConditions(flow, message, senderNumber, recipientNumber, messageType, null, eventData);
          console.log(`Should execute flow: ${shouldExecute}`);
          if (shouldExecute) {
            console.log(`Executing flow: ${flow.name} for message: ${message}`);
            try {
              await this.executeFlow(flow, {
                event_type: 'message_received',
                message,
                senderNumber,
                recipientNumber,
                userId,
                messageType,
                contactId: eventData.contactId || contact?._id?.toString() || null,
                contact,
                whatsappPhoneNumberId: eventData.whatsappPhoneNumberId,
                timestamp: new Date()
              });
            } catch (runErr) {
              console.error(`Automation flow run failed (${flow.name}):`, runErr);
              return false;
            }
            return true;
          } else {
            console.log(`Flow conditions not met for: ${flow.name}`);
          }
        } else {
          console.log(`Flow not active or deleted:`, flow?.name);
        }
      }
      return false;
    } catch (error) {
      console.error('Error handling message received event:', error);
      return false;
    }
  }


  checkMessageTriggerConditions(flow, message, senderNumber, recipientNumber, messageType, messageId, eventData = null) {
    console.log(`Checking conditions for flow: ${flow.name}`, { message, senderNumber, recipientNumber, messageType });
    const triggers = flow.triggers.filter(t => t.event_type === 'message_received');
    console.log(`Found ${triggers.length} message received triggers in flow`);

    const dataObject = {
      message: message || messageId,
      senderNumber,
      recipientNumber,
      messageType,
      eventType: "messageReceived"
    };

    if (eventData && eventData.whatsappPhoneNumberId) {
      dataObject.whatsappPhoneNumberId = eventData.whatsappPhoneNumberId;
    }

    for (const trigger of triggers) {
      const conditions = trigger.conditions || {};
      console.log(`Checking conditions:`, conditions);

      if (Object.keys(conditions).length === 0) {
        console.log('No conditions specified, triggering flow for all messages');
        return true;
      }

      const result = this.evaluateCondition(conditions, dataObject);

      console.log(`Condition evaluation result: ${result}`);
      if (result) {
        console.log(`All conditions met for flow: ${flow.name}`);
        return true;
      }
    }

    console.log(`No matching triggers found for flow: ${flow.name}`);
    return false;
  }


  async handleContactJoined(eventData) {
    console.log('Contact joined event:', eventData);
  }


  async handleStatusUpdate(eventData) {
    console.log('Status update event:', eventData);
  }


  async executeFlow(flow, inputData) {
    const executionId = uuidv4();
    try {
      const execution = await AutomationExecution.create({
        flow_id: flow._id,
        user_id: flow.user_id._id || flow.user_id,
        status: 'running',
        input_data: inputData
      });

      this.runningExecutions.set(executionId, execution._id);

      const result = await this.processWorkflow(flow, execution, inputData);

      await AutomationExecution.findByIdAndUpdate(execution._id, {
        status: result.success ? 'success' : 'failed',
        output_data: result.output,
        execution_time: result.executionTime,
        completed_at: new Date(),
        execution_log: result.executionLog
      });

      await this.updateFlowStatistics(flow._id, result.success);

      this.runningExecutions.delete(executionId);
      return result;
    } catch (error) {
      console.error('Error executing automation flow:', error);

      if (executionId) {
        await AutomationExecution.findByIdAndUpdate(
          this.runningExecutions.get(executionId),
          {
            status: 'failed',
            error: error.message,
            completed_at: new Date()
          }
        );
        this.runningExecutions.delete(executionId);
      }

      throw error;
    }
  }


  async processWorkflow(flow, execution, inputData) {
    const startTime = Date.now();
    const executionLog = [];
    let currentData = { ...inputData };

    const startNodes = this.getStartNodes(flow);
    for (const node of startNodes) {

      const nodeResult = await this.executeNode(node, flow, currentData, executionLog);
      if (nodeResult.success) {
        currentData = {
          ...currentData,
          ...nodeResult.output,
          userId: currentData.userId || inputData.userId || inputData.user_id
        };

        await this.processConnectedNodes(flow, node, currentData, executionLog, inputData);
      }
    }

    const executionTime = Date.now() - startTime;

    return {
      success: true,
      output: currentData,
      executionTime,
      executionLog
    };
  }


  getStartNodes(flow) {
    const connectedTargets = new Set();
    flow.connections.forEach(conn => {
      connectedTargets.add(conn.target);
    });

    return flow.nodes.filter(node => !connectedTargets.has(node.id) && node.type === 'trigger');
  }


  async processConnectedNodes(flow, currentNode, currentData, executionLog, originalInputData = {}) {
    const connectedNodes = this.getConnectedNodes(flow, currentNode.id);

    for (const node of connectedNodes) {
      const nodeResult = await this.executeNode(node, flow, currentData, executionLog);
      if (nodeResult.success) {
        const updatedData = {
          ...currentData,
          ...nodeResult.output,
          userId: currentData.userId || originalInputData.userId || originalInputData.user_id
        };

        await this.processConnectedNodes(flow, node, updatedData, executionLog, originalInputData);
      }
    }
  }


  getConnectedNodes(flow, nodeId) {
    const skipTargetTypes = new Set([
      'agent_chat_model',
      'agent_tool_google_calendar',
      'agent_tool_google_calendar_list',
      'agent_tool_google_calendar_create',
      'agent_tool_google_calendar_delete',
      'agent_tool_google_sheets',
      'agent_tool_google_sheets_read',
      'agent_tool_google_sheets_append',
      'agent_tool_google_sheets_update',
      'agent_memory'
    ]);

    const connectedIds = flow.connections
      .filter((conn) => {
        if (conn.source !== nodeId) return false;
        const th = conn.targetHandle;
        if (th && th !== 'tgt' && th !== 'target' && th !== 'default') return false;
        const targetNode = flow.nodes.find((n) => n.id === conn.target);
        if (targetNode && skipTargetTypes.has(targetNode.type)) return false;
        return true;
      })
      .map((conn) => conn.target);

    return flow.nodes.filter((node) => connectedIds.includes(node.id));
  }


  async executeNode(node, flow, inputData, executionLog) {
    const startTime = Date.now();
    let result = { success: false, output: {} };

    try {
      const nodeLog = {
        node_id: node.id,
        node_type: node.type,
        status: 'running',
        start_time: new Date(),
        input: inputData
      };

      switch (node.type) {
        case 'trigger':
          result = await this.executeTriggerNode(node, inputData);
          break;
        case 'condition':
          result = await this.executeConditionNode(node, inputData);
          break;
        case 'action':
          result = await this.executeActionNode(node, inputData);
          break;
        case 'delay':
          result = await this.executeDelayNode(node, inputData);
          break;
        case 'filter':
          result = await this.executeFilterNode(node, inputData);
          break;
        case 'transform':
          result = await this.executeTransformNode(node, inputData);
          break;
        case 'webhook':
          result = await this.executeWebhookNode(node, inputData);
          break;
        case 'ai_response':
          result = await this.executeAIResponseNode(node, inputData);
          break;
        case 'send_message':
          result = await this.executeSendMessageNode(node, inputData);
          break;
        case 'assign_chatbot':
          result = await this.executeAssignChatbotNode(node, inputData);
          break;
        case 'ai_agent':
          result = await this.executeAIAgentNode(node, flow, inputData);
          break;
        case 'agent_chat_model':
        case 'agent_tool_google_calendar':
        case 'agent_tool_google_calendar_list':
        case 'agent_tool_google_calendar_create':
        case 'agent_tool_google_calendar_delete':
        case 'agent_tool_google_sheets':
        case 'agent_tool_google_sheets_read':
        case 'agent_tool_google_sheets_append':
        case 'agent_tool_google_sheets_update':
        case 'agent_memory':
          result = { success: true, output: inputData };
          break;
        case 'google_sheets':
          result = await this.executeGoogleSheetsNode(node, inputData);
          break;
        case 'calendar_event':
          result = await this.executeCalendarEventNode(node, inputData);
          break;
        case 'add_tag':
          result = await this.executeAddTagNode(node, inputData);
          break;
        case 'update_contact':
          result = await this.executeUpdateContactNode(node, inputData);
          break;
        case 'custom':
          result = await this.executeCustomNode(node, inputData);
          break;
        default:
          throw new Error(`Unknown node type: ${node.type}`);
      }

      nodeLog.status = result.success ? 'success' : 'failed';
      nodeLog.output = result.output;
      nodeLog.end_time = new Date();
      nodeLog.error = result.error || null;

      executionLog.push(nodeLog);

      return result;
    } catch (error) {
      const nodeLog = {
        node_id: node.id,
        node_type: node.type,
        status: 'failed',
        start_time: new Date(),
        end_time: new Date(),
        input: inputData,
        output: {},
        error: error.message
      };
      executionLog.push(nodeLog);

      return { success: false, output: {}, error: error.message };
    }
  }


  async executeTriggerNode(node, inputData) {
    return { success: true, output: inputData };
  }


  async executeConditionNode(node, inputData) {
    const { condition } = node.parameters || {};
    if (!condition) {
      return { success: true, output: inputData };
    }

    try {
      const result = this.evaluateCondition(condition, inputData);
      return { success: result, output: { ...inputData, conditionResult: result } };
    } catch (error) {
      return { success: false, output: {}, error: error.message };
    }
  }


  evaluateCondition(condition, data) {
    const { field, operator, value } = condition;

    if (!field || !operator || value === undefined) {
      return true;
    }

    const fieldValue = this.getNestedValue(data, field);

    switch (operator) {
      case 'equals':
        return fieldValue == value;
      case 'not_equals':
        return fieldValue != value;
      case 'contains':
        return String(fieldValue).includes(String(value));
      case 'not_contains':
        return !String(fieldValue).includes(String(value));
      case 'starts_with':
        return String(fieldValue).startsWith(String(value));
      case 'ends_with':
        return String(fieldValue).endsWith(String(value));
      case 'greater_than':
        return Number(fieldValue) > Number(value);
      case 'less_than':
        return Number(fieldValue) < Number(value);
      case 'greater_than_or_equal':
        return Number(fieldValue) >= Number(value);
      case 'less_than_or_equal':
        return Number(fieldValue) <= Number(value);
      case 'is_empty':
        return !fieldValue || fieldValue === '';
      case 'is_not_empty':
        return !!fieldValue && fieldValue !== '';
      case 'contains_any':
        if (!Array.isArray(value)) {
          return false;
        }
        return value.some(v => String(fieldValue).toLowerCase().includes(String(v).toLowerCase()));
      default:
        return true;
    }
  }


  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }


  async executeActionNode(node, inputData) {
    const { action_type, parameters } = node.parameters || {};

    switch (action_type) {
      case 'log':
        console.log('Automation log:', parameters?.message || 'Action executed', inputData);
        break;
      case 'set_variable':
        const { variable_name, variable_value } = parameters || {};
        if (variable_name) {
          inputData[variable_name] = variable_value;
        }
        break;
      default:
        break;
    }

    return { success: true, output: inputData };
  }


  async executeDelayNode(node, inputData) {
    const { delay_ms } = node.parameters || { delay_ms: 1000 };

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, output: inputData });
      }, delay_ms);
    });
  }


  async executeFilterNode(node, inputData) {
    const { filter_condition } = node.parameters || {};

    if (!filter_condition) {
      return { success: true, output: inputData };
    }

    const shouldPass = this.evaluateCondition(filter_condition, inputData);
    return { success: shouldPass, output: shouldPass ? inputData : {} };
  }


  async executeTransformNode(node, inputData) {
    const { transform_type, mapping } = node.parameters || {};

    let output = { ...inputData };

    if (transform_type === 'field_mapping' && mapping) {
      for (const [targetField, sourceField] of Object.entries(mapping)) {
        output[targetField] = this.getNestedValue(inputData, sourceField);
      }
    }

    return { success: true, output };
  }


  async executeWebhookNode(node, inputData) {
    const { url, method, headers, body } = node.parameters || {};

    if (!url) {
      return { success: false, output: inputData, error: 'Webhook URL is required' };
    }

    try {
      // const fetch = (await import('node-fetch')).default;

      const processedBody = this.processTemplateString(JSON.stringify(body || {}), inputData);
      const processedUrl = this.processTemplateString(url, inputData);
      const processedHeaders = this.processHeaders(headers || {}, inputData);

      const response = await fetch(processedUrl, {
        method: method || 'POST',
        headers: processedHeaders,
        body: processedBody
      });

      const responseText = await response.text();
      const responseJson = this.isJsonString(responseText) ? JSON.parse(responseText) : responseText;

      return {
        success: response.ok,
        output: { ...inputData, webhook_response: responseJson, webhook_status: response.status }
      };
    } catch (error) {
      return { success: false, output: inputData, error: error.message };
    }
  }


  processTemplateString(template, data) {
    return template.replace(/\{\{([^{}]+)\}\}/g, (match, path) => {
      const value = this.getNestedValue(data, path.trim());
      if (value === undefined || value === null) return match;
      if (value instanceof Date) return value.toISOString();
      return String(value);
    });
  }


  processHeaders(headers, data) {
    const processedHeaders = {};
    for (const [key, value] of Object.entries(headers)) {
      processedHeaders[key] = this.processTemplateString(value, data);
    }
    return processedHeaders;
  }


  isJsonString(str) {
    try {
      JSON.parse(str);
      return true;
    } catch (e) {
      return false;
    }
  }


  async executeAIResponseNode(node, inputData) {
    const { ai_model, prompt_template, api_key } = node.parameters || {};

    if (!ai_model || !prompt_template) {
      return { success: false, output: inputData, error: 'AI model and prompt are required' };
    }

    try {
      const processedPrompt = this.processTemplateString(prompt_template, inputData);

      const aiResponse = `AI response for: ${processedPrompt.substring(0, 50)}...`;

      return {
        success: true,
        output: { ...inputData, ai_response: aiResponse }
      };
    } catch (error) {
      return { success: false, output: inputData, error: error.message };
    }
  }


  async executeAssignChatbotNode(node, inputData) {
    const { chatbot_id, session_duration_hours } = node.parameters || {};

    if (!chatbot_id) {
      return { success: false, output: inputData, error: 'chatbot_id is required' };
    }

    const userId = inputData.userId || inputData.user_id;
    const senderNumber = inputData.senderNumber;
    if (!userId || !senderNumber) {
      return { success: false, output: inputData, error: 'userId and senderNumber are required' };
    }

    const chatbot = await Chatbot.findOne({
      _id: chatbot_id,
      user_id: userId,
      deleted_at: null
    }).populate('ai_model');

    if (!chatbot) {
      return { success: false, output: inputData, error: 'Chatbot not found' };
    }

    const modelDoc = chatbot.ai_model;
    if (!modelDoc || !modelDoc.provider) {
      return { success: false, output: inputData, error: 'Chatbot AI model is missing or invalid' };
    }

    const incomingText = inputData.message || '';
    const prompt = `${chatbot.system_prompt || ''}\n\nCustomer: ${incomingText}`;

    let replyText;
    try {
      const plainModel = typeof modelDoc.toObject === 'function' ? modelDoc.toObject() : modelDoc;
      replyText = await callAIModel(userId, plainModel, chatbot.api_key, prompt);
    } catch (e) {
      return { success: false, output: inputData, error: e.message };
    }

    const messageParams = {
      recipientNumber: senderNumber,
      providerType: PROVIDER_TYPES.BUSINESS_API,
      messageType: 'text',
      messageText: String(replyText || '').trim() || 'Sorry, I could not generate a reply.'
    };

    if (inputData.whatsappPhoneNumberId) {
      const whatsappPhoneNumber = await WhatsappPhoneNumber.findById(inputData.whatsappPhoneNumberId)
        .populate('waba_id')
        .lean();

      if (whatsappPhoneNumber && whatsappPhoneNumber.waba_id) {
        messageParams.whatsappPhoneNumber = whatsappPhoneNumber;
      }
    } else if (inputData.whatsappConnectionId) {
      messageParams.connectionId = inputData.whatsappConnectionId;
    }

    try {
      await unifiedWhatsAppService.sendMessage(userId, messageParams);
    } catch (error) {
      return { success: false, output: inputData, error: error.message };
    }

    const hours = Number(session_duration_hours) || 0;
    const contactId = inputData.contactId || inputData.contact?._id;
    if (hours > 0 && contactId) {
      const expiresAt = new Date(Date.now() + hours * 3600000);
      await Contact.updateOne(
        { _id: contactId, created_by: userId },
        {
          $set: {
            'custom_fields.automation_chatbot_session': {
              chatbot_id: String(chatbot._id),
              expires_at: expiresAt.toISOString()
            }
          }
        }
      ).catch(() => {});
    }

    return {
      success: true,
      output: {
        ...inputData,
        chatbot_reply_sent: true,
        chatbot_id: String(chatbot._id)
      }
    };
  }


  async executeAIAgentNode(node, flow, inputData) {
    const p = node.parameters || {};

    const userId = inputData.userId || inputData.user_id;
    const senderNumber = inputData.senderNumber;
    if (!userId || !senderNumber) {
      return { success: false, output: inputData, error: 'userId and senderNumber are required' };
    }

    const resolved = await resolveAiAgentFromFlow(flow, node, userId);
    if (!resolved.chatbotId) {
      return {
        success: false,
        output: inputData,
        error: 'Connect a Chat Model node to this AI Agent (port “Chat model”), or set chatbot on the agent (legacy).'
      };
    }
    if (!resolved.tools.length) {
      return {
        success: false,
        output: inputData,
        error: 'Connect at least one Tool node to this AI Agent (port “Tools”), or enable tools on the agent (legacy).'
      };
    }

    const chatbot = await Chatbot.findOne({
      _id: resolved.chatbotId,
      user_id: userId,
      deleted_at: null
    }).populate('ai_model');

    if (!chatbot) {
      return { success: false, output: inputData, error: 'Chatbot not found' };
    }

    const modelDoc = chatbot.ai_model;
    if (!modelDoc || !modelDoc.provider) {
      return { success: false, output: inputData, error: 'Chatbot AI model is missing or invalid' };
    }

    const incomingText = inputData.message || '';
    const plainModel = typeof modelDoc.toObject === 'function' ? modelDoc.toObject() : modelDoc;

    let replyText;
    let toolLog = [];
    try {
      const flowAgentInstructions = String(p.agent_instructions || p.extra_system_prompt || '').trim();

      const out = await runGoogleToolsChatAgent({
        userId,
        model: plainModel,
        apiKey: chatbot.api_key,
        systemPrompt: chatbot.system_prompt || '',
        extraSystemPrompt: flowAgentInstructions,
        userMessage: incomingText,
        inputData,
        tools: resolved.tools,
        dispatchTool: resolved.dispatchTool
      });
      replyText = out.text;
      toolLog = out.toolLog || [];
    } catch (e) {
      return { success: false, output: inputData, error: e.message };
    }

    const messageParams = {
      recipientNumber: senderNumber,
      providerType: PROVIDER_TYPES.BUSINESS_API,
      messageType: 'text',
      messageText: String(replyText || '').trim() || 'Sorry, I could not complete that request.'
    };

    if (inputData.whatsappPhoneNumberId) {
      const whatsappPhoneNumber = await WhatsappPhoneNumber.findById(inputData.whatsappPhoneNumberId)
        .populate('waba_id')
        .lean();

      if (whatsappPhoneNumber && whatsappPhoneNumber.waba_id) {
        messageParams.whatsappPhoneNumber = whatsappPhoneNumber;
      }
    } else if (inputData.whatsappConnectionId) {
      messageParams.connectionId = inputData.whatsappConnectionId;
    }

    try {
      await unifiedWhatsAppService.sendMessage(userId, messageParams);
    } catch (error) {
      return { success: false, output: inputData, error: error.message };
    }

    const hours = Number(p.session_duration_hours) || 0;
    const contactId = inputData.contactId || inputData.contact?._id;
    if (hours > 0 && contactId) {
      const expiresAt = new Date(Date.now() + hours * 3600000);
      await Contact.updateOne(
        { _id: contactId, created_by: userId },
        {
          $set: {
            'custom_fields.automation_chatbot_session': {
              chatbot_id: String(chatbot._id),
              expires_at: expiresAt.toISOString()
            }
          }
        }
      ).catch(() => {});
    }

    return {
      success: true,
      output: {
        ...inputData,
        ai_agent_reply_sent: true,
        ai_agent_tool_log: toolLog,
        chatbot_id: String(chatbot._id)
      }
    };
  }


  async executeGoogleSheetsNode(node, inputData) {
    const p = node.parameters || {};
    const { google_account_id, sheet_db_id, sheet_tab_name, column_mappings } = p;
    const userId = inputData.userId || inputData.user_id;
    if (!userId) {
      return { success: false, output: inputData, error: 'User ID is required' };
    }
    if (!google_account_id || !sheet_db_id) {
      return { success: false, output: inputData, error: 'Google account and spreadsheet are required' };
    }
    const mappings = Array.isArray(column_mappings) ? column_mappings : [];
    if (!mappings.length) {
      return { success: false, output: inputData, error: 'At least one column mapping is required' };
    }

    const account = await GoogleAccount.findOne({
      _id: google_account_id,
      user_id: userId,
      deleted_at: null
    });
    if (!account) {
      return { success: false, output: inputData, error: 'Google account not found' };
    }

    const sheet = await GoogleSheet.findOne({
      _id: sheet_db_id,
      google_account_id,
      deleted_at: null
    });
    if (!sheet) {
      return { success: false, output: inputData, error: 'Spreadsheet not found' };
    }

    const tab = String(sheet_tab_name || 'Sheet1').replace(/'/g, '');
    const rowValues = mappings.map((m) =>
      this.processTemplateString(String(m.value_template ?? m.value ?? ''), inputData)
    );

    try {
      const sheetsClient = await getSheetsClient(google_account_id);
      await sheetsClient.spreadsheets.values.append({
        spreadsheetId: sheet.sheet_id,
        range: `${tab}!A1`,
        valueInputOption: 'USER_ENTERED',
        insertDataOption: 'INSERT_ROWS',
        requestBody: { values: [rowValues] }
      });
      return {
        success: true,
        output: { ...inputData, google_sheets_row_appended: true }
      };
    } catch (error) {
      return { success: false, output: inputData, error: error.message };
    }
  }


  async executeCalendarEventNode(node, inputData) {
    const p = node.parameters || {};
    const { google_account_id, calendar_db_id, event_title, start, end, description } = p;
    const userId = inputData.userId || inputData.user_id;
    if (!userId) {
      return { success: false, output: inputData, error: 'User ID is required' };
    }
    if (!google_account_id || !calendar_db_id) {
      return { success: false, output: inputData, error: 'Google account and calendar are required' };
    }

    const account = await GoogleAccount.findOne({
      _id: google_account_id,
      user_id: userId,
      deleted_at: null
    });
    if (!account) {
      return { success: false, output: inputData, error: 'Google account not found' };
    }

    const cal = await GoogleCalendar.findOne({
      _id: calendar_db_id,
      google_account_id,
      deleted_at: null
    });
    if (!cal) {
      return { success: false, output: inputData, error: 'Calendar not found' };
    }

    const summary = this.processTemplateString(String(event_title || ''), inputData);
    const desc = this.processTemplateString(String(description || ''), inputData);
    const startDt = this.processTemplateString(String(start || ''), inputData);
    let endDt = this.processTemplateString(String(end || ''), inputData);

    if (!String(startDt || '').trim()) {
      return { success: false, output: inputData, error: 'Start time is required' };
    }

    if (!String(endDt || '').trim()) {
      const d = new Date(startDt);
      if (Number.isNaN(d.getTime())) {
        return { success: false, output: inputData, error: 'Invalid start time' };
      }
      endDt = new Date(d.getTime() + 30 * 60 * 1000).toISOString();
    }

    try {
      const calendarClient = await getCalendarClient(google_account_id);
      await calendarClient.events.insert({
        calendarId: cal.calendar_id,
        requestBody: {
          summary: summary || 'Event',
          description: desc || undefined,
          start: { dateTime: startDt },
          end: { dateTime: endDt }
        }
      });
      return {
        success: true,
        output: { ...inputData, google_calendar_event_created: true }
      };
    } catch (error) {
      return { success: false, output: inputData, error: error.message };
    }
  }


  async executeSendMessageNode(node, inputData) {
    const {
      recipient,
      message_template,
      media_url,
      buttons,
      interactive_type,
      button_params,
      list_params,
      provider_type,
      messageType,
      location_params,
      template_id
    } = node.parameters || {};

    if (!recipient) {
      return { success: false, output: inputData, error: 'Recipient is required' };
    }

    try {
      const userId = inputData.userId || inputData.user_id;
      if (!userId) {
        console.error('No userId found in inputData:', inputData);
        return { success: false, output: inputData, error: 'User ID is required to send message' };
      }

      const processedRecipient = this.processTemplateString(recipient, inputData);

      const messageParams = {
        recipientNumber: processedRecipient,
        providerType: provider_type || PROVIDER_TYPES.BUSINESS_API
      };

      if (template_id) {
        const tpl = await Template.findOne({
          _id: template_id,
          user_id: userId,
          deleted_at: null
        }).lean();

        if (!tpl) {
          return { success: false, output: inputData, error: 'Template not found' };
        }

        messageParams.messageType = 'template';
        messageParams.templateName = tpl.template_name;
        messageParams.languageCode = tpl.language || 'en_US';
        messageParams.templateObj = tpl;
      } else if (messageType === 'location' && location_params) {
        messageParams.messageType = 'location';
        messageParams.locationParams = {
          latitude: location_params.latitude,
          longitude: location_params.longitude,
          name: location_params.name || this.processTemplateString(location_params.name || '', inputData),
          address: location_params.address || this.processTemplateString(location_params.address || '', inputData)
        };
      } else {
        if (message_template) {
          const processedMessage = this.processTemplateString(message_template, inputData);
          messageParams.messageText = processedMessage;
        }
      }
      console.log("media_url" , media_url)
      if (media_url) {
        messageParams.mediaUrl = media_url;
        messageParams.file = {
          originalname: 'media',
          mimetype: this.getMimeTypeFromUrl(media_url),
          buffer: null,
          url: media_url
        };
      }

      if (interactive_type) {
        messageParams.messageType = 'interactive';
        messageParams.interactiveType = interactive_type;

        if (interactive_type === 'button' && button_params) {
          messageParams.buttonParams = button_params.map(btn => ({
            title: this.processTemplateString(btn.title, inputData),
            id: this.processTemplateString(btn.id, inputData)
          }));
        } else if (interactive_type === 'list' && list_params) {
          messageParams.listParams = {
            header: this.processTemplateString(list_params.header || '', inputData),
            body: this.processTemplateString(list_params.body || message_template || '', inputData),
            footer: this.processTemplateString(list_params.footer || '', inputData),
            buttonTitle: this.processTemplateString(list_params.buttonTitle || 'Select', inputData),
            sectionTitle: this.processTemplateString(list_params.sectionTitle || 'Options', inputData),
            items: (list_params.items || []).map(item => ({
              title: this.processTemplateString(item.title, inputData),
              description: this.processTemplateString(item.description || '', inputData),
              id: this.processTemplateString(item.id || item.title, inputData)
            }))
          };
        } else if (interactive_type === 'cta_url' && node.parameters.cta_url_params) {
          const c = node.parameters.cta_url_params;
          messageParams.ctaUrlParams = {
            display_text: this.processTemplateString(String(c.display_text || 'Open'), inputData),
            url: this.processTemplateString(String(c.url || ''), inputData)
          };
          if (message_template) {
            messageParams.messageText = this.processTemplateString(message_template, inputData);
          }
        }
      } else if (buttons && Array.isArray(buttons) && buttons.length > 0 && buttons.length <= 3) {
        messageParams.buttons = buttons;
        messageParams.messageType = 'interactive';
        messageParams.interactiveType = 'button';
        messageParams.buttonParams = buttons.map(btn => ({
          id: btn.id,
          title: btn.text
        }));
      } else {
        if (messageParams.file) {
          const mime = messageParams.file.mimetype;
          if (mime.startsWith('image')) messageParams.messageType = 'image';
          else if (mime.startsWith('video')) messageParams.messageType = 'video';
          else if (mime.startsWith('audio')) messageParams.messageType = 'audio';
          else messageParams.messageType = 'document';
        } else if (!messageParams.messageType) {
          messageParams.messageType = 'text';
        }
      }


      if (inputData.whatsappPhoneNumberId) {
        const whatsappPhoneNumber = await WhatsappPhoneNumber.findById(inputData.whatsappPhoneNumberId)
          .populate('waba_id')
          .lean();

        if (whatsappPhoneNumber && whatsappPhoneNumber.waba_id) {
          messageParams.whatsappPhoneNumber = whatsappPhoneNumber;
        }
      } else if (inputData.whatsappConnectionId) {
        messageParams.connectionId = inputData.whatsappConnectionId;
      }

      const result = await unifiedWhatsAppService.sendMessage(userId, messageParams);

      return {
        success: true,
        output: {
          ...inputData,
          message_sent: true,
          sent_to: processedRecipient,
          provider: result.provider,
          message_id: result.messageId
        }
      };
    } catch (error) {
      return { success: false, output: inputData, error: error.message };
    }
  }


  getMimeTypeFromUrl(url) {
    const lowerUrl = url.toLowerCase();
    if (lowerUrl.includes('.jpg') || lowerUrl.includes('.jpeg')) return 'image/jpeg';
    if (lowerUrl.includes('.png')) return 'image/png';
    if (lowerUrl.includes('.mp4')) return 'video/mp4';
    if (lowerUrl.includes('.mp3')) return 'audio/mp3';
    if (lowerUrl.includes('.pdf')) return 'application/pdf';
    return 'application/octet-stream';
  }

  async executeAddTagNode(node, inputData) {
    const { tag_name } = node.parameters || {};

    if (!tag_name) {
      return { success: false, output: inputData, error: 'Tag name is required' };
    }


    return {
      success: true,
      output: { ...inputData, tag_added: tag_name }
    };
  }


  async executeUpdateContactNode(node, inputData) {
    const { updates } = node.parameters || {};

    const userId = inputData.userId || inputData.user_id;
    const contactId = inputData.contactId || inputData.contact?._id;

    if (!userId) {
      return { success: false, output: inputData, error: 'User ID is required to update contact' };
    }
    if (!contactId) {
      return { success: false, output: inputData, error: 'contactId is required to update contact' };
    }

    const resolvedUpdates = {};
    for (const [key, value] of Object.entries(updates || {})) {
      if (typeof value === 'string') {
        resolvedUpdates[key] = this.processTemplateString(value, inputData);
      } else {
        resolvedUpdates[key] = value;
      }
    }

    try {
      await Contact.updateOne(
        { _id: contactId, created_by: userId, deleted_at: null },
        { $set: resolvedUpdates }
      );

      const updatedContact = await Contact.findOne({
        _id: contactId,
        created_by: userId,
        deleted_at: null
      }).lean();

      return {
        success: true,
        output: {
          ...inputData,
          contact: updatedContact,
          contactId: updatedContact?._id?.toString() || contactId,
          contact_updated: resolvedUpdates
        }
      };
    } catch (err) {
      return { success: false, output: inputData, error: err.message };
    }
  }


  async executeCustomNode(node, inputData) {
    const { custom_logic, parameters } = node.parameters || {};

    console.log('Executing custom node:', custom_logic);

    if (custom_logic === 'update_order_status') {
      const userId = inputData.userId || inputData.user_id;
      const orderId = this.processTemplateString(parameters?.order_id || '', inputData);
      const status = parameters?.status;

      if (!userId) {
        return { success: false, output: inputData, error: 'User ID is required to update order status' };
      }
      if (!orderId) {
        return { success: false, output: inputData, error: 'order_id is required' };
      }
      if (!status) {
        return { success: false, output: inputData, error: 'status is required' };
      }

      const updated = await EcommerceOrder.findOneAndUpdate(
        { _id: orderId, user_id: userId, deleted_at: null },
        { $set: { status } },
        { new: true }
      ).lean();

      return {
        success: !!updated,
        output: { ...inputData, order: updated, order_status_updated: status },
        ...(updated ? {} : { error: 'Order not found' })
      };
    }

    return {
      success: true,
      output: { ...inputData, custom_executed: true }
    };
  }


  async updateFlowStatistics(flowId, success) {
    try {
      const update = {
        $inc: {
          'statistics.total_executions': 1,
          'statistics.average_execution_time': 0
        }
      };

      if (success) {
        update.$inc['statistics.successful_executions'] = 1;
      } else {
        update.$inc['statistics.failed_executions'] = 1;
      }

      update.$set = { 'statistics.last_execution': new Date() };

      await AutomationFlow.findByIdAndUpdate(flowId, update);
    } catch (error) {
      console.error('Error updating flow statistics:', error);
    }
  }


  async triggerEvent(eventType, eventData) {
    console.log('Triggering event:', eventType, 'with data:', eventData);
    const handler = this.eventListeners.get(eventType);
    if (handler) {
      console.log('Found handler for event:', eventType);
      return await handler(eventData);
    }
    console.log('No handler found for event:', eventType, 'Available handlers:', Array.from(this.eventListeners.keys()));
    return undefined;
  }


  getRunningExecutions() {
    return Array.from(this.runningExecutions.values());
  }


  async cancelExecution(executionId) {
    if (this.runningExecutions.has(executionId)) {
      await AutomationExecution.findByIdAndUpdate(
        this.runningExecutions.get(executionId),
        { status: 'cancelled', completed_at: new Date() }
      );
      this.runningExecutions.delete(executionId);
    }
  }
}

const automationEngine = new AutomationEngine();

export default automationEngine;
