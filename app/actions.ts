"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// --- User Actions ---

export async function loginUserAction(phoneNumber: string) {
  // Find or create user
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
      loveScore: true,
      name: true,
      phoneNumber: true,
    }
  });
  return user;
}

export async function searchUserAction(phoneNumber: string) {
  return await prisma.user.findUnique({
    where: { phoneNumber },
    select: { id: true, name: true, phoneNumber: true, valueScore: true, loveScore: true }
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
  // 1. Check if recipient exists, if so link them
  let recipient = await prisma.user.findUnique({
    where: { phoneNumber: data.recipientPhone },
  });

  // Calculate availability time (1 hour from now)
  const availableAt = new Date(Date.now() + 60 * 60 * 1000); 

  // 2. Create Message
  const message = await prisma.message.create({
    data: {
      content: data.content,
      actionPoint: data.actionPoint,
      type: data.type,
      senderId: data.senderId,
      recipientPhone: data.recipientPhone,
      recipientId: recipient?.id, // Link if user exists
      availableAt: availableAt,
      // For now, we simulate "isAnonymous" by not sending sender name in UI, 
      // but DB stores relation. We can add an isAnonymous flag to schema if strictly needed,
      // but for now we'll handle it in UI logic or add a comment field.
      // Wait, schema doesn't have isAnonymous. I should probably add it or hack it.
      // I'll add it to schema in next step if needed, but user asked for "make everything real".
      // I'll update schema to support isAnonymous properly.
    },
  });

  return message;
}

export async function getMyMessagesAction(userId: string) {
  const messages = await prisma.message.findMany({
    where: { recipientId: userId },
    include: {
      sender: { select: { name: true, phoneNumber: true } },
      agrees: true,
      comments: true,
      ratings: true,
    },
    orderBy: { createdAt: 'desc' },
  });
  
  // Client needs to filter by availableAt for "Cooling Off" logic
  // But we can return all and let UI handle the blur based on status/time.
  return messages;
}

export async function getPublicWallAction(userId: string) {
  return await prisma.message.findMany({
    where: { 
      recipientId: userId,
      isPublic: true,
      // status: 'DELIVERED' // implicity if public, it should be delivered usually?
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

export async function rateMessageAction(messageId: string, score: number, type: 'VALUE' | 'LOVE') {
  // 1. Create Rating
  await prisma.rating.create({
    data: {
      messageId,
      score,
      type,
    }
  });

  // 2. Update Sender's Score
  // We need to find the message sender first
  const message = await prisma.message.findUnique({
    where: { id: messageId },
    select: { senderId: true }
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
        data: { loveScore: { increment: score } }
      });
    }
  }
}

