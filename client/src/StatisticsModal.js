import React, { useState } from "react";

const StatisticsModal = (props) => {
  const { onClose, selectedExercise, firstExercise } = props;
  const [volume1] = useState(
    calcVolume(
      selectedExercise.weight,
      selectedExercise.sets,
      selectedExercise.repsLow
    )
  );
  const [volume2] = useState(
    selectedExercise.repsHigh
      ? calcVolume(
          selectedExercise.weight,
          selectedExercise.sets,
          selectedExercise.repsHigh
        )
      : 0
  );
  const [avgVolume] = useState(
    volume2 ? Number(((volume1 + volume2) / 2).toFixed(1)) : 0
  );
  const [compareVolume1] = useState(
    firstExercise
      ? calcVolume(
          firstExercise.weight,
          firstExercise.sets,
          firstExercise.repsLow
        )
      : 0
  );
  const [compareVolume2] = useState(
    firstExercise && firstExercise.repsHigh
      ? calcVolume(
          firstExercise.weight,
          firstExercise.sets,
          firstExercise.repsHigh
        )
      : 0
  );
  const [workingWeightComparison] = useState(
    firstExercise ? selectedExercise.weight - firstExercise.weight : 0
  );
  const [volume1Comparison] = useState(
    firstExercise ? volume1 - compareVolume1 : 0
  );
  const [volume2Comparison] = useState(
    volume2 && compareVolume2 ? volume2 - compareVolume2 : 0
  );
  const [avgVolumeComparison] = useState(
    volume2Comparison
      ? Number(((volume1Comparison + volume2Comparison) / 2).toFixed(1))
      : 0
  );

  const calcVolume = (weight, sets, reps) => {
    const volume = weight * sets * reps;
    return volume;
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <div className="modal-flex">
          <div className="exercise-modal-body">
            <div className="flex">
              <p>
                Working Weight: {selectedExercise.weight}{" "}
                {workingWeightComparison > 0 ? (
                  <div className="flex">
                    <p id="positive">{"("}&#8657;</p>{" "}
                    <p>
                      {Number(
                        (
                          (workingWeightComparison / firstExercise.weight) *
                          100
                        ).toFixed(1)
                      )}
                      {")"}
                    </p>
                  </div>
                ) : workingWeightComparison < 0 ? (
                  <div className="flex">
                    <p id="negative">{"("}&#8659; </p>{" "}
                    <p>
                      {Number(
                        (
                          (Math.abs(workingWeightComparison) /
                            firstExercise.weight) *
                          100
                        ).toFixed(1)
                      )}
                      {")"}
                    </p>
                  </div>
                ) : (
                  ""
                )}
              </p>
            </div>
            <div className="flex">
              <p>
                Volume: {volume1}
                {volume2 ? `-${volume2}` : ""}{" "}
                {volume1Comparison > 0 && avgVolumeComparison === 0 ? (
                  <div className="flex">
                    <p id="positive">{"("}&#8657;</p>{" "}
                    <p>
                      {Number(((volume1Comparison / volume1) * 100).toFixed(1))}
                      {")"}
                    </p>
                  </div>
                ) : volume1Comparison < 0 && avgVolumeComparison === 0 ? (
                  <div className="flex">
                    <p id="negative">{"("}&#8659; </p>{" "}
                    <p>
                      {Number(
                        ((Math.abs(volume1Comparison) / volume1) * 100).toFixed(
                          1
                        )
                      )}
                      {")"}
                    </p>
                  </div>
                ) : avgVolumeComparison > 0 ? (
                  <div className="flex">
                    <p id="positive">{"("}&#8657;</p>{" "}
                    <p>
                      {Number(
                        ((avgVolumeComparison / avgVolume) * 100).toFixed(1)
                      )}
                      {")"}
                    </p>
                  </div>
                ) : avgVolumeComparison < 0 ? (
                  <div className="flex">
                    <p id="negative">{"("}&#8659; </p>{" "}
                    <p>
                      {Number(
                        (
                          (Math.abs(avgVolumeComparison) / avgVolume) *
                          100
                        ).toFixed(1)
                      )}
                      {")"}
                    </p>
                  </div>
                ) : (
                  ""
                )}
              </p>
            </div>
            <div>
              <span className="modal-button-container">
                <button className="modal-button" onClick={onClose}>
                  Close
                </button>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatisticsModal;
