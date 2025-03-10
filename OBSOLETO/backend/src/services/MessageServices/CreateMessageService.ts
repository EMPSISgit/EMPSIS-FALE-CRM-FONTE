import { getIO } from "../../libs/socket";
import Message from "../../models/Message";
import Ticket from "../../models/Ticket";
import Whatsapp from "../../models/Whatsapp";
import SendWhatsAppMessage from "../WbotServices/SendWhatsAppMessage";

interface MessageData {
  id?: string;
  ticketId: number;
  body: string;
  contactId?: number;
  fromMe?: boolean;
  read?: boolean;
  mediaType?: string;
  mediaUrl?: string;
  ack?: number;
  queueId?: number;
}
interface Request {
  messageData: MessageData;
  companyId: number;
}

const CreateMessageService = async ({
  messageData,
  companyId
}: Request): Promise<Message> => {
    console.log("Entrou no CreateMessageService") 
  let message: Message;

  if (!messageData.id) {
    
    const ticket = await Ticket.findByPk(messageData.ticketId, {
        include: [
          "contact",
          "queue",
          {
            model: Whatsapp,
            as: "whatsapp"
          }
        ]
      });
    
      if (!ticket) {
        throw new Error("ERR_TICKET_NOT_FOUND");
      }

        try {
            await SendWhatsAppMessage({
            body: messageData.body,         
            ticket: ticket // => ticket com .whatsapp
            });
        } catch (err) {
            console.error("Erro ao enviar mensagem ao WhatsApp:", err);
        }
    
        return message;

  } else {

    await Message.upsert({ ...messageData, companyId });

    message = await Message.findByPk(messageData.id, {
        include: [
        "contact",
        {
            model: Ticket,
            as: "ticket",
            include: [
            "contact",
            "queue",
            {
                model: Whatsapp,
                as: "whatsapp",
                attributes: ["name"]
            }
            ]
        },
        {
            model: Message,
            as: "quotedMsg",
            include: ["contact"]
        }
        ]
    });
  }
  
  if (message.ticket && message.ticket.queueId != null && message.queueId == null) {
    await message.update({ queueId: message.ticket.queueId });
    
  }

  if (!message) {
    throw new Error("ERR_CREATING_MESSAGE");
  }

  const io = getIO();
  io.to(message.ticketId.toString())
    .to(`company-${companyId}-${message.ticket.status}`)
    .to(`company-${companyId}-notification`)
    .to(`queue-${message.ticket.queueId}-${message.ticket.status}`)
    .to(`queue-${message.ticket.queueId}-notification`)
    .emit(`company-${companyId}-appMessage`, {
      action: "create",
      message,
      ticket: message.ticket,
      contact: message.ticket.contact
    });

  

  return message;
};

export default CreateMessageService;
