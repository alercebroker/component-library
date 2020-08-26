<template>
  <div>
    <v-chart :options="chartOptions.options" autoresize @click="onClick" />
  </div>
</template>

<script>
import { Vue, Component, Prop, Watch, Emit } from 'nuxt-property-decorator'
// import Echarts from 'vue-echarts'
import { jdToDate } from '../utils/AstroDates.js'
import { DifferenceLightCurveOptions } from './plot-types/difference'
import { ApparentLightCurveOptions } from './plot-types/apparent'
import { FoldedLightCurveOptions } from './plot-types/folded'
import { LightCurveOptions } from './plot-types/utils/light-curve-utils'

@Component
export default class LightCurvePlot extends Vue {
  @Prop({ type: Array, default: () => [] }) detections
  @Prop({ type: Array, default: () => [] }) nonDetections
  @Prop({ type: Number, default: 0 }) period
  @Prop({ type: String }) type
  @Prop({ type: Boolean, default: false }) dark

  showHelp = false
  chartOptions = new LightCurveOptions()

  mounted() {
    this.generateOptions(
      this.type,
      this.detections,
      this.nonDetections,
      this.period,
      this.fontColor
    )
  }

  @Emit('detectionClick')
  onClick(detection) {
    const date =
      jdToDate(detection.value[0])
        .toUTCString()
        .slice(0, -3) + 'UT'
    return {
      mjd: detection.value[0],
      date,
      index: this.detections.findIndex(x => x.mjd === detection.value[0])
    }
  }

  generateOptions(type, detections, nonDetections, period) {
    if (type === 'difference') {
      const differenceLightCurveOptions = new DifferenceLightCurveOptions(
        detections,
        nonDetections,
        this.fontColor
      )
      this.chartOptions = differenceLightCurveOptions
    }
    if (type === 'apparent') {
      const apparentLightCurveOptions = new ApparentLightCurveOptions(
        detections,
        nonDetections,
        this.fontColor
      )
      this.chartOptions = apparentLightCurveOptions
    }
    if (type === 'folded') {
      const foldedLightCurveOptions = new FoldedLightCurveOptions(
        detections,
        nonDetections,
        this.fontColor,
        period
      )
      this.chartOptions = foldedLightCurveOptions
    }
  }

  get fontColor() {
    return this.dark ? '#fff' : '#000'
  }

  @Watch('type')
  onTypeChange(newType) {
    this.generateOptions(
      newType,
      this.detections,
      this.nonDetections,
      this.period
    )
  }

  @Watch('detections')
  onDetectionsChange(newDetections) {
    this.generateOptions(
      this.type,
      newDetections,
      this.nonDetections,
      this.period
    )
  }

  @Watch('nonDetections')
  onNonDetectionsChange(newNonDetections) {
    this.generateOptions(
      this.type,
      this.detections,
      newNonDetections,
      this.period
    )
  }

  @Watch('dark')
  onDark(newDark) {
    this.swapFieldValueInJSON(this.chartOptions, 'textStyle', this.fontColor)
  }

  swapFieldValueInJSON(json, field, value) {
    function f(obj) {
      if (!obj || typeof obj !== 'object') {
        return
      }
      if (field in obj) {
        obj[field].color = value
      }
      Object.keys(obj).forEach(k => f(obj[k]))
    }
    f(json)
    return field
  }
}
</script>

<style css>
.echarts {
  margin: auto;
  width: 100%;
  height: 100%;
  min-height: 350px;
}
</style>
