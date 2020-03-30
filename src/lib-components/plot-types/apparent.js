import {jdToDate} from "../utils/AstroDates"
export default function difference(plotData) {
  return {
    grid: {
      left: "7%",
      right: "5%"
    },
    title: {
      text: "Light Curve",
      left: "center",
      textStyle: {
        fontWeight: "lighter"
      }
    },
    tooltip: {
      show: true,
      trigger: "axis",
      axisPointer: {
        type: "cross",
        label: {
          backgroundColor: "#505765"
        }
      },
      formatter: formatTooltip
    },
    toolbox: {
      show: true,
      showTitle: true,
      feature: {
        dataZoom: {
          show: true,
          title: {
            zoom: "Zoom",
            back: "Back"
          },
          icon: {
            zoom:
              "M11,4A7,7 0 0,1 18,11C18,12.5 17.5,14 16.61,15.19L17.42,16H18L23,21L21,23L16,18V17.41L15.19,16.6C12.1,18.92 7.71,18.29 5.39,15.2C3.07,12.11 3.7,7.72 6.79,5.4C8,4.5 9.5,4 11,4M10,7V10H7V12H10V15H12V12H15V10H12V7H10M1,1V8L8,1H1Z",
            back:
              "M21,11H6.83L10.41,7.41L9,6L3,12L9,18L10.41,16.58L6.83,13H21V11Z"
          }
        },
        restore: {
          show: true,
          title: "Restore"
        }
        // myFeature: {
        //     show: true,
        //     title: "Help",
        //     icon:
        //         "M11,9H13V7H11M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M11,17H13V11H11V17Z",
        //     onclick: function(event) {
        //         // this.showHelp = true;
        //     }
        // }
      },
      tooltip: {
        // same as option.tooltip
        show: true,
        formatter: function (param) {
          return "<div>param</div>"; // user-defined DOM structure
        },
        backgroundColor: "#222",
        textStyle: {
          fontSize: 12
        },
        extraCssText: "box-shadow: 0 0 3px rgba(0, 0, 0, 0.3);" // user-defined CSS styles
      }
    },
    legend: {
      data: getLegend(plotData),//["g", "r", "g non-detections", "r non-detections"],
      bottom: 0
    },
    xAxis: {
      name: "Modified Julian Dates",
      nameLocation: "center",
      scale: true,
      type: "value",
      splitLine: {
        show: false
      },
      nameTextStyle: {
        padding: 7
      }
    },
    yAxis: {
      name: "Magnitude",
      nameLocation: "center",
      type: "value",
      scale: true,
      splitLine: {
        show: false
      },
      inverse: true,
      nameTextStyle: {
        padding: 25
      }
    },
    series: getSeries(plotData)
  }
};

function getSeries(data) {
  let bands = [... new Set(data.detections.map(item => item.fid))];
  let series = []
  bands.forEach(band => {
    let serie = {
      name: bandsMap[band].name,
      type: "scatter",
      scale: true,
      color: bandsMap[band].color,
      symbolSize: 6,
      encode: {
        x: 0,
        y: 1
      }
    }
    serie.data = formatDetections(data.detections, band)
    series.push(serie)
  })
  bands.forEach(band => {
    let serie = {
      name: bandsMap[band].name,
      type: "custom",
      scale: true,
      color: bandsMap[band].color,
      renderItem: renderError
    }
    series.push(serie)
  })
  return series
}

function formatDetections(detections, band) {
  return detections
    .filter(function (x) {
      return x.fid == band;
    })
    .map(function (x) {
      return [x.mjd, x.magpsf_corr, x.candid_str, x.sigmapsf_corr];
    });
}

function formatTooltip(params) {
  let colorSpan = color =>
    '<span style="display:inline-block;margin-right:5px;border-radius:10px;width:9px;height:9px;background-color:' +
    color +
    '"></span>';
  let colorSpanError = color =>
    ' <span style="display:inline-block;margin-right:5px;;margin-left:2px;border-radius:10px;width:6px;height:6px;background-color:' +
    color +
    '"></span>';
  let rowTable = (col1, col2, col3) =>
    "<tr> <td>" +
    col1 +
    "</td> <td>" +
    col2 +
    "</td> <td>" +
    col3 +
    "</td> </tr>";
  let calendarIcon = color =>
    "<i class='material-icons' style='font-size:13px;color:" +
    color +
    ";'>alarm</i>";
  let serie = params[0].seriesName;
  let table = "<table> <tr> <th></th> <th></th> <th></th></tr>";
  if (serie == "r non-detections" || serie == "g non-detections") {
    table += rowTable(
      colorSpan(params[0].color),
      params[0].seriesName + ":",
      params[0].value[1]
    );
    table += rowTable(
      calendarIcon(params[0].color),
      "MJD: ",
      params[0].value[0]
    );
    table += rowTable(
      calendarIcon(params[0].color),
      "Date: ",
      jdToDate(params[0].value[0])
        .toUTCString()
        .slice(0, -3) + "UT"
    );
    return table + "</table>";
  } else if (serie == "r" || serie == "g") {
    let mag = params[0].value[1].toFixed(3);
    let err = params[0].value[3].toFixed(3);
    table += rowTable("", "candid: ", params[0].value[2]);
    table += rowTable(
      colorSpan(params[0].color),
      params[0].seriesName + ": ",
      mag + "±" + err
    );
    table += rowTable(
      calendarIcon(params[0].color),
      "MJD: ",
      params[0].value[0]
    );
    table += rowTable(
      calendarIcon(params[0].color),
      "Date: ",
      jdToDate(params[0].value[0])
        .toUTCString()
        .slice(0, -3) + "UT"
    );
    table += rowTable("", "click to change stamp", "");
    return table + "</table>";
  }
}
function renderError(params, api) {
  var xValue = api.value(0);
  var highPoint = api.coord([xValue, api.value(1)]);
  var lowPoint = api.coord([xValue, api.value(2)]);
  var halfWidth = api.size([1, 0])[0] * 0.1;
  var style = api.style({
    stroke: api.visual("color"),
    fill: null
  });
  return {
    type: "group",
    children: [
      {
        type: "line",
        shape: {
          x1: highPoint[0] - halfWidth,
          y1: highPoint[1],
          x2: highPoint[0] + halfWidth,
          y2: highPoint[1]
        },
        style: style
      },
      {
        type: "line",
        shape: {
          x1: highPoint[0],
          y1: highPoint[1],
          x2: lowPoint[0],
          y2: lowPoint[1]
        },
        style: style
      },
      {
        type: "line",
        shape: {
          x1: lowPoint[0] - halfWidth,
          y1: lowPoint[1],
          x2: lowPoint[0] + halfWidth,
          y2: lowPoint[1]
        },
        style: style
      }
    ]
  };
}

function getLegend(data) {
  let bands = [... new Set(data.detections.map(item => item.fid))];
  let legend = bands.map(band => bandsMap[band].name)
  legend = legend.concat(bands.map(band => bandsMap[band].name + " detections"))
  return legend
}

const bandsMap = require('./band-map').default