// backend/src/services/MessageServices/ForwardMessageService.ts

import AppError from "../../errors/AppError";
import Message from "../../models/Message";
import Contact from "../../models/Contact";
import Ticket from "../../models/Ticket";
import CreateMessageService from "./CreateMessageService";

interface Request {
  messageId: number;
  contactId: number;
}

const ForwardMessageService = async ({ messageId, contactId }: Request) => {
  // ForwardMessageService.ts

const originalMessage = await Message.findByPk(messageId);
if (!originalMessage) {
  throw new AppError("ERR_NO_MESSAGE_FOUND", 404);
}

// Pegamos a companyId e whatsappId do ticket original, por exemplo
const originalTicket = await Ticket.findByPk(originalMessage.ticketId);

// Precisamos do contato
const newContact = await Contact.findByPk(contactId);
if (!newContact) {
  throw new AppError("ERR_NO_CONTACT_FOUND", 404);
}

// Tente encontrar um ticket aberto/pending para esse contato + company + whatsapp
let ticket = await Ticket.findOne({
  where: {
    contactId: newContact.id,
    companyId: originalMessage.companyId,
    whatsappId: originalTicket?.whatsappId
    // E status in ["open", "pending", "closed"], etc. se preferir
  },
  order: [["id", "DESC"]]
});

if (!ticket) {
  // Se não tiver, criamos um novo
  ticket = await Ticket.create({
    contactId: newContact.id,
    companyId: originalMessage.companyId,
    whatsappId: originalTicket?.whatsappId,
    status: "closed",  // ou "open"
    unreadMessages: 0,
    isGroup: false      // se não for grupo
  });

  // Se necessário, replicar a criação do "ticketTraking":
  // await FindOrCreateATicketTrakingService({
  //   ticketId: ticket.id,
  //   companyId: ticket.companyId,
  //   whatsappId: ticket.whatsappId,
  //   userId: ticket.userId
  // });
}

// Aí sim criamos a mensagem
const newMessage = await CreateMessageService({
  messageData: {
    ticketId: ticket.id,
    body: originalMessage.body,
    mediaUrl: originalMessage.mediaUrl,
    fromMe: true
  },
  companyId: originalMessage.companyId
});

return newMessage;

};

export default ForwardMessageService;
