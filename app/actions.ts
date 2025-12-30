"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { sendWhatsAppNotification, getNewMessageNotification } from "@/lib/wasender";

// --- User Actions ---

export async function loginUserAction(phoneNumber: string) {
  let user = await prisma.user.findUnique({
    where: { phoneNumber },
  });

  if (!user) {
    user = await prisma.user.create({
      data: { phoneNumber },
    });
  }

  return user;
}

export async function updateUserNameAction(userId: string, name: string) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { name },
  });
  return user;
}

export async function getUserStatsAction(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      valueScore: true,
      spiritScore: true,
      name: true,
      phoneNumber: true,
    }
  });
  return user;
}

export async function searchUserAction(phoneNumber: string) {
  return await prisma.user.findUnique({
    where: { phoneNumber },
    select: { id: true, name: true, phoneNumber: true, valueScore: true, spiritScore: true }
  });
}

export async function completeTourAction(userId: string) {
  await prisma.user.update({
    where: { id: userId },
    data: { tourCompleted: true },
  });
}

// --- Message Actions ---

export async function sendMessageAction(data: {
  senderId: string;
  recipientPhone: string;
  content: string;
  actionPoint?: string;
  type: string;
  isAnonymous?: boolean;
}) {
  let recipient = await prisma.user.findUnique({
    where: { phoneNumber: data.recipientPhone },
  });

  // Get sender info for notification
  const sender = await prisma.user.findUnique({
    where: { id: data.senderId },
    select: { name: true },
  });

  // Calculate availability time (10 minutes)
  const availableAt = new Date(Date.now() + 10 * 60 * 1000);

  const message = await prisma.message.create({
    data: {
      content: data.content,
      actionPoint: data.actionPoint,
      type: data.type,
      senderId: data.senderId,
      recipientPhone: data.recipientPhone,
      recipientId: recipient?.id,
      availableAt: availableAt,
      isAnonymous: data.isAnonymous,
      notificationSent: true,
    },
  });

  // Send WhatsApp notification immediately (message says it'll be visible in 10 mins)
  const senderName = data.isAnonymous ? undefined : sender?.name || undefined;
  const notificationMessage = getNewMessageNotification(senderName);
  
  sendWhatsAppNotification(data.recipientPhone, notificationMessage)
    .then((result) => {
      if (!result.success) {
        console.error("Failed to send WhatsApp notification:", result.error);
      }
    })
    .catch((err) => {
      console.error("WhatsApp notification error:", err);
    });

  return message;
}

export async function getIncomingMessagesAction(userId: string) {
  return await prisma.message.findMany({
    where: { recipientId: userId },
    include: {
      sender: { select: { name: true, phoneNumber: true } },
      ratings: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getMyMessagesAction(userId: string) {
  return await prisma.message.findMany({
    where: { recipientId: userId },
    include: {
      sender: { select: { name: true, phoneNumber: true } },
      ratings: true,
      agrees: true,
      comments: { include: { user: { select: { name: true } } } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getOutgoingMessagesAction(userId: string) {
  return await prisma.message.findMany({
    where: { senderId: userId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function updateMessageAction(messageId: string, content: string, actionPoint?: string) {
  // Only allow if cooling off
  const msg = await prisma.message.findUnique({ where: { id: messageId } });
  if (msg && new Date(msg.availableAt) > new Date()) {
    await prisma.message.update({
      where: { id: messageId },
      data: { content, actionPoint },
    });
    revalidatePath('/messages');
  }
}

export async function deleteMessageAction(messageId: string) {
  // Only allow if cooling off
  const msg = await prisma.message.findUnique({ where: { id: messageId } });
  if (msg && new Date(msg.availableAt) > new Date()) {
    await prisma.message.delete({
      where: { id: messageId },
    });
    revalidatePath('/messages');
  }
}

export async function getPublicWallAction(userId: string) {
  return await prisma.message.findMany({
    where: { 
      recipientId: userId,
      isPublic: true,
    },
    include: {
      agrees: true,
      comments: { include: { user: { select: { name: true } } } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function toggleMessagePublicAction(messageId: string, isPublic: boolean) {
  await prisma.message.update({
    where: { id: messageId },
    data: { isPublic },
  });
  revalidatePath('/profile');
}

export async function rateMessageAction(messageId: string, score: number, type: 'VALUE' | 'SPIRIT') {
  // Check if rating exists
  const existingRating = await prisma.rating.findFirst({
    where: { messageId }
  });

  const message = await prisma.message.findUnique({
    where: { id: messageId },
    select: { senderId: true }
  });

  if (existingRating) {
    // Update existing
    const scoreDiff = score - existingRating.score;
    await prisma.rating.update({
      where: { id: existingRating.id },
      data: { score }
    });

    // Update User Score Diff
    if (message) {
      if (type === 'VALUE') {
        await prisma.user.update({
          where: { id: message.senderId },
          data: { valueScore: { increment: scoreDiff } }
        });
      } else {
        await prisma.user.update({
          where: { id: message.senderId },
          data: { spiritScore: { increment: scoreDiff } }
        });
      }
    }

  } else {
    // Create new
    await prisma.rating.create({
      data: {
        messageId,
        score,
        type,
      }
    });

    if (message) {
      if (type === 'VALUE') {
        await prisma.user.update({
          where: { id: message.senderId },
          data: { valueScore: { increment: score } }
        });
      } else {
        await prisma.user.update({
          where: { id: message.senderId },
          data: { spiritScore: { increment: score } }
        });
      }
    }
  }
  revalidatePath('/inbox');
}
