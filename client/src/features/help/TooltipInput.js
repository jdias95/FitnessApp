import React from "react";

const TooltipInput = ({
  id,
  label,
  tooltip,
  showInfo,
  setShowInfo,
  inputProps,
  children,
}) => (
  <div className="flex shift-left">
    <img
      className="tooltip-png2"
      src={process.env.PUBLIC_URL + "/tooltip.png"}
      onMouseOver={() => setShowInfo(id)}
      onMouseOut={() => setShowInfo("")}
      alt="tooltip"
    />
    {showInfo === id && (
      <div className="tooltip tooltip-exercise" id={id}>
        <p>{tooltip}</p>
      </div>
    )}
    <label className="flex-input">{label}:&nbsp;</label>
    {children ? children : <input {...inputProps} />}
  </div>
);

export default TooltipInput;
