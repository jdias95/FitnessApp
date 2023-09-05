import React, { useState, useEffect } from "react";
import RoutineFormModal from "./RoutineFormModal";
import WeightFormModal from "./WeightFormModal";
import { useNavigate } from "react-router-dom";
import Axios from "axios";

const Dashboard = (props) => {
  const [showRoutineModal, setShowRoutineModal] = useState(false);
  const [showWeightModal, setShowWeightModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem("authToken")) {
      navigate("/login");
    }
    return () => {
      localStorage.removeItem("weightFormData");
    };
  });

  const openWeightModal = () => {
    setShowWeightModal(true);
  };

  const closeWeightModal = () => {
    setShowWeightModal(false);
  };

  const openRoutineModal = () => {
    setShowRoutineModal(true);
  };

  const closeRoutineModal = () => {
    setShowRoutineModal(false);
  };

  return (
    <div className="App">
      <div className="flex">
        <div className="weight container">
          <div className="dashboard flex">
            <h2>Weight</h2>
            <h1 id="plus" onClick={openWeightModal}>
              +
            </h1>
          </div>
        </div>
        <div className="routine container">
          <div className="dashboard flex">
            <h2>Exercise Routines</h2>
            <h2 id="plus" onClick={openRoutineModal}>
              +
            </h2>
          </div>
        </div>
      </div>

      {showWeightModal && (
        <WeightFormModal
          loginStatus={props.loginStatus}
          userProfile={props.userProfile}
          onClose={closeWeightModal}
        />
      )}

      {showRoutineModal && (
        <RoutineFormModal
          loginStatus={props.loginStatus}
          onClose={closeRoutineModal}
        />
      )}
    </div>
  );
};

export default Dashboard;
