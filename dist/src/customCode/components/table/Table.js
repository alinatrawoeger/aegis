var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import React, { useEffect, useState } from "react";
import styles from "./Table.module.css";
import analyzeIcon from "./img/analyze.svg";
import arrowLeft from "./img/arrow_left.png";
import arrowLeftInactive from "./img/arrow_left_disabled.png";
import arrowRight from "./img/arrow_right.png";
import arrowRightInactive from "./img/arrow_right_disabled.png";
var rowsPerPage;
var columnHeaderNamesMap = new Map([
    ['apdex', 'Apdex'],
    ['useractions', 'User Actions'],
    ['loadactions', 'Load Actions'],
    ['xhractions', 'XHR Actions'],
    ['customactions', 'Custom Actions'],
    ['errors', 'Errors'],
]);
var Table = function (_a) {
    var data = _a.data, selectedMetric = _a.selectedMetric, isIVolunteer = _a.isIVolunteer;
    rowsPerPage = isIVolunteer ? 4 : 5;
    var _b = useState(1), page = _b[0], setPage = _b[1];
    var _c = useTable(__spreadArray([], data, true), page), dataOnPage = _c.dataOnPage, tableRange = _c.tableRange;
    return (React.createElement(React.Fragment, null, data.length > 0
        ? React.createElement("div", null,
            React.createElement(TableContent, { dataOnPage: dataOnPage, selectedMetric: selectedMetric, isIVolunteer: isIVolunteer }),
            React.createElement(TablePagination, { pageRange: tableRange, dataOnPage: dataOnPage, setPage: setPage, page: page }))
        : React.createElement("div", { className: styles.noData },
            React.createElement("span", null, "No data available for this filter"))));
};
var TableContent = function (_a) {
    var dataOnPage = _a.dataOnPage, selectedMetric = _a.selectedMetric, isIVolunteer = _a.isIVolunteer;
    var columnHeaders;
    if (isIVolunteer) {
        columnHeaders = ['Task Name', 'Task ID'];
    }
    else {
        if (selectedMetric === 'apdex') {
            columnHeaders = ['Location', columnHeaderNamesMap.get(selectedMetric), 'User actions'];
        }
        else if (selectedMetric === 'errors') {
            columnHeaders = ['Location', columnHeaderNamesMap.get(selectedMetric), 'Affected actions'];
        }
        else {
            columnHeaders = ['Location', columnHeaderNamesMap.get(selectedMetric), 'Total user actions'];
        }
    }
    return (React.createElement(React.Fragment, null,
        React.createElement("table", { className: "".concat(styles.table, " ").concat(isIVolunteer ? styles.tableIvol : styles.tableDt) },
            React.createElement("thead", null,
                React.createElement("tr", { className: styles.tableRowHeader },
                    columnHeaders.map(function (header) { return (React.createElement("th", { key: header, className: styles.tableHeader }, header)); }),
                    React.createElement("th", { className: styles.tableHeader }, "Details"))),
            React.createElement("tbody", null, dataOnPage.map(function (dataRow) { return (React.createElement("tr", { className: styles.tableRowItems, key: isIVolunteer ? dataRow.taskid : dataRow.location },
                React.createElement("td", { className: "".concat(styles.tableCell, " ").concat(styles.tableLink) }, isIVolunteer ? dataRow.taskname : dataRow.location),
                !isIVolunteer
                    ? selectedMetric === 'useractions'
                        ? React.createElement("td", { className: styles.tableCell },
                            dataRow[selectedMetric],
                            " / min")
                        : selectedMetric === 'errors'
                            ? React.createElement("td", { className: styles.tableCell },
                                dataRow[selectedMetric],
                                " / min")
                            : React.createElement("td", { className: styles.tableCell }, dataRow[selectedMetric])
                    : React.createElement("td", { className: styles.tableCell }, dataRow.taskid),
                !isIVolunteer
                    ? selectedMetric === 'apdex'
                        ? React.createElement("td", { className: styles.tableCell },
                            dataRow['useractions'],
                            " / min")
                        : selectedMetric === 'errors'
                            ? React.createElement("td", { className: styles.tableCell },
                                dataRow['affecteduseractions'],
                                " %")
                            : React.createElement("td", { className: styles.tableCell }, dataRow['totaluseractions'])
                    : '',
                React.createElement("td", { className: "".concat(styles.tableCell, " ").concat(styles.tableLastCol) },
                    React.createElement("a", { href: "#" },
                        React.createElement("img", { src: analyzeIcon, className: styles.analyzeBtn }))))); })))));
};
var TablePagination = function (_a) {
    var pageRange = _a.pageRange, setPage = _a.setPage, page = _a.page, dataOnPage = _a.dataOnPage;
    useEffect(function () {
        if (dataOnPage.length < 1 && page !== 1) {
            setPage(page - 1);
        }
    }, [dataOnPage, page, setPage]);
    return (React.createElement("div", { className: styles.tableFooter },
        React.createElement("button", { key: 'prev', className: "".concat(styles.button, " ").concat(styles.arrowBtn, " ").concat(styles.arrowPrevBtn, " ").concat(page === 1 ? styles.disabledButton : ''), onClick: function () { return page > 1 ? setPage(page - 1) : setPage(page); } },
            React.createElement("img", { src: "".concat(page === 1 ? arrowLeftInactive : arrowLeft), height: "16px" })),
        pageRange.map(function (el, index) { return (React.createElement("button", { key: index, className: "".concat(styles.button, " ").concat(page === el ? styles.activeButton : styles.inactiveButton), onClick: function () { return setPage(el); } }, el)); }),
        React.createElement("button", { key: 'next', className: "".concat(styles.button, " ").concat(styles.arrowBtn, " ").concat(styles.arrowNextBtn, " ").concat(page === pageRange[pageRange.length - 1] ? styles.disabledButton : ''), onClick: function () { return page < pageRange[pageRange.length - 1] ? setPage(page + 1) : setPage(page); } },
            React.createElement("img", { src: "".concat(page === pageRange[pageRange.length - 1] ? arrowRightInactive : arrowRight), height: "16px" }))));
};
// -- calculations & functions
var useTable = function (data, page) {
    var _a = useState([]), tableRange = _a[0], setTableRange = _a[1];
    var _b = useState([]), dataOnPage = _b[0], setDataOnPage = _b[1];
    useEffect(function () {
        var range = calculatePageRange(data, page);
        setTableRange(__spreadArray([], range, true));
        var dataOnPage = data.slice((page - 1) * rowsPerPage, page * rowsPerPage);
        setDataOnPage(__spreadArray([], dataOnPage, true));
    }, [data, setTableRange, page, setDataOnPage]);
    return { dataOnPage: dataOnPage, tableRange: tableRange };
};
var calculatePageRange = function (data, page) {
    var pageRange = [];
    var num = Math.ceil(data.length / rowsPerPage);
    var i = 1;
    if (num <= 3) { // show all numbers in pagination
        for (var i_1 = 1; i_1 <= num; i_1++) {
            pageRange.push(i_1);
        }
    }
    else { // show ellipsis between outermost page numbers
        pageRange.push(1);
        if (page > 2) {
            pageRange.push('...');
        }
        if (page != 1) {
            pageRange.push(page);
        }
        if (page < num - 1) {
            pageRange.push('...');
        }
        if (page != num) {
            pageRange.push(num);
        }
    }
    return pageRange;
};
export default Table;
//# sourceMappingURL=Table.js.map