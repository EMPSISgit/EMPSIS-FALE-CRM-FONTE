import React, { useState, useContext } from "react";

import MenuItem from "@material-ui/core/MenuItem";

import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import ConfirmationModal from "../ConfirmationModal";
import { Menu } from "@material-ui/core";
import { ReplyMessageContext } from "../../context/ReplyingMessage/ReplyingMessageContext";
import { ForwardMessageContext } from "../../context/ForwardingMessage/ForwardingMessageContext";
import toastError from "../../errors/toastError";



const MessageOptionsMenu = ({ message, menuOpen, handleClose, anchorEl }) => {
	const { setReplyingMessage } = useContext(ReplyMessageContext);
	const { setForwardingMessage } = useContext(ForwardMessageContext);
	const [confirmationOpen, setConfirmationOpen] = useState(false);

	const handleDeleteMessage = async () => {
		try {
			await api.delete(`/messages/${message.id}`);
		} catch (err) {
			toastError(err);
		}
	};

	const hanldeReplyMessage = () => {
		setReplyingMessage(message);
		handleClose();
	};

    const hanldeForwardMessage = () => {
		setForwardingMessage(message);
		handleClose();
	};

	const handleOpenConfirmationModal = e => {
		setConfirmationOpen(true);
		handleClose();
	};

	return (
		<>
			<ConfirmationModal
				title={i18n.t("messageOptionsMenu.confirmationModal.title")}
				open={confirmationOpen}
				onClose={setConfirmationOpen}
				onConfirm={handleDeleteMessage}
			>
				{i18n.t("messageOptionsMenu.confirmationModal.message")}
			</ConfirmationModal>
			<Menu
				anchorEl={anchorEl}
				getContentAnchorEl={null}
				anchorOrigin={{
					vertical: "bottom",
					horizontal: "right",
				}}
				transformOrigin={{
					vertical: "top",
					horizontal: "right",
				}}
				open={menuOpen}
				onClose={handleClose}
			>
				{message.fromMe && (
					<MenuItem onClick={handleOpenConfirmationModal}>
						{i18n.t("messageOptionsMenu.delete")}
					</MenuItem>
				)}
                <MenuItem onClick={hanldeForwardMessage}>
					{i18n.t("messageOptionsMenu.forward")}
				</MenuItem>
				<MenuItem onClick={hanldeReplyMessage}>
					{i18n.t("messageOptionsMenu.reply")}
				</MenuItem>
			</Menu>
		</>
	);
};

export default MessageOptionsMenu;
