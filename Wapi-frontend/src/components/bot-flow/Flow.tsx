/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { ROUTES } from "@/src/constants/route";
import { Button } from "@/src/elements/ui/button";
import { Input } from "@/src/elements/ui/input";
import { useCreateAutomationFlowMutation, useGetAutomationFlowQuery, useUpdateAutomationFlowMutation } from "@/src/redux/api/automationApi";
import { useAppDispatch, useAppSelector } from "@/src/redux/hooks";
import { setSidebarToggle } from "@/src/redux/reducers/layoutSlice";
import { addEdge, Background, BackgroundVariant, Controls, MiniMap, ReactFlow, useEdgesState, useNodesState, useReactFlow, type Connection, type Node } from "@xyflow/react";
import { ChevronLeft, ChevronRight, Save, Target } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { NODETEMPLATES } from "@/src/data/SidebarList";
import { AGENT_SUPPLIER_NODE_TYPE_SET, isAgentGoogleCalendarToolNodeType, isAgentGoogleSheetsToolNodeType } from "./agentSupplierNodeTypes";
import { CustomEdge } from "./edges/CustomEdge";
import { CustomNode } from "./nodes/CustomNode";

const edgeTypes = {
  custom: CustomEdge,
};

const nodeTypes = {
  custom: CustomNode,
};

