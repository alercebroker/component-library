<template>
  <v-container class="py-0">
    <v-layout row wrap>
      <v-flex xs12>
        <v-data-table
          :headers="header"
          :items="values"
          :items-per-page="values.length"
          :mobile-breakpoint="250"
          dense
          disable-sort
          hide-default-footer
          hide-default-header
        >
          <template v-slot:[`item.tooltip`]="{ item }">
            <span v-if="item.tooltip">
              <v-tooltip right max-width="200">
                <template v-slot:activator="{ on, attrs }">
                  <v-icon align="center" v-bind="attrs" v-on="on">
                    mdi-help-circle
                  </v-icon>
                </template>
                <span>{{ item.tooltip }}</span>
              </v-tooltip>
            </span>
          </template>
        </v-data-table>
      </v-flex>
      <v-flex xs6>
        <v-btn
          small
          outlined
          block
          color="primary"
          @click="changeMjdButtonText"
        >
          {{ mjdButtonText }}
        </v-btn>
      </v-flex>
      <v-flex xs6>
        <v-btn
          small
          outlined
          block
          color="primary"
          @click="changeHmsButtonText"
        >
          {{ hmsButtonText }}
        </v-btn>
      </v-flex>
    </v-layout>
  </v-container>
</template>
<script>
import { Vue, Component, Prop } from 'nuxt-property-decorator'
import { jdToDate, raDectoHMS } from '../utils/AstroDates.js'
@Component({})
export default class BasicInformation extends Vue {
  @Prop({ type: Object, default: () => {} })
  information

  header = [
    { text: '', value: 'column', align: 'start', width: '35%' },
    { text: '', value: 'value', align: 'center', width: '60%' },
    { text: '', value: 'tooltip', align: 'end', width: '5%' },
  ]

  whatShow = [
    'Object',
    'RA(J2000) Dec(J2000)',
    'Number',
    'Detections',
    'Discovery date',
    'Last detection',
    'Corrected',
    'Stellar',
  ]

  mjdButtonText = 'View date'
  hmsButtonText = 'View H:M:S'

  changeMjdButtonText() {
    if (this.mjdButtonText === 'View date') {
      this.mjdButtonText = 'View MJD'
      this.values = this.values.map((x) => {
        x.value = x.date ? x.date : x.value
        return x
      })
    } else {
      this.mjdButtonText = 'View date'
      this.values = this.values.map((x) => {
        x.value = x.mjd ? x.mjd : x.value
        return x
      })
    }
  }

  changeHmsButtonText() {
    if (this.hmsButtonText === 'View H:M:S') {
      this.hmsButtonText = 'View Degrees'
      this.values = this.values.map((x) => {
        x.value = x.hms ? x.hms : x.value
        return x
      })
    } else {
      this.hmsButtonText = 'View H:M:S'
      this.values = this.values.map((x) => {
        x.value = x.radec ? x.radec : x.value
        return x
      })
    }
  }

  formatDate(val) {
    return jdToDate(val).toString().split('GMT')[0]
  }

  infoMapper(key, value) {
    const res = {}
    switch (key) {
      case 'oid':
        res.column = 'Object'
        res.value = value
        break
      case 'ndethist':
        res.column = 'Spatially-coincident detections'
        res.value = value
        break
      case 'ncovhist':
        res.column = 'Ncovhist'
        res.value = value
        break
      case 'ndet':
        res.column = 'Detections'
        res.value = value
        break
      case 'firstmjd':
        res.column = 'Discovery date'
        res.value = value
        res.mjd = value
        res.date = this.formatDate(value)
        break
      case 'lastmjd':
        res.column = 'Last detection'
        res.value = value
        res.mjd = value
        res.date = this.formatDate(value)
        break
      case 'corrected':
        res.column = 'Corrected'
        res.value = value ? 'yes' : 'no'
        res.tooltip =
          'There is a matching source in the reference image. The apparent magnitude combines the difference and reference fluxes.'
        break
      case 'stellar':
        res.column = 'Stellar'
        res.value = value ? 'yes' : 'no'
        res.tooltip =
          'There is a matching point-like source in the reference image.'
        break
      case 'raDec':
        res.column = 'RA(J2000) Dec(J2000)'
        res.value = `${value.ra} ${value.dec}`
        res.radec = `${value.ra} ${value.dec}`
        res.hms = raDectoHMS(value.ra, value.dec)
        break
      default:
        res.column = key
        res.value = value
    }
    return res
  }

  get values() {
    const aux = this.information
    aux.raDec = { ra: this.information.meanra, dec: this.information.meandec }
    const keys = Object.keys(this.information)
    const toDisplay = keys.map((k) => {
      return this.infoMapper(k, this.information[k])
    })
    return toDisplay.filter((x) => this.whatShow.includes(x.column))
  }
}
</script>
