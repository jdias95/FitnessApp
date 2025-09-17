import React from "react";
import TooltipInput from "../help/TooltipInput";

const ExerciseFormFields = ({
  userProfile,
  nameReg,
  setNameReg,
  setsLowReg,
  setsHighReg,
  setSetsLowReg,
  setSetsHighReg,
  repsLowReg,
  setRepsLowReg,
  repsHighReg,
  setRepsHighReg,
  weightReg,
  setWeightReg,
  notesReg,
  setNotesReg,
  trackReg,
  setTrackReg,
  bwReg,
  setBwReg,
  showInfo,
  setShowInfo,
  convertWeight,
  defaultConvertWeight,
  safeParseInt,
  safeParseFloat,
}) => (
  <>
    <div>
      <label>Name:&nbsp;</label>
      <input
        type="text"
        id="name"
        placeholder="Ex: Bench Press"
        maxLength="45"
        value={nameReg}
        onChange={(e) => setNameReg(e.target.value)}
        onFocus={(e) => e.target.select()}
      />
    </div>
    <TooltipInput
      id="sets"
      label="Set Range:"
      tooltip="A set refers to a group of repetitions (or reps) of an exercise. The second input field can be left blank if you prefer."
      showInfo={showInfo}
      setShowInfo={setShowInfo}
    >
      <input
        type="number"
        id="narrow"
        placeholder="1"
        min="1"
        max="99"
        maxLength="2"
        value={!setsLowReg ? "" : setsLowReg}
        onChange={(e) => setSetsLowReg(safeParseInt(e.target.value))}
        onFocus={(e) => e.target.select()}
      />
      <p>&nbsp;-&nbsp;</p>
      <input
        type="number"
        id="narrow"
        min="0"
        max="99"
        maxLength="2"
        value={!setsHighReg ? "" : setsHighReg}
        onChange={(e) => setSetsHighReg(safeParseInt(e.target.value))}
        onFocus={(e) => e.target.select()}
      />
    </TooltipInput>
    <TooltipInput
      id="reps"
      label="Reps:"
      tooltip="A rep refers to a repetition of an exercise. The second input field can be left blank if you prefer."
      showInfo={showInfo}
      setShowInfo={setShowInfo}
    >
      <input
        type="number"
        id="narrow"
        placeholder="1"
        min="1"
        max="99"
        maxLength="2"
        value={!repsLowReg ? "" : repsLowReg}
        onChange={(e) => setRepsLowReg(safeParseInt(e.target.value))}
        onFocus={(e) => e.target.select()}
      />
      <p>&nbsp;-&nbsp;</p>
      <input
        type="number"
        id="narrow"
        min="0"
        max="99"
        maxLength="2"
        value={!repsHighReg ? "" : repsHighReg}
        onChange={(e) => setRepsHighReg(safeParseInt(e.target.value))}
        onFocus={(e) => e.target.select()}
      />
    </TooltipInput>
    <TooltipInput
      id="weight"
      label="Weight:"
      tooltip="Weight refers to how much weight is added to an exercise. If there is no weight added (eg. Push Ups), then this can be left blank."
      showInfo={showInfo}
      setShowInfo={setShowInfo}
    >
      {userProfile.measurement_type !== "metric" ? (
        <>
          <input
            type="number"
            id="wide"
            placeholder="0"
            step="0.1"
            min="0"
            max="1500"
            maxLength="4"
            value={!weightReg ? "" : weightReg}
            onChange={(e) => setWeightReg(safeParseFloat(e.target.value))}
            onFocus={(e) => e.target.select()}
          />
          <label>&nbsp;lbs</label>
        </>
      ) : (
        <>
          <input
            type="number"
            id="wide"
            step="0.1"
            placeholder="0"
            min="0"
            max="750"
            maxLength="3"
            value={!weightReg ? "" : defaultConvertWeight(weightReg)}
            onChange={(e) =>
              setWeightReg(convertWeight(safeParseFloat(e.target.value)))
            }
            onFocus={(e) => e.target.select()}
          />
          <label>&nbsp;kgs</label>
        </>
      )}
    </TooltipInput>
    <div className="flex">
      <label id="notes" className="flex-input">
        Notes:&nbsp;
      </label>
      <textarea
        rows="4"
        cols="30"
        maxLength="300"
        value={notesReg}
        onChange={(e) => setNotesReg(e.target.value)}
        onFocus={(e) => e.target.select()}
      />
    </div>
    <TooltipInput
      id="track"
      label="Track Progress?:"
      tooltip="Selecting this will default Track Progress to be enabled for this exercise when creating a workout log entry using this routine."
      showInfo={showInfo}
      setShowInfo={setShowInfo}
    >
      <input
        type="checkbox"
        id="checkbox"
        checked={trackReg}
        onChange={() => setTrackReg(!trackReg)}
        onFocus={(e) => e.target.select()}
      />
    </TooltipInput>
    <TooltipInput
      id="bw"
      label="Bodyweight Comparison?:"
      tooltip="Selecting this will default Bodyweight Comparison to be enabled for this exercise when creating a workout log entry using this routine."
      showInfo={showInfo}
      setShowInfo={setShowInfo}
    >
      <input
        type="checkbox"
        id="checkbox"
        checked={bwReg}
        disabled={!trackReg}
        onChange={() => setBwReg(!bwReg)}
        onFocus={(e) => e.target.select()}
      />
    </TooltipInput>
  </>
);

export default ExerciseFormFields;