const FlowCanvas = () => {
  const router = useRouter();
  const params = useParams();
  const dispatch = useAppDispatch();
  const flowId = params?.id as string;

  const [nodes, setNodes, onNodesChange] = useNodesState<any>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<any>([]);
  const [isDrawerCollapsed, setIsDrawerCollapsed] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [flowName, setFlowName] = useState("New Flow");
  const [forceValidation, setForceValidation] = useState(false);
  const { screenToFlowPosition, setViewport } = useReactFlow();

  const { data: flowData, isLoading: isLoadingFlow } = useGetAutomationFlowQuery(flowId, {
    skip: !flowId,
  });

  const [createFlow, { isLoading: isCreating }] = useCreateAutomationFlowMutation();
  const [updateFlow, { isLoading: isUpdating }] = useUpdateAutomationFlowMutation();

  useEffect(() => {
    dispatch(setSidebarToggle(true));

    return () => {
      dispatch(setSidebarToggle(false));
    };
  }, [dispatch]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsDrawerCollapsed(true);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => ({
        ...node,
        data: {
          ...node.data,
          forceValidation,
        },
      }))
    );
  }, [forceValidation, setNodes]);

  const defaultNodeDataFromTemplate = useCallback((template: (typeof NODETEMPLATES)[0]) => {
    const base: Record<string, unknown> = {
      nodeType: template.id,
      label: template.label,
      description: template.description,
      icon: template.icon,
      color: template.color,
      messageType: "Simple text",
      message: "",
      forceValidation: false,
    };
    if (template.id === "assign_chatbot") {
      return {
        ...base,
        messageType: undefined,
        message: undefined,
        stepName: "",
        chatbotId: "",
        sessionDurationHours: "0",
      };
    }
    if (template.id === "ai_agent") {
      return {
        ...base,
        messageType: undefined,
        message: undefined,
        stepName: "",
        sessionDurationHours: "0",
      };
    }
    if (template.id === "agent_chat_model") {
      return { ...base, messageType: undefined, message: undefined, chatbotId: "" };
    }
    if (
      template.id === "agent_tool_google_calendar_list" ||
      template.id === "agent_tool_google_calendar_create" ||
      template.id === "agent_tool_google_calendar_delete"
    ) {
      return {
        ...base,
        messageType: undefined,
        message: undefined,
        googleAccountId: "",
        calendarDbId: "",
      };
    }
    if (template.id === "agent_tool_google_calendar") {
      return {
        ...base,
        messageType: undefined,
        message: undefined,
        googleAccountId: "",
        calendarDbId: "",
        toolCalendarList: true,
        toolCalendarCreate: true,
      };
    }
    if (template.id === "agent_tool_google_sheets_read") {
      return {
        ...base,
        messageType: undefined,
        message: undefined,
        googleAccountId: "",
        sheetDbId: "",
        sheetTabName: "Sheet1",
        sheetsReadRangeA1: "",
      };
    }
    if (template.id === "agent_tool_google_sheets_append" || template.id === "agent_tool_google_sheets_update") {
      return {
        ...base,
        messageType: undefined,
        message: undefined,
        googleAccountId: "",
        sheetDbId: "",
        sheetTabName: "Sheet1",
      };
    }
    if (template.id === "agent_tool_google_sheets") {
      return {
        ...base,
        messageType: undefined,
        message: undefined,
        googleAccountId: "",
        sheetDbId: "",
        sheetTabName: "Sheet1",
      };
    }
    if (template.id === "google_sheets") {
      return {
        ...base,
        messageType: undefined,
        message: undefined,
        stepName: "",
        googleAccountId: "",
        sheetDbId: "",
        sheetTabName: "Sheet1",
        columnMappings: [{ columnName: "Message", value: "{{message}}" }],
      };
    }
    if (template.id === "calendar_event") {
      return {
        ...base,
        messageType: undefined,
        message: undefined,
        googleAccountId: "",
        calendarDbId: "",
        eventTitle: "",
        startTime: "",
        endTime: "",
        eventDescription: "",
      };
    }
    if (template.id === "quick_reply") {
      return { ...base, buttons: [] };
    }
    if (template.id === "send_template") {
      return { ...base, messageType: undefined, message: undefined, stepName: "", templateId: "" };
    }
    if (template.id === "call_to_action") {
      return {
        ...base,
        messageType: undefined,
        message: undefined,
        stepName: "",
        valueText: "",
        buttonText: "",
        buttonLink: "",
      };
    }
    if (template.id === "text_message") {
      return { ...base, stepName: "" };
    }
    return base;
  }, []);

  const validateFlow = useCallback(() => {
    if (nodes.length === 0) return false;
    if (edges.length === 0 && nodes.length > 1) return false;
    if (edges.length === 0) return false;

    const allNodesValid = nodes.every((node) => {
      if (node.data.nodeType === "trigger") {
        return node.data.contactType && node.data.triggerType && (node.data.triggerType === "any message" || node.data.triggerType === "order received" || (node.data.keywords && node.data.keywords.length > 0));
      }
      if (node.data.nodeType === "text_message" || node.data.nodeType === "send-message") {
        return node.data.message && node.data.message.trim();
      }
      if (node.data.nodeType === "button_message" || node.data.nodeType === "quick_reply") {
        return node.data.message?.trim() && node.data.buttons?.length > 0 && node.data.buttons.every((b: any) => b.text?.trim());
      }
      if (node.data.nodeType === "send_template") {
        return !!(node.data.templateId && String(node.data.templateId).trim());
      }
      if (node.data.nodeType === "call_to_action") {
        return (
          node.data.valueText?.trim() &&
          node.data.buttonText?.trim() &&
          node.data.buttonLink?.trim()
        );
      }
      if (node.data.nodeType === "list_message") {
        return node.data.bodyText?.trim() && node.data.buttonText?.trim() && node.data.sections?.length > 0;
      }
      if (node.data.nodeType === "media_message") {
        return node.data.mediaUrl?.trim();
      }
      if (node.data.nodeType === "location") {
        return node.data.lat && node.data.lng;
      }
      if (node.data.nodeType === "assign_chatbot") {
        return !!(node.data.chatbotId && String(node.data.chatbotId).trim());
      }
      if (node.data.nodeType === "ai_agent") {
        const hasModel = edges.some((e) => e.target === node.id && e.targetHandle === "model-in");
        const toolCount = edges.filter((e) => e.target === node.id && e.targetHandle === "tool-in").length;
        if (!hasModel || toolCount === 0) return false;
        return true;
      }
      if (node.data.nodeType === "agent_chat_model") {
        return !!(node.data.chatbotId && String(node.data.chatbotId).trim());
      }
      if (isAgentGoogleCalendarToolNodeType(node.data.nodeType)) {
        const acct = !!(node.data.googleAccountId && String(node.data.googleAccountId).trim());
        const cal = !!(node.data.calendarDbId && String(node.data.calendarDbId).trim());
        if (node.data.nodeType === "agent_tool_google_calendar") {
          return acct && cal && (!!node.data.toolCalendarList || !!node.data.toolCalendarCreate);
        }
        return acct && cal;
      }
      if (isAgentGoogleSheetsToolNodeType(node.data.nodeType)) {
        return (
          !!(node.data.googleAccountId && String(node.data.googleAccountId).trim()) &&
          !!(node.data.sheetDbId && String(node.data.sheetDbId).trim())
        );
      }
      if (node.data.nodeType === "google_sheets") {
        const maps = Array.isArray(node.data.columnMappings) ? node.data.columnMappings : [];
        return (
          !!(node.data.googleAccountId && String(node.data.googleAccountId).trim()) &&
          !!(node.data.sheetDbId && String(node.data.sheetDbId).trim()) &&
          maps.length > 0 &&
          maps.every((m: any) => m.columnName && String(m.columnName).trim())
        );
      }
      if (node.data.nodeType === "calendar_event") {
        return (
          !!(node.data.googleAccountId && String(node.data.googleAccountId).trim()) &&
          !!(node.data.calendarDbId && String(node.data.calendarDbId).trim()) &&
          !!(node.data.eventTitle && String(node.data.eventTitle).trim()) &&
          !!(node.data.startTime && String(node.data.startTime).trim())
        );
      }
      if (node.data.nodeType === "contact_card") {
        return node.data.contacts?.length > 0 && node.data.contacts.every((c: any) => c.firstName && c.phone);
      }
      if (node.data.nodeType === "api_request") {
        return node.data.url?.trim();
      }
      return true;
    });

    return allNodesValid;
  }, [nodes, edges]);

  const isSaveDisabled = isCreating || isUpdating || !validateFlow();

  useEffect(() => {
    if (flowData?.data) {
      const flow = flowData.data;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFlowName(flow.name);

      const restoredNodes = flow.nodes
        .filter((n: any) => n.type !== "condition") // Filter out condition nodes from UI
        .map((n: any) => {
          const params = JSON.parse(JSON.stringify(n.parameters || {}));

          // Reconstruct Keywords if this is a trigger
          let keywords = params.keywords;
          if (n.type === "trigger") {
            const connectedCondition = flow.nodes.find((chk: any) => chk.type === "condition" && chk.id.startsWith("cond-start-") && flow.connections.some((c: any) => c.source === n.id && c.target === chk.id));
            if (connectedCondition?.parameters?.condition?.value) {
              const val = connectedCondition.parameters.condition.value;
              const rawKeywords = Array.isArray(val) ? val : [val];
              keywords = rawKeywords.filter((kw: string) => !kw.includes("___"));
            }
          }

          if (params.buttons && Array.isArray(params.buttons)) {
            params.buttons = params.buttons.map((btn: any) => ({
              ...btn,
              value: btn.value?.includes("___") ? btn.value.split("___").pop() : btn.value,
            }));
          }
          if (params.sections && Array.isArray(params.sections)) {
            params.sections = params.sections.map((sec: any) => ({
              ...sec,
              items: sec.items?.map((item: any) => ({
                ...item,
                title: item.title?.includes("___") ? item.title.split("___").pop() : item.title,
              })),
            }));
          }

          const resolvedNodeType =
            params.nodeType ||
            (AGENT_SUPPLIER_NODE_TYPE_SET.has(n.type)
              ? n.type
              : n.type === "ai_agent"
                  ? "ai_agent"
                  : n.type === "google_sheets"
                    ? "google_sheets"
                    : n.type === "calendar_event"
                      ? "calendar_event"
                      : n.type === "assign_chatbot"
                        ? "assign_chatbot"
                        : n.type === "send_message" && params.template_id
                          ? "send_template"
                          : n.type === "send_message" && params.interactive_type === "cta_url"
                            ? "call_to_action"
                            : n.type === "send_message" && params.interactive_type === "button"
                              ? params.nodeType === "quick_reply"
                                ? "quick_reply"
                                : "button_message"
                              : n.type === "send_message"
                                ? "text_message"
                                : n.type === "trigger"
                                  ? "trigger"
                                  : n.type);

          return {
            id: n.id,
            type: "custom",
            position: n.position,
            data: {
              ...params,
              nodeType: resolvedNodeType,
              stepName: params.stepName ?? params.step_name ?? "",
              chatbotId: params.chatbotId ?? params.chatbot_id ?? "",
              sessionDurationHours:
                params.sessionDurationHours !== undefined && params.sessionDurationHours !== ""
                  ? String(params.sessionDurationHours)
                  : params.session_duration_hours !== undefined && params.session_duration_hours !== null
                    ? String(params.session_duration_hours)
                    : "0",
              templateId: params.templateId ?? params.template_id ?? "",
              valueText:
                resolvedNodeType === "call_to_action"
                  ? params.message_template || params.valueText || ""
                  : params.valueText || "",
              buttonText: params.buttonText ?? params.cta_url_params?.display_text ?? "",
              buttonLink: params.buttonLink ?? params.cta_url_params?.url ?? "",
              message:
                resolvedNodeType === "call_to_action"
                  ? ""
                  : params.message || params.message_template || "",
              keywords: keywords || [],
              // Restore location params if present
              ...(params.location_params
                ? {
                    lat: params.location_params.latitude,
                    lng: params.location_params.longitude,
                    name: params.location_params.name,
                    address: params.location_params.address,
                  }
                : {}),
              // Restore media params if present
              ...(params.media_url
                ? {
                    mediaUrl: params.media_url,
                    caption: params.message_template,
                  }
                : {}),
              ...(resolvedNodeType === "google_sheets"
                ? {
                    googleAccountId: params.google_account_id ?? params.googleAccountId ?? "",
                    sheetDbId: params.sheet_db_id ?? params.sheetDbId ?? "",
                    sheetTabName: params.sheet_tab_name ?? params.sheetTabName ?? "Sheet1",
                    columnMappings: Array.isArray(params.columnMappings)
                      ? params.columnMappings
                      : (params.column_mappings || []).map((m: any) => ({
                          columnName: m.column_name ?? m.columnName ?? "",
                          value: m.value_template ?? m.value ?? "",
                        })),
                  }
                : {}),
              ...(resolvedNodeType === "ai_agent"
                ? {
                    ...(String(params.chatbot_id || params.chatbotId || "").trim()
                      ? { chatbotId: params.chatbot_id ?? params.chatbotId }
                      : {}),
                    ...(params.google_account_id || params.googleAccountId
                      ? {
                          googleAccountId: params.google_account_id ?? params.googleAccountId ?? "",
                          calendarDbId: params.calendar_db_id ?? params.calendarDbId ?? "",
                          sheetDbId: params.sheet_db_id ?? params.sheetDbId ?? "",
                          sheetTabName: params.sheet_tab_name ?? params.sheetTabName ?? "Sheet1",
                          agentToolCalendarList: !!params.tool_calendar_list,
                          agentToolCalendarCreate: !!params.tool_calendar_create,
                          agentToolSheetsAppend: !!params.tool_sheets_append,
                        }
                      : {}),
                  }
                : {}),
              ...(resolvedNodeType === "agent_chat_model"
                ? {
                    chatbotId: params.chatbot_id ?? params.chatbotId ?? "",
                  }
                : {}),
              ...(isAgentGoogleCalendarToolNodeType(resolvedNodeType)
                ? {
                    googleAccountId: params.google_account_id ?? params.googleAccountId ?? "",
                    calendarDbId: params.calendar_db_id ?? params.calendarDbId ?? "",
                    toolCalendarList: !!params.tool_calendar_list,
                    toolCalendarCreate: !!params.tool_calendar_create,
                  }
                : {}),
              ...(isAgentGoogleSheetsToolNodeType(resolvedNodeType)
                ? {
                    googleAccountId: params.google_account_id ?? params.googleAccountId ?? "",
                    sheetDbId: params.sheet_db_id ?? params.sheetDbId ?? "",
                    sheetTabName: params.sheet_tab_name ?? params.sheetTabName ?? "Sheet1",
                    sheetsReadRangeA1: params.sheets_read_range_a1 ?? params.sheetsReadRangeA1 ?? "",
                  }
                : {}),
              ...(resolvedNodeType === "calendar_event"
                ? {
                    googleAccountId: params.google_account_id ?? params.googleAccountId ?? "",
                    calendarDbId: params.calendar_db_id ?? params.calendarDbId ?? "",
                    eventTitle: params.event_title ?? params.eventTitle ?? "",
                    startTime: params.start ?? params.startTime ?? "",
                    endTime: params.end ?? params.endTime ?? "",
                    eventDescription: params.description ?? params.eventDescription ?? "",
                  }
                : {}),
            },
          };
        });

      // Filter and remap edges to bypass the condition node
      const restoredEdges = flow.connections
        .filter((c: any) => {
          const sourceNode = flow.nodes.find((n: any) => n.id === c.source);
          const targetNode = flow.nodes.find((n: any) => n.id === c.target);
          return sourceNode?.type !== "condition";
        })
        .map((c: any) => {
          let source = c.source;
          let sourceHandle = c.sourceHandle === "default" || c.sourceHandle === "source" ? "src" : c.sourceHandle;
          let target = c.target;
          let targetHandle = c.targetHandle === "default" || c.targetHandle === "target" ? "tgt" : c.targetHandle;

          const targetNode = flow.nodes.find((n: any) => n.id === c.target);
          if (targetNode?.type === "condition") {
            // Find the edge that goes OUT of this condition
            const outgoingEdge = flow.connections.find((out: any) => out.source === targetNode.id);
            if (outgoingEdge) {
              target = outgoingEdge.target;
              targetHandle = outgoingEdge.targetHandle === "default" || outgoingEdge.targetHandle === "target" ? "tgt" : outgoingEdge.targetHandle;
            }

            if (targetNode.id.startsWith("cond-btn-")) {
              const parts = targetNode.id.split("___");
              if (parts.length >= 3) {
                source = parts[1];
                sourceHandle = `src-btn-${parts[2]}`;
              }
            } else if (targetNode.id.startsWith("cond-list-")) {
              const parts = targetNode.id.split("___");
              if (parts.length >= 4) {
                source = parts[1];
                sourceHandle = `src-item-${parts[2]}-${parts[3]}`;
              }
            }
          }

          return {
            id: c.id,
            source: source,
            target: target,
            type: "custom",
            animated: true,
            sourceHandle: sourceHandle,
            targetHandle: targetHandle,
          };
        })
        .filter((edge: any, index: number, self: any[]) => index === self.findIndex((t) => t.source === edge.source && t.target === edge.target));

      setNodes(restoredNodes);
      setEdges(restoredEdges);

      // fitView takes a bit to work after setting nodes
      setTimeout(() => setViewport({ x: 0, y: 0, zoom: 1 }), 100);
    }
  }, [flowData, setNodes, setEdges, setViewport]);

  const onConnect = useCallback((params: Connection) => setEdges((eds) => addEdge({ ...params, type: "custom", animated: true }, eds)), [setEdges]);

  const handleSave = async () => {
    try {
      if (!flowName.trim()) {
        toast.error("Please enter a flow name");
        return;
      }

      // Force validation to show on all nodes
      setForceValidation(true);

      // Find all trigger nodes (allows multiple entry points)
      const triggerNodes = nodes.filter((n) => n.data.nodeType === "trigger");
      if (triggerNodes.length === 0) {
        toast.error("Flow must have at least one Start Trigger");
        return;
      }

      const formattedNodes: any[] = [];
      const formattedConnections: any[] = [];

      const getBackendId = (node: any) => {
        if (!node) return "";
        const nodeType = node.data?.nodeType || node.type;
        if (nodeType === "trigger") {
          return node.id.startsWith("trigger-") ? node.id : `trigger-${node.id}`;
        }
        if (nodeType === "delay") {
          const p = "delay-";
          if (node.id.startsWith(p)) return node.id;
          return `${p}${node.id}`;
        }
        if (nodeType === "assign_chatbot") {
          const p = "assign_chatbot-";
          if (node.id.startsWith(p)) return node.id;
          return `${p}${node.id}`;
        }
        if (nodeType === "ai_agent") {
          const p = "ai_agent-";
          if (node.id.startsWith(p)) return node.id;
          return `${p}${node.id}`;
        }
        if (AGENT_SUPPLIER_NODE_TYPE_SET.has(nodeType)) {
          const p = `${nodeType}-`;
          if (node.id.startsWith(p)) return node.id;
          return `${p}${node.id}`;
        }
        if (nodeType === "google_sheets") {
          const p = "google_sheets-";
          if (node.id.startsWith(p)) return node.id;
          return `${p}${node.id}`;
        }
        if (nodeType === "calendar_event") {
          const p = "calendar_event-";
          if (node.id.startsWith(p)) return node.id;
          return `${p}${node.id}`;
        }
        const prefix = "send_message-";
        if (node.id.startsWith(prefix)) return node.id;
        return `${prefix}${node.id}`;
      };

      // Add all trigger nodes to the payload
      triggerNodes.forEach((tNode) => {
        formattedNodes.push({
          id: getBackendId(tNode),
          type: "trigger",
          position: tNode.position,
          parameters: { ...tNode.data },
          name: "Incoming Message",
        });
      });

      const operatorMap: Record<string, string> = {
        "contains keyword": "contains_any",
        "on exact match": "equals",
        "starts with": "starts_with",
      };

      // Helper to add a branch to the payload and follow its chain
      const addBranch = (idPrefix: string, condition: any, firstTargetNode: any, name: string, sourceId: string, sourceHandle: string = "src") => {
        const condId = `cond-${idPrefix}-${getBackendId(firstTargetNode)}`;

        // 1. Add Condition Node (Always follows the specific trigger)
        if (condition && !formattedNodes.find((n) => n.id === condId)) {
          formattedNodes.push({
            id: condId,
            type: "condition",
            position: {
              x: firstTargetNode.position.x - 250,
              y: firstTargetNode.position.y,
            },
            parameters: { condition },
            name: `Is ${name}?`,
          });
        }

        formattedConnections.push({
          id: `c-t-${condition ? condId : getBackendId(firstTargetNode)}`,
          source: sourceId,
          target: condition ? condId : getBackendId(firstTargetNode),
          sourceHandle: sourceHandle,
          targetHandle: "tgt",
        });

        // 2. Follow the chain from firstTargetNode
        let prevNodeId = condition ? condId : sourceId;
        let currentNode = firstTargetNode;
        const visitedInBranch = new Set();

        while (currentNode && !visitedInBranch.has(currentNode.id)) {
          visitedInBranch.add(currentNode.id);
          const nt = currentNode.data.nodeType;
          const type =
            nt === "delay"
              ? "delay"
              : nt === "assign_chatbot"
                ? "assign_chatbot"
                : nt === "ai_agent"
                  ? "ai_agent"
                  : AGENT_SUPPLIER_NODE_TYPE_SET.has(nt)
                    ? nt
                    : nt === "google_sheets"
                      ? "google_sheets"
                      : nt === "calendar_event"
                        ? "calendar_event"
                        : "send_message";
          const payloadNodeId = getBackendId(currentNode);

          // Add node if not exists
          if (!formattedNodes.find((n) => n.id === payloadNodeId)) {
            let parameters: any =
              type === "assign_chatbot"
                ? {
                    nodeType: "assign_chatbot",
                    step_name: (currentNode.data.stepName || "").trim(),
                    chatbot_id: currentNode.data.chatbotId || "",
                    session_duration_hours:
                      currentNode.data.sessionDurationHours === "" || currentNode.data.sessionDurationHours === undefined
                        ? 0
                        : Number(currentNode.data.sessionDurationHours) || 0,
                  }
                : type === "ai_agent"
                  ? {
                      nodeType: "ai_agent",
                      step_name: (currentNode.data.stepName || "").trim(),
                      session_duration_hours:
                        currentNode.data.sessionDurationHours === "" || currentNode.data.sessionDurationHours === undefined
                          ? 0
                          : Number(currentNode.data.sessionDurationHours) || 0,
                      ...(String(currentNode.data.chatbotId || "").trim()
                        ? { chatbot_id: String(currentNode.data.chatbotId).trim() }
                        : {}),
                      ...(String(currentNode.data.googleAccountId || "").trim()
                        ? {
                            google_account_id: currentNode.data.googleAccountId,
                            calendar_db_id: currentNode.data.calendarDbId || "",
                            sheet_db_id: currentNode.data.sheetDbId || "",
                            sheet_tab_name: (currentNode.data.sheetTabName || "Sheet1").trim() || "Sheet1",
                            tool_calendar_list: !!currentNode.data.agentToolCalendarList,
                            tool_calendar_create: !!currentNode.data.agentToolCalendarCreate,
                            tool_sheets_append: !!currentNode.data.agentToolSheetsAppend,
                          }
                        : {}),
                    }
                  : type === "agent_chat_model"
                    ? {
                        nodeType: "agent_chat_model",
                        chatbot_id: currentNode.data.chatbotId || "",
                      }
                    : isAgentGoogleCalendarToolNodeType(type)
                      ? {
                          nodeType: type,
                          google_account_id: currentNode.data.googleAccountId || "",
                          calendar_db_id: currentNode.data.calendarDbId || "",
                          ...(type === "agent_tool_google_calendar"
                            ? {
                                tool_calendar_list: !!currentNode.data.toolCalendarList,
                                tool_calendar_create: !!currentNode.data.toolCalendarCreate,
                              }
                            : {}),
                        }
                      : isAgentGoogleSheetsToolNodeType(type)
                        ? {
                            nodeType: type,
                            google_account_id: currentNode.data.googleAccountId || "",
                            sheet_db_id: currentNode.data.sheetDbId || "",
                            sheet_tab_name: (currentNode.data.sheetTabName || "Sheet1").trim() || "Sheet1",
                            ...(type === "agent_tool_google_sheets_read"
                              ? {
                                  sheets_read_range_a1: (currentNode.data.sheetsReadRangeA1 || "").trim(),
                                }
                              : {}),
                          }
                        : type === "google_sheets"
                          ? {
                              nodeType: "google_sheets",
                              step_name: (currentNode.data.stepName || "").trim(),
                              google_account_id: currentNode.data.googleAccountId || "",
                              sheet_db_id: currentNode.data.sheetDbId || "",
                              sheet_tab_name: (currentNode.data.sheetTabName || "Sheet1").trim() || "Sheet1",
                              column_mappings: (currentNode.data.columnMappings || []).map((m: any) => ({
                                column_name: (m.columnName || "").trim(),
                                value_template: (m.value ?? "").trim(),
                              })),
                            }
                          : type === "calendar_event"
                            ? {
                                nodeType: "calendar_event",
                                google_account_id: currentNode.data.googleAccountId || "",
                                calendar_db_id: currentNode.data.calendarDbId || "",
                                event_title: (currentNode.data.eventTitle || "").trim(),
                                start: (currentNode.data.startTime || "").trim(),
                                end: (currentNode.data.endTime || "").trim(),
                                description: (currentNode.data.eventDescription || "").trim(),
                              }
                            : { ...currentNode.data };

            // Map common UI fields to Backend fields
            if (type === "send_message") {
              parameters.recipient = "{{senderNumber}}";
              parameters.provider_type = "business_api";

              // Map specific message types
              if (currentNode.data.nodeType === "location") {
                parameters.messageType = "location";
                parameters.location_params = {
                  latitude: currentNode.data.lat,
                  longitude: currentNode.data.lng,
                  name: currentNode.data.name || "",
                  address: currentNode.data.address || "",
                };
              } else if (currentNode.data.nodeType === "list_message") {
                parameters.messageType = "interactive";
                parameters.interactive_type = "list";
                parameters.list_params = {
                  header: currentNode.data.headerText || "",
                  body: currentNode.data.bodyText || "",
                  footer: currentNode.data.footerText || "",
                  buttonTitle: currentNode.data.buttonText || "Select",
                  sectionTitle: (currentNode.data.sections || [])[0]?.title || "Options",
                  items: (currentNode.data.sections || []).flatMap((section: any) =>
                    (section.items || []).map((item: any) => {
                      const prefix = flowId ? `f${flowId.slice(-6)}` : `new${Math.random().toString(36).substring(7)}`;
                      const uniqueId = `${prefix}___${item.title}`;
                      return {
                        id: uniqueId,
                        title: item.title,
                        description: item.description || "",
                      };
                    })
                  ),
                };
                parameters.message_template = currentNode.data.bodyText || "";
              } else if (currentNode.data.mediaUrl) {
                // Map media fields
                parameters.media_url = currentNode.data.mediaUrl;
                parameters.message_template = currentNode.data.caption || "";
              } else if (currentNode.data.nodeType === "button_message" || currentNode.data.nodeType === "quick_reply") {
                parameters.messageType = "interactive";
                parameters.interactive_type = "button";
                parameters.nodeType = currentNode.data.nodeType;

                const prefix = flowId ? `f${flowId.slice(-6)}` : `new${Math.random().toString(36).substring(7)}`;

                parameters.button_params = (currentNode.data.buttons || []).map((btn: any) => {
                  const rawVal = btn.value || btn.text;
                  const uniqueId = `${prefix}___${rawVal}`;
                  return {
                    id: uniqueId,
                    title: btn.text,
                  };
                });
                parameters.message_template = currentNode.data.message || "";
              } else if (currentNode.data.nodeType === "send_template") {
                parameters.messageType = "template";
                parameters.nodeType = "send_template";
                parameters.template_id = currentNode.data.templateId || "";
                parameters.step_name = (currentNode.data.stepName || "").trim();
                parameters.message_template = "";
              } else if (currentNode.data.nodeType === "call_to_action") {
                parameters.messageType = "interactive";
                parameters.interactive_type = "cta_url";
                parameters.nodeType = "call_to_action";
                parameters.step_name = (currentNode.data.stepName || "").trim();
                parameters.message_template = currentNode.data.valueText || "";
                parameters.cta_url_params = {
                  display_text: (currentNode.data.buttonText || "Open").trim(),
                  url: (currentNode.data.buttonLink || "").trim(),
                };
              } else {
                // Default text message
                parameters.nodeType = currentNode.data.nodeType || "text_message";
                parameters.step_name = (currentNode.data.stepName || "").trim();
                parameters.message_template = currentNode.data.message || currentNode.data.bodyText || "";
              }
            }

            formattedNodes.push({
              id: payloadNodeId,
              type: type,
              position: currentNode.position,
              parameters: parameters,
              name:
                type === "assign_chatbot"
                  ? (currentNode.data.stepName || "").trim() || currentNode.data.label || "Assign Chatbot"
                  : type === "ai_agent"
                    ? (currentNode.data.stepName || "").trim() || currentNode.data.label || "AI Agent"
                    : type === "agent_chat_model"
                      ? currentNode.data.label || "Chat model"
                      : isAgentGoogleCalendarToolNodeType(type) || isAgentGoogleSheetsToolNodeType(type)
                        ? currentNode.data.label || "Agent tool"
                        : type === "google_sheets"
                            ? (currentNode.data.stepName || "").trim() || currentNode.data.label || "Google Sheets"
                            : type === "calendar_event"
                              ? (currentNode.data.eventTitle || "").trim() || currentNode.data.label || "Calendar Event"
                              : currentNode.data.nodeType === "send_template"
                                ? (currentNode.data.stepName || "").trim() || currentNode.data.label || "Send Template"
                                : currentNode.data.label || currentNode.data.name || "Response",
            });
          }

          // Connect previous node to this one
          const connectionId = `conn-${prevNodeId}-${payloadNodeId}-${Math.random().toString(36).substr(2, 5)}`;
          if (!formattedConnections.find((c) => c.source === prevNodeId && c.target === payloadNodeId)) {
            formattedConnections.push({
              id: connectionId,
              source: prevNodeId,
              target: payloadNodeId,
              sourceHandle: "src",
              targetHandle: "tgt",
            });
          }

          const nextEdge = edges.find((e) => {
            if (e.source !== currentNode.id) return false;
            const sh = e.sourceHandle || "src";
            if (sh.startsWith("src-btn-") || sh.startsWith("src-item-")) return false;
            if (sh !== "src" && sh !== "default" && sh !== "source") return false;
            const th = e.targetHandle || "tgt";
            if (th !== "tgt" && th !== "target" && th !== "default") return false;
            return true;
          });
          if (nextEdge) {
            prevNodeId = payloadNodeId;
            currentNode = nodes.find((n) => n.id === nextEdge.target);
          } else {
            currentNode = null;
          }
        }
      };

      // 1. Handle paths directly from EACH Trigger (Keyword match)
      triggerNodes.forEach((tNode) => {
        const triggerEdges = edges.filter((e) => e.source === tNode.id);
        triggerEdges.forEach((edge) => {
          const targetNode = nodes.find((n) => n.id === edge.target);
          if (targetNode) {
            const isOrderReceived = tNode.data.triggerType === "order received";
            const isAnyMessage = tNode.data.triggerType === "any message";

            let condition = null;
            if (isOrderReceived) {
              condition = {
                field: "event_type",
                operator: "equals",
                value: "order_received",
              };
            } else if (isAnyMessage) {
              condition = {
                field: "event_type",
                operator: "equals",
                value: "message_received",
              };
            } else {
              condition = {
                field: "message",
                operator: operatorMap[tNode.data.triggerType] || "contains_any",
                value: tNode.data.keywords || [],
              };
            }

            addBranch("start", condition, targetNode, isOrderReceived ? "Order Received" : "Greeting", getBackendId(tNode), "src");
          }
        });
      });

      // 2. Handle paths from Button clicks (Starting new sub-branches)
      edges.forEach((edge) => {
        const sourceNode = nodes.find((n) => n.id === edge.source);
        const targetNode = nodes.find((n) => n.id === edge.target);

        if ((sourceNode?.data.nodeType === "button_message" || sourceNode?.data.nodeType === "quick_reply") && edge.sourceHandle?.startsWith("src-btn-")) {
          const btnIndex = parseInt(edge.sourceHandle.replace("src-btn-", ""));
          const button = sourceNode.data.buttons?.[btnIndex];

          const anchorTriggerId = getBackendId(triggerNodes[0]);

          if (button && targetNode) {
            const rawVal = button.value || button.text;
            const prefix = flowId ? `f${flowId.slice(-6)}` : `new${Math.random().toString(36).substring(7)}`;
            const uniqueId = `${prefix}___${rawVal}`;

            addBranch(
              `btn-___${getBackendId(sourceNode)}___${btnIndex}___${getBackendId(targetNode)}`,
              {
                field: "message",
                operator: "equals",
                value: uniqueId,
              },
              targetNode,
              button.text,
              anchorTriggerId,
              "src"
            );
          }
        }

        if (sourceNode?.data.nodeType === "list_message" && edge.sourceHandle?.startsWith("src-item-")) {
          const parts = edge.sourceHandle.replace("src-item-", "").split("-");
          const sIdx = parseInt(parts[0]);
          const iIdx = parseInt(parts[1]);
          const item = sourceNode.data.sections?.[sIdx]?.items?.[iIdx];

          const anchorTriggerId = getBackendId(triggerNodes[0]);

          if (item && targetNode) {
            const rawVal = item.title;
            const prefix = flowId ? `f${flowId.slice(-6)}` : `new${Math.random().toString(36).substring(7)}`;
            const uniqueId = `${prefix}___${rawVal}`;

            addBranch(
              `list-___${getBackendId(sourceNode)}___${sIdx}___${iIdx}___${getBackendId(targetNode)}`,
              {
                field: "message",
                operator: "equals",
                value: uniqueId,
              },
              targetNode,
              item.title,
              anchorTriggerId,
              "src"
            );
          }
        }
      });

      const getResponseKeywords = () => {
        const keywords: string[] = [];
        nodes.forEach((n: any) => {
          if (n.data.nodeType === "button_message" || n.data.nodeType === "quick_reply") {
            const prefix = flowId ? `f${flowId.slice(-6)}` : `new${Math.random().toString(36).substring(7)}`;
            (n.data.buttons || []).forEach((b: any) => {
              const rawVal = b.value || b.text;
              const uniqueId = `${prefix}___${rawVal}`;
              if (uniqueId && !keywords.includes(uniqueId)) keywords.push(uniqueId);
            });
          } else if (n.data.nodeType === "list_message") {
            const prefix = flowId ? `f${flowId.slice(-6)}` : `new${Math.random().toString(36).substring(7)}`;
            (n.data.sections || []).forEach((section: any) => {
              (section.items || []).forEach((item: any) => {
                const rawVal = item.title;
                const uniqueId = `${prefix}___${rawVal}`;
                if (uniqueId && !keywords.includes(uniqueId)) keywords.push(uniqueId);
              });
            });
          }
        });
        return keywords;
      };

      const buttonKeywords = getResponseKeywords();

      const triggers: any[] = [];

      // 1. Add Primary Triggers
      triggerNodes.forEach((tNode) => {
        if (tNode.data.triggerType === "any message") {
          triggers.push({
            event_type: "message_received",
            conditions: {},
          });
        } else if (tNode.data.triggerType === "order received") {
          triggers.push({
            event_type: "order_received",
            conditions: {},
          });
        } else {
          const userKeywords = Array.isArray(tNode.data.keywords) ? tNode.data.keywords : [];
          const op = operatorMap[tNode.data.triggerType] || "contains_any";

          if (op === "contains_any") {
            triggers.push({
              event_type: "message_received",
              conditions: {
                field: "message",
                operator: "contains_any",
                value: [...userKeywords], // CLONE IT to avoid pollution when merging button keywords later
              },
            });
          } else {
            userKeywords.forEach((kw: string) => {
              triggers.push({
                event_type: "message_received",
                conditions: {
                  field: "message",
                  operator: op,
                  value: kw,
                },
              });
            });
          }
        }
      });

      if (buttonKeywords.length > 0) {
        const hasAnyMessageTrigger = triggers.some((t) => t.event_type === "message_received" && Object.keys(t.conditions).length === 0);

        if (!hasAnyMessageTrigger) {
          const existingContainsAny = triggers.find((t) => t.event_type === "message_received" && t.conditions?.operator === "contains_any");

          if (existingContainsAny) {
            const currentVals = Array.isArray(existingContainsAny.conditions.value) ? [...existingContainsAny.conditions.value] : [existingContainsAny.conditions.value];

            buttonKeywords.forEach((kw) => {
              if (!currentVals.includes(kw)) currentVals.push(kw);
            });
            existingContainsAny.conditions.value = currentVals;
          } else {
            triggers.push({
              event_type: "message_received",
              conditions: {
                field: "message",
                operator: "contains_any",
                value: buttonKeywords,
              },
            });
          }
        }
      }

      const mergeAgentGraphIntoPayload = () => {
        const connKeyStr = (c: { source: string; target: string; sourceHandle: string; targetHandle: string }) =>
          `${c.source}|${c.target}|${c.sourceHandle}|${c.targetHandle}`;
        const seenConn = new Set(formattedConnections.map(connKeyStr));

        for (const n of nodes as any[]) {
          const nt = n.data?.nodeType;
          if (!AGENT_SUPPLIER_NODE_TYPE_SET.has(nt)) continue;
          const bid = getBackendId(n);
          if (formattedNodes.some((fn) => fn.id === bid)) continue;

          let parameters: Record<string, unknown> = { nodeType: nt };
          let displayName = (n.data.label as string) || String(nt);
          if (nt === "agent_chat_model") {
            parameters.chatbot_id = n.data.chatbotId || "";
            displayName = "Chat model";
          } else if (isAgentGoogleCalendarToolNodeType(nt)) {
            parameters.google_account_id = n.data.googleAccountId || "";
            parameters.calendar_db_id = n.data.calendarDbId || "";
            if (nt === "agent_tool_google_calendar") {
              parameters.tool_calendar_list = !!n.data.toolCalendarList;
              parameters.tool_calendar_create = !!n.data.toolCalendarCreate;
            }
            displayName = (n.data.label as string) || "Calendar tool";
          } else if (isAgentGoogleSheetsToolNodeType(nt)) {
            parameters.google_account_id = n.data.googleAccountId || "";
            parameters.sheet_db_id = n.data.sheetDbId || "";
            parameters.sheet_tab_name = (n.data.sheetTabName || "Sheet1").trim() || "Sheet1";
            if (nt === "agent_tool_google_sheets_read") {
              parameters.sheets_read_range_a1 = (n.data.sheetsReadRangeA1 || "").trim();
            }
            displayName = (n.data.label as string) || "Sheets tool";
          }
          formattedNodes.push({
            id: bid,
            type: nt,
            position: n.position,
            parameters,
            name: displayName,
          });
        }

        for (const e of edges as any[]) {
          const sNode = nodes.find((x: any) => x.id === e.source);
          const tNode = nodes.find((x: any) => x.id === e.target);
          if (!sNode || !tNode) continue;
          const sh = !e.sourceHandle || e.sourceHandle === "default" ? "src" : e.sourceHandle;
          const th = !e.targetHandle || e.targetHandle === "default" ? "tgt" : e.targetHandle;
          const c = {
            id: `conn-x-${getBackendId(sNode)}-${getBackendId(tNode)}-${Math.random().toString(36).slice(2, 8)}`,
            source: getBackendId(sNode),
            target: getBackendId(tNode),
            sourceHandle: sh,
            targetHandle: th,
          };
          const k = connKeyStr(c);
          if (seenConn.has(k)) continue;
          seenConn.add(k);
          formattedConnections.push(c);
        }
      };

      mergeAgentGraphIntoPayload();

      const body = {
        name: flowName,
        description: `Handles ${Array.isArray(triggerNodes[0].data.keywords) && triggerNodes[0].data.keywords.length > 0 ? triggerNodes[0].data.keywords.join(", ") : triggerNodes[0].data.triggerType} and related interactive menus`,
        is_active: true,
        triggers,
        nodes: formattedNodes,
        connections: formattedConnections,
      };

      if (flowId) {
        console.log("body", body);
        await updateFlow({ flowId, ...body }).unwrap();
        toast.success("Flow updated successfully!");
      } else {
        await createFlow(body).unwrap();
        toast.success("Flow saved successfully!");
      }

      router.push(ROUTES.BotFlow);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to save flow");
    }
  };

  const addNodeToCanvas = useCallback(
    (template: (typeof NODETEMPLATES)[0]) => {
      const position = screenToFlowPosition({
        x: window.innerWidth / 2 - 100,
        y: window.innerHeight / 2 - 50,
      });

      const newNode: Node = {
        id: `${template.id}-${Date.now()}`,
        type: "custom",
        data: defaultNodeDataFromTemplate(template) as any,
        position,
      };

      setNodes((nds) => [...nds, newNode]);
    },
    [screenToFlowPosition, setNodes, defaultNodeDataFromTemplate]
  );

  const { selectedWorkspace } = useAppSelector((state) => state.workspace);
  const isBaileys = selectedWorkspace?.waba_type === "baileys";

  const categories = ["All", ...Array.from(new Set(NODETEMPLATES.map((t) => t.category)))];
  const filteredTemplates = NODETEMPLATES.filter((t) => {
    // if (isBaileys && (t.id === "button_message" || t.id === "list_message")) {
    //   return false;
    // }
    if (selectedCategory !== "All" && t.category !== selectedCategory) {
      return false;
    }
    return true;
  });

  if (isLoadingFlow) return <div className="flex h-screen items-center justify-center">Loading flow...</div>;

  return (
    <div className="flex relative h-full w-full overflow-hidden">
      {/* Side Drawer */}
      <div className="flex flex-col overflow-hidden border-r border-gray-200 dark:border-(--card-border-color) dark:bg-(--card-color) bg-white transition-all duration-300 shadow-sm z-20 relative top-0 left-0 md:h-auto" style={{ width: isDrawerCollapsed ? "72px" : "320px" }}>
        <div className={`flex items-center border-b border-gray-200 p-3 md:p-4 dark:border-(--card-border-color) ${isDrawerCollapsed ? "justify-center" : "justify-between"}`}>
          <div className={`flex items-center gap-2 ${isDrawerCollapsed ? "hidden" : ""}`}>
            <Target className="h-4 w-4 md:h-5 md:w-5 text-gray-600" />
            <h2 className="text-base md:text-lg font-semibold text-gray-800 dark:text-gray-300">Available Components</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setIsDrawerCollapsed(!isDrawerCollapsed)} className="h-9 w-9 md:h-8 md:w-8 hover:bg-gray-100 dark:hover:bg-(--table-hover) transition-colors">
            {isDrawerCollapsed ? <ChevronRight className="h-5 w-5 text-gray-600" /> : <ChevronLeft className="h-5 w-5 text-gray-600" />}
          </Button>
        </div>

        {!isDrawerCollapsed && (
          <>
            <div className="p-2 md:p-3">
              <Input type="text" placeholder="Search components..." className="h-9 text-sm focus-visible:ring-sky-500" />
            </div>
          </>
        )}

        {/* Node List */}
        <div className="flex-1 overflow-y-auto px-2 md:px-3 py-3 md:py-4 custom-scrollbar">
          {categories
            .filter((cat) => cat !== "All")
            .map((category) => {
              const categoryTemplates = filteredTemplates.filter((t) => t.category === category);
              if (categoryTemplates.length === 0) return null;

              return (
                <div key={category} className="mb-4 md:mb-6">
                  {!isDrawerCollapsed && <h3 className="mb-3 px-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">{category}</h3>}
                  {categoryTemplates.map((template) => (
                    <div
                      key={template.id}
                      draggable
                      onDragStart={(event) => {
                        event.dataTransfer.setData("application/reactflow", JSON.stringify(template));
                        event.dataTransfer.effectAllowed = "move";
                      }}
                      onClick={() => addNodeToCanvas(template)}
                      className={`mb-2 md:mb-3 cursor-pointer rounded-lg border border-gray-100 dark:border-(--card-border-color)! dark:bg-(--page-body-bg)! dark:border-none dark:hover:bg-(--table-hover) bg-white transition-all hover:shadow-lg group active:scale-95 ${isDrawerCollapsed ? "p-1 dark:border-none dark:bg-transparent! flex justify-center" : "p-3"}`}
                      style={{
                        borderColor: selectedCategory === template.category ? template.color : undefined,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = template.color;
                        e.currentTarget.style.backgroundColor = `${template.color}05`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "#f3f4f6";
                        e.currentTarget.style.backgroundColor = "transparent";
                      }}
                    >
                      <div className={`flex items-start gap-3 ${isDrawerCollapsed ? "justify-center" : ""}`}>
                        <div
                          className={`flex h-9 w-9 md:h-10 md:w-10 shrink-0 items-center justify-center rounded-lg text-base md:text-lg transition-transform group-hover:scale-110`}
                          style={{
                            background: `${template.color}15`,
                            color: template.color,
                          }}
                        >
                          {template.icon}
                        </div>
                        {!isDrawerCollapsed && (
                          <div className="flex-1 overflow-hidden">
                            <div className="mb-0.5 text-xs md:text-sm font-bold text-gray-800 dark:text-gray-300">{template.label}</div>
                            <div className="text-[10px] md:text-[11px] leading-snug text-gray-500 line-clamp-2">{template.description}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
        </div>
      </div>

      {/* Flow Canvas */}
      <div
        className="relative flex-1"
        onDragOver={(event) => {
          event.preventDefault();
          event.dataTransfer.dropEffect = "move";
        }}
        onDrop={(event) => {
          event.preventDefault();

          const data = event.dataTransfer.getData("application/reactflow");
          if (!data) return;

          const template = JSON.parse(data);
          const position = screenToFlowPosition({
            x: event.clientX,
            y: event.clientY,
          });

          const newNode: Node = {
            id: `${template.id}-${Date.now()}`,
            type: "custom",
            data: defaultNodeDataFromTemplate(template) as any,
            position,
          };

          setNodes((nds) => [...nds, newNode]);
        }}
      >
        <div className="absolute left-2 md:left-4 top-2 md:top-4 z-10 flex items-center gap-2 rounded-lg bg-white/80 p-1.5 md:p-2 shadow-sm backdrop-blur-sm dark:bg-(--card-color)">
          <Input value={flowName} onChange={(e) => setFlowName(e.target.value)} className="h-7 md:h-8 w-32 sm:w-40 md:w-48 border-none bg-transparent shadow-none sticky text-sm md:text-base font-semibold focus-visible:ring-0" placeholder="Flow Name" />
        </div>

        <ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect} nodeTypes={nodeTypes} edgeTypes={edgeTypes} fitView>
          <Controls />
          <MiniMap className="hidden md:block" />
          <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
        </ReactFlow>

        {/* Save Button */}
        <Button onClick={handleSave} disabled={isSaveDisabled} className={`absolute right-2 md:right-2.5 top-2 md:top-2.5 z-10 gap-1.5 md:gap-2 shadow-md transition-all text-xs md:text-sm px-3 md:px-4 h-8 md:h-10 ${isSaveDisabled ? "bg-gray-400 cursor-not-allowed opacity-70" : "bg-primary hover:bg-primary active:scale-95"}`}>
          <Save className="h-3.5 w-3.5 md:h-4 md:w-4" /> <span className="hidden sm:inline">{isCreating || isUpdating ? "Saving..." : "Save Flow"}</span>
          <span className="sm:hidden">{isCreating || isUpdating ? "..." : "Save"}</span>
        </Button>
      </div>
    </div>
  );
};

export default FlowCanvas;
