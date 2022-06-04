import React, { useCallback, useState } from "react";
import styles from "./MetricSwitcher.module.css";
var MetricSwitcher = function (_a) {
    var isIVolunteer = _a.isIVolunteer, onSetMetric = _a.onSetMetric;
    var _b = isIVolunteer ? useState('urgency') : useState('apdex'), selectedMetric = _b[0], setMetric = _b[1];
    var metricCallback = useCallback(function (value) {
        setMetric(value);
        onSetMetric(value);
    }, [selectedMetric, onSetMetric]);
    return (React.createElement(React.Fragment, null,
        React.createElement("div", { className: "".concat(styles.metricSwitcherPanel, " ").concat(isIVolunteer ? styles.metricSwitcherPanelIVol : styles.metricSwitcherPanelDt) }, isIVolunteer ?
            React.createElement(React.Fragment, null,
                React.createElement(MetricElement, { caption: "Dringlichkeit", id: "urgency", selected: selectedMetric === 'urgency', setMetric: metricCallback, isIVolunteer: isIVolunteer }),
                React.createElement(MetricElement, { caption: "Priorit\u00E4t", id: "priority", selected: selectedMetric === 'priority', setMetric: metricCallback, isIVolunteer: isIVolunteer }),
                React.createElement(MetricElement, { caption: "Dauer", id: "duration", selected: selectedMetric === 'duration', setMetric: metricCallback, isIVolunteer: isIVolunteer }))
            :
                React.createElement(React.Fragment, null,
                    React.createElement(MetricElement, { caption: "Apdex", id: "apdex", selected: selectedMetric === 'apdex', setMetric: metricCallback, isIVolunteer: isIVolunteer }),
                    React.createElement(MetricElement, { caption: "User actions", id: "useractions", selected: selectedMetric === 'useractions', setMetric: metricCallback, isIVolunteer: isIVolunteer }),
                    React.createElement(MetricElement, { caption: "Load actions", id: "loadactions", selected: selectedMetric === 'loadactions', setMetric: metricCallback, isIVolunteer: isIVolunteer }),
                    React.createElement(MetricElement, { caption: "Xhr actions", id: "xhractions", selected: selectedMetric === 'xhractions', setMetric: metricCallback, isIVolunteer: isIVolunteer }),
                    React.createElement(MetricElement, { caption: "Custom actions", id: "customactions", selected: selectedMetric === 'customactions', setMetric: metricCallback, isIVolunteer: isIVolunteer }),
                    React.createElement(MetricElement, { caption: "Errors", id: "errors", selected: selectedMetric === 'errors', setMetric: metricCallback, isIVolunteer: isIVolunteer })))));
};
var MetricElement = function (_a) {
    var caption = _a.caption, id = _a.id, selected = _a.selected, setMetric = _a.setMetric, isIVolunteer = _a.isIVolunteer;
    return (React.createElement(React.Fragment, null,
        React.createElement("div", { className: "".concat(styles.elementPanel, "\n                             ").concat(isIVolunteer ? styles.elementPanelIVol : styles.elementPanelDt, " \n                             ").concat(selected ?
                isIVolunteer ?
                    id == 'urgency' ? styles.selectedElementIVolUrgency
                        : id == 'priority' ? styles.selectedElementIVolPriority
                            : styles.selectedElementIVolDuration
                    : styles.selectedElementDt : ''), onClick: function () { return setMetric(id); } },
            React.createElement("span", null, caption))));
};
export default MetricSwitcher;
//# sourceMappingURL=MetricSwitcher.js.map