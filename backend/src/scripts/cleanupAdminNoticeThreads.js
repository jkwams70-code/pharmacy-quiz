import { ensureStore, readCollection, writeCollection } from "../store.js";

function normalizeWhitespace(value = "") {
  return String(value || "").trim().replace(/\s+/g, " ");
}

function normalizeConversation(raw = {}) {
  const memberIds = Array.isArray(raw.memberIds)
    ? [...new Set(raw.memberIds.map((value) => String(value || "").trim()).filter(Boolean))]
    : [];
  const createdAt = String(raw.createdAt || new Date().toISOString());
  return {
    id: String(raw.id || "").trim(),
    type: String(raw.type || "direct").trim().toLowerCase(),
    memberIds,
    ownerUserId: String(raw.ownerUserId || memberIds[0] || "").trim(),
    adminIds: Array.isArray(raw.adminIds)
      ? [...new Set(raw.adminIds.map((value) => String(value || "").trim()).filter(Boolean))]
      : [],
    mutedMemberIds: Array.isArray(raw.mutedMemberIds)
      ? [...new Set(raw.mutedMemberIds.map((value) => String(value || "").trim()).filter(Boolean))]
      : [],
    name: normalizeWhitespace(raw.name).slice(0, 72),
    bio: normalizeWhitespace(raw.bio).slice(0, 180),
    noticeTitle: normalizeWhitespace(raw.noticeTitle).slice(0, 72),
    noticeSubtitle: normalizeWhitespace(raw.noticeSubtitle).slice(0, 180),
    noticeBody: normalizeWhitespace(raw.noticeBody).slice(0, 240),
    noticeOriginType: normalizeWhitespace(raw.noticeOriginType).slice(0, 32),
    noticeOriginId: String(raw.noticeOriginId || "").trim(),
    noticeOriginName: normalizeWhitespace(raw.noticeOriginName).slice(0, 120),
    noticeSenderId: String(raw.noticeSenderId || "").trim(),
    noticeSenderName: normalizeWhitespace(raw.noticeSenderName).slice(0, 80),
    noticeThreadKey: normalizeWhitespace(raw.noticeThreadKey || "").slice(0, 120),
    noticeBatchId: String(raw.noticeBatchId || "").trim(),
    hiddenForUserIds: Array.isArray(raw.hiddenForUserIds)
      ? [...new Set(raw.hiddenForUserIds.map((value) => String(value || "").trim()).filter(Boolean))]
      : [],
    lastMessageId: String(raw.lastMessageId || "").trim(),
    lastMessageAt: String(raw.lastMessageAt || createdAt),
    createdAt,
    updatedAt: String(raw.updatedAt || createdAt),
  };
}

function normalizeMessage(raw = {}) {
  return {
    id: String(raw.id || "").trim(),
    conversationId: String(raw.conversationId || "").trim(),
    senderUserId: String(raw.senderUserId || "").trim(),
    senderName: normalizeWhitespace(raw.senderName).slice(0, 80),
    type: String(raw.type || "text").trim().toLowerCase() || "text",
    text: String(raw.text || ""),
    attachment: raw.attachment && typeof raw.attachment === "object" ? { ...raw.attachment } : null,
    replyTo: raw.replyTo && typeof raw.replyTo === "object" ? { ...raw.replyTo } : null,
    deliveredAt: String(raw.deliveredAt || "").trim(),
    readAt: String(raw.readAt || "").trim(),
    seenByUserIds: Array.isArray(raw.seenByUserIds)
      ? [...new Set(raw.seenByUserIds.map((value) => String(value || "").trim()).filter(Boolean))]
      : [],
    editedAt: String(raw.editedAt || "").trim(),
    deletedAt: String(raw.deletedAt || "").trim(),
    deletedForUserIds: Array.isArray(raw.deletedForUserIds)
      ? [...new Set(raw.deletedForUserIds.map((value) => String(value || "").trim()).filter(Boolean))]
      : [],
    hiddenForUserIds: Array.isArray(raw.hiddenForUserIds)
      ? [...new Set(raw.hiddenForUserIds.map((value) => String(value || "").trim()).filter(Boolean))]
      : [],
    noticeThreadKey: normalizeWhitespace(raw.noticeThreadKey || "").slice(0, 120),
    noticeBatchId: String(raw.noticeBatchId || "").trim(),
    createdAt: String(raw.createdAt || new Date().toISOString()),
    updatedAt: String(raw.updatedAt || raw.createdAt || new Date().toISOString()),
  };
}

