import JSZip from 'jszip'
import FileSaver from 'file-saver'

function dateToString(date) {
  date = date.toISOString()
  date = date.replace(/[-:]/g, (c) => '')
  // date = date.replace('T', '_')
  date = date.split('T')[0]
  return date
}

function jsonToCsv(arrayOfJson) {
  const replacer = (key, value) => (value === null ? '' : value)
  const header = Object.keys(arrayOfJson[0])
  let csv = arrayOfJson.map((row) =>
    header
      .map((fieldName) => JSON.stringify(row[fieldName], replacer))
      .join(',')
  )
  csv.unshift(header.join(','))
  csv = csv.join('\r\n')
  return csv
}

/* based in https://stackoverflow.com/questions/8847766/how-to-convert-json-to-csv-format-and-store-in-a-variable */
function download(oid, detections, nonDetections) {
  const today = dateToString(new Date())
  const filename = `${oid}_${today}.zip`
  const zip = new JSZip()
  zip.file('detections.csv', jsonToCsv(detections))
  zip.file('non_detections.csv', jsonToCsv(nonDetections))
  zip.generateAsync({ type: 'blob' }).then((content) => {
    FileSaver.saveAs(content, filename)
  })
}

export { download }
