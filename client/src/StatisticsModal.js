import React from "react";

const StatisticsModal = (props) => {
  const {
    onClose,
    selectedExercise,
    firstExercise,
    userProfile,
    defaultConvertWeight,
  } = props;

  const calcVolume = (weight, sets, reps) => {
    const volume = weight * sets * reps;
    return volume;
  };

  const workingWeightDifference = firstExercise
    ? selectedExercise.weight - firstExercise.weight
    : 0;

  const volume = selectedExercise.reps_high
    ? Number(
        (
          (calcVolume(
            selectedExercise.weight,
            selectedExercise.sets,
            selectedExercise.reps_low
          ) +
            calcVolume(
              selectedExercise.weight,
              selectedExercise.sets,
              selectedExercise.reps_high
            )) /
          2
        ).toFixed(1)
      )
    : calcVolume(
        selectedExercise.weight,
        selectedExercise.sets,
        selectedExercise.reps_low
      );

  const firstVolume =
    firstExercise && firstExercise.reps_high
      ? Number(
          (
            (calcVolume(
              firstExercise.weight,
              firstExercise.sets,
              firstExercise.reps_low
            ) +
              calcVolume(
                firstExercise.weight,
                firstExercise.sets,
                firstExercise.reps_high
              )) /
            2
          ).toFixed(1)
        )
      : firstExercise
      ? calcVolume(
          firstExercise.weight,
          firstExercise.sets,
          firstExercise.reps_low
        )
      : 0;

  const volumeDifference = volume - firstVolume;

  return (
    <div className="modal">
      <div className="modal-content">
        <div className="modal-flex">
          <div className="exercise-modal-body">
            <div className="flex">
              <p>Working Weight:&nbsp;</p>
              {userProfile.measurement_type !== "metric" ? (
                <p>{selectedExercise.weight} lbs</p>
              ) : (
                <p>{defaultConvertWeight(selectedExercise.weight)} kgs</p>
              )}
              {workingWeightDifference > 0 ? (
                <div className="flex">
                  <p>&nbsp;(</p>
                  <p id="positive">&#8657;</p>
                  <p>
                    {Number(
                      (
                        (workingWeightDifference / firstExercise.weight) *
                        100
                      ).toFixed(1)
                    )}
                    %)
                  </p>
                </div>
              ) : workingWeightDifference < 0 ? (
                <div className="flex">
                  <p>&nbsp;(</p>
                  <p id="negative">&#8659;</p>
                  <p>
                    {Number(
                      (
                        (Math.abs(workingWeightDifference) /
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
              <p>Volume:&nbsp;</p>
              {userProfile.measurement_type !== "metric" ? (
                <p>
                  {calcVolume(
                    selectedExercise.weight,
                    selectedExercise.sets,
                    selectedExercise.reps_low
                  )}
                  {selectedExercise.reps_high
                    ? `-${calcVolume(
                        selectedExercise.weight,
                        selectedExercise.sets,
                        selectedExercise.reps_high
                      )}`
                    : ""}
                  {" lbs "}
                </p>
              ) : (
                <p>
                  {defaultConvertWeight(
                    calcVolume(
                      selectedExercise.weight,
                      selectedExercise.sets,
                      selectedExercise.reps_low
                    )
                  )}
                  {selectedExercise.reps_high
                    ? `-${defaultConvertWeight(
                        calcVolume(
                          selectedExercise.weight,
                          selectedExercise.sets,
                          selectedExercise.reps_high
                        )
                      )}`
                    : ""}
                  {" kgs "}
                </p>
              )}
              {volumeDifference > 0 && firstVolume ? (
                <div className="flex">
                  <p>&nbsp;(</p>
                  <p id="positive">&#8657;</p>
                  <p>
                    {Number(
                      ((volumeDifference / firstVolume) * 100).toFixed(1)
                    )}
                    %)
                  </p>
                </div>
              ) : volumeDifference < 0 && firstVolume ? (
                <div className="flex">
                  <p>&nbsp;(</p>
                  <p id="negative">&#8659;</p>
                  <p>
                    {Number(
                      (
                        (Math.abs(volumeDifference) / firstVolume) *
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
