import React, { useState, useEffect } from "react";
import RoutineFormModal from "./RoutineFormModal";
import WeightFormModal from "./WeightFormModal";
import { useNavigate } from "react-router-dom";
import Axios from "axios";
import DeleteRoutineModal from "./DeleteRoutineModal";

const Dashboard = (props) => {
  const {
    loginStatus,
    userProfile,
    previousWeight,
    setPreviousWeight,
    formattedDate,
    routines,
    setRoutines,
  } = props;
  const [showRoutineModal, setShowRoutineModal] = useState(false);
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [showDeleteRoutineModal, setShowDeleteRoutineModal] = useState(false);
  const [selectedRoutine, setSelectedRoutine] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (loginStatus === false) {
      localStorage.clear();
      navigate("/login");
    }
  }, [loginStatus, navigate]);

  //   const deleteRoutine = (id) => {
  //     Axios.delete(`http://localhost:3001/api/delete/routine/${id}`)
  //       .then((response) => {
  //         const updatedRoutines = routines.filter((routine) => routine.id !== id);
  //         setRoutines(updatedRoutines);
  //       })
  //       .catch((error) => {
  //         console.error("Error deleting routine:", error);
  //       });
  //   };

  const openWeightModal = () => {
    setShowWeightModal(true);
  };

  const closeWeightModal = () => {
    setShowWeightModal(false);
  };

  const cancelWeightModal = () => {
    setShowWeightModal(false);
    const data = JSON.parse(localStorage.getItem("weightFormData"));
    data.weight = JSON.parse(
      localStorage.getItem("previousWeight")
    ).previousWeight.weight;
    localStorage.setItem("weightFormData", JSON.stringify(data));
  };

  const openRoutineModal = () => {
    setShowRoutineModal(true);
  };

  const closeRoutineModal = () => {
    setShowRoutineModal(false);
  };

  const openDeleteRoutineModal = () => {
    setShowDeleteRoutineModal(true);
  };

  const closeDeleteRoutineModal = () => {
    setShowDeleteRoutineModal(false);
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
          <div className="routine-card">
            {routines.map((val) => {
              return (
                <div key={val.id} className="dashboard flex">
                  <h3 key={val.name}>{val.name}</h3>
                  <h5 key={`caret-${val.id}`} className="caret">
                    &or;
                  </h5>
                  <div key={`buttons-${val.id}`} className="flex">
                    <button key={`edit-${val.id}`}>Edit</button>
                    <button
                      key={`delete-${val.id}`}
                      onClick={() => {
                        setSelectedRoutine(val);
                        openDeleteRoutineModal();
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {showWeightModal && (
        <WeightFormModal
          loginStatus={loginStatus}
          userProfile={userProfile}
          onClose={closeWeightModal}
          onCancel={cancelWeightModal}
          previousWeight={previousWeight}
          setPreviousWeight={setPreviousWeight}
          formattedDate={formattedDate}
        />
      )}

      {showRoutineModal && (
        <RoutineFormModal
          loginStatus={loginStatus}
          onClose={closeRoutineModal}
          routines={routines}
          setRoutines={setRoutines}
        />
      )}

      {showDeleteRoutineModal && (
        <DeleteRoutineModal
          onClose={() => {
            setSelectedRoutine(null);
            closeDeleteRoutineModal();
          }}
          setRoutines={setRoutines}
          routines={routines}
          selectedRoutine={selectedRoutine}
        />
      )}
    </div>
  );
};

export default Dashboard;
