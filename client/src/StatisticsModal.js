import React, { useEffect, useState } from "react";

const StatisticsModal = (props) => {
  const { onClose, selectedExercise, firstExercise } = props;
  const calcVolume = (weight, sets, reps) => {
    const volume = weight * sets * reps;
    return volume;
  };

  const volume1 = calcVolume(
    selectedExercise.weight,
    selectedExercise.sets,
    selectedExercise.reps_low
  );
  const [volume2] = useState(
    selectedExercise.reps_high
      ? calcVolume(
          selectedExercise.weight,
          selectedExercise.sets,
          selectedExercise.reps_high
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
          firstExercise.reps_low
        )
      : 0
  );
  const [compareVolume2] = useState(
    firstExercise && firstExercise.reps_high
      ? calcVolume(
          firstExercise.weight,
          firstExercise.sets,
          firstExercise.reps_high
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

  useEffect(() => {
    console.log(selectedExercise, firstExercise);
  });

  return (
    <div className="modal">
      <div className="modal-content">
        <div className="modal-flex">
          <div className="exercise-modal-body">
            <div className="flex">
              Working Weight: {selectedExercise.weight}
              {" lbs "}
              {workingWeightComparison > 0 ? (
                <div className="flex">
                  <p>&nbsp;(</p>
                  <p id="positive">&#8657;</p>{" "}
                  <p>
                    {Number(
                      (
                        (workingWeightComparison / firstExercise.weight) *
                        100
                      ).toFixed(1)
                    )}
                    %)
                  </p>
                </div>
              ) : workingWeightComparison < 0 ? (
                <div className="flex">
                  <p>&nbsp;(</p>
                  <p id="negative">&#8659;</p>{" "}
                  <p>
                    {Number(
                      (
                        (Math.abs(workingWeightComparison) /
                          firstExercise.weight) *
                        100
                      ).toFixed(1)
                    )}
                    %)
                  </p>
                </div>
              ) : (
                ""
              )}
            </div>
            <div className="flex">
              Volume: {volume1}
              {volume2 ? `-${volume2}` : ""}
              {" lbs "}
              {volume1Comparison > 0 && avgVolumeComparison === 0 ? (
                <div className="flex">
                  <p>&nbsp;(</p>
                  <p id="positive">&#8657;</p>{" "}
                  <p>
                    {Number(
                      ((volume1Comparison / compareVolume1) * 100).toFixed(1)
                    )}
                    %)
                  </p>
                </div>
              ) : volume1Comparison < 0 && avgVolumeComparison === 0 ? (
                <div className="flex">
                  <p>&nbsp;(</p>
                  <p id="negative">&#8659;</p>{" "}
                  <p>
                    {Number(
                      (
                        (Math.abs(volume1Comparison) / compareVolume1) *
                        100
                      ).toFixed(1)
                    )}
                    %)
                  </p>
                </div>
              ) : avgVolumeComparison > 0 ? (
                <div className="flex">
                  <p>&nbsp;(</p>
                  <p id="positive">&#8657;</p>{" "}
                  <p>
                    {Number(
                      (
                        (avgVolumeComparison /
                          ((compareVolume1 + compareVolume2) / 2)) *
                        100
                      ).toFixed(1)
                    )}
                    %)
                  </p>
                </div>
              ) : avgVolumeComparison < 0 ? (
                <div className="flex">
                  <p>&nbsp;(</p>
                  <p id="negative">&#8659;</p>{" "}
                  <p>
                    {Number(
                      (
                        (Math.abs(avgVolumeComparison) /
                          ((compareVolume1 + compareVolume2) / 2)) *
                        100
                      ).toFixed(1)
                    )}
                    %)
                  </p>
                </div>
              ) : (
                ""
              )}
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