function normalizeConversationState(raw = {}) {
  const createdAt = String(raw.createdAt || new Date().toISOString());
  return {
    id: String(raw.id || "").trim(),
    userId: String(raw.userId || "").trim(),
    conversationId: String(raw.conversationId || "").trim(),
    isFavorite: raw.isFavorite === true,
    hiddenAt: String(raw.hiddenAt || "").trim(),
    createdAt,
    updatedAt: String(raw.updatedAt || createdAt),
  };
}

function getNoticeMergeKey(conversation = {}) {
  const normalized = normalizeConversation(conversation);
  if (normalized.type !== "notice") return "";
  const recipientId = String(normalized.memberIds?.[0] || "").trim();
  if (recipientId) return `notice:${recipientId}`;
  const threadKey = normalizeWhitespace(normalized.noticeThreadKey || "");
  if (threadKey) return `notice-thread:${threadKey}`;
  return "";
}

function parseDateMs(value) {
  const parsed = Date.parse(String(value || ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function getLatestEntry(entries = []) {
  return [...entries].sort((left, right) => {
    const timeDiff = parseDateMs(left?.createdAt) - parseDateMs(right?.createdAt);
    if (timeDiff !== 0) return timeDiff;
    return String(left?.id || "").localeCompare(String(right?.id || ""));
  })[entries.length - 1] || null;
}

function getLatestHiddenAt(states = []) {
  const hiddenStates = states.filter((entry) => String(entry.hiddenAt || "").trim());
  if (!hiddenStates.length) return "";
  return hiddenStates.sort((left, right) => {
    const timeDiff = parseDateMs(left.hiddenAt) - parseDateMs(right.hiddenAt);
    if (timeDiff !== 0) return timeDiff;
    return String(left.id || "").localeCompare(String(right.id || ""));
  })[hiddenStates.length - 1]?.hiddenAt || "";
}

async function run() {
  await ensureStore();

  const apply = process.argv.includes("--apply") ||
    String(process.env.ADMIN_NOTICE_CLEANUP_APPLY || "").trim().toLowerCase() === "true";

  const conversationsRaw = await readCollection("conversations");
  const messagesRaw = await readCollection("messages");
  const statesRaw = await readCollection("communityConversationStates");

  const conversations = conversationsRaw.map(normalizeConversation);
  const messages = messagesRaw.map(normalizeMessage);
  const states = statesRaw.map(normalizeConversationState);

  const noticeGroups = new Map();
  conversations.forEach((conversation, index) => {
    const mergeKey = getNoticeMergeKey(conversation);
    if (!mergeKey) return;
    const group = noticeGroups.get(mergeKey) || { entries: [] };
    group.entries.push({ conversation, index });
    noticeGroups.set(mergeKey, group);
  });

  const groupsToMerge = [...noticeGroups.entries()].filter(([, group]) => group.entries.length > 1);
  const nextConversations = [...conversations];
  const nextMessages = [...messages];
  const nextStates = [...states];
  const conversationRedirects = new Map();
  let mergedConversationCount = 0;
  let mergedMessageCount = 0;
  let mergedStateCount = 0;

  for (const [, group] of groupsToMerge) {
    const ordered = [...group.entries].sort((left, right) => {
      const timeDiff = parseDateMs(left.conversation.createdAt) - parseDateMs(right.conversation.createdAt);
      if (timeDiff !== 0) return timeDiff;
      return String(left.conversation.id || "").localeCompare(String(right.conversation.id || ""));
    });
    const canonical = ordered[0].conversation;
    const duplicateEntries = ordered.slice(1);
    const duplicateIds = new Set(duplicateEntries.map((entry) => entry.conversation.id));
    const allConversations = ordered.map((entry) => entry.conversation);
    const allConversationIds = new Set(allConversations.map((entry) => entry.id));
    const mergedMessages = nextMessages.filter((message) => allConversationIds.has(message.conversationId));
    if (!duplicateIds.size) continue;

    const latestConversation = getLatestEntry(allConversations) || canonical;
    const latestMessage = getLatestEntry(mergedMessages);
    const hiddenForUserIds = [...new Set(
      allConversations.flatMap((conversation) => Array.isArray(conversation.hiddenForUserIds) ? conversation.hiddenForUserIds : [])
        .map((value) => String(value || "").trim())
        .filter(Boolean),
    )];

    const canonicalIndex = nextConversations.findIndex((conversation) => conversation.id === canonical.id);
    if (canonicalIndex >= 0) {
      nextConversations[canonicalIndex] = {
        ...nextConversations[canonicalIndex],
        ...latestConversation,
        id: canonical.id,
        type: "notice",
        memberIds: canonical.memberIds,
        ownerUserId: canonical.ownerUserId || canonical.memberIds[0] || latestConversation.ownerUserId || "",
        createdAt: canonical.createdAt,
        updatedAt: latestMessage?.createdAt || latestConversation.updatedAt || canonical.updatedAt,
        lastMessageId: latestMessage?.id || canonical.lastMessageId || "",
        lastMessageAt: latestMessage?.createdAt || canonical.lastMessageAt || canonical.updatedAt,
        hiddenForUserIds,
        noticeThreadKey: canonical.noticeThreadKey || latestConversation.noticeThreadKey || getNoticeMergeKey(canonical),
      };
    }

    for (const duplicate of duplicateEntries) {
      conversationRedirects.set(duplicate.conversation.id, canonical.id);
    }

    nextMessages.forEach((message, index) => {
      if (!allConversationIds.has(message.conversationId)) return;
      if (message.conversationId === canonical.id) return;
      nextMessages[index] = {
        ...message,
        conversationId: canonical.id,
      };
      mergedMessageCount += 1;
    });

    const canonicalMessageIds = mergedMessages.map((message) => message.id);
    if (latestMessage) {
      const canonicalMessageIndex = nextConversations.findIndex((conversation) => conversation.id === canonical.id);
      if (canonicalMessageIndex >= 0) {
        nextConversations[canonicalMessageIndex] = {
          ...nextConversations[canonicalMessageIndex],
          lastMessageId: latestMessage.id,
          lastMessageAt: latestMessage.createdAt,
          updatedAt: latestMessage.createdAt,
          noticeBody: String(latestMessage.text || latestMessage.attachment?.fileName || latestMessage.attachment?.originalName || "")
            .trim()
            .slice(0, 240),
        };
      }
    }

    const stateGroups = new Map();
    nextStates.forEach((state, index) => {
      if (state.conversationId === canonical.id || duplicateIds.has(state.conversationId)) {
        const key = `${state.userId}::${canonical.id}`;
        const bucket = stateGroups.get(key) || [];
        bucket.push({ state, index });
        stateGroups.set(key, bucket);
      }
    });

    for (const duplicate of duplicateEntries) {
      const duplicateIndex = nextConversations.findIndex((conversation) => conversation.id === duplicate.conversation.id);
      if (duplicateIndex >= 0) {
        nextConversations.splice(duplicateIndex, 1);
      }
      mergedConversationCount += 1;
    }

    if (stateGroups.size) {
      const updatedStates = [];
      const seenStateKeys = new Set();
      nextStates.forEach((state) => {
        if (state.conversationId !== canonical.id && !duplicateIds.has(state.conversationId)) {
          updatedStates.push(state);
          return;
        }
        const key = `${state.userId}::${canonical.id}`;
        if (seenStateKeys.has(key)) return;
        const related = stateGroups.get(key) || [];
        if (!related.length) return;
        seenStateKeys.add(key);
        const mergedStates = related.map((entry) => entry.state);
        const favorite = mergedStates.some((entry) => entry.isFavorite === true);
        const hiddenAt = getLatestHiddenAt(mergedStates);
        const createdAt = mergedStates
          .map((entry) => entry.createdAt)
          .filter(Boolean)
          .sort()[0] || mergedStates[0].createdAt;
        const updatedAt = mergedStates
          .map((entry) => entry.updatedAt)
          .filter(Boolean)
          .sort()
          .at(-1) || mergedStates[0].updatedAt;
        updatedStates.push({
          ...mergedStates[0],
          id: mergedStates[0].id,
          conversationId: canonical.id,
          isFavorite: favorite,
          hiddenAt,
          createdAt,
          updatedAt,
        });
        mergedStateCount += Math.max(0, mergedStates.length - 1);
      });
      nextStates.splice(0, nextStates.length, ...updatedStates);
    }
  }

  const changed =
    mergedConversationCount > 0 ||
    mergedMessageCount > 0 ||
    mergedStateCount > 0;

  console.log(
    JSON.stringify(
      {
        apply,
        noticeGroupsFound: groupsToMerge.length,
        mergedConversationCount,
        mergedMessageCount,
        mergedStateCount,
        changed,
      },
      null,
      2,
    ),
  );

  if (!apply || !changed) {
    if (!apply) {
      console.log("Dry run only. Re-run with --apply or ADMIN_NOTICE_CLEANUP_APPLY=true to write changes.");
    } else {
      console.log("No duplicate admin notice threads were found.");
    }
    return;
  }

  await writeCollection("conversations", nextConversations);
  await writeCollection("messages", nextMessages);
  await writeCollection("communityConversationStates", nextStates);

  console.log("Admin notice threads cleaned up successfully.");
}

run().catch((error) => {
  console.error("Admin notice cleanup failed:", error);
  process.exitCode = 1;
});
