import React, { useState, useEffect, useContext } from "react";
import { Modal, TextField, Button } from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { ForwardMessageContext } from "../../context/ForwardingMessage/ForwardingMessageContext";
import useContacts from "../../hooks/useContacts"; // <-- IMPORTAMOS O HOOK
import api from "../../services/api";
import toastError from "../../errors/toastError";

const modalStyle = {
  position: "absolute",
  top: "50%", left: "50%",
  transform: "translate(-50%, -50%)",
  background: "#fff",
  padding: "20px",
  outline: "none"
};

const ForwardMessageModal = ({ open, onClose }) => {
  const { forwardingMessage, setForwardingMessage } = useContext(ForwardMessageContext);

  // Texto que será usado como "searchParam" no hook
  const [searchParam, setSearchParam] = useState("");
  // Se quiser paginação, crie um estado para pageNumber
  const [pageNumber, setPageNumber] = useState(1);

  // AQUI USAMOS O HOOK do Whaticket:
  // Ele já faz a requisição: GET /contacts?searchParam=...&pageNumber=...
  const { contacts, loading, hasMore, count } = useContacts({
    searchParam,
    pageNumber
  });

  // Estado para armazenar o contato selecionado no Autocomplete
  const [selectedContact, setSelectedContact] = useState(null);

  // Ao abrir o modal, limpamos
  useEffect(() => {
    if (open) {
      setSearchParam("");
      setSelectedContact(null);
      setPageNumber(1); // retorna para a página 1
    }
  }, [open]);

  // Quando apertar "Encaminhar"
  const handleForward = async () => {
    if (!selectedContact) return;
    try {
      await api.post("/messagefwd/forward", {
        messageId: forwardingMessage.id,
        contactId: selectedContact.id
      });
      setForwardingMessage(null);
      onClose();
    } catch (err) {
      toastError(err);
    }
  };

  if (!open) return null;

  return (
    <Modal open={open} onClose={onClose}>
      <div style={modalStyle}>
        <h2>Encaminhar Mensagem</h2>
        <p>Mensagem: {forwardingMessage?.body}</p>

        <Autocomplete
          style={{ marginBottom: 16, width: 300 }}
          // "contacts" vem do hook useContacts
          options={contacts}
          getOptionLabel={(option) => option.name}
          value={selectedContact}
          loading={loading}
          onChange={(_event, newValue) => {
            setSelectedContact(newValue);
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Buscar contato"
              variant="outlined"
              onChange={(e) => {
                // A cada digitação, atualiza searchParam,
                // o hook useContacts faz a busca (com debounce de 500ms)
                setSearchParam(e.target.value);
                setPageNumber(1);
              }}
            />
          )}
        />

        {/* Exemplo de "Carregar mais" se quiser paginação manual */}
        {hasMore && (
          <Button
            onClick={() => setPageNumber((prev) => prev + 1)}
            variant="outlined"
            disabled={loading}
            style={{ marginBottom: 16 }}
          >
            Carregar mais
          </Button>
        )}

        <div>
          <Button
            variant="contained"
            color="primary"
            onClick={handleForward}
            disabled={!selectedContact}
          >
            Encaminhar
          </Button>
          &nbsp;
          <Button variant="outlined" onClick={onClose}>
            Cancelar
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ForwardMessageModal;
