import removeIcon from "./img/remove-icon.png";
import styles from "./Filterbar.module.css";
import React from "react";
import { FilterType, getFilterType } from "../../utils";
var FilterElement = function (_a) {
    var filterKey = _a.filterKey, filterValue = _a.filterValue, removeFilter = _a.removeFilter, isIVolunteer = _a.isIVolunteer;
    var filterType = getFilterType(filterKey);
    return (React.createElement(React.Fragment, null,
        React.createElement("div", { className: "".concat(styles.filterElement, " ").concat(isIVolunteer ? styles.filterElementIVol : styles.filterElementDt), key: filterKey, id: filterKey },
            React.createElement("div", { className: styles.filterTextPanel },
                React.createElement("span", { className: styles.filterKey },
                    filterKey,
                    ": "),
                filterType === FilterType.TEXT
                    ? React.createElement("span", { className: styles.filterValue }, filterValue)
                    : React.createElement("span", { className: styles.filterValue }, "".concat(filterValue[0], " - ").concat(filterValue[1]))),
            React.createElement("div", { className: styles.removeFilterBtn, onClick: function () { return removeFilter([filterKey, false]); } },
                React.createElement("img", { src: removeIcon, className: styles.removeFilterBtn, alt: 'remove-filter' })))));
};
export default FilterElement;
//# sourceMappingURL=FilterElement.js.map