import React, { createContext, useState } from "react";

export const ForwardMessageContext = createContext();

export const ForwardMessageProvider = ({ children }) => {
  // Armazena a mensagem selecionada para encaminhar
  const [forwardingMessage, setForwardingMessage] = useState(null);

  return (
    <ForwardMessageContext.Provider value={{ forwardingMessage, setForwardingMessage }}>
      {children}
    </ForwardMessageContext.Provider>
  );
};
