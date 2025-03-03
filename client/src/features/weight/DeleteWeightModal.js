import React, { useEffect } from "react";
import Axios from "axios";
import Modal from "../../components/Modal";

const DeleteWeightModal = (props) => {
  const { onClose, formatDate, selectedWeight, setWeightData, apiURL } = props;

  const deleteWeight = (id) => {
    Axios.delete(`${apiURL}/delete/weight/${id}`)
      .then(() => {
        setWeightData((prevWeightData) =>
          prevWeightData.filter((weight) => weight.id !== id)
        );
        onClose();
      })
      .catch((error) => {
        console.error("Error deleting weight:", error);
      });
  };

  return (
    <Modal
      isOpen={true}
      hasHeader={false}
      onClose={onClose}
      onConfirm={() => deleteWeight(selectedWeight.id)}
      isLarge={false}
    >
      <p>
        Are you sure you want to delete {selectedWeight.weight} from{" "}
        {formatDate(selectedWeight.date)}?
      </p>
    </Modal>
  );
};

export default DeleteWeightModal;
