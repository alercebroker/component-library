<template>
  <v-card flat>
    <v-card-text class="pt-0 pb-0">
      <v-row class="py-0">
        <v-col cols="8" lg="10" class="py-0">
          <v-select
            :items="dates"
            item-value="index"
            item-text="date"
            data-test="dateSelect"
            :value="stateSelectedDetection"
            @change="onDateSelected"
          ></v-select>
        </v-col>
        <v-col class="text-center mt-lg-2" cols="4" lg="2">
          <v-icon data-test="prevIcon" @click="prevStamp"
            >mdi-arrow-left-drop-circle</v-icon
          >
          <v-icon data-test="nextIcon" @click="nextStamp"
            >mdi-arrow-right-drop-circle</v-icon
          >
        </v-col>
      </v-row>
      <v-row justify="center" class="py-0">
        <v-col cols="4" class="py-0 text-center">
          <h5>
            Science
            <v-btn
              x-small
              outlined
              class="d-none d-sm-flex"
              color="primary"
              :href="download('science')"
            >
              <v-icon left small>mdi-cloud-download</v-icon>Download
            </v-btn>
          </h5>
        </v-col>
        <v-col cols="4" class="py-0 text-center">
          <h5>
            Template
            <v-btn
              x-small
              outlined
              color="primary"
              class="d-none d-sm-flex"
              :href="download('template')"
            >
              <v-icon left small>mdi-cloud-download</v-icon>Download
            </v-btn>
          </h5>
        </v-col>
        <v-col cols="4" class="py-0 text-center">
          <h5>
            Difference
            <v-btn
              x-small
              outlined
              class="d-none d-sm-flex"
              color="primary"
              :href="download('difference')"
            >
              <v-icon left small>mdi-cloud-download</v-icon>Download
            </v-btn>
          </h5>
        </v-col>
      </v-row>
      <v-row class="pa-0">
        <v-col v-if="stampComponent === 'zoom'" class="py-0" cols="12">
          <alerce-zoom-on-hover
            :images="[science, template, difference]"
            :disabled="isFullscreen"
          ></alerce-zoom-on-hover>
        </v-col>
        <v-col v-if="stampComponent === 'crosshair'" class="py-0" cols="12">
          <alerce-crosshair
            :images="[science, template, difference]"
            :fullscreen="isFullscreen"
            :cross-hair-space="crossHairSpace"
          ></alerce-crosshair>
        </v-col>
      </v-row>
      <v-row align="start" class="pt-0" justify="center">
        <v-tooltip bottom>
          <template v-slot:activator="{ on }">
            <v-icon class="px-3" v-on="on">mdi-information</v-icon>
          </template>
          <span
            >Use the tool icons to change between zoom or crosshair modes</span
          >
        </v-tooltip>
        <v-col v-for="tool in tools" :key="tool.id" cols="1" class="pt-0 pb-1">
          <slot :name="'btn-' + tool.id" :tool="tool" :selectTool="selectTool">
            <v-icon @click="selectTool(tool.id)">{{ tool.icon }}</v-icon>
          </slot>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>
<script>
import moment from 'moment'
import {
  Vue,
  Component,
  Prop,
  Watch,
  Emit,
  Model
} from 'nuxt-property-decorator'
import { jdToDate } from '../utils/AstroDates.js'
@Component
export default class StampCard extends Vue {
  @Prop({ type: Array, default: () => [] }) detections

  @Prop({ type: String, default: '' }) object

  @Model('selectDetection', { type: Number, default: 0 }) selectedDetection

  @Prop({
    type: Array,
    default: () => [
      {
        id: 'zoom',
        text: 'Zoom',
        icon: 'mdi-magnify-plus'
      },
      {
        id: 'crosshair',
        text: 'Crosshair',
        icon: 'mdi-crosshairs'
      }
    ]
  })
  tools

  @Prop({ type: Number }) crossHairSpace

  isFullscreen = false
  stampComponent = 'crosshair'
  stateSelectedDetection = null

  created() {
    this.stateSelectedDetection = this.selectedDetection
  }

  @Emit('selectDetection')
  prevStamp() {
    if (this.stateSelectedDetection > 0) {
      /**
       * Event triggered when a detection is selected
       * @arg {number} index of the selected detection
       */
      this.stateSelectedDetection -= 1
    }
    return this.stateSelectedDetection
  }

  @Emit('selectDetection')
  nextStamp() {
    if (this.stateSelectedDetection + 1 < this.detections.length) {
      /**
       * Event triggered when a detection is selected
       * @arg {number} index of the selected detection
       */
      this.stateSelectedDetection += 1
    }
    return this.stateSelectedDetection
  }

  getCandid(index) {
    if (this.detections && this.detections.length) {
      return this.detections[index].candid
    } else {
      return ''
    }
  }

  download(type) {
    const link =
      'http://avro.alerce.online/get_stamp?oid=' +
      this.object +
      '&candid=' +
      this.getCandid(this.stateSelectedDetection) +
      '&type=' +
      type +
      '&format=fits'
    return link
  }

  fullscreen() {
    this.$emit('fullscreen')
  }

  selectTool(id) {
    this.stampComponent = id
  }

  @Emit('selectDetection')
  onDateSelected(date) {
    /**
     * Event triggered when a detection is selected
     * @arg {number} index of the selected detection
     */
    this.stateSelectedDetection = date
    return date
  }

  getScienceURL(object, candid) {
    if (!candid) {
      return 'https://via.placeholder.com/300'
    }
    return (
      'https://avro.alerce.online/get_stamp?oid=' +
      object +
      '&candid=' +
      candid +
      '&type=science&format=png'
    )
  }

  getTemplateURL(object, candid) {
    if (!candid) {
      return 'https://via.placeholder.com/300'
    }
    return (
      'https://avro.alerce.online/get_stamp?oid=' +
      object +
      '&candid=' +
      candid +
      '&type=template&format=png'
    )
  }

  getDifferenceURL(object, candid) {
    if (!candid) {
      return 'https://via.placeholder.com/300'
    }
    return (
      'https://avro.alerce.online/get_stamp?oid=' +
      object +
      '&candid=' +
      candid +
      '&type=difference&format=png'
    )
  }

  get dates() {
    if (this.detections) {
      return this.detections.map((x, i) => {
        return {
          date: moment.utc(jdToDate(x.mjd)).format('YYYY-MM-DD HH:mm:ss'),
          index: i
        }
      })
    }
    return []
  }

  get science() {
    return this.getScienceURL(
      this.object,
      this.getCandid(this.stateSelectedDetection)
    )
  }

  get difference() {
    return this.getDifferenceURL(
      this.object,
      this.getCandid(this.stateSelectedDetection)
    )
  }

  get template() {
    return this.getTemplateURL(
      this.object,
      this.getCandid(this.stateSelectedDetection)
    )
  }

  get fullscreenIcon() {
    return this.isFullscreen ? 'mdi-fullscreen-exit' : 'mdi-fullscreen'
  }

  get hasFullscreenListener() {
    return this.$listeners && this.$listeners.fullscreen
  }

  @Watch('selectedDetection')
  onSelectedDetection(newVal) {
    this.stateSelectedDetection = newVal
  }
}
</script>
